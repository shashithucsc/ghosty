# 🔧 IMMEDIATE ACTION PLAN - Verification Fix
**Run these steps IN ORDER to fix the verification issue**

---

## ⚡ STEP 1: Run Database Diagnostic (2 minutes)

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy and paste this query:

```sql
-- Check if users_v2 exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'users_v2'
) AS users_v2_exists;
```

3. Click **Run**
4. **Tell me the result:**
   - If result is **`true`** → Go to STEP 2
   - If result is **`false`** → Go to STEP 1B

---

### STEP 1B: Create users_v2 Table (if it doesn't exist)

Run this in Supabase SQL Editor:

```sql
BEGIN;

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

CREATE INDEX IF NOT EXISTS idx_users_v2_username ON users_v2(username);
CREATE INDEX IF NOT EXISTS idx_users_v2_verification_status ON users_v2(verification_status);

ALTER TABLE users_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role bypass" ON users_v2;
CREATE POLICY "Service role bypass" ON users_v2 FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role bypass" ON profiles_v2;
CREATE POLICY "Service role bypass" ON profiles_v2 FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role bypass" ON verifications;
CREATE POLICY "Service role bypass" ON verifications FOR ALL USING (true) WITH CHECK (true);

-- Migrate data from old users table
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
  verification_status = EXCLUDED.verification_status;

-- Migrate profiles
INSERT INTO profiles_v2 (user_id, anonymous_name, anonymous_avatar_url, bio, age, height_cm, skin_tone, degree_type, hometown, total_reports, public, created_at)
SELECT 
  u.id, COALESCE(p.display_name, p.anonymous_name, u.username), 
  COALESCE(p.avatar_url, p.anonymous_avatar_url, '👤'),
  COALESCE(p.bio, u.bio, ''),
  COALESCE(p.age, EXTRACT(YEAR FROM AGE(NOW(), COALESCE(u.birthday, u.dob)))::INTEGER, 18),
  p.height_cm, p.skin_tone, p.degree_type, p.hometown,
  COALESCE(u.report_count, 0), COALESCE(p.public, true),
  COALESCE(p.created_at, NOW())
FROM users u
LEFT JOIN profiles p ON p.user_id = u.id
ON CONFLICT (user_id) DO NOTHING;

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

✅ **Expected output:** Row counts showing data migrated

---

## ⚡ STEP 2: Verify Test User in Database (1 minute)

**Replace `testuser` with your actual test username:**

```sql
SELECT id, username, registration_type, verification_status
FROM users_v2
WHERE username = 'testuser';
```

**Tell me what you see:**
- username: _____________
- registration_type: _____________
- verification_status: _____________

---

## ⚡ STEP 3: Manually Approve User (If Needed)

If the user's `verification_status` is still `'pending'`, manually update it:

```sql
-- Get user ID first
SELECT id FROM users_v2 WHERE username = 'testuser';

-- Update to verified (replace USER_ID with actual ID from above)
UPDATE users_v2
SET verification_status = 'verified', updated_at = NOW()
WHERE id = 'USER_ID';

-- Update verifications table
UPDATE verifications
SET status = 'approved', reviewed_at = NOW()
WHERE user_id = 'USER_ID';

-- Verify it worked
SELECT verification_status FROM users_v2 WHERE username = 'testuser';
-- Should show: 'verified'
```

---

## ⚡ STEP 4: Clear .next Cache & Restart Server (1 minute)

In your terminal (PowerShell):

```powershell
# Stop server if running (Ctrl+C)

# Clear Next.js cache
Remove-Item -Recurse -Force .next

# Navigate to project
cd d:\ghosty\ghosty

# Restart server
npm run dev
```

Wait for: **"✓ Ready in X ms"**

---

## ⚡ STEP 5: Test User Login (2 minutes)

### On User's Browser:

1. **Log out if logged in**
2. **Open browser DevTools** (Press F12)
3. **Go to Console tab**
4. **Clear localStorage:**
   ```javascript
   localStorage.clear()
   ```
5. **Go to login page:** `http://localhost:3000/login`
6. **Enter username and password**
7. **Click Login**
8. **Watch console logs** - should see:
   ```
   [LOGIN] User testuser - verification_status: verified
   [LOGIN] Set localStorage - verificationStatus: verified
   [LOGIN] Routing decision - verificationStatus: verified
   [LOGIN] Redirecting to dashboard
   ```

### ✅ Expected Result:
- User redirected to `/dashboard` (NOT `/pending-verification`)
- No errors in console
- Dashboard loads successfully

### ❌ If Still Fails:
**Check console for error messages** and copy them here:
```
[Paste console output]
```

---

## ⚡ STEP 6: Test "Check Status" Button (Alternative Method)

If user is stuck on pending-verification page:

1. **Go to:** `http://localhost:3000/pending-verification`
2. **Click "Show Debug Info"** button at bottom
3. **Read the debug panel** - it shows current localStorage values
4. **Click "Check Status"** button
5. **Wait for API response**
6. **If approved, will auto-redirect to dashboard**

---

## 🎯 QUICK TROUBLESHOOTING

### Issue: "table users_v2 does not exist"
→ Run STEP 1B (create tables)

### Issue: Database shows 'verified' but login redirects to pending
→ User needs to clear localStorage (Step 5, point 4)
→ Restart dev server (Step 4)

### Issue: Admin approval shows success but database not updated
→ Check `.env.local` has `SUPABASE_SERVICE_ROLE_KEY`
→ Check server console for `[APPROVAL]` error logs

### Issue: RLS policy blocking updates
→ Run this in Supabase:
```sql
ALTER TABLE users_v2 DISABLE ROW LEVEL SECURITY;
ALTER TABLE verifications DISABLE ROW LEVEL SECURITY;
```

---

## 📊 REPORT RESULTS

After completing all steps, report:

1. **STEP 1 Result:** users_v2 exists? ☐ Yes ☐ No
2. **STEP 2 Result:** verification_status = _____________
3. **STEP 3 Result:** Manual update worked? ☐ Yes ☐ No
4. **STEP 5 Result:** Login redirected to? _____________
5. **Console Logs:** (paste relevant [LOGIN] logs)
6. **Final Status:** ☐ ✅ FIXED ☐ ❌ Still broken

---

## 🆘 If Still Not Working

Share this info:
1. Screenshot of STEP 2 query results
2. Screenshot of browser console during login
3. Server terminal output during approval
4. `.env.local` verification (show SUPABASE_SERVICE_ROLE_KEY is set - don't share the actual key)

---

**This should fix it! Start with STEP 1 and work through each step carefully.**
