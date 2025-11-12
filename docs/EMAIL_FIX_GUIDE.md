# 🔧 Email Not Sending - Quick Fix Guide

## ✅ Issues Fixed

1. ✅ **SMTP Password** - Removed spaces (was: "simi dgba sqcx tucd", now: "simidbgasqcxtucd")
2. ✅ **Added .env.local file** - Was missing email configuration

## ⏳ Still Need to Do

### 1️⃣ Get Supabase Service Role Key

**Current Issue:** Your `.env.local` has a placeholder for `SUPABASE_SERVICE_ROLE_KEY`

**How to Fix:**
1. Go to: https://supabase.com/dashboard/project/bvgdvwerkhncnopbxxdu/settings/api
2. Scroll down to **"Project API keys"**
3. Find the **"service_role"** key (it's the SECRET one, not the anon key)
4. Click "Copy" or reveal and copy the key
5. Open `.env.local` file
6. Replace this line:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
   ```
   With:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_actual_key_from_supabase
   ```

**⚠️ IMPORTANT:** The service role key starts with `eyJhbGc...` (similar to anon key but different)

---

### 2️⃣ Restart Development Server

After updating `.env.local`:

**Stop the current server:**
- Press `Ctrl + C` in the terminal running `npm run dev`

**Start it again:**
```bash
npm run dev
```

**Why?** Next.js only reads `.env.local` on startup. Changes won't apply until restart.

---

## 🧪 Test Email After Fixing

### Option 1: Register a Test User

1. Go to http://localhost:3000/register
2. Enter email: `your-test-email@gmail.com`
3. Enter password: `Test123456`
4. Click Register
5. Check your email inbox

### Option 2: Check Server Logs

After registration, check the terminal for:
- ✅ **Success:** No errors shown
- ❌ **Error:** Look for error messages like:
  - "Error sending activation email"
  - "SMTP connection failed"
  - "Authentication failed"

---

## 🔍 Common Gmail Issues

### If Still Not Working:

#### Issue A: Gmail App Password Invalid
**Symptoms:** "Invalid login" or "Authentication failed"

**Fix:**
1. Go to https://myaccount.google.com/apppasswords
2. **Generate a NEW App Password:**
   - Select app: "Mail"
   - Select device: "Other (Custom name)" → Type "Ghosty"
   - Click "Generate"
3. Copy the 16-character password (it will show with spaces, **remove them**)
4. Update `.env.local` with the new password
5. Restart dev server

#### Issue B: "Less Secure Apps" Blocked
**Symptoms:** "Access denied" or "Sign-in attempt blocked"

**Fix:**
1. Use App Password instead (see Issue A)
2. OR enable less secure apps: https://myaccount.google.com/lesssecureapps

#### Issue C: 2-Factor Authentication Issues
**Symptoms:** Login works but emails don't send

**Fix:**
1. Make sure you're using an **App Password**, not your regular Gmail password
2. App Passwords only work when 2FA is **enabled**

---

## ✅ Checklist

Before testing, verify:

- [ ] `.env.local` exists (not just `.env.local.example`)
- [ ] SMTP_PASSWORD has **no spaces** (`simidbgasqcxtucd`)
- [ ] SUPABASE_SERVICE_ROLE_KEY is filled in (not placeholder)
- [ ] Development server was **restarted** after changing `.env.local`
- [ ] Email is `kichibichiofficial@gmail.com`
- [ ] Password is a Gmail **App Password** (16 chars, no spaces)

---

## 🆘 If Still Not Working

### Check Terminal Output

When you register a user, look for these messages in terminal:

**✅ Good:**
```
Registration successful! Please check your email...
```

**❌ Bad:**
```
Error sending activation email: <reason>
```

### Common Error Messages:

| Error | Cause | Fix |
|-------|-------|-----|
| "Invalid login" | Wrong password | Generate new App Password |
| "Connection timeout" | Wrong SMTP host/port | Should be smtp.gmail.com:587 |
| "Authentication failed" | Not using App Password | Create App Password in Google |
| "User not found" | SMTP_USER wrong | Should be kichibichiofficial@gmail.com |

---

## 📧 Current Configuration

```env
SMTP_HOST=smtp.gmail.com          ✅
SMTP_PORT=587                     ✅
SMTP_USER=kichibichiofficial@gmail.com  ✅
SMTP_PASSWORD=simidbgasqcxtucd    ✅ (spaces removed)
EMAIL_FROM=noreply@ghosty.app     ✅
```

**Next Step:** Get Supabase Service Role Key and restart server!

---

## 🎯 Quick Test Command

After fixing everything, test with:

```bash
# In a NEW terminal (keep dev server running in other terminal)
node test-email.js
```

This will:
1. Check all environment variables
2. Test SMTP connection
3. Send a test email to kichibichiofficial@gmail.com
4. Show detailed error if it fails

---

**Need more help?** Check the error messages in terminal and match them to the "Common Error Messages" table above.
