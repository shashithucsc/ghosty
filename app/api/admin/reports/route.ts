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

const GetReportsQuerySchema = z.object({
  status: z.enum(['all', 'pending', 'reviewed', 'resolved', 'dismissed']).optional().default('all'),
  reason: z
    .enum([
      'all',
      'inappropriate_content',
      'harassment',
      'fake_profile',
      'spam',
      'underage',
      'other',
    ])
    .optional()
    .default('all'),
  reportedUserId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

const UpdateReportSchema = z.object({
  adminId: z.string().uuid('Invalid admin ID format'),
  reportId: z.string().uuid('Invalid report ID format'),
  status: z.enum(['reviewed', 'resolved', 'dismissed'], {
    message: 'Status must be reviewed, resolved, or dismissed',
  }),
  adminNotes: z.string().max(1000, 'Notes too long (max 1000 characters)').optional(),
  restrictUser: z.boolean().optional().default(false),
});

// =============================================
// HELPER FUNCTIONS
// =============================================

async function verifyAdmin(adminId: string): Promise<boolean> {
  const { data } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', adminId)
    .single();
  return data?.is_admin === true;
}

async function logAdminAction(
  adminId: string,
  actionType: string,
  targetUserId: string | null,
  targetResourceId: string,
  details: any
) {
  await supabase.from('admin_actions').insert({
    admin_id: adminId,
    action_type: actionType,
    target_user_id: targetUserId,
    target_resource_id: targetResourceId,
    details,
  });
}

// =============================================
// GET /api/admin/reports - List all reports
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
    const { searchParams } = new URL(request.url);

    const queryData = {
      status: searchParams.get('status') || 'all',
      reason: searchParams.get('reason') || 'all',
      reportedUserId: searchParams.get('reportedUserId') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '50',
    };

    const validatedQuery = GetReportsQuerySchema.parse(queryData);
    const { status, reason, reportedUserId, page, limit } = validatedQuery;

    // Build query - fetch reports first, then enrich with user data
    let query = supabase.from('reports').select(
      `
        *
      `,
      { count: 'exact' }
    );

    // Apply filters
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (reason !== 'all') {
      query = query.eq('reason', reason);
    }

    if (reportedUserId) {
      query = query.eq('reported_user_id', reportedUserId);
    }

    // Sort by most recent first
    query = query.order('created_at', { ascending: false });

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: reports, error, count } = await query;

    if (error) {
      console.error('Error fetching reports:', error);
      return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
    }

    // Enrich reports with user data
    if (reports && reports.length > 0) {
      const userIds = new Set<string>();
      reports.forEach(r => {
        if (r.reporter_id) userIds.add(r.reporter_id);
        if (r.reported_user_id) userIds.add(r.reported_user_id);
      });

      const { data: users } = await supabase
        .from('users')
        .select('id, username, email, report_count, is_restricted, verification_status')
        .in('id', Array.from(userIds));

      const usersMap = new Map(users?.map(u => [u.id, u]) || []);

      // Add user data to reports
      reports.forEach(report => {
        if (report.reporter_id) {
          const reporter = usersMap.get(report.reporter_id);
          if (reporter) {
            (report as any).reporter = {
              id: reporter.id,
              username: reporter.username,
              email: reporter.email,
            };
          }
        }
        if (report.reported_user_id) {
          const reportedUser = usersMap.get(report.reported_user_id);
          if (reportedUser) {
            (report as any).reported_user = {
              id: reportedUser.id,
              username: reportedUser.username,
              email: reportedUser.email,
              report_count: reportedUser.report_count,
              is_restricted: reportedUser.is_restricted,
              verification_status: reportedUser.verification_status,
            };
          }
        }
      });
    }

    // Get report stats
    const { data: allReports } = await supabase.from('reports').select('status, reason');

    const stats = {
      total: allReports?.length || 0,
      pending: allReports?.filter((r) => r.status === 'pending').length || 0,
      reviewed: allReports?.filter((r) => r.status === 'reviewed').length || 0,
      resolved: allReports?.filter((r) => r.status === 'resolved').length || 0,
      dismissed: allReports?.filter((r) => r.status === 'dismissed').length || 0,
      byReason: {
        inappropriate_content:
          allReports?.filter((r) => r.reason === 'inappropriate_content').length || 0,
        harassment: allReports?.filter((r) => r.reason === 'harassment').length || 0,
        fake_profile: allReports?.filter((r) => r.reason === 'fake_profile').length || 0,
        spam: allReports?.filter((r) => r.reason === 'spam').length || 0,
        underage: allReports?.filter((r) => r.reason === 'underage').length || 0,
        other: allReports?.filter((r) => r.reason === 'other').length || 0,
      },
    };

    return NextResponse.json({
      success: true,
      reports,
      stats,
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

    console.error('Error in GET /api/admin/reports:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// =============================================
// PATCH /api/admin/reports - Update report status
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
    const validatedData = UpdateReportSchema.parse(body);
    const { adminId, reportId, status, adminNotes, restrictUser } = validatedData;

    // Get report details
    const { data: report, error: fetchError } = await supabase
      .from('reports')
      .select('id, reported_user_id, status')
      .eq('id', reportId)
      .single();

    if (fetchError || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Check if already reviewed
    if (report.status !== 'pending') {
      return NextResponse.json(
        { error: `Report already ${report.status}` },
        { status: 409 }
      );
    }

    // Update report status
    const { error: updateError } = await supabase
      .from('reports')
      .update({
        status,
        admin_notes: adminNotes || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', reportId);

    if (updateError) {
      console.error('Error updating report:', updateError);
      return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
    }

    // If report is resolved and restrictUser is true, restrict the reported user
    if (status === 'resolved' && restrictUser && report.reported_user_id) {
      // Direct update to restrict user
      const { error: restrictError } = await supabase
        .from('users')
        .update({
          is_restricted: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', report.reported_user_id);

      if (restrictError) {
        console.error('Error restricting user:', restrictError);
        // Non-critical error, continue
      }

      // Increment report count
      const { data: userData } = await supabase
        .from('users')
        .select('report_count')
        .eq('id', report.reported_user_id)
        .single();

      if (userData) {
        await supabase
          .from('users')
          .update({
            report_count: (userData.report_count || 0) + 1,
          })
          .eq('id', report.reported_user_id);
      }
    }

    // Log admin action
    await logAdminAction(admin.userId, 'review_report', report.reported_user_id, reportId, {
      status,
      adminNotes,
      restrictUser,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Report ${status} successfully`,
      reportId,
      status,
      userRestricted: restrictUser && status === 'resolved',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error in PATCH /api/admin/reports:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// =============================================
// DELETE /api/admin/reports - Delete report
// =============================================
export async function DELETE(request: NextRequest) {
  // Verify admin authentication
  const admin = await verifyAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json(
      { error: 'Unauthorized: Admin access required' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('reportId');

    if (!reportId) {
      return NextResponse.json(
        { error: 'Missing reportId' },
        { status: 400 }
      );
    }

    // Validate UUID
    const uuidSchema = z.string().uuid();
    uuidSchema.parse(reportId);

    // Get report details for logging
    const { data: report } = await supabase
      .from('reports')
      .select('reported_user_id')
      .eq('id', reportId)
      .single();

    // Delete report (trigger will decrement report count)
    const { error: deleteError } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId);

    if (deleteError) {
      console.error('Error deleting report:', deleteError);
      return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 });
    }

    // Log admin action
    if (report) {
      await logAdminAction(admin.userId, 'dismiss_report', report.reported_user_id, reportId, {
        action: 'delete',
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid UUID format', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error in DELETE /api/admin/reports:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
