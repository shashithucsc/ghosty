-- =============================================
-- MIGRATION: Add foreign key constraints to chats table
-- =============================================
-- This adds missing foreign key constraints to ensure data integrity
-- for the chat messaging system.

BEGIN;

-- Add foreign key constraints to chats table
-- These ensure sender_id and receiver_id reference valid users in users_v2

ALTER TABLE public.chats
  DROP CONSTRAINT IF EXISTS chats_sender_fkey,
  DROP CONSTRAINT IF EXISTS chats_receiver_fkey;

ALTER TABLE public.chats
  ADD CONSTRAINT chats_sender_fkey 
    FOREIGN KEY (sender_id) 
    REFERENCES public.users_v2(id) 
    ON DELETE CASCADE,
  ADD CONSTRAINT chats_receiver_fkey 
    FOREIGN KEY (receiver_id) 
    REFERENCES public.users_v2(id) 
    ON DELETE CASCADE;

-- Optionally, create an index on conversation_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_chats_conversation_id ON public.chats(conversation_id);

-- Create an index on sender_id for faster queries
CREATE INDEX IF NOT EXISTS idx_chats_sender_id ON public.chats(sender_id);

-- Create an index on receiver_id for faster queries  
CREATE INDEX IF NOT EXISTS idx_chats_receiver_id ON public.chats(receiver_id);

-- Create a composite index for unread message queries
CREATE INDEX IF NOT EXISTS idx_chats_receiver_unread 
  ON public.chats(receiver_id, conversation_id) 
  WHERE is_read = false;

COMMIT;

-- =============================================
-- VERIFICATION QUERY
-- =============================================
-- Run this to verify foreign keys were added:
-- SELECT 
--   conname AS "Constraint Name",
--   conrelid::regclass AS "Table",
--   confrelid::regclass AS "Referenced Table"
-- FROM pg_constraint
-- WHERE conrelid = 'public.chats'::regclass 
--   AND contype = 'f';
