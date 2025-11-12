# 🎯 Recommendation System - Quick Setup Guide

## What's Been Built

✅ **Smart Recommendation Algorithm** with match scoring
✅ **Swipe System** (like/skip) with mutual match detection
✅ **Block & Report System** for user safety
✅ **Database Schema** with 4 new tables (swipes, matches, blocks, reports)
✅ **Optimized Queries** with indexes and helper functions
✅ **Pagination Support** for infinite scroll
✅ **Zod Validation** for all API inputs

---

## 🚀 Quick Start (3 Steps)

### Step 1: Run Database Migration

1. Open Supabase Dashboard → SQL Editor
2. Copy content from: `database/migration_recommendation_system.sql`
3. Paste and click **Run**

**What this creates:**
- ✅ `swipes` table (user like/skip actions)
- ✅ `matches` table (mutual likes)
- ✅ `blocks` table (blocked users)
- ✅ `reports` table (user reports)
- ✅ Indexes for performance
- ✅ Row Level Security policies
- ✅ Helper functions (are_users_matched, get_user_match_count, etc.)

### Step 2: Test the API

**Fetch Recommendations:**
```bash
GET http://localhost:3000/api/recommendations?userId=YOUR_USER_ID&page=1&limit=20
```

**Like a Profile:**
```bash
POST http://localhost:3000/api/recommendations
Content-Type: application/json

{
  "swiperId": "YOUR_USER_ID",
  "targetId": "PROFILE_USER_ID",
  "action": "like"
}
```

**Skip a Profile:**
```bash
POST http://localhost:3000/api/recommendations
Content-Type: application/json

{
  "swiperId": "YOUR_USER_ID",
  "targetId": "PROFILE_USER_ID",
  "action": "skip"
}
```

### Step 3: Integrate Frontend

Use the example React component from `RECOMMENDATION_SYSTEM_GUIDE.md` or create your own:

```typescript
// Example usage in your dashboard
import RecommendationFeed from '@/components/dashboard/RecommendationFeed';

export default function DashboardPage() {
  const userId = 'current-user-id'; // Get from auth

  return (
    <div>
      <h1>Find Your Match</h1>
      <RecommendationFeed userId={userId} />
    </div>
  );
}
```

---

## 📊 How It Works

### Match Score Algorithm

```
Points Breakdown:
├─ Each shared interest: +10 points
├─ Each shared preference: +5 points
├─ Verified user: +20 points
├─ Same university: +10 points
├─ Same faculty: +5 points
└─ Each report: -5 points (penalty)

Example:
- 3 shared interests = +30
- Verified = +20
- Same university = +10
Total = 60 points
```

### Filtering Logic

**Who gets recommended?**
✅ Matches your age preference
✅ Matches your gender preference
✅ You match their age preference
✅ You match their gender preference
✅ Profile is complete
✅ Not blocked by you or them
✅ You haven't swiped on them before

**Who gets excluded?**
❌ Already liked/skipped
❌ Blocked users (both directions)
❌ Incomplete profiles
❌ Your own profile
❌ Users outside mutual preferences

### Match Detection

**When you like someone:**
1. Creates swipe record (action: 'like')
2. Checks if they liked you too
3. If yes → Creates match record + returns `isMatch: true`
4. If no → Returns `isMatch: false` (they might like you later)

**When mutual like happens:**
```
User A likes User B → Swipe created
User B likes User A → Swipe created + Match created!
```

---

## 🗄️ Database Tables

### `swipes` - Like/Skip Actions
- Stores: who swiped on whom, action (like/skip), timestamp
- Unique: One swipe per user pair
- Indexed: Fast lookups by swiper/target

### `matches` - Mutual Likes
- Stores: Both user IDs, match timestamp, active status
- Constraint: user1_id < user2_id (prevents duplicates)
- Indexed: Fast lookups by user

### `blocks` - Blocked Users
- Stores: who blocked whom, reason, timestamp
- Prevents: Blocked users from seeing each other
- Indexed: Fast block checks

### `reports` - User Reports
- Stores: reporter, reported user, reason, status, admin notes
- Reasons: inappropriate_content, fake_profile, harassment, spam, underage, other
- Status: pending, reviewed, resolved, dismissed
- Indexed: Fast queries by reporter/reported user

---

## 🎯 API Reference

### GET /api/recommendations

**Query Parameters:**
- `userId` (required) - Current user ID
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 20) - Items per page
- `filterUniversity` (optional) - Same university only
- `filterFaculty` (optional) - Same faculty only
- `minAge` (optional) - Override min age
- `maxAge` (optional) - Override max age

**Response:**
```json
{
  "recommendations": [...],
  "page": 1,
  "limit": 20,
  "total": 45,
  "hasMore": true
}
```

### POST /api/recommendations

**Request Body:**
```json
{
  "swiperId": "user-uuid",
  "targetId": "profile-uuid",
  "action": "like" or "skip"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile liked successfully",
  "action": "like",
  "isMatch": true  // Only true if mutual like
}
```

---

## 📱 Frontend Integration

### Infinite Scroll Example

```typescript
const [profiles, setProfiles] = useState([]);
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  const res = await fetch(`/api/recommendations?userId=${userId}&page=${page}`);
  const data = await res.json();
  
  setProfiles(prev => [...prev, ...data.recommendations]);
  setHasMore(data.hasMore);
  setPage(prev => prev + 1);
};

useEffect(() => {
  loadMore();
}, []);
```

### Swipe Handler

```typescript
const handleSwipe = async (targetId: string, action: 'like' | 'skip') => {
  const res = await fetch('/api/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      swiperId: currentUserId, 
      targetId, 
      action 
    }),
  });
  
  const data = await res.json();
  
  if (data.isMatch) {
    showMatchModal(targetId); // Show "It's a match!" modal
  }
  
  // Remove from feed
  setProfiles(prev => prev.filter(p => p.userId !== targetId));
  
  // Load more if needed
  if (profiles.length <= 5 && hasMore) {
    loadMore();
  }
};
```

---

## 🧪 Testing Checklist

- [ ] Run database migration successfully
- [ ] Create test users with different preferences
- [ ] Fetch recommendations for a user
- [ ] Like a profile (verify swipe created)
- [ ] Skip a profile (verify swipe created)
- [ ] Create mutual match (both users like each other)
- [ ] Verify match appears in `matches` table
- [ ] Test block functionality (user shouldn't appear)
- [ ] Test report functionality
- [ ] Verify pagination works correctly
- [ ] Test with 0 matching profiles (empty state)
- [ ] Test match score calculation
- [ ] Verify shared interests display correctly

---

## 🔐 Security TODO

⚠️ **Before Production:**

1. **Add JWT Authentication**
```typescript
// Verify user is authenticated
const authHeader = request.headers.get('Authorization');
const token = authHeader?.replace('Bearer ', '');
const payload = await verifyJWT(token);

if (!payload || payload.userId !== requestUserId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

2. **Rate Limiting**
```typescript
// Limit swipes per hour (prevent spam)
const swipeCount = await getSwipeCount(userId, lastHour);
if (swipeCount > 100) {
  return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
}
```

3. **Input Sanitization**
- ✅ Already using Zod validation
- ⚠️ Add SQL injection protection (using Supabase parameterized queries)
- ⚠️ Add XSS protection for user-generated content

---

## ⚡ Performance Tips

1. **Database Indexes** - Already created in migration
2. **Pagination** - Fetch 20 profiles at a time, not all
3. **Caching** - Use React Query or SWR for client-side caching
4. **Lazy Loading** - Load more profiles when user approaches end
5. **Optimize Queries** - Use `EXPLAIN ANALYZE` in Supabase SQL Editor

---

## 📊 Useful Database Queries

**Get user's matches:**
```sql
SELECT * FROM matches 
WHERE (user1_id = 'YOUR_USER_ID' OR user2_id = 'YOUR_USER_ID')
AND is_active = TRUE;
```

**Get user's likes (outgoing):**
```sql
SELECT * FROM swipes 
WHERE swiper_user_id = 'YOUR_USER_ID' 
AND action = 'like';
```

**Get users who liked you (incoming):**
```sql
SELECT * FROM swipes 
WHERE target_user_id = 'YOUR_USER_ID' 
AND action = 'like';
```

**Check if two users are matched:**
```sql
SELECT are_users_matched('USER_1_ID', 'USER_2_ID');
```

**Get match count:**
```sql
SELECT get_user_match_count('YOUR_USER_ID');
```

**Get report count:**
```sql
SELECT get_user_report_count('YOUR_USER_ID');
```

---

## 🆘 Troubleshooting

### No recommendations showing

**Possible causes:**
1. User hasn't completed profile → Set preferences
2. No other users match criteria → Broaden preferences
3. User swiped on all profiles → Wait for new users
4. Database migration not run → Run migration script

**Fix:** Check database for matching profiles manually

### Match not detected

**Possible causes:**
1. Only one user liked → Need mutual like
2. Swipe record not created → Check API logs
3. Database error → Check Supabase logs

**Fix:** Verify both swipe records exist in database

### Performance issues

**Possible causes:**
1. Missing indexes → Run migration (creates indexes)
2. Too many profiles → Use pagination
3. Complex queries → Optimize with EXPLAIN ANALYZE

**Fix:** Check query performance in Supabase dashboard

---

## 📁 Files Created

```
✅ app/api/recommendations/route.ts              # Main API endpoint
✅ database/migration_recommendation_system.sql  # Database schema
✅ RECOMMENDATION_SYSTEM_GUIDE.md               # Full documentation
✅ RECOMMENDATION_QUICKSTART.md                 # This quick guide
```

---

## 🎉 Next Steps

1. ✅ Run database migration
2. ✅ Test API endpoints with Postman/curl
3. ✅ Create frontend component
4. ✅ Integrate with your dashboard
5. ⚠️ Add authentication (before production)
6. ⚠️ Add rate limiting
7. ⚠️ Set up match notifications
8. ⚠️ Add analytics tracking

---

**Ready to match! 🎯💘**

For detailed documentation, see `RECOMMENDATION_SYSTEM_GUIDE.md`
