# 🚀 Ghosty Backend - Quick Start Guide

Get the Ghosty backend up and running in **5 minutes**!

---

## ✅ Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Email service (Gmail recommended for testing)

---

## 📋 Step-by-Step Setup

### 1️⃣ Supabase Project Setup (5 minutes)

1. **Create Supabase Project**
   - Go to [supabase.com/dashboard](https://supabase.com/dashboard)
   - Click "New Project"
   - Choose organization, project name, database password
   - Wait for project to initialize (~2 mins)

2. **Get API Keys**
   - Go to Project Settings → API
   - Copy:
     - `Project URL` (e.g., https://xxxxx.supabase.co)
     - `anon public` key
     - `service_role` key (⚠️ keep this secret!)

3. **Run Database Schema**
   - Go to SQL Editor (left sidebar)
   - Click "New Query"
   - Copy contents from `ghosty/database/schema.sql`
   - Paste and click "Run"
   - ✅ Should see "Success" messages for all tables

4. **Create Storage Bucket**
   - Go to Storage (left sidebar)
   - Click "New Bucket"
   - Name: `verification-files`
   - **Important**: Set to **Private** (not public)
   - Click "Create Bucket"

---

### 2️⃣ Email Configuration (3 minutes)

**Using Gmail (Recommended for testing):**

1. **Enable 2-Factor Authentication**
   - Go to [myaccount.google.com/security](https://myaccount.google.com/security)
   - Enable 2-Step Verification

2. **Generate App Password**
   - Search "App Passwords" in Google Account
   - Create new app password
   - Name it "Ghosty App"
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

---

### 3️⃣ Environment Variables (2 minutes)

1. **Create `.env.local` file** in `ghosty/` directory:

```bash
# Copy from example
cp .env.local.example .env.local
```

2. **Fill in your values**:

```env
# Supabase (from Step 1)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Email (from Step 2)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=noreply@ghosty.app

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=my-super-secret-jwt-key-change-this-in-production
```

⚠️ **Security Note**: Never commit `.env.local` to Git!

---

### 4️⃣ Run the App (1 minute)

```bash
cd ghosty
npm run dev
```

✅ Server should start at **http://localhost:3000**

---

## 🧪 Test the Backend

### Test 1: Register User

Open a new terminal and run:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

**Expected Response:**
```json
{
  "message": "Registration successful! Please check your email to activate your account.",
  "userId": "some-uuid-here"
}
```

**Check your email** - you should receive an activation link!

---

### Test 2: Check Database

1. Go to Supabase → Table Editor
2. Click on `users` table
3. You should see your new user with:
   - ✅ Email: test@example.com
   - ✅ email_verified: false
   - ✅ activation_token: (some UUID)

---

### Test 3: Activate Account

1. Click the activation link in the email
2. Should redirect to: `http://localhost:3000/register/profile?userId=xxx&verified=true`
3. Check database again - `email_verified` should now be `true`

---

### Test 4: Create Profile

```bash
curl -X POST http://localhost:3000/api/profile \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "paste-user-id-here",
    "realName": "John Doe",
    "dateOfBirth": "1995-05-15",
    "gender": "Male",
    "university": "Stanford University",
    "faculty": "Computer Science",
    "bio": "Love coding, hiking, and meeting new people! Always up for adventures.",
    "interests": ["Technology", "Travel", "Music"],
    "preferencesAgeMin": 22,
    "preferencesAgeMax": 30,
    "preferencesGender": ["Female"],
    "preferencesInterests": ["Technology", "Art"],
    "preferencesHopes": "Looking for someone genuine and kind"
  }'
```

**Expected Response:**
```json
{
  "message": "Profile created successfully!",
  "profile": {
    "id": "uuid",
    "anonymousName": "CharmingSoul456",  // ← Auto-generated!
    "avatar": "👨",                       // ← Auto-generated!
    "age": 28,                            // ← Calculated from DOB!
    "gender": "Male",
    "university": "Stanford University",
    // ... etc
  }
}
```

---

### Test 5: Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  // ← JWT token
  "user": {
    "id": "uuid",
    "email": "test@example.com",
    "emailVerified": true,
    "profile": { /* full profile data */ }
  }
}
```

---

## 🎉 Success Checklist

- ✅ Supabase project created
- ✅ Database tables created (users, profiles, verification_files)
- ✅ Storage bucket created (verification-files)
- ✅ Email configuration working
- ✅ Environment variables set
- ✅ Server running on localhost:3000
- ✅ User registration working
- ✅ Email activation working
- ✅ Profile creation working
- ✅ Login working

---

## 🐛 Common Issues

### Issue: Email Not Sending

**Solution:**
1. Check Gmail App Password is correct
2. Remove spaces from password in `.env.local`
3. Check spam folder
4. Try with a different email service

### Issue: "Cannot find module '@/types/database.types'"

**Solution:**
This is a TypeScript warning - the app still works! The types exist but TypeScript is catching up.

### Issue: Activation Link Not Working

**Solution:**
1. Check the link hasn't expired (24 hours)
2. Verify `NEXT_PUBLIC_APP_URL` is correct
3. Check server is running

### Issue: Database Errors

**Solution:**
1. Verify SQL schema was run successfully
2. Check all tables exist in Supabase Table Editor
3. Verify service role key has admin privileges

---

## 📚 Next Steps

1. **Read Full Documentation**: `BACKEND_README.md`
2. **Integrate with Frontend**: Update registration forms to call API
3. **Test File Upload**: Try verification badge system
4. **Add Admin Panel**: Review verification requests

---

## 🆘 Need Help?

- Check `BACKEND_README.md` for detailed documentation
- Review API endpoint examples
- Check Supabase logs for errors
- Verify all environment variables are set correctly

---

**You're all set! 🎉 The Ghosty backend is ready for development.**
