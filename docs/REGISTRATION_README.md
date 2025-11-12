# Ghosty - Anonymous Dating Platform Registration

## 🎯 Overview

A mobile-first, responsive registration and verification system for Ghosty, an anonymous dating platform for university students.

## ✨ Features

### Step 1: Email & Password Registration
- ✅ Email validation with real-time feedback
- ✅ Password strength requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- ✅ Password confirmation matching
- ✅ Visual password strength indicator
- ✅ Activation email simulation
- ✅ Loading states with animations

### Step 2: Profile Creation
- ✅ **Personal Information**:
  - Full name (kept private)
  - Date of birth with age validation (18+)
  - Gender selection
  
- ✅ **Academic Information**:
  - University selection
  - Faculty/Major input
  
- ✅ **About You**:
  - Bio/description (minimum 20 characters, max 500)
  - Character counter
  
- ✅ **Partner Preferences**:
  - Preferred gender
  - Age range (min/max)
  - Shared interests (multi-select from 12 options)
  - What you hope from a partner
  
- ✅ **Privacy Features**:
  - Auto-generated anonymous alias (e.g., "MysteriousGhost123")
  - Gender-based avatar assignment
  - Real information kept private

### Verification Section (Optional)
- ✅ Toggle verification request
- ✅ Three upload options:
  - Facebook profile screenshot
  - Student ID card
  - Academic document (transcript, enrollment letter)
- ✅ Image preview before upload
- ✅ Remove uploaded files
- ✅ Status indicators:
  - ⏳ Pending - Under review
  - ✅ Approved - Verified badge granted
  - ❌ Rejected - Can retry
- ✅ Clear instructions and tooltips

## 🎨 Design Features

### Glassmorphic UI
- Frosted glass effect cards
- Backdrop blur effects
- Transparent backgrounds with subtle borders
- Modern, clean aesthetic

### Responsive Design
- Mobile-first approach
- Breakpoints: mobile (default), sm (640px), lg (1024px)
- Optimized touch targets for mobile
- Adaptive text sizes and spacing

### Animations
- **fade-in**: Header elements entrance
- **slide-up**: Form sections entrance
- **scale-in**: Success messages
- **bounce-gentle**: Avatar and icons
- Smooth transitions on hover states
- Loading spinners for async actions

### Color Scheme
- Primary: Purple (#9333ea) to Pink (#ec4899) gradients
- Accent: Blue (#2563eb)
- Success: Green/Emerald
- Warning: Yellow
- Error: Red
- Dark mode support throughout

## 🛠️ Technical Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Fonts**: Geist Sans & Geist Mono

## 📱 Mobile Optimizations

1. **Touch-friendly**: All interactive elements have minimum 44x44px touch targets
2. **Readable text**: Base font size scales from 14px (mobile) to 16px (desktop)
3. **Optimized spacing**: Padding and margins adjust based on screen size
4. **Smooth scrolling**: Custom scrollbar styles
5. **Keyboard handling**: Proper input types for mobile keyboards

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to project directory:
```bash
cd D:\ghosty\ghosty
```

2. Install dependencies (already done):
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```

4. Open browser and navigate to:
```
http://localhost:3000/register
```

## 📂 Project Structure

```
ghosty/
├── app/
│   ├── register/
│   │   └── page.tsx           # Main registration page with stepper
│   ├── dashboard/
│   │   └── page.tsx           # Dashboard placeholder
│   ├── layout.tsx             # Root layout with fonts
│   └── globals.css            # Global styles & animations
├── components/
│   └── registration/
│       ├── EmailRegistration.tsx      # Step 1 component
│       ├── ProfileCreation.tsx        # Step 2 component
│       └── VerificationSection.tsx    # Optional verification
└── public/                    # Static assets
```

## 🎯 User Flow

1. **Email Registration** (`/register`)
   - User enters email and password
   - Real-time validation feedback
   - Simulated activation email sent
   - Auto-progress to Step 2 after 2 seconds

2. **Profile Creation**
   - User fills personal information
   - Academic details
   - Bio and interests
   - Partner preferences
   - Anonymous alias auto-generated
   - Gender-based avatar assigned

3. **Optional Verification**
   - User can request verified badge
   - Upload verification documents
   - Status tracking (Pending/Approved/Rejected)

4. **Completion**
   - Success message with assigned alias
   - Option to proceed to dashboard
   - Ready to start matching

## ✅ Form Validations

### Email Registration
- Email format validation
- Password strength requirements
- Password confirmation match
- All fields required

### Profile Creation
- Name required
- Age validation (18-100 years)
- Gender selection required
- University and faculty required
- Bio minimum 20 characters
- At least 1 interest selected
- Partner preferences required
- Age range validation

### Verification (Optional)
- At least 1 document required if requesting verification
- File size limits (5MB)
- Accepted formats: PNG, JPG, PDF (for academic docs)

## 🎨 UI Components

### Reusable Classes (in globals.css)
- `.glassmorphic-card` - Frosted glass card effect
- `.input-field` - Styled form inputs
- `.btn-primary` - Primary action button
- `.btn-secondary` - Secondary action button
- `.upload-box` - File upload dropzone
- `.spinner` - Loading animation

### Custom Animations
- `animate-fade-in` - Fade and slide down
- `animate-slide-up` - Slide up entrance
- `animate-scale-in` - Scale up entrance
- `animate-bounce-gentle` - Subtle bounce effect

## 📊 Features Checklist

- ✅ Mobile-first responsive design
- ✅ Step-by-step registration flow
- ✅ Email & password validation
- ✅ Profile creation with all required fields
- ✅ Partner preferences customization
- ✅ Anonymous alias generation
- ✅ Gender-based avatar assignment
- ✅ Optional verification system
- ✅ File upload with preview
- ✅ Verification status tracking
- ✅ Glassmorphic design
- ✅ Smooth animations
- ✅ Dark mode support
- ✅ Error validation & tooltips
- ✅ Loading states
- ✅ Progress indicator
- ✅ Touch-optimized for mobile
- ✅ Accessible form labels
- ✅ Clear UX instructions

## 🔮 Future Enhancements

- [ ] Email verification API integration
- [ ] Backend API for profile storage
- [ ] Image upload to cloud storage (AWS S3, Cloudinary)
- [ ] Real verification workflow with admin panel
- [ ] OTP-based verification
- [ ] Social login options
- [ ] Advanced matching algorithm
- [ ] Chat functionality
- [ ] Push notifications
- [ ] Photo gallery upload

## 📝 Notes

- All personal information is kept private
- Anonymous alias ensures privacy
- Verification is optional but recommended for trust
- Mobile-optimized for best user experience
- Fully responsive across all devices
- Dark mode automatically follows system preference

## 🤝 Support

For any issues or questions, please refer to the Next.js documentation:
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev)

---

**Built with ❤️ for Ghosty Anonymous Dating Platform**
