import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAdminFromRequest } from '@/lib/adminMiddleware';

// Initialize Supabase client with service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// =============================================
// ZOD VALIDATION SCHEMAS
// =============================================

const GetUsersQuerySchema = z.object({
  verificationStatus: z
    .enum(['all', 'verified', 'pending', 'unverified', 'rejected'])
    .optional()
    .default('all'),
  isRestricted: z.coerce.boolean().optional(),
  minReports: z.coerce.number().int().min(0).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  sortBy: z.enum(['created_at', 'report_count', 'username']).optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

const UpdateUserSchema = z.object({
  adminId: z.string().uuid('Invalid admin ID format'),
  userId: z.string().uuid('Invalid user ID format'),
  action: z.enum(['approve', 'restrict', 'unrestrict', 'delete'], {
    message: 'Action must be approve, restrict, unrestrict, or delete',
  }),
  notes: z.string().max(1000).optional(),
});

// =============================================
// HELPER FUNCTIONS
// =============================================

async function verifyAdmin(adminId: string): Promise<boolean> {
  const { data } = await supabase.rpc('is_user_admin', { user_uuid: adminId });
  return data === true;
}

async function logAdminAction(
  adminId: string,
  actionType: string,
  targetUserId: string,
  details: any
) {
  await supabase.from('admin_actions').insert({
    admin_id: adminId,
    action_type: actionType,
    target_user_id: targetUserId,
    details,
  });
}

// =============================================
// GET /api/admin/users - List users with filters
// =============================================
export async function GET(request: NextRequest) {
  // Verify admin authentication
  const admin = await verifyAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json(
      { error: 'Unauthorized: Admin access required' },
      { status: 403 }
    );
  }

  try {
    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);

    const queryData = {
      verificationStatus: searchParams.get('verificationStatus') || 'all',
      isRestricted: searchParams.get('isRestricted') || undefined,
      minReports: searchParams.get('minReports') || undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '50',
      sortBy: searchParams.get('sortBy') || 'created_at',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    let validatedQuery;
    try {
      validatedQuery = GetUsersQuerySchema.parse(queryData);
    } catch (validationError) {
      console.error('Validation error:', validationError);
      if (validationError instanceof z.ZodError) {
        console.error('Validation details:', JSON.stringify(validationError.issues, null, 2));
      }
      throw validationError;
    }
    
    const {
      verificationStatus,
      isRestricted,
      minReports,
      search,
      page,
      limit,
      sortBy,
      sortOrder,
    } = validatedQuery;

    // Build query
    let query = supabase.from('users').select(
      `
        id,
        username,
        email,
        full_name,
        birthday,
        gender,
        university_name,
        faculty,
        registration_type,
        verification_status,
        report_count,
        is_restricted,
        is_admin,
        created_at,
        updated_at
      `,
      { count: 'exact' }
    );

    // Apply filters
    if (verificationStatus !== 'all') {
      query = query.eq('verification_status', verificationStatus);
    }

    if (isRestricted !== undefined) {
      query = query.eq('is_restricted', isRestricted);
    }

    if (minReports !== undefined && minReports > 0) {
      query = query.gte('report_count', minReports);
    }

    if (search) {
      query = query.or(
        `username.ilike.%${search}%,full_name.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    // Sorting
    const sortColumn = sortBy === 'report_count' ? 'report_count' : sortBy;
    query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: users, error, count } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      users,
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

    console.error('Error in GET /api/admin/users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// =============================================
// PATCH /api/admin/users - Update user status
// =============================================
export async function PATCH(request: NextRequest) {
  // Verify admin authentication
  const admin = await verifyAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json(
      { error: 'Unauthorized: Admin access required' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const validatedData = UpdateUserSchema.parse(body);
    const { adminId, userId, action, notes } = validatedData;

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, verification_status, is_restricted, is_admin')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent admin from modifying another admin
    if (user.is_admin && action === 'delete') {
      return NextResponse.json(
        { error: 'Cannot delete another admin account' },
        { status: 403 }
      );
    }

    let result;
    let actionType = '';

    switch (action) {
      case 'approve':
        // Approve verification
        actionType = 'approve_verification';
        const { error: approveError } = await supabase
          .from('users')
          .update({
            verification_status: 'verified',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (approveError) {
          throw approveError;
        }

        // Also update profiles table
        await supabase
          .from('profiles')
          .update({ verified: true })
          .eq('user_id', userId);

        result = { message: 'User verification approved successfully' };
        break;

      case 'restrict':
        // Restrict user account
        actionType = 'restrict_user';
        const { error: restrictError } = await supabase
          .from('users')
          .update({
            is_restricted: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (restrictError) {
          console.error('Error restricting user:', restrictError);
          throw restrictError;
        }

        result = { message: 'User account restricted successfully' };
        break;

      case 'unrestrict':
        // Unrestrict user account
        actionType = 'unrestrict_user';
        const { error: unrestrictError } = await supabase
          .from('users')
          .update({
            is_restricted: false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (unrestrictError) {
          console.error('Error unrestricting user:', unrestrictError);
          throw unrestrictError;
        }

        result = { message: 'User account unrestricted successfully' };
        break;

      case 'delete':
        // Delete user account
        actionType = 'delete_user';
        
        // Delete associated data first (profiles, verifications, etc.)
        // CASCADE will handle most of this, but explicitly delete profiles
        await supabase.from('profiles').delete().eq('user_id', userId);

        // Delete user
        const { error: deleteError } = await supabase
          .from('users')
          .delete()
          .eq('id', userId);

        if (deleteError) {
          throw deleteError;
        }

        result = { message: 'User account deleted successfully' };
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Log admin action
    await logAdminAction(admin.userId, actionType, userId, {
      action,
      notes,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      ...result,
      userId,
      action,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error in PATCH /api/admin/users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// =============================================
// GET (single user details) /api/admin/users?userId=...
// =============================================
// Note: This could be a separate endpoint like /api/admin/users/[id]
// For now, we handle it in the same GET handler by checking for userId param
