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

const RecordSwipeSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  targetUserId: z.string().uuid('Invalid target user ID format'),
  action: z.enum(['skip', 'like'], { message: 'Action must be either "skip" or "like"' }),
});

const GetSwipesQuerySchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  action: z.enum(['skip', 'like', 'all']).optional().default('all'),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

// =============================================
// POST /api/swipes - Record a swipe action
// =============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = RecordSwipeSchema.parse(body);
    const { userId, targetUserId, action } = validatedData;

    // Verify users exist
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .in('id', [userId, targetUserId]);

    if (usersError || !users || users.length !== 2) {
      return NextResponse.json(
        { error: 'One or both users not found' },
        { status: 404 }
      );
    }

    // Check if users are the same
    if (userId === targetUserId) {
      return NextResponse.json(
        { error: 'Cannot swipe on yourself' },
        { status: 400 }
      );
    }

    // Check if swipe already exists
    const { data: existingSwipe } = await supabase
      .from('swipes')
      .select('id, action')
      .eq('user_id', userId)
      .eq('target_user_id', targetUserId)
      .maybeSingle();

    if (existingSwipe) {
      // Update existing swipe
      const { data: updatedSwipe, error: updateError } = await supabase
        .from('swipes')
        .update({ 
          action,
          created_at: new Date().toISOString(),
        })
        .eq('id', existingSwipe.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating swipe:', updateError);
        return NextResponse.json(
          { error: 'Failed to update swipe' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Swipe updated',
        swipe: updatedSwipe,
      });
    }

    // Create new swipe
    const { data: newSwipe, error: createError } = await supabase
      .from('swipes')
      .insert({
        user_id: userId,
        target_user_id: targetUserId,
        action,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating swipe:', createError);
      return NextResponse.json(
        { error: 'Failed to record swipe' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Swipe recorded',
      swipe: newSwipe,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error in POST /api/swipes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================
// GET /api/swipes - Get user's swipe history
// =============================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryData = {
      userId: searchParams.get('userId'),
      action: searchParams.get('action') || 'all',
      limit: searchParams.get('limit') || '50',
    };

    const validatedQuery = GetSwipesQuerySchema.parse(queryData);
    const { userId, action, limit } = validatedQuery;

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Build query
    let query = supabase
      .from('swipes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Filter by action
    if (action !== 'all') {
      query = query.eq('action', action);
    }

    const { data: swipes, error: swipesError } = await query;

    if (swipesError) {
      console.error('Error fetching swipes:', swipesError);
      return NextResponse.json(
        { error: 'Failed to fetch swipes' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      swipes: swipes || [],
      count: swipes?.length || 0,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error in GET /api/swipes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
