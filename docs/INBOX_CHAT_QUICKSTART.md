# Ghosty Inbox & Chat - Quick Setup Guide

## ⚡ Quick Start (5 Minutes)

### Step 1: Run Database Migration

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `database/migration_inbox_chat_system.sql`
3. Click "Run" to execute

This creates 3 tables:
- `inbox_requests` - Message request tracking
- `conversations` - Chat sessions
- `messages` - Individual messages

### Step 2: Verify Tables Created

Run this query to confirm:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('inbox_requests', 'conversations', 'messages');
```

You should see all 3 tables listed.

### Step 3: Test with curl

```bash
# Send an inbox request
curl -X POST http://localhost:3000/api/inbox/requests \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your-user-uuid",
    "recipientId": "recipient-uuid",
    "message": "Hi! Would love to connect"
  }'
```

---

## 📋 API Endpoints Summary

### Inbox Requests

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/inbox/requests` | List inbox requests (sent/received) |
| `POST` | `/api/inbox/requests` | Send a new request |
| `PATCH` | `/api/inbox/requests` | Accept/reject a request |

### Chat

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/chat` | Fetch messages in a conversation |
| `POST` | `/api/chat` | Send a message |
| `DELETE` | `/api/chat` | Delete a message |

### Conversations

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/conversations` | List all conversations with previews |
| `DELETE` | `/api/conversations` | Delete a conversation |

---

## 🔄 Typical User Flow

```
1. User A sends inbox request to User B
   POST /api/inbox/requests
   
2. User B views pending requests
   GET /api/inbox/requests?type=received&status=pending
   
3. User B accepts the request
   PATCH /api/inbox/requests (action: accept)
   → Conversation is automatically created
   
4. User A sends first message
   POST /api/chat
   
5. User B views conversations list
   GET /api/conversations
   
6. User B opens chat and views messages
   GET /api/chat?conversationId=...&markAsRead=true
   
7. User B sends reply
   POST /api/chat
```

---

## 🎯 Key Features

### Inbox Requests
✅ Send message requests with optional initial message  
✅ Accept or reject requests  
✅ Prevents duplicate requests  
✅ Block system integration  
✅ Pagination support  

### Chat System
✅ Real-time messaging (poll or use Supabase Realtime)  
✅ Read receipts and unread counts  
✅ Message deletion (by sender only)  
✅ Pagination for message history  
✅ Automatic conversation updates  

### Security
✅ Row Level Security (RLS) on all tables  
✅ Input validation with Zod  
✅ Block prevention at API level  
✅ Participant verification  
⚠️ JWT authentication needed (TODO)  

---

## 📦 Database Schema Overview

### inbox_requests
```sql
id              UUID PRIMARY KEY
sender_id       UUID (references users)
recipient_id    UUID (references users)
status          TEXT (pending/accepted/rejected)
message         TEXT (optional initial message)
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### conversations
```sql
id                  UUID PRIMARY KEY
user1_id            UUID (always smaller UUID)
user2_id            UUID (always larger UUID)
last_message_at     TIMESTAMP
user1_unread_count  INTEGER
user2_unread_count  INTEGER
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

### messages
```sql
id                UUID PRIMARY KEY
conversation_id   UUID (references conversations)
sender_id         UUID (references users)
content           TEXT (max 5000 chars)
is_read           BOOLEAN
read_at           TIMESTAMP
created_at        TIMESTAMP
updated_at        TIMESTAMP
```

---

## 🧪 Quick Test Script

```bash
# 1. Send inbox request
curl -X POST http://localhost:3000/api/inbox/requests \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "sender-uuid",
    "recipientId": "recipient-uuid",
    "message": "Hey! Would love to connect"
  }'

# 2. List pending requests (as recipient)
curl "http://localhost:3000/api/inbox/requests?userId=recipient-uuid&type=received&status=pending"

# 3. Accept request
curl -X PATCH http://localhost:3000/api/inbox/requests \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "recipient-uuid",
    "requestId": "request-id-from-step-1",
    "action": "accept"
  }'
# Save conversationId from response

# 4. Send message
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "sender-uuid",
    "conversationId": "conv-id-from-step-3",
    "content": "Hello! Nice to meet you"
  }'

# 5. Fetch messages
curl "http://localhost:3000/api/chat?userId=recipient-uuid&conversationId=conv-id&markAsRead=true"

# 6. List conversations
curl "http://localhost:3000/api/conversations?userId=sender-uuid"
```

---

## ⚛️ React Integration Example

### Send Inbox Request

```tsx
const sendRequest = async (recipientId: string) => {
  const res = await fetch('/api/inbox/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: currentUserId,
      recipientId,
      message: 'Hi! Would love to connect',
    }),
  });
  
  const data = await res.json();
  if (data.success) {
    alert('Request sent!');
  }
};
```

### Accept Request

```tsx
const acceptRequest = async (requestId: string) => {
  const res = await fetch('/api/inbox/requests', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: currentUserId,
      requestId,
      action: 'accept',
    }),
  });
  
  const data = await res.json();
  if (data.success && data.conversationId) {
    // Navigate to chat
    router.push(`/chat/${data.conversationId}`);
  }
};
```

### Send Message

```tsx
const sendMessage = async (conversationId: string, content: string) => {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: currentUserId,
      conversationId,
      content,
    }),
  });
  
  const data = await res.json();
  if (data.success) {
    setMessages(prev => [...prev, data.data]);
  }
};
```

---

## 🚨 Common Errors & Solutions

### "Conversation not found"
**Cause:** Request wasn't accepted or conversation not created  
**Fix:** Verify request status is 'accepted' and conversation exists

### "Inbox request must be accepted"
**Cause:** Trying to send message before request accepted  
**Fix:** Accept the request first using PATCH endpoint

### "Cannot send request to this user"
**Cause:** One user has blocked the other  
**Fix:** Check blocks table for blocking relationship

### "Message cannot be empty"
**Cause:** Empty or whitespace-only message  
**Fix:** Ensure content.trim().length > 0

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] Run migration in production Supabase
- [ ] Add JWT authentication to all endpoints
- [ ] Implement rate limiting (20 req/min recommended)
- [ ] Sanitize message content (prevent XSS)
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure CORS properly
- [ ] Add request logging
- [ ] Test all error scenarios
- [ ] Enable Supabase Realtime (optional)
- [ ] Add webhook notifications (optional)

---

## 📚 File Structure

```
ghosty/
├── database/
│   └── migration_inbox_chat_system.sql   # Database schema
├── app/
│   └── api/
│       ├── inbox/
│       │   └── requests/
│       │       └── route.ts              # Inbox requests API
│       ├── chat/
│       │   └── route.ts                  # Chat messages API
│       └── conversations/
│           └── route.ts                  # Conversations API
└── docs/
    ├── INBOX_CHAT_GUIDE.md               # Full documentation
    └── INBOX_CHAT_QUICKSTART.md          # This file
```

---

## 🔧 Troubleshooting Commands

```bash
# Check if tables exist
psql -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public';"

# View inbox requests
psql -c "SELECT * FROM inbox_requests ORDER BY created_at DESC LIMIT 10;"

# View conversations
psql -c "SELECT * FROM conversations ORDER BY last_message_at DESC LIMIT 10;"

# View messages
psql -c "SELECT * FROM messages ORDER BY created_at DESC LIMIT 20;"

# Check RLS policies
psql -c "SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname='public';"

# Test helper function
psql -c "SELECT get_unread_count('user-uuid'::uuid);"
```

---

## 📞 Need Help?

- **Full Documentation:** See `docs/INBOX_CHAT_GUIDE.md`
- **Database Schema:** See `database/migration_inbox_chat_system.sql`
- **API Routes:** Check `app/api/inbox/`, `app/api/chat/`, `app/api/conversations/`

---

**Ready to go!** 🚀 Your inbox and chat system is fully functional.
