import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { validateFile } from '@/lib/utils/helpers';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const fileType = formData.get('fileType') as 'facebook_screenshot' | 'student_id' | 'academic_document';
    const file = formData.get('file') as File;

    // Validate required fields
    if (!userId || !fileType || !file) {
      return NextResponse.json(
        { error: 'User ID, file type, and file are required' },
        { status: 400 }
      );
    }

    // Validate file type
    const validFileTypes = ['facebook_screenshot', 'student_id', 'academic_document'];
    if (!validFileTypes.includes(fileType)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }

    // Validate file
    const fileValidation = validateFile(file);
    if (!fileValidation.valid) {
      return NextResponse.json(
        { error: fileValidation.message },
        { status: 400 }
      );
    }

    // Verify user exists and has a profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, user_id')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found. Please create your profile first.' },
        { status: 404 }
      );
    }

    // Check if user already has pending or approved verification
    const { data: existingVerification } = await supabaseAdmin
      .from('verification_files')
      .select('status')
      .eq('user_id', userId)
      .eq('file_type', fileType)
      .in('status', ['pending', 'approved'])
      .single();

    if (existingVerification) {
      if (existingVerification.status === 'approved') {
        return NextResponse.json(
          { error: 'This document type has already been approved' },
          { status: 409 }
        );
      }
      if (existingVerification.status === 'pending') {
        return NextResponse.json(
          { error: 'You already have a pending verification request for this document type' },
          { status: 409 }
        );
      }
    }

    // Generate unique file name
    const fileExtension = file.name.split('.').pop();
    const fileName = `${userId}_${fileType}_${Date.now()}.${fileExtension}`;
    const filePath = `verification/${userId}/${fileName}`;

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload file to Supabase Storage (private bucket)
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('verification-files')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('File upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Save verification request to database
    const { data: verificationRecord, error: dbError } = await supabaseAdmin
      .from('verification_files')
      .insert({
        user_id: userId,
        file_type: fileType,
        file_path: uploadData.path,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        status: 'pending',
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Attempt to delete uploaded file if database insert fails
      await supabaseAdmin.storage.from('verification-files').remove([filePath]);
      return NextResponse.json(
        { error: 'Failed to save verification request' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Verification document uploaded successfully! Your request is pending review.',
        verification: {
          id: verificationRecord.id,
          fileType: verificationRecord.file_type,
          status: verificationRecord.status,
          createdAt: verificationRecord.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Verification upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check verification status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { data: verifications, error } = await supabaseAdmin
      .from('verification_files')
      .select('id, file_type, status, created_at, reviewed_at, rejection_reason')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching verifications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch verification status' },
        { status: 500 }
      );
    }

    // Check if user has any approved verifications
    const hasApprovedVerification = verifications?.some((v: any) => v.status === 'approved') || false;

    // If user has approved verification, update profile
    if (hasApprovedVerification) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('is_verified')
        .eq('user_id', userId)
        .single();

      if (profile && !profile.is_verified) {
        await supabaseAdmin
          .from('profiles')
          .update({ is_verified: true })
          .eq('user_id', userId);
      }
    }

    return NextResponse.json(
      {
        verifications: verifications || [],
        isVerified: hasApprovedVerification,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get verification status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
