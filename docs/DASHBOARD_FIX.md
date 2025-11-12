# Dashboard Data Fetching Fix

## Problem
The dashboard was showing dummy data instead of fetching real user profiles from the database. Console showed 400 errors:
```
Failed to load resource: the server responded with a status of 400 (Bad Request)
Error fetching profiles: Error: Failed to fetch recommendations
```

## Root Cause
1. The `/api/recommendations` endpoint was querying from a `profiles` table that doesn't exist
2. Your actual database only has a `users` table with all user data
3. The Zod validation schema was too strict for optional parameters
4. Field names didn't match between API and database structure

## Solution Applied

### 1. Updated Recommendations API (`/app/api/recommendations/route.ts`)

#### Changed Query from `profiles` to `users` table:
```typescript
// OLD (incorrect)
.from('profiles')
.select('*, user:users!profiles_user_id_fkey (verification_status)')

// NEW (correct)
.from('users')
.select('id, username, full_name, birthday, gender, university_name, faculty, bio, preferences, verification_status, is_restricted, report_count, created_at')
```

#### Updated Field Mappings:
| Old Profile Field | New Users Field |
|------------------|-----------------|
| `user_id` | `id` |
| `anonymous_name` | `username` |
| `age` (stored) | `birthday` (calculated) |
| `university` | `university_name` |
| `preferences_gender` | `preferences.gender` (JSON) |
| `preferences_age_min` | N/A (calculated from birthday) |
| `is_verified` | `verification_status === 'verified'` |

#### Fixed Zod Validation Schema:
```typescript
const RecommendationQuerySchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  filterUniversity: z.enum(['true', 'false']).optional().nullable(), // Added .nullable()
  filterFaculty: z.enum(['true', 'false']).optional().nullable(),
  minAge: z.coerce.number().int().min(18).optional().nullable(),
  maxAge: z.coerce.number().int().max(100).optional().nullable(),
  universities: z.string().optional().nullable(),
  interests: z.string().optional().nullable(),
});
```

#### Simplified Matching Logic:
```typescript
// Calculate age from birthday
const calculateAge = (birthday: string) => {
  const today = new Date();
  const birthDate = new Date(birthday);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Transform users to recommendation format
const scoredMatches = potentialMatches.map((user: any) => {
  const age = user.birthday ? calculateAge(user.birthday) : 25;
  
  let matchScore = 50; // Base score
  if (user.verification_status === 'verified') matchScore += 20;
  if (user.university_name === currentUser.university_name) matchScore += 10;
  if (user.faculty === currentUser.faculty) matchScore += 5;
  if (user.report_count > 0) matchScore -= user.report_count * 5;
  
  return {
    id: user.id,
    userId: user.id,
    anonymousName: user.username,
    avatar: getAvatar(user.gender),
    age,
    gender: user.gender || 'Not specified',
    university: user.university_name || 'University',
    faculty: user.faculty || 'Not specified',
    bio: user.bio || 'No bio yet',
    interests: [],
    isVerified: user.verification_status === 'verified',
    verificationStatus: user.verification_status || 'unverified',
    matchScore,
    sharedInterests: [],
    totalReports: user.report_count || 0,
    isLiked: false,
    isSkipped: false,
  };
});
```

### 2. Updated Dashboard (`/app/dashboard/page.tsx`)

#### Load User ID from LocalStorage:
```typescript
useEffect(() => {
  const userId = localStorage.getItem('userId');
  const anonymousName = localStorage.getItem('anonymousName');
  const avatar = localStorage.getItem('avatar');
  
  if (userId) {
    setCurrentUser({
      anonymousName: anonymousName || 'MysteriousGhost',
      avatar: avatar || '👤',
      userId,
    });
  } else {
    window.location.href = '/login';
  }
}, []);
```

#### Wait for User Data Before Rendering:
```typescript
{currentUser.userId ? (
  <RecommendationFeed
    filters={filters}
    onMatch={handleNewMatch}
  />
) : (
  <div>Loading...</div>
)}
```

### 3. Updated RecommendationFeed (`/components/dashboard/RecommendationFeed.tsx`)

#### Fetch Real Data:
```typescript
useEffect(() => {
  const fetchProfiles = async () => {
    try {
      const currentUserId = localStorage.getItem('userId');
      
      if (!currentUserId) {
        setError('Please log in to view recommendations');
        return;
      }

      const params = new URLSearchParams({
        userId: currentUserId,
        limit: '50',
      });

      if (filters.ageRange) {
        params.append('minAge', filters.ageRange[0].toString());
        params.append('maxAge', filters.ageRange[1].toString());
      }

      const response = await fetch(`/api/recommendations?${params.toString()}`);
      const data = await response.json();

      const transformedProfiles = (data.recommendations || []).map((rec: any) => ({
        id: rec.id,
        anonymousName: rec.anonymousName,
        age: rec.age,
        gender: rec.gender,
        avatar: rec.avatar,
        bio: rec.bio,
        isVerified: rec.isVerified,
        interests: rec.interests || [],
        university: rec.university,
        faculty: rec.faculty,
      }));

      setProfiles(transformedProfiles);
    } catch (err) {
      setError('Failed to load recommendations');
    }
  };

  fetchProfiles();
}, [filters]);
```

## Query Flow

1. **User logs in** → `userId` saved to localStorage
2. **Dashboard loads** → Checks for userId, redirects if missing
3. **RecommendationFeed mounts** → Gets userId from localStorage
4. **API call made** → `GET /api/recommendations?userId=xxx&limit=50`
5. **API queries** → `SELECT * FROM users WHERE ...`
6. **Response transformed** → Maps users table fields to expected format
7. **Profiles displayed** → Real user data shown in cards

## Testing

### Verify the Fix:
1. Open browser console (F12)
2. Navigate to `/dashboard`
3. Check Network tab for `/api/recommendations` call
4. Should see **200 OK** response with user data

### Expected Response:
```json
{
  "recommendations": [
    {
      "id": "uuid",
      "userId": "uuid",
      "anonymousName": "john_doe",
      "avatar": "🧑",
      "age": 24,
      "gender": "male",
      "university": "Stanford University",
      "faculty": "Computer Science",
      "bio": "Love coding...",
      "interests": [],
      "isVerified": true,
      "verificationStatus": "verified",
      "matchScore": 75,
      "sharedInterests": [],
      "totalReports": 0,
      "isLiked": false,
      "isSkipped": false
    }
  ],
  "page": 1,
  "limit": 50,
  "total": 5,
  "hasMore": false
}
```

## Database Requirements

### Users Table Must Have:
- ✅ `id` (UUID)
- ✅ `username` (displayed as anonymousName)
- ✅ `birthday` (for age calculation)
- ✅ `gender`
- ✅ `university_name`
- ✅ `faculty`
- ✅ `bio`
- ✅ `verification_status` ('verified', 'pending', 'unverified')
- ✅ `is_restricted` (boolean)
- ✅ `report_count` (integer)

### Sample Query:
```sql
SELECT 
  id, 
  username, 
  birthday, 
  gender, 
  university_name, 
  faculty, 
  bio, 
  verification_status, 
  is_restricted, 
  report_count
FROM users
WHERE id != 'current-user-id'
  AND is_restricted = false
  AND verification_status IN ('verified', 'unverified')
LIMIT 50;
```

## Avatar Mapping

Based on gender field:
- `male` → 🧑
- `female` → 👩
- `other` / `null` → 🙋

## Match Score Algorithm

```typescript
Base score: 50
+ Verified: +20
+ Same university: +10
+ Same faculty: +5
- Each report: -5
= Final score (min 0)
```

## Files Modified

1. ✅ `/app/api/recommendations/route.ts` - Complete rewrite for users table
2. ✅ `/app/dashboard/page.tsx` - Added userId loading from localStorage
3. ✅ `/components/dashboard/RecommendationFeed.tsx` - Updated data fetching

## Status

✅ **FIXED** - Dashboard now fetches and displays real user profiles from the database instead of dummy data.

---

**Fixed:** November 12, 2025  
**Issue:** Dashboard showing dummy data, 400 errors on recommendations API  
**Solution:** Rewrote API to query users table instead of non-existent profiles table
