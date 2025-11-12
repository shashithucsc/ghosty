# Ghosty Chat System - Quick Start Guide

## 🚀 Getting Started

### Access the Chat System

1. **Start Development Server** (if not running):
   ```bash
   npm run dev
   ```

2. **Navigate to Inbox**:
   - From Dashboard: Click the **MessageCircle icon** in the header
   - Direct URL: `http://localhost:3000/inbox`

---

## 📱 Inbox Page Features

### Visual Layout

```
┌───────────────────────────────────┐
│  ← Inbox                          │
├───────────────────────────────────┤
│                                   │
│  🟡 Chat Requests (3)             │
│  ┌─────────────────────────────┐  │
│  │ 👩 CharmingSoul456         │  │
│  │ 24 • Female      15m ago   │  │
│  │ 🔒 Accept to view message  │  │
│  │ [Accept] [Reject]          │  │
│  └─────────────────────────────┘  │
│                                   │
│  🟢 Active Chats (2)              │
│  ┌─────────────────────────────┐  │
│  │ 🧑 BraveExplorer789    ⋮   │  │
│  │ 26 • Male        2h ago    │  │
│  │ Hi there! Let's talk...    │  │
│  │ [Open Chat]                │  │
│  └─────────────────────────────┘  │
│                                   │
└───────────────────────────────────┘
```

### Available Actions

#### 1. Chat Requests (Pending)
- **Status**: Yellow indicator 🟡
- **Message**: Locked 🔒 until accepted
- **Actions**:
  - ✅ **Accept**: Unlocks chat, moves to Active
  - ❌ **Reject**: Declines request
  - 🚫 **Block** (via menu): Blocks user permanently

#### 2. Active Chats (Accepted)
- **Status**: Green indicator 🟢
- **Message**: Full preview visible
- **Actions**:
  - 💬 **Open Chat**: Navigate to chat page
  - 🚫 **Block** (via ⋮ menu): Block user

#### 3. Blocked Users
- **Status**: Red indicator 🔴
- **Actions**: None (permanent block)

---

## 💬 Chat Page Features

### Access
1. From Inbox → Click "Open Chat" on accepted request
2. Direct URL: `http://localhost:3000/chat/[request-id]`

### Visual Layout

```
┌───────────────────────────────────┐
│  ← 👩 CharmingSoul456        ⋮   │
│     24 • Female                   │
├───────────────────────────────────┤
│                                   │
│  ┌─────────────────────┐          │
│  │ Hey! I loved your   │          │
│  │ profile 😊          │          │
│  └───────────────────  10:30 AM   │
│                                   │
│          ┌──────────────────────┐ │
│          │ Thanks! I saw we     │ │
│          │ have similar tastes  │ │
│   10:32 AM  ─────────────────────┘ │
│                                   │
├───────────────────────────────────┤
│  Type a message...     😊  [→]    │
└───────────────────────────────────┘
```

### Features

1. **Message Display**
   - Partner messages: Left-aligned, white bubbles
   - Your messages: Right-aligned, purple-pink gradient
   - Timestamps: Below each message

2. **Send Messages**
   - Type in input field
   - Press **Enter** to send
   - **Shift+Enter** for new line
   - Click **send button** (→)

3. **Auto-Scroll**
   - Automatically scrolls to latest message
   - Smooth scroll animation

4. **Block/Report**
   - Click **⋮** (three dots) in header
   - Choose "Block User" or "Report User"

---

## 🛡️ Safety Features

### Block User Flow

```
1. Click ⋮ menu
   ↓
2. Select "Block User"
   ↓
3. Choose reason (optional):
   - Inappropriate behavior
   - Spam or scam
   - Harassment
   - Fake profile
   - Not interested
   - Other (custom text)
   ↓
4. Click "Block User"
   ↓
5. User blocked ✓
   ↓
6. Redirected to Inbox
```

### Report User Flow

```
1. Click ⋮ menu
   ↓
2. Select "Report User"
   ↓
3. Choose reason (required):
   - Harassment or bullying
   - Inappropriate content
   - Spam or scam
   - Fake profile
   - Violent threats
   - Other safety concern
   ↓
4. Add details if needed
   ↓
5. Click "Submit Report"
   ↓
6. Report sent + User blocked
   ↓
7. Redirected to Inbox
```

---

## 🧪 Testing Scenarios

### Scenario 1: Accept Chat Request

1. Go to `/inbox`
2. Find a pending request (yellow indicator)
3. Notice message is locked 🔒
4. Click **Accept**
5. ✅ Request moves to "Active Chats" section
6. ✅ Message preview now visible
7. Click **Open Chat**
8. ✅ Navigate to chat page

### Scenario 2: Send Messages

1. Open any active chat
2. Type "Hello!" in input field
3. Press **Enter** or click send button
4. ✅ Your message appears (right-aligned, purple gradient)
5. Wait 2 seconds
6. ✅ Partner auto-response appears (left-aligned, white)
7. ✅ Chat auto-scrolls to bottom

### Scenario 3: Block User

1. In chat page, click **⋮** menu
2. Click "Block User"
3. Select reason (optional)
4. Click "Block User" button
5. ✅ See "User Blocked" confirmation
6. ✅ Redirect to inbox after 2 seconds
7. ✅ User appears in "Blocked" section

### Scenario 4: Reject Request

1. Go to `/inbox`
2. Find pending request
3. Click **Reject**
4. ✅ Request status changes to "rejected"
5. ✅ Shows "Request rejected" text

---

## 📊 Mock Data (Current State)

### Inbox Requests (5 total)

| Name | Status | Age | Gender | Time |
|------|--------|-----|--------|------|
| CharmingSoul456 | Pending | 24 | Female | 15m ago |
| BraveExplorer789 | Accepted | 26 | Male | 2h ago |
| GentleDreamer234 | Pending | 23 | Female | 5h ago |
| SmartVibes567 | Accepted | 25 | Male | 1d ago |
| LovelySpirit890 | Pending | 22 | Female | 2d ago |

### Chat Messages (Example)

```typescript
// Chat with CharmingSoul456
[
  { from: 'partner', text: 'Hey! I loved your profile 😊', time: '30m ago' },
  { from: 'you', text: 'Hi! Thanks for reaching out.', time: '25m ago' },
  { from: 'partner', text: 'What's your favorite cuisine?', time: '20m ago' },
  { from: 'you', text: 'I love Japanese food!', time: '15m ago' },
  { from: 'partner', text: 'Tokyo is on my bucket list!', time: '10m ago' }
]
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Enter** | Send message |
| **Shift + Enter** | New line in message |
| **Esc** | Close modal |

---

## 🎨 Visual Indicators

| Color | Meaning | Element |
|-------|---------|---------|
| 🟡 Yellow | Pending request | Status dot |
| 🟢 Green | Active chat | Status dot |
| 🔴 Red | Blocked user | Status dot |
| 🟣 Purple-Pink | Your message | Message bubble |
| ⚪ White | Partner message | Message bubble |
| 🔴 Red badge | New notification | Icon badge |

---

## 📱 Mobile Testing

### Recommended Tests

1. **Portrait Mode**
   - Open inbox on mobile screen
   - Scroll through requests
   - Accept/reject requests
   - Open chat and send messages

2. **Landscape Mode**
   - Rotate device
   - Verify layout adapts
   - Check input field visibility

3. **Touch Gestures**
   - Tap buttons (ensure 48px+ target)
   - Scroll messages smoothly
   - Type and send messages

---

## 🔧 Troubleshooting

### Issue: Can't see messages in pending request

**Solution**: This is by design! Messages are locked 🔒 until you accept the request. Click "Accept" to view.

### Issue: Send button doesn't work

**Checklist**:
- [ ] Input field has text
- [ ] Not just whitespace
- [ ] Button should be purple (enabled)
- [ ] Try pressing Enter key instead

### Issue: Chat doesn't auto-scroll

**Solution**: 
- This happens automatically on new messages
- Manually scroll down if needed
- Refresh page if stuck

### Issue: Can't navigate back from chat

**Solution**: Click the **← (back arrow)** in top-left corner

---

## 🚀 Next Steps

After testing the chat system:

1. **Integrate with Backend**
   - Connect to real API endpoints
   - Implement WebSocket for real-time messages
   - Add authentication tokens

2. **Add Features**
   - Push notifications
   - Read receipts
   - Typing indicators
   - Image sharing

3. **Improve UX**
   - Message search
   - Chat archive
   - Emoji picker
   - Voice messages

---

## 📚 Related Documentation

- **Full Documentation**: `CHAT_DOCUMENTATION.md`
- **Dashboard Guide**: `DASHBOARD_README.md`
- **Testing Guide**: `TESTING_GUIDE.md`

---

**Questions?** Review the complete documentation or test each feature step-by-step!

*Last Updated: November 12, 2025*
