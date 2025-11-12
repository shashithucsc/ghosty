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

const GetStatusQuerySchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
});

// =============================================
// GET /api/verification/status - Get user verification status
// =============================================
export async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const validatedQuery = GetStatusQuerySchema.parse({ userId });

    // TODO: Add JWT authentication check here
    // Verify that the authenticated user matches userId

    // Use database function to get comprehensive status
    const { data: statusData, error: statusError } = await supabase.rpc(
      'get_user_verification_status',
      { user_uuid: validatedQuery.userId }
    );

    if (statusError) {
      console.error('Error fetching verification status:', statusError);
      return NextResponse.json(
        { error: 'Failed to fetch verification status' },
        { status: 500 }
      );
    }

    // Get the first result (function returns TABLE)
    const status = statusData?.[0];

    if (!status) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get details of latest verification if exists
    const { data: latestVerification } = await supabase
      .from('verification_files')
      .select('id, file_type, status, admin_notes, reviewed_at, created_at')
      .eq('user_id', validatedQuery.userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      success: true,
      userId: validatedQuery.userId,
      isVerified: status.is_verified,
      hasPendingVerification: status.has_pending_verification,
      latestStatus: status.latest_status || null,
      submittedAt: status.submitted_at || null,
      verification: latestVerification || null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error in GET /api/verification/status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
