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

const SendRequestSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  recipientId: z.string().uuid('Invalid recipient ID format'),
  message: z.string().max(1000, 'Message too long (max 1000 characters)').optional(),
});

const UpdateRequestSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  requestId: z.string().uuid('Invalid request ID format'),
  action: z.enum(['accept', 'reject'], { message: 'Action must be either "accept" or "reject"' }),
});

const GetRequestsQuerySchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  type: z.enum(['received', 'sent', 'all']).optional().default('all'),
  status: z.enum(['pending', 'accepted', 'rejected', 'all']).optional().default('all'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

// =============================================
// GET /api/inbox/requests - List inbox requests
// =============================================
export async function GET(request: NextRequest) {
  try {
    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryData = {
      userId: searchParams.get('userId'),
      type: searchParams.get('type') || 'all',
      status: searchParams.get('status') || 'all',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    };

    const validatedQuery = GetRequestsQuerySchema.parse(queryData);
    const { userId, type, status, page, limit } = validatedQuery;

    // TODO: Add JWT authentication check here
    // Verify that the authenticated user matches userId

    // Build query based on type (received/sent/all)
    let query = supabase
      .from('inbox_requests')
      .select(`
        id,
        sender_id,
        receiver_id,
        status,
        created_at
      `)
      .order('created_at', { ascending: false });

    // Filter by type
    if (type === 'received') {
      query = query.eq('receiver_id', userId);
    } else if (type === 'sent') {
      query = query.eq('sender_id', userId);
    } else {
      // all - requests where user is either sender or receiver
      query = query.or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
    }

    // Filter by status
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: requests, error } = await query;

    if (error) {
      console.error('Error fetching inbox requests:', error);
      return NextResponse.json(
        { error: 'Failed to fetch inbox requests' },
        { status: 500 }
      );
    }

    // Enrich with sender profile data
    const enrichedRequests = await Promise.all(
      (requests || []).map(async (req) => {
        // Get sender's profile
        const { data: senderProfile } = await supabase
          .from('profiles')
          .select('anonymous_name, gender, verified, avatar')
          .eq('user_id', req.sender_id)
          .single();

        // Get sender's user data
        const { data: senderUser } = await supabase
          .from('users')
          .select('username, gender, university_name')
          .eq('id', req.sender_id)
          .single();

        return {
          ...req,
          sender: {
            id: req.sender_id,
            username: senderUser?.username,
            profiles: {
              full_name: senderProfile?.anonymous_name || 'Anonymous',
              avatar_url: senderProfile?.avatar || '👤',
              verification_status: senderProfile?.verified || false,
            },
          },
        };
      })
    );

    // Get total count for pagination
    let countQuery = supabase
      .from('inbox_requests')
      .select('id', { count: 'exact', head: true });

    if (type === 'received') {
      countQuery = countQuery.eq('receiver_id', userId);
    } else if (type === 'sent') {
      countQuery = countQuery.eq('sender_id', userId);
    } else {
      countQuery = countQuery.or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
    }

    if (status !== 'all') {
      countQuery = countQuery.eq('status', status);
    }

    const { count } = await countQuery;

    return NextResponse.json({
      success: true,
      requests: enrichedRequests,
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

    console.error('Error in GET /api/inbox/requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================
// POST /api/inbox/requests - Send inbox request
// =============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = SendRequestSchema.parse(body);
    const { userId, recipientId, message } = validatedData;

    // TODO: Add JWT authentication check here
    // Verify that the authenticated user matches userId

    // Validate users exist
    const { data: sender, error: senderError } = await supabase
      .from('users')
      .select('id, username')
      .eq('id', userId)
      .single();

    if (senderError || !sender) {
      return NextResponse.json(
        { error: 'Sender not found' },
        { status: 404 }
      );
    }

    const { data: recipient, error: recipientError } = await supabase
      .from('users')
      .select('id, username')
      .eq('id', recipientId)
      .single();

    if (recipientError || !recipient) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      );
    }

    // Check if users are the same
    if (userId === recipientId) {
      return NextResponse.json(
        { error: 'Cannot send request to yourself' },
        { status: 400 }
      );
    }

    // Check if either user has blocked the other
    const { data: blockExists } = await supabase
      .from('blocks')
      .select('id')
      .or(`and(blocker_id.eq.${userId},blocked_id.eq.${recipientId}),and(blocker_id.eq.${recipientId},blocked_id.eq.${userId})`)
      .single();

    if (blockExists) {
      return NextResponse.json(
        { error: 'Cannot send request to this user' },
        { status: 403 }
      );
    }

    // Check if request already exists
    const { data: existingRequest } = await supabase
      .from('inbox_requests')
      .select('id, status')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${userId})`)
      .single();

    if (existingRequest) {
      if (existingRequest.status === 'accepted') {
        return NextResponse.json(
          { error: 'Request already accepted. You can start chatting!' },
          { status: 409 }
        );
      } else if (existingRequest.status === 'pending') {
        return NextResponse.json(
          { error: 'Request already pending' },
          { status: 409 }
        );
      }
      // If rejected, we could allow sending a new request
      // For now, return error
      return NextResponse.json(
        { error: 'Previous request was rejected' },
        { status: 409 }
      );
    }

    // Create inbox request
    const { data: newRequest, error: createError } = await supabase
      .from('inbox_requests')
      .insert({
        sender_id: userId,
        receiver_id: recipientId,
        status: 'pending',
      })
      .select(`
        id,
        sender_id,
        receiver_id,
        status,
        created_at
      `)
      .single();

    if (createError) {
      console.error('Error creating inbox request:', createError);
      return NextResponse.json(
        { error: 'Failed to create inbox request' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Inbox request sent successfully',
      request: newRequest,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error in POST /api/inbox/requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================
// PATCH /api/inbox/requests - Accept/Reject request
// =============================================
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = UpdateRequestSchema.parse(body);
    const { userId, requestId, action } = validatedData;

    // TODO: Add JWT authentication check here
    // Verify that the authenticated user matches userId

    // Get the request
    const { data: inboxRequest, error: fetchError } = await supabase
      .from('inbox_requests')
      .select('id, sender_id, receiver_id, status')
      .eq('id', requestId)
      .single();

    if (fetchError || !inboxRequest) {
      return NextResponse.json(
        { error: 'Inbox request not found' },
        { status: 404 }
      );
    }

    // Verify user is the receiver
    if (inboxRequest.receiver_id !== userId) {
      return NextResponse.json(
        { error: 'Only the receiver can accept or reject this request' },
        { status: 403 }
      );
    }

    // Check if request is already processed
    if (inboxRequest.status !== 'pending') {
      return NextResponse.json(
        { error: `Request already ${inboxRequest.status}` },
        { status: 409 }
      );
    }

    // Update request status
    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    const { data: updatedRequest, error: updateError } = await supabase
      .from('inbox_requests')
      .update({ status: newStatus })
      .eq('id', requestId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating inbox request:', updateError);
      return NextResponse.json(
        { error: 'Failed to update inbox request' },
        { status: 500 }
      );
    }

    // If accepted, create initial chat record
    let conversationId = null;
    if (action === 'accept') {
      conversationId = crypto.randomUUID();

      // Create a system message to mark the start of the conversation
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .insert({
          conversation_id: conversationId,
          sender_id: inboxRequest.sender_id,
          receiver_id: inboxRequest.receiver_id,
          message: '🎉 Chat request accepted! Start your conversation here.',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (chatError) {
        console.error('❌ FAILED TO CREATE CHAT RECORD:', chatError);
        console.error('Chat data attempted:', {
          conversation_id: conversationId,
          sender_id: inboxRequest.sender_id,
          receiver_id: inboxRequest.receiver_id,
        });
        // Don't fail the request, just log the error
      } else {
        console.log('✅ Chat record created successfully:', chatData);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Request ${newStatus}`,
      request: updatedRequest,
      conversationId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error in PATCH /api/inbox/requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
