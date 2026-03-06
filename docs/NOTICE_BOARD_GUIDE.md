# Notice Board System Guide

## Overview

The Notice Board feature allows verified users to create posts that, once approved by an admin, become visible to all users in the system. Admins can also create and publish posts directly without approval.

## Features

### For Regular Users
- **View Notices**: All users can view approved/published notices on the Notice Board page
- **Filter by Category**: Filter posts by Girls, Boys, or General categories
- **Create Posts** (Verified Users Only): Verified users can submit posts for admin approval with category selection
- **Track Submissions**: Users can see the status of their submitted posts (pending/approved/rejected)

### For Admins
- **Approve/Reject Posts**: Review user-submitted posts and approve or reject them
- **Create Direct Posts**: Publish posts immediately without approval workflow
- **Delete Posts**: Remove any post from the notice board
- **View Statistics**: See counts of total, pending, approved, and rejected posts

## User Flow

1. User navigates to "Notice Board" from the navbar
2. User can filter posts by category: All, Girls, Boys, or General
3. If the user is verified, they see a "Create Post" button
4. User fills in category (required), title, and content, then submits
5. Post is saved with status "pending" and the selected category
6. Admin reviews in Admin Panel > Notice Board tab
7. Admin approves or rejects the post
8. If approved, post becomes visible to all users (filtered by category)

## Database Schema

The `notice_board` table stores all posts:

```sql
CREATE TABLE public.notice_board (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES users(id),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL CHECK (category IN ('girl', 'boy', 'general')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_admin_post boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  approved_by uuid REFERENCES users(id),
  rejection_reason text
);
```

**Fields:**
- `category`: Determines who can see the post:
  - `'girl'` - Visible in Girls filter
  - `'boy'` - Visible in Boys filter
  - `'general'` - Visible in General filter (for everyone)

### Running the Migration

1. Open your Supabase dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `database/migration_notice_board.sql`
4. Execute the query

## API Endpoints

### Public Endpoints

#### GET `/api/notice-board`
Fetches notice board posts.

Query Parameters:
- `userId` (optional): If provided, returns user's own posts plus approved posts
- Returns only approved posts for unauthenticated requests

Response:
```json
{
  "success": true,
  "posts": [
    {
      "id": "uuid",
      "title": "Post Title",
      "content": "Post content...",
      "category": "girl",
      "status": "approved",
      "is_admin_post": false,
      "created_at": "2025-01-29T...",
      "approved_at": "2025-01-29T...",
      "author": {
        "id": "uuid",
        "username": "user123",
        "isAdmin": false
      }
    }
  ]
}
```

#### POST `/api/notice-board`
Creates a new notice board post.

Request Body:
```json
{
  "userId": "uuid",
  "title": "Post Title",
  "content": "Post content (min 20, max 5000 chars)",
  "category": "girl" | "boy" | "general"
}
```

Requirements:
- User must be verified (or admin)
- Title: 5-200 characters
- Content: 20-5000 characters
- Category: Must be one of: "girl", "boy", "general"

#### DELETE `/api/notice-board`
Deletes a notice board post.

Query Parameters:
- `postId`: The post ID to delete
- `userId`: The requesting user's ID

Authorization: User can only delete own posts (or admin can delete any)

### Admin Endpoints

#### GET `/api/admin/notice-board`
Fetches all posts for admin management.

Headers: `Authorization: Bearer <token>`

Query Parameters:
- `status` (optional): Filter by 'pending', 'approved', 'rejected'

#### PUT `/api/admin/notice-board`
Approve or reject a post.

Headers: `Authorization: Bearer <token>`

Request Body:
```json
{
  "postId": "uuid",
  "action": "approve" | "reject",
  "rejectionReason": "Optional reason for rejection"
}
```

#### DELETE `/api/admin/notice-board`
Admin delete a post.

Headers: `Authorization: Bearer <token>`

Query Parameters:
- `postId`: The post ID to delete

#### GET `/api/admin/notice-board/stats`
Get notice board statistics.

Headers: `Authorization: Bearer <token>`

Response:
```json
{
  "success": true,
  "stats": {
    "total": 10,
    "pending": 3,
    "approved": 6,
    "rejected": 1
  }
}
```

## Navigation

The Notice Board is accessible from:
- **Desktop Navbar**: "Notice Board" link between Dashboard and Inbox
- **Mobile Bottom Nav**: "Notices" icon (clipboard icon)

## File Structure

```
app/
  notice-board/
    page.tsx                    # Notice Board page
  api/
    notice-board/
      route.ts                  # Public API endpoints
    admin/
      notice-board/
        route.ts                # Admin management endpoints
        stats/
          route.ts              # Statistics endpoint

components/
  admin/
    NoticeBoardManagement.tsx   # Admin management component

database/
  migration_notice_board.sql    # Database migration
```

## Styling

The Notice Board follows the existing application theme:
- Uses solid colors for status and category indicators:
  - Status: Purple (admin), Green (approved), Yellow (pending), Red (rejected)
  - Category: Pink (Girls), Blue (Boys), Gray (General)
- Uses Lucide icons (ClipboardList, CheckCircle, Clock, etc.)
- Responsive design with mobile-first approach
- Dark mode support
- Glass morphism effects consistent with other pages

## Category System

Posts can be categorized into three types:
- **Girls**: Posts intended for female users (pink badge)
- **Boys**: Posts intended for male users (blue badge)
- **General**: Posts for everyone (gray badge)

Users can easily filter posts using category buttons at the top of the Notice Board page.

## Verification Check

The system checks user verification status by:
1. Calling `/api/verification/status?userId={userId}`
2. If status is "verified", user can create posts
3. Non-verified users can only view approved posts
