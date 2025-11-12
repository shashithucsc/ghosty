# Ghosty Admin Panel Documentation

## Overview

The Ghosty Admin Panel is a modern, mobile-first, responsive admin interface for managing the Ghosty dating platform. Built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4, it provides a complete dashboard for platform administrators to manage users, verification requests, and reports.

## ✨ Features

### 1. **Dashboard Overview**
- Real-time platform statistics with visual charts
- 4 key metrics: Total Users, Verified Users, Non-Verified Users, Total Reports
- 7-day trend charts for:
  - New user registrations
  - Verification approvals
- Quick action buttons for common tasks
- Color-coded urgent items

### 2. **Users Management**
- Complete user table with search and filtering
- **Table Columns:**
  - User (Anonymous Name + Avatar + ID)
  - University
  - Verification Status (Verified/Not Verified)
  - Reports Count
  - Registration Date
  - Quick Actions
- **Search:** Filter by name or university
- **Filters:** All Users, Verified Only, Non-Verified Only
- **Actions:**
  - Approve Verification (for unverified users)
  - Restrict User (prevents access)
  - Delete User (permanent removal)
- **Pagination:** 10 users per page with navigation
- **Responsive:** Table view on desktop, card view on mobile

### 3. **Verification Requests**
- Review pending verification document uploads
- **Request Details:**
  - User information (Anonymous Name, Avatar, University)
  - File type (Student ID, Facebook Profile, Academic Document)
  - Upload date and time
  - User ID
- **Actions:**
  - View Document (modal preview)
  - Approve Verification (marks user as verified)
  - Reject Verification (denies request)
- **Empty State:** Shows when all requests are processed

### 4. **Reports Management**
- Handle user reports and complaints
- **Report Details:**
  - Reporter and reported user information
  - Reason (Harassment, Inappropriate Content, Fake Profile, Spam)
  - Description
  - Report date and time
  - Status (Pending, Resolved, Ignored)
- **Filters:** All, Pending, Resolved, Ignored
- **Actions:**
  - Mark Resolved (closes report)
  - Restrict User (restricts reported user)
  - Ignore Report (marks as false report)

### 5. **Dark/Light Theme Toggle**
- Persistent theme preference (localStorage)
- Smooth transitions between themes
- Glassmorphic design adapts to theme

### 6. **Responsive Design**
- Mobile-first approach
- Breakpoints:
  - Mobile: < 768px (card layout)
  - Tablet: 768px - 1024px (compact table)
  - Desktop: > 1024px (full table view)

## 📁 File Structure

```
ghosty/
├── app/
│   └── admin/
│       └── page.tsx                    # Main admin page with tabs
└── components/
    └── admin/
        ├── AdminHeader.tsx             # Header with theme toggle & logout
        ├── DashboardStats.tsx          # Dashboard overview section
        ├── StatsCard.tsx               # Reusable stats card component
        ├── MiniChart.tsx               # Bar chart for trends
        ├── UsersManagement.tsx         # Users table & management
        ├── VerificationRequests.tsx    # Verification review interface
        ├── ReportsManagement.tsx       # Reports handling interface
        ├── ConfirmModal.tsx            # Confirmation dialog modal
        └── ViewDocumentModal.tsx       # Document preview modal
```

## 🚀 Component Breakdown

### **AdminHeader.tsx**
```typescript
Props:
- darkMode: boolean          // Current theme state
- onToggleTheme: () => void  // Theme toggle function

Features:
- Ghosty Admin branding with gradient logo
- Theme toggle button (Moon/Sun icons)
- Logout button
- Sticky header with backdrop blur
```

### **DashboardStats.tsx**
```typescript
Features:
- 4 StatsCard components for key metrics
- 2 MiniChart components for trends
- Quick action buttons
- Loading state with spinner
- Mock data (replace with API calls)
```

### **StatsCard.tsx**
```typescript
Props:
- title: string               // Card title
- value: number               // Main stat value
- icon: LucideIcon            // Icon component
- color: string               // Color variant (purple/green/orange/red/blue)
- trend?: 'up' | 'down'       // Trend indicator (optional)
- percentage?: number         // Percentage change (optional)
- urgent?: boolean            // Pulse animation for urgent items

Features:
- Color-coded icon backgrounds
- Hover scale animation
- Trend indicators with TrendingUp/Down icons
- Pulse animation for urgent items
```

### **MiniChart.tsx**
```typescript
Props:
- data: number[]              // 7 values for Mon-Sun
- color: string               // Chart color (purple/green/blue/orange)

Features:
- Responsive bar heights (calculated from max value)
- Hover tooltips showing exact values
- Day labels (Mon-Sun)
- Smooth height transitions
```

### **UsersManagement.tsx**
```typescript
Features:
- Search by name or university
- Filter by verification status
- Pagination (10 users per page)
- Responsive table/card view
- Confirm modals for actions
- Mock data (replace with API calls)

Actions:
- handleAction(type, user) - Opens confirmation modal
- confirmAction() - Executes approved action
```

### **VerificationRequests.tsx**
```typescript
Features:
- Grid layout for verification cards
- File type badges (color-coded)
- Upload date/time display
- Document viewer modal
- Empty state when no pending requests

Actions:
- viewDocument(request) - Opens ViewDocumentModal
- handleAction('approve'|'reject', request) - Opens ConfirmModal
```

### **ReportsManagement.tsx**
```typescript
Features:
- Status filter buttons (All, Pending, Resolved, Ignored)
- Color-coded reason badges
- Report description in highlighted box
- Report date/time display
- Empty states per filter

Actions:
- handleAction('resolve'|'restrict'|'ignore', report) - Opens ConfirmModal
```

### **ConfirmModal.tsx**
```typescript
Props:
- title: string               // Modal title
- message: string             // Confirmation message
- confirmLabel: string        // Confirm button text
- cancelLabel: string         // Cancel button text
- onConfirm: () => void       // Confirm action callback
- onCancel: () => void        // Cancel action callback
- type?: 'warning' | 'danger' // Modal type (affects colors)

Features:
- Backdrop blur overlay
- Warning (orange) or Danger (red) variants
- Scale-in animation
- Icon display (AlertTriangle or XCircle)
```

### **ViewDocumentModal.tsx**
```typescript
Props:
- request: VerificationRequest  // Request data
- onClose: () => void            // Close modal
- onApprove: () => void          // Approve verification
- onReject: () => void           // Reject verification

Features:
- Full-screen modal overlay
- Document preview area (placeholder for actual file display)
- User information header
- Approve/Reject/Close actions
```

## 🎨 Design System

### **Colors**
```typescript
// Primary Colors
purple-600: Main brand color
pink-600: Accent color
blue-600: Secondary accent

// Status Colors
green: Success, Verified, Approved
orange: Warning, Pending, Non-Verified
red: Danger, Reports, Restrict
gray: Neutral, Ignored, Inactive

// Dark Mode
gray-900: Background
gray-800: Surface
gray-700: Hover
```

### **Glassmorphic Cards**
```css
.glassmorphic-card {
  @apply bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg 
         border border-gray-200 dark:border-gray-700 
         rounded-2xl shadow-lg;
}
```

### **Animations**
```css
/* Fade in on mount */
.animate-fade-in

/* Scale in for modals */
.animate-scale-in

/* Hover scale for cards */
hover:scale-105

/* Pulse for urgent items */
animate-pulse
```

## 🔧 Integration Guide

### **Replace Mock Data with API Calls**

#### **DashboardStats.tsx**
```typescript
useEffect(() => {
  async function fetchStats() {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  }
  fetchStats();
}, []);
```

#### **UsersManagement.tsx**
```typescript
useEffect(() => {
  async function fetchUsers() {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data.users);
      setFilteredUsers(data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }
  fetchUsers();
}, []);

// Action handler
const confirmAction = async () => {
  if (!modalAction.user) return;
  
  try {
    const response = await fetch(`/api/admin/users/${modalAction.user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: modalAction.type }),
    });
    
    if (response.ok) {
      // Update local state
      // Refetch users
    }
  } catch (error) {
    console.error('Action failed:', error);
  }
  
  setShowConfirmModal(false);
};
```

#### **VerificationRequests.tsx**
```typescript
useEffect(() => {
  async function fetchRequests() {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/verifications?status=pending');
      const data = await response.json();
      setRequests(data.requests);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  }
  fetchRequests();
}, []);

// Approval handler
const confirmAction = async () => {
  if (!selectedRequest) return;
  
  try {
    const response = await fetch(`/api/admin/verifications/${selectedRequest.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: modalAction }),
    });
    
    if (response.ok) {
      setRequests(requests.filter(r => r.id !== selectedRequest.id));
    }
  } catch (error) {
    console.error('Action failed:', error);
  }
  
  setShowConfirmModal(false);
};
```

#### **ReportsManagement.tsx**
```typescript
useEffect(() => {
  async function fetchReports() {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/reports');
      const data = await response.json();
      setReports(data.reports);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  }
  fetchReports();
}, []);

// Action handler
const confirmAction = async () => {
  if (!modalAction.report) return;
  
  try {
    const response = await fetch(`/api/admin/reports/${modalAction.report.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: modalAction.type,
        status: modalAction.type === 'resolve' ? 'resolved' : 'ignored'
      }),
    });
    
    if (response.ok) {
      // Update local state
    }
  } catch (error) {
    console.error('Action failed:', error);
  }
  
  setShowConfirmModal(false);
};
```

### **Required API Endpoints**

Create these API routes to power the admin panel:

#### **1. `/api/admin/stats` - GET**
```typescript
// Returns platform statistics
{
  totalUsers: number,
  verifiedUsers: number,
  nonVerifiedUsers: number,
  totalReports: number,
  newUsersThisWeek: number[],          // 7 values for Mon-Sun
  verificationApprovalsThisWeek: number[] // 7 values for Mon-Sun
}
```

#### **2. `/api/admin/users` - GET**
```typescript
// Returns all users with optional filters
{
  users: [
    {
      id: string,
      anonymousName: string,
      avatar: string,
      isVerified: boolean,
      totalReports: number,
      university: string,
      registrationDate: string,
      isRestricted: boolean
    }
  ]
}
```

#### **3. `/api/admin/users/[id]` - PATCH**
```typescript
// Request body
{
  action: 'approve' | 'reject' | 'restrict' | 'delete'
}

// Response
{
  success: boolean,
  message: string
}
```

#### **4. `/api/admin/verifications` - GET**
```typescript
// Query params: ?status=pending
{
  requests: [
    {
      id: string,
      userId: string,
      anonymousName: string,
      avatar: string,
      university: string,
      fileType: 'student_id' | 'facebook' | 'academic',
      fileUrl: string,
      uploadDate: string,
      status: 'pending' | 'approved' | 'rejected'
    }
  ]
}
```

#### **5. `/api/admin/verifications/[id]` - PATCH**
```typescript
// Request body
{
  status: 'approved' | 'rejected'
}

// Response
{
  success: boolean,
  message: string
}
```

#### **6. `/api/admin/reports` - GET**
```typescript
{
  reports: [
    {
      id: string,
      reporterId: string,
      reporterName: string,
      reportedUserId: string,
      reportedUserName: string,
      reportedUserAvatar: string,
      reason: string,
      description: string,
      date: string,
      status: 'pending' | 'resolved' | 'ignored'
    }
  ]
}
```

#### **7. `/api/admin/reports/[id]` - PATCH**
```typescript
// Request body
{
  action: 'resolve' | 'restrict' | 'ignore',
  status: 'resolved' | 'ignored'
}

// Response
{
  success: boolean,
  message: string
}
```

## 🔐 Authentication & Authorization

### **Protect Admin Routes**

Add middleware to ensure only admins can access the admin panel:

#### **middleware.ts**
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if accessing admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Verify admin JWT token
    const token = request.cookies.get('admin_token');
    
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    // Verify token is valid and user is admin
    // Add your token verification logic here
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
```

#### **Admin Login Page**
Create `/app/admin/login/page.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (response.ok) {
        router.push('/admin');
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="glassmorphic-card p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-600"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-600"
            required
          />
          <button
            type="submit"
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
```

### **Database Schema for Admins**

Add to `database/schema.sql`:
```sql
-- Admin users table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin', -- 'admin', 'super_admin'
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create trigger for updated_at
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_active ON admin_users(is_active);
```

## 📱 Mobile Responsiveness

### **Breakpoint Strategy**

```typescript
// Mobile (< 768px)
- Stack elements vertically
- Card-based layouts
- Full-width buttons
- Collapsible sections

// Tablet (768px - 1024px)
- 2-column grids
- Compact tables
- Side-by-side buttons

// Desktop (> 1024px)
- Full table views
- 3-4 column grids
- Horizontal layouts
- Sidebar navigation
```

### **Responsive Utilities**

```css
/* Mobile-first approach */
.mobile-only { @apply lg:hidden; }
.desktop-only { @apply hidden lg:block; }

/* Grid responsiveness */
.responsive-grid {
  @apply grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6;
}

/* Flex responsiveness */
.responsive-flex {
  @apply flex flex-col lg:flex-row gap-4;
}
```

## 🎯 Usage Examples

### **Access Admin Panel**
1. Navigate to `/admin`
2. Login with admin credentials (if middleware is enabled)
3. View dashboard overview
4. Switch between tabs: Dashboard, Users, Verifications, Reports

### **Manage Users**
1. Click "Users" tab
2. Use search bar to find specific users
3. Apply verification status filter
4. Click action buttons: Approve, Restrict, Delete
5. Confirm action in modal

### **Review Verifications**
1. Click "Verifications" tab
2. View pending verification requests
3. Click "View Document" to preview upload
4. Click "Approve" or "Reject"
5. Request is removed from pending list

### **Handle Reports**
1. Click "Reports" tab
2. Filter by status: All, Pending, Resolved, Ignored
3. Review report details
4. Click "Mark Resolved", "Restrict User", or "Ignore"
5. Report status updates

## 🚦 Testing Checklist

- [ ] Dashboard loads with stats and charts
- [ ] Theme toggle persists across page refreshes
- [ ] Users table displays and search works
- [ ] Verification status filter updates table
- [ ] Pagination navigates correctly
- [ ] Confirmation modals show for all actions
- [ ] Actions update UI optimistically
- [ ] Verification requests show pending items
- [ ] Document viewer modal opens correctly
- [ ] Reports filter by status correctly
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Dark mode applies to all components
- [ ] Loading states show during data fetch
- [ ] Empty states show when no data available

## 🔮 Future Enhancements

1. **Real-time Updates**
   - WebSocket connections for live data
   - Notification badges for new items

2. **Advanced Analytics**
   - User growth charts (monthly/yearly)
   - Verification approval rates
   - Report resolution times
   - University distribution pie charts

3. **Bulk Actions**
   - Select multiple users for bulk actions
   - Export user data to CSV
   - Bulk approve/reject verifications

4. **Activity Logs**
   - Admin action history
   - User activity tracking
   - Audit trail for compliance

5. **Email Notifications**
   - Notify users of verification status
   - Send warnings to reported users
   - Admin alerts for urgent items

6. **Advanced Filtering**
   - Date range filters
   - Multiple status filters
   - Sort by multiple columns

7. **User Details Modal**
   - View full user profile
   - See all reports against user
   - View verification history

## 📝 Notes

- **Mock Data:** All components currently use mock data. Replace with API calls using the integration guide above.
- **Tailwind CSS v4:** Uses new gradient syntax `bg-linear-to-*` instead of `bg-gradient-to-*`.
- **TypeScript:** Strict mode enabled for type safety.
- **Icons:** Lucide React for consistent icon library.
- **Accessibility:** Add ARIA labels and keyboard navigation support.
- **Performance:** Implement pagination/infinite scroll for large datasets.

## 🆘 Troubleshooting

### **Theme not persisting:**
- Check localStorage is enabled in browser
- Verify `useEffect` for theme loading is running

### **Modal not closing:**
- Ensure `onClose` callback is connected
- Check modal state is being reset

### **Data not loading:**
- Verify API endpoints are returning correct format
- Check network tab for failed requests
- Add error handling and user feedback

### **Responsive layout broken:**
- Verify Tailwind CSS is compiled correctly
- Check for conflicting CSS classes
- Test on actual devices, not just browser resize

## 📚 Related Documentation

- [Backend API Documentation](./BACKEND_README.md)
- [Backend Quick Start Guide](./BACKEND_QUICKSTART.md)
- [Database Schema](./database/schema.sql)
- [File Structure](./FILE_STRUCTURE.md)

---

**Built with ❤️ for Ghosty Dating Platform**
