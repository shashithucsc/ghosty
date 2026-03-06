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

const CreateReportSchema = z.object({
  reporterId: z.string().uuid('Invalid reporter ID format'),
  reportedUserId: z.string().uuid('Invalid reported user ID format'),
  reason: z.enum(
    ['inappropriate_content', 'harassment', 'fake_profile', 'spam', 'underage', 'other'],
    { message: 'Invalid report reason' }
  ),
  description: z.string().max(1000, 'Description too long (max 1000 characters)').optional(),
}).refine(
  (data) => {
    // If reason is 'other', description is required
    if (data.reason === 'other' && (!data.description || data.description.trim().length === 0)) {
      return false;
    }
    return true;
  },
  {
    message: 'Description is required when reason is "other"',
    path: ['description'],
  }
);

const GetReportsQuerySchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  type: z.enum(['created', 'received', 'all']).optional().default('created'),
  status: z.enum(['pending', 'reviewed', 'resolved', 'dismissed', 'all']).optional().default('all'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

// =============================================
// POST /api/reports - Create a report
// =============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateReportSchema.parse(body);
    const { reporterId, reportedUserId, reason, description } = validatedData;

    // TODO: Add JWT authentication check here
    // Verify that the authenticated user matches reporterId

    // Verify reporter exists
    const { data: reporter, error: reporterError } = await supabase
      .from('users_v2')
      .select('id, is_restricted')
      .eq('id', reporterId)
      .single();

    if (reporterError || !reporter) {
      return NextResponse.json(
        { error: 'Reporter not found' },
        { status: 404 }
      );
    }

    // Check if reporter is restricted
    if (reporter.is_restricted) {
      return NextResponse.json(
        { error: 'Your account is restricted and cannot create reports' },
        { status: 403 }
      );
    }

    // Verify reported user exists
    const { data: reportedProfile, error: reportedError } = await supabase
      .from('profiles_v2')
      .select('user_id, anonymous_name')
      .eq('user_id', reportedUserId)
      .single();

    if (reportedError || !reportedProfile) {
      return NextResponse.json(
        { error: 'Reported user not found' },
        { status: 404 }
      );
    }

    // Check if trying to report self
    if (reporterId === reportedUserId) {
      return NextResponse.json(
        { error: 'You cannot report yourself' },
        { status: 400 }
      );
    }

    // Check if already reported today (prevent spam)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: existingReport } = await supabase
      .from('reports')
      .select('id')
      .eq('reporter_id', reporterId)
      .eq('reported_user_id', reportedUserId)
      .gte('created_at', today.toISOString())
      .single();

    if (existingReport) {
      return NextResponse.json(
        { error: 'You have already reported this user today. Please wait 24 hours before reporting again.' },
        { status: 429 }
      );
    }

    // Create report
    const { data: newReport, error: createError } = await supabase
      .from('reports')
      .insert({
        reporter_id: reporterId,
        reported_user_id: reportedUserId,
        reason,
        description: description || null,
        status: 'pending',
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating report:', createError);
      return NextResponse.json(
        { error: 'Failed to create report' },
        { status: 500 }
      );
    }

    // Get updated report count for the reported user from profiles_v2
    const { data: updatedProfile } = await supabase
      .from('profiles_v2')
      .select('total_reports')
      .eq('user_id', reportedUserId)
      .single();

    return NextResponse.json(
      {
        success: true,
        message: 'Report submitted successfully. Our team will review it shortly.',
        report: {
          id: newReport.id,
          reason: newReport.reason,
          status: newReport.status,
          createdAt: newReport.created_at,
        },
        reportedUserReportCount: updatedProfile?.total_reports || 0,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error in POST /api/reports:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================
// GET /api/reports - Get user's reports
// =============================================
export async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryData = {
      userId: searchParams.get('userId'),
      type: searchParams.get('type') || 'created',
      status: searchParams.get('status') || 'all',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    };

    const validatedQuery = GetReportsQuerySchema.parse(queryData);
    const { userId, type, status, page, limit } = validatedQuery;

    // TODO: Add JWT authentication check here
    // Verify that the authenticated user matches userId

    // Build query based on type
    let query = supabase.from('reports').select(
      `
        id,
        reporter_id,
        reported_user_id,
        reason,
        description,
        status,
        admin_notes,
        reviewed_at,
        created_at,
        updated_at
      `
    );

    // Filter by type
    if (type === 'created') {
      query = query.eq('reporter_id', userId);
    } else if (type === 'received') {
      query = query.eq('reported_user_id', userId);
    } else {
      // all - reports where user is either reporter or reported
      query = query.or(`reporter_id.eq.${userId},reported_user_id.eq.${userId}`);
    }

    // Filter by status
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Sort by most recent
    query = query.order('created_at', { ascending: false });

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: reports, error } = await query;

    if (error) {
      console.error('Error fetching reports:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reports' },
        { status: 500 }
      );
    }

    // Enrich reports with user data from users_v2 and profiles_v2
    const userIds = new Set<string>();
    reports?.forEach(r => {
      if (r.reporter_id) userIds.add(r.reporter_id);
      if (r.reported_user_id) userIds.add(r.reported_user_id);
    });

    const { data: profiles } = await supabase
      .from('profiles_v2')
      .select('user_id, anonymous_name, anonymous_avatar_url')
      .in('user_id', Array.from(userIds));

    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    const enrichedReports = reports?.map(report => {
      const reporterProfile = profileMap.get(report.reporter_id);
      const reportedProfile = profileMap.get(report.reported_user_id);
      
      return {
        ...report,
        reporter: reporterProfile ? {
          id: report.reporter_id,
          username: reporterProfile.anonymous_name,
          avatar: reporterProfile.anonymous_avatar_url,
        } : null,
        reported_user: reportedProfile ? {
          id: report.reported_user_id,
          username: reportedProfile.anonymous_name,
          avatar: reportedProfile.anonymous_avatar_url,
        } : null,
      };
    });

    // Get total count
    let countQuery = supabase
      .from('reports')
      .select('id', { count: 'exact', head: true });

    if (type === 'created') {
      countQuery = countQuery.eq('reporter_id', userId);
    } else if (type === 'received') {
      countQuery = countQuery.eq('reported_user_id', userId);
    } else {
      countQuery = countQuery.or(`reporter_id.eq.${userId},reported_user_id.eq.${userId}`);
    }

    if (status !== 'all') {
      countQuery = countQuery.eq('status', status);
    }

    const { count } = await countQuery;

    // Get user's report summary if viewing received reports
    let reportSummary = null;
    if (type === 'received' || type === 'all') {
      const { data: summary } = await supabase.rpc('get_user_reports_summary', {
        user_uuid: userId,
      });
      reportSummary = summary?.[0] || null;
    }

    return NextResponse.json({
      success: true,
      reports: enrichedReports,
      summary: reportSummary,
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

    console.error('Error in GET /api/reports:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================
// DELETE /api/reports - Delete a report (own reports only)
// =============================================
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const reportId = searchParams.get('reportId');

    if (!userId || !reportId) {
      return NextResponse.json(
        { error: 'Missing userId or reportId' },
        { status: 400 }
      );
    }

    // Validate UUIDs
    const uuidSchema = z.string().uuid();
    uuidSchema.parse(userId);
    uuidSchema.parse(reportId);

    // TODO: Add JWT authentication check here
    // Verify that the authenticated user matches userId

    // Get report details
    const { data: report, error: fetchError } = await supabase
      .from('reports')
      .select('id, reporter_id, status')
      .eq('id', reportId)
      .single();

    if (fetchError || !report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Verify user is the reporter
    if (report.reporter_id !== userId) {
      return NextResponse.json(
        { error: 'You can only delete your own reports' },
        { status: 403 }
      );
    }

    // Only allow deleting pending reports
    if (report.status !== 'pending') {
      return NextResponse.json(
        { error: 'Cannot delete a report that has been reviewed' },
        { status: 400 }
      );
    }

    // Delete report (trigger will decrement report_count)
    const { error: deleteError } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId);

    if (deleteError) {
      console.error('Error deleting report:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete report' },
        { status: 500 }
      );
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

    console.error('Error in DELETE /api/reports:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
