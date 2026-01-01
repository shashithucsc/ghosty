import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminFromRequest } from '@/lib/adminMiddleware';

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// GET: List all verifications (admin only)
export async function GET(request: NextRequest) {
  // Verify admin authentication
  const admin = await verifyAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'pending', 'approved', 'rejected', or null for all

    // First, get verifications from verifications table
    let verificationsQuery = supabaseAdmin
      .from('verifications')
      .select('*')
      .order('submitted_at', { ascending: false });

    // Filter by status if provided
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      verificationsQuery = verificationsQuery.eq('status', status);
    }

    const { data: verifications, error: verificationsError } = await verificationsQuery;

    if (verificationsError) {
      console.error('Error fetching verifications:', verificationsError);
      return NextResponse.json({ error: 'Failed to fetch verifications' }, { status: 500 });
    }

    // Get unique user IDs from verifications
    const userIds = [...new Set(verifications?.map(v => v.user_id).filter(Boolean))] as string[];

    // Fetch user details for all verification requests
    let users: Record<string, any> = {};
    if (userIds.length > 0) {
      const { data: usersData, error: usersError } = await supabaseAdmin
        .from('users')
        .select('id, username, full_name, email, university_name, faculty, bio, partner_preferences, birthday, gender, proof_type, proof_url, verification_status, registration_type, created_at')
        .in('id', userIds);

      if (usersError) {
        console.error('Error fetching users:', usersError);
      } else if (usersData) {
        users = usersData.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {} as Record<string, any>);
      }
    }

    // Also get verification_files for additional file info
    let verificationFiles: Record<string, any[]> = {};
    if (userIds.length > 0) {
      const { data: filesData, error: filesError } = await supabaseAdmin
        .from('verification_files')
        .select('*')
        .in('user_id', userIds);

      if (!filesError && filesData) {
        verificationFiles = filesData.reduce((acc, file) => {
          if (!acc[file.user_id]) acc[file.user_id] = [];
          acc[file.user_id].push(file);
          return acc;
        }, {} as Record<string, any[]>);
      }
    }

    // Combine verification data with user data
    const enrichedVerifications = verifications?.map(verification => {
      const user = users[verification.user_id] || null;
      const files = verificationFiles[verification.user_id] || [];
      
      return {
        id: verification.id,
        userId: verification.user_id,
        proofType: verification.proof_type,
        fileUrl: verification.file_url,
        status: verification.status,
        submittedAt: verification.submitted_at,
        reviewedAt: verification.reviewed_at,
        // User details
        username: user?.username || 'Unknown',
        fullName: user?.full_name || null,
        email: user?.email || null,
        university: user?.university_name || 'Unknown University',
        faculty: user?.faculty || null,
        bio: user?.bio || null,
        partnerPreferences: user?.partner_preferences || null,
        birthday: user?.birthday || null,
        gender: user?.gender || null,
        userCreatedAt: user?.created_at || null,
        // Additional verification files
        additionalFiles: files,
      };
    }) || [];

    return NextResponse.json({ 
      verifications: enrichedVerifications,
      total: enrichedVerifications.length,
      pending: enrichedVerifications.filter(v => v.status === 'pending').length,
      approved: enrichedVerifications.filter(v => v.status === 'approved').length,
      rejected: enrichedVerifications.filter(v => v.status === 'rejected').length,
    }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in GET /api/admin/verifications:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

// POST: Approve or reject a verification
export async function POST(request: NextRequest) {
  // Verify admin authentication
  const admin = await verifyAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {

    const body = await request.json();
    const { action, verificationId, userId, reason } = body;

    // Validate input
    if (!action || !verificationId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: action, verificationId, userId' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be "approve" or "reject"' }, { status: 400 });
    }

    if (action === 'approve') {
      return await approveVerification(verificationId, userId);
    } else {
      return await rejectVerification(verificationId, userId, reason);
    }
  } catch (error) {
    console.error('Unexpected error in POST /api/admin/verifications:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

// Approve verification function
async function approveVerification(verificationId: string, userId: string) {
  try {
    // Step 1: Get verification details to get file path
    const { data: verification, error: fetchError } = await supabaseAdmin
      .from('verifications')
      .select('file_url, status')
      .eq('id', verificationId)
      .single();

    if (fetchError || !verification) {
      console.error('Error fetching verification:', fetchError);
      return NextResponse.json({ error: 'Verification not found' }, { status: 404 });
    }

    if (verification.status !== 'pending') {
      return NextResponse.json(
        { error: `Cannot approve verification with status: ${verification.status}` },
        { status: 400 }
      );
    }

    // Step 2: Update verification status to approved
    const { error: updateVerificationError } = await supabaseAdmin
      .from('verifications')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        // reviewed_by: adminUserId, // TODO: Add admin user ID from JWT
      })
      .eq('id', verificationId);

    if (updateVerificationError) {
      console.error('Error updating verification:', updateVerificationError);
      return NextResponse.json({ error: 'Failed to update verification status' }, { status: 500 });
    }

    // Step 3: Update user verification status to verified
    const { error: updateUserError } = await supabaseAdmin
      .from('users')
      .update({
        verification_status: 'verified',
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateUserError) {
      console.error('Error updating user:', updateUserError);
      // Rollback verification status
      await supabaseAdmin.from('verifications').update({ status: 'pending' }).eq('id', verificationId);
      return NextResponse.json({ error: 'Failed to update user verification status' }, { status: 500 });
    }

    // Step 4: Update verification_files table status
    const { error: updateFilesError } = await supabaseAdmin
      .from('verification_files')
      .update({
        status: 'approved',
      })
      .eq('user_id', userId);

    if (updateFilesError) {
      console.error('Error updating verification files:', updateFilesError);
      // Non-critical, continue
    }

    // Step 5: Delete file from Supabase Storage (optional - keep for audit)
    // Extract file path from URL
    const filePath = extractFilePathFromUrl(verification.file_url);

    if (filePath) {
      const { error: deleteError } = await supabaseAdmin.storage.from('proof_uploads').remove([filePath]);

      if (deleteError) {
        console.error('Error deleting file from storage:', deleteError);
        // Don't fail the approval if file deletion fails - log it and continue
        console.warn('File deletion failed but verification was approved');
      } else {
        console.log('File deleted successfully:', filePath);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Verification approved successfully',
        verificationId,
        userId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in approveVerification:', error);
    return NextResponse.json({ error: 'Failed to approve verification' }, { status: 500 });
  }
}

// Reject verification function
async function rejectVerification(verificationId: string, userId: string, reason?: string) {
  try {
    // Step 1: Check if verification exists and is pending
    const { data: verification, error: fetchError } = await supabaseAdmin
      .from('verifications')
      .select('status')
      .eq('id', verificationId)
      .single();

    if (fetchError || !verification) {
      console.error('Error fetching verification:', fetchError);
      return NextResponse.json({ error: 'Verification not found' }, { status: 404 });
    }

    if (verification.status !== 'pending') {
      return NextResponse.json(
        { error: `Cannot reject verification with status: ${verification.status}` },
        { status: 400 }
      );
    }

    // Step 2: Update verification status to rejected
    const { error: updateVerificationError } = await supabaseAdmin
      .from('verifications')
      .update({
        status: 'rejected',
        admin_notes: reason || 'Verification rejected by admin',
        reviewed_at: new Date().toISOString(),
        // reviewed_by: adminUserId, // TODO: Add admin user ID from JWT
      })
      .eq('id', verificationId);

    if (updateVerificationError) {
      console.error('Error updating verification:', updateVerificationError);
      return NextResponse.json({ error: 'Failed to update verification status' }, { status: 500 });
    }

    // Step 3: Update user verification status to rejected (they stay unverified but can reapply)
    const { error: updateUserError } = await supabaseAdmin
      .from('users')
      .update({
        verification_status: 'rejected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateUserError) {
      console.error('Error updating user:', updateUserError);
      // Rollback verification status
      await supabaseAdmin.from('verifications').update({ status: 'pending' }).eq('id', verificationId);
      return NextResponse.json({ error: 'Failed to update user verification status' }, { status: 500 });
    }

    // Step 4: Update verification_files table status
    const { error: updateFilesError } = await supabaseAdmin
      .from('verification_files')
      .update({
        status: 'rejected',
      })
      .eq('user_id', userId);

    if (updateFilesError) {
      console.error('Error updating verification files:', updateFilesError);
      // Non-critical, continue
    }

    // Note: File is NOT deleted on rejection - user might want to see why it was rejected

    return NextResponse.json(
      {
        success: true,
        message: 'Verification rejected successfully',
        verificationId,
        userId,
        reason: reason || 'No reason provided',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in rejectVerification:', error);
    return NextResponse.json({ error: 'Failed to reject verification' }, { status: 500 });
  }
}

// Helper function to extract file path from Supabase Storage URL
function extractFilePathFromUrl(url: string): string | null {
  try {
    // Supabase Storage URL format:
    // https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
    // or for signed URLs:
    // https://<project>.supabase.co/storage/v1/object/sign/<bucket>/<path>

    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');

    // Find the bucket index
    const bucketIndex = pathParts.findIndex((part) => part === 'proof_uploads');

    if (bucketIndex === -1) {
      console.error('Could not find bucket name in URL:', url);
      return null;
    }

    // Everything after the bucket name is the file path
    const filePath = pathParts.slice(bucketIndex + 1).join('/');

    return filePath || null;
  } catch (error) {
    console.error('Error parsing file URL:', error);
    return null;
  }
}
