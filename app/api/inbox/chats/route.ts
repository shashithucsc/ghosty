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
  userId: z.string().uuid('Invalid user ID format'),
});

// =============================================
// GET /api/inbox/chats - Get user's active chats
// =============================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryData = {
      userId: searchParams.get('userId'),
    };

    const validatedQuery = GetChatsQuerySchema.parse(queryData);
    const { userId } = validatedQuery;

    // Get all chats where user is sender or receiver
    const { data: allChats, error: chatsError } = await supabase
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

    console.log(`📬 Fetched ${allChats?.length || 0} chat records for user ${userId}`);
    if (allChats && allChats.length > 0) {
      console.log('First chat record:', allChats[0]);
    }

    // Group by conversation_id and get latest message for each
    const conversationsMap = new Map();

    for (const chat of allChats || []) {
      const convId = chat.conversation_id;
      const otherUserId = chat.sender_id === userId ? chat.receiver_id : chat.sender_id;

      if (!conversationsMap.has(convId)) {
        conversationsMap.set(convId, {
          conversationId: convId,
          otherUserId: otherUserId,
          lastMessage: chat.message,
          lastMessageTime: chat.created_at,
          unreadCount: 0, // TODO: Implement unread count
        });
      }
    }

    // Convert to array and enrich with user data
    const conversations = Array.from(conversationsMap.values());

    const enrichedConversations = await Promise.all(
      conversations.map(async (conv) => {
        // Get other user's profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('anonymous_name, avatar, verified')
          .eq('user_id', conv.otherUserId)
          .single();

        // Get other user's data
        const { data: user } = await supabase
          .from('users')
          .select('username, gender')
          .eq('id', conv.otherUserId)
          .single();

        return {
          id: conv.conversationId,
          conversationId: conv.conversationId,
          otherUser: {
            id: conv.otherUserId,
            anonymousName: profile?.anonymous_name || user?.username || 'Anonymous',
            avatar: profile?.avatar || '👤',
            verified: profile?.verified || false,
            gender: user?.gender || 'Unknown',
          },
          lastMessage: conv.lastMessage,
          lastMessageTime: conv.lastMessageTime,
          unreadCount: conv.unreadCount,
        };
      })
    );

    return NextResponse.json({
      success: true,
      chats: enrichedConversations,
      count: enrichedConversations.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error in GET /api/inbox/chats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
