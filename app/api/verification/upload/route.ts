import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Initialize Supabase client with service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// =============================================
// ZOD VALIDATION SCHEMAS
// =============================================

const UploadVerificationSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  fileType: z.enum(['facebook', 'student_id', 'academic'], {
    message: 'File type must be facebook, student_id, or academic',
  }),
});

// =============================================
// POST /api/verification/upload - Upload verification document
// =============================================
export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const fileType = formData.get('fileType') as string;
    const file = formData.get('file') as File;

    // Validate inputs
    const validation = UploadVerificationSchema.safeParse({ userId, fileType });
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const validatedData = validation.data;

    // TODO: Add JWT authentication check
    // Verify that the authenticated user matches userId

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { error: 'Verification file is required' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPG, PNG, and PDF files are allowed' },
        { status: 400 }
      );
    }

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, verification_status')
      .eq('id', validatedData.userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already has a pending verification
    const { data: existingVerification } = await supabase
      .from('verification_files')
      .select('id, status')
      .eq('user_id', validatedData.userId)
      .eq('status', 'pending')
      .single();

    if (existingVerification) {
      return NextResponse.json(
        { error: 'You already have a pending verification. Please wait for admin review.' },
        { status: 409 }
      );
    }

    // Check if user is already verified
    if (user.verification_status === 'verified') {
      return NextResponse.json(
        { error: 'You are already verified' },
        { status: 400 }
      );
    }

    // Upload file to Supabase Storage (private bucket)
    const fileExtension = file.name.split('.').pop();
    const fileName = `${validatedData.userId}/${validatedData.fileType}_${Date.now()}.${fileExtension}`;
    const filePath = fileName;

    const fileBuffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(fileBuffer);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('verification_files')
      .upload(filePath, fileBytes, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload verification file. Please try again.' },
        { status: 500 }
      );
    }

    // Get file URL (private - only accessible with signed URL or by admins)
    const {
      data: { publicUrl },
    } = supabase.storage.from('verification_files').getPublicUrl(filePath);

    // Create verification record
    const { data: verification, error: verificationError } = await supabase
      .from('verification_files')
      .insert({
        user_id: validatedData.userId,
        file_url: publicUrl,
        file_type: validatedData.fileType,
        status: 'pending',
      })
      .select()
      .single();

    if (verificationError) {
      console.error('Error creating verification record:', verificationError);

      // Clean up uploaded file if database insert failed
      await supabase.storage.from('verification_files').remove([filePath]);

      return NextResponse.json(
        { error: 'Failed to create verification record. Please try again.' },
        { status: 500 }
      );
    }

    // Update user verification status to pending
    await supabase
      .from('users')
      .update({ verification_status: 'pending' })
      .eq('id', validatedData.userId);

    return NextResponse.json(
      {
        success: true,
        message: 'Verification document uploaded successfully. Please wait for admin review.',
        verification: {
          id: verification.id,
          fileType: verification.file_type,
          status: verification.status,
          submittedAt: verification.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/verification/upload:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================
// DELETE /api/verification/upload - Cancel pending verification
// =============================================
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const verificationId = searchParams.get('verificationId');

    if (!userId || !verificationId) {
      return NextResponse.json(
        { error: 'Missing userId or verificationId' },
        { status: 400 }
      );
    }

    // Validate UUIDs
    const uuidSchema = z.string().uuid();
    uuidSchema.parse(userId);
    uuidSchema.parse(verificationId);

    // TODO: Add JWT authentication check
    // Verify that the authenticated user matches userId

    // Get verification record
    const { data: verification, error: fetchError } = await supabase
      .from('verification_files')
      .select('id, user_id, file_url, status')
      .eq('id', verificationId)
      .single();

    if (fetchError || !verification) {
      return NextResponse.json(
        { error: 'Verification not found' },
        { status: 404 }
      );
    }

    // Verify user owns this verification
    if (verification.user_id !== userId) {
      return NextResponse.json(
        { error: 'You can only cancel your own verifications' },
        { status: 403 }
      );
    }

    // Only allow canceling pending verifications
    if (verification.status !== 'pending') {
      return NextResponse.json(
        { error: 'Cannot cancel a verification that has already been reviewed' },
        { status: 400 }
      );
    }

    // Extract file path from URL
    const url = new URL(verification.file_url);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(pathParts.indexOf('verification_files') + 1).join('/');

    // Delete file from storage
    const { error: deleteFileError } = await supabase.storage
      .from('verification_files')
      .remove([filePath]);

    if (deleteFileError) {
      console.error('Error deleting file from storage:', deleteFileError);
      // Continue anyway - database cleanup is more important
    }

    // Delete verification record
    const { error: deleteError } = await supabase
      .from('verification_files')
      .delete()
      .eq('id', verificationId);

    if (deleteError) {
      console.error('Error deleting verification record:', deleteError);
      return NextResponse.json(
        { error: 'Failed to cancel verification' },
        { status: 500 }
      );
    }

    // Update user verification status back to unverified
    await supabase
      .from('users')
      .update({ verification_status: 'unverified' })
      .eq('id', userId);

    return NextResponse.json({
      success: true,
      message: 'Verification cancelled successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid UUID format', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error in DELETE /api/verification/upload:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
