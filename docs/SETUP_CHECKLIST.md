# ✅ Ghosty Backend Setup Checklist

Use this checklist to ensure your backend is fully configured and ready for production.

---

## 📋 Pre-Setup Requirements

- [ ] Node.js 18+ installed
- [ ] npm or yarn installed
- [ ] Supabase account created
- [ ] Email service account (Gmail/SendGrid/AWS SES)
- [ ] Code editor (VS Code recommended)

---

## 🗄️ Database Setup

### Supabase Project
- [ ] Create new Supabase project
- [ ] Note project name and region
- [ ] Save database password securely
- [ ] Wait for project initialization (2-3 mins)

### Get API Credentials
- [ ] Go to Project Settings → API
- [ ] Copy `Project URL` to `.env.local`
- [ ] Copy `anon public` key to `.env.local`
- [ ] Copy `service_role` key to `.env.local` (⚠️ NEVER expose publicly)

### Run SQL Schema
- [ ] Open Supabase SQL Editor
- [ ] Create new query
- [ ] Copy entire `database/schema.sql` file
- [ ] Run query
- [ ] Verify success messages for all tables
- [ ] Check Table Editor - should see `users`, `profiles`, `verification_files`

### Verify Indexes
- [ ] Check `users` table has index on `email`
- [ ] Check `profiles` table has index on `anonymous_name`
- [ ] Check `verification_files` table has index on `user_id`

### Enable Row Level Security
- [ ] Go to Authentication → Policies
- [ ] Verify RLS is enabled on all tables
- [ ] Check policies exist:
  - Users can view own data
  - Anyone can view profiles
  - Users can update own profile
  - Users can view own verifications

### Create Storage Bucket
- [ ] Go to Storage
- [ ] Click "New Bucket"
- [ ] Name: `verification-files`
- [ ] Set to **Private** (not public)
- [ ] Create bucket
- [ ] Verify bucket appears in list

---

## 📧 Email Configuration

### Gmail Setup (Recommended for Testing)
- [ ] Go to [myaccount.google.com](https://myaccount.google.com)
- [ ] Enable 2-Factor Authentication
- [ ] Navigate to Security → App Passwords
- [ ] Create new app password (name: "Ghosty App")
- [ ] Copy 16-character password
- [ ] Add to `.env.local` as `SMTP_PASSWORD` (remove spaces)

### Alternative Email Services
- [ ] **SendGrid**: Get API key, add to `.env.local`
- [ ] **AWS SES**: Configure SMTP credentials
- [ ] **Mailgun**: Get SMTP credentials

### Verify Email Settings
- [ ] `SMTP_HOST` is correct (smtp.gmail.com for Gmail)
- [ ] `SMTP_PORT` is 587 (or 465 for SSL)
- [ ] `SMTP_USER` is your email address
- [ ] `SMTP_PASSWORD` is app password (not your regular password)
- [ ] `EMAIL_FROM` is set (can be any email)

---

## ⚙️ Environment Variables

### Create `.env.local`
- [ ] Copy `.env.local.example` to `.env.local`
- [ ] Add to `.gitignore` (should already be there)

### Fill in Supabase Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

- [ ] `NEXT_PUBLIC_SUPABASE_URL` matches your project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the anon/public key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is the service role key (keep secret!)

### Fill in Email Variables
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=noreply@ghosty.app
```

- [ ] `SMTP_HOST` is correct for your provider
- [ ] `SMTP_PORT` is correct (587 for TLS, 465 for SSL)
- [ ] `SMTP_USER` is your email
- [ ] `SMTP_PASSWORD` is app password (no spaces)
- [ ] `EMAIL_FROM` is set (can be different from SMTP_USER)

### Fill in App Variables
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
```

- [ ] `NEXT_PUBLIC_APP_URL` is correct for your environment
- [ ] `JWT_SECRET` is at least 32 characters
- [ ] `JWT_SECRET` is random and unique (generate with: `openssl rand -base64 32`)

---

## 📦 NPM Dependencies

### Install Backend Packages
```bash
npm install @supabase/supabase-js @supabase/ssr bcryptjs nodemailer jsonwebtoken uuid
```

- [ ] `@supabase/supabase-js` installed
- [ ] `@supabase/ssr` installed
- [ ] `bcryptjs` installed
- [ ] `nodemailer` installed
- [ ] `jsonwebtoken` installed
- [ ] `uuid` installed

### Install Type Definitions
```bash
npm install --save-dev @types/nodemailer @types/bcryptjs @types/jsonwebtoken
```

- [ ] `@types/nodemailer` installed
- [ ] `@types/bcryptjs` installed
- [ ] `@types/jsonwebtoken` installed

### Verify Installation
- [ ] Check `package.json` - all packages listed
- [ ] Run `npm list` - no missing dependencies
- [ ] No peer dependency warnings

---

## 🧪 Testing

### Start Development Server
```bash
npm run dev
```

- [ ] Server starts without errors
- [ ] No TypeScript compilation errors (warnings are OK)
- [ ] Server accessible at `http://localhost:3000`

### Test Registration Endpoint
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'
```

- [ ] Returns 201 status
- [ ] Returns `userId` in response
- [ ] Returns success message
- [ ] No server errors in console

### Verify Email Sent
- [ ] Check email inbox (including spam)
- [ ] Email received within 30 seconds
- [ ] Email has Ghosty branding
- [ ] Activation link is present
- [ ] Link format: `http://localhost:3000/api/auth/activate?token=xxx`

### Verify Database Entry
- [ ] Open Supabase Table Editor
- [ ] Check `users` table
- [ ] New user exists with email
- [ ] `email_verified` is `false`
- [ ] `activation_token` is not null
- [ ] `password_hash` is bcrypt hash (starts with `$2a$` or `$2b$`)

### Test Email Activation
- [ ] Click activation link in email
- [ ] Redirects to `/register/profile?userId=xxx&verified=true`
- [ ] Check database - `email_verified` is now `true`
- [ ] `activation_token` is cleared (null)

### Test Profile Creation
```bash
curl -X POST http://localhost:3000/api/profile \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"paste-user-id-here",
    "realName":"John Doe",
    "dateOfBirth":"1995-05-15",
    "gender":"Male",
    "university":"Stanford",
    "faculty":"CS",
    "bio":"Love coding and meeting new people! Always up for adventures.",
    "interests":["Tech","Travel"],
    "preferencesAgeMin":22,
    "preferencesAgeMax":30,
    "preferencesGender":["Female"],
    "preferencesInterests":["Art"],
    "preferencesHopes":"Someone genuine"
  }'
```

- [ ] Returns 201 status
- [ ] Returns profile object
- [ ] `anonymousName` is auto-generated (e.g., "CharmingSoul456")
- [ ] `avatar` is emoji (e.g., "👨")
- [ ] `age` is calculated correctly from DOB
- [ ] `isVerified` is `false`

### Verify Profile in Database
- [ ] Check `profiles` table
- [ ] Profile exists with correct `user_id`
- [ ] `anonymous_name` is unique
- [ ] All fields populated correctly
- [ ] `profile_completed` is `true`

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'
```

- [ ] Returns 200 status
- [ ] Returns JWT token
- [ ] Returns user object with profile
- [ ] Token is valid JWT format

### Test File Upload
```bash
curl -X POST http://localhost:3000/api/verification \
  -F "userId=paste-user-id-here" \
  -F "fileType=student_id" \
  -F "file=@/path/to/test-image.jpg"
```

- [ ] Returns 201 status
- [ ] Returns verification object
- [ ] `status` is "pending"
- [ ] File appears in Supabase Storage
- [ ] Entry exists in `verification_files` table

---

## 🔒 Security Checklist

### Password Security
- [ ] Passwords are hashed with bcrypt (12 rounds)
- [ ] Passwords never returned in API responses
- [ ] Password validation enforced (8+ chars, uppercase, lowercase, number)

### Email Security
- [ ] Email verification required before login
- [ ] Activation tokens expire after 24 hours
- [ ] Tokens are one-time use (cleared after activation)
- [ ] Tokens are UUIDs (cryptographically secure)

### Database Security
- [ ] Row Level Security (RLS) enabled on all tables
- [ ] Service role key kept secret (not in frontend code)
- [ ] Anon key used for client-side operations only
- [ ] SQL injection prevented (parameterized queries)

### Input Validation
- [ ] Email format validated
- [ ] Password strength validated
- [ ] Age verified (18+ required)
- [ ] Bio length enforced (20-500 chars)
- [ ] File types validated (JPG, PNG, PDF only)
- [ ] File size limited (5MB max)
- [ ] XSS prevention (input sanitization)

### Storage Security
- [ ] Verification files bucket is private
- [ ] Users can only upload to own folder
- [ ] Only admins can view verification files

### JWT Security
- [ ] JWT secret is strong and unique
- [ ] JWT tokens expire after 7 days
- [ ] JWT contains no sensitive data (only userId, email)

---

## 📊 Monitoring & Logs

### Check Server Logs
- [ ] No errors in terminal
- [ ] Successful requests logged
- [ ] Failed requests show error messages
- [ ] Database queries logged (if debug mode on)

### Check Supabase Logs
- [ ] Go to Supabase → Logs
- [ ] Check for database errors
- [ ] Check for storage errors
- [ ] Monitor API usage

### Error Handling
- [ ] 400 errors return helpful messages
- [ ] 500 errors logged server-side
- [ ] Client receives generic error (no sensitive info leaked)

---

## 🚀 Production Checklist

### Before Deploying
- [ ] All tests passing
- [ ] No console.log statements in production code
- [ ] Environment variables set for production
- [ ] Production Supabase project created
- [ ] Production email service configured
- [ ] JWT secret changed from development
- [ ] CORS configured correctly
- [ ] Rate limiting implemented
- [ ] Error monitoring set up (Sentry, LogRocket)
- [ ] Backup strategy in place

### Production Environment Variables
- [ ] `NEXT_PUBLIC_APP_URL` updated to production URL
- [ ] `NEXT_PUBLIC_SUPABASE_URL` updated to production project
- [ ] All keys updated to production values
- [ ] SMTP credentials updated to production email service
- [ ] `JWT_SECRET` is new and unique

### Deploy Checklist
- [ ] Build succeeds (`npm run build`)
- [ ] No build warnings
- [ ] Production database migrated
- [ ] Storage bucket created in production
- [ ] DNS configured
- [ ] HTTPS enabled
- [ ] CDN configured (if applicable)

---

## 🎯 Final Verification

### Registration Flow
- [ ] User can register with email/password
- [ ] Activation email sent immediately
- [ ] Activation link works
- [ ] User redirected to profile creation
- [ ] Profile creation successful
- [ ] Login works with created credentials

### Profile Features
- [ ] Anonymous name generated correctly
- [ ] Avatar assigned based on gender
- [ ] Age calculated from DOB
- [ ] Preferences saved correctly
- [ ] Profile viewable via API

### Verification System
- [ ] Files upload successfully
- [ ] Files stored in private bucket
- [ ] Verification status tracked
- [ ] Multiple document types supported

---

## ✅ All Done!

If all checkboxes are checked, your Ghosty backend is ready! 🎉

### Next Steps:
1. Integrate with frontend
2. Create admin dashboard for verification reviews
3. Add additional features (matching algorithm, chat, etc.)
4. Deploy to production

---

## 🆘 Troubleshooting

If anything fails, check:

1. **`.env.local` file exists and has all variables**
2. **Supabase project is running**
3. **Database schema was run successfully**
4. **Storage bucket exists and is private**
5. **Email credentials are correct**
6. **Server is running (`npm run dev`)**

For detailed troubleshooting, see `BACKEND_README.md` → Troubleshooting section.

---

**Good luck! 🚀**
