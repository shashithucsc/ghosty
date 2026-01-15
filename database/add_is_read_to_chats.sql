-- =============================================
-- Add is_read tracking to chats table
-- =============================================

-- Add is_read column to track if message has been read
ALTER TABLE public.chats 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;

-- Add read_at column to track when message was read
ALTER TABLE public.chats 
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries on unread messages
CREATE INDEX IF NOT EXISTS idx_chats_is_read 
ON public.chats(is_read) 
WHERE is_read = FALSE;

-- Create composite index for conversation + read status
CREATE INDEX IF NOT EXISTS idx_chats_conversation_read 
ON public.chats(conversation_id, receiver_id, is_read);

-- Update existing messages sent to a user as unread (default behavior)
-- This ensures consistency with new records
UPDATE public.chats 
SET is_read = FALSE 
WHERE is_read IS NULL;

COMMENT ON COLUMN public.chats.is_read IS 'Whether the receiver has read this message';
COMMENT ON COLUMN public.chats.read_at IS 'Timestamp when the message was marked as read';

-- =============================================
-- Add missing columns to inbox_requests table
-- =============================================

-- Add conversation_id to link accepted requests to conversations
ALTER TABLE public.inbox_requests 
ADD COLUMN IF NOT EXISTS conversation_id UUID;

-- Add message column for optional initial message
ALTER TABLE public.inbox_requests 
ADD COLUMN IF NOT EXISTS message TEXT;

-- Add updated_at for tracking when status changes
ALTER TABLE public.inbox_requests 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_inbox_requests_status 
ON public.inbox_requests(status);

-- Create index on sender for faster lookups
CREATE INDEX IF NOT EXISTS idx_inbox_sender 
ON public.inbox_requests(sender_id);

COMMENT ON COLUMN public.inbox_requests.conversation_id IS 'Link to conversation when request is accepted';
COMMENT ON COLUMN public.inbox_requests.message IS 'Optional initial message with the request';
