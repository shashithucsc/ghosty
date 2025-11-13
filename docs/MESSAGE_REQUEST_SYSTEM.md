# Message Request System Implementation

## Overview
Converted the dating app from a "like/heart" instant-match system to a **message request** system with accept/reject flow. Users must now accept requests before chatting.

**API Endpoint:** `/api/inbox/requests`

---

## Key Changes

### 1. **ProfileCard Component** (`components/dashboard/ProfileCard.tsx`)
- **Changed:** Heart icon (❤️) → Send icon (💌)
- **Renamed:** `onLike` → `onMessageRequest`
- **Updated:** Button colors from pink/red to blue/purple gradient
- **Swipe indicator:** "LIKE ❤️" → "MESSAGE 💌"
- **Hint text:** "Swipe right to like" → "Swipe right to send message request"

### 2. **RecommendationFeed Component** (`components/dashboard/RecommendationFeed.tsx`)
- **Added:** Arrow key navigation (← left to skip, → right to send request)
- **Replaced:** `handleLike()` with `handleMessageRequest()`
- **Removed:** Random match simulation (50% chance)
- **Added:** Toast notifications for success/error messages
- **Behavior:** Cards stay visible after sending request (no auto-advance)
- **Instant Match:** If both users request each other, auto-accepts both requests
- **Progress hint:** Shows "Use arrow keys ← →"

### 3. **Inbox Page** (`app/inbox/page.tsx`)
- **Replaced:** Mock data with real API calls to `/api/inbox-requests`
- **Added:** Real-time request fetching on page load
- **Added:** Accept/Reject/Block handlers with API integration
- **Added:** Toast notifications replacing browser alerts
- **Chat navigation:** Uses conversation ID from accepted requests
- **Sections:**
  - **Chat Requests** (pending) - Yellow indicator
  - **Active Chats** (accepted) - Green indicator
  - **Blocked** (blocked users) - Red indicator

### 4. **Inbox Requests API** (`app/api/inbox-requests/route.ts`)
**NEW ENDPOINT** with three methods:

#### POST - Create Message Request
- Validates sender and receiver IDs
- Prevents self-requests
- Checks for duplicate requests (returns 409 if already exists)
- Checks for blocks between users
- **URL:** `POST /api/inbox/requests`
- **Body:**
  ```json
  {
    "userId": "uuid",
    "recipientId": "uuid"
  }
  ```
- **Response Codes:**
  - `201` - Request created successfully
  - `409` - Request already exists (pending/accepted/rejected)

#### GET - Fetch Requests
- Fetches received, sent, or all requests
- Filters by status (pending/accepted/rejected/all)
- Enriches with user profiles (anonymous name, avatar, verification status)
- **URL:** `GET /api/inbox/requests?userId={uuid}&type=received&status=all`
- **Query Params:**
  - `userId` (required)
  - `type`: `received | sent | all` (default: all)
  - `status`: `pending | accepted | rejected | all` (default: all)
  - `page`: Page number (default: 1)
  - `limit`: Results per page (default: 20, max: 50)

#### PATCH - Accept/Reject Request
- Verifies user is the receiver
- Prevents duplicate actions (already accepted/rejected)
- **On Accept:** Creates initial chat record with conversation ID in `chats` table
- Returns conversation ID for navigation
- **URL:** `PATCH /api/inbox/requests`
- **Body:**
  ```json
  {
    "requestId": "uuid",
    "userId": "uuid",
    "action": "accept" | "reject"
  }
  ```

### 5. **Dashboard Page** (`app/dashboard/page.tsx`)
- **Removed:** MatchModal component and related state
- **Renamed:** `onMatch` → `onRequestSent`
- **Updated:** Notification types to include 'request'
- **Message:** "Message request sent to {name}"

### 6. **NotificationBar Component** (`components/dashboard/NotificationBar.tsx`)
- **Added:** 'request' type support
- **Icon:** Send icon with purple theme
- **Border:** Purple border for request notifications
- **Label:** "💌 Request Sent!"

---

### Database Integration

### Using `inbox_requests` Table
```sql
create table public.inbox_requests (
  id uuid not null default gen_random_uuid (),
  sender_id uuid null,
  receiver_id uuid null,
  status text null default 'pending'::text,
  created_at timestamp with time zone null default now(),
  constraint inbox_requests_pkey primary key (id)
);

create index IF not exists idx_inbox_receiver on public.inbox_requests using btree (receiver_id);
```

**Note:** Field is `receiver_id` not `recipient_id`

### Using `chats` Table (After Acceptance)
```sql
create table public.chats (
  id uuid not null default gen_random_uuid (),
  conversation_id uuid null,
  sender_id uuid null,
  receiver_id uuid null,
  message text null,
  created_at timestamp with time zone null default now(),
  constraint chats_pkey primary key (id)
);
```

When a request is accepted, the API creates an initial system message:
```sql
INSERT INTO chats (conversation_id, sender_id, receiver_id, message, created_at)
VALUES ('{uuid}', '{sender_id}', '{receiver_id}', '🎉 Chat request accepted! Start your conversation here.', NOW());
```

---

## User Flow

### Sender Flow
1. **Browse recommendations** → See profile cards with interests, bio, university
2. **Click Send icon** (or swipe right, or press → arrow) → Sends message request
3. **Notification appears** → "💌 Request Sent!" with success toast
4. **Card stays visible** → Can continue browsing without auto-advance
5. **Check inbox** → See sent requests in "Sent" tab (if implemented)

### Receiver Flow
1. **Notification** → Badge on inbox icon (if implemented)
2. **Open inbox** → See "Chat Requests" section with yellow indicator
3. **View request** → See sender's profile (anonymous name, avatar, gender, age)
4. **Accept or Reject:**
   - **Accept** → Creates conversation, can start chatting immediately
   - **Reject** → Request disappears, no conversation created
   - **Block** → Rejects + blocks user from future contact

### Instant Match Flow
1. **User A** sends request to **User B**
2. **User B** (before seeing A's request) sends request to **User A**
3. **System auto-accepts both** → Both see "🎉 Instant match!" toast
4. **Both can chat immediately** → No need to manually accept

---

## Keyboard Navigation

### In RecommendationFeed
- **Arrow Left (←)** → Skip current profile
- **Arrow Right (→)** → Send message request
- **Disabled when:** Loading, sending request, or no profiles

---

## Toast Notifications

### RecommendationFeed
- **Success:** "✅ Message request sent successfully!"
- **Duplicate:** "You already sent a request to this user" (info toast)
- **Error:** "Failed to send message request. Please try again."
- **Auth Error:** "Please log in to send message requests"

### Inbox Page
- **Accept:** "✅ Request accepted! You can now start chatting."
- **Reject:** "Request rejected"
- **Block:** "User blocked successfully"
- **Errors:** API error messages displayed

---

## API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/inbox/requests` | POST | Create message request |
| `/api/inbox/requests` | GET | Fetch requests (received/sent) |
| `/api/inbox/requests` | PATCH | Accept/reject request |
| `/api/blocks` | POST | Block user (used in inbox) |
| `/api/chats` | GET | Get messages in conversation |
| `/api/chats` | POST | Send message |

---

## Testing Checklist

### Recommendation Flow
- [ ] Heart icon changed to Send icon
- [ ] Button shows blue/purple gradient
- [ ] Clicking Send button sends request
- [ ] Toast shows success message
- [ ] Card stays visible after sending
- [ ] Arrow keys work (← skip, → send)
- [ ] Progress shows "Use arrow keys ← →"

### Inbox Flow
- [ ] Received requests appear in "Chat Requests"
- [ ] Accept button creates conversation
- [ ] Reject button removes request
- [ ] Block button rejects + blocks user
- [ ] Accepted requests move to "Active Chats"
- [ ] Open Chat button navigates correctly
- [ ] Toast notifications appear for all actions

### Instant Match
- [ ] Mutual requests auto-accept
- [ ] "Instant match" toast appears
- [ ] Both users can chat immediately

### API Testing
- [ ] POST creates request successfully
- [ ] GET returns correct requests
- [ ] PATCH accepts request
- [ ] PATCH rejects request
- [ ] Conversation ID created on accept
- [ ] Chat record inserted to `chats` table

---

## Future Enhancements

### Suggested Features
1. **Unread badge** on inbox icon showing pending request count
2. **Push notifications** for new requests
3. **Request expiration** (e.g., 7 days)
4. **Message preview** when accepting request
5. **Undo send** within first 30 seconds
6. **Request templates** for initial messages
7. **Report request** for spam/abuse
8. **Super request** feature (paid, appears first)

---

## Migration Notes

### No Database Schema Changes Required
The `inbox_requests` table already exists. No migrations needed.

### Breaking Changes
- **MatchModal component** is now unused (can be deleted)
- **onMatch prop** removed from RecommendationFeed
- **Match simulation logic** removed

### Backward Compatibility
- Existing `matches` table is unused but not deleted
- Existing `swipes` table still works for analytics (if implemented)
- Chat functionality remains unchanged

---

## Files Modified

### Components
- `components/dashboard/ProfileCard.tsx` - Icon and handler changes
- `components/dashboard/RecommendationFeed.tsx` - Request logic + keyboard nav
- `components/dashboard/NotificationBar.tsx` - Added request notification type

### Pages
- `app/dashboard/page.tsx` - Removed MatchModal, updated handlers
- `app/inbox/page.tsx` - Real API integration, Toast notifications

### API
- `app/api/inbox/requests/route.ts` - **UPDATED** Complete CRUD for requests (fixed to use `receiver_id`)

### Documentation
- `docs/MESSAGE_REQUEST_SYSTEM.md` - This file

---

## Support

For questions or issues:
1. Check API error logs in browser console
2. Verify `inbox_requests` table exists in Supabase
3. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set correctly
4. Check network tab for API request/response details
