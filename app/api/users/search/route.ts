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

const SearchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  userId: z.string().uuid('Invalid user ID format'),
});

// =============================================
// GET /api/users/search - Search users by username
// =============================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryData = {
      q: searchParams.get('q'),
      userId: searchParams.get('userId'),
    };

    const validatedQuery = SearchQuerySchema.parse(queryData);
    const { q: searchQuery, userId } = validatedQuery;

    // Get list of users that the current user has blocked or been blocked by
    const { data: blocks, error: blocksError } = await supabase
      .from('blocks')
      .select('blocker_id, blocked_id')
      .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);

    if (blocksError) {
      console.error('Error fetching blocks:', blocksError);
    }

    // Extract blocked user IDs (users who blocked current user OR current user blocked)
    const blockedUserIds = new Set<string>();
    blocks?.forEach(block => {
      if (block.blocker_id === userId) {
        blockedUserIds.add(block.blocked_id);
      } else {
        blockedUserIds.add(block.blocker_id);
      }
    });

    // Search users by username (case-insensitive)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, birthday, gender')
      .ilike('username', `%${searchQuery}%`)
      .eq('is_restricted', false)
      .limit(10);

    if (usersError) {
      console.error('Error searching users:', usersError);
      return NextResponse.json(
        { error: 'Failed to search users' },
        { status: 500 }
      );
    }

    // Get profiles for matched users
    const userIds = users?.map(u => u.id) || [];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, anonymous_avatar_url, dob')
      .in('user_id', userIds);

    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    // Filter out blocked users and current user, then format results
    const results = users
      ?.filter(user => user.id !== userId && !blockedUserIds.has(user.id))
      .map(user => {
        const profile = profileMap.get(user.id);
        
        // Calculate age
        let age = null;
        const birthday = user.birthday || profile?.dob;
        if (birthday) {
          const birthDate = new Date(birthday);
          const today = new Date();
          age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
        }

        return {
          id: user.id,
          username: user.username,
          avatar: profile?.anonymous_avatar_url || '👤',
          age: age,
          gender: user.gender,
        };
      }) || [];

    return NextResponse.json({
      success: true,
      users: results,
      count: results.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error in GET /api/users/search:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
