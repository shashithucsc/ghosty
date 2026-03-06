import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminFromRequest } from '@/lib/adminMiddleware';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// GET: Fetch all notice board posts for admin management
export async function GET(request: NextRequest) {
  // Verify admin authentication
  const admin = await verifyAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('notice_board')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }

    // Get author information
    const authorIds = [...new Set(posts?.map(p => p.author_id).filter(Boolean))];
    
    let authors: Record<string, any> = {};
    if (authorIds.length > 0) {
      const { data: usersData } = await supabaseAdmin
        .from('users')
        .select('id, username, full_name, is_admin, verification_status')
        .in('id', authorIds);

      if (usersData) {
        authors = usersData.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {} as Record<string, any>);
      }
    }

    // Enrich posts with author information
    const enrichedPosts = posts?.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      status: post.status,
      isAdminPost: post.is_admin_post,
      createdAt: post.created_at,
      updatedAt: post.updated_at,
      approvedAt: post.approved_at,
      rejectionReason: post.rejection_reason,
      author: authors[post.author_id] ? {
        id: authors[post.author_id].id,
        username: authors[post.author_id].username,
        fullName: authors[post.author_id].full_name,
        isAdmin: authors[post.author_id].is_admin,
        verificationStatus: authors[post.author_id].verification_status,
      } : null,
    }));

    return NextResponse.json({
      success: true,
      posts: enrichedPosts || [],
    });
  } catch (error) {
    console.error('Error in admin notice board GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Approve or reject a notice board post
export async function PUT(request: NextRequest) {
  // Verify admin authentication
  const admin = await verifyAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { postId, action, rejectionReason } = body;

    if (!postId || !action) {
      return NextResponse.json(
        { error: 'Post ID and action are required' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Get the post
    const { data: post, error: fetchError } = await supabaseAdmin
      .from('notice_board')
      .select('*')
      .eq('id', postId)
      .single();

    if (fetchError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Update the post status
    const updateData: any = {
      status: action === 'approve' ? 'approved' : 'rejected',
      updated_at: new Date().toISOString(),
    };

    if (action === 'approve') {
      updateData.approved_at = new Date().toISOString();
      updateData.approved_by = admin.userId;
    } else {
      updateData.rejection_reason = rejectionReason || 'Post did not meet community guidelines';
    }

    const { error: updateError } = await supabaseAdmin
      .from('notice_board')
      .update(updateData)
      .eq('id', postId);

    if (updateError) {
      console.error('Error updating post:', updateError);
      return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: action === 'approve' ? 'Post approved successfully' : 'Post rejected',
    });
  } catch (error) {
    console.error('Error in admin notice board PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete a notice board post (admin)
export async function DELETE(request: NextRequest) {
  // Verify admin authentication
  const admin = await verifyAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const { error: deleteError } = await supabaseAdmin
      .from('notice_board')
      .delete()
      .eq('id', postId);

    if (deleteError) {
      console.error('Error deleting post:', deleteError);
      return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error in admin notice board DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
