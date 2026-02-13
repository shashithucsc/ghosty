# 🔧 Chat Messages Not Received - Debugging Guide

## Issue Description
Messages show as "sent" in sender's UI but receiver doesn't receive them via Realtime.

Console shows:
- ✅ Realtime channel subscribed successfully
- ✅ User data fetched
- ✅ Messages marked as read endpoint called

---

## Root Causes & Fixes

### **1. Missing Foreign Key Constraints** ⚠️ **CRITICAL**

**Problem:** The `chats` table has NO foreign key constraints on `sender_id` and `receiver_id`.

**Impact:**
- Messages might be inserted with invalid user IDs
- No validation that users exist in `users_v2`
- Potential orphaned records

**Fix:**
```sql
-- Run this in Supabase SQL Editor:
-- See: database/migration_chats_foreign_keys.sql

ALTER TABLE public.chats
  ADD CONSTRAINT chats_sender_fkey 
    FOREIGN KEY (sender_id) REFERENCES public.users_v2(id) ON DELETE CASCADE,
  ADD CONSTRAINT chats_receiver_fkey 
    FOREIGN KEY (receiver_id) REFERENCES public.users_v2(id) ON DELETE CASCADE;
```

---

### **2. Realtime Not Enabled on Chats Table**

**Check:** In Supabase Dashboard → Database → Replication

**Required:**
- ✅ Enable Realtime for `chats` table
- ✅ Enable INSERT events
- ✅ Enable UPDATE events  
- ✅ Enable DELETE events

**Steps:**
1. Go to Supabase Dashboard
2. Database → Replication
3. Find `chats` table
4. Toggle **all change events** ON

---

### **3. Row Level Security (RLS) Blocking Realtime**

**Problem:** If RLS is enabled on `chats` table without proper policies, Realtime broadcasts might be blocked.

**Check:**
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'chats';
```

**Fix Option A - Disable RLS** (Quick fix for development):
```sql
ALTER TABLE public.chats DISABLE ROW LEVEL SECURITY;
```

**Fix Option B - Add Proper RLS Policies** (Production):
```sql
-- Enable RLS
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own conversations
CREATE POLICY "Users can view their own messages"
ON public.chats FOR SELECT
USING (
  auth.uid() = sender_id OR 
  auth.uid() = receiver_id
);

-- Allow users to insert messages they send
CREATE POLICY "Users can send messages"
ON public.chats FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Allow users to update (read status) their received messages
CREATE POLICY "Users can update received messages"
ON public.chats FOR UPDATE
USING (auth.uid() = receiver_id);
```

---

### **4. Users Not in users_v2 Table**

**Problem:** If users only exist in old `users` table but not `users_v2`, inserts will fail due to foreign key constraint.

**Check:**
```sql
-- Check if both users exist in users_v2
SELECT id, username FROM users_v2 WHERE id IN ('USER_ID_1', 'USER_ID_2');
```

**Fix:** Run data migration:
```sql
-- See: database/migration_data_to_v2.sql
INSERT INTO users_v2 (...) SELECT ... FROM users ON CONFLICT DO NOTHING;
INSERT INTO profiles_v2 (...) SELECT ... FROM profiles ON CONFLICT DO NOTHING;
```

---

### **5. Realtime Client Issues**

**Problem:** Client-side realtime setup might have issues.

**Debug Steps:**

**A. Check Realtime Connection:**
Add console logs to chat page:
```typescript
// In chat/[id]/page.tsx, after channel.subscribe():
channel.subscribe(async (status) => {
  console.log('📡 Realtime status:', status);
  if (status === 'SUBSCRIBED') {
    console.log('✅ Channel:', channel.topic);
  }
});
```

**B. Verify INSERT Handler:**
Add detailed logging:
```typescript
channel.on('postgres_changes', {
  event: 'INSERT',
  schema: 'public',
  table: 'chats',
  filter: `conversation_id=eq.${conversationId}`,
}, (payload) => {
  console.log('📨 RAW INSERT PAYLOAD:', JSON.stringify(payload, null, 2));
  console.log('  - New message ID:', payload.new?.id);
  console.log('  - Sender:', payload.new?.sender_id);
  console.log('  - Receiver:', payload.new?.receiver_id);
  console.log('  - Message:', payload.new?.message);
  console.log('  - Current user:', currentUserId);
});
```

**C. Check Database Inserts:**
```sql
-- Verify messages are actually being inserted
SELECT 
  id, 
  sender_id, 
  receiver_id, 
  LEFT(message, 50) as message_preview,
  created_at,
  conversation_id
FROM chats 
WHERE conversation_id = 'YOUR_CONVERSATION_ID'
ORDER BY created_at DESC 
LIMIT 10;
```

---

### **6. Conversation ID Mismatch**

**Problem:** Sender and receiver might be using different conversation IDs.

**Debug:**
```typescript
// Add to message send handler:
console.log('💬 Sending to conversation:', conversationId);
console.log('   From:', currentUserId);
console.log('   To:', otherUserId);
```

**Check:**
```sql
-- Find all messages between two users
SELECT 
  conversation_id,
  COUNT(*) as message_count
FROM chats
WHERE (sender_id = 'USER_1' AND receiver_id = 'USER_2')
   OR (sender_id = 'USER_2' AND receiver_id = 'USER_1')
GROUP BY conversation_id;
```

If multiple conversation IDs exist, that's the problem.

---

## Quick Diagnostic Checklist

Run these in order:

### ✅ Step 1: Database Verification
```sql
-- 1. Check if both users exist in users_v2
SELECT id, username FROM users_v2 WHERE id IN ('SENDER_ID', 'RECEIVER_ID');

-- 2. Check if foreign keys exist on chats table
SELECT conname FROM pg_constraint 
WHERE conrelid = 'public.chats'::regclass AND contype = 'f';

-- 3. Check recent messages
SELECT * FROM chats 
WHERE conversation_id = 'YOUR_CONVERSATION_ID' 
ORDER BY created_at DESC LIMIT 5;

-- 4. Check RLS status
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename = 'chats' AND schemaname = 'public';
```

### ✅ Step 2: Supabase Dashboard
1. Database → Replication → Enable Realtime on `chats` ✅
2. Authentication → Check both users exist ✅
3. Database → Check RLS policies on `chats` ✅

### ✅ Step 3: Client-Side Debug
1. Open browser console on BOTH sender and receiver
2. Send a message
3. Check sender console for: "✅ Adding new message to state"
4. Check receiver console for: "📨 New message received via Realtime"

---

## Expected Flow

**Sender Side:**
1. User types message and hits send
2. ✅ Optimistic message added to UI immediately
3. ✅ POST `/api/chats` → Insert into database
4. ✅ Message ID updated from server response
5. ⏭️ Realtime INSERT event skipped (own message)

**Receiver Side:**
1. ✅ Realtime listens for INSERT events
2. 📨 Database broadcasts new message
3. ✅ Receiver's client receives INSERT payload
4. ✅ Message added to UI
5. ✅ Auto-marked as read after 500ms

---

## Most Likely Fix

Based on your schema, **run this immediately**:

```sql
-- 1. Add foreign keys to chats table
ALTER TABLE public.chats
  ADD CONSTRAINT chats_sender_fkey 
    FOREIGN KEY (sender_id) REFERENCES public.users_v2(id) ON DELETE CASCADE,
  ADD CONSTRAINT chats_receiver_fkey 
    FOREIGN KEY (receiver_id) REFERENCES public.users_v2(id) ON DELETE CASCADE;

-- 2. Disable RLS temporarily (for testing)
ALTER TABLE public.chats DISABLE ROW LEVEL SECURITY;

-- 3. Enable Realtime (run in Supabase Dashboard)
-- Database → Replication → chats → Enable all events
```

Then **restart your dev server** and test again.

---

## Still Not Working?

If messages still don't appear after the above:

1. **Check Supabase Logs:**
   - Go to Supabase Dashboard → Logs
   - Look for INSERT errors or permission issues

2. **Test Direct Database Insert:**
   ```sql
   INSERT INTO chats (conversation_id, sender_id, receiver_id, message)
   VALUES (
     'YOUR_CONVERSATION_ID',
     'SENDER_USER_ID',
     'RECEIVER_USER_ID',
     'Test message from SQL'
   );
   ```
   
   If this fails, there's a constraint issue. If it succeeds but receiver doesn't see it, it's a Realtime issue.

3. **Verify Realtime Connection:**
   - Open browser DevTools → Network tab
   - Filter by "ws" (WebSocket)
   - Look for Supabase realtime connection
   - Should show "Status: 101 Switching Protocols"

4. **Check Browser Console on Receiver:**
   - Should see: "✅ Realtime channel subscribed successfully"
   - Should see: "📨 New message received via Realtime" when sender sends

If none of these work, the issue is likely with your Supabase project configuration or API keys.
