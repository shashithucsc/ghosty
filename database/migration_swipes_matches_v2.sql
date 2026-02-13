-- =============================================
-- MIGRATION: Update swipes and matches tables to reference users_v2
-- =============================================
-- This migration updates the foreign key constraints in swipes and matches
-- tables to point to users_v2 instead of the old users table.
-- Run this AFTER creating users_v2 and profiles_v2 tables.

-- Step 1: Drop existing foreign key constraints on swipes table
ALTER TABLE public.swipes 
  DROP CONSTRAINT IF EXISTS swipes_swiper_fkey,
  DROP CONSTRAINT IF EXISTS swipes_target_fkey;

-- Step 2: Add new foreign key constraints pointing to users_v2
ALTER TABLE public.swipes
  ADD CONSTRAINT swipes_swiper_fkey 
    FOREIGN KEY (swiper_user_id) 
    REFERENCES public.users_v2(id) 
    ON DELETE CASCADE,
  ADD CONSTRAINT swipes_target_fkey 
    FOREIGN KEY (target_user_id) 
    REFERENCES public.users_v2(id) 
    ON DELETE CASCADE;

-- Step 3: Drop existing foreign key constraints on matches table
ALTER TABLE public.matches
  DROP CONSTRAINT IF EXISTS matches_user1_fkey,
  DROP CONSTRAINT IF EXISTS matches_user2_fkey;

-- Step 4: Add new foreign key constraints pointing to users_v2
ALTER TABLE public.matches
  ADD CONSTRAINT matches_user1_fkey 
    FOREIGN KEY (user1_id) 
    REFERENCES public.users_v2(id) 
    ON DELETE CASCADE,
  ADD CONSTRAINT matches_user2_fkey 
    FOREIGN KEY (user2_id) 
    REFERENCES public.users_v2(id) 
    ON DELETE CASCADE;

-- Verification queries (optional - run these to check)
-- Check swipes foreign keys:
-- SELECT conname, conrelid::regclass, confrelid::regclass 
-- FROM pg_constraint 
-- WHERE conrelid = 'public.swipes'::regclass AND contype = 'f';

-- Check matches foreign keys:
-- SELECT conname, conrelid::regclass, confrelid::regclass 
-- FROM pg_constraint 
-- WHERE conrelid = 'public.matches'::regclass AND contype = 'f';
