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

const CheckBlockSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  otherUserId: z.string().uuid('Invalid other user ID format'),
});

// =============================================
// GET /api/blocks/check - Check if users have blocked each other
// =============================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryData = {
      userId: searchParams.get('userId'),
      otherUserId: searchParams.get('otherUserId'),
    };

    const validatedQuery = CheckBlockSchema.parse(queryData);
    const { userId, otherUserId } = validatedQuery;

    // Check if userId has blocked otherUserId
    const { data: userBlockedOther, error: userBlockError } = await supabase
      .from('blocks')
      .select('id, reason, created_at')
      .eq('blocker_id', userId)
      .eq('blocked_id', otherUserId)
      .maybeSingle();

    if (userBlockError && userBlockError.code !== 'PGRST116') {
      console.error('Error checking user block:', userBlockError);
      return NextResponse.json(
        { error: 'Failed to check block status' },
        { status: 500 }
      );
    }

    // Check if otherUserId has blocked userId
    const { data: otherBlockedUser, error: otherBlockError } = await supabase
      .from('blocks')
      .select('id, reason, created_at')
      .eq('blocker_id', otherUserId)
      .eq('blocked_id', userId)
      .maybeSingle();

    if (otherBlockError && otherBlockError.code !== 'PGRST116') {
      console.error('Error checking other user block:', otherBlockError);
      return NextResponse.json(
        { error: 'Failed to check block status' },
        { status: 500 }
      );
    }

    // Determine block status
    let blockStatus = {
      isBlocked: false,
      blockedBy: null as 'you' | 'them' | null,
      reason: null as string | null,
      blockedAt: null as string | null,
      canSendMessages: true,
    };

    if (userBlockedOther) {
      blockStatus = {
        isBlocked: true,
        blockedBy: 'you',
        reason: userBlockedOther.reason,
        blockedAt: userBlockedOther.created_at,
        canSendMessages: false,
      };
    } else if (otherBlockedUser) {
      blockStatus = {
        isBlocked: true,
        blockedBy: 'them',
        reason: otherBlockedUser.reason,
        blockedAt: otherBlockedUser.created_at,
        canSendMessages: false,
      };
    }

    return NextResponse.json({
      success: true,
      blockStatus,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error in GET /api/blocks/check:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
