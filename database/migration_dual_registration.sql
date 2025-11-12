-- ============================================
-- GHOSTY DUAL REGISTRATION SYSTEM MIGRATION
-- Run this in Supabase SQL Editor
-- ============================================

-- This migration adds support for:
-- 1. Simple Registration (username + password only)
-- 2. Verified Registration (full profile + document verification)

BEGIN;

-- =====================================================
-- STEP 1: Update users table
-- =====================================================

-- Add username column (unique identifier for both registration types)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS username VARCHAR(20) UNIQUE;

-- Add registration type column (simple or verified)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS registration_type VARCHAR(20) DEFAULT 'simple' 
CHECK (registration_type IN ('simple', 'verified', 'email'));

-- Add verification status column (unverified, pending, verified, rejected)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'unverified'
CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected'));

-- Add full name column (for verified users)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS full_name VARCHAR(100);

-- Add birthday column (for verified users)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS birthday DATE;

-- Add gender column (for verified users)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS gender VARCHAR(10)
CHECK (gender IN ('male', 'female', 'other'));

-- Add university column (for verified users)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS university VARCHAR(200);

-- Add faculty column (for verified users)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS faculty VARCHAR(200);

-- Add bio column (for verified users)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add partner preferences column (for verified users)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS partner_preferences TEXT;

-- Add role column (for admin functionality)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user'
CHECK (role IN ('user', 'admin', 'moderator'));

-- Modify email column to allow NULL (simple registration doesn't require email)
ALTER TABLE users 
ALTER COLUMN email DROP NOT NULL;

-- =====================================================
-- STEP 2: Create verifications table
-- =====================================================

CREATE TABLE IF NOT EXISTS verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  proof_type VARCHAR(20) NOT NULL CHECK (proof_type IN ('student_id', 'facebook', 'academic')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 3: Create indexes for performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_verifications_user_id ON verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_verifications_status ON verifications(status);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_verification_status ON users(verification_status);
CREATE INDEX IF NOT EXISTS idx_users_registration_type ON users(registration_type);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- =====================================================
-- STEP 4: Create trigger for verifications updated_at
-- =====================================================

DROP TRIGGER IF EXISTS update_verifications_updated_at ON verifications;
CREATE TRIGGER update_verifications_updated_at
BEFORE UPDATE ON verifications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 5: Enable RLS on verifications table
-- =====================================================

ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 6: Update RLS policies
-- =====================================================

-- Users table policies (update existing)
DROP POLICY IF EXISTS "Users can view own data" ON users;
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

DROP POLICY IF EXISTS "Admins can update verification status" ON users;
CREATE POLICY "Admins can update verification status" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Verifications table policies
DROP POLICY IF EXISTS "Users can view own verifications" ON verifications;
CREATE POLICY "Users can view own verifications" ON verifications
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all verifications" ON verifications;
CREATE POLICY "Admins can view all verifications" ON verifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

DROP POLICY IF EXISTS "Admins can update verifications" ON verifications;
CREATE POLICY "Admins can update verifications" ON verifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- =====================================================
-- STEP 7: Create admin user (optional)
-- =====================================================

-- Uncomment and modify this to create an admin account
-- Password: "admin123" (hash generated with bcrypt rounds=12)
/*
INSERT INTO users (
  email, 
  username, 
  password_hash, 
  email_verified, 
  registration_type, 
  verification_status,
  role,
  created_at
) VALUES (
  'admin@ghosty.app',
  'admin',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIFj6K9vOy',
  true,
  'email',
  'verified',
  'admin',
  NOW()
)
ON CONFLICT (email) DO NOTHING;
*/

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- Run these to verify the migration was successful
-- =====================================================

-- Check users table columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Check verifications table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'verifications'
ORDER BY ordinal_position;

-- Check indexes
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('users', 'verifications')
ORDER BY tablename, indexname;

-- Check constraints
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'users'::regclass
ORDER BY conname;

-- Summary
SELECT 
  'Migration completed successfully!' as message,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'users') as users_table_exists,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'verifications') as verifications_table_exists,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'username') as username_column_exists,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'registration_type') as registration_type_column_exists;
