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

const BlockUserSchema = z.object({
  blockerId: z.string().uuid('Invalid blocker ID format'),
  blockedId: z.string().uuid('Invalid blocked user ID format'),
  reason: z.string().max(500, 'Reason too long (max 500 characters)').optional(),
});

const UnblockUserSchema = z.object({
  blockerId: z.string().uuid('Invalid blocker ID format'),
  blockedId: z.string().uuid('Invalid blocked user ID format'),
});

const GetBlocksQuerySchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

// =============================================
// POST /api/blocks - Block a user
// =============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = BlockUserSchema.parse(body);
    const { blockerId, blockedId, reason } = validatedData;

    // TODO: Add JWT authentication check here
    // Verify that the authenticated user matches blockerId

    // Verify blocker exists
    const { data: blocker, error: blockerError } = await supabase
      .from('users')
      .select('id')
      .eq('id', blockerId)
      .single();

    if (blockerError || !blocker) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify blocked user exists
    const { data: blocked, error: blockedError } = await supabase
      .from('users')
      .select('id, username')
      .eq('id', blockedId)
      .single();

    if (blockedError || !blocked) {
      return NextResponse.json(
        { error: 'User to block not found' },
        { status: 404 }
      );
    }

    // Check if already blocked
    const { data: existingBlock } = await supabase
      .from('blocks')
      .select('id')
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId)
      .single();

    if (existingBlock) {
      return NextResponse.json(
        { error: 'User is already blocked' },
        { status: 400 }
      );
    }

    // Create block
    const { data: newBlock, error: createError } = await supabase
      .from('blocks')
      .insert({
        blocker_id: blockerId,
        blocked_id: blockedId,
        reason: reason || null,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating block:', createError);
      return NextResponse.json(
        { error: 'Failed to block user' },
        { status: 500 }
      );
    }

    // Delete any existing conversations/chats between these users
    // This prevents further communication
    const { error: deleteChatsError } = await supabase
      .from('chats')
      .delete()
      .or(`and(sender_id.eq.${blockerId},receiver_id.eq.${blockedId}),and(sender_id.eq.${blockedId},receiver_id.eq.${blockerId})`);

    if (deleteChatsError) {
      console.error('Error deleting chats:', deleteChatsError);
      // Don't fail the block operation if chat deletion fails
    }

    return NextResponse.json({
      success: true,
      message: `You have blocked ${blocked.username}. They will no longer be able to contact you.`,
      block: {
        id: newBlock.id,
        blockedUser: {
          id: blocked.id,
          username: blocked.username,
        },
        createdAt: newBlock.created_at,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error in POST /api/blocks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================
// DELETE /api/blocks - Unblock a user
// =============================================
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const blockerId = searchParams.get('blockerId');
    const blockedId = searchParams.get('blockedId');

    if (!blockerId || !blockedId) {
      return NextResponse.json(
        { error: 'Missing blockerId or blockedId' },
        { status: 400 }
      );
    }

    const validatedData = UnblockUserSchema.parse({ blockerId, blockedId });

    // TODO: Add JWT authentication check here
    // Verify that the authenticated user matches blockerId

    // Find and delete the block
    const { data: block, error: fetchError } = await supabase
      .from('blocks')
      .select('id')
      .eq('blocker_id', validatedData.blockerId)
      .eq('blocked_id', validatedData.blockedId)
      .single();

    if (fetchError || !block) {
      return NextResponse.json(
        { error: 'Block not found' },
        { status: 404 }
      );
    }

    const { error: deleteError } = await supabase
      .from('blocks')
      .delete()
      .eq('id', block.id);

    if (deleteError) {
      console.error('Error deleting block:', deleteError);
      return NextResponse.json(
        { error: 'Failed to unblock user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User unblocked successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error in DELETE /api/blocks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================
// GET /api/blocks - Get user's blocked list
// =============================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryData = {
      userId: searchParams.get('userId'),
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    };

    const validatedQuery = GetBlocksQuerySchema.parse(queryData);
    const { userId, page, limit } = validatedQuery;

    // TODO: Add JWT authentication check here
    // Verify that the authenticated user matches userId

    // Get user's blocks
    const offset = (page - 1) * limit;
    const { data: blocks, error } = await supabase
      .from('blocks')
      .select(`
        id,
        blocker_id,
        blocked_id,
        reason,
        created_at,
        blocked_user:users!blocks_blocked_id_fkey(
          id,
          username,
          gender
        )
      `)
      .eq('blocker_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching blocks:', error);
      return NextResponse.json(
        { error: 'Failed to fetch blocked users' },
        { status: 500 }
      );
    }

    // Get total count
    const { count } = await supabase
      .from('blocks')
      .select('id', { count: 'exact', head: true })
      .eq('blocker_id', userId);

    return NextResponse.json({
      success: true,
      blocks,
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

    console.error('Error in GET /api/blocks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
