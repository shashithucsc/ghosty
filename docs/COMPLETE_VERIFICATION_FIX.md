# COMPLETE VERIFICATION FIX - ALL SCENARIOS
**Date:** February 13, 2026

This document covers ALL possible causes and fixes for the verification approval issue.

---

## 🎯 STEP 1: RUN DIAGNOSTIC

Open Supabase SQL Editor and run:

```sql
-- === DIAGNOSTIC QUERIES ===

-- 1. Check if users_v2 exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'users_v2'
) AS users_v2_exists;

-- 2. Check your test user in users_v2
SELECT id, username, registration_type, verification_status, created_at
FROM users_v2
WHERE username = 'YOUR_TEST_USERNAME_HERE'
LIMIT 1;

-- 3. Check verifications table
SELECT id, user_id, status, proof_type, submitted_at, reviewed_at
FROM verifications
WHERE user_id IN (
  SELECT id FROM users_v2 WHERE username = 'YOUR_TEST_USERNAME_HERE'
);

-- 4. Check RLS policies on users_v2
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'users_v2';
```

**Replace `YOUR_TEST_USERNAME_HERE` with the actual stuck user's username.**

---

## 🔥 SCENARIO A: users_v2 Table Does NOT Exist

### Symptom:
```
users_v2_exists: false
ERROR:  relation "users_v2" does not exist
```

### Fix:
Run the complete table creation script below:

```sql
-- ═══════════════════════════════════════════════════
-- CREATE USERS_V2 AND PROFILES_V2 TABLES
-- ═══════════════════════════════════════════════════

BEGIN;

-- Create users_v2 table
CREATE TABLE IF NOT EXISTS users_v2 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash TEXT NOT NULL,
  
  -- Personal Information
  full_name VARCHAR(100),
  birthday DATE,
  gender VARCHAR(10),
  university_name VARCHAR(200),
  faculty VARCHAR(200),
  bio TEXT,
  
  -- Registration & Verification
  registration_type VARCHAR(20) DEFAULT 'simple',
  verification_status VARCHAR(20) DEFAULT 'unverified',
  email_verified BOOLEAN DEFAULT FALSE,
  
  -- Verification Documents
  proof_type VARCHAR(20),
  proof_url TEXT,
  
  -- Preferences
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

-- Create profiles_v2 table
CREATE TABLE IF NOT EXISTS profiles_v2 (
  user_id UUID PRIMARY KEY REFERENCES users_v2(id) ON DELETE CASCADE,
  anonymous_name VARCHAR(100) UNIQUE NOT NULL,
  anonymous_avatar_url TEXT,
  bio TEXT DEFAULT '',
  age INTEGER,
  height_cm INTEGER,
  skin_tone VARCHAR(50),
  degree_type VARCHAR(50),
  hometown VARCHAR(100),
  total_reports INTEGER DEFAULT 0,
  public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create verifications table if not exists
CREATE TABLE IF NOT EXISTS verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users_v2(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  proof_type VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  admin_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_v2_username ON users_v2(username);
CREATE INDEX IF NOT EXISTS idx_users_v2_email ON users_v2(email);
CREATE INDEX IF NOT EXISTS idx_users_v2_verification_status ON users_v2(verification_status);
CREATE INDEX IF NOT EXISTS idx_profiles_v2_user_id ON profiles_v2(user_id);
CREATE INDEX IF NOT EXISTS idx_verifications_user_id ON verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_verifications_status ON verifications(status);

-- Enable RLS (but make it permissive for service role)
ALTER TABLE users_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow service role full access" ON users_v2;
DROP POLICY IF EXISTS "Allow service role full access" ON profiles_v2;
DROP POLICY IF EXISTS "Allow service role full access" ON verifications;

-- Create permissive policies (service role can do everything)
CREATE POLICY "Allow service role full access" ON users_v2
  FOR ALL 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access" ON profiles_v2
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access" ON verifications
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Migrate data from old users table
INSERT INTO users_v2 (
  id, username, email, password_hash, full_name, birthday, gender,
  university_name, faculty, bio, registration_type, verification_status,
  email_verified, proof_type, proof_url, is_restricted, is_admin,
  created_at, updated_at
)
SELECT 
  id, 
  username, 
  email, 
  password_hash, 
  full_name, 
  COALESCE(birthday, dob) AS birthday, 
  gender, 
  COALESCE(university_name, university) AS university_name,
  faculty, 
  bio,
  COALESCE(registration_type, 'simple') AS registration_type,
  COALESCE(verification_status, 'unverified') AS verification_status,
  COALESCE(email_verified, false) AS email_verified,
  proof_type, 
  proof_url,
  COALESCE(is_restricted, false) AS is_restricted,
  COALESCE(is_admin, false) AS is_admin,
  COALESCE(created_at, NOW()) AS created_at,
  COALESCE(updated_at, NOW()) AS updated_at
FROM users
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  verification_status = EXCLUDED.verification_status,
  registration_type = EXCLUDED.registration_type;

-- Migrate profiles
INSERT INTO profiles_v2 (user_id, anonymous_name, anonymous_avatar_url, bio, age, height_cm, skin_tone, degree_type, hometown, total_reports, public, created_at)
SELECT 
  u.id AS user_id,
  COALESCE(p.display_name, p.anonymous_name, u.username) AS anonymous_name,
  COALESCE(p.avatar_url, p.anonymous_avatar_url, '👤') AS anonymous_avatar_url,
  COALESCE(p.bio, u.bio, '') AS bio,
  COALESCE(p.age, EXTRACT(YEAR FROM AGE(NOW(), COALESCE(u.birthday, u.dob)))::INTEGER, 18) AS age,
  p.height_cm, p.skin_tone, p.degree_type, p.hometown,
  COALESCE(u.report_count, 0) AS total_reports,
  COALESCE(p.public, true) AS public,
  COALESCE(p.created_at, NOW()) AS created_at
FROM users u
LEFT JOIN profiles p ON p.user_id = u.id
ON CONFLICT (user_id) DO NOTHING;

-- Create profiles for users without them
INSERT INTO profiles_v2 (user_id, anonymous_name, anonymous_avatar_url, bio, age, total_reports, public, created_at)
SELECT u.id, u.username, '👤', '', 18, 0, true, NOW()
FROM users_v2 u
WHERE NOT EXISTS (SELECT 1 FROM profiles_v2 WHERE user_id = u.id)
ON CONFLICT (user_id) DO NOTHING;

COMMIT;

-- Verify migration
SELECT 
  (SELECT COUNT(*) FROM users) AS old_users,
  (SELECT COUNT(*) FROM users_v2) AS new_users_v2,
  (SELECT COUNT(*) FROM profiles_v2) AS profiles_v2;
```

**After running this, re-test the approval flow.**

---

## 🔥 SCENARIO B: users_v2 Exists BUT Verification Not Updating

### Symptom:
```
users_v2_exists: true
User found with verification_status: pending (should be verified after approval)
```

### Possible Causes:
1. RLS policy blocking service role
2. Admin API not using service role key
3. Database update failing silently

### Fix:

#### B1. Temporarily Disable RLS (for testing)
```sql
-- Disable RLS temporarily to test
ALTER TABLE users_v2 DISABLE ROW LEVEL SECURITY;
ALTER TABLE verifications DISABLE ROW LEVEL SECURITY;

-- Try approving again in admin panel
-- If it works now, the issue is RLS policies
```

#### B2. Check Service Role Key
Open `.env.local` and verify:
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Make sure it's the **service_role** key (NOT anon key). Find it in:
- Supabase Dashboard → Settings → API → `service_role` key (secret)

#### B3. Manual Update (Bypass API)
If admin approval isn't working, manually fix the user:

```sql
-- Get the user ID
SELECT id, username, verification_status 
FROM users_v2 
WHERE username = 'YOUR_TEST_USERNAME';

-- Manually update to verified (use the ID from above)
UPDATE users_v2
SET 
  verification_status = 'verified',
  updated_at = NOW()
WHERE id = 'USER_ID_FROM_ABOVE';

-- Update verifications table
UPDATE verifications
SET 
  status = 'approved',
  reviewed_at = NOW()
WHERE user_id = 'USER_ID_FROM_ABOVE';

-- Verify the update worked
SELECT id, username, verification_status, registration_type
FROM users_v2
WHERE id = 'USER_ID_FROM_ABOVE';
-- Should show: verification_status = 'verified'
```

#### B4. Fix RLS Policies (Permanent Solution)
```sql
-- Remove all existing policies
DROP POLICY IF EXISTS "Users can view own data" ON users_v2;
DROP POLICY IF EXISTS "Admins can view all users" ON users_v2;
DROP POLICY IF EXISTS "Allow service role full access" ON users_v2;

-- Create ONE simple policy that allows service role everything
CREATE POLICY "Service role bypass" ON users_v2
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Same for verifications
DROP POLICY IF EXISTS "Users can view own verifications" ON verifications;
DROP POLICY IF EXISTS "Admins can view all verifications" ON verifications;

CREATE POLICY "Service role bypass" ON verifications
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

---

## 🔥 SCENARIO C: Database Updated BUT Login Still Redirects to Pending

### Symptom:
```sql
-- Database shows:
SELECT verification_status FROM users_v2 WHERE username = 'testuser';
-- Result: 'verified'

-- But user still redirected to /pending-verification
```

### This is the localStorage caching issue (already fixed in code)

### Fix:
1. **User must completely log out**
2. **Clear browser data:**
   -Press F12 → Application tab → Storage → Local Storage
   - Right-click → Clear
   - OR run in console: `localStorage.clear()`
3. **Log back in**
4. **Check console logs:**
```
[LOGIN] User testuser - verification_status: verified, registration_type: verified
[LOGIN] Set localStorage - verificationStatus: verified registrationType: verified
[LOGIN] Routing decision - verificationStatus: verified registrationType: verified isAdmin: false
[LOGIN] Redirecting to dashboard
```

If you DON'T see these logs, the code changes weren't deployed. Restart the dev server:
```powershell
# Kill the process
Ctrl+C

# Clear Next.js cache
Remove-Item -Recurse -Force .next

# Restart
npm run dev
```

---

## 🔥 SCENARIO D: Approval API Returns Success BUT No Database Change

### Symptom:
Admin panel shows "Verification approved successfully!" but database unchanged.

### Fix:

Check server logs (terminal where `npm run dev` is running):
```
Look for:
[APPROVAL] Updated user abc-123-def verification_status to 'verified'
[APPROVAL] Updated rows: 1
[APPROVAL] New verification_status: verified
```

If you see:
```
[APPROVAL] Updated rows: 0
[APPROVAL] ERROR: No rows updated
```

This means the user doesn't exist in users_v2. Run SCENARIO A fix.

If you see RLS errors:
```
Error: new row violates row-level security policy
```

Run SCENARIO B4 fix (disable RLS temporarily).

---

## ✅ COMPLETE CHECKLIST

Run through this in order:

- [ ] 1. Run diagnostic queries (see results)
- [ ] 2. If users_v2 missing → Run SCENARIO A
- [ ] 3. Check `.env.local` has correct `SUPABASE_SERVICE_ROLE_KEY`
- [ ] 4. Disable RLS temporarily (SCENARIO B1)
- [ ] 5. Admin approves user in admin panel
- [ ] 6. Check database: `SELECT verification_status FROM users_v2 WHERE username = 'testuser'`
- [ ] 7. If database shows 'verified' → User logs out completely
- [ ] 8. User clears localStorage: `localStorage.clear()`
- [ ] 9. User logs in again
- [ ] 10. Check browser console for `[LOGIN]` logs
- [ ] 11. Verify user reaches `/dashboard` (not `/pending-verification`)

---

## 📞 REPORT RESULTS

After running through this, report back with:

1. **Diagnostic query results** (from Step 1)
2. **Which scenario applied** (A, B, C, or D)
3. **Server console logs** (during approval)
4. **Browser console logs** (during login)
5. **Final result** (success or still failing)

Copy this template:

```
=== DIAGNOSTIC RESULTS ===
users_v2_exists: [true/false]
Test user verification_status: [value]
Verifications table status: [value]

=== SCENARIO APPLIED ===
[A/B/C/D]

=== SERVER LOGS (APPROVAL) ===
[paste server console output]

=== BROWSER LOGS (LOGIN) ===
[paste browser console output]

=== FINAL RESULT ===
[✅ Working / ❌ Still failing]
[Description of what happened]
```

This will help pinpoint the EXACT issue!
