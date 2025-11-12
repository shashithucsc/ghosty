# Block & Report System Setup Guide

## ✅ What's Implemented

### 1. **Database Tables**
- ✅ `reports` table (already exists, needs updates)
- ✅ `blocks` table (new)

### 2. **API Endpoints**
- ✅ `/api/reports` - Create, get, delete reports
- ✅ `/api/blocks` - Block, unblock, get blocked users

### 3. **Chat Features**
- ✅ Block user from chat
- ✅ Report user from chat  
- ✅ Beautiful modal UI with reasons
- ✅ Prevents blocked users from messaging

## 🚀 Setup Steps

### Step 1: Run Database Migration

1. Open Supabase SQL Editor
2. Copy the entire content of `database/update_reports_and_blocks.sql`
3. Paste and run in SQL Editor

This will:
- ✅ Add `status`, `description`, `admin_notes` fields to `reports` table
- ✅ Create `blocks` table
- ✅ Add indexes for performance
- ✅ Create helper function `is_user_blocked()`

### Step 2: Test the Features

#### **Test Blocking:**
1. Open chat with any user
2. Click the menu button (⋮) in chat header
3. Select "Block User"
4. Choose a reason
5. Click "Block User"
6. You'll be redirected to dashboard
7. Blocked user can't message you anymore

#### **Test Reporting:**
1. Open chat with any user
2. Click the menu button (⋮) in chat header
3. Select "Report User"
4. Choose a reason (required)
5. Add description if needed
6. Click "Submit Report"
7. Report is sent to admin for review

## 📊 Database Schema

### Reports Table
```sql
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL,
  reported_user_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Blocks Table
```sql
CREATE TABLE public.blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL,
  blocked_id UUID NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);
```

## 🎯 How It Works

### **Block Flow:**
1. User clicks "Block User" in chat
2. POST to `/api/blocks` with blockerId, blockedId, reason
3. Creates block record in database
4. Deletes all existing chat messages between users
5. Redirects blocker to dashboard
6. Blocked user cannot:
   - Send messages
   - See blocked user's profile
   - Match with blocked user

### **Report Flow:**
1. User clicks "Report User" in chat
2. POST to `/api/reports` with reporterId, reportedUserId, reason, description
3. Creates report with status 'pending'
4. Admin reviews in admin panel
5. Report can be marked as: reviewed, resolved, or dismissed
6. Multiple reports increase user's report count
7. High report count can trigger auto-restriction

### **Report Reasons:**
- `harassment` - Harassment or bullying
- `inappropriate_content` - Inappropriate content
- `spam` - Spam or scam messages
- `fake_profile` - Fake or impersonating profile
- `other` - Other safety concerns

## 🔒 Security Features

### **Prevents Abuse:**
- ✅ Can't block yourself
- ✅ Can't report yourself
- ✅ Can't report same user multiple times per day
- ✅ Restricted users can't create reports
- ✅ Can only delete your own pending reports
- ✅ Can't delete reviewed reports

### **Database Constraints:**
- ✅ Unique constraint on (blocker_id, blocked_id)
- ✅ Check constraint prevents self-blocking
- ✅ Foreign keys with CASCADE delete
- ✅ Indexes for fast queries

## 📱 UI Components

### **BlockReportModal** (`components/chat/BlockReportModal.tsx`)
- ✅ Two-step flow: Choose action → Select reason
- ✅ Separate UI for block vs report
- ✅ Required reason selection for reports
- ✅ Optional text input for "Other" reasons
- ✅ Warning messages about consequences
- ✅ Beautiful glassmorphic design

### **Features:**
- Block reasons: Inappropriate behavior, Spam, Harassment, Fake profile, Not interested, Other
- Report reasons: Harassment, Inappropriate content, Spam, Fake profile, Violent threats, Other safety concern
- Real-time validation
- Disabled submit until reason selected
- Responsive mobile design

## 🧪 Testing Checklist

### **Block Feature:**
- [ ] Can block user from chat
- [ ] Blocked user disappears from chat list
- [ ] Cannot send messages to blocked user
- [ ] Block appears in /api/blocks list
- [ ] Can unblock user from settings

### **Report Feature:**
- [ ] Can report user with reason
- [ ] Report appears in /api/reports
- [ ] Cannot report same user twice in 24 hours
- [ ] Report increments reported user's count
- [ ] Admin can view all reports

### **Edge Cases:**
- [ ] Can't block yourself (API returns error)
- [ ] Can't report yourself (API returns error)
- [ ] Can't report user while restricted
- [ ] Block deletes chat history

## 🔮 Future Enhancements

### **Optional Improvements:**
1. **Block List Page** - View and manage blocked users
2. **Appeal System** - Let reported users appeal
3. **Auto-moderation** - Auto-restrict after X reports
4. **Report Categories** - More detailed violation types
5. **Notification System** - Notify admins of new reports
6. **Block Duration** - Temporary blocks (7 days, 30 days)
7. **Mutual Blocks** - Prevent both users from seeing each other

## 💡 Admin Panel Integration

The reports can be viewed and managed in the admin panel:

**GET /api/admin/reports** - List all reports with filters:
- Filter by status (pending, reviewed, resolved, dismissed)
- Filter by date range
- Search by username
- Sort by report count

**PATCH /api/admin/reports** - Update report status:
- Mark as reviewed
- Resolve with action taken
- Dismiss if invalid
- Add admin notes

## 🎉 Summary

You now have a complete block & report system:
- ✅ Users can block others from chat
- ✅ Users can report violations to admins
- ✅ Beautiful UI with smooth flows
- ✅ Secure API with validation
- ✅ Proper database schema
- ✅ Prevention of abuse

Just run the SQL migration and you're ready to go! 🚀
