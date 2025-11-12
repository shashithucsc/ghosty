# Chat Block Status Fix - Documentation

## Overview
This document describes the fixes implemented to properly handle blocked users in the chat system, including real-time block detection, user-friendly error messages, and visual indicators.

## Problem Statement
The chat system had the following issues:
1. **Generic Error Message**: When users tried to send messages while blocked, they received a generic "Failed to send message" error
2. **No Block Status Display**: Users couldn't see if they were blocked or had blocked someone when opening a chat
3. **Poor Error Handling**: The error at line 232 in `app/chat/[id]/page.tsx` didn't provide context about why the message failed
4. **No Visual Feedback**: No clear indication in the UI about block status

## Solution Implementation

### 1. New Block Check API Endpoint
**File**: `app/api/blocks/check/route.ts`

Created a dedicated endpoint to check block status between two users:

```typescript
GET /api/blocks/check?userId={userId}&otherUserId={otherUserId}
```

**Response Format**:
```json
{
  "success": true,
  "blockStatus": {
    "isBlocked": boolean,
    "blockedBy": "you" | "them" | null,
    "reason": string | null,
    "blockedAt": string | null,
    "canSendMessages": boolean
  }
}
```

**Features**:
- Checks if userId has blocked otherUserId
- Checks if otherUserId has blocked userId
- Returns detailed block information including reason and timestamp
- Properly handles no-block scenarios

### 2. Enhanced Chat Page
**File**: `app/chat/[id]/page.tsx`

#### A. Block Status Detection
- Added proper block status checking when opening a chat
- Uses the new `/api/blocks/check` endpoint
- Automatically updates UI based on block status

#### B. Visual Indicators
1. **Block Warning Banner**: Shows at the top of the chat when users are blocked
   ```tsx
   {blockStatus?.isBlocked && (
     <div className="bg-red-50 dark:bg-red-900/20 ...">
       🚫 Block status message
     </div>
   )}
   ```

2. **Full-Screen Block Page**: Displays when blocked status is confirmed
   - Shows different messages for "you blocked them" vs "they blocked you"
   - Displays the block reason if available
   - Provides navigation back to dashboard

3. **Disabled Input**: Chat input is disabled with a clear message when blocked

#### C. Improved Error Handling
```typescript
handleSendMessage async (text: string) => {
  // Check block status before sending
  if (blockStatus?.isBlocked) {
    alert(appropriate message based on who blocked whom);
    return;
  }
  
  try {
    // Send message
  } catch (error) {
    // Detailed error handling with block status refresh
    if (response.status === 403 && data.error?.includes('blocked')) {
      // Refresh block status
      // Show appropriate error message
    }
  }
}
```

**Key Improvements**:
- Pre-send validation of block status
- Automatic block status refresh on 403 errors
- User-friendly error messages explaining why message failed
- Proper cleanup of optimistic UI updates on failure

### 3. Enhanced Chat Input Component
**File**: `components/chat/ChatInput.tsx`

Added support for disabled messages:

```typescript
interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  disabledMessage?: string; // NEW
}
```

**Features**:
- Shows disabled message above input field when blocked
- Updates placeholder text when disabled
- Visually dims the input when disabled
- Prevents submission when blocked

### 4. Improved API Error Responses
**File**: `app/api/chats/route.ts`

Enhanced error logging and responses:

```typescript
if (blockExists) {
  console.log(`Block detected: Cannot send message between users...`);
  return NextResponse.json(
    { 
      error: 'Cannot send message. One user has blocked the other.',
      details: 'A block exists between these users preventing communication.'
    },
    { status: 403 }
  );
}
```

## User Experience Flow

### Scenario 1: User A Opens Chat with Blocked User B
1. Chat page loads
2. Block status is checked via `/api/blocks/check`
3. If blocked:
   - Warning banner appears at top
   - Chat input is disabled with message
   - User sees "You have blocked [username]" message
4. If user tries to send message:
   - Pre-send validation prevents attempt
   - Alert shows: "You have blocked this user. Unblock them to send messages."

### Scenario 2: User A Opens Chat, But User B Blocked Them
1. Chat page loads
2. Block status is checked
3. If blocked by other user:
   - Warning banner appears: "[Username] has blocked you"
   - Chat input is disabled
   - User sees "You cannot send messages to this user"
4. If user tries to send message:
   - Alert shows: "This user has blocked you. You cannot send messages."

### Scenario 3: User Gets Blocked During Active Chat
1. User is actively chatting
2. Other user blocks them
3. User tries to send message
4. API returns 403 error
5. Frontend:
   - Catches the error
   - Refreshes block status
   - Updates UI to show block state
   - Removes failed message from UI
   - Shows clear error: "Cannot send message. One user has blocked the other."

## Testing Checklist

### Manual Testing
- [x] Open chat with user you've blocked → Shows block warning
- [x] Open chat with user who blocked you → Shows blocked message
- [x] Try to send message when blocked → Shows appropriate error
- [x] Block user during active chat → UI updates correctly
- [x] Check that block reason displays (if provided)
- [x] Verify navigation back to dashboard works
- [x] Test dark mode appearance of block warnings
- [x] Verify optimistic UI cleanup on send failure

### API Testing
```bash
# Test block status check
GET /api/blocks/check?userId={userId}&otherUserId={otherUserId}

# Test sending message when blocked
POST /api/chats
{
  "conversationId": "...",
  "senderId": "...",
  "receiverId": "...",
  "message": "test"
}
# Should return 403 with detailed error
```

## Technical Details

### Type Definitions
```typescript
// Block Status Type
type BlockStatus = {
  isBlocked: boolean;
  blockedBy?: 'you' | 'them' | null;
  reason?: string | null;
  blockedAt?: string | null;
  canSendMessages?: boolean;
} | null;
```

### Error Codes
- **403 Forbidden**: Block exists between users
- **404 Not Found**: User doesn't exist
- **400 Bad Request**: Invalid user IDs
- **500 Internal Server Error**: Database or server error

### Database Queries
The block check endpoint performs two queries:
1. Check if userId blocked otherUserId
2. Check if otherUserId blocked userId

Both use optimized single-row queries with `maybeSingle()`.

## Performance Considerations

1. **Block Status Caching**: Block status is fetched once when chat opens
2. **Real-time Updates**: Polls for new messages every 3 seconds (existing behavior)
3. **Optimistic UI**: Messages appear immediately, then replaced with server response
4. **Error Recovery**: Failed messages are removed, block status refreshed only on 403

## Security Considerations

1. **Authorization**: Block checks verify both directions (mutual blocking)
2. **Validation**: All user IDs validated with Zod schemas
3. **Privacy**: Block reasons only visible to blocker
4. **Data Integrity**: Block status checked server-side before message insertion

## Future Enhancements

1. **Real-time Block Notifications**: Use WebSockets to notify users immediately when blocked
2. **Unblock Option**: Add UI to unblock users directly from chat
3. **Block History**: Show when user was blocked
4. **Soft Blocks**: Option to mute instead of full block
5. **Block Appeals**: Allow users to request unblock

## Files Modified

1. ✅ `app/api/blocks/check/route.ts` - NEW: Block status check endpoint
2. ✅ `app/chat/[id]/page.tsx` - Enhanced block detection and error handling
3. ✅ `components/chat/ChatInput.tsx` - Added disabled message support
4. ✅ `app/api/chats/route.ts` - Improved error logging and responses

## Migration Notes

No database migrations required. This fix uses existing `blocks` table structure.

## Rollback Plan

If issues occur, revert these commits:
1. Revert chat page block status changes
2. Revert ChatInput disabled message feature
3. Remove `/api/blocks/check` endpoint

The system will fall back to generic error messages but remain functional.

## Support Information

For issues or questions:
- Check console logs for detailed error messages
- Verify block status in database directly
- Use `/api/blocks/check` endpoint to debug block state
- Review Supabase logs for API errors

---

**Last Updated**: November 12, 2025  
**Version**: 1.0  
**Status**: ✅ Implemented and Tested
