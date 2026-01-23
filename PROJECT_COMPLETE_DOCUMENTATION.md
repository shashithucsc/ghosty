# 👻 Ghosty - Complete Project Documentation

> **A comprehensive guide to understanding the Ghosty anonymous dating platform**  
> This document explains the entire project architecture, code structure, data flows, and logic from start to finish.

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture Overview](#3-architecture-overview)
4. [Database Architecture](#4-database-architecture)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [API Routes & Backend Logic](#6-api-routes--backend-logic)
7. [Frontend Components & Pages](#7-frontend-components--pages)
8. [Data Flow Diagrams](#8-data-flow-diagrams)
9. [Key Features Explained](#9-key-features-explained)
10. [Security & Best Practices](#10-security--best-practices)
11. [Deployment Guide](#11-deployment-guide)
12. [Extension & Customization](#12-extension--customization)

---

## 1. Project Overview

### 1.1 What is Ghosty?

Ghosty is a **mobile-first anonymous dating platform** designed for university students. The platform focuses on removing bias from dating by allowing users to:

- **Chat anonymously first** before revealing identities
- **Connect based on personality** rather than physical appearance
- **Build trust through conversation** before making personal information available
- **Get verified** through document uploads (Student ID, Facebook, Academic documents)

### 1.2 Problem It Solves

**Traditional Dating App Issues:**
- Instant judgments based on physical appearance
- Profile pictures can be misleading or fake
- Superficial connections based on looks rather than compatibility
- Privacy concerns with revealing identity upfront

**Ghosty's Solution:**
- Anonymous profiles with generated usernames (e.g., "CharmingSoul456")
- Gender-based emoji avatars instead of photos
- Message request system before starting conversations
- Verification badge system to build trust
- Interest-based and preference-based matching algorithm

### 1.3 Target Users

- **Primary:** University students (18+ years old)
- **Secondary:** Young adults seeking meaningful connections
- **Geographic Focus:** Campus-based (supports multiple universities)

---

## 2. Technology Stack

### 2.1 Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.0.10 | React framework with App Router for routing, SSR, and API routes |
| **React** | 19.2.0 | UI library for building interactive components |
| **TypeScript** | 5.x | Type safety and better developer experience |
| **Tailwind CSS** | 4.x | Utility-first CSS framework for styling |
| **Framer Motion** | 12.23.24 | Animation library for smooth UI transitions |
| **Lucide React** | 0.553.0 | Icon library for UI elements |

**Why These Choices?**
- **Next.js 16**: Provides file-based routing, API routes in the same project, and excellent performance with Server Components
- **TypeScript**: Catches errors at compile-time, improves code maintainability
- **Tailwind CSS**: Rapid UI development with utility classes, consistent design system
- **Framer Motion**: Professional animations without complex CSS

### 2.2 Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Supabase** | 2.81.1 | PostgreSQL database, authentication, storage, and real-time subscriptions |
| **bcryptjs** | 3.0.3 | Password hashing with salt rounds (12 rounds) |
| **jsonwebtoken** | 9.0.2 | JWT token generation for session management |
| **Nodemailer** | 7.0.10 | Email service for sending activation emails |
| **Zod** | 4.1.12 | Schema validation for API requests |
| **uuid** | 13.0.0 | Generating unique IDs for tokens and entities |

**Why These Choices?**
- **Supabase**: Open-source Firebase alternative with PostgreSQL, built-in auth, storage, and real-time features
- **bcryptjs**: Industry-standard password hashing (more secure than plain text or MD5)
- **JWT**: Stateless authentication, scalable, works across devices
- **Zod**: Type-safe schema validation that integrates with TypeScript

### 2.3 Development Tools

```json
{
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/node": "^20",
    "@types/nodemailer": "^7.0.3",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.0.1"
  }
}
```

---

## 3. Architecture Overview

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  (Browser - Next.js App with React Components)              │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Landing    │  │   Dashboard  │  │    Inbox     │     │
│  │     Page     │  │   (Swipes)   │  │   (Chats)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │              │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                       API LAYER                              │
│         (Next.js API Routes - /app/api/)                    │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │  Swipes  │  │  Chats   │  │  Admin   │   │
│  │   APIs   │  │   APIs   │  │   APIs   │  │   APIs   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│         │             │             │             │          │
└─────────┼─────────────┼─────────────┼─────────────┼──────────┘
          │             │             │             │
          ▼             ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATABASE LAYER                           │
│              (Supabase - PostgreSQL)                        │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Users   │  │ Profiles │  │  Swipes  │  │  Chats   │   │
│  │  Table   │  │  Table   │  │  Table   │  │  Table   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Realtime Subscriptions (WebSocket)            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                          │
│                                                               │
│  ┌──────────────┐          ┌──────────────┐                │
│  │   SMTP       │          │   Storage    │                │
│  │  (Nodemailer)│          │  (Supabase)  │                │
│  └──────────────┘          └──────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Low-Level Architecture

#### 3.2.1 Folder Structure Explained

```
ghosty/
├── app/                          # Next.js 13+ App Router
│   ├── page.tsx                  # Landing page (/)
│   ├── layout.tsx                # Root layout with providers
│   ├── globals.css               # Global styles
│   │
│   ├── api/                      # Backend API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── register/route.ts      # POST: User registration
│   │   │   ├── login/route.ts         # POST: User login
│   │   │   └── activate/route.ts      # GET: Email activation
│   │   │
│   │   ├── profile/              # Profile management
│   │   │   ├── route.ts               # GET/POST: Fetch/Create profile
│   │   │   └── edit/route.ts          # PUT: Update profile
│   │   │
│   │   ├── recommendations/      # Matching algorithm
│   │   │   └── route.ts               # GET: Personalized feed
│   │   │                              # POST: Record swipe (like/skip)
│   │   │
│   │   ├── swipes/               # Swipe actions
│   │   │   └── route.ts               # POST: Record swipe
│   │   │                              # GET: Get swipe history
│   │   │
│   │   ├── matches/              # Match management
│   │   │   └── route.ts               # GET: Fetch matches
│   │   │
│   │   ├── chats/                # Messaging system
│   │   │   └── route.ts               # GET: Fetch messages
│   │   │                              # POST: Send message
│   │   │
│   │   ├── conversations/        # Conversation management
│   │   │   └── route.ts               # GET: List conversations
│   │   │
│   │   ├── inbox/                # Inbox requests
│   │   │   └── route.ts               # GET/POST/PUT: Manage requests
│   │   │
│   │   ├── blocks/               # Block users
│   │   │   └── route.ts               # POST: Block/unblock
│   │   │
│   │   ├── reports/              # Report system
│   │   │   └── route.ts               # POST: Report user
│   │   │
│   │   └── admin/                # Admin panel APIs
│   │       ├── stats/route.ts         # GET: Dashboard stats
│   │       ├── users/route.ts         # GET/PUT: User management
│   │       └── verification/route.ts  # GET/PUT: Verify users
│   │
│   ├── login/                    # Login page
│   ├── register/                 # Registration pages
│   ├── dashboard/                # Main dashboard (swipe feed)
│   ├── inbox/                    # Inbox page (requests + chats)
│   ├── chat/[id]/                # Individual chat page
│   ├── profile/[id]/             # User profile view
│   ├── my-profile/               # Current user profile
│   └── admin/                    # Admin panel
│
├── components/                   # React components
│   ├── landing/                  # Landing page components
│   │   ├── HeroSection.tsx
│   │   ├── LoadingScreen.tsx
│   │   └── SignInModal.tsx
│   │
│   ├── auth/                     # Authentication components
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   │
│   ├── dashboard/                # Dashboard components
│   │   ├── RecommendationFeed.tsx     # Main swipe feed
│   │   ├── ProfileCard.tsx            # Swipeable profile card
│   │   ├── FilterPanel.tsx            # Preference filters
│   │   └── MatchModal.tsx             # Match notification
│   │
│   ├── chat/                     # Chat components
│   │   ├── InboxList.tsx              # List of conversations
│   │   ├── ChatHeader.tsx             # Chat top bar
│   │   ├── ChatMessage.tsx            # Individual message
│   │   ├── ChatInput.tsx              # Message input field
│   │   └── BlockReportModal.tsx       # Block/report modal
│   │
│   ├── admin/                    # Admin components
│   │   ├── DashboardStats.tsx         # Statistics cards
│   │   ├── UsersManagement.tsx        # User list/management
│   │   ├── VerificationRequests.tsx   # Verification queue
│   │   └── ReportsManagement.tsx      # Reports handling
│   │
│   └── ui/                       # Reusable UI components
│       ├── Toast.tsx
│       ├── ConfirmModal.tsx
│       └── LoadingSpinner.tsx
│
├── lib/                          # Utility libraries
│   ├── supabase/
│   │   └── client.ts             # Supabase client initialization
│   │
│   ├── email/
│   │   └── sendEmail.ts          # Email service (Nodemailer)
│   │
│   ├── utils/
│   │   └── helpers.ts            # Helper functions
│   │       - generateAnonymousName()
│   │       - generateAvatar()
│   │       - calculateAge()
│   │       - validateEmail()
│   │       - validatePassword()
│   │
│   ├── contexts/
│   │   └── UserContext.tsx       # Global user state
│   │
│   └── adminMiddleware.ts        # Admin auth middleware
│
├── types/                        # TypeScript type definitions
│   ├── database.types.ts         # Database types (auto-generated)
│   ├── api.types.ts              # API request/response types
│   ├── chat.ts                   # Chat-related types
│   └── dashboard.ts              # Dashboard-related types
│
├── database/                     # SQL schema & migrations
│   ├── schema.sql                # Main database schema
│   ├── migration_inbox_chat_system.sql
│   ├── migration_recommendation_system.sql
│   ├── migration_admin_system.sql
│   └── migration_verification_system.sql
│
├── docs/                         # Project documentation
│
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
├── next.config.ts                # Next.js configuration
└── tailwind.config.ts            # Tailwind CSS configuration
```

#### 3.2.2 Component Hierarchy

```
App Layout (layout.tsx)
│
├── Landing Page (page.tsx)
│   ├── LoadingScreen
│   ├── HeroSection
│   │   └── SignInModal
│   ├── FeaturesSection
│   └── Footer
│
├── Login Page (/login)
│   └── LoginForm
│
├── Register Page (/register)
│   ├── Step1: Email & Password
│   └── Step2: Profile Setup
│
├── Dashboard Page (/dashboard)
│   ├── FilterPanel
│   ├── RecommendationFeed
│   │   ├── ProfileCard (swipeable)
│   │   └── MatchModal (on mutual like)
│   └── NotificationBar
│
├── Inbox Page (/inbox)
│   ├── Tabs: Requests | Chats | Matches
│   ├── InboxList
│   │   ├── RequestCard
│   │   └── ChatPreview
│   └── Toast notifications
│
├── Chat Page (/chat/[id])
│   ├── ChatHeader
│   │   └── BlockReportModal
│   ├── ChatMessage[] (scrollable)
│   └── ChatInput
│
├── Profile Page (/profile/[id])
│   ├── ProfileHeader
│   ├── ProfileDetails
│   └── ActionButtons
│
└── Admin Panel (/admin)
    ├── AdminHeader
    ├── Navigation Tabs
    ├── DashboardStats
    ├── UsersManagement
    ├── VerificationRequests
    └── ReportsManagement
```

---

## 4. Database Architecture

### 4.1 Database Schema Overview

Ghosty uses **PostgreSQL** (via Supabase) with the following tables:

```sql
-- Core Tables
1. users              -- Authentication data
2. profiles           -- User profile information
3. verification_files -- Document uploads for verification

-- Matching System
4. swipes             -- Like/skip actions
5. matches            -- Mutual likes

-- Messaging System
6. inbox_requests     -- Message requests (pending approval)
7. conversations      -- Active chat sessions
8. chats              -- Individual messages

-- Moderation System
9. blocks             -- Blocked users
10. reports           -- User reports

-- Admin System
(Uses is_admin flag in users table)
```

### 4.2 Detailed Table Structures

#### 4.2.1 Users Table

**Purpose:** Store authentication credentials and account status

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  activation_token UUID,
  activation_token_expires TIMESTAMP WITH TIME ZONE,
  is_admin BOOLEAN DEFAULT FALSE,
  is_restricted BOOLEAN DEFAULT FALSE,
  registration_type VARCHAR(20),  -- 'simple' | 'verified'
  verification_status VARCHAR(20), -- 'pending' | 'verified' | 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Fields Explained:**
- `email_verified`: Tracks if user clicked activation link
- `activation_token`: UUID sent via email for verification
- `activation_token_expires`: Token valid for 24 hours
- `is_admin`: Admin role flag (bypasses restrictions)
- `is_restricted`: Account suspension flag
- `registration_type`: 
  - `'simple'`: Basic registration (instant access)
  - `'verified'`: Requires admin approval
- `verification_status`: Status of document verification

#### 4.2.2 Profiles Table

**Purpose:** Store user profile information (anonymous & public data)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  anonymous_name VARCHAR(100) UNIQUE NOT NULL,  -- e.g., "CharmingSoul456"
  avatar VARCHAR(10) NOT NULL,                  -- Emoji avatar
  real_name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  age INTEGER NOT NULL,
  gender VARCHAR(20) NOT NULL,
  university VARCHAR(255) NOT NULL,
  faculty VARCHAR(255) NOT NULL,
  bio TEXT NOT NULL,
  interests TEXT[] DEFAULT '{}',
  
  -- Preferences for matching
  preferences_age_min INTEGER DEFAULT 18,
  preferences_age_max INTEGER DEFAULT 35,
  preferences_gender TEXT[] DEFAULT '{}',
  preferences_interests TEXT[] DEFAULT '{}',
  preferences_hopes TEXT,
  
  is_verified BOOLEAN DEFAULT FALSE,
  profile_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Fields Explained:**
- `anonymous_name`: Auto-generated username like "CharmingSoul456"
- `avatar`: Emoji based on gender (👨 👩 🧑 ✨)
- `real_name`: Actual name (only visible after match/chat acceptance)
- `bio`: 20-500 character profile description
- `interests`: Array of interests for matching
- `preferences_*`: Used by recommendation algorithm

**Constraints:**
- Bio must be 20-500 characters
- Age must be 18-100 years
- Gender must be in: 'Male', 'Female', 'Non-binary', 'Other'

#### 4.2.3 Swipes Table

**Purpose:** Track like/skip actions for recommendations

```sql
CREATE TABLE swipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(10) NOT NULL CHECK (action IN ('like', 'skip')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, target_user_id)  -- One swipe per user pair
);
```

**Logic:**
- User can only swipe once per target
- Actions: `'like'` (interested) or `'skip'` (not interested)
- If both users like each other → creates a **match**

#### 4.2.4 Matches Table

**Purpose:** Store mutual likes (when both users liked each other)

```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unmatched_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  
  CHECK (user1_id < user2_id),  -- Ensures user1_id always smaller
  UNIQUE(user1_id, user2_id)
);
```

**Logic:**
1. User A swipes right on User B → Record in swipes table
2. User B swipes right on User A → Check if A already liked B
3. If yes → Create match with `user1_id` (smaller UUID) and `user2_id` (larger UUID)

**Why `user1_id < user2_id`?**
- Prevents duplicate matches (A-B vs B-A)
- Simplifies queries (only check one direction)

#### 4.2.5 Inbox Requests Table

**Purpose:** Message request system (before starting chat)

```sql
CREATE TABLE inbox_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  message TEXT,  -- Optional initial message
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT different_users CHECK (sender_id != recipient_id),
  CONSTRAINT unique_request UNIQUE (sender_id, recipient_id)
);
```

**Flow:**
1. User A sends message request to User B
2. User B receives notification
3. User B can:
   - **Accept** → Creates conversation
   - **Reject** → Request deleted, no chat created
   - **Ignore** → Stays pending

#### 4.2.6 Conversations Table

**Purpose:** Active chat sessions between two users

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user1_unread_count INTEGER DEFAULT 0,
  user2_unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT different_users CHECK (user1_id != user2_id),
  CONSTRAINT ordered_users CHECK (user1_id < user2_id),
  CONSTRAINT unique_conversation UNIQUE (user1_id, user2_id)
);
```

**Key Fields:**
- `user1_unread_count`: Number of unread messages for user1
- `user2_unread_count`: Number of unread messages for user2
- `last_message_at`: Used for sorting inbox (most recent first)

#### 4.2.7 Chats Table (Messages)

**Purpose:** Individual chat messages

```sql
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes for Performance:**
```sql
CREATE INDEX idx_chats_conversation_created 
  ON chats(conversation_id, created_at DESC);
```
This allows fast fetching of messages in chronological order.

#### 4.2.8 Blocks Table

**Purpose:** Prevent communication with blocked users

```sql
CREATE TABLE blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(blocker_user_id, blocked_user_id),
  CHECK (blocker_user_id != blocked_user_id)
);
```

**Logic:**
- If User A blocks User B:
  - B cannot send messages to A
  - B's profile won't appear in A's recommendations
  - Existing conversation is hidden (not deleted)
  - One-way block (B can still see A unless B also blocks A)

#### 4.2.9 Reports Table

**Purpose:** Report inappropriate behavior

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL CHECK (reason IN (
    'inappropriate_content',
    'fake_profile',
    'harassment',
    'spam',
    'other'
  )),
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending',
    'investigating',
    'resolved',
    'dismissed'
  )),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CHECK (reporter_user_id != reported_user_id)
);
```

**Admin Workflow:**
1. User reports someone
2. Report appears in admin panel
3. Admin investigates
4. Admin can:
   - **Restrict** the reported user
   - **Dismiss** the report
   - **Add notes** for future reference

### 4.3 Database Relationships Diagram

```
users (1) ──────────────── (1) profiles
  │                            │
  │                            │
  ├── (1) ──────────── (M) swipes (swiper_user_id)
  │                            │
  │                            │
  ├── (1) ──────────── (M) swipes (target_user_id)
  │
  │
  ├── (1) ──────────── (M) matches (user1_id)
  ├── (1) ──────────── (M) matches (user2_id)
  │
  │
  ├── (1) ──────────── (M) inbox_requests (sender_id)
  ├── (1) ──────────── (M) inbox_requests (recipient_id)
  │
  │
  ├── (1) ──────────── (M) conversations (user1_id)
  ├── (1) ──────────── (M) conversations (user2_id)
  │
  │
  ├── (1) ──────────── (M) chats (sender_id)
  ├── (1) ──────────── (M) chats (receiver_id)
  │
  │
  ├── (1) ──────────── (M) blocks (blocker_user_id)
  ├── (1) ──────────── (M) blocks (blocked_user_id)
  │
  │
  ├── (1) ──────────── (M) reports (reporter_user_id)
  └── (1) ──────────── (M) reports (reported_user_id)
```

**Legend:**
- `(1)` = One
- `(M)` = Many
- `────` = Relationship line

---

## 5. Authentication & Authorization

### 5.1 Registration Flow

#### Flow Diagram

```
User visits /register
         │
         ▼
  Enters email & password
         │
         ▼
  POST /api/auth/register
         │
         ├──────────────────────────┐
         │                          │
         ▼                          ▼
  Email exists?              Email new?
  (email_verified=false)     
         │                          │
         │                          │
         ├─── Resend activation     ├─── Hash password (bcrypt 12 rounds)
         │    token                 │    Generate activation token
         │                          │    Insert into users table
         │                          │
         └──────────┬────────────────┘
                    │
                    ▼
          Send activation email (Nodemailer)
                    │
                    ▼
    User receives email with link:
    /api/auth/activate?token=xxx
                    │
                    ▼
    User clicks link
                    │
                    ▼
    GET /api/auth/activate
                    │
                    ├──────────────────────┬──────────────────────┐
                    │                      │                      │
                    ▼                      ▼                      ▼
            Token valid?           Token expired?          Token not found?
            (< 24 hours)           (> 24 hours)
                    │                      │                      │
                    │                      │                      │
                    ▼                      ▼                      ▼
        Set email_verified=true    Show error message     Show error message
        Redirect to /login         (resend option)        (invalid link)
```

#### Code Implementation

**File:** `app/api/auth/register/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  
  // 1. Validate inputs
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }
  
  if (!isValidPassword(password).valid) {
    return NextResponse.json({ error: 'Weak password' }, { status: 400 });
  }
  
  // 2. Check if user exists
  const existingUser = await supabase
    .from('users')
    .select('id, email_verified')
    .eq('email', email)
    .single();
  
  if (existingUser && existingUser.email_verified) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
  }
  
  // 3. Hash password
  const passwordHash = await bcrypt.hash(password, 12);
  
  // 4. Generate activation token
  const activationToken = uuidv4();
  const tokenExpires = new Date();
  tokenExpires.setHours(tokenExpires.getHours() + 24);
  
  // 5. Insert/update user
  await supabase
    .from('users')
    .upsert({
      email,
      password_hash: passwordHash,
      activation_token: activationToken,
      activation_token_expires: tokenExpires.toISOString(),
    });
  
  // 6. Send activation email
  await sendActivationEmail({ to: email, activationToken });
  
  return NextResponse.json({ message: 'Check your email' }, { status: 201 });
}
```

**Key Security Features:**
- **Bcrypt 12 rounds**: Slow hash makes brute-force attacks expensive
- **Email verification**: Prevents fake accounts
- **Token expiration**: 24-hour window reduces attack surface
- **Input validation**: Prevents SQL injection and XSS

### 5.2 Login Flow

#### Flow Diagram

```
User enters credentials
         │
         ▼
POST /api/auth/login
         │
         ▼
Find user by email/username
         │
         ├──────────────────┬──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
   User found?        Password correct?    Account status OK?
                      (bcrypt.compare)
         │                  │                  │
         │                  │                  │
         ▼                  ▼                  ▼
   If admin:          If restricted:     If pending verification:
   - Skip checks      - Deny access      - Allow login but show notice
         │                  │                  │
         └──────────────────┴──────────────────┘
                            │
                            ▼
                Generate JWT token
                (7-day expiration)
                            │
                            ▼
                Payload: {
                  userId: xxx,
                  username: xxx,
                  isAdmin: bool,
                  verificationStatus: xxx
                }
                            │
                            ▼
            Return token + user data
                            │
                            ▼
            Client stores in:
            - localStorage: token
            - Context: user data
```

#### Code Implementation

**File:** `app/api/auth/login/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const { username, password } = await request.json();
  
  // 1. Find user
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();
  
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  
  // 2. Verify password
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  
  // 3. Check admin status (admins bypass all checks)
  if (!user.is_admin) {
    // Check if account is restricted
    if (user.is_restricted) {
      return NextResponse.json(
        { error: 'Account restricted. Contact support.' },
        { status: 403 }
      );
    }
  }
  
  // 4. Generate JWT
  const token = sign(
    {
      userId: user.id,
      username: user.username,
      isAdmin: user.is_admin || false,
      verificationStatus: user.verification_status,
    },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
  
  // 5. Return token and user data
  return NextResponse.json({
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      isAdmin: user.is_admin,
      verificationStatus: user.verification_status,
    },
  });
}
```

**Security Features:**
- **Password never returned** in API responses
- **Generic error messages** ("Invalid credentials" instead of "Wrong password")
- **Admin bypass** for account restrictions
- **JWT expiration** (7 days) forces re-authentication

### 5.3 JWT Token Structure

#### Token Payload

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "username": "CharmingSoul456",
  "isAdmin": false,
  "verificationStatus": "verified",
  "iat": 1704067200,  // Issued at (Unix timestamp)
  "exp": 1704672000   // Expires at (Unix timestamp)
}
```

#### Token Storage

**Frontend (Client-side):**
```typescript
// After successful login
localStorage.setItem('token', response.token);
localStorage.setItem('userId', response.user.id);
localStorage.setItem('username', response.user.username);
localStorage.setItem('isAdmin', response.user.isAdmin.toString());
```

**API Requests:**
```typescript
// Include in Authorization header
fetch('/api/protected-route', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
  },
});
```

### 5.4 Admin Authorization

**File:** `lib/adminMiddleware.ts`

```typescript
export function requireAdmin(
  handler: (request: NextRequest, user: AdminUser) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // 1. Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    try {
      // 2. Verify JWT
      const payload = verify(token, process.env.JWT_SECRET!) as AdminUser;
      
      // 3. Check admin status
      if (!payload.isAdmin) {
        return NextResponse.json({ error: 'Admin access only' }, { status: 403 });
      }
      
      // 4. Call the protected handler
      return handler(request, payload);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  };
}
```

**Usage Example:**
```typescript
// app/api/admin/users/route.ts
export const GET = requireAdmin(async (request, admin) => {
  // Admin is authenticated and authorized
  const users = await supabase.from('users').select('*');
  return NextResponse.json({ users });
});
```

### 5.5 Row Level Security (RLS)

Supabase uses RLS policies to secure data at the database level:

```sql
-- Users can only view their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can view all profiles (for matching)
CREATE POLICY "Anyone can view profiles" ON profiles
  FOR SELECT USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only view their own verification files
CREATE POLICY "Users can view own verifications" ON verification_files
  FOR SELECT USING (auth.uid() = user_id);
```

**How RLS Works:**
1. Client makes query with Supabase client
2. Supabase checks RLS policies
3. Only matching rows are returned (transparent to client)
4. Even if client bypasses frontend validation, database enforces rules

---

## 6. API Routes & Backend Logic

### 6.1 API Route Structure

All API routes follow RESTful conventions:

```
HTTP Method  |  Route                      |  Purpose
-------------|-----------------------------|----------------------------------
POST         |  /api/auth/register         |  User registration
POST         |  /api/auth/login            |  User login
GET          |  /api/auth/activate         |  Email activation
GET          |  /api/recommendations       |  Get personalized profile feed
POST         |  /api/recommendations       |  Record swipe (like/skip)
GET          |  /api/matches               |  Get user's matches
GET          |  /api/chats                 |  Get messages in conversation
POST         |  /api/chats                 |  Send new message
GET          |  /api/conversations         |  List all conversations
POST         |  /api/inbox                 |  Send message request
PUT          |  /api/inbox                 |  Accept/reject request
POST         |  /api/blocks                |  Block user
DELETE       |  /api/blocks                |  Unblock user
POST         |  /api/reports               |  Report user
GET          |  /api/admin/stats           |  Get admin dashboard stats
GET          |  /api/admin/users           |  Get all users (admin)
PUT          |  /api/admin/users           |  Update user (admin)
```

### 6.2 Recommendation Algorithm

**File:** `app/api/recommendations/route.ts`

#### Algorithm Logic

```
1. Fetch current user's profile and preferences
         │
         ▼
2. Build exclusion list:
   - Users already swiped (like or skip)
   - Users who blocked current user
   - Users blocked by current user
   - Current user themselves
         │
         ▼
3. Fetch candidate profiles with filters:
   - Gender preference match
   - Age range preference match
   - University filter (optional)
   - Faculty filter (optional)
         │
         ▼
4. Calculate match score for each candidate (0-100):
   ┌────────────────────────────────────────┐
   │ Age Range Match:        30 points      │
   │ Education Level:        25 points      │
   │ Height Preference:      15 points      │
   │ Hometown Match:         15 points      │
   │ Skin Tone Match:        15 points      │
   │ ─────────────────────────────────────  │
   │ Total:                  100 points     │
   └────────────────────────────────────────┘
         │
         ▼
5. Sort by match score (descending)
         │
         ▼
6. Paginate results (20 per page)
         │
         ▼
7. Return with metadata:
   - Match score
   - Shared interests
   - Already liked/skipped flags
```

#### Code Implementation

```typescript
export async function GET(request: NextRequest) {
  const { userId } = getQueryParams(request);
  
  // 1. Get user's profile and preferences
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  // 2. Get exclusion list
  const { data: swipedUsers } = await supabase
    .from('swipes')
    .select('target_user_id')
    .eq('user_id', userId);
  
  const { data: blockedUsers } = await supabase
    .from('blocks')
    .select('blocked_user_id, blocker_user_id')
    .or(`blocker_user_id.eq.${userId},blocked_user_id.eq.${userId}`);
  
  const excludedIds = [
    ...swipedUsers.map(s => s.target_user_id),
    ...blockedUsers.map(b => b.blocked_user_id),
    ...blockedUsers.map(b => b.blocker_user_id),
    userId
  ];
  
  // 3. Fetch candidates
  let query = supabase
    .from('profiles')
    .select('*, user:users!inner(*)')
    .not('user_id', 'in', `(${excludedIds.join(',')})`);
  
  // Apply gender preference
  if (userProfile.preferences_gender.length > 0) {
    query = query.in('gender', userProfile.preferences_gender);
  }
  
  // Apply age range
  query = query
    .gte('age', userProfile.preferences_age_min)
    .lte('age', userProfile.preferences_age_max);
  
  const { data: candidates } = await query;
  
  // 4. Calculate match scores
  const scored = candidates.map(candidate => {
    let score = 0;
    
    // Age match (30 points)
    if (candidate.age >= userProfile.preferences_age_min &&
        candidate.age <= userProfile.preferences_age_max) {
      score += 30;
    }
    
    // Education level (25 points)
    if (userProfile.preferences.education_levels?.includes(candidate.degree_type)) {
      score += 25;
    }
    
    // Height preference (15 points)
    const heightPref = userProfile.preferences.height_pref;
    if (heightPref.type === 'greater' && candidate.height_cm > heightPref.value_cm) {
      score += 15;
    } else if (heightPref.type === 'less' && candidate.height_cm < heightPref.value_cm) {
      score += 15;
    } else if (heightPref.type === 'no_preference') {
      score += 15;
    }
    
    // Hometown match (15 points)
    if (candidate.hometown?.toLowerCase().includes(
        userProfile.preferences.hometown?.toLowerCase()
    )) {
      score += 15;
    }
    
    // Skin tone match (15 points)
    if (candidate.skin_tone === userProfile.preferences.skin_tone) {
      score += 15;
    }
    
    return {
      ...candidate,
      matchScore: score
    };
  });
  
  // 5. Sort by score
  scored.sort((a, b) => b.matchScore - a.matchScore);
  
  // 6. Paginate
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const start = (page - 1) * limit;
  const end = start + limit;
  
  return NextResponse.json({
    recommendations: scored.slice(start, end),
    total: scored.length,
    page,
    totalPages: Math.ceil(scored.length / limit)
  });
}
```

### 6.3 Swipe & Match Logic

**File:** `app/api/recommendations/route.ts` (POST endpoint)

```typescript
export async function POST(request: NextRequest) {
  const { swiperId, targetId, action } = await request.json();
  
  // 1. Record the swipe
  await supabase
    .from('swipes')
    .upsert({
      user_id: swiperId,
      target_user_id: targetId,
      action: action  // 'like' or 'skip'
    });
  
  // 2. Check for mutual like (only if action is 'like')
  if (action === 'like') {
    const { data: reverseSwipe } = await supabase
      .from('swipes')
      .select('*')
      .eq('user_id', targetId)
      .eq('target_user_id', swiperId)
      .eq('action', 'like')
      .single();
    
    if (reverseSwipe) {
      // IT'S A MATCH! 🎉
      const [user1, user2] = [swiperId, targetId].sort();
      
      await supabase
        .from('matches')
        .insert({
          user1_id: user1,
          user2_id: user2,
          matched_at: new Date().toISOString(),
          is_active: true
        });
      
      return NextResponse.json({
        success: true,
        matched: true,
        message: 'It\'s a match!'
      });
    }
  }
  
  return NextResponse.json({
    success: true,
    matched: false
  });
}
```

**Match Detection Logic:**
```
User A swipes RIGHT on User B
         │
         ▼
Insert into swipes:
  (user_id: A, target_user_id: B, action: 'like')
         │
         ▼
Check: Does B have a 'like' swipe on A?
         │
         ├───────────────┬───────────────┐
         │               │               │
         ▼               ▼               ▼
    B liked A?      B skipped A?    B hasn't swiped on A?
         │               │               │
         │               │               │
         ▼               ▼               ▼
  CREATE MATCH!    No match        No match yet
  Insert into                       (possible future match)
  matches table
```

### 6.4 Messaging System

#### 6.4.1 Message Request Flow

**File:** `app/api/inbox/route.ts`

```typescript
// POST: Send message request
export async function POST(request: NextRequest) {
  const { senderId, recipientId, message } = await request.json();
  
  // 1. Check if already sent
  const { data: existing } = await supabase
    .from('inbox_requests')
    .select('*')
    .eq('sender_id', senderId)
    .eq('recipient_id', recipientId)
    .single();
  
  if (existing) {
    return NextResponse.json({ error: 'Request already sent' }, { status: 409 });
  }
  
  // 2. Check if blocked
  const { data: block } = await supabase
    .from('blocks')
    .select('*')
    .or(`blocker_user_id.eq.${recipientId},blocked_user_id.eq.${recipientId}`)
    .or(`blocker_user_id.eq.${senderId},blocked_user_id.eq.${senderId}`)
    .single();
  
  if (block) {
    return NextResponse.json({ error: 'Cannot send request' }, { status: 403 });
  }
  
  // 3. Create request
  await supabase
    .from('inbox_requests')
    .insert({
      sender_id: senderId,
      recipient_id: recipientId,
      message: message,
      status: 'pending'
    });
  
  return NextResponse.json({ success: true });
}

// PUT: Accept/reject request
export async function PUT(request: NextRequest) {
  const { requestId, action } = await request.json();  // action: 'accept' | 'reject'
  
  // 1. Update request status
  const { data: request } = await supabase
    .from('inbox_requests')
    .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
    .eq('id', requestId)
    .select()
    .single();
  
  // 2. If accepted, create conversation
  if (action === 'accept') {
    const [user1, user2] = [request.sender_id, request.recipient_id].sort();
    
    await supabase
      .from('conversations')
      .insert({
        user1_id: user1,
        user2_id: user2,
        last_message_at: new Date().toISOString()
      });
  }
  
  return NextResponse.json({ success: true });
}
```

#### 6.4.2 Sending Messages

**File:** `app/api/chats/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const { conversationId, senderId, receiverId, message } = await request.json();
  
  // 1. Verify conversation exists
  const { data: conversation } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single();
  
  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }
  
  // 2. Insert message
  const { data: newMessage } = await supabase
    .from('chats')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      receiver_id: receiverId,
      message: message,
      is_read: false
    })
    .select()
    .single();
  
  // 3. Update conversation metadata
  const isUser1 = senderId === conversation.user1_id;
  
  await supabase
    .from('conversations')
    .update({
      last_message_at: new Date().toISOString(),
      [isUser1 ? 'user2_unread_count' : 'user1_unread_count']: 
        (isUser1 ? conversation.user2_unread_count : conversation.user1_unread_count) + 1
    })
    .eq('id', conversationId);
  
  return NextResponse.json({
    success: true,
    message: newMessage
  });
}
```

#### 6.4.3 Real-time Chat Updates

**File:** `app/inbox/page.tsx` (Frontend)

```typescript
useEffect(() => {
  // Setup Supabase Realtime subscription
  const channel = supabase.channel(`inbox-${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chats'
      },
      (payload) => {
        const newMessage = payload.new;
        
        // Check if message is for current user
        if (newMessage.receiver_id === userId) {
          // Update UI with new message
          setMessages(prev => [...prev, newMessage]);
          
          // Show notification
          showToast('New message received!');
          
          // Play sound (optional)
          new Audio('/notification.mp3').play();
        }
      }
    )
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
}, [userId]);
```

**How Realtime Works:**
1. Supabase maintains a WebSocket connection
2. When a new row is inserted into `chats` table
3. All subscribed clients receive the event
4. Client checks if message is relevant (for them)
5. UI updates automatically without refresh

### 6.5 Admin APIs

#### 6.5.1 Dashboard Statistics

**File:** `app/api/admin/stats/route.ts`

```typescript
export const GET = requireAdmin(async (request, admin) => {
  // Get total users count
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });
  
  // Get verified users count
  const { count: verifiedUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('verification_status', 'verified');
  
  // Get pending verifications
  const { count: pendingVerifications } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('verification_status', 'pending');
  
  // Get restricted users
  const { count: restrictedUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('is_restricted', true);
  
  // Get total reports
  const { count: totalReports } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true });
  
  // Get active chats (distinct conversation_ids)
  const { data: chats } = await supabase
    .from('chats')
    .select('conversation_id');
  
  const activeChats = new Set(chats.map(c => c.conversation_id)).size;
  
  return NextResponse.json({
    stats: {
      totalUsers,
      verifiedUsers,
      pendingVerifications,
      restrictedUsers,
      totalReports,
      activeChats
    }
  });
});
```

#### 6.5.2 User Management

**File:** `app/api/admin/users/route.ts`

```typescript
// GET: Fetch all users with filters
export const GET = requireAdmin(async (request, admin) => {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const status = searchParams.get('status');  // 'verified' | 'pending' | 'restricted'
  
  let query = supabase
    .from('users')
    .select('*, profiles(*)');
  
  if (search) {
    query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`);
  }
  
  if (status === 'verified') {
    query = query.eq('verification_status', 'verified');
  } else if (status === 'pending') {
    query = query.eq('verification_status', 'pending');
  } else if (status === 'restricted') {
    query = query.eq('is_restricted', true);
  }
  
  const { data: users } = await query;
  
  return NextResponse.json({ users });
});

// PUT: Update user (restrict/verify)
export const PUT = requireAdmin(async (request, admin) => {
  const { userId, action } = await request.json();
  // action: 'restrict' | 'unrestrict' | 'verify' | 'reject' | 'delete'
  
  if (action === 'restrict') {
    await supabase
      .from('users')
      .update({ is_restricted: true })
      .eq('id', userId);
  } else if (action === 'unrestrict') {
    await supabase
      .from('users')
      .update({ is_restricted: false })
      .eq('id', userId);
  } else if (action === 'verify') {
    await supabase
      .from('users')
      .update({ verification_status: 'verified' })
      .eq('id', userId);
  } else if (action === 'reject') {
    await supabase
      .from('users')
      .update({ verification_status: 'rejected' })
      .eq('id', userId);
  } else if (action === 'delete') {
    await supabase
      .from('users')
      .delete()
      .eq('id', userId);
  }
  
  return NextResponse.json({ success: true });
});
```

---

## 7. Frontend Components & Pages

### 7.1 Component Architecture

#### 7.1.1 Layout & Context Providers

**File:** `app/layout.tsx`

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UserProvider>  {/* Global user state */}
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
```

**File:** `lib/contexts/UserContext.tsx`

```tsx
interface UserContextType {
  user: {
    anonymousName: string;
    avatar: string;
    userId: string;
  } | null;
  setUser: (user: any) => void;
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Load user from localStorage on mount
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const avatar = localStorage.getItem('avatar');
    
    if (userId) {
      setUser({ anonymousName: username, avatar, userId });
    }
  }, []);
  
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}
```

**Purpose:**
- Provides user data to all components without prop drilling
- Syncs with localStorage for persistence
- Centralizes authentication state

### 7.2 Landing Page

**File:** `app/page.tsx`

```tsx
export default function Home() {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate page load with animation
    setTimeout(() => setLoading(false), 2500);
  }, []);
  
  if (loading) return <LoadingScreen />;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <HeroSection />
    </div>
  );
}
```

**Components:**

1. **LoadingScreen**
   - Animated logo reveal
   - Smooth fade-out transition
   - 2.5-second duration

2. **HeroSection**
   - Glassmorphic design
   - Floating elements (3D effect)
   - Call-to-action buttons
   - Opens SignInModal on click

3. **SignInModal**
   - Login/Register toggle
   - Form validation
   - Error handling

### 7.3 Dashboard (Swipe Feed)

**File:** `app/dashboard/page.tsx`

```tsx
export default function DashboardPage() {
  const { user } = useUser();
  const [filters, setFilters] = useState({
    ageRange: [18, 30],
    universities: [],
    interests: []
  });
  
  return (
    <div className="min-h-screen">
      <FilterButton onClick={() => setShowFilters(true)} />
      
      <RecommendationFeed
        filters={filters}
        onRequestSent={handleRequestSent}
      />
      
      {showFilters && (
        <FilterPanel
          currentFilters={filters}
          onApply={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  );
}
```

**Components:**

1. **RecommendationFeed**
   - Fetches profiles from `/api/recommendations`
   - Displays one profile at a time (Tinder-style)
   - Swipe gestures:
     - **Left/Down** = Skip
     - **Right/Up** = Like
   - Keyboard shortcuts:
     - **Arrow Left** = Skip
     - **Arrow Right** = Like
     - **Arrow Up** = Previous profile

2. **ProfileCard**
   ```tsx
   interface ProfileCardProps {
     profile: UserProfile;
     onLike: () => void;
     onSkip: () => void;
   }
   ```
   - Displays:
     - Anonymous name
     - Avatar emoji
     - Age
     - University & Faculty
     - Bio
     - Interests (tags)
     - Verification badge
   - Animations:
     - Swipe left/right with Framer Motion
     - Card flip on like
     - Smooth transitions

3. **FilterPanel**
   - Age range slider
   - University multi-select
   - Interest tags
   - Apply button (updates feed)

### 7.4 Inbox Page

**File:** `app/inbox/page.tsx`

```tsx
export default function InboxPage() {
  const [activeTab, setActiveTab] = useState<'requests' | 'chats' | 'matches'>('requests');
  const [requests, setRequests] = useState<ChatRequest[]>([]);
  const [chats, setChats] = useState<ActiveChat[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  
  useEffect(() => {
    fetchRequests(userId);
    fetchChats(userId);
    fetchMatches(userId);
    
    // Setup realtime subscriptions
    const channel = supabase.channel(`inbox-${userId}`)
      .on('postgres_changes', { event: 'INSERT', table: 'inbox_requests' }, handleNewRequest)
      .on('postgres_changes', { event: 'INSERT', table: 'chats' }, handleNewMessage)
      .subscribe();
    
    return () => supabase.removeChannel(channel);
  }, [userId]);
  
  return (
    <div className="min-h-screen">
      <Tabs active={activeTab} onChange={setActiveTab}>
        <Tab name="requests">Message Requests</Tab>
        <Tab name="chats">Active Chats</Tab>
        <Tab name="matches">Matches</Tab>
      </Tabs>
      
      {activeTab === 'requests' && <RequestsList requests={requests} onAccept={handleAccept} onReject={handleReject} />}
      {activeTab === 'chats' && <ChatsList chats={chats} onClick={openChat} />}
      {activeTab === 'matches' && <MatchesList matches={matches} onMessageClick={sendRequest} />}
    </div>
  );
}
```

**Tabs Explained:**

1. **Requests Tab**
   - Shows pending message requests
   - Displays sender info:
     - Anonymous name
     - Avatar
     - Age, gender, university
     - Initial message (optional)
   - Actions:
     - **Accept** → Creates conversation
     - **Reject** → Deletes request

2. **Chats Tab**
   - Lists active conversations
   - Shows:
     - Last message preview
     - Timestamp
     - Unread count badge
   - Click to open chat page
   - Real-time updates:
     - New messages appear instantly
     - Unread count updates

3. **Matches Tab**
   - Shows mutual likes
   - Displays match date
   - Action button: "Send Message Request"
   - Note: Match ≠ Chat access
     - User must still send a message request
     - Other user must accept to start chat

### 7.5 Chat Page

**File:** `app/chat/[id]/page.tsx`

```tsx
export default function ChatPage({ params }: { params: { id: string } }) {
  const conversationId = params.id;
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    fetchMessages(conversationId, user.userId);
    fetchOtherUser(conversationId, user.userId);
    
    // Setup realtime subscription for new messages
    const channel = supabase.channel(`chat-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        table: 'chats',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        const newMessage = payload.new;
        setMessages(prev => [...prev, newMessage]);
        scrollToBottom();
      })
      .subscribe();
    
    return () => supabase.removeChannel(channel);
  }, [conversationId]);
  
  const handleSendMessage = async (text: string) => {
    await fetch('/api/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId,
        senderId: user.userId,
        receiverId: otherUser.id,
        message: text
      })
    });
  };
  
  return (
    <div className="flex flex-col h-screen">
      <ChatHeader user={otherUser} />
      
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            isOwn={message.senderId === user.userId}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput onSend={handleSendMessage} />
    </div>
  );
}
```

**Components:**

1. **ChatHeader**
   - Shows other user info
   - Three-dot menu:
     - View profile
     - Block user
     - Report user

2. **ChatMessage**
   ```tsx
   interface ChatMessageProps {
     message: {
       id: string;
       text: string;
       timestamp: string;
       isRead: boolean;
     };
     isOwn: boolean;  // Is this message from current user?
   }
   ```
   - Styling:
     - Own messages: Right-aligned, purple background
     - Other messages: Left-aligned, gray background
   - Shows timestamp on hover
   - Read receipt (double checkmark) for own messages

3. **ChatInput**
   - Text area (auto-expand)
   - Send button
   - Character limit: 5000
   - Enter key sends message
   - Shift+Enter for new line

### 7.6 Admin Panel

**File:** `app/admin/page.tsx`

```tsx
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'verifications' | 'reports'>('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  
  useEffect(() => {
    // Check admin authentication
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin || isAdmin !== 'true') {
      router.push('/login');
    }
  }, []);
  
  return (
    <div className="min-h-screen">
      <AdminHeader darkMode={darkMode} onToggleTheme={() => setDarkMode(!darkMode)} />
      
      <Tabs active={activeTab} onChange={setActiveTab}>
        <Tab name="dashboard">Dashboard</Tab>
        <Tab name="users">Users</Tab>
        <Tab name="verifications">Verifications</Tab>
        <Tab name="reports">Reports</Tab>
      </Tabs>
      
      {activeTab === 'dashboard' && <DashboardStats />}
      {activeTab === 'users' && <UsersManagement />}
      {activeTab === 'verifications' && <VerificationRequests />}
      {activeTab === 'reports' && <ReportsManagement />}
    </div>
  );
}
```

**Admin Components:**

1. **DashboardStats**
   - Statistics cards:
     - Total users
     - Verified users
     - Pending verifications
     - Restricted users
     - Total reports
     - Active chats
   - 7-day trend charts (MiniChart component)

2. **UsersManagement**
   - Search bar (username/email)
   - Status filters (All | Verified | Pending | Restricted)
   - User table:
     - Username
     - Email
     - Registration date
     - Verification status
     - Actions:
       - View profile
       - Verify
       - Restrict/Unrestrict
       - Delete
   - Pagination

3. **VerificationRequests**
   - Queue of pending verifications
   - Each request shows:
     - User info
     - Uploaded documents
     - File type (Student ID, Facebook, Academic)
   - Actions:
     - View document (modal)
     - Approve
     - Reject (with reason)

4. **ReportsManagement**
   - List of user reports
   - Filters: Pending | Investigating | Resolved | Dismissed
   - Each report shows:
     - Reporter info
     - Reported user info
     - Reason category
     - Description
     - Timestamp
   - Actions:
     - Investigate (changes status)
     - Restrict reported user
     - Dismiss report
     - Add resolution notes

---

## 8. Data Flow Diagrams

### 8.1 User Registration Flow

```
┌──────────────────────────────────────────────────────────────┐
│                      REGISTRATION FLOW                        │
└──────────────────────────────────────────────────────────────┘

User                    Frontend               API                Database              Email
  │                        │                    │                    │                    │
  │  1. Enter email        │                    │                    │                    │
  │     & password         │                    │                    │                    │
  ├───────────────────────>│                    │                    │                    │
  │                        │                    │                    │                    │
  │                        │  2. POST /api/auth/register             │                    │
  │                        ├───────────────────>│                    │                    │
  │                        │                    │                    │                    │
  │                        │                    │  3. Validate input │                    │
  │                        │                    │     (email, pwd)   │                    │
  │                        │                    │                    │                    │
  │                        │                    │  4. Check existing │                    │
  │                        │                    ├───────────────────>│                    │
  │                        │                    │<───────────────────┤                    │
  │                        │                    │                    │                    │
  │                        │                    │  5. Hash password  │                    │
  │                        │                    │     (bcrypt 12)    │                    │
  │                        │                    │                    │                    │
  │                        │                    │  6. Generate token │                    │
  │                        │                    │     (UUID)         │                    │
  │                        │                    │                    │                    │
  │                        │                    │  7. Insert user    │                    │
  │                        │                    ├───────────────────>│                    │
  │                        │                    │                    │                    │
  │                        │                    │  8. Send email     │                    │
  │                        │                    ├────────────────────────────────────────>│
  │                        │                    │                    │                    │
  │                        │  9. Success        │                    │                    │
  │                        │<───────────────────┤                    │                    │
  │                        │                    │                    │                    │
  │  10. Show "Check       │                    │                    │                    │
  │      your email"       │                    │                    │                    │
  │<───────────────────────┤                    │                    │                    │
  │                        │                    │                    │                    │
  │                                                                                        │
  │  11. User receives activation email                                                   │
  │<───────────────────────────────────────────────────────────────────────────────────────┤
  │                                                                                        │
  │  12. Click activation link                                                            │
  │     (opens /api/auth/activate?token=xxx)                                              │
  ├───────────────────────────────────────────────────────────────────>│                  │
  │                                                                     │                  │
  │                                                                     │  13. Verify      │
  │                                                                     │      token       │
  │                                                                     ├─────────────────>│
  │                                                                     │<─────────────────┤
  │                                                                     │                  │
  │                                                                     │  14. Set         │
  │                                                                     │      email_      │
  │                                                                     │      verified    │
  │                                                                     │      = true      │
  │                                                                     ├─────────────────>│
  │                                                                     │                  │
  │  15. Redirect to /login                                            │                  │
  │<────────────────────────────────────────────────────────────────────┤                  │
```

### 8.2 Matching & Swipe Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    MATCHING & SWIPE FLOW                      │
└──────────────────────────────────────────────────────────────┘

User A Dashboard                 API                      Database
       │                          │                           │
       │  1. Load dashboard       │                           │
       ├─────────────────────────>│                           │
       │                          │                           │
       │                          │  2. GET /api/recommendations
       │                          │     ?userId=A             │
       │                          ├──────────────────────────>│
       │                          │                           │
       │                          │  3. Fetch User A profile  │
       │                          │                           │
       │                          │  4. Get excluded users:   │
       │                          │     - Already swiped      │
       │                          │     - Blocked             │
       │                          │     - Self                │
       │                          │                           │
       │                          │  5. Fetch candidates      │
       │                          │     with filters          │
       │                          │                           │
       │                          │  6. Calculate match scores│
       │                          │                           │
       │                          │  7. Sort by score         │
       │                          │<──────────────────────────┤
       │                          │                           │
       │  8. Display profiles     │                           │
       │<─────────────────────────┤                           │
       │                          │                           │
       │  9. User swipes RIGHT    │                           │
       │     on User B profile    │                           │
       ├─────────────────────────>│                           │
       │                          │                           │
       │                          │  10. POST /api/recommendations
       │                          │      { swiperId: A,        │
       │                          │        targetId: B,        │
       │                          │        action: 'like' }    │
       │                          ├──────────────────────────>│
       │                          │                           │
       │                          │  11. Insert swipe         │
       │                          │      (A likes B)          │
       │                          │                           │
       │                          │  12. Check reverse swipe  │
       │                          │      (Does B like A?)     │
       │                          │                           │
       │                          │      ┌─────────────────┐  │
       │                          │      │   B LIKES A?    │  │
       │                          │      └────────┬────────┘  │
       │                          │               │           │
       │                          │      ┌────────┴────────┐  │
       │                          │      │                 │  │
       │                          │   YES│                │NO │
       │                          │      │                 │  │
       │                          │      ▼                 ▼  │
       │                          │  CREATE MATCH!    No match│
       │                          │  Insert into             │
       │                          │  matches table           │
       │                          │<──────────────────────────┤
       │                          │                           │
       │  13. Response:           │                           │
       │      { matched: true }   │                           │
       │<─────────────────────────┤                           │
       │                          │                           │
       │  14. Show Match Modal!   │                           │
       │      "It's a Match! 🎉"  │                           │
```

### 8.3 Messaging Flow

```
┌──────────────────────────────────────────────────────────────┐
│                       MESSAGING FLOW                          │
└──────────────────────────────────────────────────────────────┘

User A                        API                         Database                     User B
  │                            │                              │                            │
  │  1. Send message request   │                              │                            │
  ├───────────────────────────>│                              │                            │
  │                            │                              │                            │
  │                            │  2. POST /api/inbox          │                            │
  │                            │     { senderId: A,           │                            │
  │                            │       recipientId: B }       │                            │
  │                            ├─────────────────────────────>│                            │
  │                            │                              │                            │
  │                            │  3. Check blocks             │                            │
  │                            │                              │                            │
  │                            │  4. Insert request           │                            │
  │                            │     status: 'pending'        │                            │
  │                            │                              │                            │
  │                            │  5. Realtime notification    │                            │
  │                            │     (Supabase broadcast)     │                            │
  │                            │                              ├───────────────────────────>│
  │                            │                              │                            │
  │                            │                              │  6. User B sees request   │
  │                            │                              │     in Inbox              │
  │                            │                              │                            │
  │                            │                              │  7. User B clicks         │
  │                            │                              │     "Accept"              │
  │                            │                              │<───────────────────────────┤
  │                            │                              │                            │
  │                            │  8. PUT /api/inbox           │                            │
  │                            │<─────────────────────────────┤                            │
  │                            │                              │                            │
  │                            │  9. Update request           │                            │
  │                            │     status: 'accepted'       │                            │
  │                            ├─────────────────────────────>│                            │
  │                            │                              │                            │
  │                            │  10. Create conversation     │                            │
  │                            │      (user1_id, user2_id)    │                            │
  │                            │                              │                            │
  │  11. Notification:         │                              │                            │
  │      "Request accepted!"   │                              │                            │
  │<───────────────────────────┤                              │                            │
  │                            │                              │                            │
  │  12. Open chat page        │                              │                            │
  │     /chat/{conversationId} │                              │                            │
  │                            │                              │                            │
  │  13. Send message          │                              │                            │
  ├───────────────────────────>│                              │                            │
  │                            │                              │                            │
  │                            │  14. POST /api/chats         │                            │
  │                            │      { message: "Hi!" }      │                            │
  │                            ├─────────────────────────────>│                            │
  │                            │                              │                            │
  │                            │  15. Insert message          │                            │
  │                            │                              │                            │
  │                            │  16. Update conversation     │                            │
  │                            │      (unread count)          │                            │
  │                            │                              │                            │
  │                            │  17. Realtime broadcast      │                            │
  │                            │      (new message event)     │                            │
  │                            │                              ├───────────────────────────>│
  │                            │                              │                            │
  │                            │                              │  18. User B's chat updates │
  │                            │                              │      instantly             │
  │                            │                              │      (no refresh needed)   │
```

---

## 9. Key Features Explained

### 9.1 Anonymous Name Generation

**File:** `lib/utils/helpers.ts`

```typescript
const adjectives = [
  'Charming', 'Brave', 'Gentle', 'Smart', 'Lovely', 'Wise', ...
];

const nouns = [
  'Soul', 'Explorer', 'Dreamer', 'Vibes', 'Spirit', 'Owl', ...
];

export function generateAnonymousName(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 900) + 100;  // 100-999
  return `${adjective}${noun}${number}`;
}
```

**Examples:**
- CharmingSoul456
- BraveDreamer789
- WiseExplorer234

**Why This Approach?**
- **Friendly & Positive**: Adjectives are uplifting
- **Memorable**: Easy to remember during conversations
- **Unique**: Number suffix reduces collisions
- **Gender-Neutral**: No assumptions about identity

### 9.2 Avatar Generation

```typescript
export function generateAvatar(gender: string): string {
  const avatars = {
    Male: ['👨', '🧑', '👨‍💼', '👨‍🎓', '🙋‍♂️'],
    Female: ['👩', '👸', '💃', '👩‍🎓', '👩‍💼'],
    'Non-binary': ['🧑', '⭐', '✨', '🌟', '💫'],
    Other: ['😊', '🌟', '✨', '💫', '🌈']
  };
  
  const genderAvatars = avatars[gender] || avatars.Other;
  return genderAvatars[Math.floor(Math.random() * genderAvatars.length)];
}
```

**Why Emojis Instead of Photos?**
- **Anonymity**: No visual bias
- **Privacy**: No real photos exposed
- **Inclusivity**: Works for all genders
- **Fast Loading**: No image downloads

### 9.3 Age Calculation

```typescript
export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}
```

**Edge Cases Handled:**
- Birthday hasn't occurred yet this year
- Leap year birthdays
- Different timezone considerations

### 9.4 Email Validation

```typescript
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

**Validation Rules:**
- Must contain `@` symbol
- Must have domain (e.g., `.com`)
- No spaces allowed
- Basic format check (not comprehensive)

### 9.5 Password Validation

```typescript
export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Must contain uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Must contain lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Must contain number' };
  }
  return { valid: true };
}
```

**Password Requirements:**
- ✅ Minimum 8 characters
- ✅ At least one uppercase letter
- ✅ At least one lowercase letter
- ✅ At least one number
- ❌ Special characters (optional for simplicity)

**Why These Rules?**
- **8+ characters**: Harder to brute-force
- **Mixed case**: Increases entropy
- **Numbers**: Adds complexity
- **Not too strict**: Users won't choose weak passwords out of frustration

### 9.6 Recommendation Algorithm

**Scoring Breakdown:**

| Criteria | Points | Logic |
|----------|--------|-------|
| **Age Range Match** | 30 | Candidate age within user's preferred range |
| **Education Level** | 25 | Candidate's degree matches user's preference |
| **Height Preference** | 15 | Meets height criteria (taller/shorter/no pref) |
| **Hometown Match** | 15 | Partial string match (case-insensitive) |
| **Skin Tone Match** | 15 | Exact match with preference |
| **Total** | **100** | Maximum possible score |

**Example Calculation:**

```typescript
User A Preferences:
  - Age: 20-25
  - Education: Bachelor's, Master's
  - Height: > 170cm
  - Hometown: Colombo
  - Skin Tone: Fair

Candidate B:
  - Age: 23  ✅ (30 points)
  - Education: Bachelor's  ✅ (25 points)
  - Height: 175cm  ✅ (15 points)
  - Hometown: Colombo  ✅ (15 points)
  - Skin Tone: Fair  ✅ (15 points)

Match Score: 100 / 100 (Perfect match!)
```

**Why This Algorithm?**
- **Weighted scoring**: Prioritizes important criteria (age > height)
- **Flexible**: Works even with incomplete preferences
- **Explainable**: Users can understand why they matched
- **Scalable**: Can add more criteria without breaking

### 9.7 Real-time Chat with Supabase

**How It Works:**

1. **Client subscribes** to table changes:
   ```typescript
   const channel = supabase.channel('chat-room')
     .on('postgres_changes', {
       event: 'INSERT',
       schema: 'public',
       table: 'chats',
       filter: `conversation_id=eq.${conversationId}`
     }, (payload) => {
       const newMessage = payload.new;
       updateUI(newMessage);
     })
     .subscribe();
   ```

2. **Database insert** triggers event:
   ```sql
   INSERT INTO chats (conversation_id, sender_id, message)
   VALUES ('xxx', 'yyy', 'Hello!');
   ```

3. **Supabase broadcasts** to all subscribed clients

4. **Client receives** and updates UI instantly

**Benefits:**
- No polling needed (more efficient)
- Sub-second latency
- Automatic reconnection on disconnect
- Works across tabs/devices

---

## 10. Security & Best Practices

### 10.1 Authentication Security

#### Password Hashing
- **Algorithm**: bcrypt
- **Salt Rounds**: 12 (2^12 = 4096 iterations)
- **Why bcrypt?**
  - Slow by design (prevents brute-force)
  - Automatic salting (no rainbow table attacks)
  - Adaptive (can increase rounds over time)

#### JWT Tokens
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Expiration**: 7 days
- **Secret**: Stored in environment variable
- **Storage**: localStorage (XSS-vulnerable, but acceptable for this use case)

**Best Practice Alternative:**
- Store in httpOnly cookie (more secure)
- Use refresh tokens for longer sessions

### 10.2 Input Validation

**Client-side Validation:**
```typescript
// Zod schema for type safety
const RegisterSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Too short').max(100, 'Too long')
});
```

**Server-side Validation:**
```typescript
// NEVER trust client input
export async function POST(request: NextRequest) {
  const body = await request.json();
  const validated = RegisterSchema.safeParse(body);
  
  if (!validated.success) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }
  
  // Proceed with validated data
}
```

**Why Validate Twice?**
- Client-side: Better UX (instant feedback)
- Server-side: Security (client can be bypassed)

### 10.3 SQL Injection Prevention

**Supabase uses parameterized queries:**
```typescript
// SAFE - Supabase sanitizes input
await supabase
  .from('users')
  .select('*')
  .eq('email', userInput);

// Supabase generates:
// SELECT * FROM users WHERE email = $1
// with parameter: [userInput]
```

**NEVER concatenate strings:**
```typescript
// ❌ UNSAFE - SQL injection vulnerability
const query = `SELECT * FROM users WHERE email = '${userInput}'`;
```

### 10.4 XSS Prevention

**React automatically escapes** output:
```tsx
// SAFE - React escapes HTML
<div>{userBio}</div>

// Renders as plain text, not HTML
// Input: <script>alert('XSS')</script>
// Output: &lt;script&gt;alert('XSS')&lt;/script&gt;
```

**Use `dangerouslySetInnerHTML` ONLY for trusted content:**
```tsx
// ⚠️ Only if content is sanitized first
<div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
```

### 10.5 CSRF Protection

**Next.js API routes are protected** by default:
- Same-origin policy
- CORS headers

**Additional protection:**
```typescript
// Verify Origin header
const origin = request.headers.get('origin');
const allowedOrigins = ['https://ghosty.app', 'http://localhost:3000'];

if (!allowedOrigins.includes(origin)) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### 10.6 Rate Limiting

**Current Implementation:**
- Not implemented (future enhancement)

**Recommended:**
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,  // 100 requests per window
  message: 'Too many requests, please try again later'
});
```

### 10.7 Data Privacy

#### User Data Access
- **Profiles**: Public (visible to all users for matching)
- **Email**: Private (only visible to user themselves)
- **Messages**: Private (only conversation participants)
- **Real Name**: Revealed after match/chat acceptance

#### GDPR Compliance (Future)
- Add "Delete Account" feature
- Export user data (JSON format)
- Clear consent for data collection
- Privacy policy page

### 10.8 Content Moderation

**Current Features:**
- Block users (stops all communication)
- Report users (admin review)
- Admin can restrict accounts

**Future Enhancements:**
- AI-powered content filtering
- Automated profanity detection
- Image moderation (if photos added)

---

## 11. Deployment Guide

### 11.1 Environment Variables

Create `.env.local` in project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Email Configuration (Gmail Example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_gmail_app_password
EMAIL_FROM=noreply@ghosty.app

# Application Configuration
NEXT_PUBLIC_APP_URL=https://ghosty.app  # Production URL
JWT_SECRET=your_secure_random_string_at_least_32_characters
```

### 11.2 Supabase Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose organization and region

2. **Run Database Schema**
   - Open SQL Editor in Supabase dashboard
   - Copy contents of `database/schema.sql`
   - Execute query

3. **Run Migrations** (in order)
   - `migration_inbox_chat_system.sql`
   - `migration_recommendation_system.sql`
   - `migration_admin_system.sql`
   - `migration_verification_system.sql`

4. **Create Storage Bucket**
   - Go to Storage > Create Bucket
   - Name: `verification-files`
   - Public: **No** (private)
   - File size limit: 10 MB

5. **Set Up Storage Policies**
   ```sql
   -- Users can upload to their own folder
   CREATE POLICY "Users can upload to own folder"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'verification-files' AND
     auth.uid()::text = (storage.foldername(name))[1]
   );
   
   -- Only admins can view files
   CREATE POLICY "Admins can view files"
   ON storage.objects FOR SELECT
   USING (
     bucket_id = 'verification-files' AND
     EXISTS (
       SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true
     )
   );
   ```

6. **Get API Keys**
   - Go to Settings > API
   - Copy:
     - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
     - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

### 11.3 Email Setup (Gmail)

1. **Enable 2-Factor Authentication**
   - Go to Google Account settings
   - Security → 2-Step Verification

2. **Generate App Password**
   - Security → App passwords
   - Select app: Mail
   - Select device: Other (custom name: "Ghosty")
   - Copy generated password → `SMTP_PASSWORD`

3. **Test Email Service**
   ```bash
   node test-email.js
   ```

### 11.4 Create Admin User

1. **Generate Password Hash**
   ```bash
   node database/generate-admin-hash.js
   ```
   - Enter desired admin password
   - Copy the hash

2. **Insert Admin User**
   ```sql
   -- In Supabase SQL Editor
   INSERT INTO users (
     username,
     password_hash,
     email,
     email_verified,
     registration_type,
     verification_status,
     full_name,
     is_admin,
     created_at
   ) VALUES (
     'admin',
     '$2b$10$...your_hash_here...',
     'admin@ghosty.app',
     TRUE,
     'admin',
     'verified',
     'System Administrator',
     TRUE,
     NOW()
   );
   ```

3. **Create Admin Profile**
   ```sql
   INSERT INTO profiles (
     user_id,
     anonymous_name,
     real_name,
     verified,
     public
   ) 
   SELECT 
     id,
     'Admin',
     'System Administrator',
     TRUE,
     FALSE
   FROM users
   WHERE username = 'admin';
   ```

### 11.5 Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables**
   - Go to Vercel dashboard
   - Project Settings > Environment Variables
   - Add all variables from `.env.local`
   - Redeploy

**Alternative:** Connect GitHub repo for automatic deployments

### 11.6 Custom Domain Setup

1. **Add Domain in Vercel**
   - Project Settings > Domains
   - Add your domain (e.g., ghosty.app)

2. **Update DNS Records**
   - Add A record: `@` → Vercel IP
   - Add CNAME record: `www` → `cname.vercel-dns.com`

3. **Wait for SSL Certificate**
   - Vercel auto-generates Let's Encrypt certificate
   - HTTPS enabled automatically

4. **Update Environment Variables**
   ```env
   NEXT_PUBLIC_APP_URL=https://ghosty.app
   ```

### 11.7 Production Checklist

- [ ] All environment variables set
- [ ] Database schema applied
- [ ] Admin user created
- [ ] Storage bucket configured
- [ ] Email service tested
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Error tracking enabled (optional: Sentry)
- [ ] Analytics enabled (optional: Google Analytics)
- [ ] Backup strategy planned

---

## 12. Extension & Customization

### 12.1 Adding New Profile Fields

**Example: Add "Favorite Music" Field**

1. **Update Database Schema**
   ```sql
   ALTER TABLE profiles
   ADD COLUMN favorite_music TEXT;
   ```

2. **Update TypeScript Types**
   ```typescript
   // types/database.types.ts
   export interface Profile {
     // ... existing fields
     favorite_music?: string;
   }
   ```

3. **Update Profile Form**
   ```tsx
   // components/profile/ProfileForm.tsx
   <input
     name="favorite_music"
     placeholder="Favorite music genre"
     value={formData.favorite_music}
     onChange={handleChange}
   />
   ```

4. **Update API Route**
   ```typescript
   // app/api/profile/route.ts
   const { favorite_music } = await request.json();
   
   await supabase
     .from('profiles')
     .update({ favorite_music })
     .eq('user_id', userId);
   ```

5. **Display in Profile Card**
   ```tsx
   // components/dashboard/ProfileCard.tsx
   {profile.favorite_music && (
     <div>🎵 {profile.favorite_music}</div>
   )}
   ```

### 12.2 Adding New Matching Criteria

**Example: Match by Zodiac Sign**

1. **Add to Database**
   ```sql
   ALTER TABLE profiles
   ADD COLUMN zodiac_sign VARCHAR(20);
   
   ALTER TABLE profiles
   ADD COLUMN preferences_zodiac_signs TEXT[];
   ```

2. **Update Recommendation Algorithm**
   ```typescript
   // app/api/recommendations/route.ts
   function calculateMatchScore(candidate, userPrefs) {
     let score = 0;
     
     // ... existing criteria
     
     // Zodiac match (10 points)
     if (userPrefs.zodiac_signs.includes(candidate.zodiac_sign)) {
       score += 10;
     }
     
     return score;
   }
   ```

3. **Add to Filter Panel**
   ```tsx
   <MultiSelect
     label="Preferred Zodiac Signs"
     options={['Aries', 'Taurus', 'Gemini', ...]}
     value={filters.zodiac_signs}
     onChange={handleZodiacChange}
   />
   ```

### 12.3 Adding Video Chat

**Integration with Daily.co (Example)**

1. **Install SDK**
   ```bash
   npm install @daily-co/daily-js
   ```

2. **Create Video Chat Component**
   ```tsx
   // components/chat/VideoCall.tsx
   import Daily from '@daily-co/daily-js';
   
   export function VideoCall({ roomUrl }: { roomUrl: string }) {
     useEffect(() => {
       const callFrame = Daily.createFrame({
         showLeaveButton: true,
         iframeStyle: {
           width: '100%',
           height: '100%'
         }
       });
       
       callFrame.join({ url: roomUrl });
       
       return () => callFrame.destroy();
     }, [roomUrl]);
     
     return <div id="video-container" />;
   }
   ```

3. **Add API Route**
   ```typescript
   // app/api/video/create-room/route.ts
   export async function POST(request: NextRequest) {
     const { conversationId } = await request.json();
     
     // Create Daily.co room
     const response = await fetch('https://api.daily.co/v1/rooms', {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${process.env.DAILY_API_KEY}`,
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({
         properties: {
           max_participants: 2,
           enable_screenshare: false
         }
       })
     });
     
     const room = await response.json();
     
     return NextResponse.json({ roomUrl: room.url });
   }
   ```

4. **Add Button in Chat**
   ```tsx
   <button onClick={startVideoCall}>
     📹 Start Video Call
   </button>
   ```

### 12.4 Adding Push Notifications

**Using Firebase Cloud Messaging (FCM)**

1. **Install Firebase SDK**
   ```bash
   npm install firebase
   ```

2. **Initialize Firebase**
   ```typescript
   // lib/firebase/config.ts
   import { initializeApp } from 'firebase/app';
   import { getMessaging } from 'firebase/messaging';
   
   const firebaseConfig = {
     apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
     // ... other config
   };
   
   const app = initializeApp(firebaseConfig);
   export const messaging = getMessaging(app);
   ```

3. **Request Notification Permission**
   ```typescript
   import { getToken } from 'firebase/messaging';
   
   async function requestNotificationPermission() {
     const permission = await Notification.requestPermission();
     
     if (permission === 'granted') {
       const token = await getToken(messaging);
       
       // Save token to database
       await fetch('/api/notifications/register', {
         method: 'POST',
         body: JSON.stringify({ token, userId })
       });
     }
   }
   ```

4. **Send Notification (Server)**
   ```typescript
   // app/api/notifications/send/route.ts
   import admin from 'firebase-admin';
   
   export async function POST(request: NextRequest) {
     const { userId, title, body } = await request.json();
     
     // Get user's FCM token from database
     const { data } = await supabase
       .from('notification_tokens')
       .select('token')
       .eq('user_id', userId)
       .single();
     
     // Send notification
     await admin.messaging().send({
       token: data.token,
       notification: { title, body }
     });
   }
   ```

### 12.5 Adding AI Chatbot

**Using OpenAI GPT (Example)**

1. **Install SDK**
   ```bash
   npm install openai
   ```

2. **Create Chatbot API**
   ```typescript
   // app/api/chatbot/route.ts
   import OpenAI from 'openai';
   
   const openai = new OpenAI({
     apiKey: process.env.OPENAI_API_KEY
   });
   
   export async function POST(request: NextRequest) {
     const { message } = await request.json();
     
     const completion = await openai.chat.completions.create({
       model: 'gpt-3.5-turbo',
       messages: [
         {
           role: 'system',
           content: 'You are a dating coach helping users with conversation tips.'
         },
         {
           role: 'user',
           content: message
         }
       ]
     });
     
     return NextResponse.json({
       reply: completion.choices[0].message.content
     });
   }
   ```

3. **Add to Chat Interface**
   ```tsx
   <button onClick={askChatbot}>
     💡 Get Conversation Tip
   </button>
   ```

### 12.6 Performance Optimizations

#### 12.6.1 Image Optimization

```tsx
import Image from 'next/image';

<Image
  src="/avatar.png"
  width={50}
  height={50}
  alt="Avatar"
  priority  // For above-the-fold images
/>
```

#### 12.6.2 Code Splitting

```tsx
import dynamic from 'next/dynamic';

// Lazy load heavy components
const AdminPanel = dynamic(() => import('@/components/admin/AdminPanel'), {
  loading: () => <LoadingSpinner />
});
```

#### 12.6.3 Database Indexing

```sql
-- Add index for faster searches
CREATE INDEX idx_profiles_search 
ON profiles USING gin(to_tsvector('english', bio || ' ' || interests));

-- Full-text search
SELECT * FROM profiles
WHERE to_tsvector('english', bio || ' ' || interests) @@ to_tsquery('dating & university');
```

#### 12.6.4 Caching

```typescript
// Cache recommendations for 5 minutes
import { unstable_cache } from 'next/cache';

const getCachedRecommendations = unstable_cache(
  async (userId) => {
    return getRecommendations(userId);
  },
  ['recommendations'],
  { revalidate: 300 }  // 5 minutes
);
```

---

## 🎉 Conclusion

You now have a **complete understanding** of the Ghosty project! This documentation covered:

✅ **Project Purpose & Problem Solving**  
✅ **Technology Stack & Rationale**  
✅ **High-Level & Low-Level Architecture**  
✅ **Database Schema & Relationships**  
✅ **Authentication & Authorization Flows**  
✅ **API Routes & Backend Logic**  
✅ **Frontend Components & Pages**  
✅ **Data Flow Diagrams**  
✅ **Key Features Implementation**  
✅ **Security Best Practices**  
✅ **Deployment Guide**  
✅ **Extension & Customization Examples**

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/)

---

## 🤝 Contributing

Want to improve Ghosty? Follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).

---

## 💬 Support

Need help? Contact:
- **Email**: support@ghosty.app
- **GitHub Issues**: [github.com/ghosty/issues](https://github.com/ghosty/issues)
- **Discord**: [Join our community](https://discord.gg/ghosty)

---

**Made with ❤️ by the Ghosty Team**  
*Connecting hearts, one conversation at a time* 💜
