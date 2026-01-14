import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// Zod validation schema for verified registration
const VerifiedRegistrationSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  birthday: z.string().refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 18;
  }, 'You must be at least 18 years old'),
  gender: z.enum(['male', 'female', 'other'], { message: 'Please select your gender' }),
  university: z.string().min(1, 'University name is required'),
  faculty: z.string().min(1, 'Faculty name is required'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  partnerPreferences: z.string().min(1, 'Partner preferences are required'),
  bio: z.string().min(20, 'Bio must be at least 20 characters'),
  proofType: z.enum(['student_id', 'facebook', 'academic'], { message: 'Please select a valid proof type' }),
});

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();

    const formDataObject = {
      fullName: formData.get('fullName') as string,
      birthday: formData.get('birthday') as string,
      gender: formData.get('gender') as string,
      university: formData.get('university') as string,
      faculty: formData.get('faculty') as string,
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      partnerPreferences: formData.get('partnerPreferences') as string,
      bio: formData.get('bio') as string,
      proofType: formData.get('proofType') as string,
    };

    const proofFile = formData.get('proofFile') as File;

    // Validate with Zod
    const validation = VerifiedRegistrationSchema.safeParse(formDataObject);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Validation failed';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const validatedData = validation.data;

    // Validate proof file
    if (!proofFile) {
      return NextResponse.json({ error: 'Verification document is required' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (proofFile.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(proofFile.type)) {
      return NextResponse.json({ error: 'Only JPG, PNG, and PDF files are allowed' }, { status: 400 });
    }

    // Sanitize username
    const sanitizedUsername = validatedData.username.toLowerCase().trim();

    // Check if username already exists
    const { data: existingUser, error: userCheckError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', sanitizedUsername)
      .single();

    if (userCheckError && userCheckError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is what we want
      console.error('Error checking username:', userCheckError);
      return NextResponse.json({ error: 'Database error occurred' }, { status: 500 });
    }

    if (existingUser) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, 12);

    // Upload file to Supabase Storage
    const fileExtension = proofFile.name.split('.').pop();
    const fileName = `${sanitizedUsername}_${Date.now()}.${fileExtension}`;
    const filePath = `verifications/${fileName}`;

    const fileBuffer = await proofFile.arrayBuffer();
    const fileBytes = new Uint8Array(fileBuffer);

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('proof_uploads')
      .upload(filePath, fileBytes, {
        contentType: proofFile.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload verification document. Please try again.' },
        { status: 500 }
      );
    }

    // Get public URL for the uploaded file (for admin viewing)
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from('proof_uploads').getPublicUrl(filePath);

    // Create user record
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        username: sanitizedUsername,
        password_hash: passwordHash,
        email: null, // No email required for verified registration
        email_verified: false,
        registration_type: 'verified',
        verification_status: 'pending',
        proof_type: validatedData.proofType,
        proof_url: publicUrl,
        full_name: validatedData.fullName,
        birthday: validatedData.birthday,
        gender: validatedData.gender,
        university_name: validatedData.university,
        faculty: validatedData.faculty,
        bio: validatedData.bio,
        preferences: validatedData.partnerPreferences,
        partner_preferences: validatedData.partnerPreferences,
        report_count: 0,
        is_restricted: false,
        is_admin: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id, username')
      .single();

    if (insertError) {
      console.error('Error creating user:', insertError);

      // Clean up uploaded file if user creation failed
      await supabaseAdmin.storage.from('proof_uploads').remove([filePath]);

      return NextResponse.json({ error: 'Failed to create account. Please try again.' }, { status: 500 });
    }

    // Create verification record in verifications table
    const { error: verificationError } = await supabaseAdmin.from('verifications').insert({
      user_id: newUser.id,
      proof_type: validatedData.proofType,
      file_url: publicUrl,
      status: 'pending',
      submitted_at: new Date().toISOString(),
      reviewed_at: null,
    });

    if (verificationError) {
      console.error('Error creating verification record:', verificationError);

      // Clean up user and file if verification record creation failed
      await supabaseAdmin.from('users').delete().eq('id', newUser.id);
      await supabaseAdmin.storage.from('proof_uploads').remove([filePath]);

      return NextResponse.json(
        { error: 'Failed to create verification record. Please try again.' },
        { status: 500 }
      );
    }

    // Create verification file record in verification_files table
    const { error: verificationFileError } = await supabaseAdmin.from('verification_files').insert({
      user_id: newUser.id,
      file_url: publicUrl,
      type: validatedData.proofType,
      status: 'pending',
      created_at: new Date().toISOString(),
    });

    if (verificationFileError) {
      console.error('Error creating verification file record:', verificationFileError);
      // Non-critical error, continue
    }

    // Create profile record (if profiles table exists)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: newUser.id,
        anonymous_name: sanitizedUsername,
        real_name: validatedData.fullName,
        dob: validatedData.birthday,
        gender: validatedData.gender,
        university: validatedData.university,
        faculty: validatedData.faculty,
        bio: validatedData.bio,
        verified: false, // Will be set to true after admin approval
        verification_type: validatedData.proofType,
        public: true,
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // Don't fail registration if profile creation fails, just log it
    }

    // Success response
    return NextResponse.json(
      {
        success: true,
        message:
          "Your account has been created and is under review. You'll receive access once verified by admin.",
        userId: newUser.id,
        username: newUser.username,
        verificationStatus: 'pending',
        registrationType: 'verified',
        token: `verified_${newUser.id}_${Date.now()}`, // Simple token for session management
        user: {
          id: newUser.id,
          username: newUser.username,
          fullName: validatedData.fullName,
          registrationType: 'verified',
          verificationStatus: 'pending',
          isPending: true,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error during verified registration:', error);
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 });
  }
}
