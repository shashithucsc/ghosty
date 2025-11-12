import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Initialize Supabase client with service role (for admin operations)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// =============================================
// ZOD VALIDATION SCHEMAS
// =============================================

const GetMessagesQuerySchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  conversationId: z.string().uuid('Invalid conversation ID format'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  markAsRead: z.coerce.boolean().optional().default(false),
});

const SendMessageSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  conversationId: z.string().uuid('Invalid conversation ID format'),
  content: z.string()
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message too long (max 5000 characters)')
    .refine((val) => val.trim().length > 0, 'Message cannot be only whitespace'),
});

// =============================================
// GET /api/chat - Get messages in a conversation
// =============================================
export async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryData = {
      userId: searchParams.get('userId'),
      conversationId: searchParams.get('conversationId'),
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '50',
      markAsRead: searchParams.get('markAsRead') || 'false',
    };

    const validatedQuery = GetMessagesQuerySchema.parse(queryData);
    const { userId, conversationId, page, limit, markAsRead } = validatedQuery;

    // TODO: Add JWT authentication check here
    // Verify that the authenticated user matches userId

    // Verify user is part of the conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id, user1_id, user2_id')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Check if user is a participant
    const isParticipant = conversation.user1_id === userId || conversation.user2_id === userId;
    if (!isParticipant) {
      return NextResponse.json(
        { error: 'You are not a participant in this conversation' },
        { status: 403 }
      );
    }

    // Get other user ID
    const otherUserId = conversation.user1_id === userId 
      ? conversation.user2_id 
      : conversation.user1_id;

    // Check if either user has blocked the other
    const { data: blockExists } = await supabase
      .from('blocks')
      .select('id')
      .or(`and(blocker_id.eq.${userId},blocked_id.eq.${otherUserId}),and(blocker_id.eq.${otherUserId},blocked_id.eq.${userId})`)
      .single();

    if (blockExists) {
      return NextResponse.json(
        { error: 'Cannot view messages with this user' },
        { status: 403 }
      );
    }

    // Mark messages as read if requested
    if (markAsRead) {
      const { data: markedCount, error: markError } = await supabase
        .rpc('mark_messages_as_read', {
          conv_id: conversationId,
          reader_id: userId,
        });

      if (markError) {
        console.error('Error marking messages as read:', markError);
        // Non-critical error, continue to fetch messages
      }
    }

    // Fetch messages with pagination (newest first)
    const offset = (page - 1) * limit;
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        is_read,
        read_at,
        created_at,
        updated_at,
        sender:users!messages_sender_id_fkey(
          id,
          username,
          profiles(full_name, avatar_url)
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('conversation_id', conversationId);

    return NextResponse.json({
      success: true,
      messages: messages.reverse(), // Return oldest first for chat display
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

    console.error('Error in GET /api/chat:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================
// POST /api/chat - Send a message
// =============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = SendMessageSchema.parse(body);
    const { userId, conversationId, content } = validatedData;

    // TODO: Add JWT authentication check here
    // Verify that the authenticated user matches userId

    // Verify conversation exists and user is a participant
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id, user1_id, user2_id')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Check if user is a participant
    const isParticipant = conversation.user1_id === userId || conversation.user2_id === userId;
    if (!isParticipant) {
      return NextResponse.json(
        { error: 'You are not a participant in this conversation' },
        { status: 403 }
      );
    }

    // Get other user ID
    const otherUserId = conversation.user1_id === userId 
      ? conversation.user2_id 
      : conversation.user1_id;

    // Check if either user has blocked the other
    const { data: blockExists } = await supabase
      .from('blocks')
      .select('id')
      .or(`and(blocker_id.eq.${userId},blocked_id.eq.${otherUserId}),and(blocker_id.eq.${otherUserId},blocked_id.eq.${userId})`)
      .single();

    if (blockExists) {
      return NextResponse.json(
        { error: 'Cannot send messages to this user' },
        { status: 403 }
      );
    }

    // Verify inbox request is accepted
    const { data: inboxRequest, error: requestError } = await supabase
      .from('inbox_requests')
      .select('id, status')
      .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
      .single();

    if (requestError || !inboxRequest || inboxRequest.status !== 'accepted') {
      return NextResponse.json(
        { error: 'Inbox request must be accepted before sending messages' },
        { status: 403 }
      );
    }

    // Create message
    const { data: newMessage, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        content: content.trim(),
        is_read: false,
      })
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        is_read,
        read_at,
        created_at,
        updated_at,
        sender:users!messages_sender_id_fkey(
          id,
          username,
          profiles(full_name, avatar_url)
        )
      `)
      .single();

    if (messageError) {
      console.error('Error creating message:', messageError);
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error in POST /api/chat:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================
// DELETE /api/chat - Delete a message
// =============================================
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const messageId = searchParams.get('messageId');

    if (!userId || !messageId) {
      return NextResponse.json(
        { error: 'Missing userId or messageId' },
        { status: 400 }
      );
    }

    // Validate UUIDs
    const uuidSchema = z.string().uuid();
    uuidSchema.parse(userId);
    uuidSchema.parse(messageId);

    // TODO: Add JWT authentication check here
    // Verify that the authenticated user matches userId

    // Get the message
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('id, sender_id, conversation_id')
      .eq('id', messageId)
      .single();

    if (fetchError || !message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Verify user is the sender
    if (message.sender_id !== userId) {
      return NextResponse.json(
        { error: 'You can only delete your own messages' },
        { status: 403 }
      );
    }

    // Delete the message
    const { error: deleteError } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (deleteError) {
      console.error('Error deleting message:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete message' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid UUID format', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error in DELETE /api/chat:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
