import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - Create a new notice board post (verified users only)
export async function POST(request: NextRequest) {
  try {
    const { userId, title, content, category } = await request.json();

    // Validation
    if (!userId || !title || !content || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate category (user selects gender for post)
    if (!['girl', 'boy'].includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category. Only "girl" or "boy" allowed.' },
        { status: 400 }
      );
    }

    // Basic validation - no character limits
    if (!title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Title cannot be empty' },
        { status: 400 }
      );
    }

    if (!content.trim()) {
      return NextResponse.json(
        { success: false, error: 'Content cannot be empty' },
        { status: 400 }
      );
    }

    // Check if user exists and is verified in users_v2
    const { data: user, error: userError } = await supabase
      .from('users_v2')
      .select('id, verification_status, gender, is_restricted')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is verified
    if (user.verification_status !== 'verified') {
      return NextResponse.json(
        { success: false, error: 'Only verified users can create posts' },
        { status: 403 }
      );
    }

    // Check if user is restricted
    if (user.is_restricted) {
      return NextResponse.json(
        { success: false, error: 'Your account is restricted and cannot create posts' },
        { status: 403 }
      );
    }

    // Note: Users can select any gender category for their posts (male/female)
    // Posts are published anonymously - no real identity revealed

    // Insert new post (anonymous - author_id stored but not displayed publicly)
    const { data: post, error: insertError } = await supabase
      .from('notice_board')
      .insert({
        author_id: userId, // Stored for moderation purposes only
        title: title.trim(),
        content: content.trim(),
        category: category, // User-selected category (boy/girl section)
        status: 'pending', // Posts need admin approval before publishing
        is_admin_post: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating post:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to create post' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Post created successfully! It will be visible after admin approval.',
      post: post,
    });

  } catch (error) {
    console.error('Error in POST /api/notice-board/posts:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Fetch user's own posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // Validate user exists in users_v2
    const { data: user, error: userError } = await supabase
      .from('users_v2')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch user's posts
    const { data: posts, error: postsError } = await supabase
      .from('notice_board')
      .select('*')
      .eq('author_id', userId)
      .order('created_at', { ascending: false });

    if (postsError) {
      console.error('Error fetching posts:', postsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch posts' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      posts: posts || [],
    });

  } catch (error) {
    console.error('Error in GET /api/notice-board/posts:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
