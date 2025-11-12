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

const GetChatsQuerySchema = z.object({
  conversationId: z.string().uuid('Invalid conversation ID format'),
  userId: z.string().uuid('Invalid user ID format'),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

const SendMessageSchema = z.object({
  conversationId: z.string().uuid('Invalid conversation ID format'),
  senderId: z.string().uuid('Invalid sender ID format'),
  receiverId: z.string().uuid('Invalid receiver ID format'),
  message: z.string().min(1, 'Message cannot be empty').max(5000, 'Message too long'),
});

// =============================================
// GET /api/chats - Get messages in a conversation
// =============================================
export async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryData = {
      conversationId: searchParams.get('conversationId'),
      userId: searchParams.get('userId'),
      limit: searchParams.get('limit') || '50',
    };

    const validatedQuery = GetChatsQuerySchema.parse(queryData);
    const { conversationId, userId, limit } = validatedQuery;

    // TODO: Add JWT authentication check here
    // Verify that the authenticated user matches userId

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

    // Get all messages in this conversation
    const { data: chats, error: chatsError } = await supabase
      .from('chats')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (chatsError) {
      console.error('Error fetching chats:', chatsError);
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    // Verify user is participant in this conversation
    const isParticipant = chats.some(
      (chat) => chat.sender_id === userId || chat.receiver_id === userId
    );

    if (chats.length > 0 && !isParticipant) {
      return NextResponse.json(
        { error: 'You are not a participant in this conversation' },
        { status: 403 }
      );
    }

    // Transform to frontend format
    const messages = chats.map((chat) => ({
      id: chat.id,
      senderId: chat.sender_id,
      receiverId: chat.receiver_id,
      text: chat.message,
      timestamp: chat.created_at,
      isOwn: chat.sender_id === userId,
    }));

    return NextResponse.json({
      success: true,
      messages,
      conversationId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error in GET /api/chats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================
// POST /api/chats - Send a new message
// =============================================
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedBody = SendMessageSchema.parse(body);
    const { conversationId, senderId, receiverId, message } = validatedBody;

    // TODO: Add JWT authentication check here
    // Verify that the authenticated user matches senderId

    // Verify both users exist
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .in('id', [senderId, receiverId]);

    if (usersError || !users || users.length !== 2) {
      return NextResponse.json(
        { error: 'One or both users not found' },
        { status: 404 }
      );
    }

    // Check if either user has blocked the other
    const { data: blockExists, error: blockError } = await supabase
      .from('blocks')
      .select('id')
      .or(`and(blocker_id.eq.${senderId},blocked_id.eq.${receiverId}),and(blocker_id.eq.${receiverId},blocked_id.eq.${senderId})`)
      .maybeSingle();

    if (blockError) {
      console.error('Error checking blocks:', blockError);
    }

    if (blockExists) {
      console.log(`Block detected: Cannot send message between users ${senderId} and ${receiverId}`);
      return NextResponse.json(
        { 
          error: 'Cannot send message. One user has blocked the other.',
          details: 'A block exists between these users preventing communication.'
        },
        { status: 403 }
      );
    }

    // Insert the message into chats table
    const { data: newChat, error: insertError } = await supabase
      .from('chats')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        receiver_id: receiverId,
        message: message,
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('Error inserting message:', insertError);
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }

    // Transform to frontend format
    const responseMessage = {
      id: newChat.id,
      senderId: newChat.sender_id,
      receiverId: newChat.receiver_id,
      text: newChat.message,
      timestamp: newChat.created_at,
      isOwn: true,
    };

    return NextResponse.json({
      success: true,
      message: responseMessage,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error in POST /api/chats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
