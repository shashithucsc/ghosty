# Ghosty Chat System - Complete Documentation

## 📱 Overview

The Ghosty chat system provides a secure, mobile-first messaging experience with inbox management, real-time chat, and safety features including block/report functionality.

---

## 🗂️ File Structure

```
app/
├── inbox/
│   └── page.tsx                 # Inbox page with chat requests
├── chat/
│   └── [id]/
│       └── page.tsx             # Individual chat page (dynamic route)
components/
└── chat/
    ├── ChatHeader.tsx           # Reusable header component
    ├── InboxList.tsx            # List of chat requests
    ├── ChatMessage.tsx          # Individual message bubble
    ├── ChatInput.tsx            # Message input with send button
    └── BlockReportModal.tsx     # Block/report modal interface
```

---

## 📄 Page Components

### 1. Inbox Page (`/inbox`)

**Purpose**: Central hub for managing incoming chat requests and accessing active conversations.

**Features**:
- ✅ Chat request management (Accept/Reject/Block)
- ✅ Pending requests with locked message previews
- ✅ Active chats list
- ✅ Blocked users section
- ✅ Empty state with CTA to dashboard
- ✅ Time-ago timestamps

**Key Sections**:
```typescript
// Chat Requests (Pending) - Yellow indicator
- Shows locked message preview
- Accept/Reject buttons
- Block option in menu

// Active Chats (Accepted) - Green indicator  
- Shows message preview
- "Open Chat" button
- Block option in menu

// Blocked Users - Red indicator
- Shows blocked status
- No interaction allowed
```

**State Management**:
```typescript
const [requests, setRequests] = useState<ChatRequest[]>([]);
const [loading, setLoading] = useState(true);

// Actions
handleAccept(requestId)   // Sets status to 'accepted'
handleReject(requestId)   // Sets status to 'rejected'
handleBlock(requestId)    // Sets isBlocked: true
handleOpenChat(requestId) // Navigates to /chat/[id]
```

---

### 2. Chat Page (`/chat/[id]`)

**Purpose**: One-on-one text messaging interface with chat partner.

**Features**:
- ✅ Real-time message display
- ✅ Auto-scroll to latest message
- ✅ Partner's anonymous alias and avatar
- ✅ Timestamp on each message
- ✅ Own messages vs received messages (different styles)
- ✅ Block/Report menu
- ✅ Blocked user confirmation screen

**Layout**:
```
┌─────────────────────────┐
│   ChatHeader            │ ← Avatar, name, back, menu
├─────────────────────────┤
│                         │
│   Messages (scrollable) │ ← Auto-scroll
│                         │
│   👤 Partner message    │
│      You message 💜     │
│                         │
├─────────────────────────┤
│   ChatInput             │ ← Type & send
└─────────────────────────┘
```

**Message Flow**:
```typescript
const handleSendMessage = (text: string) => {
  // 1. Add user's message immediately
  const newMessage = { isOwn: true, text, timestamp: new Date() }
  setMessages([...messages, newMessage])
  
  // 2. Simulate partner response after 2s
  setTimeout(() => {
    const partnerMessage = { isOwn: false, text: randomResponse }
    setMessages(prev => [...prev, partnerMessage])
  }, 2000)
}
```

---

## 🧩 Component Library

### ChatHeader

**Props**:
```typescript
interface ChatHeaderProps {
  title: string;          // Main heading
  subtitle?: string;      // Below title (e.g., "24 • Female")
  avatar?: string;        // Emoji avatar
  showBack?: boolean;     // Show back arrow
  showMenu?: boolean;     // Show 3-dot menu
  onBack?: () => void;
  onBlockReport?: () => void;
}
```

**Usage**:
```tsx
// Inbox header
<ChatHeader 
  title="Inbox" 
  showBack={true} 
  onBack={() => router.push('/dashboard')} 
/>

// Chat header
<ChatHeader 
  title="CharmingSoul456"
  subtitle="24 • Female"
  avatar="👩"
  showBack={true}
  showMenu={true}
  onBlockReport={() => setShowBlockModal(true)}
/>
```

---

### InboxList

**Props**:
```typescript
interface InboxListProps {
  requests: ChatRequest[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onBlock: (id: string) => void;
  onOpenChat: (id: string) => void;
}
```

**Features**:
- Conditional rendering based on request status
- Locked message preview for pending requests
- 3-dot menu for active chats (block option)
- Time-ago timestamps
- Responsive card layout

**Request Status Flow**:
```
pending → Accept → accepted → Open Chat
        ↓ Reject → rejected
        ↓ Block  → isBlocked: true
```

---

### ChatMessage

**Props**:
```typescript
interface ChatMessageProps {
  message: Message;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isOwn: boolean;  // Determines styling
}
```

**Styling**:
```css
/* Own messages */
- Right-aligned
- Purple-to-pink gradient background
- White text
- Rounded corners (except top-right)

/* Partner messages */
- Left-aligned
- White background (dark: gray-800)
- Gray text (dark: white)
- Border with rounded corners (except top-left)
```

---

### ChatInput

**Props**:
```typescript
interface ChatInputProps {
  onSend: (text: string) => void;
}
```

**Features**:
- Auto-expanding textarea (max 3 rows)
- Enter key to send (Shift+Enter for new line)
- Send button disabled when empty
- Emoji button (placeholder for future)
- Sticky to bottom of screen

**Keyboard Shortcuts**:
- `Enter`: Send message
- `Shift + Enter`: New line

---

### BlockReportModal

**Props**:
```typescript
interface BlockReportModalProps {
  userName: string;
  onBlock: (reason: string) => void;
  onClose: () => void;
}
```

**Flow**:
```
1. Initial Screen
   ├── Block User (red)
   └── Report User (yellow)

2. Block Form
   ├── Reason selection (optional)
   │   - Inappropriate behavior
   │   - Spam or scam
   │   - Harassment
   │   - Fake profile
   │   - Not interested
   │   - Other (text input)
   └── Submit → onBlock(reason)

3. Report Form
   ├── Reason selection (required)
   │   - Harassment or bullying
   │   - Inappropriate content
   │   - Spam or scam
   │   - Fake profile
   │   - Violent threats
   │   - Other safety concern (textarea)
   └── Submit → onBlock(reason)
```

---

## 🎨 Design System

### Color Scheme

```css
/* Message Bubbles */
--own-message: linear-gradient(to right, #9333ea, #db2777)  /* purple-pink */
--partner-message: white (dark: #1f2937)

/* Status Indicators */
--pending: #eab308   /* yellow-500 */
--accepted: #22c55e  /* green-500 */
--blocked: #ef4444   /* red-500 */

/* Buttons */
--accept: linear-gradient(to right, #22c55e, #10b981)  /* green-emerald */
--reject: #ef4444 border
--send: linear-gradient(to right, #9333ea, #db2777)
```

### Typography

```css
/* Headers */
h1: 2xl sm:3xl, font-bold
h2: lg, font-bold
h3: base sm:lg, font-bold

/* Messages */
Message text: sm sm:text-base
Timestamps: xs, gray-500
Status text: sm, italic
```

### Spacing

```css
/* Chat Layout */
Header: py-3 sm:py-4
Message spacing: space-y-4
Input padding: px-4 py-3 sm:py-4
Card padding: p-4 sm:p-5
```

---

## 📊 Data Structures

### ChatRequest Interface

```typescript
export interface ChatRequest {
  id: string;
  from: {
    anonymousName: string;
    avatar: string;
    age: number;
    gender: string;
  };
  message: string;
  timestamp: Date;
  status: 'pending' | 'accepted' | 'rejected';
  isBlocked?: boolean;
}
```

### Message Interface

```typescript
export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isOwn: boolean;
}
```

---

## 🔄 Navigation Flow

```
Dashboard
    ↓ (MessageCircle icon in header)
Inbox (/inbox)
    ↓ (Accept request)
Chat (/chat/[id])
    ↓ (Block user)
Inbox (with notification)
    ↓ (Back button)
Dashboard
```

---

## 🔐 Safety Features

### Block System

**Triggers**:
1. From inbox list (3-dot menu on active chats)
2. From chat page (3-dot menu in header)

**Effects**:
- User marked as `isBlocked: true`
- Chat becomes read-only
- Moved to "Blocked" section in inbox
- User cannot send new messages

**Implementation**:
```typescript
const handleBlock = (reason: string) => {
  setIsBlocked(true);
  // Show confirmation for 2 seconds
  setTimeout(() => {
    router.push('/inbox');
  }, 2000);
};
```

### Report System

**Categories**:
- Harassment or bullying
- Inappropriate content
- Spam or scam
- Fake profile
- Violent threats
- Other safety concern (with details)

**Process**:
1. User selects report reason
2. Optionally provides details
3. Submits to moderation queue (future backend)
4. User is blocked automatically

---

## 📱 Mobile Optimizations

### Touch Interactions

```css
/* Tap targets */
Buttons: min 48px height
Icons: w-5 h-5 sm:w-6 sm:h-6

/* Scrolling */
Messages: overflow-y-auto, smooth scroll
Textarea: auto-resize, max-height: 128px
```

### Responsive Breakpoints

```css
/* Mobile First (default) */
- Single column
- Full-width cards
- Stacked buttons

/* Tablet (sm: 640px) */
- Larger text
- More padding
- Avatar in header

/* Desktop (md: 768px+) */
- Max-width containers
- Side-by-side layouts
```

---

## 🧪 Testing Checklist

### Inbox Page
- [ ] Pending requests show locked message
- [ ] Accept button changes status to accepted
- [ ] Reject button changes status to rejected
- [ ] Block sets isBlocked flag
- [ ] Active chats show message preview
- [ ] "Open Chat" navigates to correct chat
- [ ] Empty state displays when no requests
- [ ] Time-ago updates correctly

### Chat Page
- [ ] Messages render in correct order
- [ ] Own messages appear on right (purple gradient)
- [ ] Partner messages appear on left (white/gray)
- [ ] Timestamps format correctly
- [ ] Auto-scroll to bottom on new message
- [ ] Enter key sends message
- [ ] Shift+Enter creates new line
- [ ] Send button disabled when input empty
- [ ] Block modal opens from menu
- [ ] Blocked user screen displays correctly

### Block/Report Modal
- [ ] Initial screen shows both options
- [ ] Block form allows reason selection
- [ ] Report form requires reason
- [ ] "Other" option shows text input
- [ ] Back button returns to initial screen
- [ ] Submit calls onBlock callback
- [ ] Modal closes on backdrop click

---

## 🚀 Future Enhancements

### Phase 1 (Immediate)
- [ ] Backend API integration
- [ ] Real-time WebSocket messaging
- [ ] Push notifications for new messages
- [ ] Message delivery/read receipts

### Phase 2 (Near Future)
- [ ] Image sharing
- [ ] Voice messages
- [ ] Typing indicators
- [ ] Message reactions (emoji)
- [ ] Search chat history

### Phase 3 (Long Term)
- [ ] End-to-end encryption
- [ ] Message deletion
- [ ] Chat archive
- [ ] Video/voice calls
- [ ] Group chats

---

## 🐛 Known Limitations (Mock Data)

1. **Messages**: Currently using mock data with simulated responses
2. **Real-time**: No WebSocket connection (setTimeout simulation)
3. **Persistence**: Messages don't persist across page refreshes
4. **Notifications**: No push notifications
5. **Authentication**: No actual user verification
6. **Moderation**: Reports don't go to actual moderation queue

---

## 📞 Support

For technical documentation, see:
- `DASHBOARD_README.md` - Dashboard features
- `REGISTRATION_README.md` - Registration flow
- `TESTING_GUIDE.md` - Complete testing guide

**Navigation**: `/inbox` → `/chat/[id]` → Dashboard header → Inbox

---

*Last Updated: November 12, 2025*
*Version: 1.0.0*
