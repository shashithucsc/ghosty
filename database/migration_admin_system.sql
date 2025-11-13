-- =============================================
-- Admin System Migration
-- =============================================

-- 1. Add is_admin column to users table (if not exists)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Create index for faster admin lookups
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin) WHERE is_admin = TRUE;

-- 3. Create admin user
-- Password: Admin@123 (bcrypt hash)
-- IMPORTANT: Change this password immediately after first login!
INSERT INTO users (
  username,
  password_hash,
  email,
  email_verified,
  registration_type,
  verification_status,
  full_name,
  is_admin,
  created_at,
  updated_at
) VALUES (
  'admin',
  '$2b$10$YourBcryptHashHere',  -- Replace with actual bcrypt hash of your admin password
  'admin@ghosty.app',
  TRUE,
  'admin',
  'verified',
  'System Administrator',
  TRUE,
  NOW(),
  NOW()
) ON CONFLICT (username) DO NOTHING;

-- 4. Create admin profile
INSERT INTO profiles (
  user_id,
  anonymous_name,
  real_name,
  verified,
  public,
  created_at
) 
SELECT 
  id,
  'Admin',
  'System Administrator',
  TRUE,
  FALSE,
  NOW()
FROM users
WHERE username = 'admin'
ON CONFLICT (user_id) DO NOTHING;

-- 5. Comment on is_admin column
COMMENT ON COLUMN users.is_admin IS 'Flag indicating if user has admin privileges. Defaults to FALSE.';

-- =============================================
-- Verification: Check if admin user was created
-- =============================================
-- Run this query to verify:
-- SELECT id, username, email, is_admin, verification_status FROM users WHERE is_admin = TRUE;
