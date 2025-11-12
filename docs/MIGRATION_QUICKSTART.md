# 🚀 Quick Fix: Database Migration Steps

## The Problem
You're getting this error:
```
Could not find the 'email_verified' column of 'users' in the schema cache
```

This is happening because the database schema needs to be updated to support the new dual registration system.

---

## ✅ Solution: Run the Migration

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **bvgdvwerkhncnopbxxdu**
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Copy and Paste the Migration Script

1. Open the file: `database/migration_dual_registration.sql`
2. Copy **ALL** the content (Ctrl+A, Ctrl+C)
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter)

### Step 3: Create Supabase Storage Bucket

After running the migration, create the storage bucket for verification files:

1. In Supabase Dashboard, click **Storage** in left sidebar
2. Click **New Bucket**
3. Configure:
   - **Name**: `proof_uploads`
   - **Public**: ❌ **UNCHECKED** (keep private)
   - **File size limit**: 5 MB
   - **Allowed MIME types**: `image/jpeg`, `image/png`, `application/pdf`
4. Click **Create Bucket**

### Step 4: Restart Your Dev Server

In your terminal:

```powershell
# Stop the server (Ctrl+C if running)
# Then restart:
npm run dev
```

### Step 5: Test Simple Registration

1. Go to: http://localhost:3000
2. Click **Sign Up**
3. Click **Quick Join (Simple)**
4. Enter username and password
5. Click **Create Account**

**Expected Result**: ✅ Account created successfully, redirects to login

---

## 🎯 What the Migration Does

The migration script will:

✅ Add `username` column to users table (for simple registration)
✅ Add `registration_type` column ('simple' or 'verified')
✅ Add `verification_status` column ('unverified', 'pending', 'verified', 'rejected')
✅ Add profile fields (full_name, birthday, gender, university, faculty, bio, partner_preferences)
✅ Add `role` column for admin functionality
✅ Make `email` column nullable (simple registration doesn't need email)
✅ Create `verifications` table for document uploads
✅ Create indexes for better performance
✅ Set up Row Level Security policies
✅ Create triggers for auto-updating timestamps

---

## 🔍 Verify Migration Success

After running the migration, you should see this output in Supabase SQL Editor:

```
Migration completed successfully!
users_table_exists: 1
verifications_table_exists: 1
username_column_exists: 1
registration_type_column_exists: 1
```

---

## ⚠️ If You Get Errors

### Error: "column already exists"
**Solution**: The migration is safe to run multiple times. It uses `IF NOT EXISTS` checks.

### Error: "permission denied"
**Solution**: Make sure you're logged into the correct Supabase project.

### Error: "table does not exist"
**Solution**: Run the original `database/schema.sql` first, then run the migration.

---

## 📊 After Migration

Once migration is complete:

✅ Simple Registration will work (/register/simple)
✅ Verified Registration will work (/register/verified)
✅ File uploads will work (after creating storage bucket)
✅ Admin panel can view verification requests
✅ TypeScript errors will be resolved

---

## 🎉 Next Steps

1. ✅ Run migration in Supabase SQL Editor
2. ✅ Create `proof_uploads` storage bucket
3. ✅ Restart dev server
4. ✅ Test both registration flows
5. 🔧 (Optional) Create admin account for testing verification approvals

---

## 📝 Notes

- **Email Registration**: Your existing `/api/auth/register` endpoint still works for email-based registration (registration_type='email')
- **Migration Safety**: This migration is **non-destructive** - it only adds new columns and tables, doesn't delete anything
- **Rollback**: If needed, you can remove the new columns, but keep the original schema intact
- **Production**: When deploying to production, run the same migration on your production database

---

## 🆘 Still Having Issues?

If you encounter any problems:

1. Check Supabase logs in Dashboard → Logs
2. Check browser console for errors (F12)
3. Check terminal for API errors
4. Verify `.env.local` has all required keys
5. Make sure storage bucket is created and named exactly `proof_uploads`

---

**Good luck! 🚀**
