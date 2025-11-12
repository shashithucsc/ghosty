# Ghosty Backend - Registration & Profile Creation

Complete backend implementation for user registration, email verification, profile creation, and verification badge system using **Next.js 16** and **Supabase**.

---

## 📚 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Authentication Flow](#authentication-flow)
- [Profile Creation Flow](#profile-creation-flow)
- [Verification Badge System](#verification-badge-system)
- [Security Features](#security-features)
- [Testing](#testing)

---

## ✨ Features

### Authentication
- ✅ Email + Password registration
- ✅ Bcrypt password hashing (12 rounds)
- ✅ Email verification with activation link
- ✅ 24-hour token expiration
- ✅ Resend activation email for unverified users
- ✅ JWT-based login with 7-day expiration

### Profile Creation
- ✅ Anonymous username generation (e.g., "CharmingSoul456")
- ✅ Gender-based avatar assignment (emoji)
- ✅ Age calculation from date of birth
- ✅ Input validation and sanitization
- ✅ Partner preference settings
- ✅ University and faculty tracking
- ✅ Bio with 20-500 character limit

### Verification Badge System
- ✅ Upload Facebook screenshots, student IDs, or academic documents
- ✅ Private Supabase storage
- ✅ File validation (type, size)
- ✅ Verification request tracking
- ✅ Status: pending, approved, rejected
- ✅ Auto-update profile verification status

---

## 🛠 Tech Stack

- **Framework**: Next.js 16.0.1 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (private buckets)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Email**: Nodemailer (SMTP)
- **TypeScript**: Strict mode

---

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd ghosty
npm install
```

**Installed packages:**
- `@supabase/supabase-js` - Supabase client
- `@supabase/ssr` - Server-side rendering support
- `bcryptjs` - Password hashing
- `nodemailer` - Email sending
- `jsonwebtoken` - JWT tokens
- `uuid` - Unique ID generation

### 2. Set Up Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **API Keys**
3. Go to **SQL Editor** and run `database/schema.sql` to create tables
4. Go to **Storage** → Create bucket `verification-files` (set to **Private**)

### 3. Configure Environment Variables

Create `.env.local` in the root directory (copy from `.env.local.example`):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password  # Generate at Google Account > Security > App Passwords
EMAIL_FROM=noreply@ghosty.app

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=your_secure_random_string_change_this
```

### 4. Run Development Server

```bash
npm run dev
```

Server will be available at **http://localhost:3000**

---

## 🗄 Database Schema

### Tables

#### `users`
Stores authentication data.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | VARCHAR | Unique email |
| password_hash | TEXT | Bcrypt hashed password |
| email_verified | BOOLEAN | Email verification status |
| activation_token | UUID | One-time activation token |
| activation_token_expires | TIMESTAMP | Token expiration (24h) |
| created_at | TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | Last update time |

#### `profiles`
Stores user profile information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| anonymous_name | VARCHAR | Unique anonymous username |
| avatar | VARCHAR | Emoji avatar |
| real_name | VARCHAR | Real name (private) |
| date_of_birth | DATE | DOB (private) |
| age | INTEGER | Calculated age |
| gender | VARCHAR | Male/Female/Non-binary/Other |
| university | VARCHAR | University name |
| faculty | VARCHAR | Faculty/Department |
| bio | TEXT | User bio (20-500 chars) |
| interests | TEXT[] | Array of interests |
| is_verified | BOOLEAN | Verification badge status |
| preferences_age_min | INTEGER | Min age preference |
| preferences_age_max | INTEGER | Max age preference |
| preferences_gender | TEXT[] | Gender preferences |
| preferences_interests | TEXT[] | Interest preferences |
| preferences_hopes | TEXT | What user hopes from partner |
| profile_completed | BOOLEAN | Profile completion status |
| created_at | TIMESTAMP | Profile creation time |
| updated_at | TIMESTAMP | Last update time |

#### `verification_files`
Stores verification document uploads.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| file_type | VARCHAR | facebook_screenshot / student_id / academic_document |
| file_path | TEXT | Supabase storage path |
| file_name | VARCHAR | Original filename |
| file_size | INTEGER | File size in bytes |
| mime_type | VARCHAR | MIME type |
| status | VARCHAR | pending / approved / rejected |
| rejection_reason | TEXT | Admin rejection reason |
| reviewed_at | TIMESTAMP | Review timestamp |
| reviewed_by | UUID | Admin user ID |
| created_at | TIMESTAMP | Upload time |

---

## 🔌 API Endpoints

### Authentication

#### `POST /api/auth/register`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (201):**
```json
{
  "message": "Registration successful! Please check your email to activate your account.",
  "userId": "uuid"
}
```

**Validations:**
- Email format validation
- Password: min 8 chars, 1 uppercase, 1 lowercase, 1 number
- Duplicate email check
- Resend activation if user exists but unverified

---

#### `GET /api/auth/activate?token=xxx`
Activate user account via email link.

**Query Params:**
- `token` - Activation token from email

**Response:**
- Redirects to `/register/profile?userId=xxx&verified=true` on success
- Redirects to `/register?error=invalid_token` on failure

**Flow:**
1. Validate token existence and expiration
2. Set `email_verified = true`
3. Clear activation token
4. Redirect to profile creation

---

#### `POST /api/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "emailVerified": true,
    "profile": { /* profile data */ }
  }
}
```

**Errors:**
- `401` - Invalid credentials
- `403` - Email not verified

---

### Profile

#### `POST /api/profile`
Create user profile (after email verification).

**Request Body:**
```json
{
  "userId": "uuid",
  "realName": "John Doe",
  "dateOfBirth": "1995-05-15",
  "gender": "Male",
  "university": "Stanford University",
  "faculty": "Computer Science",
  "bio": "Love coding, hiking, and meeting new people!",
  "interests": ["Technology", "Travel", "Music"],
  "preferencesAgeMin": 22,
  "preferencesAgeMax": 30,
  "preferencesGender": ["Female"],
  "preferencesInterests": ["Technology", "Art"],
  "preferencesHopes": "Looking for someone genuine and kind"
}
```

**Response (201):**
```json
{
  "message": "Profile created successfully!",
  "profile": {
    "id": "uuid",
    "anonymousName": "CharmingSoul456",
    "avatar": "👨",
    "age": 28,
    "gender": "Male",
    "university": "Stanford University",
    "faculty": "Computer Science",
    "bio": "Love coding...",
    "interests": ["Technology", "Travel", "Music"],
    "isVerified": false,
    "preferences": {
      "ageMin": 22,
      "ageMax": 30,
      "gender": ["Female"],
      "interests": ["Technology", "Art"],
      "hopes": "Looking for someone genuine and kind"
    },
    "profileCompleted": true,
    "createdAt": "2025-11-12T..."
  }
}
```

**Validations:**
- User must be email verified
- DOB must be 18+ years old
- Bio: 20-500 characters
- Age preferences: 18-100, min ≤ max
- Unique anonymous name generation (max 10 attempts)
- Gender: Male, Female, Non-binary, Other

**Auto-Generated:**
- `anonymousName` - e.g., "CharmingSoul456"
- `avatar` - Gender-based emoji (👨👩🧑✨)
- `age` - Calculated from DOB

---

#### `GET /api/profile?userId=xxx`
Get user profile.

**Response (200):**
```json
{
  "profile": {
    "id": "uuid",
    "anonymousName": "CharmingSoul456",
    "avatar": "👨",
    "age": 28,
    /* ... other fields, excluding realName and dateOfBirth */
  }
}
```

---

### Verification

#### `POST /api/verification`
Upload verification document.

**Request (multipart/form-data):**
```
userId: uuid
fileType: facebook_screenshot | student_id | academic_document
file: <File>
```

**Response (201):**
```json
{
  "message": "Verification document uploaded successfully! Your request is pending review.",
  "verification": {
    "id": "uuid",
    "fileType": "student_id",
    "status": "pending",
    "createdAt": "2025-11-12T..."
  }
}
```

**Validations:**
- File type: image/jpeg, image/png, image/jpg, application/pdf
- Max file size: 5MB
- User must have a profile
- No duplicate pending/approved requests for same file type

**Process:**
1. Validate file and user
2. Upload to Supabase Storage (`verification-files` bucket)
3. Save record to `verification_files` table with status `pending`
4. Return upload confirmation

---

#### `GET /api/verification?userId=xxx`
Get verification status.

**Response (200):**
```json
{
  "verifications": [
    {
      "id": "uuid",
      "fileType": "student_id",
      "status": "approved",
      "createdAt": "2025-11-12T...",
      "reviewedAt": "2025-11-13T...",
      "rejectionReason": null
    }
  ],
  "isVerified": true
}
```

**Auto-Update:**
- If any verification is approved, sets `profiles.is_verified = true`

---

## 🔐 Authentication Flow

```
1. User Registration
   ↓
2. Email Sent (Activation Link)
   ↓
3. User Clicks Link → /api/auth/activate?token=xxx
   ↓
4. Token Validated (24h expiration)
   ↓
5. Email Verified → Redirect to /register/profile
   ↓
6. User Creates Profile
   ↓
7. Profile Completed → Redirect to /dashboard
   ↓
8. User Can Login with JWT
```

---

## 👤 Profile Creation Flow

```
1. User Email Verified
   ↓
2. POST /api/profile
   ↓
3. Validate Inputs
   ↓
4. Generate Anonymous Name
   ├─ Adjective + Noun + Number
   └─ Ensure Uniqueness (max 10 attempts)
   ↓
5. Generate Avatar
   └─ Based on Gender (emoji)
   ↓
6. Calculate Age from DOB
   ↓
7. Save to Database
   ↓
8. Return Profile (excluding sensitive data)
```

**Anonymous Name Examples:**
- CharmingSoul456
- BraveExplorer789
- GentleDreamer234

**Avatar Examples:**
- Male: 👨🧑👨‍💼👨‍🎓🙋‍♂️
- Female: 👩👸💃👩‍🎓👩‍💼
- Non-binary: 🧑⭐✨🌟💫

---

## 🏆 Verification Badge System

### Upload Process

```
1. User Uploads Document
   ↓
2. Validate File (type, size, format)
   ↓
3. Upload to Supabase Storage
   └─ Private Bucket: verification-files
   └─ Path: verification/{userId}/{filename}
   ↓
4. Save Record to verification_files Table
   └─ Status: pending
   ↓
5. Admin Reviews (Manual Process)
   ↓
6. Admin Updates Status
   ├─ approved → Set profiles.is_verified = true
   └─ rejected → Add rejection_reason
```

### Accepted File Types

| Type | Formats | Max Size |
|------|---------|----------|
| Facebook Screenshot | JPG, PNG | 5MB |
| Student ID | JPG, PNG, PDF | 5MB |
| Academic Document | JPG, PNG, PDF | 5MB |

### Verification Status

- **pending** - Awaiting admin review
- **approved** - Verified ✅ (profile badge enabled)
- **rejected** - Rejected with reason

---

## 🔒 Security Features

### Password Security
- **Bcrypt hashing** with 12 rounds (industry standard)
- **Minimum requirements**: 8 chars, 1 uppercase, 1 lowercase, 1 number
- Passwords never stored in plain text
- Never returned in API responses

### Email Verification
- **UUID tokens** (cryptographically secure)
- **24-hour expiration** (prevents old token reuse)
- **One-time use** (token cleared after activation)
- Prevents unverified users from accessing platform

### Input Validation
- **Email format validation** (regex)
- **Age verification** (18+ required)
- **Bio length limits** (20-500 chars, prevents spam)
- **File validation** (type, size, MIME type)
- **SQL injection protection** (Supabase parameterized queries)
- **XSS protection** (input sanitization with `<>` removal)

### JWT Tokens
- **7-day expiration** (balance between UX and security)
- **Signed with secret key** (env variable)
- Contains only non-sensitive data (userId, email)

### Storage Security
- **Private buckets** (verification files not publicly accessible)
- **User-scoped uploads** (users can only upload to their own folder)
- **Admin-only viewing** (RLS policies)

### Database Security
- **Row Level Security (RLS)** enabled on all tables
- Users can only view own data
- Profiles viewable by all (for matching)
- Verification files user-scoped

---

## 🧪 Testing

### Test with cURL

#### 1. Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'
```

#### 2. Activate Account
Click link in email or visit:
```
http://localhost:3000/api/auth/activate?token=<token-from-email>
```

#### 3. Create Profile
```bash
curl -X POST http://localhost:3000/api/profile \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"<user-id>",
    "realName":"John Doe",
    "dateOfBirth":"1995-05-15",
    "gender":"Male",
    "university":"Stanford",
    "faculty":"CS",
    "bio":"Love coding and meeting new people!",
    "interests":["Tech","Travel"],
    "preferencesAgeMin":22,
    "preferencesAgeMax":30,
    "preferencesGender":["Female"],
    "preferencesInterests":["Art"],
    "preferencesHopes":"Someone genuine"
  }'
```

#### 4. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'
```

#### 5. Upload Verification
```bash
curl -X POST http://localhost:3000/api/verification \
  -F "userId=<user-id>" \
  -F "fileType=student_id" \
  -F "file=@/path/to/id.jpg"
```

---

## 📂 File Structure

```
ghosty/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts      # Registration endpoint
│   │   │   ├── activate/route.ts      # Email activation
│   │   │   └── login/route.ts         # Login endpoint
│   │   ├── profile/route.ts           # Profile CRUD
│   │   └── verification/route.ts      # Verification uploads
├── lib/
│   ├── supabase/
│   │   └── client.ts                  # Supabase clients
│   ├── email/
│   │   └── sendEmail.ts               # Email sending
│   └── utils/
│       └── helpers.ts                 # Validators & generators
├── types/
│   └── database.types.ts              # TypeScript types
├── database/
│   └── schema.sql                     # SQL schema
├── .env.local.example                 # Environment template
└── BACKEND_README.md                  # This file
```

---

## 🎯 Next Steps

### Frontend Integration
1. Update `app/register/page.tsx` to call `/api/auth/register`
2. Create email verification success page
3. Update profile creation to call `/api/profile`
4. Add verification upload UI in dashboard

### Admin Dashboard (Future)
1. Create admin panel to review verifications
2. Add approval/rejection actions
3. Auto-email users on status changes

### Production Deployment
1. Update environment variables
2. Configure production SMTP (SendGrid, AWS SES)
3. Set up Supabase production project
4. Enable rate limiting
5. Add monitoring (Sentry, LogRocket)

---

## 🆘 Troubleshooting

### Email Not Sending
- Check SMTP credentials in `.env.local`
- For Gmail: Enable "App Passwords" in Google Account settings
- Check spam folder

### Supabase Errors
- Verify project URL and keys in `.env.local`
- Check SQL schema was run successfully
- Enable RLS policies
- Create storage bucket `verification-files` (private)

### TypeScript Errors
- The `never` type errors are expected due to Supabase type generation
- Run app - it compiles successfully despite warnings
- To fix: Generate types from Supabase CLI (optional)

---

## 📄 License

MIT License - Ghosty Dating Platform 2025

---

**Built with ❤️ using Next.js 16 + Supabase**
