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

const GetConversationsQuerySchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  unreadOnly: z.coerce.boolean().optional().default(false),
});

const CreateConversationSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  otherUserId: z.string().uuid('Invalid other user ID format'),
});

// =============================================
// POST /api/conversations - Create or get existing conversation
// =============================================
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedBody = CreateConversationSchema.parse(body);
    const { userId, otherUserId } = validatedBody;

    // TODO: Add JWT authentication check here
    // Verify that the authenticated user matches userId

    // Verify both users exist
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .in('id', [userId, otherUserId]);

    if (usersError || !users || users.length !== 2) {
      return NextResponse.json(
        { error: 'One or both users not found' },
        { status: 404 }
      );
    }

    // Check if conversation already exists between these users in chats table
    const { data: existingChats, error: existingError } = await supabase
      .from('chats')
      .select('conversation_id')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
      .limit(1);

    if (existingError) {
      console.error('Error checking existing conversation:', existingError);
      return NextResponse.json(
        { error: 'Failed to check existing conversation' },
        { status: 500 }
      );
    }

    // If conversation exists, return the conversation_id
    if (existingChats && existingChats.length > 0) {
      return NextResponse.json({
        success: true,
        conversation: {
          id: existingChats[0].conversation_id,
        },
        isNew: false,
      });
    }

    // Create new conversation_id (UUID)
    const newConversationId = crypto.randomUUID();

    return NextResponse.json({
      success: true,
      conversation: {
        id: newConversationId,
      },
      isNew: true,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error in POST /api/conversations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================
// GET /api/conversations - List user's conversations
// =============================================
export async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryData = {
      userId: searchParams.get('userId'),
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      unreadOnly: searchParams.get('unreadOnly') || 'false',
    };

    const validatedQuery = GetConversationsQuerySchema.parse(queryData);
    const { userId, page, limit, unreadOnly } = validatedQuery;

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

    // Get all chats involving this user from chats table
    const { data: userChats, error: chatsError } = await supabase
      .from('chats')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (chatsError) {
      console.error('Error fetching chats:', chatsError);
      return NextResponse.json(
        { error: 'Failed to fetch chats' },
        { status: 500 }
      );
    }

    // Group chats by conversation_id and get the most recent message for each
    const conversationsMap = new Map();
    
    userChats.forEach((chat) => {
      const convId = chat.conversation_id;
      const otherUserId = chat.sender_id === userId ? chat.receiver_id : chat.sender_id;
      
      if (!conversationsMap.has(convId)) {
        conversationsMap.set(convId, {
          id: convId,
          otherUserId: otherUserId,
          lastMessage: {
            id: chat.id,
            sender_id: chat.sender_id,
            content: chat.message,
            created_at: chat.created_at,
          },
          lastMessageAt: chat.created_at,
          createdAt: chat.created_at,
        });
      }
    });

    // Convert map to array and paginate
    const allConversations = Array.from(conversationsMap.values());
    const offset = (page - 1) * limit;
    const paginatedConversations = allConversations.slice(offset, offset + limit);

    // Enrich with user data
    const enrichedConversations = await Promise.all(
      paginatedConversations.map(async (conv) => {
        // Get other user's profile
        const { data: otherUser } = await supabase
          .from('users')
          .select('id, username, gender, university_name, bio')
          .eq('id', conv.otherUserId)
          .single();

        return {
          id: conv.id,
          otherUser: otherUser || null,
          lastMessage: conv.lastMessage,
          unreadCount: 0, // TODO: Implement unread count if needed
          lastMessageAt: conv.lastMessageAt,
          createdAt: conv.createdAt,
        };
      })
    );

    const count = allConversations.length;
    const totalUnread = 0; // TODO: Implement unread count if needed

    return NextResponse.json({
      success: true,
      conversations: enrichedConversations,
      totalUnread,
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

    console.error('Error in GET /api/conversations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================
// DELETE /api/conversations - Delete a conversation
// =============================================
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const conversationId = searchParams.get('conversationId');

    if (!userId || !conversationId) {
      return NextResponse.json(
        { error: 'Missing userId or conversationId' },
        { status: 400 }
      );
    }

    // Validate UUIDs
    const uuidSchema = z.string().uuid();
    uuidSchema.parse(userId);
    uuidSchema.parse(conversationId);

    // TODO: Add JWT authentication check here
    // Verify that the authenticated user matches userId

    // Verify conversation exists and user is a participant
    const { data: chats, error: fetchError } = await supabase
      .from('chats')
      .select('id, sender_id, receiver_id')
      .eq('conversation_id', conversationId)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .limit(1);

    if (fetchError || !chats || chats.length === 0) {
      return NextResponse.json(
        { error: 'Conversation not found or you are not a participant' },
        { status: 404 }
      );
    }

    // Delete all chats in this conversation
    const { error: deleteError } = await supabase
      .from('chats')
      .delete()
      .eq('conversation_id', conversationId);

    if (deleteError) {
      console.error('Error deleting conversation:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete conversation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Conversation deleted successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid UUID format', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error in DELETE /api/conversations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
