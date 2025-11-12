# 🚀 Ghosty Admin Panel - Quick Start Guide

## ⚡ 5-Minute Setup

### **1. Access the Admin Panel**
```bash
# Start your Next.js development server
npm run dev

# Navigate to the admin panel
http://localhost:3000/admin
```

### **2. Explore the Features**

#### **Dashboard Tab**
- View platform statistics (Total Users, Verified, Non-Verified, Reports)
- See 7-day trend charts for registrations and verifications
- Click quick action buttons to jump to specific sections

#### **Users Tab**
- Search users by name or university
- Filter by verification status (All, Verified, Non-Verified)
- Navigate pages with pagination controls
- Click action buttons:
  - ✅ **Approve** - Mark user as verified
  - 🚫 **Restrict** - Restrict user access
  - 🗑️ **Delete** - Permanently remove user

#### **Verifications Tab**
- Review pending verification document uploads
- Click **View Document** to preview uploaded files
- Click **Approve** to verify user (removes from pending list)
- Click **Reject** to deny verification request

#### **Reports Tab**
- Filter reports by status (All, Pending, Resolved, Ignored)
- Review report details (reason, description, date)
- Click action buttons:
  - ✅ **Mark Resolved** - Close the report
  - 🚫 **Restrict User** - Restrict the reported user
  - ❌ **Ignore** - Mark report as false

### **3. Toggle Theme**
- Click the **Moon/Sun** icon in the header
- Theme preference saves automatically
- Persists across page refreshes

---

## 📦 What's Included

### **Components (9 files)**
✅ AdminHeader - Header with theme toggle  
✅ DashboardStats - Stats overview  
✅ StatsCard - Reusable stat card  
✅ MiniChart - 7-day trend chart  
✅ UsersManagement - Users table  
✅ VerificationRequests - Verification review  
✅ ReportsManagement - Reports handling  
✅ ConfirmModal - Confirmation dialogs  
✅ ViewDocumentModal - Document previewer  

### **Documentation**
✅ ADMIN_PANEL_README.md - Full documentation (600+ lines)  
✅ ADMIN_PANEL_SUMMARY.md - Implementation summary  
✅ This Quick Start Guide  

---

## 🔌 Connect to Real Data

Currently using **mock data**. To connect to your backend:

### **Step 1: Create API Endpoints**

Create these 7 API routes in `app/api/admin/`:

```typescript
// 1. app/api/admin/stats/route.ts
export async function GET() {
  // Return platform statistics
}

// 2. app/api/admin/users/route.ts
export async function GET() {
  // Return all users
}

// 3. app/api/admin/users/[id]/route.ts
export async function PATCH(request, { params }) {
  // Handle user actions (approve, restrict, delete)
}

// 4. app/api/admin/verifications/route.ts
export async function GET() {
  // Return verification requests
}

// 5. app/api/admin/verifications/[id]/route.ts
export async function PATCH(request, { params }) {
  // Handle verification approval/rejection
}

// 6. app/api/admin/reports/route.ts
export async function GET() {
  // Return all reports
}

// 7. app/api/admin/reports/[id]/route.ts
export async function PATCH(request, { params }) {
  // Handle report actions
}
```

### **Step 2: Replace Mock Data**

In each component, replace the mock data `setTimeout` with API calls:

```typescript
// Example: DashboardStats.tsx
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

### **Step 3: Add Authentication**

Protect the admin routes with middleware:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin_token');
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
```

**See ADMIN_PANEL_README.md for complete integration guide.**

---

## 🎨 Customization

### **Change Colors**
Edit Tailwind classes in components:

```typescript
// Change primary color from purple to blue
className="bg-purple-600" → className="bg-blue-600"
className="text-purple-600" → className="text-blue-600"
```

### **Modify Stats Cards**
Edit `DashboardStats.tsx`:

```typescript
// Add a new stat card
<StatsCard
  title="New Stat"
  value={stats.newStat}
  icon={YourIcon}
  color="blue"
  trend="up"
  percentage={15}
/>
```

### **Change Users Per Page**
Edit `UsersManagement.tsx`:

```typescript
const usersPerPage = 10; // Change to 20, 50, etc.
```

### **Add New Tab**
Edit `app/admin/page.tsx`:

```typescript
// Add to tabs array
const tabs = [
  { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'settings' as AdminTab, label: 'Settings', icon: Settings }, // NEW
];

// Add to render logic
{activeTab === 'settings' && <SettingsPage />}
```

---

## 🧪 Testing

### **Check Components Load**
```bash
# Open browser console
# Navigate to each tab
# Verify no errors in console
```

### **Test Theme Toggle**
1. Click Moon/Sun icon in header
2. Verify UI changes to dark/light mode
3. Refresh page
4. Verify theme persists

### **Test User Actions**
1. Go to Users tab
2. Click Approve/Restrict/Delete on a user
3. Verify confirmation modal appears
4. Click confirm
5. Verify UI updates

### **Test Search & Filters**
1. Type in search bar
2. Verify results filter instantly
3. Change verification filter
4. Verify table updates

---

## 🐛 Troubleshooting

### **TypeScript Errors**
```bash
# Restart the dev server
# TypeScript should pick up new components
```

### **Theme Not Saving**
```bash
# Check browser console for localStorage errors
# Ensure localStorage is enabled in browser
```

### **Components Not Found**
```bash
# Verify all files exist in components/admin/
# Check import paths use correct casing
```

### **Styles Not Applied**
```bash
# Verify Tailwind CSS is running
# Check for conflicting CSS
# Clear browser cache
```

---

## 📱 Mobile Testing

Test on different devices:
```bash
# Desktop: Chrome DevTools (F12) → Toggle Device Toolbar
# iPhone: Safari → Develop → Enter Responsive Design Mode
# Android: Chrome → More Tools → Developer Tools → Toggle Device Toolbar
```

**Breakpoints:**
- Mobile: < 768px (card layout)
- Tablet: 768px - 1024px (compact table)
- Desktop: > 1024px (full table)

---

## 🎯 Quick Actions

### **Approve All Verifications**
1. Go to Verifications tab
2. Click Approve on each request
3. All requests marked as verified

### **Handle Urgent Reports**
1. Go to Dashboard
2. Click "Handle Reports" quick action
3. Jump directly to Reports tab
4. Filter shows pending reports only

### **Find Specific User**
1. Go to Users tab
2. Type name in search bar
3. Results filter instantly
4. Click actions on found user

---

## 📚 Learn More

- **Full Documentation:** `ADMIN_PANEL_README.md`
- **Implementation Summary:** `ADMIN_PANEL_SUMMARY.md`
- **Backend Integration:** `BACKEND_README.md`
- **Database Schema:** `database/schema.sql`

---

## ✨ Next Steps

1. ✅ Explore all 4 tabs
2. ✅ Test theme toggle
3. ✅ Try search and filters
4. ⏳ Create API endpoints (see Step 1 above)
5. ⏳ Replace mock data (see Step 2 above)
6. ⏳ Add authentication (see Step 3 above)
7. ⏳ Deploy to production

---

## 🎉 You're Ready!

The admin panel is **fully functional with mock data**.  
Connect it to your backend API for production use.

**Need help?** See `ADMIN_PANEL_README.md` for detailed guides.

---

Built with ❤️ for Ghosty Dating Platform 👻
