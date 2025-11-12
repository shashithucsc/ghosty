# 🧪 Ghosty Chat System - Visual Testing Guide

## 📱 Inbox Page Testing

### Layout Overview

```
┌─────────────────────────────────────────────┐
│  ← Inbox                                    │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│  🟡 Chat Requests (3)                       │
│  ┌───────────────────────────────────────┐  │
│  │  👩  CharmingSoul456            15m   │  │
│  │      24 • Female                      │  │
│  │      🔒 Accept to view message        │  │
│  │                                       │  │
│  │  [   Accept   ]  [   Reject   ]       │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  🌸  GentleDreamer234            5h   │  │
│  │      23 • Female                      │  │
│  │      🔒 Accept to view message        │  │
│  │                                       │  │
│  │  [   Accept   ]  [   Reject   ]       │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  🟢 Active Chats (2)                        │
│  ┌───────────────────────────────────────┐  │
│  │  🧑  BraveExplorer789          2h  ⋮  │  │
│  │      26 • Male                        │  │
│  │      Hi there! Let's talk about...    │  │
│  │                                       │  │
│  │  [       Open Chat       ]            │  │
│  └───────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

### Visual Indicators

| Element | Appearance | Meaning |
|---------|------------|---------|
| 🟡 Yellow dot | Pulsing animation | Pending request |
| 🟢 Green dot | Solid | Active conversation |
| 🔴 Red dot | Solid | Blocked user |
| 🔒 Lock icon | Gray | Message locked |
| ⋮ Three dots | Gray, clickable | Menu options |

### Test Checklist

#### ✅ Visual Elements
- [ ] Header shows "← Inbox" with back arrow
- [ ] Section headers have colored status dots
- [ ] Cards have glassmorphic effect (frosted glass)
- [ ] Avatars (emoji) display correctly
- [ ] Time-ago stamps show on right side
- [ ] Buttons have proper colors (green Accept, red border Reject)

#### ✅ Pending Requests
- [ ] Yellow pulsing dot visible
- [ ] Lock icon 🔒 shows for locked messages
- [ ] Text says "Accept to view message"
- [ ] Accept button is green gradient
- [ ] Reject button has red border
- [ ] No 3-dot menu (only for active chats)

#### ✅ Active Chats
- [ ] Green solid dot visible
- [ ] Full message preview shows
- [ ] 3-dot menu appears on right
- [ ] "Open Chat" button is purple gradient
- [ ] Clicking menu shows "Block User" option

#### ✅ Interactions
- [ ] **Hover** on cards: shadow increases
- [ ] **Click Accept**: Request moves to Active section
- [ ] **Click Reject**: Shows "Request rejected" text
- [ ] **Click Block** (from menu): User moves to Blocked section
- [ ] **Click Open Chat**: Navigates to `/chat/[id]`

---

## 💬 Chat Page Testing

### Layout Overview

```
┌─────────────────────────────────────────────┐
│  ← 👩 CharmingSoul456                   ⋮  │
│     24 • Female                             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────────────────────┐           │
│  │  Hey! I loved your profile   │           │
│  │  would love to chat! 😊      │           │
│  └────────────────────  10:30 AM            │
│                                             │
│           ┌──────────────────────────────┐  │
│           │  Hi! Thanks for reaching     │  │
│           │  out. I saw we have similar  │  │
│           │  interests!                  │  │
│    10:32 AM  ──────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────┐           │
│  │  Yes! I love traveling and   │           │
│  │  trying new food.            │           │
│  └────────────────────  10:35 AM            │
│                                             │
│           ┌──────────────────────────────┐  │
│           │  I'm a huge fan of Japanese  │  │
│           │  food! Have you been to      │  │
│           │  Japan?                      │  │
│    10:38 AM  ──────────────────────────────┘  │
│                                             │
│  ┌──────────────────────────────┐           │
│  │  Not yet, but it's on my     │           │
│  │  bucket list!                │           │
│  └────────────────────  10:40 AM            │
│                                             │
├─────────────────────────────────────────────┤
│  Type a message...              😊  [→]    │
└─────────────────────────────────────────────┘
```

### Message Bubble Styles

#### Your Messages (Right-aligned)
```
          ┌──────────────────────────────┐
          │  Your message text here      │  ← Purple-pink gradient
          │  with word wrapping          │     White text
   Time → └───────────────────────────────     Rounded (except top-right)
```

#### Partner Messages (Left-aligned)
```
┌──────────────────────────────┐
│  Partner's message text      │  ← White background
│  with word wrapping          │     Gray/Black text
└───────────────────  ← Time       Rounded (except top-left)
```

### Test Checklist

#### ✅ Visual Elements
- [ ] Header shows partner's avatar, name, age, gender
- [ ] Back arrow (←) on left
- [ ] Three-dot menu (⋮) on right
- [ ] Partner messages: white bubbles, left-aligned
- [ ] Your messages: purple gradient, right-aligned
- [ ] Timestamps below each message
- [ ] Input field at bottom (sticky)
- [ ] Send button is circular with arrow icon

#### ✅ Message Display
- [ ] Messages stack vertically with spacing
- [ ] Text wraps within bubble (no overflow)
- [ ] Long messages don't break layout
- [ ] Scroll bar appears if many messages
- [ ] Custom scrollbar styling (thin, gray)
- [ ] Auto-scroll to bottom on page load

#### ✅ Sending Messages
- [ ] **Type text**: Input field expands (max 3 rows)
- [ ] **Empty input**: Send button disabled (opacity 50%)
- [ ] **With text**: Send button enabled (full color)
- [ ] **Press Enter**: Message sends
- [ ] **Shift+Enter**: Creates new line (no send)
- [ ] **Click send**: Message sends
- [ ] **After send**: Input clears immediately
- [ ] **After send**: Your message appears (right, purple)
- [ ] **After 2s**: Partner auto-response appears (left, white)
- [ ] **Auto-scroll**: Chat scrolls to show new message

#### ✅ Interactions
- [ ] **Click back arrow**: Returns to inbox
- [ ] **Click ⋮ menu**: Opens block/report modal
- [ ] **Hover send button**: Scales up slightly
- [ ] **Emoji button** (😊): Shows tooltip "coming soon"

---

## 🛡️ Block/Report Modal Testing

### Initial Screen

```
┌─────────────────────────────────────────┐
│  Actions                            ✕   │
│  CharmingSoul456                        │
├─────────────────────────────────────────┤
│                                         │
│  ┌────────────────────────────────────┐ │
│  │  🛡️  Block User                    │ │
│  │      They won't be able to         │ │
│  │      contact you                   │ │
│  └────────────────────────────────────┘ │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │  🚩  Report User                   │ │
│  │      Report to moderators for      │ │
│  │      review                        │ │
│  └────────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

### Block Screen

```
┌─────────────────────────────────────────┐
│  Block User                         ✕   │
│  CharmingSoul456                        │
├─────────────────────────────────────────┤
│  ⚠️ Note: Blocking this user will       │
│  prevent them from contacting you.      │
│                                         │
│  Reason for blocking (optional)         │
│  ○ Inappropriate behavior               │
│  ○ Spam or scam                         │
│  ○ Harassment                           │
│  ○ Fake profile                         │
│  ○ Not interested                       │
│  ● Other                                │
│  ┌────────────────────────────────────┐ │
│  │ Please specify...                  │ │
│  └────────────────────────────────────┘ │
│                                         │
│  [   Back   ]    [   Block User   ]    │
└─────────────────────────────────────────┘
```

### Test Checklist

#### ✅ Visual Elements
- [ ] Modal appears centered on screen
- [ ] Backdrop is dark with blur effect
- [ ] Modal has glassmorphic card style
- [ ] Close button (✕) visible in top-right
- [ ] User name shows below title

#### ✅ Initial Screen
- [ ] Block option has red border, red icon
- [ ] Report option has yellow border, yellow icon
- [ ] Both buttons show descriptions
- [ ] Clicking Block → shows block form
- [ ] Clicking Report → shows report form

#### ✅ Block Form
- [ ] Red warning box at top
- [ ] Radio buttons for reasons
- [ ] "Other" option shows text input
- [ ] Back button returns to initial screen
- [ ] Block button is red
- [ ] Submit works without reason (optional)

#### ✅ Report Form
- [ ] Yellow warning box at top
- [ ] Radio buttons for reasons
- [ ] "Other safety concern" shows textarea
- [ ] Back button returns to initial screen
- [ ] Submit button is yellow
- [ ] Submit disabled until reason selected
- [ ] Submit button enabled when reason chosen

#### ✅ Interactions
- [ ] **Click backdrop**: Modal closes
- [ ] **Click ✕**: Modal closes
- [ ] **Press Esc**: Modal closes
- [ ] **Submit block**: Shows confirmation, redirects to inbox
- [ ] **Submit report**: Shows confirmation, redirects to inbox

---

## 📱 Mobile Responsive Testing

### Breakpoints to Test

| Screen | Width | Expected Changes |
|--------|-------|------------------|
| **Mobile** | < 640px | Single column, full-width, smaller text |
| **Tablet** | 640px - 768px | Larger text, more padding |
| **Desktop** | > 768px | Max-width containers, side spacing |

### Mobile Layout (< 640px)

```
┌──────────────────────┐
│  ← Inbox             │  ← Full width
├──────────────────────┤
│  🟡 Chat Requests    │
│  ┌────────────────┐  │
│  │ 👩 Name        │  │  ← Card full-width
│  │ 24 • Female    │  │
│  │ 🔒 Locked      │  │
│  │ [Accept][Reje] │  │  ← Stacked buttons
│  └────────────────┘  │
└──────────────────────┘
```

### Test Checklist

#### ✅ Mobile Portrait (375px)
- [ ] All cards full-width
- [ ] Text readable (not too small)
- [ ] Buttons large enough to tap (48px+)
- [ ] No horizontal scroll
- [ ] Input field covers full width
- [ ] Send button stays visible

#### ✅ Tablet (768px)
- [ ] Text sizes increase (sm → base)
- [ ] More padding on cards
- [ ] Buttons have comfortable spacing
- [ ] Max-width container centers content

#### ✅ Desktop (1024px+)
- [ ] Content max-width 672px (max-w-2xl)
- [ ] Centered with side margins
- [ ] Larger tap targets
- [ ] Comfortable reading width

---

## 🎨 Design System Validation

### Colors

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Background | Purple-pink-blue gradient | Dark purple-pink-blue gradient |
| Cards | White with 80% opacity | Gray-900 with 80% opacity |
| Your messages | Purple-pink gradient | Same |
| Partner messages | White | Gray-800 |
| Text | Gray-800 | White |
| Timestamps | Gray-500 | Gray-500 |

### Typography

| Element | Font Size | Weight |
|---------|-----------|--------|
| Page title | text-2xl sm:text-3xl | Bold |
| Section headers | text-lg | Bold |
| User names | text-base sm:text-lg | Bold |
| Message text | text-sm sm:text-base | Normal |
| Timestamps | text-xs | Normal |
| Button text | text-sm sm:text-base | Semibold |

### Animations

| Animation | Duration | Easing |
|-----------|----------|--------|
| Slide-up (messages) | 0.3s | ease-out |
| Scale-in (modal) | 0.2s | ease-out |
| Fade-in (backdrop) | 0.2s | ease-in |
| Hover shadow | 0.2s | ease-in-out |
| Button hover scale | 0.2s | ease-in-out |

### Test Checklist

#### ✅ Glassmorphic Effect
- [ ] Cards have frosted glass appearance
- [ ] Backdrop blur visible behind cards
- [ ] Semi-transparent white/gray background
- [ ] Subtle border on cards
- [ ] Shadows on cards

#### ✅ Animations
- [ ] Messages slide up when appearing
- [ ] Modal scales in from center
- [ ] Backdrop fades in
- [ ] Hover effects smooth (not jumpy)
- [ ] Auto-scroll is smooth (not instant)

#### ✅ Dark Mode
- [ ] Toggle system dark mode
- [ ] All text remains readable
- [ ] Contrast meets accessibility standards
- [ ] Glassmorphic effect still visible
- [ ] Colors invert correctly

---

## 🐛 Common Issues & Fixes

### Issue: Messages don't auto-scroll

**Expected**: Chat scrolls to bottom on new message
**Check**:
- [ ] `messagesEndRef` is attached to div
- [ ] `scrollIntoView({ behavior: 'smooth' })` called
- [ ] No CSS overflow issues

**Fix**: Add `useEffect` dependency on messages array

---

### Issue: Send button stays disabled

**Expected**: Button enables when text entered
**Check**:
- [ ] Input value is trimmed (`text.trim()`)
- [ ] Disabled state: `disabled={!text.trim()}`
- [ ] Input onChange updates state

**Fix**: Ensure `setText` called on input change

---

### Issue: Block modal doesn't close

**Expected**: Click backdrop or ✕ to close
**Check**:
- [ ] Backdrop has `onClick={onClose}`
- [ ] Close button has `onClick={onClose}`
- [ ] Modal container has `pointer-events-none`
- [ ] Inner card has `pointer-events-auto`

**Fix**: Check pointer-events CSS classes

---

### Issue: Layout breaks on mobile

**Expected**: Content fits within screen width
**Check**:
- [ ] No fixed widths (use max-w-* instead)
- [ ] Images/avatars have max-width
- [ ] Text has word-wrap/break-words
- [ ] Container has px-4 padding

**Fix**: Use `max-w-[75%]` on message bubbles

---

## ✅ Final Testing Checklist

### Inbox Page
- [ ] All 3 sections render (Pending, Active, Blocked)
- [ ] Accept button works correctly
- [ ] Reject button works correctly
- [ ] Block menu option works
- [ ] Open Chat navigates correctly
- [ ] Empty state shows when no requests
- [ ] Time-ago updates correctly

### Chat Page
- [ ] Messages load on page open
- [ ] Your messages appear on right (purple)
- [ ] Partner messages appear on left (white)
- [ ] Timestamps show correctly
- [ ] Input field works
- [ ] Enter key sends message
- [ ] Send button works
- [ ] Auto-scroll happens on new message
- [ ] Block modal opens from menu
- [ ] Back button returns to inbox

### Block/Report Modal
- [ ] Initial screen shows both options
- [ ] Block form allows reason selection
- [ ] Report form requires reason
- [ ] "Other" option shows input field
- [ ] Back button works
- [ ] Submit button calls correct action
- [ ] Modal closes properly

### Responsive Design
- [ ] Mobile (375px): Full-width, readable
- [ ] Tablet (768px): Optimized spacing
- [ ] Desktop (1024px): Max-width centered
- [ ] All breakpoints: No horizontal scroll

### Dark Mode
- [ ] Toggle dark mode
- [ ] All text readable
- [ ] Contrast sufficient
- [ ] Animations still work

---

## 📊 Test Results Template

Use this to track your testing:

```markdown
## Test Session: [Date]

### Inbox Page
- [x] Pending requests: ✅ PASS
- [x] Active chats: ✅ PASS
- [x] Block functionality: ✅ PASS
- [x] Empty state: ✅ PASS

### Chat Page
- [x] Message display: ✅ PASS
- [x] Send messages: ✅ PASS
- [x] Auto-scroll: ✅ PASS
- [x] Block modal: ✅ PASS

### Mobile Responsive
- [x] 375px: ✅ PASS
- [x] 768px: ✅ PASS
- [x] 1024px: ✅ PASS

### Dark Mode
- [x] All elements: ✅ PASS

**Overall Status**: ✅ ALL TESTS PASSED
```

---

**Ready to test?** Follow the scenarios above and check off each item! 🧪✨

*Happy testing!* 🎉
