# Match System Implementation - Summary

## Changes Made

### System Architecture
- **Swipe Right**: Now records a "like" in `swipes` table (not a chat request)
- **Matches**: Created when both users swipe right on each other
- **Chat Requests**: Separate system - sent via "Send Request" button on profile cards
- **Match Chat**: Users can start chatting after matching (conversation created on-demand)

---

## Modified Files

### 1. **components/dashboard/RecommendationFeed.tsx**
**Changed:** `handleMessageRequest()` function
- **Before:** Sent chat request via `/api/inbox/requests`
- **After:** Records swipe/like via `/api/recommendations` POST
- **Result:** Detects mutual matches and shows celebration modal
- **Toast:** "💜 Liked! If they like you back, it's a match!"
- **Behavior:** Auto-advances to next profile after like (unless it's a match)

### 2. **app/api/recommendations/route.ts** (POST endpoint)
**Changed:** Match detection logic
- **Before:** Created chat conversation automatically on match
- **After:** Only creates match record in `matches` table
- **Duplicate Prevention:** Returns 409 if user already swiped on profile
- **Match Check:** Queries both `(user1, user2)` and `(user2, user1)` combinations

### 3. **components/dashboard/MatchModal.tsx**
**Changed:** Chat creation
- **Before:** Used pre-generated `conversationId` from match
- **After:** Creates conversation on-demand when "Start Chat" clicked
- **API:** Calls `/api/conversations` POST to create/get conversation

### 4. **app/inbox/page.tsx**
**Added:** `handleStartChatWithMatch()` function
- Creates conversation with matched user when "Start Chat" clicked
- Uses `/api/conversations` API
- Navigates to chat page with conversation ID

---

## Database Tables Used

### `swipes` (tracking likes/skips)
```sql
- swiper_user_id: UUID (who swiped)
- target_user_id: UUID (who was swiped on)
- action: 'like' | 'skip'
- swiped_at: timestamp
- UNIQUE(swiper_user_id, target_user_id) -- prevents duplicate swipes
```

### `matches` (mutual likes)
```sql
- user1_id: UUID
- user2_id: UUID
- matched_at: timestamp
- UNIQUE(user1_id, user2_id) -- prevents duplicate matches
```

### `inbox_requests` (separate system)
- Used for "Send Request" button on profile cards
- Independent from swipe/match system

---

## User Flow

### Swiping Flow
```
1. User A sees User B's profile card
2. User A swipes RIGHT (presses → or clicks heart button)
   → INSERT into swipes: { swiper: A, target: B, action: 'like' }
   → Check: Did B already like A?
   → Result: NO → Show "💜 Liked!" toast, advance to next card

3. Later, User B sees User A's profile card
4. User B swipes RIGHT on User A
   → INSERT into swipes: { swiper: B, target: A, action: 'like' }
   → Check: Did A already like B?
   → Result: YES! ✨
   → INSERT into matches: { user1: B, user2: A }
   → Show match modal with confetti 🎉
```

### Starting a Chat from Match
```
1. User sees match in Inbox → Matches tab
2. Clicks "Start Chat" button
   → POST /api/conversations { userId, otherUserId }
   → API creates conversation_id if doesn't exist
   → Navigate to /chat/{conversation_id}
```

---

## Key Differences

| Feature | Before | After |
|---------|--------|-------|
| Swipe Right | Sends chat request | Records like in swipes table |
| Match Detection | N/A | Automatic when both users like |
| Chat Creation | Immediate on request | On-demand when user clicks "Start Chat" |
| Request System | Mixed with swipes | Separate (profile "Send Request" button) |
| Inbox Display | Requests only | Requests + Matches + Chats (3 tabs) |

---

## Migration Required

Run this SQL in Supabase Dashboard → SQL Editor:

```sql
-- Already exists in your database, but verify:
SELECT * FROM swipes LIMIT 1;
SELECT * FROM matches LIMIT 1;

-- If swipes table missing, create it:
-- (See database/create_swipes_table.sql)
```

---

## Testing Checklist

- [ ] Create two user accounts (User A and User B)
- [ ] Log in as User A, swipe right on User B → Should show "💜 Liked!" and advance
- [ ] Log in as User B, swipe right on User A → Should show match modal with confetti
- [ ] Check Inbox → Matches tab → Should see User A in User B's matches
- [ ] Click "Start Chat" → Should navigate to chat page
- [ ] Verify profile "Send Request" button still works independently

---

## No Breaking Changes

✅ Existing chat request system unchanged  
✅ Profile "Send Request" button still works  
✅ Active chats unaffected  
✅ Blocked users still excluded from recommendations  
✅ Skip functionality unchanged
