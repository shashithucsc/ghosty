# 🎨 Ghosty Registration - Visual Design Overview

## 🌈 Color Palette

### Primary Colors
```
Purple:  #9333ea  (purple-600)   → Main brand color
Pink:    #ec4899  (pink-600)     → Accent color  
Blue:    #2563eb  (blue-600)     → Secondary accent
```

### Status Colors
```
Success: #10b981  (green-500)    → Approved, completed
Warning: #eab308  (yellow-500)   → Pending, review
Error:   #ef4444  (red-500)      → Rejected, errors
Info:    #3b82f6  (blue-500)     → Information, hints
```

### Neutral Colors (Light Mode)
```
Background: #ffffff → Main background
Foreground: #171717 → Text color
Gray-50:    #f9fafb → Light backgrounds
Gray-200:   #e5e7eb → Borders
Gray-600:   #4b5563 → Secondary text
```

### Neutral Colors (Dark Mode)
```
Background: #0a0a0a → Main background
Foreground: #ededed → Text color
Gray-900:   #111827 → Dark backgrounds
Gray-700:   #374151 → Borders
Gray-400:   #9ca3af → Secondary text
```

## 📐 Layout Structure

### Desktop View (1024px+)
```
┌─────────────────────────────────────────┐
│         Ghosty 👻 (Logo)                │
│    Find your match anonymously          │
│                                          │
│    ●━━━━━━━━●    (Progress Indicator)   │
│  Sign Up  Profile                       │
│                                          │
│  ╔════════════════════════════════╗     │
│  ║                                ║     │
│  ║     [Registration Form]        ║     │
│  ║                                ║     │
│  ║  [Input Field]                 ║     │
│  ║  [Input Field]                 ║     │
│  ║                                ║     │
│  ║  [Submit Button with Gradient] ║     │
│  ║                                ║     │
│  ╚════════════════════════════════╝     │
│                                          │
│     Already have an account? Sign in    │
└─────────────────────────────────────────┘
```

### Mobile View (< 640px)
```
┌──────────────────────┐
│    Ghosty 👻         │
│ Find your match...   │
│                      │
│  ●━━━●  (Progress)   │
│                      │
│ ╔══════════════════╗ │
│ ║ [Form Compact]   ║ │
│ ║                  ║ │
│ ║ [Input]          ║ │
│ ║ [Input]          ║ │
│ ║                  ║ │
│ ║ [Button]         ║ │
│ ╚══════════════════╝ │
│                      │
│  Already member?     │
│     Sign in          │
└──────────────────────┘
```

## 🎯 Component Anatomy

### Glassmorphic Card
```css
• Background: White/Gray 80% opacity
• Backdrop Filter: Blur(24px)
• Border: 1px white/gray 20% opacity
• Border Radius: 16px
• Shadow: 2xl (large elevation)
• Padding: 40px (desktop), 24px (mobile)
```

### Input Field
```css
• Background: White/Gray 50% opacity + blur
• Border: 2px solid gray-200/700
• Border Radius: 12px
• Padding: 12px 16px
• Focus: Ring 2px purple-500
• Transition: 200ms all properties
```

### Primary Button
```css
• Background: Linear gradient
  - Purple-600 → Pink-600 → Blue-600
• Color: White
• Border Radius: 12px
• Padding: 12px (mobile), 16px (desktop)
• Hover: Darker gradient + scale(1.02)
• Active: scale(0.98)
• Shadow: lg → xl on hover
```

## 🎬 Animation Timings

```
Entrance Animations:
• fade-in:       500ms ease-out
• slide-up:      500ms ease-out
• scale-in:      500ms ease-out

Loop Animations:
• bounce-gentle: 2000ms ease-in-out infinite

Transitions:
• hover effects: 200ms
• color changes: 200ms
• transforms:    200ms
```

## 📱 Responsive Breakpoints

```
Mobile First (default):
  width: 0 - 639px
  → Full width layouts
  → Stacked elements
  → Compact spacing
  → Text: text-sm (14px)
  → Padding: p-6 (24px)

Small (sm:):
  width: 640px+
  → Slightly wider
  → More breathing room
  → Text: text-base (16px)
  → Padding: p-8 (32px)

Large (lg:):
  width: 1024px+
  → Max-width containers
  → Grid layouts
  → Spacious design
  → Text: text-lg (18px)
  → Padding: p-10 (40px)
```

## 🎨 Visual Elements

### Step Indicator
```
Active Step:
  ●  (filled circle with gradient)
     10/40px diameter
     Shadow-lg
     Scale(1.1)

Inactive Step:
  ○  (outlined circle)
     10/40px diameter
     Gray border

Connector Line:
  Active:   ━━━ (gradient purple→pink)
  Inactive: ─── (gray)
```

### Interest Tags
```
Selected:
  • Background: Linear gradient purple→pink
  • Text: White
  • Shadow: md
  • Transform: scale(1.05)

Unselected:
  • Background: Gray-100/800
  • Text: Gray-700/300
  • Hover: Gray-200/700
```

### Upload Box
```
Default:
  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ┐
  │                  │
  │   📁 Upload      │  (dashed border)
  │   Click to drag  │
  │                  │
  └ ─ ─ ─ ─ ─ ─ ─ ─ ┘

With Preview:
  ┌─────────────────┐
  │                 │
  │   [Image]    ❌ │  (solid border, remove button)
  │                 │
  └─────────────────┘
```

## 🌟 Special Effects

### Glassmorphism
```
backdrop-filter: blur(24px)
background: rgba(255,255,255,0.8)
border: 1px solid rgba(255,255,255,0.2)
```

### Gradient Text
```
background: linear-gradient(to right, 
  purple-600, pink-600, blue-600)
-webkit-background-clip: text
color: transparent
```

### Loading Spinner
```
┌────┐
│ ●  │  Rotating border
│    │  White with transparent top
└────┘  animation: spin 1s linear infinite
```

### Hover Glow
```
box-shadow: 
  0 20px 25px -5px rgba(0,0,0,0.1),
  0 10px 10px -5px rgba(0,0,0,0.04)

hover:
  0 25px 50px -12px rgba(0,0,0,0.25)
```

## 📊 Typography Scale

```
Headings:
  h1: text-4xl/5xl  (36px/48px)
  h2: text-2xl/3xl  (24px/30px)
  h3: text-lg/xl    (18px/20px)

Body:
  Default:    text-sm/base (14px/16px)
  Secondary:  text-xs      (12px)
  
Font Weights:
  Normal:     font-normal  (400)
  Medium:     font-medium  (500)
  Semibold:   font-semibold(600)
  Bold:       font-bold    (700)
```

## 🎯 Interactive States

### Input Focus
```
Normal:  border-gray-200
Focus:   border-transparent + ring-2 ring-purple-500
Error:   border-red-500 + ring-2 ring-red-500
```

### Button States
```
Normal:  scale(1)        + gradient
Hover:   scale(1.02)     + darker gradient
Active:  scale(0.98)     + gradient
Disabled: opacity-50     + no interaction
```

### Card Hover
```
Normal:  shadow-2xl
Hover:   shadow-xl + translate-y(-1px)
```

## 🎨 Gradient Variations

```
Primary Button:
  from-purple-600 via-pink-600 to-blue-600

Step Indicator:
  from-purple-600 to-pink-600

Success Badge:
  from-green-400 to-emerald-500

Background:
  from-purple-50 via-pink-50 to-blue-50 (light)
  from-purple-950 via-pink-950 to-blue-950 (dark)

Scrollbar:
  from-purple-600 to-pink-600
  hover: from-purple-700 to-pink-700
```

## 📐 Spacing System

```
Gap between elements:
  gap-1:  4px   (tight)
  gap-2:  8px   (compact)
  gap-3:  12px  (normal)
  gap-4:  16px  (comfortable)
  gap-6:  24px  (spacious)

Padding:
  p-3:  12px  (compact)
  p-4:  16px  (normal)
  p-6:  24px  (comfortable)
  p-8:  32px  (spacious)
  p-10: 40px  (very spacious)

Margins:
  mb-2:  8px   (tight)
  mb-4:  16px  (normal)
  mb-6:  24px  (comfortable)
  mb-8:  32px  (spacious)
```

## 🎬 User Journey Visuals

### Step 1: Email Registration
```
1. User sees title and progress (step 1/2)
2. Glassmorphic card slides up
3. Email input with mail icon
4. Password field with eye toggle
5. Password requirements appear (checkmarks animate)
6. Confirm password field
7. Info box with blue accent
8. Submit button with gradient
9. Loading spinner appears
10. Success card scales in with mail icon bouncing
11. Auto-transition after 2 seconds
```

### Step 2: Profile Creation
```
1. Progress updates to step 2/2
2. Form sections slide up sequentially
3. User fills personal info
4. Interest tags animate on click
5. Character counters update in real-time
6. Submit triggers loading state
7. Success card appears with:
   - Avatar (large emoji bouncing)
   - Assigned alias (gradient text)
   - Privacy message
8. Verification section appears
9. Optional: User toggles verification
10. Upload boxes expand with animation
11. Final "Go to Dashboard" button
```

## 🎨 Icon Usage

```
Email:       ✉️  Mail
Password:    🔒  Lock
Eye:         👁️  Eye/EyeOff
User:        👤  User
Calendar:    📅  Calendar
Heart:       ❤️  Heart
School:      🎓  GraduationCap
Building:    🏛️  Building2
Sparkles:    ✨  Sparkles
Info:        ℹ️  Info
Check:       ✓  Check/CheckCircle
Upload:      📤  Upload
Shield:      🛡️  Shield
Clock:       ⏰  Clock
X:           ❌  X/XCircle
```

## 🌙 Dark Mode Comparison

```
Light Mode:
  • Background: Gradient from purple-50
  • Cards: White 80% opacity
  • Text: Gray-900
  • Borders: Gray-200
  • Shadows: Subtle dark

Dark Mode:
  • Background: Gradient from purple-950
  • Cards: Gray-900 80% opacity
  • Text: White/Gray-100
  • Borders: Gray-700
  • Shadows: Deep black
```

---

**Design System: Ghosty 2025 👻💜**
