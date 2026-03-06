-- =============================================
-- COMPREHENSIVE MIGRATION: Update ALL foreign keys to reference users_v2
-- =============================================
-- This migration updates ALL foreign key constraints across the entire database
-- to point to users_v2 instead of the old users table.
-- ⚠️ IMPORTANT: Run this AFTER creating users_v2 and profiles_v2 tables,
-- and AFTER migrating data from users → users_v2 and profiles → profiles_v2.

BEGIN;

-- =============================================
-- 1. SWIPES TABLE
-- =============================================
ALTER TABLE public.swipes 
  DROP CONSTRAINT IF EXISTS swipes_swiper_fkey,
  DROP CONSTRAINT IF EXISTS swipes_target_fkey;

ALTER TABLE public.swipes
  ADD CONSTRAINT swipes_swiper_fkey 
    FOREIGN KEY (swiper_user_id) 
    REFERENCES public.users_v2(id) 
    ON DELETE CASCADE,
  ADD CONSTRAINT swipes_target_fkey 
    FOREIGN KEY (target_user_id) 
    REFERENCES public.users_v2(id) 
    ON DELETE CASCADE;

-- =============================================
-- 2. MATCHES TABLE
-- =============================================
ALTER TABLE public.matches
  DROP CONSTRAINT IF EXISTS matches_user1_fkey,
  DROP CONSTRAINT IF EXISTS matches_user2_fkey;

ALTER TABLE public.matches
  ADD CONSTRAINT matches_user1_fkey 
    FOREIGN KEY (user1_id) 
    REFERENCES public.users_v2(id) 
    ON DELETE CASCADE,
  ADD CONSTRAINT matches_user2_fkey 
    FOREIGN KEY (user2_id) 
    REFERENCES public.users_v2(id) 
    ON DELETE CASCADE;

-- =============================================
-- 3. BLOCKS TABLE
-- =============================================
ALTER TABLE public.blocks
  DROP CONSTRAINT IF EXISTS blocks_blocker_fkey,
  DROP CONSTRAINT IF EXISTS blocks_blocked_fkey;

ALTER TABLE public.blocks
  ADD CONSTRAINT blocks_blocker_fkey 
    FOREIGN KEY (blocker_id) 
    REFERENCES public.users_v2(id) 
    ON DELETE CASCADE,
  ADD CONSTRAINT blocks_blocked_fkey 
    FOREIGN KEY (blocked_id) 
    REFERENCES public.users_v2(id) 
    ON DELETE CASCADE;

-- =============================================
-- 4. REPORTS TABLE
-- =============================================
ALTER TABLE public.reports
  DROP CONSTRAINT IF EXISTS reports_reporter_fkey,
  DROP CONSTRAINT IF EXISTS reports_reported_fkey,
  DROP CONSTRAINT IF EXISTS reports_reviewed_by_fkey;

ALTER TABLE public.reports
  ADD CONSTRAINT reports_reporter_fkey 
    FOREIGN KEY (reporter_id) 
    REFERENCES public.users_v2(id) 
    ON DELETE CASCADE,
  ADD CONSTRAINT reports_reported_fkey 
    FOREIGN KEY (reported_user_id) 
    REFERENCES public.users_v2(id) 
    ON DELETE CASCADE,
  ADD CONSTRAINT reports_reviewed_by_fkey 
    FOREIGN KEY (reviewed_by) 
    REFERENCES public.users_v2(id) 
    ON DELETE SET NULL;

-- =============================================
-- 5. VERIFICATIONS TABLE
-- =============================================
ALTER TABLE public.verifications
  DROP CONSTRAINT IF EXISTS verifications_user_fkey,
  DROP CONSTRAINT IF EXISTS verifications_reviewed_by_fkey;

ALTER TABLE public.verifications
  ADD CONSTRAINT verifications_user_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES public.users_v2(id) 
    ON DELETE CASCADE,
  ADD CONSTRAINT verifications_reviewed_by_fkey 
    FOREIGN KEY (reviewed_by) 
    REFERENCES public.users_v2(id) 
    ON DELETE SET NULL;

-- =============================================
-- 6. VERIFICATION_FILES TABLE
-- =============================================
ALTER TABLE public.verification_files
  DROP CONSTRAINT IF EXISTS verification_files_user_fkey;

ALTER TABLE public.verification_files
  ADD CONSTRAINT verification_files_user_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES public.users_v2(id) 
    ON DELETE CASCADE;

-- =============================================
-- 7. CONVERSATIONS TABLE
-- =============================================
ALTER TABLE public.conversations
  DROP CONSTRAINT IF EXISTS conversations_user1_fkey,
  DROP CONSTRAINT IF EXISTS conversations_user2_fkey;

ALTER TABLE public.conversations
  ADD CONSTRAINT conversations_user1_fkey 
    FOREIGN KEY (user1_id) 
    REFERENCES public.users_v2(id) 
    ON DELETE CASCADE,
  ADD CONSTRAINT conversations_user2_fkey 
    FOREIGN KEY (user2_id) 
    REFERENCES public.users_v2(id) 
    ON DELETE CASCADE;

-- =============================================
-- 8. MESSAGES TABLE
-- =============================================
ALTER TABLE public.messages
  DROP CONSTRAINT IF EXISTS messages_sender_fkey,
  DROP CONSTRAINT IF EXISTS messages_recipient_fkey;

ALTER TABLE public.messages
  ADD CONSTRAINT messages_sender_fkey 
    FOREIGN KEY (sender_id) 
    REFERENCES public.users_v2(id) 
    ON DELETE CASCADE,
  ADD CONSTRAINT messages_recipient_fkey 
    FOREIGN KEY (recipient_id) 
    REFERENCES public.users_v2(id) 
    ON DELETE CASCADE;

-- =============================================
-- 9. INBOX_REQUESTS TABLE (if exists)
-- =============================================
ALTER TABLE public.inbox_requests
  DROP CONSTRAINT IF EXISTS inbox_requests_sender_fkey,
  DROP CONSTRAINT IF EXISTS inbox_requests_recipient_fkey;

ALTER TABLE public.inbox_requests
  ADD CONSTRAINT inbox_requests_sender_fkey 
    FOREIGN KEY (sender_id) 
    REFERENCES public.users_v2(id) 
    ON DELETE CASCADE,
  ADD CONSTRAINT inbox_requests_recipient_fkey 
    FOREIGN KEY (recipient_id) 
    REFERENCES public.users_v2(id) 
    ON DELETE CASCADE;

-- =============================================
-- 10. NOTICE_BOARD TABLE
-- =============================================
ALTER TABLE public.notice_board
  DROP CONSTRAINT IF EXISTS notice_board_author_fkey,
  DROP CONSTRAINT IF EXISTS notice_board_approver_fkey;

ALTER TABLE public.notice_board
  ADD CONSTRAINT notice_board_author_fkey 
    FOREIGN KEY (author_id) 
    REFERENCES public.users_v2(id) 
    ON DELETE CASCADE,
  ADD CONSTRAINT notice_board_approver_fkey 
    FOREIGN KEY (approved_by) 
    REFERENCES public.users_v2(id) 
    ON DELETE SET NULL;

-- =============================================
-- 11. ADMIN_ACTIONS TABLE
-- =============================================
ALTER TABLE public.admin_actions
  DROP CONSTRAINT IF EXISTS admin_actions_admin_fkey,
  DROP CONSTRAINT IF EXISTS admin_actions_target_fkey;

ALTER TABLE public.admin_actions
  ADD CONSTRAINT admin_actions_admin_fkey 
    FOREIGN KEY (admin_id) 
    REFERENCES public.users_v2(id) 
    ON DELETE CASCADE,
  ADD CONSTRAINT admin_actions_target_fkey 
    FOREIGN KEY (target_user_id) 
    REFERENCES public.users_v2(id) 
    ON DELETE SET NULL;

-- =============================================
-- 12. PREFERENCES TABLE (if user_id exists)
-- =============================================
ALTER TABLE public.preferences
  DROP CONSTRAINT IF EXISTS preferences_user_fkey;

ALTER TABLE public.preferences
  ADD CONSTRAINT preferences_user_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES public.users_v2(id) 
    ON DELETE CASCADE;

COMMIT;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================
-- Run these to verify all foreign keys now point to users_v2:

-- SELECT 
--   conrelid::regclass AS "Table",
--   conname AS "Constraint Name",
--   confrelid::regclass AS "References Table"
-- FROM pg_constraint
-- WHERE confrelid = 'public.users_v2'::regclass 
--   AND contype = 'f'
-- ORDER BY conrelid::regclass::text;
