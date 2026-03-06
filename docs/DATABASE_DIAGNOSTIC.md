# CRITICAL DATABASE DIAGNOSTIC
**Run this SQL query in Supabase SQL Editor to diagnose the issue:**

```sql
-- Check if tables exist
SELECT 
  'users' as table_name,
  EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') as exists
UNION ALL
SELECT 
  'users_v2' as table_name,
  EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users_v2') as exists
UNION ALL
SELECT 
  'profiles_v2' as table_name,
  EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles_v2') as exists
UNION ALL
SELECT 
  'verifications' as table_name,
  EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'verifications') as exists;

-- Check users_v2 structure (if it exists)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users_v2'
ORDER BY ordinal_position;

-- Check if test user exists and their verification status
SELECT id, username, registration_type, verification_status, is_admin
FROM users_v2
WHERE username = '<YOUR_TEST_USERNAME>'
LIMIT 1;
```

**Replace `<YOUR_TEST_USERNAME>` with the actual username of the user who is stuck in pending-verification.**

---

## EXPECTED RESULTS:

### If users_v2 DOES NOT EXIST:
```
table_name  | exists
------------|-------
users       | true
users_v2    | FALSE  ← PROBLEM!
```

**This is the root cause!** The app code queries `users_v2` but the table doesn't exist.

### Solution: Create users_v2 table
Run this SQL to create it:

```sql
-- Create users_v2 table (V2 architecture)
CREATE TABLE IF NOT EXISTS users_v2 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash TEXT NOT NULL,
  
  -- Personal Information (for verified users)
  full_name VARCHAR(100),
  birthday DATE,
  gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'male', 'female', 'Other', 'other')),
  university_name VARCHAR(200),
  faculty VARCHAR(200),
  bio TEXT,
  
  -- Registration & Verification
  registration_type VARCHAR(20) DEFAULT 'simple' CHECK (registration_type IN ('simple', 'verified', 'email')),
  verification_status VARCHAR(20) DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  email_verified BOOLEAN DEFAULT FALSE,
  
  -- Verification Documents
  proof_type VARCHAR(20) CHECK (proof_type IN ('student_id', 'facebook', 'academic')),
  proof_url TEXT,
  
  -- Partner Preferences
  preferences JSONB,
  partner_preferences TEXT,
  partner_preferences_json JSONB,
  
  -- Admin & Moderation
  report_count INTEGER DEFAULT 0,
  is_restricted BOOLEAN DEFAULT FALSE,
  restriction_reason TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles_v2 table (anonymous public persona)
CREATE TABLE IF NOT EXISTS profiles_v2 (
  user_id UUID PRIMARY KEY REFERENCES users_v2(id) ON DELETE CASCADE,
  
  -- Anonymous Identity
  anonymous_name VARCHAR(100) UNIQUE NOT NULL,
  anonymous_avatar_url TEXT,
  
  -- Public Profile Info
  bio TEXT DEFAULT '',
  age INTEGER,
  height_cm INTEGER,
  skin_tone VARCHAR(50),
  degree_type VARCHAR(50),
  hometown VARCHAR(100),
  
  -- Privacy & Moderation
  total_reports INTEGER DEFAULT 0,
  public BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_v2_username ON users_v2(username);
CREATE INDEX IF NOT EXISTS idx_users_v2_email ON users_v2(email);
CREATE INDEX IF NOT EXISTS idx_users_v2_verification_status ON users_v2(verification_status);
CREATE INDEX IF NOT EXISTS idx_users_v2_registration_type ON users_v2(registration_type);

CREATE INDEX IF NOT EXISTS idx_profiles_v2_user_id ON profiles_v2(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_v2_anonymous_name ON profiles_v2(anonymous_name);

-- Enable RLS
ALTER TABLE users_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles_v2 ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow service role to bypass)
CREATE POLICY "Service role can do anything on users_v2" ON users_v2
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can do anything on profiles_v2" ON profiles_v2
  USING (true)
  WITH CHECK (true);

-- Migrate existing data from users to users_v2
INSERT INTO users_v2 (
  id, username, email, password_hash, full_name, birthday, gender,
  university_name, faculty, bio, registration_type, verification_status,
  email_verified, proof_type, proof_url, is_restricted, is_admin,
  created_at, updated_at
)
SELECT 
  id, username, email, password_hash, full_name, 
  COALESCE(birthday, dob) AS birthday, 
  gender, 
  COALESCE(university_name, university) AS university_name,
  faculty, bio,
  COALESCE(registration_type, 'simple') AS registration_type,
  COALESCE(verification_status, 'unverified') AS verification_status,
  COALESCE(email_verified, false) AS email_verified,
  proof_type, proof_url,
  COALESCE(is_restricted, false) AS is_restricted,
  COALESCE(is_admin, false) AS is_admin,
  COALESCE(created_at, NOW()) AS created_at,
  COALESCE(updated_at, NOW()) AS updated_at
FROM users
ON CONFLICT (id) DO NOTHING;

-- Migrate profiles to profiles_v2
INSERT INTO profiles_v2 (
  user_id, anonymous_name, anonymous_avatar_url, bio, age,
  height_cm, skin_tone, degree_type, hometown, total_reports, public, created_at
)
SELECT 
  COALESCE(p.user_id, u.id) AS user_id,
  COALESCE(p.display_name, p.anonymous_name, u.username) AS anonymous_name,
  COALESCE(p.avatar_url, p.anonymous_avatar_url, u.avatar_url, '👤') AS anonymous_avatar_url,
  COALESCE(p.bio, u.bio, '') AS bio,
  COALESCE(p.age, EXTRACT(YEAR FROM AGE(NOW(), COALESCE(u.birthday, u.dob)))::INTEGER, 18) AS age,
  p.height_cm, p.skin_tone, p.degree_type, p.hometown,
  COALESCE(u.report_count, 0) AS total_reports,
  COALESCE(p.public, true) AS public,
  COALESCE(p.created_at, NOW()) AS created_at
FROM users u
LEFT JOIN profiles p ON p.user_id = u.id
ON CONFLICT (user_id) DO NOTHING;

-- Create profiles_v2 for users without profiles
INSERT INTO profiles_v2 (user_id, anonymous_name, anonymous_avatar_url, bio, age, total_reports, public, created_at)
SELECT 
  u.id, u.username, '👤', '', 18, 0, true, NOW()
FROM users_v2 u
WHERE NOT EXISTS (SELECT 1 FROM profiles_v2 WHERE user_id = u.id)
ON CONFLICT (user_id) DO NOTHING;
```

### If users_v2 EXISTS but column verification_status is wrong:
```
column_name          | data_type      | is_nullable
---------------------|----------------|------------
verification_status  | character varying | YES
```

Check the actual data:
```sql
-- See what the database actually has
SELECT username, verification_status, registration_type
FROM users_v2
WHERE username = '<TEST_USERNAME>';

-- If it shows NULL or wrong status, update it:
UPDATE users_v2
SET verification_status = 'verified'
WHERE username = '<TEST_USERNAME>' AND registration_type = 'verified';
```

---

## PASTE YOUR RESULTS HERE:

**Table exists check:**
```
(Paste results from first query)
```

**users_v2 columns:**
```
(Paste results from second query)
```

**Test user data:**
```
(Paste results from third query)
```

This will help me identify the EXACT issue!
