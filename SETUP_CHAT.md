# Chat System Setup Guide

## Error You're Seeing
```
Could not find the table 'public.conversations' in the schema cache
```

This means the chat system tables haven't been created in your Supabase database yet.

## Quick Fix

### Step 1: Open Supabase SQL Editor
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your Ghosty project
3. Click on "SQL Editor" in the left sidebar

### Step 2: Run the Migration
1. Open the file: `database/migration_inbox_chat_system.sql`
2. Copy the **entire** SQL content (all ~400 lines)
3. Paste it into the Supabase SQL Editor
4. Click the green "Run" button

### Step 3: Verify Tables Created
After running the migration, check that these tables exist:
- ✅ `inbox_requests`
- ✅ `conversations`
- ✅ `messages`

You can verify by going to "Table Editor" in Supabase and seeing these tables listed.

### Step 4: Test the Chat Feature
1. Restart your dev server if needed
2. Go to the dashboard
3. Click the heart icon on a recommendation
4. Click "Send a Message" in the match modal
5. You should now be redirected to the chat page!

## What This Migration Creates

### Tables
- **inbox_requests**: Message requests between users
- **conversations**: Active chat sessions (created when users match)
- **messages**: Individual chat messages

### Key Features
- User1/User2 ordering prevents duplicate conversations
- Automatic unread count tracking
- Last message timestamp updates
- Message read receipts
- Helper functions for conversation management

### Database Constraints
- Messages can't be empty
- Max 5000 characters per message
- Max 1000 characters for initial request
- Users can't message themselves
- Automatic timestamps on all records

## After Setup

Once the migration is complete, your chat system will be fully functional:
- ✅ Match modal "Send a Message" button works
- ✅ Conversations are created automatically
- ✅ Messages can be sent and received
- ✅ Unread counts are tracked
- ✅ Real-time updates (via polling)

## Troubleshooting

### Issue: "Could not find the table"
- **Solution**: Run the migration SQL in Supabase

### Issue: "Permission denied"
- **Solution**: Check that RLS policies were created (they're in the migration)

### Issue: "Function does not exist"
- **Solution**: Make sure ALL the SQL was executed, including the helper functions

### Issue: "Constraint violation"
- **Solution**: Ensure user IDs are valid and users exist in the `users` table

## Additional Migrations

You may also want to run these other migrations:
1. `migration_verification_system.sql` - For user verification
2. `migration_admin_reports_system.sql` - For reporting system
3. `migration_recommendation_system.sql` - For better recommendations

Run them in the same way through the Supabase SQL Editor.

---

**Need Help?** Check the Supabase logs in the dashboard for detailed error messages.
