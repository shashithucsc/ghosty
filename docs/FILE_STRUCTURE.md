# 📁 Ghosty Backend - Complete File Structure

Complete directory structure with descriptions of all backend files.

---

## 🌳 File Tree

```
ghosty/
├── 📁 app/
│   ├── 📁 api/                          # Next.js API Routes
│   │   ├── 📁 auth/
│   │   │   ├── 📁 register/
│   │   │   │   └── 📄 route.ts          ✅ User registration endpoint
│   │   │   ├── 📁 activate/
│   │   │   │   └── 📄 route.ts          ✅ Email activation endpoint
│   │   │   └── 📁 login/
│   │   │       └── 📄 route.ts          ✅ Login endpoint (JWT)
│   │   ├── 📁 profile/
│   │   │   └── 📄 route.ts              ✅ Profile CRUD endpoints
│   │   └── 📁 verification/
│   │       └── 📄 route.ts              ✅ Verification upload endpoint
│   │
│   ├── 📁 chat/
│   ├── 📁 dashboard/
│   ├── 📁 inbox/
│   ├── 📁 register/
│   ├── 📄 layout.tsx
│   ├── 📄 page.tsx
│   └── 📄 globals.css
│
├── 📁 lib/                              # Shared libraries
│   ├── 📁 supabase/
│   │   └── 📄 client.ts                 ✅ Supabase client setup
│   ├── 📁 email/
│   │   └── 📄 sendEmail.ts              ✅ Email sending service
│   ├── 📁 utils/
│   │   └── 📄 helpers.ts                ✅ Validators & generators
│   └── 📁 api/
│       └── 📄 registration-example.ts   ✅ Frontend integration example
│
├── 📁 types/                            # TypeScript type definitions
│   ├── 📄 database.types.ts             ✅ Supabase database types
│   └── 📄 api.types.ts                  ✅ API request/response types
│
├── 📁 database/                         # Database files
│   └── 📄 schema.sql                    ✅ PostgreSQL schema
│
├── 📁 components/                       # React components (existing)
│   ├── 📁 chat/
│   ├── 📁 dashboard/
│   ├── 📁 landing/
│   └── 📁 registration/
│
├── 📁 public/                           # Static assets
│
├── 📄 .env.local.example                ✅ Environment variable template
├── 📄 .env.local                        🔒 Your environment variables (gitignored)
├── 📄 .gitignore
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 next.config.ts
│
├── 📄 BACKEND_README.md                 ✅ Complete backend documentation
├── 📄 BACKEND_QUICKSTART.md             ✅ 5-minute setup guide
├── 📄 BACKEND_SUMMARY.md                ✅ Implementation summary
├── 📄 SETUP_CHECKLIST.md                ✅ Setup checklist
└── 📄 FILE_STRUCTURE.md                 ✅ This file
```

---

## 📄 File Descriptions

### **API Routes** (`app/api/`)

#### `app/api/auth/register/route.ts` (151 lines)
**Purpose**: User registration endpoint  
**Method**: POST  
**Features**:
- Email/password validation
- Bcrypt password hashing (12 rounds)
- Duplicate email check
- Activation token generation
- Send activation email
- Resend activation for unverified users

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response**:
```json
{
  "message": "Registration successful!",
  "userId": "uuid"
}
```

---

#### `app/api/auth/activate/route.ts` (76 lines)
**Purpose**: Email activation via link  
**Method**: GET  
**Features**:
- Token validation
- 24-hour expiration check
- Set email_verified = true
- Clear activation token
- Redirect to profile creation

**Request**: `GET /api/auth/activate?token=xxx`  
**Response**: Redirects to `/register/profile?userId=xxx&verified=true`

---

#### `app/api/auth/login/route.ts` (83 lines)
**Purpose**: User login with JWT  
**Method**: POST  
**Features**:
- Email/password verification
- Email verified check
- Password comparison (bcrypt)
- JWT token generation (7-day expiry)
- Return user + profile data

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response**:
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "emailVerified": true,
    "profile": { ... }
  }
}
```

---

#### `app/api/profile/route.ts` (269 lines)
**Purpose**: Profile creation and retrieval  
**Methods**: POST, GET  
**Features**:
- Email verification check
- DOB validation (18+ required)
- Bio length validation (20-500 chars)
- Anonymous name generation
- Gender-based avatar assignment
- Age calculation
- Input sanitization
- Preference settings

**POST Request**:
```json
{
  "userId": "uuid",
  "realName": "John Doe",
  "dateOfBirth": "1995-05-15",
  "gender": "Male",
  "university": "Stanford",
  "faculty": "CS",
  "bio": "Love coding...",
  "interests": ["Tech", "Travel"],
  "preferencesAgeMin": 22,
  "preferencesAgeMax": 30,
  "preferencesGender": ["Female"],
  "preferencesInterests": ["Art"],
  "preferencesHopes": "Someone genuine"
}
```

**GET Request**: `GET /api/profile?userId=xxx`

**Response**:
```json
{
  "profile": {
    "id": "uuid",
    "anonymousName": "CharmingSoul456",
    "avatar": "👨",
    "age": 28,
    ...
  }
}
```

---

#### `app/api/verification/route.ts` (208 lines)
**Purpose**: Verification document uploads  
**Methods**: POST, GET  
**Features**:
- File upload (multipart/form-data)
- File validation (type, size, MIME)
- Supabase Storage upload
- Private bucket storage
- Verification status tracking
- Auto-update profile verification

**POST Request** (multipart/form-data):
```
userId: uuid
fileType: student_id | facebook_screenshot | academic_document
file: <File>
```

**GET Request**: `GET /api/verification?userId=xxx`

**Response**:
```json
{
  "verifications": [
    {
      "id": "uuid",
      "fileType": "student_id",
      "status": "pending",
      "createdAt": "2025-11-12T..."
    }
  ],
  "isVerified": false
}
```

---

### **Libraries** (`lib/`)

#### `lib/supabase/client.ts` (21 lines)
**Purpose**: Supabase client configuration  
**Exports**:
- `supabase` - Client-side instance (anon key)
- `supabaseAdmin` - Server-side instance (service role key)

**Usage**:
```typescript
import { supabaseAdmin } from '@/lib/supabase/client';

const { data, error } = await supabaseAdmin
  .from('users')
  .select('*');
```

---

#### `lib/email/sendEmail.ts` (123 lines)
**Purpose**: Email sending service  
**Features**:
- Nodemailer SMTP transport
- Beautiful HTML email templates
- Plain text fallback
- Activation link generation
- Error handling

**Exports**:
```typescript
sendActivationEmail({ to: string, activationToken: string })
```

**Email Template**: Purple gradient design with Ghosty branding

---

#### `lib/utils/helpers.ts` (167 lines)
**Purpose**: Utility functions  
**Exports**:

**Generators**:
- `generateAnonymousName()` - e.g., "CharmingSoul456"
- `generateAvatar(gender)` - Returns emoji based on gender
- `generateActivationToken()` - UUID v4 token
- `getTokenExpiration()` - 24 hours from now

**Calculators**:
- `calculateAge(dateOfBirth)` - Age from DOB

**Validators**:
- `isValidEmail(email)` - Email format validation
- `isValidPassword(password)` - Password strength (8+ chars, uppercase, lowercase, number)
- `isValidDateOfBirth(dob)` - 18+ age check
- `validateFile(file)` - File type and size validation

**Sanitizers**:
- `sanitizeInput(text)` - Remove < > characters (XSS prevention)

---

#### `lib/api/registration-example.ts` (346 lines)
**Purpose**: Frontend integration examples  
**Features**:
- API service class (`GhostyAPIService`)
- React hooks for registration flow
- Error handling patterns
- Validation helpers
- Complete usage examples

**Exports**:
```typescript
ghostyAPI.register(email, password)
ghostyAPI.login(email, password)
ghostyAPI.createProfile(data)
ghostyAPI.uploadVerification(userId, fileType, file)
validators.email(email)
validators.password(password)
validators.age(dob)
validators.bio(bio)
```

---

### **Types** (`types/`)

#### `types/database.types.ts` (172 lines)
**Purpose**: Supabase database TypeScript types  
**Exports**:
- `Database` interface
- Table types: `users`, `profiles`, `verification_files`
- Row, Insert, Update types for each table

**Usage**:
```typescript
import { Database } from '@/types/database.types';

const supabase = createClient<Database>(url, key);
```

---

#### `types/api.types.ts` (210 lines)
**Purpose**: API request/response TypeScript types  
**Exports**:
- `RegisterRequest`, `RegisterResponse`
- `LoginRequest`, `LoginResponse`
- `CreateProfileRequest`, `ProfileResponse`
- `UploadVerificationRequest`, `VerificationRecord`
- `APIError`
- Complete usage examples

**Usage**:
```typescript
import type { RegisterRequest, RegisterResponse } from '@/types/api.types';

const data: RegisterRequest = { email, password };
const response: RegisterResponse = await fetch(...);
```

---

### **Database** (`database/`)

#### `database/schema.sql` (220 lines)
**Purpose**: Complete PostgreSQL schema  
**Contents**:
- Table definitions (users, profiles, verification_files)
- Indexes for performance
- Row Level Security (RLS) policies
- Triggers for updated_at
- Storage bucket policies
- Sample data comments

**Tables**:
1. **users** - Authentication data
2. **profiles** - User profile information
3. **verification_files** - Verification uploads

**Run in**: Supabase SQL Editor

---

### **Configuration** (`root/`)

#### `.env.local.example` (12 lines)
**Purpose**: Environment variable template  
**Contains**:
- Supabase configuration
- Email/SMTP settings
- App configuration
- JWT secret

**Usage**: Copy to `.env.local` and fill in values

---

### **Documentation** (`root/`)

#### `BACKEND_README.md` (850+ lines)
**Purpose**: Complete backend documentation  
**Sections**:
- Features overview
- Tech stack
- Setup instructions
- Database schema
- API endpoints
- Authentication flow
- Security features
- Testing examples
- Troubleshooting

---

#### `BACKEND_QUICKSTART.md` (310 lines)
**Purpose**: 5-minute setup guide  
**Sections**:
- Prerequisites
- Step-by-step Supabase setup
- Email configuration
- Environment variables
- Test commands
- Common issues
- Success checklist

---

#### `BACKEND_SUMMARY.md` (440 lines)
**Purpose**: Implementation summary  
**Sections**:
- Files created list
- Features implemented
- API endpoints table
- Database schema overview
- Security features
- Example workflow
- Testing commands
- Next steps

---

#### `SETUP_CHECKLIST.md` (450 lines)
**Purpose**: Complete setup checklist  
**Sections**:
- Pre-setup requirements
- Database setup (with checkboxes)
- Email configuration
- Environment variables
- NPM dependencies
- Testing steps
- Security checklist
- Production checklist

---

#### `FILE_STRUCTURE.md` (This file)
**Purpose**: Complete file structure documentation  
**Contents**:
- Visual file tree
- File descriptions
- Line counts
- Feature lists
- Usage examples

---

## 📊 Statistics

### Files Created
- **API Routes**: 5 files (851 lines)
- **Libraries**: 4 files (657 lines)
- **Types**: 2 files (382 lines)
- **Database**: 1 file (220 lines)
- **Config**: 1 file (12 lines)
- **Documentation**: 5 files (2,550+ lines)

**Total**: 18 new files, ~4,672 lines of code + documentation

---

## 🔑 Key Files by Function

### **Must Configure**
1. `.env.local` - Environment variables
2. `database/schema.sql` - Run in Supabase

### **Core API**
1. `app/api/auth/register/route.ts`
2. `app/api/auth/activate/route.ts`
3. `app/api/auth/login/route.ts`
4. `app/api/profile/route.ts`
5. `app/api/verification/route.ts`

### **Helper Libraries**
1. `lib/supabase/client.ts`
2. `lib/email/sendEmail.ts`
3. `lib/utils/helpers.ts`

### **Frontend Integration**
1. `lib/api/registration-example.ts`
2. `types/api.types.ts`

### **Documentation**
1. `BACKEND_README.md` - Read first
2. `BACKEND_QUICKSTART.md` - Setup guide
3. `SETUP_CHECKLIST.md` - Step-by-step checklist

---

## 🎯 Quick Reference

### Start Here
1. Read `BACKEND_QUICKSTART.md`
2. Follow `SETUP_CHECKLIST.md`
3. Run `database/schema.sql`
4. Configure `.env.local`
5. Test with cURL commands

### Integration
1. Review `lib/api/registration-example.ts`
2. Import types from `types/api.types.ts`
3. Call API endpoints
4. Handle responses

### Troubleshooting
1. Check `BACKEND_README.md` → Troubleshooting
2. Verify `.env.local` variables
3. Check Supabase logs
4. Test with cURL

---

**Built with ❤️ for Ghosty Dating Platform**
