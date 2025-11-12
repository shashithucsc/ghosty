# 🎯 Ghosty Recommendation Feed System - Complete Guide

## Overview

Advanced recommendation engine with smart matching algorithm, user interactions tracking, and real-time match detection.

---

## ✅ System Architecture

### Core Components

1. **Recommendation Algorithm** - Intelligent profile matching
2. **Swipe System** - Like/skip actions with mutual match detection
3. **Block System** - User blocking and visibility control
4. **Report System** - User reporting and moderation
5. **Match System** - Mutual like tracking and notifications

---

## 🧠 Matching Algorithm

### Match Score Calculation

The recommendation engine calculates a **match score** for each potential profile based on multiple factors:

```typescript
Base Score Components:
├─ Shared Interests: +10 points per interest
├─ Shared Preferred Interests: +5 points per preference
├─ Verified Status: +20 points (verified users prioritized)
├─ Same University: +10 points
├─ Same Faculty: +5 points
└─ Report Penalty: -5 points per report
```

**Example Calculation:**
```
User A and User B have:
- 3 shared interests (movies, hiking, music) = +30 points
- 2 shared preferred interests = +10 points
- User B is verified = +20 points
- Same university = +10 points
- Different faculty = +0 points
- User B has 1 report = -5 points

Total Match Score: 65 points
```

### Filtering Logic

**Mutual Preference Matching:**
1. ✅ Age must fit both users' preferences
2. ✅ Gender must match both users' preferences
3. ✅ Optional: University filter
4. ✅ Optional: Faculty filter

**Exclusions:**
- ❌ Users already liked/skipped
- ❌ Blocked users (both ways)
- ❌ Incomplete profiles
- ❌ Self-profile
- ❌ Users who don't match mutual preferences

### Sorting & Ranking

Profiles are sorted by **match score (descending)**:
```
1. Highest Match Score (e.g., 85 points)
2. Second Highest (e.g., 72 points)
3. Third Highest (e.g., 68 points)
...
```

---

## 📡 API Endpoints

### `GET /api/recommendations` - Fetch Recommendation Feed

**Description:** Returns personalized profile recommendations based on user preferences and match algorithm.

**Query Parameters:**
```typescript
{
  userId: string (required, UUID)     // Current user's ID
  page: number (optional, default: 1) // Page number for pagination
  limit: number (optional, default: 20) // Items per page (max: 50)
  filterUniversity: boolean (optional) // Filter by same university
  filterFaculty: boolean (optional)   // Filter by same faculty
  minAge: number (optional)           // Override min age preference
  maxAge: number (optional)           // Override max age preference
}
```

**Example Request:**
```bash
GET /api/recommendations?userId=123e4567-e89b-12d3-a456-426614174000&page=1&limit=20&filterUniversity=true
```

**Response:**
```json
{
  "recommendations": [
    {
      "id": "profile-uuid",
      "userId": "user-uuid",
      "anonymousName": "MysteryLover22",
      "avatar": "🦊",
      "age": 24,
      "gender": "female",
      "university": "Stanford University",
      "faculty": "Computer Science",
      "bio": "Love hiking and reading mystery novels...",
      "interests": ["hiking", "reading", "photography"],
      "isVerified": true,
      "verificationStatus": "verified",
      "matchScore": 75,
      "sharedInterests": ["hiking", "reading"],
      "totalReports": 0,
      "isLiked": false,
      "isSkipped": false
    },
    // ... more profiles
  ],
  "page": 1,
  "limit": 20,
  "total": 45,
  "hasMore": true
}
```

**Response Fields:**
- `recommendations`: Array of matched profiles
- `page`: Current page number
- `limit`: Items per page
- `total`: Total matching profiles available
- `hasMore`: Whether there are more pages to fetch

### `POST /api/recommendations` - Record Swipe Action

**Description:** Records user's like/skip action and detects mutual matches.

**Request Body:**
```json
{
  "swiperId": "user-uuid",
  "targetId": "profile-uuid",
  "action": "like" // or "skip"
}
```

**Example Request:**
```bash
POST /api/recommendations
Content-Type: application/json

{
  "swiperId": "123e4567-e89b-12d3-a456-426614174000",
  "targetId": "987e6543-e21b-12d3-a456-426614174999",
  "action": "like"
}
```

**Response (Like with Match):**
```json
{
  "success": true,
  "message": "Profile liked successfully",
  "action": "like",
  "isMatch": true
}
```

**Response (Skip):**
```json
{
  "success": true,
  "message": "Profile skipped successfully",
  "action": "skip",
  "isMatch": false
}
```

**What Happens on Like:**
1. ✅ Creates swipe record in database
2. ✅ Checks if target user also liked current user
3. ✅ If mutual like exists → creates match record
4. ✅ Returns `isMatch: true` if matched
5. ✅ (Future) Sends match notification to both users

**What Happens on Skip:**
1. ✅ Creates swipe record in database
2. ✅ Profile won't appear again in recommendations
3. ✅ No match detection (obviously)

---

## 🗄️ Database Schema

### Tables Created

#### 1. `swipes` - User Like/Skip Actions

```sql
CREATE TABLE swipes (
  id UUID PRIMARY KEY,
  swiper_user_id UUID NOT NULL,      -- User who swiped
  target_user_id UUID NOT NULL,      -- Profile that was swiped
  action VARCHAR(10) NOT NULL,       -- 'like' or 'skip'
  swiped_at TIMESTAMP,               -- When the swipe happened
  UNIQUE(swiper_user_id, target_user_id)
);
```

**Indexes:**
- `idx_swipes_swiper` on `swiper_user_id`
- `idx_swipes_target` on `target_user_id`
- `idx_swipes_action` on `action`

#### 2. `matches` - Mutual Likes

```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY,
  user1_id UUID NOT NULL,            -- First user (smaller UUID)
  user2_id UUID NOT NULL,            -- Second user (larger UUID)
  matched_at TIMESTAMP,              -- When match was created
  unmatched_at TIMESTAMP,            -- When match was broken
  is_active BOOLEAN DEFAULT TRUE,    -- Match status
  CHECK (user1_id < user2_id),       -- Ensure consistent ordering
  UNIQUE(user1_id, user2_id)
);
```

**Indexes:**
- `idx_matches_user1` on `user1_id`
- `idx_matches_user2` on `user2_id`
- `idx_matches_active` on `is_active`

#### 3. `blocks` - Blocked Users

```sql
CREATE TABLE blocks (
  id UUID PRIMARY KEY,
  blocker_user_id UUID NOT NULL,     -- User who blocked
  blocked_user_id UUID NOT NULL,     -- User who was blocked
  reason TEXT,                       -- Optional reason
  blocked_at TIMESTAMP,              -- When block happened
  CHECK (blocker_user_id != blocked_user_id),
  UNIQUE(blocker_user_id, blocked_user_id)
);
```

**Indexes:**
- `idx_blocks_blocker` on `blocker_user_id`
- `idx_blocks_blocked` on `blocked_user_id`

#### 4. `reports` - User Reports

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY,
  reporter_user_id UUID NOT NULL,    -- User who reported
  reported_user_id UUID NOT NULL,    -- User who was reported
  reason VARCHAR(50) NOT NULL,       -- Report category
  description TEXT,                  -- Detailed description
  status VARCHAR(20) DEFAULT 'pending', -- Review status
  admin_notes TEXT,                  -- Admin review notes
  reported_at TIMESTAMP,             -- When reported
  reviewed_at TIMESTAMP,             -- When reviewed
  reviewed_by UUID,                  -- Admin who reviewed
  CHECK (reporter_user_id != reported_user_id)
);
```

**Report Reasons:**
- `inappropriate_content`
- `fake_profile`
- `harassment`
- `spam`
- `underage`
- `other`

**Indexes:**
- `idx_reports_reporter` on `reporter_user_id`
- `idx_reports_reported` on `reported_user_id`
- `idx_reports_status` on `status`

---

## 🔧 Database Helper Functions

### 1. Check if Users are Matched

```sql
SELECT are_users_matched(
  '123e4567-e89b-12d3-a456-426614174000',
  '987e6543-e21b-12d3-a456-426614174999'
);
-- Returns: true or false
```

### 2. Get User Match Count

```sql
SELECT get_user_match_count('123e4567-e89b-12d3-a456-426614174000');
-- Returns: 12 (number of active matches)
```

### 3. Get User Report Count

```sql
SELECT get_user_report_count('123e4567-e89b-12d3-a456-426614174000');
-- Returns: 2 (number of pending/reviewed reports)
```

### 4. Check if User is Blocked

```sql
SELECT is_user_blocked(
  'blocker-uuid',
  'blocked-uuid'
);
-- Returns: true or false
```

---

## 🚀 Frontend Integration Guide

### 1. Fetch Recommendations (Infinite Scroll)

```typescript
import { useState, useEffect } from 'react';

const useRecommendations = (userId: string) => {
  const [profiles, setProfiles] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRecommendations = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/recommendations?userId=${userId}&page=${page}&limit=20`
      );
      const data = await response.json();

      setProfiles((prev) => [...prev, ...data.recommendations]);
      setHasMore(data.hasMore);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  return { profiles, fetchRecommendations, hasMore, isLoading };
};
```

### 2. Handle Swipe Actions

```typescript
const handleSwipe = async (
  swiperId: string,
  targetId: string,
  action: 'like' | 'skip'
) => {
  try {
    const response = await fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ swiperId, targetId, action }),
    });

    const data = await response.json();

    if (data.isMatch) {
      // Show match modal/notification
      showMatchNotification(targetId);
    }

    // Remove profile from feed
    removeProfileFromFeed(targetId);
  } catch (error) {
    console.error('Swipe failed:', error);
  }
};

// Usage
<button onClick={() => handleSwipe(currentUserId, profileId, 'like')}>
  ❤️ Like
</button>

<button onClick={() => handleSwipe(currentUserId, profileId, 'skip')}>
  ⏭️ Skip
</button>
```

### 3. Example React Component

```typescript
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RecommendationFeed({ userId }: { userId: string }) {
  const { profiles, fetchRecommendations, hasMore, isLoading } = useRecommendations(userId);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentProfile = profiles[currentIndex];

  const handleLike = async () => {
    await handleSwipe(userId, currentProfile.userId, 'like');
    setCurrentIndex((prev) => prev + 1);
    
    // Load more when approaching end
    if (currentIndex >= profiles.length - 5 && hasMore) {
      fetchRecommendations();
    }
  };

  const handleSkip = async () => {
    await handleSwipe(userId, currentProfile.userId, 'skip');
    setCurrentIndex((prev) => prev + 1);
    
    if (currentIndex >= profiles.length - 5 && hasMore) {
      fetchRecommendations();
    }
  };

  if (!currentProfile) {
    return (
      <div className="text-center py-12">
        <h3>No more profiles to show</h3>
        <p>Check back later for new recommendations!</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <AnimatePresence>
        <motion.div
          key={currentProfile.id}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6"
        >
          {/* Avatar */}
          <div className="text-6xl text-center mb-4">
            {currentProfile.avatar}
          </div>

          {/* Name & Age */}
          <h2 className="text-2xl font-bold text-center mb-2">
            {currentProfile.anonymousName}, {currentProfile.age}
          </h2>

          {/* Verification Badge */}
          {currentProfile.isVerified && (
            <div className="flex justify-center mb-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                ✓ Verified
              </span>
            </div>
          )}

          {/* University */}
          <p className="text-gray-600 text-center mb-2">
            {currentProfile.university} • {currentProfile.faculty}
          </p>

          {/* Match Score */}
          <div className="flex justify-center mb-4">
            <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full">
              Match Score: {currentProfile.matchScore}
            </div>
          </div>

          {/* Shared Interests */}
          {currentProfile.sharedInterests.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Shared Interests:
              </p>
              <div className="flex flex-wrap gap-2">
                {currentProfile.sharedInterests.map((interest) => (
                  <span
                    key={interest}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bio */}
          <p className="text-gray-700 mb-6">{currentProfile.bio}</p>

          {/* All Interests */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-2">Interests:</p>
            <div className="flex flex-wrap gap-2">
              {currentProfile.interests.map((interest) => (
                <span
                  key={interest}
                  className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleSkip}
              className="flex-1 py-4 bg-gray-200 hover:bg-gray-300 rounded-xl font-semibold transition-colors"
            >
              ⏭️ Skip
            </button>
            <button
              onClick={handleLike}
              className="flex-1 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 rounded-xl font-semibold transition-colors"
            >
              ❤️ Like
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress Indicator */}
      <div className="text-center mt-4 text-gray-600">
        Profile {currentIndex + 1} of {profiles.length}
        {hasMore && ' (Loading more...)'}
      </div>
    </div>
  );
}
```

---

## ⚡ Performance Optimizations

### Database Optimizations

1. **Indexes Created:**
   - All foreign keys have indexes
   - Frequently queried columns indexed
   - Composite indexes for complex queries

2. **Query Optimization:**
   - Pagination to limit results
   - Filtering before scoring calculation
   - Batch processing for report counts

3. **Connection Pooling:**
   - Use Supabase connection pooling
   - Reuse Supabase client instances

### Frontend Optimizations

1. **Infinite Scroll:**
   - Load 20 profiles at a time
   - Fetch next page when approaching end
   - Cache loaded profiles in memory

2. **Image Optimization:**
   - Use emoji avatars (no image loading)
   - Lazy load profile images if added later

3. **State Management:**
   - Use React Query or SWR for caching
   - Optimistic UI updates for swipes

---

## 🧪 Testing Guide

### Test 1: Basic Recommendation Fetch

```bash
# Replace with actual user ID
curl "http://localhost:3000/api/recommendations?userId=YOUR_USER_ID&page=1&limit=5"
```

**Expected:** Returns 5 profiles with match scores, shared interests, etc.

### Test 2: Like Action

```bash
curl -X POST http://localhost:3000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "swiperId": "USER_ID_1",
    "targetId": "USER_ID_2",
    "action": "like"
  }'
```

**Expected:** Returns `{ success: true, action: "like", isMatch: false }`

### Test 3: Mutual Match

```bash
# User 1 likes User 2
curl -X POST http://localhost:3000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{ "swiperId": "USER_1", "targetId": "USER_2", "action": "like" }'

# User 2 likes User 1
curl -X POST http://localhost:3000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{ "swiperId": "USER_2", "targetId": "USER_1", "action": "like" }'
```

**Expected:** Second request returns `{ isMatch: true }` and creates match record.

### Test 4: Skip Action

```bash
curl -X POST http://localhost:3000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "swiperId": "USER_ID_1",
    "targetId": "USER_ID_2",
    "action": "skip"
  }'
```

**Expected:** Profile won't appear in future recommendations for USER_1.

### Test 5: Pagination

```bash
# Page 1
curl "http://localhost:3000/api/recommendations?userId=USER_ID&page=1&limit=10"

# Page 2
curl "http://localhost:3000/api/recommendations?userId=USER_ID&page=2&limit=10"
```

**Expected:** Different profiles on each page, `hasMore` indicates if more pages exist.

---

## 🔐 Security Considerations

### Current Implementation

1. ✅ UUID validation for user IDs
2. ✅ Prevents self-swiping
3. ✅ Mutual blocking (both ways)
4. ✅ Row Level Security on database tables
5. ✅ Zod validation for all inputs

### TODO: Add Authentication

```typescript
// Add to recommendation API
import { verifyJWT } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // Verify JWT token
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  const payload = await verifyJWT(token);

  if (!payload || !payload.userId) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // Ensure userId in query matches JWT userId
  const queryUserId = searchParams.get('userId');
  if (queryUserId !== payload.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Continue with recommendation logic...
}
```

---

## 📊 Analytics & Insights

### Useful Queries

**Top Matched Users:**
```sql
SELECT 
  u.username,
  COUNT(*) as match_count
FROM matches m
JOIN users u ON (u.id = m.user1_id OR u.id = m.user2_id)
WHERE m.is_active = TRUE
GROUP BY u.id, u.username
ORDER BY match_count DESC
LIMIT 10;
```

**Most Active Swipers:**
```sql
SELECT 
  u.username,
  COUNT(*) as swipe_count,
  COUNT(CASE WHEN s.action = 'like' THEN 1 END) as like_count,
  COUNT(CASE WHEN s.action = 'skip' THEN 1 END) as skip_count
FROM swipes s
JOIN users u ON u.id = s.swiper_user_id
GROUP BY u.id, u.username
ORDER BY swipe_count DESC
LIMIT 10;
```

**Match Rate by University:**
```sql
SELECT 
  p.university,
  COUNT(DISTINCT m.id) as match_count,
  COUNT(DISTINCT p.user_id) as user_count,
  ROUND(COUNT(DISTINCT m.id)::numeric / COUNT(DISTINCT p.user_id), 2) as matches_per_user
FROM profiles p
LEFT JOIN matches m ON (m.user1_id = p.user_id OR m.user2_id = p.user_id)
GROUP BY p.university
ORDER BY matches_per_user DESC;
```

---

## 🚀 Deployment Checklist

- [ ] Run migration: `database/migration_recommendation_system.sql`
- [ ] Enable RLS on all new tables
- [ ] Set up indexes for performance
- [ ] Add JWT authentication to API endpoints
- [ ] Configure rate limiting for swipe actions
- [ ] Set up match notification system (email/push)
- [ ] Add analytics tracking
- [ ] Test infinite scroll on mobile devices
- [ ] Optimize database queries with EXPLAIN ANALYZE
- [ ] Add error logging and monitoring

---

## 📁 File Structure

```
ghosty/
├── app/
│   └── api/
│       └── recommendations/
│           └── route.ts              # ✨ NEW: Recommendation API
├── database/
│   └── migration_recommendation_system.sql  # ✨ NEW: Schema migration
└── RECOMMENDATION_SYSTEM_GUIDE.md   # ✨ NEW: This documentation
```

---

## 💡 Future Enhancements

1. **Machine Learning Integration**
   - Train model on successful matches
   - Predict match likelihood
   - Personalized weight adjustments

2. **Advanced Filters**
   - Distance-based matching (geolocation)
   - Activity level (last seen)
   - Response rate

3. **Boost System**
   - Premium users get higher visibility
   - Temporary profile boosts
   - Featured profiles section

4. **Icebreakers**
   - Suggest conversation starters
   - Question-based matching
   - Compatibility quizzes

5. **Video Verification**
   - Live video verification
   - Profile video clips
   - Video call matching

---

## 🆘 Troubleshooting

**Issue:** No recommendations returned
- **Check:** User has completed profile with preferences set
- **Check:** There are other users matching the criteria
- **Check:** User hasn't swiped on all available profiles

**Issue:** Match not detected
- **Check:** Both users have liked each other
- **Check:** `matches` table has unique constraint
- **Check:** Database trigger is active

**Issue:** Performance slow with many users
- **Check:** Indexes are created on all foreign keys
- **Check:** Use pagination (don't fetch all at once)
- **Check:** Consider caching frequently accessed data

---

**System Ready! 🚀**
