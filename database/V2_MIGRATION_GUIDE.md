# 🚀 V2 Database Migration Guide - Complete Walkthrough

## Overview
This guide walks you through the complete migration from the old `users`/`profiles` tables to the new `users_v2`/`profiles_v2` architecture.

---

## 📋 Migration Steps (In Order)

### **Step 1: Create V2 Tables**
Run the SQL to create the new table structure:

```sql
-- 1. USERS V2: Strictly Private Identity, Auth & Admin Status
CREATE TABLE public.users_v2 (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  username character varying NOT NULL UNIQUE,
  email character varying UNIQUE,
  password_hash text NOT NULL,
  
  -- Real Identity (Private)
  full_name character varying,
  birthday date,
  gender character varying,
  university_name character varying,
  faculty character varying,
  
  -- System & Moderation
  registration_type text NOT NULL DEFAULT 'simple'::text,
  email_verified boolean DEFAULT false,
  verification_status text DEFAULT 'unverified'::text,
  proof_type text,
  proof_url text,
  is_restricted boolean DEFAULT false,
  is_admin boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT users_v2_pkey PRIMARY KEY (id)
);

-- 2. PROFILES V2: Strictly Public Anonymous Persona
CREATE TABLE public.profiles_v2 (
  user_id uuid NOT NULL,
  
  -- The Anonymous Persona
  anonymous_name text NOT NULL,
  anonymous_avatar_url text,
  bio text,
  
  -- Demographics for display/filtering
  age integer,
  height_cm integer,
  skin_tone text,
  degree_type text,
  hometown text,
  
  -- Public Stats
  total_reports integer DEFAULT 0,
  public boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT profiles_v2_pkey PRIMARY KEY (user_id),
  CONSTRAINT profiles_v2_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users_v2(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_users_v2_username ON public.users_v2(username);
CREATE INDEX idx_users_v2_email ON public.users_v2(email);
CREATE INDEX idx_users_v2_verification_status ON public.users_v2(verification_status);
CREATE INDEX idx_profiles_v2_anonymous_name ON public.profiles_v2(anonymous_name);
CREATE INDEX idx_profiles_v2_age ON public.profiles_v2(age);
```

---

### **Step 2: Migrate Existing Data**
Run the data migration script to copy existing users/profiles to V2 tables:

```bash
# Option A: Run via Supabase SQL Editor
# Copy the contents of database/migration_data_to_v2.sql and execute

# Option B: Run via psql (if you have direct database access)
psql $DATABASE_URL -f database/migration_data_to_v2.sql
```

This script:
- ✅ Copies all users from `users` → `users_v2`
- ✅ Copies all profiles from `profiles` → `profiles_v2`
- ✅ Creates profiles for users who didn't have one yet
- ✅ Maps old column names to new architecture (e.g., `report_count` → `total_reports`)

**Verification:**
```sql
-- Check migration success
SELECT 
  (SELECT COUNT(*) FROM public.users) AS old_users_count,
  (SELECT COUNT(*) FROM public.users_v2) AS new_users_count,
  (SELECT COUNT(*) FROM public.profiles) AS old_profiles_count,
  (SELECT COUNT(*) FROM public.profiles_v2) AS new_profiles_count;
```

---

### **Step 3: Update Foreign Key Constraints**
Update ALL foreign keys across the database to point to `users_v2`:

```bash
# Run the comprehensive foreign key migration
psql $DATABASE_URL -f database/migration_all_foreign_keys_v2.sql
```

This updates foreign keys in:
- ✅ `swipes` table (swiper_user_id, target_user_id)
- ✅ `matches` table (user1_id, user2_id)
- ✅ `blocks` table (blocker_id, blocked_id)
- ✅ `reports` table (reporter_id, reported_user_id, reviewed_by)
- ✅ `verifications` table (user_id, reviewed_by)
- ✅ `conversations` table (user1_id, user2_id)
- ✅ `messages` table (sender_id, recipient_id)
- ✅ `inbox_requests` table (sender_id, recipient_id)
- ✅ `notice_board` table (author_id, approved_by)
- ✅ `admin_actions` table (admin_id, target_user_id)
- ✅ `preferences` table (user_id)

**Verification:**
```sql
-- Check all foreign keys now point to users_v2
SELECT 
  conrelid::regclass AS "Table",
  conname AS "Constraint Name",
  confrelid::regclass AS "References Table"
FROM pg_constraint
WHERE confrelid = 'public.users_v2'::regclass 
  AND contype = 'f'
ORDER BY conrelid::regclass::text;
```

---

### **Step 4: Verify API Code Migration**
All API routes have been updated to use V2 tables:

**✅ Completed Migrations:**

**Phase 1 - Authentication:**
- `/api/auth/login` - Uses `users_v2` for auth, `profiles_v2` for profile completion check
- `/api/register/simple` - Creates `users_v2` + `profiles_v2` records
- `/api/register/verified` - Creates `users_v2` + `profiles_v2` with full identity

**Phase 2 - Profiles & Recommendations:**
- `/api/profile/edit` - Reads/writes to `users_v2` + `profiles_v2`
- `/api/profile/[userId]` - Reads from `users_v2` + `profiles_v2`
- `/api/profile/route.ts` - Updates `users_v2` + `profiles_v2`
- `/api/setup-profile` - Writes to `profiles_v2`
- `/api/recommendations` - Filters from `users_v2`, displays from `profiles_v2`

**Phase 3 - Interactions:**
- `/api/swipes` - Validates users in `users_v2`, records swipes
- `/api/matches` - Shows anonymous personas from `profiles_v2`
- `/api/inbox/requests` - Enriches with `profiles_v2` anonymous data
- `/api/inbox/chats` - Shows only `anonymous_name` from `profiles_v2`

**Phase 4 - Admin Dashboard:**
- `/api/admin/users` - JOINs `users_v2` + `profiles_v2` for full admin view
- `/api/admin/verifications` - Updates `users_v2.verification_status`
- `/api/admin/reports` - Shows both real identity (users_v2) and anonymous persona (profiles_v2)

---

### **Step 5: Test the Migration**

#### **5.1 Test Registration**
```bash
# Test simple registration
curl -X POST http://localhost:3000/api/register/simple \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Test123!@#",
    "gender": "Female"
  }'

# Check database
SELECT u.username, p.anonymous_name 
FROM users_v2 u 
LEFT JOIN profiles_v2 p ON u.id = p.user_id 
WHERE u.username = 'testuser';
```

#### **5.2 Test Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Test123!@#"
  }'
```

#### **5.3 Test Recommendations**
```bash
# Get recommendations (should return profiles from profiles_v2)
curl http://localhost:3000/api/recommendations?userId=YOUR_USER_ID
```

#### **5.4 Test Swipes**
```bash
# Like a profile (should insert into swipes with users_v2 foreign keys)
curl -X POST http://localhost:3000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "swiperId": "YOUR_USER_ID",
    "targetId": "TARGET_USER_ID",
    "action": "like"
  }'
```

---

### **Step 6: Monitor for Issues**

Common issues and solutions:

**❌ Error: "One or both users not found"**
- **Cause:** Users don't exist in `users_v2` yet
- **Fix:** Run Step 2 (data migration) to copy users to V2 tables

**❌ Error: "Foreign key constraint violation"**
- **Cause:** Foreign keys still point to old `users` table
- **Fix:** Run Step 3 (foreign key migration)

**❌ Error: "Failed to record swipe"**
- **Cause:** Database constraint or missing data in V2 tables
- **Check:** Verify swipes table foreign keys updated + users exist in users_v2

**❌ Error: "Column 'report_count' does not exist"**
- **Cause:** Old code still referencing removed columns
- **Fix:** Use `profiles_v2.total_reports` instead

---

### **Step 7: (Optional) Deprecate Old Tables**

Once everything is working with V2 tables:

```sql
-- Rename old tables to archive (don't drop immediately)
ALTER TABLE public.users RENAME TO users_old_archive;
ALTER TABLE public.profiles RENAME TO profiles_old_archive;

-- After 1-2 weeks of stable operation, drop old tables
-- DROP TABLE public.users_old_archive CASCADE;
-- DROP TABLE public.profiles_old_archive CASCADE;
```

---

## 🎯 Architecture Summary

### **Before (Old Architecture):**
```
users table:
  - Mixed private + public data
  - report_count, bio, avatar_url, partner_preferences
  - Massive duplication with profiles table

profiles table:
  - Duplicated: full_name, dob, gender, university, faculty, bio
  - Mixed identity data with display data
```

### **After (V2 Architecture):**
```
users_v2 table:
  ✅ ONLY private identity & auth
  ✅ full_name, email, birthday, university_name, faculty
  ✅ password_hash, verification_status, is_admin, is_restricted

profiles_v2 table:
  ✅ ONLY public anonymous persona
  ✅ anonymous_name, anonymous_avatar_url, bio
  ✅ age, height_cm, skin_tone, degree_type, hometown
  ✅ total_reports (public safety metric)
```

---

## 🔐 Privacy Benefits

### **Before:**
- Real names potentially exposed in matches/chat
- Inconsistent data sources (fallback logic everywhere)
- Duplicate gender/university/bio fields causing confusion

### **After:**
- ✅ Complete privacy: Only `anonymous_name` shown in interactions
- ✅ Single source of truth for each data type
- ✅ Admin safety: Admins see both real identity (safety) + anonymous persona (context)
- ✅ Clear separation: Private in users_v2, Public in profiles_v2

---

## 📊 Migration Status

| Component | Status | Notes |
|-----------|--------|-------|
| Database Schema (V2 tables) | ✅ Ready | Run Step 1 |
| Data Migration Script | ✅ Ready | Run Step 2 |
| Foreign Key Updates | ✅ Ready | Run Step 3 |
| Authentication APIs | ✅ Migrated | Phase 1 complete |
| Profile APIs | ✅ Migrated | Phase 2 complete |
| Recommendations API | ✅ Migrated | Phase 2 complete |
| Swipes API | ✅ Migrated | Phase 3 complete |
| Matches API | ✅ Migrated | Phase 3 complete |
| Inbox APIs | ✅ Migrated | Phase 3 complete |
| Admin APIs | ✅ Migrated | Phase 4 complete |
| Frontend Components | 🟡 Needs Testing | Verify after backend migration |

---

## 🚨 Critical Next Actions

1. **Run Step 1** - Create V2 tables in Supabase
2. **Run Step 2** - Migrate existing user data to V2 tables
3. **Run Step 3** - Update ALL foreign key constraints
4. **Test thoroughly** - Registration, login, swipes, matches, admin panel
5. **Monitor production** - Watch for any foreign key violations

---

## 📞 Troubleshooting

If you encounter issues during migration:
1. Check Supabase logs for constraint violations
2. Verify data exists in V2 tables: `SELECT COUNT(*) FROM users_v2;`
3. Check foreign keys: `\d+ swipes` in psql to see constraints
4. Rollback if needed: Restore from backup before migration

---

## ✅ Success Criteria

Migration is complete when:
- ✅ All users copied to `users_v2` and `profiles_v2`
- ✅ All foreign keys point to `users_v2`
- ✅ Login works with V2 tables
- ✅ Registration creates V2 records
- ✅ Swipes/matches work without errors
- ✅ Admin panel shows JOINed V2 data
- ✅ Chat displays only anonymous names
- ✅ No "user not found" errors in production
