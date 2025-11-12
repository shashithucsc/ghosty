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

const GetVerificationsQuerySchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'all']).optional().default('all'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

const ReviewVerificationSchema = z.object({
  adminId: z.string().uuid('Invalid admin ID format'),
  verificationId: z.string().uuid('Invalid verification ID format'),
  action: z.enum(['approve', 'reject'], { message: 'Action must be approve or reject' }),
  notes: z.string().max(1000, 'Notes too long (max 1000 characters)').optional(),
});

// =============================================
// GET /api/admin/verification - List all verifications
// =============================================
export async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryData = {
      status: searchParams.get('status') || 'all',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    };

    const validatedQuery = GetVerificationsQuerySchema.parse(queryData);
    const { status, page, limit } = validatedQuery;

    // TODO: Add admin authentication check here
    // Verify that the user making this request has admin role

    // Build query
    let query = supabase
      .from('verification_files')
      .select(`
        id,
        user_id,
        file_url,
        file_type,
        status,
        admin_notes,
        reviewed_by,
        reviewed_at,
        created_at,
        updated_at,
        user:users!verification_files_user_id_fkey(
          id,
          username,
          full_name,
          email,
          university_name,
          faculty
        ),
        reviewer:users!verification_files_reviewed_by_fkey(
          id,
          username
        )
      `)
      .order('created_at', { ascending: false });

    // Filter by status if not 'all'
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: verifications, error } = await query;

    if (error) {
      console.error('Error fetching verifications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch verifications' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('verification_files')
      .select('id', { count: 'exact', head: true });

    if (status !== 'all') {
      countQuery = countQuery.eq('status', status);
    }

    const { count } = await countQuery;

    // Get counts by status for dashboard stats
    const { data: statusCounts } = await supabase
      .from('verification_files')
      .select('status')
      .then((result) => {
        if (result.error) return { data: null };
        const counts = {
          pending: 0,
          approved: 0,
          rejected: 0,
          total: result.data?.length || 0,
        };
        result.data?.forEach((item: { status: string }) => {
          if (item.status === 'pending') counts.pending++;
          else if (item.status === 'approved') counts.approved++;
          else if (item.status === 'rejected') counts.rejected++;
        });
        return { data: counts };
      });

    return NextResponse.json({
      success: true,
      verifications,
      stats: statusCounts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error in GET /api/admin/verification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================
// PATCH /api/admin/verification - Approve/Reject verification
// =============================================
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = ReviewVerificationSchema.parse(body);
    const { adminId, verificationId, action, notes } = validatedData;

    // TODO: Add admin authentication check here
    // Verify that adminId matches the authenticated user and has admin role

    // Get verification details
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

    // Check if already reviewed
    if (verification.status !== 'pending') {
      return NextResponse.json(
        { error: `Verification already ${verification.status}` },
        { status: 409 }
      );
    }

    // Use database function for approval/rejection
    if (action === 'approve') {
      const { data, error: approveError } = await supabase.rpc('approve_verification', {
        verification_id: verificationId,
        admin_id: adminId,
        notes: notes || null,
      });

      if (approveError) {
        console.error('Error approving verification:', approveError);
        return NextResponse.json(
          { error: 'Failed to approve verification' },
          { status: 500 }
        );
      }

      // Delete the file from storage after approval
      const url = new URL(verification.file_url);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(pathParts.indexOf('verification_files') + 1).join('/');

      const { error: deleteError } = await supabase.storage
        .from('verification_files')
        .remove([filePath]);

      if (deleteError) {
        console.error('Error deleting file after approval:', deleteError);
        // Non-critical error - verification is still approved
      }

      return NextResponse.json({
        success: true,
        message: 'Verification approved successfully',
        action: 'approved',
        userId: verification.user_id,
      });
    } else {
      // Reject verification
      const { data, error: rejectError } = await supabase.rpc('reject_verification', {
        verification_id: verificationId,
        admin_id: adminId,
        notes: notes || null,
      });

      if (rejectError) {
        console.error('Error rejecting verification:', rejectError);
        return NextResponse.json(
          { error: 'Failed to reject verification' },
          { status: 500 }
        );
      }

      // Keep the file for rejected verifications (admin may want to review again)

      return NextResponse.json({
        success: true,
        message: 'Verification rejected',
        action: 'rejected',
        userId: verification.user_id,
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error in PATCH /api/admin/verification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================
// DELETE /api/admin/verification - Delete verification record
// =============================================
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    const verificationId = searchParams.get('verificationId');

    if (!adminId || !verificationId) {
      return NextResponse.json(
        { error: 'Missing adminId or verificationId' },
        { status: 400 }
      );
    }

    // Validate UUIDs
    const uuidSchema = z.string().uuid();
    uuidSchema.parse(adminId);
    uuidSchema.parse(verificationId);

    // TODO: Add admin authentication check here
    // Verify that adminId matches authenticated user and has admin role

    // Get verification details
    const { data: verification, error: fetchError } = await supabase
      .from('verification_files')
      .select('id, file_url, status')
      .eq('id', verificationId)
      .single();

    if (fetchError || !verification) {
      return NextResponse.json(
        { error: 'Verification not found' },
        { status: 404 }
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
      console.error('Error deleting file:', deleteFileError);
      // Continue anyway
    }

    // Delete verification record
    const { error: deleteError } = await supabase
      .from('verification_files')
      .delete()
      .eq('id', verificationId);

    if (deleteError) {
      console.error('Error deleting verification record:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete verification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification deleted successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid UUID format', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error in DELETE /api/admin/verification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
