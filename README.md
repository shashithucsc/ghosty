# 👻 Ghosty - Anonymous Dating Platform

A modern, mobile-first dating platform with anonymous profiles, email verification, and secure matching system.

---

## 🌟 Features

### Frontend (Complete)
- ✨ **Landing Page** - Loading animation, hero section, features, how-it-works
- 📝 **Registration Flow** - 2-step process with email verification
- 🎴 **Dashboard** - Swipeable profile cards with filters
- 💬 **Chat System** - Inbox, messaging, block/report
- 🎨 **Design** - Glassmorphic UI with 15+ custom animations
- 📱 **Mobile-First** - Fully responsive across all devices

### Backend (Complete)
- 🔐 **Authentication** - Email/password with JWT tokens
- ✉️ **Email Verification** - Activation links with 24h expiration
- 👤 **Profile System** - Anonymous names, gender-based avatars, age calculation
- 🏆 **Verification Badge** - Document upload system (Student ID, Facebook, Academic)
- 🔒 **Security** - Bcrypt hashing, input validation, RLS policies
- 💾 **Database** - Supabase (PostgreSQL) with full schema

### Admin Panel (Complete)
- 📊 **Dashboard** - Platform statistics with 7-day trend charts
- 👥 **Users Management** - Search, filter, approve verifications, restrict/delete users
- ✅ **Verification Requests** - Review and approve/reject verification documents
- 🚨 **Reports Management** - Handle user reports and complaints
- 🌓 **Dark/Light Theme** - Persistent theme toggle
- 📱 **Fully Responsive** - Mobile-first design with glassmorphic UI

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account (free tier)
- Email service (Gmail recommended for testing)

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd ghosty
npm install
```

### 2. Set Up Backend
**Follow the detailed guide**: [`BACKEND_QUICKSTART.md`](BACKEND_QUICKSTART.md)

Quick summary:
1. Create Supabase project
2. Run `database/schema.sql` in Supabase SQL Editor
3. Create storage bucket `verification-files` (private)
4. Copy `.env.local.example` to `.env.local`
5. Fill in Supabase keys and SMTP credentials

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📚 Documentation

### Getting Started
- 📖 **[BACKEND_QUICKSTART.md](BACKEND_QUICKSTART.md)** - 5-minute setup guide
- ✅ **[SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)** - Step-by-step checklist

### Complete Documentation
- 📘 **[BACKEND_README.md](BACKEND_README.md)** - Full backend documentation (850+ lines)
- 📊 **[BACKEND_SUMMARY.md](BACKEND_SUMMARY.md)** - Implementation summary
- 📁 **[FILE_STRUCTURE.md](FILE_STRUCTURE.md)** - Complete file structure

### Frontend Documentation
- 🎨 **[LANDING_PAGE_README.md](LANDING_PAGE_README.md)** - Landing page features
- 💬 **[CHAT_DOCUMENTATION.md](CHAT_DOCUMENTATION.md)** - Chat system docs
- 🎴 **[DASHBOARD_README.md](DASHBOARD_README.md)** - Dashboard features

### Admin Panel Documentation
- 🚀 **[ADMIN_PANEL_QUICKSTART.md](ADMIN_PANEL_QUICKSTART.md)** - 5-minute setup guide
- 📘 **[ADMIN_PANEL_README.md](ADMIN_PANEL_README.md)** - Full documentation (600+ lines)
- 📊 **[ADMIN_PANEL_SUMMARY.md](ADMIN_PANEL_SUMMARY.md)** - Implementation summary

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 16.0.1 (App Router)
- **React**: 19.2.0
- **TypeScript**: Strict mode
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React

### Backend
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (private buckets)
- **Authentication**: JWT (jsonwebtoken)
- **Password**: bcryptjs (12 rounds)
- **Email**: Nodemailer (SMTP)

---

## 📂 Project Structure

```
ghosty/
├── app/
│   ├── api/                    # Backend API routes
│   │   ├── auth/              # Registration, login, activation
│   │   ├── profile/           # Profile creation
│   │   └── verification/      # Badge verification
│   ├── admin/                 # Admin panel (NEW)
│   ├── register/              # Registration pages
│   ├── dashboard/             # Main dashboard
│   ├── inbox/                 # Chat inbox
│   └── chat/[id]/             # Individual chats
├── components/
│   ├── admin/                 # Admin panel components (NEW)
│   ├── landing/               # Landing page sections
│   ├── registration/          # Registration components
│   ├── dashboard/             # Dashboard components
│   └── chat/                  # Chat components
├── lib/
│   ├── supabase/              # Supabase clients
│   ├── email/                 # Email service
│   ├── utils/                 # Helpers & validators
│   └── api/                   # API integration examples
├── types/                     # TypeScript types
├── database/                  # SQL schema
└── docs/                      # Documentation
```

See [FILE_STRUCTURE.md](FILE_STRUCTURE.md) for complete details.

---

## 🔑 Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=noreply@ghosty.app

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=your_secure_random_string
```

See [BACKEND_QUICKSTART.md](BACKEND_QUICKSTART.md) for detailed setup.

---

## 🧪 Testing

### Test Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'
```

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'
```

See [BACKEND_README.md](BACKEND_README.md) for more test examples.

---

## 🎯 Features Overview

### Authentication
- ✅ Email + password registration
- ✅ Email verification with activation links
- ✅ Password hashing (bcrypt 12 rounds)
- ✅ JWT authentication (7-day tokens)
- ✅ Resend activation for unverified users

### Profile System
- ✅ Anonymous username generation (e.g., "CharmingSoul456")
- ✅ Gender-based avatars (emoji: 👨👩🧑✨)
- ✅ Age calculation from date of birth
- ✅ 18+ age verification
- ✅ Bio validation (20-500 characters)
- ✅ Partner preferences (age, gender, interests)

### Verification Badge
- ✅ Upload documents (Student ID, Facebook, Academic)
- ✅ File validation (5MB max, JPG/PNG/PDF)
- ✅ Private storage (Supabase)
- ✅ Status tracking (pending/approved/rejected)
- ✅ Auto-update profile badge

### Security
- ✅ Row Level Security (RLS) policies
- ✅ Input validation & sanitization
- ✅ SQL injection protection
- ✅ XSS prevention
- ✅ Private file storage
- ✅ Secure password requirements

---

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Deploy to Vercel
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy!

### Production Checklist
- [ ] Set up production Supabase project
- [ ] Configure production email service
- [ ] Update environment variables
- [ ] Run database migrations
- [ ] Create storage buckets
- [ ] Enable HTTPS
- [ ] Set up monitoring

See [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) for complete production checklist.

---

## 📖 API Documentation

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `GET` | `/api/auth/activate?token=xxx` | Activate account |
| `POST` | `/api/auth/login` | Login with JWT |
| `POST` | `/api/profile` | Create profile |
| `GET` | `/api/profile?userId=xxx` | Get profile |
| `POST` | `/api/verification` | Upload verification |
| `GET` | `/api/verification?userId=xxx` | Get verification status |

See [BACKEND_README.md](BACKEND_README.md) for detailed API documentation.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🆘 Support

- **Setup Issues**: See [BACKEND_QUICKSTART.md](BACKEND_QUICKSTART.md)
- **API Questions**: See [BACKEND_README.md](BACKEND_README.md)
- **Checklist**: See [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)

---

## ✨ What's Included

### Frontend (11 pages/components)
- Landing page with animations
- Email registration
- Profile creation
- Dashboard with swipeable cards
- Inbox and chat system
- Glassmorphic design system

### Backend (5 API routes)
- User registration
- Email activation
- Login with JWT
- Profile creation
- Verification uploads

### Admin Panel (9 components)
- Dashboard with stats and charts
- Users management table
- Verification requests review
- Reports handling interface
- Reusable modals and components
- Dark/light theme system

### Documentation (9 files)
- Backend quick start guide
- Complete backend documentation
- Admin panel quick start
- Complete admin panel docs
- Implementation summaries
- Setup checklists
- File structure guide
- Integration examples

### Database
- Complete PostgreSQL schema
- Row Level Security policies
- Indexes and triggers
- Storage bucket setup

---

## 🎉 Getting Started

**New to Ghosty?** Start here:

1. 📖 Read [BACKEND_QUICKSTART.md](BACKEND_QUICKSTART.md)
2. ✅ Follow [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)
3. 🚀 Run `npm run dev`
4. 🎊 Start building!

---

**Built with ❤️ using Next.js 16 + Supabase + TypeScript**

**Status**: ✅ Production Ready
