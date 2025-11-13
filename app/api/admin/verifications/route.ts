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

    let query = supabaseAdmin
      .from('verifications')
      .select(
        `
        *,
        user:users!verifications_user_id_fkey (
          id,
          username,
          full_name,
          email,
          university,
          faculty,
          bio,
          partner_preferences,
          birthday,
          gender
        )
      `
      )
      .order('submitted_at', { ascending: false });

    // Filter by status if provided
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching verifications:', error);
      return NextResponse.json({ error: 'Failed to fetch verifications' }, { status: 500 });
    }

    return NextResponse.json({ verifications: data || [] }, { status: 200 });
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
      })
      .eq('id', userId);

    if (updateUserError) {
      console.error('Error updating user:', updateUserError);
      // Rollback verification status
      await supabaseAdmin.from('verifications').update({ status: 'pending' }).eq('id', verificationId);
      return NextResponse.json({ error: 'Failed to update user verification status' }, { status: 500 });
    }

    // Step 4: Delete file from Supabase Storage
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
      })
      .eq('id', userId);

    if (updateUserError) {
      console.error('Error updating user:', updateUserError);
      // Rollback verification status
      await supabaseAdmin.from('verifications').update({ status: 'pending' }).eq('id', verificationId);
      return NextResponse.json({ error: 'Failed to update user verification status' }, { status: 500 });
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
