import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// Zod schema for query parameters
const RecommendationQuerySchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  filterUniversity: z.enum(['true', 'false']).nullable().optional(),
  filterFaculty: z.enum(['true', 'false']).nullable().optional(),
  minAge: z.coerce.number().int().min(18).nullable().optional(),
  maxAge: z.coerce.number().int().max(100).nullable().optional(),
  universities: z.string().nullable().optional(),
  interests: z.string().nullable().optional(),
});

interface Profile {
  id: string;
  user_id: string;
  anonymous_name: string;
  avatar: string;
  age: number;
  gender: string;
  university: string;
  faculty: string;
  bio: string;
  interests: string[];
  is_verified: boolean;
  preferences_age_min: number;
  preferences_age_max: number;
  preferences_gender: string[];
  preferences_interests: string[];
  preferences_hopes: string;
  created_at: string;
  user?: {
    verification_status: string;
  };
}

interface RecommendedProfile {
  id: string;
  userId: string;
  anonymousName: string;
  avatar: string;
  age: number;
  gender: string;
  university: string;
  faculty: string;
  bio: string;
  interests: string[];
  isVerified: boolean;
  verificationStatus: string;
  matchScore: number;
  sharedInterests: string[];
  totalReports: number;
  isLiked: boolean;
  isSkipped: boolean;
}

// GET: Fetch personalized recommendation feed
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const queryParams = {
      userId: searchParams.get('userId') || '',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      filterUniversity: searchParams.get('filterUniversity') || null,
      filterFaculty: searchParams.get('filterFaculty') || null,
      minAge: searchParams.get('minAge') || null,
      maxAge: searchParams.get('maxAge') || null,
      universities: searchParams.get('universities') || null,
      interests: searchParams.get('interests') || null,
    };

    const validation = RecommendationQuerySchema.safeParse(queryParams);

    if (!validation.success) {
      console.error('Validation error:', validation.error.issues);
      return NextResponse.json({ 
        error: 'Invalid query parameters',
        details: validation.error.issues 
      }, { status: 400 });
    }

    const { userId, page, limit, filterUniversity, filterFaculty, minAge, maxAge } = validation.data;

    // Step 1: Get current user's data
    const { data: currentUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Step 2: Get users who current user already liked or skipped (if swipes table exists)
    let interactedUserIds: string[] = [];
    try {
      const { data: interactions } = await supabaseAdmin
        .from('swipes')
        .select('target_user_id, action')
        .eq('swiper_user_id', userId);
      interactedUserIds = interactions?.map((interaction) => interaction.target_user_id) || [];
    } catch (error) {
      // Swipes table might not exist yet, continue without filtering
      console.log('Swipes table not found, skipping interaction filter');
    }

    // Get current user's gender for opposite gender filtering
    const currentUserGender = currentUser.gender;

    // Step 3: Build query for potential matches from users table
    // Recommendation logic:
    // - Show only users with opposite gender
    // - Exclude restricted users
    // - Exclude current user
    // - Sort by preference similarity later
    let query = supabaseAdmin
      .from('users')
      .select('id, username, full_name, birthday, gender, university_name, faculty, bio, preferences, partner_preferences, verification_status, is_restricted, report_count, created_at')
      .neq('id', userId) // Exclude current user
      .eq('is_restricted', false); // Exclude restricted users

    // Filter by opposite gender
    if (currentUserGender) {
      if (currentUserGender.toLowerCase() === 'male') {
        query = query.eq('gender', 'Female');
      } else if (currentUserGender.toLowerCase() === 'female') {
        query = query.eq('gender', 'Male');
      }
    }

    // Exclude already interacted users
    if (interactedUserIds.length > 0) {
      query = query.not('id', 'in', `(${interactedUserIds.join(',')})`);
    }

    // Calculate age from birthday and filter
    // Since we can't calculate age in SQL easily, we'll filter after fetching
    
    // Filter by age range - only if minAge or maxAge is provided
    const ageMin = minAge ?? 18;
    const ageMax = maxAge ?? 100;
    
    if (ageMin > 18 || ageMax < 100) {
      const today = new Date();
      const maxBirthday = new Date(today.getFullYear() - ageMin, today.getMonth(), today.getDate());
      const minBirthday = new Date(today.getFullYear() - ageMax, today.getMonth(), today.getDate());
      
      query = query.gte('birthday', minBirthday.toISOString().split('T')[0])
                   .lte('birthday', maxBirthday.toISOString().split('T')[0]);
    }

    // Optional: Filter by university
    if (filterUniversity === 'true' && currentUser.university_name) {
      query = query.eq('university_name', currentUser.university_name);
    }

    // Optional: Filter by faculty
    if (filterFaculty === 'true' && currentUser.faculty) {
      query = query.eq('faculty', currentUser.faculty);
    }

    // Limit results
    query = query.limit(limit * 2); // Fetch more to account for filtering

    // Fetch potential matches
    const { data: potentialMatches, error: matchesError } = await query;

    if (matchesError) {
      console.error('Error fetching potential matches:', matchesError);
      return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
    }

    if (!potentialMatches || potentialMatches.length === 0) {
      return NextResponse.json(
        {
          recommendations: [],
          page,
          limit,
          total: 0,
          hasMore: false,
        },
        { status: 200 }
      );
    }

    // Step 4: Calculate ages and transform to recommended profiles
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

    const currentUserAge = currentUser.birthday ? calculateAge(currentUser.birthday) : 25;

    const scoredMatches = potentialMatches.map((user: any) => {
      const age = user.birthday ? calculateAge(user.birthday) : 25;
      
      // Calculate match score based on preference similarity
      let matchScore = 50; // Base score

      // Bonus for verified users
      if (user.verification_status === 'verified') {
        matchScore += 20;
      }

      // Bonus for same university
      if (user.university_name && currentUser.university_name && 
          user.university_name === currentUser.university_name) {
        matchScore += 10;
      }

      // Bonus for same faculty
      if (user.faculty && currentUser.faculty && 
          user.faculty === currentUser.faculty) {
        matchScore += 5;
      }

      // Preference similarity scoring
      const userPrefs = user.partner_preferences || user.preferences;
      const currentUserPrefs = currentUser.partner_preferences || currentUser.preferences;
      
      if (userPrefs && currentUserPrefs) {
        // Simple text similarity for preferences
        const userPrefsText = (typeof userPrefs === 'string' ? userPrefs : JSON.stringify(userPrefs)).toLowerCase();
        const currentPrefsText = (typeof currentUserPrefs === 'string' ? currentUserPrefs : JSON.stringify(currentUserPrefs)).toLowerCase();
        
        // Count common words as a basic similarity measure
        const userWords = userPrefsText.split(/\s+/);
        const currentWords = currentPrefsText.split(/\s+/);
        const commonWords = userWords.filter(word => currentWords.includes(word) && word.length > 3).length;
        
        matchScore += Math.min(commonWords * 2, 15); // Max 15 points from preference similarity
      }

      // Penalty for reported users
      if (user.report_count && user.report_count > 0) {
        matchScore -= user.report_count * 5;
      }

      // Ensure score doesn't go negative
      matchScore = Math.max(0, matchScore);

      // Generate avatar emoji based on gender
      let avatar = '👤';
      if (user.gender) {
        if (user.gender.toLowerCase() === 'male') avatar = '🧑';
        else if (user.gender.toLowerCase() === 'female') avatar = '👩';
        else avatar = '🙋';
      }

      return {
        id: user.id,
        userId: user.id,
        anonymousName: user.username,
        avatar,
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

    const validMatches = scoredMatches;

    // Step 7: Sort by match score (highest first)
    validMatches.sort((a, b) => b.matchScore - a.matchScore);

    // Step 8: Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedMatches = validMatches.slice(startIndex, endIndex);

    // Step 9: Check if users were already liked/skipped (in case of cache issues)
    const paginatedUserIds = paginatedMatches.map((match) => match.userId);

    if (paginatedUserIds.length > 0) {
      const { data: existingSwipes } = await supabaseAdmin
        .from('swipes')
        .select('target_user_id, action')
        .eq('swiper_user_id', userId)
        .in('target_user_id', paginatedUserIds);

      const swipeMap = new Map(
        existingSwipes?.map((swipe) => [swipe.target_user_id, swipe.action]) || []
      );

      paginatedMatches.forEach((match) => {
        const swipeAction = swipeMap.get(match.userId);
        if (swipeAction === 'like') {
          match.isLiked = true;
        } else if (swipeAction === 'skip') {
          match.isSkipped = true;
        }
      });
    }

    return NextResponse.json(
      {
        recommendations: paginatedMatches,
        page,
        limit,
        total: validMatches.length,
        hasMore: endIndex < validMatches.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in GET /api/recommendations:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

// POST: Record user action (like/skip)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const ActionSchema = z.object({
      swiperId: z.string().uuid('Invalid swiper ID'),
      targetId: z.string().uuid('Invalid target ID'),
      action: z.enum(['like', 'skip'], { message: 'Action must be "like" or "skip"' }),
    });

    const validation = ActionSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Validation failed';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { swiperId, targetId, action } = validation.data;

    // Prevent self-swiping
    if (swiperId === targetId) {
      return NextResponse.json({ error: 'Cannot swipe on your own profile' }, { status: 400 });
    }

    // Check if swipe already exists
    const { data: existingSwipe } = await supabaseAdmin
      .from('swipes')
      .select('id, action')
      .eq('swiper_user_id', swiperId)
      .eq('target_user_id', targetId)
      .single();

    if (existingSwipe) {
      // Update existing swipe
      const { error: updateError } = await supabaseAdmin
        .from('swipes')
        .update({
          action,
          swiped_at: new Date().toISOString(),
        })
        .eq('id', existingSwipe.id);

      if (updateError) {
        console.error('Error updating swipe:', updateError);
        return NextResponse.json({ error: 'Failed to update swipe' }, { status: 500 });
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Swipe updated successfully',
          action,
          isMatch: false,
        },
        { status: 200 }
      );
    }

    // Insert new swipe
    const { error: insertError } = await supabaseAdmin.from('swipes').insert({
      swiper_user_id: swiperId,
      target_user_id: targetId,
      action,
      swiped_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error('Error inserting swipe:', insertError);
      return NextResponse.json({ error: 'Failed to record swipe' }, { status: 500 });
    }

    // If action is "like", check for mutual match
    let isMatch = false;

    if (action === 'like') {
      const { data: reciprocalSwipe } = await supabaseAdmin
        .from('swipes')
        .select('id')
        .eq('swiper_user_id', targetId)
        .eq('target_user_id', swiperId)
        .eq('action', 'like')
        .single();

      if (reciprocalSwipe) {
        isMatch = true;

        // Create match record
        const { error: matchError } = await supabaseAdmin.from('matches').insert({
          user1_id: swiperId,
          user2_id: targetId,
          matched_at: new Date().toISOString(),
        });

        if (matchError) {
          console.error('Error creating match:', matchError);
          // Don't fail the request if match creation fails
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Profile ${action === 'like' ? 'liked' : 'skipped'} successfully`,
        action,
        isMatch,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/recommendations:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
