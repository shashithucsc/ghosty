# TEST ADMIN APPROVAL - STEP BY STEP

**User ID from console:** `06c8d489-eb0d-4254-bbeb-e3d897ea5e78`
**Username:** `kapila`

---

## 🔍 STEP 1: Check Current Database Status

Run this in **Supabase SQL Editor**:

```sql
-- Check if user exists in users_v2
SELECT id, username, registration_type, verification_status, created_at
FROM users_v2
WHERE id = '06c8d489-eb0d-4254-bbeb-e3d897ea5e78';

-- If no results, check old users table
SELECT id, username, registration_type, verification_status, created_at
FROM users
WHERE id = '06c8d489-eb0d-4254-bbeb-e3d897ea5e78';
```

**PASTE RESULT HERE:**
```
[Paste the output]
```

---

## 🎯 SCENARIO A: User Found in users_v2

If query returned a row from `users_v2` table:

### Current Status: _______________ (pending/verified/unverified)

### Fix: Manually Update to Verified

```sql
-- Force update to verified
UPDATE users_v2
SET 
  verification_status = 'verified',
  updated_at = NOW()
WHERE id = '06c8d489-eb0d-4254-bbeb-e3d897ea5e78';

-- Verify it worked
SELECT id, username, verification_status, updated_at
FROM users_v2
WHERE id = '06c8d489-eb0d-4254-bbeb-e3d897ea5e78';
-- Should show: verification_status = 'verified'
```

### After Running SQL:

1. **Wait 10 seconds** (the page auto-checks every 10 seconds now)
2. **Watch the browser console** for:
   ```
   [PENDING-VERIFICATION] Auto-check: Old status: pending → New status: verified
   [PENDING-VERIFICATION] ✅ Approved! Redirecting to dashboard...
   ```
3. **User should see alert** and be redirected to dashboard

---

## 🎯 SCENARIO B: User NOT Found in users_v2

If query returned **0 rows** from `users_v2` but found user in `users` table:

### This Means: V2 Tables Don't Exist or Data Not Migrated

### Fix: Create V2 Tables and Migrate

```sql
BEGIN;

-- Create users_v2 if not exists
CREATE TABLE IF NOT EXISTS users_v2 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(100),
  birthday DATE,
  gender VARCHAR(10),
  university_name VARCHAR(200),
  faculty VARCHAR(200),
  bio TEXT,
  registration_type VARCHAR(20) DEFAULT 'simple',
  verification_status VARCHAR(20) DEFAULT 'unverified',
  email_verified BOOLEAN DEFAULT FALSE,
  proof_type VARCHAR(20),
  proof_url TEXT,
  preferences JSONB,
  partner_preferences TEXT,
  partner_preferences_json JSONB,
  report_count INTEGER DEFAULT 0,
  is_restricted BOOLEAN DEFAULT FALSE,
  restriction_reason TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles_v2 if not exists
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

-- Enable RLS with permissive policies
ALTER TABLE users_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles_v2 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role bypass" ON users_v2;
CREATE POLICY "Service role bypass" ON users_v2 FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role bypass" ON profiles_v2;
CREATE POLICY "Service role bypass" ON profiles_v2 FOR ALL USING (true) WITH CHECK (true);

-- Migrate ALL users from users to users_v2
INSERT INTO users_v2 (
  id, username, email, password_hash, full_name, birthday, gender,
  university_name, faculty, bio, registration_type, verification_status,
  email_verified, proof_type, proof_url, is_restricted, is_admin,
  created_at, updated_at
)
SELECT 
  id, username, email, password_hash, full_name, 
  COALESCE(birthday, dob), gender, 
  COALESCE(university_name, university),
  faculty, bio,
  COALESCE(registration_type, 'simple'),
  COALESCE(verification_status, 'unverified'),
  COALESCE(email_verified, false),
  proof_type, proof_url,
  COALESCE(is_restricted, false),
  COALESCE(is_admin, false),
  COALESCE(created_at, NOW()),
  COALESCE(updated_at, NOW())
FROM users
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  verification_status = EXCLUDED.verification_status,
  registration_type = EXCLUDED.registration_type,
  updated_at = NOW();

-- Migrate profiles
INSERT INTO profiles_v2 (user_id, anonymous_name, anonymous_avatar_url, bio, age, height_cm, skin_tone, degree_type, hometown, total_reports, public, created_at)
SELECT 
  u.id, 
  COALESCE(p.display_name, p.anonymous_name, u.username), 
  COALESCE(p.avatar_url, p.anonymous_avatar_url, '👤'),
  COALESCE(p.bio, u.bio, ''),
  COALESCE(p.age, EXTRACT(YEAR FROM AGE(NOW(), COALESCE(u.birthday, u.dob)))::INTEGER, 18),
  p.height_cm, p.skin_tone, p.degree_type, p.hometown,
  COALESCE(u.report_count, 0), 
  COALESCE(p.public, true),
  COALESCE(p.created_at, NOW())
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

-- Verify specific user migrated
SELECT id, username, registration_type, verification_status
FROM users_v2
WHERE id = '06c8d489-eb0d-4254-bbeb-e3d897ea5e78';
```

### Then Manually Approve:

```sql
-- Set to verified
UPDATE users_v2
SET verification_status = 'verified', updated_at = NOW()
WHERE id = '06c8d489-eb0d-4254-bbeb-e3d897ea5e78';

SELECT verification_status FROM users_v2 WHERE id = '06c8d489-eb0d-4254-bbeb-e3d897ea5e78';
-- Should show: 'verified'
```

---

## 🔴 SCENARIO C: User Not in Either Table

If not found in `users` or `users_v2`:

**Problem:** User registered but data not saved

**Solution:** User needs to register again

---

## ✅ AFTER FIXING DATABASE

### Verify Auto-Redirect Works:

1. **Keep browser on pending-verification page**
2. **Watch console** (F12 → Console tab)
3. **Within 10 seconds**, you should see:
   ```
   [PENDING-VERIFICATION] Auto-checking status...
   [PENDING-VERIFICATION] Auto-check: Old status: pending → New status: verified
   [PENDING-VERIFICATION] ✅ Approved! Redirecting to dashboard...
   ```
4. **Browser alert appears**: "✅ Your verification has been approved!"
5. **Redirects to `/dashboard`**

---

## 🧪 TEST ADMIN APPROVAL WORKING

### Step 1: Check Admin Panel
1. Login as admin
2. Go to Admin Panel → Verifications tab
3. Open browser console (F12)
4. Click "Approve" for user `kapila`
5. **Look for console logs:**
   ```
   [ADMIN] Starting approve for user: 06c8d489-eb0d-4254-bbeb-e3d897ea5e78
   [ADMIN] Verification ID: <some-uuid>
   [ADMIN] API Response (200): { success: true, ... }
   [ADMIN] ✅ approve successful
   ```

### Step 2: Check Server Logs

In terminal where `npm run dev` is running, look for:
```
[APPROVAL] Updated user 06c8d489-eb0d-4254-bbeb-e3d897ea5e78 verification_status to 'verified'
[APPROVAL] Updated rows: 1
[APPROVAL] New verification_status: verified
```

### If Admin Approval Isn't Working:

**Check .env.local has correct key:**
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Not the anon key!** It should be the **service_role** secret key from:
Supabase Dashboard → Settings → API → `service_role` key

---

## 📊 REPORT RESULTS

Run STEP 1 query and tell me:

1. **User found in users_v2?** ☐ Yes ☐ No
2. **User found in users?** ☐ Yes ☐ No
3. **Current verification_status:** _______________
4. **After manual UPDATE, status is:** _______________
5. **Auto-redirect worked?** ☐ Yes ☐ No
6. **Console logs show:** (paste `[PENDING-VERIFICATION]` logs)

This will tell me exactly what's wrong!
