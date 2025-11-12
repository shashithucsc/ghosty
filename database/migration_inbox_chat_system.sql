-- =============================================
-- Ghosty Inbox Requests & Chat System Migration
-- =============================================
-- This migration creates the tables and logic for:
-- 1. Inbox requests (message request system)
-- 2. Conversations (chat sessions between users)
-- 3. Messages (individual chat messages)
-- 4. User blocking (prevent communication)
-- =============================================

-- =============================================
-- 1. INBOX REQUESTS TABLE
-- =============================================
-- Stores message requests sent from one user to another
CREATE TABLE IF NOT EXISTS inbox_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
    message TEXT, -- Optional initial message with the request
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT different_users CHECK (sender_id != recipient_id),
    CONSTRAINT unique_request UNIQUE (sender_id, recipient_id)
);

-- Indexes for inbox_requests
CREATE INDEX idx_inbox_requests_sender ON inbox_requests(sender_id);
CREATE INDEX idx_inbox_requests_recipient ON inbox_requests(recipient_id);
CREATE INDEX idx_inbox_requests_status ON inbox_requests(status);
CREATE INDEX idx_inbox_requests_created_at ON inbox_requests(created_at DESC);

-- Trigger to update updated_at
CREATE TRIGGER update_inbox_requests_updated_at
    BEFORE UPDATE ON inbox_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 2. CONVERSATIONS TABLE
-- =============================================
-- Stores conversations between two users
-- Only created when inbox request is accepted
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user1_unread_count INTEGER DEFAULT 0,
    user2_unread_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints to ensure user1_id is always less than user2_id
    -- This prevents duplicate conversations (A-B vs B-A)
    CONSTRAINT different_users CHECK (user1_id != user2_id),
    CONSTRAINT ordered_users CHECK (user1_id < user2_id),
    CONSTRAINT unique_conversation UNIQUE (user1_id, user2_id)
);

-- Indexes for conversations
CREATE INDEX idx_conversations_user1 ON conversations(user1_id);
CREATE INDEX idx_conversations_user2 ON conversations(user2_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

-- Trigger to update updated_at
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 3. MESSAGES TABLE
-- =============================================
-- Stores individual chat messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for messages
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_is_read ON messages(is_read) WHERE is_read = FALSE;
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at DESC);

-- Trigger to update updated_at
CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update conversation last_message_at and unread counts
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
DECLARE
    recipient_id UUID;
BEGIN
    -- Determine the recipient (the other user in the conversation)
    SELECT CASE 
        WHEN c.user1_id = NEW.sender_id THEN c.user2_id
        ELSE c.user1_id
    END INTO recipient_id
    FROM conversations c
    WHERE c.id = NEW.conversation_id;
    
    -- Update conversation last_message_at and increment unread count
    UPDATE conversations
    SET 
        last_message_at = NEW.created_at,
        user1_unread_count = CASE 
            WHEN user1_id = recipient_id THEN user1_unread_count + 1
            ELSE user1_unread_count
        END,
        user2_unread_count = CASE 
            WHEN user2_id = recipient_id THEN user2_unread_count + 1
            ELSE user2_unread_count
        END
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_on_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_on_message();

-- =============================================
-- 4. HELPER FUNCTIONS
-- =============================================

-- Function to check if inbox request exists and is accepted
CREATE OR REPLACE FUNCTION is_inbox_request_accepted(sender UUID, recipient UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM inbox_requests
        WHERE ((sender_id = sender AND recipient_id = recipient) OR 
               (sender_id = recipient AND recipient_id = sender))
        AND status = 'accepted'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get conversation between two users
CREATE OR REPLACE FUNCTION get_conversation_id(user_a UUID, user_b UUID)
RETURNS UUID AS $$
DECLARE
    u1 UUID;
    u2 UUID;
    conv_id UUID;
BEGIN
    -- Order users to match table constraint
    IF user_a < user_b THEN
        u1 := user_a;
        u2 := user_b;
    ELSE
        u1 := user_b;
        u2 := user_a;
    END IF;
    
    SELECT id INTO conv_id
    FROM conversations
    WHERE user1_id = u1 AND user2_id = u2;
    
    RETURN conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create conversation (called when request is accepted)
CREATE OR REPLACE FUNCTION create_conversation(user_a UUID, user_b UUID)
RETURNS UUID AS $$
DECLARE
    u1 UUID;
    u2 UUID;
    conv_id UUID;
BEGIN
    -- Order users to match table constraint
    IF user_a < user_b THEN
        u1 := user_a;
        u2 := user_b;
    ELSE
        u1 := user_b;
        u2 := user_a;
    END IF;
    
    -- Try to get existing conversation
    SELECT id INTO conv_id
    FROM conversations
    WHERE user1_id = u1 AND user2_id = u2;
    
    -- Create if doesn't exist
    IF conv_id IS NULL THEN
        INSERT INTO conversations (user1_id, user2_id)
        VALUES (u1, u2)
        RETURNING id INTO conv_id;
    END IF;
    
    RETURN conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(conv_id UUID, reader_id UUID)
RETURNS INTEGER AS $$
DECLARE
    rows_updated INTEGER;
BEGIN
    UPDATE messages
    SET 
        is_read = TRUE,
        read_at = NOW()
    WHERE 
        conversation_id = conv_id
        AND sender_id != reader_id
        AND is_read = FALSE;
    
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    
    -- Reset unread count for the reader
    UPDATE conversations
    SET 
        user1_unread_count = CASE 
            WHEN user1_id = reader_id THEN 0
            ELSE user1_unread_count
        END,
        user2_unread_count = CASE 
            WHEN user2_id = reader_id THEN 0
            ELSE user2_unread_count
        END
    WHERE id = conv_id;
    
    RETURN rows_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_count(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    total_unread INTEGER;
BEGIN
    SELECT 
        COALESCE(SUM(
            CASE 
                WHEN user1_id = user_uuid THEN user1_unread_count
                WHEN user2_id = user_uuid THEN user2_unread_count
                ELSE 0
            END
        ), 0) INTO total_unread
    FROM conversations
    WHERE user1_id = user_uuid OR user2_id = user_uuid;
    
    RETURN total_unread;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE inbox_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies for inbox_requests
-- =============================================

-- Users can view requests they sent or received
CREATE POLICY "Users can view their inbox requests"
    ON inbox_requests FOR SELECT
    USING (
        auth.uid() = sender_id OR 
        auth.uid() = recipient_id
    );

-- Users can send inbox requests (but not to themselves)
CREATE POLICY "Users can send inbox requests"
    ON inbox_requests FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id AND
        sender_id != recipient_id AND
        NOT is_user_blocked(sender_id, recipient_id)
    );

-- Only recipients can update request status
CREATE POLICY "Recipients can update request status"
    ON inbox_requests FOR UPDATE
    USING (auth.uid() = recipient_id)
    WITH CHECK (auth.uid() = recipient_id);

-- Users can delete requests they sent (before acceptance)
CREATE POLICY "Senders can delete pending requests"
    ON inbox_requests FOR DELETE
    USING (
        auth.uid() = sender_id AND
        status = 'pending'
    );

-- =============================================
-- RLS Policies for conversations
-- =============================================

-- Users can view conversations they're part of
CREATE POLICY "Users can view their conversations"
    ON conversations FOR SELECT
    USING (
        auth.uid() = user1_id OR 
        auth.uid() = user2_id
    );

-- Conversations are created by the system (via function)
-- No direct INSERT policy needed

-- Users can update their own unread counts
CREATE POLICY "Users can update conversation metadata"
    ON conversations FOR UPDATE
    USING (
        auth.uid() = user1_id OR 
        auth.uid() = user2_id
    )
    WITH CHECK (
        auth.uid() = user1_id OR 
        auth.uid() = user2_id
    );

-- =============================================
-- RLS Policies for messages
-- =============================================

-- Users can view messages in their conversations
CREATE POLICY "Users can view their messages"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = messages.conversation_id
            AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
        )
    );

-- Users can send messages to conversations they're part of
CREATE POLICY "Users can send messages"
    ON messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM conversations
            WHERE conversations.id = conversation_id
            AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
        )
    );

-- Users can update messages they sent (e.g., mark as edited)
CREATE POLICY "Users can update their messages"
    ON messages FOR UPDATE
    USING (auth.uid() = sender_id)
    WITH CHECK (auth.uid() = sender_id);

-- Users can delete messages they sent
CREATE POLICY "Users can delete their messages"
    ON messages FOR DELETE
    USING (auth.uid() = sender_id);

-- =============================================
-- 6. ADDITIONAL CONSTRAINTS & VALIDATION
-- =============================================

-- Ensure message content is not empty
ALTER TABLE messages
ADD CONSTRAINT message_content_not_empty 
CHECK (LENGTH(TRIM(content)) > 0);

-- Ensure message content is not too long (max 5000 characters)
ALTER TABLE messages
ADD CONSTRAINT message_content_max_length 
CHECK (LENGTH(content) <= 5000);

-- Ensure initial request message is not too long
ALTER TABLE inbox_requests
ADD CONSTRAINT request_message_max_length 
CHECK (message IS NULL OR LENGTH(message) <= 1000);

-- =============================================
-- 7. INDEXES FOR PERFORMANCE
-- =============================================

-- Composite index for finding user's conversations with unread messages
CREATE INDEX idx_conversations_user1_unread 
ON conversations(user1_id, user1_unread_count) 
WHERE user1_unread_count > 0;

CREATE INDEX idx_conversations_user2_unread 
ON conversations(user2_id, user2_unread_count) 
WHERE user2_unread_count > 0;

-- Index for finding pending inbox requests
CREATE INDEX idx_inbox_requests_recipient_pending 
ON inbox_requests(recipient_id, created_at DESC) 
WHERE status = 'pending';

-- =============================================
-- 8. COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE inbox_requests IS 'Stores message requests sent from one user to another';
COMMENT ON TABLE conversations IS 'Stores active chat conversations between two users';
COMMENT ON TABLE messages IS 'Stores individual chat messages within conversations';

COMMENT ON COLUMN inbox_requests.status IS 'Status of the request: pending, accepted, or rejected';
COMMENT ON COLUMN conversations.user1_id IS 'Always the smaller UUID to prevent duplicates';
COMMENT ON COLUMN conversations.user2_id IS 'Always the larger UUID to prevent duplicates';
COMMENT ON COLUMN conversations.last_message_at IS 'Timestamp of the most recent message';
COMMENT ON COLUMN messages.is_read IS 'Whether the recipient has read this message';

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
-- Next steps:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Verify tables created: inbox_requests, conversations, messages
-- 3. Test helper functions work correctly
-- 4. Deploy API routes for inbox and chat
-- =============================================
