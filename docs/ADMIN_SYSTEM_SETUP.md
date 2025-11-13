# Admin System Setup Guide

## Overview
Complete admin system with JWT-based authentication, role-based access control, and protected routes.

## Backend Components

### 1. Admin Middleware (`lib/adminMiddleware.ts`)
- `requireAdmin(handler)` - Wraps API handlers to require admin authentication
- `verifyAdminFromRequest(request)` - Verifies JWT and checks isAdmin flag
- Checks: Authorization header, cookie, x-auth-token header

### 2. Admin APIs

#### Stats API (`/api/admin/stats`)
- **GET**: Returns dashboard statistics
- **Auth**: Requires admin token
- **Returns**: totalUsers, verifiedUsers, pendingVerifications, restrictedUsers, totalReports, activeChats

#### Users API (`/api/admin/users`)
- **GET**: List users with filters (status, search, pagination)
- **PATCH**: Update user (approve, restrict, unrestrict, delete)
- **Auth**: Requires adminId parameter + admin role check
- **Note**: Uses old admin verification pattern - needs JWT update

#### Verifications API (`/api/admin/verifications`)
- **GET**: List verification requests with filters
- **POST**: Approve or reject verification
- **Auth**: Now uses `verifyAdminFromRequest` middleware ✅

#### Reports API (`/api/admin/reports`)
- **GET**: List reports with filters  
- **PATCH**: Update report status, restrict user
- **DELETE**: Delete report
- **Auth**: Requires adminId parameter + admin role check
- **Note**: Uses old admin verification pattern - needs JWT update

## Frontend Components

### 1. Login Page (`app/login/page.tsx`)
- Detects `isAdmin` flag in login response
- Stores in localStorage
- Redirects admins to `/admin`
- Redirects regular users to `/dashboard`

### 2. Admin Page (`app/admin/page.tsx`)
- Protected route with auth check
- Loading screen with Shield icon
- Tabs: Dashboard, Users, Verifications, Reports

### 3. Admin Components

#### DashboardStats ✅ UPDATED
- Fetches from `/api/admin/stats`
- Uses Authorization Bearer token
- Displays 6 stat cards

#### UsersManagement (NEEDS UPDATE)
- Currently uses mock data
- Needs to call `/api/admin/users`
- Features: Search, filters, restrict/unrestrict, delete

#### VerificationRequests (NEEDS UPDATE)
- Currently uses mock data
- Needs to call `/api/admin/verifications`
- Features: View proof, approve/reject

#### ReportsManagement (NEEDS UPDATE)
- Currently uses mock data
- Needs to call `/api/admin/reports`
- Features: View reports, update status, restrict user

## Database Setup

### 1. Run Migration
\`\`\`sql
-- File: database/migration_admin_system.sql
-- Adds is_admin column
-- Creates admin user
-- Creates admin profile
\`\`\`

### 2. Generate Admin Password Hash
\`\`\`bash
node database/generate-admin-hash.js YourStrongPassword123
\`\`\`

Copy the generated hash and update `migration_admin_system.sql`.

### 3. Apply Migration
Run the SQL in Supabase SQL Editor or your preferred tool.

## Setup Steps

### Step 1: Database Migration
1. Generate password hash: `node database/generate-admin-hash.js Admin@123`
2. Copy hash into `database/migration_admin_system.sql`
3. Run migration in Supabase SQL Editor
4. Verify: `SELECT id, username, is_admin FROM users WHERE is_admin = TRUE;`

### Step 2: Test Admin Login
1. Navigate to `/login`
2. Login with username: `admin`, password: `Admin@123` (or your chosen password)
3. Should redirect to `/admin`
4. Dashboard should load with real stats

### Step 3: Update Frontend Components (Optional)
The users, verifications, and reports management components currently use mock data. To connect them to the real APIs:

**UsersManagement.tsx:**
- Remove mock data in useEffect
- Call `/api/admin/users?adminId=${userId}&page=${page}`
- Handle actions via PATCH requests

**VerificationRequests.tsx:**
- Remove mock data in useEffect
- Call `/api/admin/verifications` with token
- Handle approve/reject via POST requests

**ReportsManagement.tsx:**
- Remove mock data in useEffect
- Call `/api/admin/reports?adminId=${userId}`
- Handle status updates via PATCH requests

## API Migration Needed

The Users and Reports APIs still use the old `adminId` query parameter pattern instead of JWT verification. To modernize them:

### Option 1: Update to use verifyAdminFromRequest (Recommended)
Replace adminId checks with:
\`\`\`typescript
const admin = await verifyAdminFromRequest(request);
if (!admin) {
  return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
}
\`\`\`

### Option 2: Keep current pattern (Works but less secure)
Continue passing adminId in requests and checking with `verifyAdmin(adminId)`.

## Security Checklist

- ✅ JWT includes isAdmin flag
- ✅ Admin middleware verifies JWT
- ✅ Admin routes check localStorage for auth
- ✅ Stats API uses admin verification
- ✅ Verifications API uses admin verification
- ⚠️ Users API uses old adminId pattern
- ⚠️ Reports API uses old adminId pattern
- ❌ Frontend components need API integration

## Testing Checklist

1. **Admin Login**
   - [ ] Login as admin redirects to `/admin`
   - [ ] Non-admin cannot access `/admin`
   - [ ] Token stored in localStorage

2. **Dashboard Stats**
   - [ ] Real data loads from API
   - [ ] All 6 stats display correctly
   - [ ] Loading state works

3. **Users Management**
   - [ ] List users (when connected to API)
   - [ ] Search works
   - [ ] Restrict/unrestrict user
   - [ ] Delete user

4. **Verifications**
   - [ ] List pending verifications
   - [ ] View proof images
   - [ ] Approve verification
   - [ ] Reject verification

5. **Reports**
   - [ ] List all reports
   - [ ] Filter by status
   - [ ] Update report status
   - [ ] Restrict reported user

## Default Admin Credentials

**Username:** admin  
**Password:** Admin@123 (change in migration file)  
**Email:** admin@ghosty.app

**⚠️ IMPORTANT:** Change the default password immediately after first login!

## File Reference

### Backend
- `lib/adminMiddleware.ts` - Admin authentication middleware
- `app/api/auth/login/route.ts` - Login with isAdmin flag
- `app/api/admin/stats/route.ts` - Dashboard stats
- `app/api/admin/users/route.ts` - User management
- `app/api/admin/verifications/route.ts` - Verification management
- `app/api/admin/reports/route.ts` - Report management

### Frontend
- `app/login/page.tsx` - Login with admin detection
- `app/admin/page.tsx` - Admin dashboard
- `components/admin/DashboardStats.tsx` - Stats display ✅
- `components/admin/UsersManagement.tsx` - User management (mock data)
- `components/admin/VerificationRequests.tsx` - Verifications (mock data)
- `components/admin/ReportsManagement.tsx` - Reports (mock data)

### Database
- `database/migration_admin_system.sql` - Admin setup migration
- `database/generate-admin-hash.js` - Password hash generator

## Next Steps

1. Run database migration to create admin user
2. Test admin login flow
3. Verify dashboard stats load correctly
4. (Optional) Update frontend components to use real APIs
5. (Recommended) Update Users and Reports APIs to use JWT verification

## Support

For issues or questions, check:
- Admin middleware implementation
- JWT payload structure
- localStorage admin flag
- API authentication patterns
