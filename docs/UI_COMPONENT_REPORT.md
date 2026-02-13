# GHOSTY DATING APP - COMPLETE UI COMPONENT REPORT
*Generated: February 13, 2026*

---

## TABLE OF CONTENTS
1. [Main Pages](#1-main-pages)
2. [Reusable Components](#2-reusable-components)
3. [Component Hierarchy Map](#3-component-hierarchy-map)
4. [Summary & Statistics](#4-summary--statistics)

---

## 1. MAIN PAGES

### 🏠 Landing Page (/)
**File:** `app/page.tsx`

**Purpose:** Initial landing page with loading animation and hero section

**Components Used:**
- LoadingScreen - Initial app loading animation
- HeroSection - Main hero with CTA button
- FeaturesSection (commented out)
- HowItWorksSection (commented out)
- Footer (commented out)

**Features:**
- Auto-login check on mount
- Redirects to dashboard if authenticated
- Loading state management
- Responsive design

---

### 🔐 AUTHENTICATION PAGES

#### Login Page (/login)
**File:** `app/login/page.tsx`

**Purpose:** User authentication with username/password

**Features:**
- Form validation
- Admin vs user flow routing
- Password visibility toggle
- Account status checks (restricted/pending/rejected)
- Toast notifications
- Session management with localStorage
- Redirects based on user role and verification status

---

#### Simple Registration (/register/simple)
**File:** `app/register/simple/page.tsx`

**Purpose:** Quick registration flow without verification

**Features:**
- Username/password creation
- Gender selection (Male/Female)
- Form validation:
  - Username: 3-20 characters, alphanumeric + underscore
  - Password: 6+ characters
- Auto-login after registration
- Redirects to profile setup
- Toast notifications

---

#### Verified Registration (/register/verified)
**File:** `app/register/verified/page.tsx`

**Purpose:** Multi-step verified registration with document upload

**Features:**
- **Step 1: Personal Information**
  - Full name (3-50 characters)
  - Birthday (age validation: 18+)
  - Gender selection
  - University and faculty
  
- **Step 2: Account & Bio**
  - Username (3-20 characters)
  - Email (optional)
  - Password (6+ characters)
  - Bio (max 500 characters)
  
- **Step 3: Verification Documents**
  - Student ID card
  - Facebook profile screenshot
  - Academic document
  - File validation: max 5MB, JPG/PNG/PDF
  - Preview uploaded files

**State Management:**
- Multi-step form navigation
- Data persistence between steps
- File upload handling
- Error display

---

#### Setup Profile (/setup-profile)
**File:** `app/setup-profile/page.tsx`

**Purpose:** Complete user profile with qualifications and preferences

**Features:**
- **Personal Qualifications:**
  - Height (cm or ft/inches conversion)
  - Age
  - Skin tone
  - Degree type
  - Hometown
  
- **Partner Preferences:**
  - Age range (18-60)
  - Education level
  - Height range
  - Interests matching

**Features:**
- Imperial/metric conversion
- Form validation
- Anonymous name and avatar assignment
- Redirect to dashboard on completion

---

### 📱 MAIN APPLICATION PAGES

#### Dashboard (/dashboard)
**File:** `app/dashboard/page.tsx`

**Purpose:** Main discovery feed with recommendations

**Components Used:**
- RecommendationFeed
- FilterPanel
- NotificationBar
- Navbar

**Features:**
- Authentication & verification checks
- Admin bypass for testing
- User profile loading
- Recommendation filtering
- Match notifications
- Search functionality
- Logout option

**State Management:**
- Recommendations array
- Filter state
- Match modal state
- Notification state

---

#### My Profile (/my-profile)
**File:** `app/my-profile/page.tsx`

**Purpose:** Edit own profile information

**Components Used:**
- CreatePostModal

**Features:**
- **Personal Information Section:**
  - Username (read-only)
  - Email (read-only)
  - Full name
  - Birthday
  - Gender (Male/Female dropdown)
  - University & faculty

- **Anonymous Profile Section:**
  - Anonymous name
  - Avatar emoji selection (20 options)
  - Bio (multiline)
  - Age
  - Height (cm)
  - Skin tone
  - Degree type
  - Hometown

- **Visibility Section:**
  - Public/private profile toggle
  - Eye icon indicators

- **Create Post Button:**
  - Only visible for verified users
  - Opens CreatePostModal
  - Blue button in header

**Features:**
- Verification status check
- Admin bypass
- Form validation
- Success/error messages
- Save changes API call
- Solid colors (no gradients)

---

#### User Profile (/profile/[id])
**File:** `app/profile/[id]/page.tsx`

**Purpose:** View other users' profiles

**Components Used:**
- ProfileView

**Features:**
- Dynamic user ID routing
- Limited vs full profile view based on verification
- Profile not found handling
- Send message request
- Back navigation

---

#### Inbox (/inbox)
**File:** `app/inbox/page.tsx`

**Purpose:** Manage conversations and requests

**Components Used:**
- InboxList
- Navbar

**Features:**
- **3 Tabs:**
  1. **Matches** - Mutual likes
  2. **Requests** - Pending chat requests
  3. **Chats** - Active conversations

- **Realtime Features:**
  - Supabase subscriptions
  - Live message updates
  - Unread counts
  - Status changes

- **Actions:**
  - Accept/reject requests
  - View conversations
  - Delete chats
  - Block/unblock users
  - Navigate to chat

---

#### Chat (/chat/[id])
**File:** `app/chat/[id]/page.tsx`

**Purpose:** One-on-one chat with realtime messaging

**Components Used:**
- ChatHeader
- ChatMessage
- ChatInput
- BlockReportModal
- UnblockModal
- Toast

**Features:**
- **Realtime Messaging:**
  - Supabase postgres_changes subscription
  - Optimistic UI updates
  - Message delivery status
  - Read receipts (double checkmarks)
  - Typing indicators
  - Online status

- **Message Actions:**
  - Delete own messages
  - Block user
  - Report user
  - Mark as read

- **Chat Partner Info:**
  - Anonymous name and avatar
  - Age and gender
  - Online status indicator
  - Typing indicator

- **Block Status:**
  - Detect if blocked/blocker
  - Disable input if blocked
  - Show block status message
  - Unblock option

**State Management:**
- Messages array
- Chat partner info
- Block status
- Online/typing status
- Modal states

---

#### Notice Board (/notice-board)
**File:** `app/notice-board/page.tsx`

**Purpose:** Community bulletin board for verified users

**Features:**
- **Category Filtering:**
  - All posts
  - Girl section
  - Boy section
  - General section

- **Create Post (Verified Users Only):**
  - Anonymous posting
  - Select section (Male/Female)
  - No character limit
  - Admin approval required

- **Post Display:**
  - Title and content
  - Category badge
  - Timestamp
  - Approved posts only
  - Anonymous author

**State Management:**
- Posts array
- Selected category filter
- Create modal state
- Loading state

---

#### Pending Verification (/pending-verification)
**File:** `app/pending-verification/page.tsx`

**Purpose:** Waiting screen for verification approval

**Features:**
- Status display with animated clock icon
- Process steps visualization
- Estimated time message
- Logout button
- Auto-redirect if verified
- Solid background colors

---

#### Restricted Account (/restricted)
**File:** `app/restricted/page.tsx`

**Purpose:** Account restriction notification

**Features:**
- Warning icon and message
- Reason explanation
- Appeal process information
- Support contact details
- Logout option
- Centered card layout

---

### 👑 ADMIN PAGES

#### Admin Dashboard (/admin)
**File:** `app/admin/page.tsx`

**Purpose:** Comprehensive admin control panel

**Components Used:**
- AdminHeader
- DashboardStats
- UsersManagement
- VerificationRequests
- ReportsManagement
- NoticeBoardManagement

**Features:**
- **5 Tabs:**
  1. **Dashboard** - Statistics overview
  2. **Users** - User management
  3. **Verifications** - Document approval
  4. **Reports** - User reports handling
  5. **Notice Board** - Post moderation

- **Admin Check:**
  - Verify admin status from localStorage
  - Redirect non-admins
  - Admin-only routes

- **Dark Mode:**
  - Toggle button in header
  - Persistent state
  - Dark theme styling

**State Management:**
- Active tab
- Dark mode state
- Refresh triggers for each section

---

#### Admin Verifications (/admin/verifications)
**File:** `app/admin/verifications/page.tsx`

**Purpose:** Redirect handler to main admin panel

**Features:**
- Auto-redirect to /admin
- Fallback route

---

## 2. REUSABLE COMPONENTS

### 🎨 UI COMPONENTS (components/ui/)

#### Navbar
**File:** `components/ui/Navbar.tsx`

**Purpose:** Global navigation header

**Used In:** All authenticated pages except admin

**Features:**
- **Desktop Navigation:**
  - Logo/home link
  - Dashboard link
  - Notice Board link
  - Inbox link
  - Profile link
  - Search bar
  - Logout button

- **Mobile Navigation:**
  - Bottom navigation bar
  - 4 primary links
  - Active state indicators
  - Fixed positioning

- **Search Functionality:**
  - Real-time user search
  - Anonymous name matching
  - Results dropdown
  - Profile navigation

**Styling:**
- Glass morphism effect
- Backdrop blur
- Sticky positioning
- Responsive breakpoints

---

#### Toast
**File:** `components/ui/Toast.tsx`

**Purpose:** Notification messages

**Used In:** Login, Register, Profile, Chat, Admin actions

**Props:**
- `message: string` - Text content
- `type: 'success' | 'error' | 'warning' | 'info'` - Visual style
- `onClose: () => void` - Close callback
- `duration?: number` - Auto-dismiss time (default 3000ms)

**Features:**
- 4 color variants
- Auto-dismiss timer
- Manual close button
- Slide-in animation
- Icon indicators
- Responsive width

---

#### ConfirmModal
**File:** `components/ui/ConfirmModal.tsx`

**Purpose:** Confirmation dialogs for destructive actions

**Used In:** Chat (delete message), Admin (delete user, restrict)

**Props:**
- `isOpen: boolean` - Visibility state
- `onClose: () => void` - Cancel callback
- `onConfirm: () => void` - Confirm callback
- `title: string` - Modal title
- `message: string` - Description text
- `confirmText?: string` - Confirm button label
- `cancelText?: string` - Cancel button label
- `variant?: 'danger' | 'warning' | 'info'` - Color scheme

**Features:**
- 3 visual variants
- Icon display (trash, warning, info)
- Glass morphism design
- Backdrop click to close
- Keyboard support (ESC to close)

---

### 🎭 LANDING COMPONENTS (components/landing/)

#### LoadingScreen
**File:** `components/landing/LoadingScreen.tsx`

**Purpose:** Initial app loading animation

**Used In:** Landing page

**Features:**
- Animated floating particles
- Progress bar simulation (0-100%)
- Plasma gradient backgrounds
- Grain texture overlay
- Floating glass decorations
- Brand logo with fade-in
- Multiple animation layers
- Auto-complete callback

**Animation Details:**
- 50 floating particles with random delays
- Smooth progress increment
- Staggered fade transitions
- Grain texture with CSS filter

---

#### HeroSection
**File:** `components/landing/HeroSection.tsx`

**Purpose:** Main landing page hero with call-to-action

**Used In:** Landing page

**Features:**
- Auto-login detection
- "Start Dating" CTA button
- SignInModal integration
- Animated glass elements
- Ambient background effects
- Responsive typography
- Gradient text effects

**State Management:**
- Authentication check
- SignInModal open/close state

---

#### FeaturesSection
**File:** `components/landing/FeaturesSection.tsx`

**Purpose:** Showcase app features

**Used In:** Landing page (currently commented out)

**Features:**
- **4 Feature Cards:**
  1. Verified Profiles
  2. Smart Matching
  3. Safe & Secure
  4. Real Connections

- Grid layout (2x2 on desktop, 1 column mobile)
- Animated cards with hover effects
- Icon representation for each feature
- Gradient color schemes
- Glass morphism design

---

#### HowItWorksSection
**File:** `components/landing/HowItWorksSection.tsx`

**Purpose:** Onboarding process explanation

**Used In:** Landing page (currently commented out)

**Features:**
- **4-Step Process:**
  1. Create Profile
  2. Get Verified
  3. Browse Matches
  4. Start Chatting

- Color-coded steps
- Icon representation
- Connector lines between steps
- Responsive layout

---

#### Footer
**File:** `components/landing/Footer.tsx`

**Purpose:** Page footer with links and stats

**Used In:** Landing page (currently commented out)

**Features:**
- **3 Columns:**
  1. Brand info with logo
  2. Quick links (About, Terms, Privacy, Contact)
  3. Community stats (members, verified, matches)

- Responsive grid
- Copyright notice
- Icon links

---

#### SignInModal
**File:** `components/landing/SignInModal.tsx`

**Purpose:** Sign-in/register choice modal

**Used In:** HeroSection

**Features:**
- **4 Options:**
  1. Simple Registration (quick start)
  2. Verified Registration (full verification)
  3. Login (existing users)
  4. Close modal

- Floating particle animations
- Plasma gradient backgrounds
- Glass morphism cards
- Navigation routing
- Mobile responsive

**Props:**
- `isOpen: boolean`
- `onClose: () => void`

---

### 🔐 AUTH COMPONENTS (components/auth/)

#### SignInButton
**File:** `components/auth/SignInButton.tsx`
**Status:** Empty placeholder file

#### SignInModal
**File:** `components/auth/SignInModal.tsx`
**Status:** Empty placeholder file

---

### 📝 REGISTRATION COMPONENTS (components/registration/)

#### EmailRegistration
**File:** `components/registration/EmailRegistration.tsx`

**Purpose:** Email/password registration step

**Used In:** Registration flow

**Props:**
- `onNext: (email: string, password: string) => void`
- `onBack: () => void`

**Features:**
- Email validation with regex
- Password strength requirements display:
  - At least 8 characters
  - One uppercase letter
  - One lowercase letter
  - One number
  - One special character

- Password confirmation matching
- Show/hide password toggles
- Success state with email confirmation
- Animated transitions
- Real-time validation feedback

---

#### ProfileCreation
**File:** `components/registration/ProfileCreation.tsx`

**Purpose:** Profile information collection

**Used In:** Registration flow

**Props:**
- `email: string`
- `password: string`
- `onBack: () => void`
- `onComplete: () => void`

**Features:**
- **Personal Info Form:**
  - Full name (3-50 characters)
  - Date of birth (18+ validation)
  - Gender selection
  - University/faculty selection
  - Bio (max 500 characters)

- **Interest Selection:**
  - Multi-select checkboxes
  - 6 categories (Sports, Arts, Music, Movies, Reading, Travel)

- **Partner Preferences:**
  - Hopes from partner input

- **Verification Section:**
  - VerificationSection component integration
  - Optional document upload

- Anonymous alias auto-generation
- Avatar auto-assignment
- Age calculation
- Form validation

---

#### VerificationSection
**File:** `components/registration/VerificationSection.tsx`

**Purpose:** Optional verification document upload

**Used In:** ProfileCreation

**Props:**
- `onFileSelect: (file: File, type: string) => void`
- `selectedFiles: { [key: string]: File }`
- `onRemoveFile: (type: string) => void`

**Features:**
- **3 Document Types:**
  1. Facebook Profile Screenshot
  2. Student ID Card
  3. Academic Document

- File upload with preview
- Status tracking (pending/approved/rejected)
- Remove uploaded files
- File type badges
- Drag & drop support
- File size validation

---

### 📊 DASHBOARD COMPONENTS (components/dashboard/)

#### RecommendationFeed
**File:** `components/dashboard/RecommendationFeed.tsx`

**Purpose:** Display recommended profiles with swipe functionality

**Used In:** Dashboard page

**Props:**
- `userId: string` - Current user ID
- `filters: FilterState` - Active filters

**Features:**
- Fetch recommendations from API
- Filter by age, university, interests
- Swipe/like functionality
- Match detection system
- Optimistic UI updates
- Keyboard navigation (arrow keys):
  - Left arrow = Skip
  - Right arrow = Like
- EmptyState when no profiles
- MatchModal on mutual like
- Card deck animation
- Loading state

**API Endpoints:**
- GET `/api/recommendations` - Fetch profiles
- POST `/api/swipes` - Record swipe action
- GET `/api/matches` - Check for matches

---

#### ProfileCard
**File:** `components/dashboard/ProfileCard.tsx`

**Purpose:** Individual profile display card with swipe gestures

**Used In:** RecommendationFeed

**Props:**
```typescript
interface Profile {
  id: string;
  anonymousName: string;
  anonymousAvatar: string;
  age: number;
  gender: string;
  university: string;
  bio: string;
  verificationStatus: string;
  heightCm?: number;
  skinTone?: string;
  degreeType?: string;
  hometown?: string;
}
```
- `profile: Profile`
- `onLike: () => void`
- `onSkip: () => void`
- `style?: React.CSSProperties`

**Features:**
- Touch swipe gestures:
  - Swipe left = Skip
  - Swipe right = Like
- Visual swipe indicators
- Height conversion (cm to ft/inches)
- Verified badge display
- Compact info grid:
  - Height
  - Skin tone
  - Degree type
  - Hometown
- University and bio display
- Profile navigation on click
- Like/Skip action buttons
- Glass morphism design
- Avatar emoji display

---

#### FilterPanel
**File:** `components/dashboard/FilterPanel.tsx`

**Purpose:** Filtering options sidebar

**Used In:** Dashboard page

**Props:**
- `isOpen: boolean`
- `onClose: () => void`
- `filters: FilterState`
- `onApplyFilters: (filters: FilterState) => void`

**Features:**
- **Age Range Slider:**
  - Min: 18, Max: 60
  - Dual thumb control
  - Real-time value display

- **University Multi-Select:**
  - Checkbox list
  - All universities option
  - Custom university search

- **Interest Multi-Select:**
  - 6 interest categories
  - Checkbox selection
  - Match by interests toggle

- Apply/reset filters
- Logout button at bottom
- Slide-in animation
- Mobile/desktop responsive
- Backdrop overlay

---

#### MatchModal
**File:** `components/dashboard/MatchModal.tsx`

**Purpose:** Match celebration notification

**Used In:** Dashboard after mutual like

**Props:**
- `isOpen: boolean`
- `onClose: () => void`
- `matchedUser: { id: string; name: string; avatar: string }`
- `onStartChat: () => void`

**Features:**
- Confetti animation (canvas-based)
- Match details display:
  - Avatar
  - Anonymous name
  - Success message
- "Start Chat" button
- Conversation creation
- Auto-navigation to chat
- Glass morphism design
- Celebration emoji

---

#### NotificationBar
**File:** `components/dashboard/NotificationBar.tsx`

**Purpose:** Temporary notification banner

**Used In:** Dashboard for match/message alerts

**Props:**
- `message: string`
- `type: 'match' | 'message' | 'request'`
- `onClose: () => void`

**Features:**
- 3 notification types:
  - Match (green border)
  - Message (blue border)
  - Request (yellow border)
- Auto-dismiss after 5 seconds
- Icon indicators
- Manual dismiss button
- Slide-down animation
- Fixed top positioning

---

#### DashboardHeader
**File:** `components/dashboard/DashboardHeader.tsx`

**Purpose:** Dashboard top navigation

**Used In:** Dashboard page

**Props:**
- `onFilterClick: () => void`
- `notificationCount?: number`

**Features:**
- App logo with home link
- Search functionality:
  - Real-time user search
  - Anonymous name matching
  - Results dropdown
- Filter toggle button
- Notification count badge (red dot)
- User info display:
  - Username
  - Avatar
- Logout button
- Glass morphism design
- Sticky positioning

---

#### EmptyState
**File:** `components/dashboard/EmptyState.tsx`

**Purpose:** No results message

**Used In:** RecommendationFeed when no profiles

**Props:**
- `message?: string` - Custom message
- `onRefresh?: () => void` - Refresh callback

**Features:**
- Icon illustration (empty box)
- Helpful message
- Refresh button (optional)
- Centered card layout
- Suggested actions text
- Glass morphism design

---

### 👤 PROFILE COMPONENTS (components/profile/)

#### ProfileView
**File:** `components/profile/ProfileView.tsx`

**Purpose:** Display user profile details

**Used In:** My Profile, User Profile pages

**Props:**
```typescript
interface Profile {
  id: string;
  username?: string;
  anonymousName: string;
  anonymousAvatar: string;
  age: number;
  gender: string;
  university: string;
  faculty?: string;
  bio: string;
  verificationStatus: string;
  heightCm?: number;
  skinTone?: string;
  degreeType?: string;
  hometown?: string;
  interests?: string[];
  createdAt?: string;
}
```
- `profile: Profile`
- `isOwnProfile: boolean`
- `limitedView?: boolean`

**Features:**
- **Limited View (Unverified Viewers):**
  - Anonymous name and avatar only
  - Age, gender
  - University
  - Blurred profile message

- **Full View (Verified Viewers):**
  - All limited view info
  - Bio
  - Faculty
  - Height, skin tone
  - Degree type, hometown
  - Interests list
  - Member since date

- Verified badge display
- Send message request button
- Back navigation
- Toast notifications
- Restricted user handling
- Glass morphism cards

---

#### CreatePostModal
**File:** `components/profile/CreatePostModal.tsx`

**Purpose:** Create notice board post

**Used In:** My Profile page

**Props:**
- `isOpen: boolean`
- `onClose: () => void`
- `userId: string`
- `userGender: string`
- `verificationStatus: string`

**Features:**
- **Verified Users Only:**
  - Show error if not verified
  - Check verification status

- **Gender Selection:**
  - Dropdown to select section
  - Male Section or Female Section
  - User chooses (not automatic)

- **Title Input:**
  - No character limit
  - Required field

- **Content Input:**
  - Textarea (8 rows)
  - No character limit
  - Required field

- **Anonymous Posting:**
  - User identity hidden
  - Author ID stored for moderation only
  - Clear messaging about anonymity

- **Admin Approval:**
  - Posts start as "pending"
  - Admin must approve before publishing
  - Info notice displayed

- Success/error feedback
- Loading states
- Form validation
- Auto-close on success

**API:**
- POST `/api/notice-board/posts`

---

### 💬 CHAT COMPONENTS (components/chat/)

#### ChatHeader
**File:** `components/chat/ChatHeader.tsx`

**Purpose:** Chat page header with user info

**Used In:** Chat page

**Props:**
```typescript
interface ChatPartner {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  isTyping: boolean;
}
```
- `partner: ChatPartner`
- `onBack: () => void`
- `onMoreClick: () => void`

**Features:**
- Back button (chevron left)
- User avatar/name display
- Online status indicator (green dot)
- Typing indicator ("typing..." text)
- Profile navigation on click
- More menu button (3 dots)
- Glass morphism design
- Fixed positioning

---

#### ChatMessage
**File:** `components/chat/ChatMessage.tsx`

**Purpose:** Individual message display

**Used In:** Chat page

**Props:**
```typescript
interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isOwn: boolean;
  isRead: boolean;
  readAt?: Date;
}
```
- `message: Message`
- `onDelete?: (messageId: string) => void`

**Features:**
- Own vs received message styling:
  - Own: Blue background, right-aligned
  - Received: Gray background, left-aligned
- Timestamp formatting (e.g., "2:30 PM")
- Read receipts:
  - Single check: Delivered
  - Double check: Read
  - Blue checks when read
- Delete message option (own messages only):
  - Hover to reveal delete button
  - ConfirmModal for confirmation
- Long press on mobile
- Optimistic rendering
- Smooth animations

---

#### ChatInput
**File:** `components/chat/ChatInput.tsx`

**Purpose:** Message composition area

**Used In:** Chat page

**Props:**
- `onSendMessage: (message: string) => void`
- `disabled?: boolean`
- `disabledReason?: string`
- `onTyping?: () => void`

**Features:**
- Auto-expanding textarea
- Keyboard shortcuts:
  - Enter to send
  - Shift+Enter for newline
- Typing indicator trigger
- Disabled state with message
- Emoji button placeholder
- Send button with loading state
- Character counter (optional)
- Attachment button (future)
- Glass morphism design

---

#### InboxList
**File:** `components/chat/InboxList.tsx`

**Purpose:** Display chat requests and conversations

**Used In:** Inbox page

**Props:**
- `activeTab: 'matches' | 'requests' | 'chats'`
- `userId: string`

**Features:**
- **Request Cards:**
  - User avatar (gender-specific icons)
  - Anonymous name
  - Age and gender
  - Status badges (pending/accepted/blocked)
  - Message preview (locked until accepted)
  - Accept/reject buttons
  - Time ago formatting

- **Match Cards:**
  - Similar to requests
  - "It's a match!" badge
  - Start chat button

- **Chat Cards:**
  - Last message preview
  - Unread count badge
  - Timestamp
  - Block user option
  - Delete conversation

- Profile navigation on avatar click
- Empty state handling
- Loading states
- Realtime updates

---

#### BlockReportModal
**File:** `components/chat/BlockReportModal.tsx`

**Purpose:** Block or report users

**Used In:** Chat page

**Props:**
- `isOpen: boolean`
- `onClose: () => void`
- `userId: string`
- `targetUserId: string`
- `targetUserName: string`

**Features:**
- **Two-Step Process:**
  1. Choose action (Block or Report)
  2. Select reason

- **Block Reasons:**
  - Inappropriate behavior
  - Spam/harassment
  - Not interested
  - Safety concerns
  - Other (with text input)

- **Report Reasons:**
  - Inappropriate content
  - Harassment
  - Fake profile
  - Spam
  - Underage
  - Other (with description)

- Custom reason input
- Submit button
- Cancel option
- Glass morphism design
- Backdrop blur

**API Endpoints:**
- POST `/api/blocks` - Block user
- POST `/api/reports` - Report user

---

#### UnblockModal
**File:** `components/chat/UnblockModal.tsx`

**Purpose:** Unblock user confirmation

**Used In:** Chat page

**Props:**
- `isOpen: boolean`
- `onClose: () => void`
- `userName: string`
- `onConfirm: () => void`

**Features:**
- Confirmation message
- Unblock consequences explanation:
  - User can contact you again
  - Previous conversations remain deleted
  - You can re-block if needed
- Cancel/confirm buttons
- Glass morphism design
- Icon display

---

#### Toast (Chat variant)
**File:** `components/chat/Toast.tsx`

**Purpose:** Chat-specific toast notifications

**Used In:** Chat page

**Features:** Same as `components/ui/Toast.tsx`
- Message sent/delivered notifications
- Error messages
- Block/report confirmations

---

### 👑 ADMIN COMPONENTS (components/admin/)

#### AdminHeader
**File:** `components/admin/AdminHeader.tsx`

**Purpose:** Admin panel header with branding and controls

**Used In:** All admin pages

**Props:**
- `darkMode: boolean`
- `onToggleDarkMode: () => void`

**Features:**
- "Ghosty Admin" branding
- Shield icon logo
- Dark mode toggle switch
- Logout button
- Sticky positioning
- Responsive design
- Glass effect in light mode
- Solid dark background in dark mode

---

#### DashboardStats
**File:** `components/admin/DashboardStats.tsx`

**Purpose:** Admin dashboard statistics overview

**Used In:** Admin dashboard tab

**Features:**
- **6 Stat Cards:**
  1. Total Users (purple)
  2. Verified Users (green)
  3. Pending Verifications (orange, urgent)
  4. Restricted Users (red)
  5. Reports (red, urgent)
  6. Chat Conversations (blue)

- Quick action buttons:
  - View Users
  - View Verifications
  - View Reports

- Loading state (skeleton)
- Percentage calculations
- Responsive grid (3 columns → 2 → 1)
- StatsCard components

**Data Fetched:**
- GET `/api/admin/stats`

---

#### UsersManagement
**File:** `components/admin/UsersManagement.tsx`

**Purpose:** Manage all platform users

**Used In:** Admin users tab

**Features:**
- **Search:**
  - Username search
  - Debounced input (500ms)
  - Real-time filtering

- **Filters:**
  - All Users
  - Verified
  - Unverified
  - Pending
  - Restricted

- **User Table:**
  - Username
  - Email
  - Registration type
  - Verification status
  - Created date
  - Actions column

- **Actions:**
  - Verify user
  - Restrict user (with reason)
  - Unrestrict user
  - Delete user
  - View profile

- Pagination (10 per page)
- ConfirmModal for actions
- Success/error feedback
- Loading states

**API Endpoints:**
- GET `/api/admin/users`
- PUT `/api/admin/users` (verify, restrict, unrestrict, delete)

---

#### VerificationRequests
**File:** `components/admin/VerificationRequests.tsx`

**Purpose:** Review verification submissions

**Used In:** Admin verifications tab

**Features:**
- **Status Filter:**
  - All
  - Pending (default)
  - Approved
  - Rejected

- **Request Cards:**
  - User info (username, email, full name)
  - Submission date
  - Document type badges
  - Document preview thumbnails
  - Status indicator

- **Actions:**
  - View document (ViewDocumentModal)
  - Approve (with confirmation)
  - Reject (with reason input)
  - Delete request

- Refresh button
- Stats counter (pending/total)
- Empty state handling
- Loading skeleton

**API Endpoints:**
- GET `/api/admin/verifications`
- PUT `/api/admin/verifications` (approve/reject)

---

#### ReportsManagement
**File:** `components/admin/ReportsManagement.tsx`

**Purpose:** Handle user reports

**Used In:** Admin reports tab

**Features:**
- **Status Filter:**
  - All
  - Pending (default)
  - Reviewed
  - Resolved
  - Dismissed

- **Report Cards:**
  - Reporter info
  - Reported user info
  - Report reason and description
  - Submission date
  - Status badge

- **Actions:**
  - Resolve (mark as resolved)
  - Dismiss (mark as dismissed)
  - Restrict reported user
  - Add admin notes (textarea)

- ConfirmModal for actions
- Empty state
- Loading states
- Report count display

**API Endpoints:**
- GET `/api/admin/reports`
- PUT `/api/admin/reports` (resolve/dismiss)
- POST `/api/admin/users/restrict`

---

#### NoticeBoardManagement
**File:** `components/admin/NoticeBoardManagement.tsx`

**Purpose:** Moderate notice board posts

**Used In:** Admin notice board tab

**Features:**
- **Status Filter:**
  - All
  - Pending (default)
  - Approved
  - Rejected

- **Post Cards:**
  - Title and content
  - Category badge (boy/girl/general)
  - Author username
  - Submission date
  - Status indicator
  - Expandable content (collapse after 200 chars)

- **Actions:**
  - Approve post
  - Reject post (with reason)
  - Delete post
  - View author profile

- Stats dashboard:
  - Total posts
  - Pending count
  - Approved count
  - Rejected count

- ConfirmModal for actions
- Empty state
- Loading states

**API Endpoints:**
- GET `/api/admin/notice-board`
- PUT `/api/admin/notice-board` (approve/reject/delete)

---

#### StatsCard
**File:** `components/admin/StatsCard.tsx`

**Purpose:** Display individual statistic

**Used In:** DashboardStats

**Props:**
```typescript
interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'purple' | 'green' | 'orange' | 'red' | 'blue';
  percentage?: number;
  trend?: 'up' | 'down';
  urgent?: boolean;
}
```

**Features:**
- Icon with color background
- Title and value display
- Optional percentage change
- Optional trend indicator (↑/↓)
- Urgent state (pulsing animation)
- 5 color variants
- Glass morphism
- Hover effects

---

#### MiniChart
**File:** `components/admin/MiniChart.tsx`

**Purpose:** Small bar chart visualization

**Used In:** Admin stats (not currently in use)

**Props:**
- `data: number[]` (7 days of data)
- `color: string`

**Features:**
- 7-day data visualization
- Color variants
- Hover tooltips
- Responsive bars
- Day labels (Mon-Sun)
- Height based on value
- Max value scaling

---

#### ViewDocumentModal
**File:** `components/admin/ViewDocumentModal.tsx`

**Purpose:** View verification documents

**Used In:** VerificationRequests

**Props:**
```typescript
interface Document {
  id: string;
  userId: string;
  fileUrl: string;
  type: string;
  status: string;
}

interface User {
  username: string;
  email: string;
  fullName: string;
  birthday: string;
  university: string;
  faculty: string;
}
```
- `isOpen: boolean`
- `onClose: () => void`
- `document: Document`
- `user: User`
- `onApprove: () => void`
- `onReject: (reason: string) => void`

**Features:**
- Signed URL fetching (Supabase storage)
- Image/PDF preview
- Full user details display:
  - Username, email
  - Full name
  - Birthday (age)
  - University, faculty
  - Document type

- Approve/reject buttons
- Reject reason textarea
- Download/open in new tab
- Loading states
- Error handling
- Large modal (max-width 4xl)

---

#### ConfirmModal (Admin variant)
**File:** `components/admin/ConfirmModal.tsx`

**Purpose:** Admin action confirmations

**Used In:** All admin management components

**Props:**
- `isOpen: boolean`
- `onClose: () => void`
- `onConfirm: () => void`
- `title: string`
- `message: string`
- `type?: 'warning' | 'danger' | 'info'`
- `confirmText?: string`
- `cancelText?: string`
- `showReasonInput?: boolean`
- `onReasonChange?: (reason: string) => void`
- `disabled?: boolean`

**Features:**
- 3 visual types (warning, danger, info)
- Optional reason textarea
- Disabled state support
- Custom button labels
- Icon display
- Glass morphism design
- Backdrop click to close
- ESC key to close

---

## 3. COMPONENT HIERARCHY MAP

```
app/
├── layout.tsx (Root Layout)
│   └── Metadata & Theme Configuration
│
├── page.tsx (Landing Page)
│   ├── LoadingScreen
│   ├── HeroSection
│   │   └── SignInModal
│   ├── FeaturesSection (commented out)
│   ├── HowItWorksSection (commented out)
│   └── Footer (commented out)
│
├── login/page.tsx
│   └── Toast
│
├── register/
│   ├── simple/page.tsx
│   │   └── Toast
│   └── verified/page.tsx
│       └── Toast
│
├── setup-profile/page.tsx
│   └── Toast
│
├── dashboard/page.tsx
│   ├── Navbar
│   ├── DashboardHeader
│   ├── FilterPanel
│   ├── RecommendationFeed
│   │   ├── ProfileCard (multiple)
│   │   ├── MatchModal
│   │   └── EmptyState
│   └── NotificationBar
│
├── my-profile/page.tsx
│   ├── Navbar
│   ├── CreatePostModal
│   └── Toast
│
├── profile/
│   └── [id]/page.tsx
│       ├── Navbar
│       ├── ProfileView
│       └── Toast
│
├── inbox/page.tsx
│   ├── Navbar
│   ├── InboxList
│   └── Toast
│
├── chat/
│   └── [id]/page.tsx
│       ├── Navbar
│       ├── ChatHeader
│       ├── ChatMessage (multiple)
│       ├── ChatInput
│       ├── BlockReportModal
│       ├── UnblockModal
│       └── Toast
│
├── notice-board/page.tsx
│   ├── Navbar
│   └── CreatePostModal (via my-profile)
│
├── pending-verification/page.tsx
│   └── No components
│
├── restricted/page.tsx
│   └── No components
│
└── admin/
    ├── page.tsx
    │   ├── AdminHeader
    │   ├── DashboardStats
    │   │   └── StatsCard (multiple)
    │   ├── UsersManagement
    │   │   └── ConfirmModal
    │   ├── VerificationRequests
    │   │   ├── ViewDocumentModal
    │   │   └── ConfirmModal
    │   ├── ReportsManagement
    │   │   └── ConfirmModal
    │   └── NoticeBoardManagement
    │       └── ConfirmModal
    └── verifications/page.tsx
        └── Redirects to admin/page.tsx
```

---

## 4. SUMMARY & STATISTICS

### 📊 Component Statistics

**Total Pages:** 17
- Landing: 1
- Authentication: 4 (Login, Simple Register, Verified Register, Setup Profile)
- Main Application: 7 (Dashboard, My Profile, User Profile, Inbox, Chat, Notice Board, Pending Verification, Restricted)
- Admin: 2 (Dashboard, Verifications redirect)

**Total Components:** 48
- **UI Components:** 3
  - Navbar
  - Toast
  - ConfirmModal

- **Landing Components:** 6
  - LoadingScreen
  - HeroSection
  - SignInModal
  - FeaturesSection
  - HowItWorksSection
  - Footer

- **Auth Components:** 2 (empty placeholders)
  - SignInButton
  - SignInModal

- **Registration Components:** 3
  - EmailRegistration
  - ProfileCreation
  - VerificationSection

- **Dashboard Components:** 7
  - RecommendationFeed
  - ProfileCard
  - FilterPanel
  - MatchModal
  - NotificationBar
  - DashboardHeader
  - EmptyState

- **Profile Components:** 2
  - ProfileView
  - CreatePostModal

- **Chat Components:** 7
  - ChatHeader
  - ChatMessage
  - ChatInput
  - InboxList
  - BlockReportModal
  - UnblockModal
  - Toast (chat variant)

- **Admin Components:** 10
  - AdminHeader
  - DashboardStats
  - StatsCard
  - UsersManagement
  - VerificationRequests
  - ViewDocumentModal
  - ReportsManagement
  - NoticeBoardManagement
  - MiniChart
  - ConfirmModal (admin variant)

---

### 🎨 Key Technologies & Patterns

**Frontend Stack:**
- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **State:** React Hooks (useState, useEffect, useRef)

**Backend Integration:**
- **Database:** Supabase PostgreSQL
- **Realtime:** Supabase Realtime (postgres_changes)
- **Storage:** Supabase Storage (for document uploads)
- **Authentication:** Custom JWT with localStorage

**Design System:**
- **Color Scheme:** Purple, pink, blue gradients
- **UI Style:** Glass morphism (backdrop-blur, transparency)
- **Typography:** Modern sans-serif with responsive sizing
- **Layout:** Grid and flexbox
- **Responsiveness:** Mobile-first approach
- **Dark Mode:** Admin panel only

**Common Patterns:**
- **Toast Notifications:** User feedback for actions
- **Confirmation Modals:** Destructive action confirmations
- **Loading States:** Skeleton loaders, spinners
- **Empty States:** Helpful messages when no data
- **Optimistic UI:** Immediate feedback before server response
- **Realtime Subscriptions:** Live data updates
- **Form Validation:** Client-side validation with error messages
- **Accessibility:** Keyboard navigation, ARIA labels
- **Responsive Design:** Mobile/tablet/desktop breakpoints

---

### 🔄 Component Reusability

**Highly Reusable Components:**
1. **Toast** - Used in 12+ pages for notifications
2. **ConfirmModal** - Used in 8+ components for confirmations
3. **Navbar** - Used on all authenticated pages
4. **ProfileCard** - Can be reused in search, matches, recommendations
5. **StatsCard** - Reusable for any metric display

**Single-Use Components:**
- LoadingScreen (landing only)
- AdminHeader (admin only)
- CreatePostModal (my-profile only)

**Partially Reusable:**
- ChatHeader (could be adapted for video calls)
- ChatMessage (could support media, reactions)
- InboxList (could support different list types)

---

### 📁 File Structure Summary

```
ghosty/
├── app/ (17 pages)
│   ├── admin/
│   ├── chat/
│   ├── dashboard/
│   ├── inbox/
│   ├── login/
│   ├── my-profile/
│   ├── notice-board/
│   ├── pending-verification/
│   ├── profile/
│   ├── register/
│   ├── restricted/
│   ├── setup-profile/
│   ├── layout.tsx
│   └── page.tsx
│
├── components/ (48 components)
│   ├── admin/ (10 components)
│   ├── auth/ (2 empty)
│   ├── chat/ (7 components)
│   ├── dashboard/ (7 components)
│   ├── landing/ (6 components)
│   ├── profile/ (2 components)
│   ├── registration/ (3 components)
│   └── ui/ (3 components)
│
├── lib/
│   ├── api/
│   ├── contexts/
│   ├── email/
│   ├── supabase/
│   └── utils/
│
└── public/
```

---

### 🎯 Component Usage Frequency

**Most Used Components:**
1. Navbar - 10+ pages
2. Toast - 12+ pages
3. ConfirmModal - 8+ components
4. Loading states - All pages
5. Glass morphism cards - All pages

**Least Used Components:**
1. LoadingScreen - 1 page
2. MiniChart - 0 (not in use)
3. SignInButton/SignInModal (auth folder) - Empty
4. VerificationSection - 1 component
5. UnblockModal - 1 page

---

### 🚀 Future Component Opportunities

**Components That Could Be Extracted:**
1. **SearchBar** - Currently embedded in Navbar, DashboardHeader
2. **UserAvatar** - Repeated avatar display logic
3. **StatusBadge** - Verification, approval status badges
4. **GenderIcon** - Gender-specific icons
5. **TimeAgo** - Timestamp formatting
6. **FileUpload** - Document upload functionality
7. **RangeSlider** - Age range filtering
8. **Tabs** - Tab navigation pattern (inbox, admin)

**Components That Need Refactoring:**
1. **InboxList** - Too much logic, should split into subcomponents
2. **ProfileCard** - Could split swipe logic into HOC
3. **VerificationRequests** - Large component, split into smaller parts
4. **UsersManagement** - Table could be separate component

---

### 📱 Responsive Breakpoints Used

```css
/* Tailwind default breakpoints */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X large devices */
```

**Responsive Patterns:**
- Desktop navigation → Mobile bottom nav
- Grid layouts: 3 cols → 2 cols → 1 col
- Sidebar filters: slide-out panel → full-screen overlay
- Text size: xl → lg → base
- Padding: px-8 → px-6 → px-4

---

## 🎨 DESIGN SYSTEM DETAILS

### Color Palette

**Primary Colors:**
- Purple: `#A855F7`, `#9333EA`, `#7C3AED`
- Pink: `#EC4899`, `#DB2777`
- Blue: `#3B82F6`, `#2563EB`, `#1D4ED8`

**Semantic Colors:**
- Success: Green (`#10B981`, `#059669`)
- Error/Danger: Red (`#EF4444`, `#DC2626`)
- Warning: Orange/Amber (`#F59E0B`, `#D97706`)
- Info: Blue (`#3B82F6`, `#2563EB`)

**Neutral Colors:**
- Background Light: `#F9FAFB`, `#F3F4F6`
- Background Dark: `#111827`, `#1F2937`
- Text Dark: `#111827`, `#1F2937`, `#374151`
- Text Light: `#F9FAFB`, `#E5E7EB`

### Typography Scale

**Headings:**
- H1: `text-4xl` (36px) / `text-5xl` (48px) on large screens
- H2: `text-3xl` (30px) / `text-4xl` (36px) on large screens
- H3: `text-2xl` (24px)
- H4: `text-xl` (20px)

**Body Text:**
- Base: `text-base` (16px)
- Small: `text-sm` (14px)
- Extra Small: `text-xs` (12px)

**Font Weights:**
- Normal: `font-normal` (400)
- Medium: `font-medium` (500)
- Semibold: `font-semibold` (600)
- Bold: `font-bold` (700)

### Spacing System

**Padding/Margin:**
- xs: `p-2` (8px)
- sm: `p-3` (12px)
- md: `p-4` (16px)
- lg: `p-6` (24px)
- xl: `p-8` (32px)
- 2xl: `p-12` (48px)

**Gap:**
- xs: `gap-2` (8px)
- sm: `gap-3` (12px)
- md: `gap-4` (16px)
- lg: `gap-6` (24px)

### Border Radius

**Rounded:**
- sm: `rounded-sm` (2px)
- md: `rounded-md` (6px)
- lg: `rounded-lg` (8px)
- xl: `rounded-xl` (12px)
- 2xl: `rounded-2xl` (16px)
- full: `rounded-full` (9999px)

### Shadows

**Box Shadow:**
- sm: `shadow-sm`
- default: `shadow`
- md: `shadow-md`
- lg: `shadow-lg`
- xl: `shadow-xl`
- 2xl: `shadow-2xl`

### Glass Morphism Effect

**Standard Glass Card:**
```css
background: rgba(255, 255, 255, 0.95)
backdrop-filter: blur(20px)
border: 1px solid rgba(255, 255, 255, 0.2)
```

**Dark Glass Card:**
```css
background: rgba(17, 24, 39, 0.95)
backdrop-filter: blur(20px)
border: 1px solid rgba(255, 255, 255, 0.1)
```

### Animation Durations

**Transitions:**
- Fast: `duration-150` (150ms)
- Normal: `duration-200` (200ms)
- Slow: `duration-300` (300ms)

**Animations:**
- Spin: `animate-spin` (1s linear infinite)
- Pulse: `animate-pulse` (2s cubic-bezier infinite)
- Bounce: `animate-bounce` (1s infinite)

---

## 📖 USAGE GUIDELINES

### Component Selection Guide

**When to use Toast:**
- Action confirmations (saved, deleted, sent)
- Error messages (failed to load, invalid input)
- Temporary information (processing, loading)
- NON-blocking notifications

**When to use ConfirmModal:**
- Destructive actions (delete, restrict, block)
- Irreversible operations
- High-impact decisions
- BLOCKING user input required

**When to use EmptyState:**
- No search results
- Empty lists/feeds
- Missing data scenarios
- Helpful guidance needed

**When to use LoadingState:**
- Data fetching in progress
- Background operations
- Initial page load
- Async actions pending

---

## 🔍 QUICK REFERENCE

### Component Import Paths

```typescript
// UI Components
import Navbar from '@/components/ui/Navbar';
import Toast from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';

// Landing Components
import LoadingScreen from '@/components/landing/LoadingScreen';
import HeroSection from '@/components/landing/HeroSection';
import SignInModal from '@/components/landing/SignInModal';

// Dashboard Components
import RecommendationFeed from '@/components/dashboard/RecommendationFeed';
import ProfileCard from '@/components/dashboard/ProfileCard';
import FilterPanel from '@/components/dashboard/FilterPanel';

// Profile Components
import ProfileView from '@/components/profile/ProfileView';
import CreatePostModal from '@/components/profile/CreatePostModal';

// Chat Components
import ChatHeader from '@/components/chat/ChatHeader';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import InboxList from '@/components/chat/InboxList';

// Admin Components
import AdminHeader from '@/components/admin/AdminHeader';
import DashboardStats from '@/components/admin/DashboardStats';
import UsersManagement from '@/components/admin/UsersManagement';
```

---

## 📚 ADDITIONAL RESOURCES

### API Endpoints Used by Components

**Authentication:**
- POST `/api/login`
- POST `/api/register/simple`
- POST `/api/register/verified`

**User Profile:**
- GET `/api/profile/[userId]`
- GET `/api/profile/edit?userId={id}`
- PUT `/api/profile/edit`
- GET `/api/users/[userId]`
- GET `/api/users/search?query={text}`

**Dashboard:**
- GET `/api/recommendations?userId={id}&filters={json}`
- POST `/api/swipes`
- GET `/api/matches?userId={id}`

**Chat & Inbox:**
- POST `/api/conversations`
- GET `/api/conversations?userId={id}`
- GET `/api/chats?conversationId={id}&userId={id}`
- POST `/api/chats`
- POST `/api/chats/read`
- GET `/api/inbox/requests?userId={id}`
- GET `/api/inbox/chats?userId={id}`
- POST `/api/inbox/requests`

**Blocks & Reports:**
- POST `/api/blocks`
- GET `/api/blocks?userId={id}`
- DELETE `/api/blocks?userId={id}&blockedId={id}`
- POST `/api/reports`
- GET `/api/reports?userId={id}`

**Notice Board:**
- GET `/api/notice-board`
- POST `/api/notice-board/posts`
- GET `/api/notice-board/posts?userId={id}`

**Admin:**
- GET `/api/admin/stats`
- GET `/api/admin/users`
- PUT `/api/admin/users`
- GET `/api/admin/verifications`
- PUT `/api/admin/verifications`
- GET `/api/admin/reports`
- PUT `/api/admin/reports`
- GET `/api/admin/notice-board`
- PUT `/api/admin/notice-board`

---

**Report Generated:** February 13, 2026  
**Total Pages Analyzed:** 17  
**Total Components Documented:** 48  
**Total Lines of Code:** ~15,000+ (estimated)

---

*End of Comprehensive UI Component Report*
