# Database Schema Updates for Dual Registration System

## Overview
This document outlines the required database schema changes to support the new dual registration system (Simple vs Verified registration flows).

---

## 1. Update `users` Table

Add the following columns to your existing `users` table:

```sql
-- Add username column (unique identifier for both registration types)
ALTER TABLE users 
ADD COLUMN username VARCHAR(20) UNIQUE;

-- Add registration type column (simple or verified)
ALTER TABLE users 
ADD COLUMN registration_type VARCHAR(20) DEFAULT 'simple' 
CHECK (registration_type IN ('simple', 'verified'));

-- Add verification status column (unverified, pending, verified, rejected)
ALTER TABLE users 
ADD COLUMN verification_status VARCHAR(20) DEFAULT 'unverified'
CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected'));

-- Add full name column (for verified users)
ALTER TABLE users 
ADD COLUMN full_name VARCHAR(100);

-- Add birthday column (for verified users)
ALTER TABLE users 
ADD COLUMN birthday DATE;

-- Add gender column (for verified users)
ALTER TABLE users 
ADD COLUMN gender VARCHAR(10)
CHECK (gender IN ('male', 'female', 'other'));

-- Add university column (for verified users)
ALTER TABLE users 
ADD COLUMN university VARCHAR(200);

-- Add faculty column (for verified users)
ALTER TABLE users 
ADD COLUMN faculty VARCHAR(200);

-- Add bio column (for verified users)
ALTER TABLE users 
ADD COLUMN bio TEXT;

-- Add partner preferences column (for verified users)
ALTER TABLE users 
ADD COLUMN partner_preferences TEXT;

-- Modify email column to allow NULL (simple registration doesn't require email)
ALTER TABLE users 
ALTER COLUMN email DROP NOT NULL;
```

---

## 2. Create `verifications` Table

Create a new table to store verification documents and their approval status:

```sql
-- Create verifications table
CREATE TABLE verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  proof_type VARCHAR(20) NOT NULL CHECK (proof_type IN ('student_id', 'facebook', 'academic')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  submitted_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_verifications_user_id ON verifications(user_id);
CREATE INDEX idx_verifications_status ON verifications(status);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_verifications_updated_at
BEFORE UPDATE ON verifications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

## 3. Create Supabase Storage Bucket

### Via Supabase Dashboard:

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New Bucket**
4. Configure the bucket:
   - **Name**: `proof_uploads`
   - **Public**: ❌ **UNCHECKED** (keep private)
   - **File size limit**: 5 MB
   - **Allowed MIME types**: `image/jpeg`, `image/png`, `application/pdf`
5. Click **Create Bucket**

### Via SQL (Alternative):

```sql
-- Create storage bucket (if using SQL approach)
INSERT INTO storage.buckets (id, name, public)
VALUES ('proof_uploads', 'proof_uploads', false);

-- Set bucket policies for admin access only
CREATE POLICY "Admin can view verification files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'proof_uploads' 
  AND auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
);

CREATE POLICY "API can upload verification files"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'proof_uploads');
```

---

## 4. Update Row Level Security (RLS) Policies

### For `users` table:

```sql
-- Allow users to read their own data
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own profile (excluding sensitive fields)
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  AND (
    -- Prevent users from changing these fields
    OLD.username = NEW.username
    AND OLD.registration_type = NEW.registration_type
    AND OLD.verification_status = NEW.verification_status
  )
);

-- Allow admins to view all users
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to update user verification status
CREATE POLICY "Admins can update verification status"
ON users FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### For `verifications` table:

```sql
-- Allow users to view their own verifications
CREATE POLICY "Users can view own verifications"
ON verifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow admins to view all verifications
CREATE POLICY "Admins can view all verifications"
ON verifications FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to update verification status
CREATE POLICY "Admins can update verifications"
ON verifications FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

---

## 5. Complete Migration Script

Here's a complete migration script you can run in Supabase SQL Editor:

```sql
-- ============================================
-- GHOSTY DUAL REGISTRATION SYSTEM
-- Database Migration Script
-- ============================================

BEGIN;

-- 1. Update users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(20) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS registration_type VARCHAR(20) DEFAULT 'simple' CHECK (registration_type IN ('simple', 'verified'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS birthday DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS university VARCHAR(200);
ALTER TABLE users ADD COLUMN IF NOT EXISTS faculty VARCHAR(200);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS partner_preferences TEXT;
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- 2. Create verifications table
CREATE TABLE IF NOT EXISTS verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  proof_type VARCHAR(20) NOT NULL CHECK (proof_type IN ('student_id', 'facebook', 'academic')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  submitted_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_verifications_user_id ON verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_verifications_status ON verifications(status);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_verification_status ON users(verification_status);

-- 4. Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_verifications_updated_at ON verifications;
CREATE TRIGGER update_verifications_updated_at
BEFORE UPDATE ON verifications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- Verification query to check migration success
SELECT 
  'Migration completed successfully!' as message,
  COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'verifications');
```

---

## 6. Post-Migration Verification

Run these queries to verify the migration was successful:

```sql
-- Check users table columns
SELECT column_name, data_type, is_nullable
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
AND tablename IN ('users', 'verifications');

-- Test registration type check
SELECT DISTINCT registration_type FROM users;

-- Test verification status check
SELECT DISTINCT verification_status FROM users;
```

---

## 7. Environment Variables Required

Make sure your `.env.local` has these variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # ⚠️ REQUIRED for file uploads

# Email (Optional - for simple registration welcome emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_gmail_app_password
SMTP_FROM_NAME=Ghosty
SMTP_FROM_EMAIL=your_email@gmail.com
```

---

## 8. Testing the New System

### Test Simple Registration:
1. Go to `/register/simple`
2. Enter username and password
3. Check database: `SELECT * FROM users WHERE registration_type = 'simple'`
4. Verify: `verification_status = 'unverified'`, `email IS NULL`

### Test Verified Registration:
1. Go to `/register/verified`
2. Complete all 3 steps and upload a document
3. Check database: `SELECT * FROM users WHERE registration_type = 'verified'`
4. Verify: `verification_status = 'pending'`
5. Check verifications table: `SELECT * FROM verifications WHERE status = 'pending'`
6. Check Supabase Storage: Go to Storage → proof_uploads → verifications/

---

## 9. Admin Panel Integration

The verification requests should now appear in your admin panel at `/admin`. The `VerificationRequests` component will need to query:

```typescript
// Fetch pending verifications
const { data: verifications } = await supabase
  .from('verifications')
  .select(`
    *,
    user:users (
      id,
      username,
      full_name,
      university,
      faculty,
      bio
    )
  `)
  .eq('status', 'pending')
  .order('submitted_at', { ascending: false });
```

---

## 10. Next Steps

1. ✅ Run the migration script in Supabase SQL Editor
2. ✅ Create `proof_uploads` storage bucket
3. ✅ Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
4. ✅ Restart your dev server: `npm run dev`
5. ✅ Test both registration flows
6. ✅ Update admin panel to handle verification approvals
7. ✅ (Optional) Add email notifications when verification is approved/rejected

---

## Troubleshooting

### Issue: TypeScript errors in registration APIs
- **Cause**: Database schema not updated yet
- **Fix**: Run migration script above

### Issue: File upload fails with "bucket not found"
- **Cause**: `proof_uploads` bucket doesn't exist
- **Fix**: Create bucket in Supabase Dashboard → Storage

### Issue: 500 error on verified registration
- **Cause**: Missing `SUPABASE_SERVICE_ROLE_KEY`
- **Fix**: Add service role key to `.env.local` and restart server

### Issue: RLS policy blocks user creation
- **Cause**: Strict RLS policies
- **Fix**: Ensure service role key is used for admin operations

---

## Summary

**Files Created:**
- ✅ `components/landing/SignInModal.tsx` (modal to choose registration type)
- ✅ `app/register/simple/page.tsx` (simple registration form)
- ✅ `app/api/register/simple/route.ts` (simple registration API)
- ✅ `app/register/verified/page.tsx` (verified registration form with file upload)
- ✅ `app/api/register/verified/route.ts` (verified registration API with Supabase Storage)

**Database Changes Required:**
- 📝 Add 10 columns to `users` table
- 📝 Create `verifications` table
- 📝 Create Supabase Storage bucket `proof_uploads`
- 📝 Update RLS policies

**Environment Variables Needed:**
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` (critical for file uploads)

Once you complete the migration, both registration flows will be fully functional! 🚀
