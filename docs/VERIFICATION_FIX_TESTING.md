# VERIFICATION APPROVAL FIX - TESTING GUIDE
**Date:** February 13, 2026  
**Issue:** Users remain stuck on pending-verification page after admin approval

---

## 🔧 WHAT WAS FIXED

### Root Cause
The verification system had a **localStorage caching issue**. When admins approved a user:
1. ✅ Database correctly updated: `users_v2.verification_status = 'verified'`
2. ❌ User's browser **localStorage still contained old value**: `'pending'`
3. ❌ Dashboard and other pages checked localStorage → redirected to pending-verification

### Solution Implemented
1. **Clear localStorage on login** - Completely clear old auth data before storing new values
2. **Force fresh database reads** - Ensure login API queries latest data
3. **Add comprehensive logging** - Debug logs throughout approval and login flow
4. **Add validation checks** - Verify database updates actually succeed
5. **Use fresh values for routing** - Re-read localStorage before routing decisions

---

## 🧪 TESTING STEPS

### Prerequisites
- One test user with `registration_type = 'verified'` and `verification_status = 'pending'`
- Admin access to approve verification
- Browser DevTools open (F12) to view Console logs

### Test Scenario 1: Approve & Login (Primary Fix)

**Step 1: Open Browser DevTools**
```
Press F12 → Go to "Console" tab
Keep this open throughout the test
```

**Step 2: Admin Approves Verification**
1. Login as admin → Go to Admin Panel → Verifications tab
2. Find the pending user
3. Click "Approve" button
4. Look for console logs:
   ```
   [APPROVAL] Updated user <userId> verification_status to 'verified'
   [APPROVAL] Updated rows: 1
   [APPROVAL] New verification_status: verified
   ```
5. ✅ Should see success message in UI

**Step 3: User Logs Out (If Currently Logged In)**
1. If user is already logged in, click Logout
2. Clear localStorage manually (for clean test):
   ```javascript
   // In browser console, run:
   localStorage.clear();
   ```

**Step 4: User Logs In**
1. Go to `/login` page
2. Enter username and password
3. Watch console for these logs:
   ```
   [LOGIN] User <username> - verification_status: verified, registration_type: verified
   [LOGIN] Set localStorage - verificationStatus: verified registrationType: verified
   [LOGIN] Routing decision - verificationStatus: verified registrationType: verified isAdmin: false
   [LOGIN] Redirecting to dashboard
   ```
4. ✅ **Expected:** User redirected to `/dashboard` (NOT pending-verification)

**Step 5: Verify Dashboard Access**
1. Dashboard should load successfully
2. Look for console log:
   ```
   [DASHBOARD] Auth check - userId: <id> registrationType: verified verificationStatus: verified
   ```
3. ✅ **Expected:** User sees recommendation feed, can browse profiles

**Step 6: Navigate to Other Pages**
1. Click "My Profile" → Should load successfully
2. Click "Inbox" → Should load successfully
3. Console should show:
   ```
   [MY-PROFILE] Auth check - userId: <id> registrationType: verified verificationStatus: verified
   [INBOX] Auth check - userId: <id> registrationType: verified verificationStatus: verified
   ```
4. ✅ **Expected:** All pages accessible, no redirect to pending-verification

---

### Test Scenario 2: Database Update Verification

**Check Database Directly (Supabase Dashboard)**
1. Go to Supabase → Database → Table Editor
2. Open `users_v2` table
3. Find the approved user by username
4. Check columns:
   ```
   verification_status: "verified"  ✓
   registration_type: "verified"
   updated_at: <recent timestamp>
   ```
5. Open `verifications` table
6. Find the verification record for that user
7. Check columns:
   ```
   status: "approved"  ✓
   reviewed_at: <recent timestamp>
   ```

---

### Test Scenario 3: Edge Case - Direct URL Access

**User Already Logged In, Refreshes Dashboard**
1. After successful login, user is on dashboard
2. Press F5 (refresh page)
3. ✅ **Expected:** Dashboard reloads, does NOT redirect to pending-verification

**User Manually Navigates to /pending-verification**
1. After successful login, type `/pending-verification` in URL bar
2. ✅ **Expected:** Should auto-redirect back to dashboard (since verified)

---

## 🐛 TROUBLESHOOTING

### Issue: Still redirects to pending-verification after approval

**Debug Steps:**
1. Check browser console logs during login
2. Look for the `[LOGIN]` and `[DASHBOARD]` messages
3. Verify localStorage values:
   ```javascript
   // In browser console:
   console.log(localStorage.getItem('verificationStatus'));
   console.log(localStorage.getItem('registrationType'));
   // Should output: "verified" and "verified"
   ```

**Possible Causes:**
- **Stale localStorage:** User didn't log out and back in after approval
  - **Fix:** Force logout, clear localStorage, login again
  
- **Database not updated:** Admin approval API failed silently
  - **Check:** Look for `[APPROVAL]` console logs in admin panel
  - **Check:** Verify database shows `verification_status = 'verified'`
  
- **Wrong user:** Admin approved a different user's verification
  - **Check:** Verify username matches in admin panel and login

### Issue: Database shows "verified" but login still fails

**Check RLS Policies:**
```sql
-- In Supabase SQL Editor, run:
SELECT * FROM users_v2 WHERE username = '<test_username>';
-- Should return the user with verification_status = 'verified'
```

If no results:
- RLS policy might be blocking read
- Service role key might be incorrect in `.env.local`

**Check API Endpoint:**
```javascript
// In browser console on login page:
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: '<test_username>', password: '<password>' })
})
.then(r => r.json())
.then(console.log);
// Should return user object with verificationStatus: "verified"
```

### Issue: Approval button shows "success" but database not updated

**Check Server Logs:**
1. Look in terminal where Next.js dev server is running
2. Search for `[APPROVAL]` logs
3. Look for error messages like:
   ```
   [APPROVAL] ERROR: No rows updated for user <id>
   Error updating user: <error details>
   ```

**Common Errors:**
- `No rows updated` → User doesn't exist in `users_v2` table (migration issue)
- `RLS policy violation` → Service role key not configured properly
- `User not found` → Wrong userId sent from frontend

---

## 🔍 DIAGNOSTIC QUERIES

### Verify User Exists in V2 Tables
```sql
-- Check if user exists in users_v2
SELECT id, username, verification_status, registration_type 
FROM users_v2 
WHERE username = '<test_username>';

-- Check if profile exists in profiles_v2
SELECT user_id, anonymous_name 
FROM profiles_v2 
WHERE user_id = '<userId_from_above>';
```

### Check Verification Records
```sql
-- Find all verifications for a user
SELECT id, user_id, status, proof_type, submitted_at, reviewed_at
FROM verifications
WHERE user_id = '<userId>';

-- Check verification files
SELECT id, user_id, file_type, status, uploaded_at
FROM verification_files
WHERE user_id = '<userId>';
```

### Verify Data Migration Completed
```sql
-- Count users in old vs new tables
SELECT 
  (SELECT COUNT(*) FROM users) as old_users_count,
  (SELECT COUNT(*) FROM users_v2) as v2_users_count;

-- Should be equal or v2 should have more
```

---

## ✅ SUCCESS CRITERIA

The fix is working correctly if:

1. ✅ Admin sees success message after clicking "Approve"
2. ✅ Database `users_v2.verification_status` updates to `'verified'`
3. ✅ User logs in and sees dashboard (NOT pending-verification page)
4. ✅ Console shows correct verification status in all logs
5. ✅ User can access: Dashboard, My Profile, Inbox, Notice Board
6. ✅ Refreshing pages doesn't redirect to pending-verification
7. ✅ "Create Post" button visible on My Profile (verified users only)

---

## 📝 FILES MODIFIED

### Backend (API Routes)
- `app/api/auth/login/route.ts`
  - Added console logs for verification status
  - Force fresh database reads (no cache)
  
- `app/api/admin/verifications/route.ts`
  - Added `.select()` to verify database update
  - Added validation checks (row count, status value)
  - Added comprehensive error logging
  - Added automatic rollback on failure

### Frontend (Pages)
- `app/login/page.tsx`
  - **CRITICAL:** Clear ALL localStorage before setting new values
  - Always set verificationStatus (even if undefined)
  - Re-read fresh localStorage values before routing
  - Added console logs for debugging
  
- `app/dashboard/page.tsx`
  - Added console log for auth check
  
- `app/my-profile/page.tsx`
  - Added console log for auth check
  
- `app/inbox/page.tsx`
  - Added console log for auth check

---

## 🚀 DEPLOYMENT CHECKLIST

Before deploying to production:

- [ ] Test approval → login flow with 3 different test users
- [ ] Verify all console logs appear correctly
- [ ] Check database updates are persisting
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices
- [ ] Verify no other users affected by changes
- [ ] Remove or reduce console.log verbosity (optional)
- [ ] Update `.env.local` with correct `SUPABASE_SERVICE_ROLE_KEY`

---

## 📞 SUPPORT

If issues persist after following this guide:

1. **Collect Console Logs:** Copy all `[LOGIN]`, `[APPROVAL]`, and `[DASHBOARD]` logs
2. **Check Database State:** Run diagnostic queries above
3. **Provide Details:**
   - Username of affected user
   - Screenshot of console logs
   - Database query results
   - Steps to reproduce

---

**Testing Date:** _____________  
**Tested By:** _____________  
**Result:** ☐ Pass ☐ Fail  
**Notes:** _____________
