import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminFromRequest } from '@/lib/adminMiddleware';

// Initialize Supabase client with service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// =============================================
// GET /api/admin/stats - Get admin dashboard statistics
// =============================================
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminFromRequest(request);
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin access only' },
        { status: 403 }
      );
    }

    // Get total users count
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (usersError) {
      console.error('Error counting users:', usersError);
    }

    // Get verified users count
    const { count: verifiedUsers, error: verifiedError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('verification_status', 'verified');

    if (verifiedError) {
      console.error('Error counting verified users:', verifiedError);
    }

    // Get pending verifications count
    const { count: pendingVerifications, error: pendingError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('verification_status', 'pending');

    if (pendingError) {
      console.error('Error counting pending verifications:', pendingError);
    }

    // Get restricted users count
    const { count: restrictedUsers, error: restrictedError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_restricted', true);

    if (restrictedError) {
      console.error('Error counting restricted users:', restrictedError);
    }

    // Get total reports count
    const { count: totalReports, error: reportsError } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true });

    if (reportsError) {
      console.error('Error counting reports:', reportsError);
    }

    // Get active chats count (distinct conversation_ids)
    const { data: chats, error: chatsError } = await supabase
      .from('chats')
      .select('conversation_id');

    const activeChats = chats 
      ? new Set(chats.map(c => c.conversation_id)).size 
      : 0;

    if (chatsError) {
      console.error('Error counting chats:', chatsError);
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: totalUsers || 0,
        verifiedUsers: verifiedUsers || 0,
        pendingVerifications: pendingVerifications || 0,
        restrictedUsers: restrictedUsers || 0,
        totalReports: totalReports || 0,
        activeChats: activeChats,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/admin/stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
