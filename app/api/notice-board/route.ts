import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

// GET: Fetch approved notice board posts (public) or all posts for admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const isAdmin = searchParams.get('isAdmin') === 'true';

    let query = supabaseAdmin
      .from('notice_board')
      .select(`
        id,
        title,
        content,
        category,
        status,
        is_admin_post,
        created_at,
        updated_at,
        approved_at,
        rejection_reason,
        author_id
      `)
      .order('created_at', { ascending: false });

    // If admin, can filter by status
    if (isAdmin && status) {
      query = query.eq('status', status);
    } else if (isAdmin) {
      // Admin sees all posts
    } else if (userId) {
      // User can see their own posts and approved posts
      query = query.or(`status.eq.approved,author_id.eq.${userId}`);
    } else {
      // Public: only approved posts
      query = query.eq('status', 'approved');
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error('Error fetching notice board posts:', error);
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }

    // Get author information for all posts
    const authorIds = [...new Set(posts?.map((p: any) => p.author_id).filter(Boolean))];
    
    let authors: Record<string, any> = {};
    if (authorIds.length > 0) {
      const { data: usersData } = await supabaseAdmin
        .from('users')
        .select('id, username, is_admin')
        .in('id', authorIds);

      if (usersData) {
        authors = usersData.reduce((acc: Record<string, any>, user: any) => {
          acc[user.id] = user;
          return acc;
        }, {} as Record<string, any>);
      }
    }

    // Enrich posts with author information
    const enrichedPosts = posts?.map((post: any) => ({
      ...post,
      author: authors[post.author_id] ? {
        id: authors[post.author_id].id,
        username: authors[post.author_id].username,
        isAdmin: authors[post.author_id].is_admin,
      } : null,
    }));

    return NextResponse.json({
      success: true,
      posts: enrichedPosts || [],
    });
  } catch (error) {
    console.error('Error in notice board GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new notice board post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, content, category } = body;

    if (!userId || !title || !content || !category) {
      return NextResponse.json(
        { error: 'User ID, title, content, and category are required' },
        { status: 400 }
      );
    }

    // Validate title and content length
    if (title.length < 5 || title.length > 200) {
      return NextResponse.json(
        { error: 'Title must be between 5 and 200 characters' },
        { status: 400 }
      );
    }

    if (content.length < 20 || content.length > 5000) {
      return NextResponse.json(
        { error: 'Content must be between 20 and 5000 characters' },
        { status: 400 }
      );
    }

    if (!['girl', 'boy', 'general'].includes(category)) {
      return NextResponse.json(
        { error: 'Category must be "girl", "boy", or "general"' },
        { status: 400 }
      );
    }

    // Check if user exists and get their verification status
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, verification_status, is_admin')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is verified (unless they're an admin)
    if (!user.is_admin && user.verification_status !== 'verified') {
      return NextResponse.json(
        { error: 'Only verified users can create posts' },
        { status: 403 }
      );
    }

    // Determine if this is an admin post (auto-approved)
    const isAdminPost = user.is_admin === true;
    const status = isAdminPost ? 'approved' : 'pending';

    // Create the post
    const { data: post, error: insertError } = await supabaseAdmin
      .from('notice_board')
      .insert({
        author_id: userId,
        title: title.trim(),
        content: content.trim(),
        category,
        status,
        is_admin_post: isAdminPost,
        approved_at: isAdminPost ? new Date().toISOString() : null,
        approved_by: isAdminPost ? userId : null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating post:', insertError);
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      post,
      message: isAdminPost
        ? 'Post published successfully'
        : 'Post submitted for approval',
    });
  } catch (error) {
    console.error('Error in notice board POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete a notice board post (own posts only or admin)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const userId = searchParams.get('userId');

    if (!postId || !userId) {
      return NextResponse.json(
        { error: 'Post ID and User ID are required' },
        { status: 400 }
      );
    }

    // Check if user is admin
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single();

    // Get the post
    const { data: post } = await supabaseAdmin
      .from('notice_board')
      .select('author_id')
      .eq('id', postId)
      .single();

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check authorization
    if (post.author_id !== userId && !user?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete the post
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
    console.error('Error in notice board DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
