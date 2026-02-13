-- =============================================
-- DATA MIGRATION: Copy data from users/profiles to users_v2/profiles_v2
-- =============================================
-- This script migrates existing user data from the old tables to V2 tables.
-- Run this AFTER creating users_v2 and profiles_v2 tables,
-- and BEFORE updating foreign key constraints.

BEGIN;

-- =============================================
-- STEP 1: Migrate data from users → users_v2
-- =============================================
-- Insert all users from old table into users_v2
-- Mapping:
-- - Keep: id, username, email, password_hash, full_name, birthday, gender
-- - Keep: university_name, faculty, registration_type, email_verified
-- - Keep: verification_status, proof_type, proof_url, is_restricted, is_admin
-- - Drop: report_count (moved to profiles_v2.total_reports)
-- - Drop: bio, partner_preferences, avatar_url (moved to profiles_v2)
-- - Drop: verified, dob, university, age (cleaned up or moved)

INSERT INTO public.users_v2 (
  id,
  username,
  email,
  password_hash,
  full_name,
  birthday,
  gender,
  university_name,
  faculty,
  registration_type,
  email_verified,
  verification_status,
  proof_type,
  proof_url,
  is_restricted,
  is_admin,
  created_at,
  updated_at
)
SELECT 
  id,
  username,
  email,
  password_hash,
  full_name,
  COALESCE(birthday, dob) AS birthday, -- Use birthday, fallback to dob
  gender,
  COALESCE(university_name, university) AS university_name, -- Use university_name, fallback to university
  faculty,
  COALESCE(registration_type, 'simple') AS registration_type,
  COALESCE(email_verified, false) AS email_verified,
  COALESCE(verification_status, 'unverified') AS verification_status,
  proof_type,
  proof_url,
  COALESCE(is_restricted, false) AS is_restricted,
  COALESCE(is_admin, false) AS is_admin,
  COALESCE(created_at, NOW()) AS created_at,
  COALESCE(updated_at, NOW()) AS updated_at
FROM public.users
ON CONFLICT (id) DO NOTHING; -- Skip if already migrated

-- =============================================
-- STEP 2: Migrate data from profiles → profiles_v2
-- =============================================
-- Create profiles_v2 records for all users
-- Mapping:
-- - user_id: from profiles.user_id or users.id
-- - anonymous_name: from profiles.display_name or generate from username
-- - anonymous_avatar_url: from profiles.avatar_url or users.avatar_url
-- - bio: from profiles.bio or users.bio
-- - age: calculate from birthday if not in profiles
-- - Physical attributes: height_cm, skin_tone, degree_type, hometown
-- - total_reports: from users.report_count

-- First, insert profiles for users who have profile records
INSERT INTO public.profiles_v2 (
  user_id,
  anonymous_name,
  anonymous_avatar_url,
  bio,
  age,
  height_cm,
  skin_tone,
  degree_type,
  hometown,
  total_reports,
  public,
  created_at
)
SELECT 
  p.user_id,
  COALESCE(p.display_name, p.anonymous_name, u.username) AS anonymous_name,
  COALESCE(p.avatar_url, p.anonymous_avatar_url, u.avatar_url) AS anonymous_avatar_url,
  COALESCE(p.bio, u.bio, '') AS bio,
  COALESCE(
    p.age,
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, COALESCE(u.birthday, u.dob)))::INTEGER
  ) AS age,
  p.height_cm,
  p.skin_tone,
  p.degree_type,
  p.hometown,
  COALESCE(u.report_count, 0) AS total_reports,
  COALESCE(p.public, true) AS public,
  COALESCE(p.created_at, NOW()) AS created_at
FROM public.profiles p
INNER JOIN public.users u ON p.user_id = u.id
ON CONFLICT (user_id) DO NOTHING;

-- Second, insert profiles for users who DON'T have profile records yet
-- (users who registered but never completed profile setup)
INSERT INTO public.profiles_v2 (
  user_id,
  anonymous_name,
  anonymous_avatar_url,
  bio,
  age,
  height_cm,
  skin_tone,
  degree_type,
  hometown,
  total_reports,
  public,
  created_at
)
SELECT 
  u.id AS user_id,
  u.username AS anonymous_name, -- Use username as fallback
  COALESCE(u.avatar_url, 
    CASE 
      WHEN u.gender = 'Male' THEN 'https://api.dicebear.com/7.x/avataaars/svg?seed=male'
      WHEN u.gender = 'Female' THEN 'https://api.dicebear.com/7.x/avataaars/svg?seed=female'
      ELSE 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
    END
  ) AS anonymous_avatar_url,
  COALESCE(u.bio, '') AS bio,
  COALESCE(
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, COALESCE(u.birthday, u.dob)))::INTEGER,
    18
  ) AS age,
  NULL AS height_cm,
  NULL AS skin_tone,
  NULL AS degree_type,
  NULL AS hometown,
  COALESCE(u.report_count, 0) AS total_reports,
  true AS public,
  COALESCE(u.created_at, NOW()) AS created_at
FROM public.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles_v2 WHERE user_id = u.id
)
ON CONFLICT (user_id) DO NOTHING;

COMMIT;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================
-- Check migration results:

-- Count records in old vs new tables:
-- SELECT 
--   (SELECT COUNT(*) FROM public.users) AS old_users_count,
--   (SELECT COUNT(*) FROM public.users_v2) AS new_users_count,
--   (SELECT COUNT(*) FROM public.profiles) AS old_profiles_count,
--   (SELECT COUNT(*) FROM public.profiles_v2) AS new_profiles_count;

-- Check for users missing profiles_v2:
-- SELECT u.id, u.username, u.email
-- FROM public.users_v2 u
-- LEFT JOIN public.profiles_v2 p ON u.id = p.user_id
-- WHERE p.user_id IS NULL;

-- Sample data comparison:
-- SELECT 
--   u_old.username AS old_username,
--   u_new.username AS new_username,
--   p_old.display_name AS old_display_name,
--   p_new.anonymous_name AS new_anonymous_name
-- FROM public.users u_old
-- INNER JOIN public.users_v2 u_new ON u_old.id = u_new.id
-- LEFT JOIN public.profiles p_old ON u_old.id = p_old.user_id
-- LEFT JOIN public.profiles_v2 p_new ON u_new.id = p_new.user_id
-- LIMIT 10;
