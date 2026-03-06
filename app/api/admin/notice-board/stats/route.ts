import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminFromRequest } from '@/lib/adminMiddleware';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// GET: Fetch notice board statistics for admin dashboard
export async function GET(request: NextRequest) {
  // Verify admin authentication
  const admin = await verifyAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    // Get counts for each status
    const { data: allPosts, error } = await supabaseAdmin
      .from('notice_board')
      .select('status');

    if (error) {
      console.error('Error fetching stats:', error);
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }

    const stats = {
      total: allPosts?.length || 0,
      pending: allPosts?.filter(p => p.status === 'pending').length || 0,
      approved: allPosts?.filter(p => p.status === 'approved').length || 0,
      rejected: allPosts?.filter(p => p.status === 'rejected').length || 0,
    };

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error('Error in notice board stats GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
