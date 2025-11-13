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

// Calculate match score based on weighted criteria
function calculateMatchScore(
  candidate: any,
  prefs: {
    age_min: number;
    age_max: number;
    education_levels: string[];
    height_pref: { type: string; value_cm?: number };
    hometown?: string;
    skin_tone?: string;
  }
): number {
  let score = 0;

  // Age Range (30 points)
  if (candidate.age >= prefs.age_min && candidate.age <= prefs.age_max) {
    score += 30;
  }

  // Education Level (25 points)
  if (prefs.education_levels && candidate.degree_type && prefs.education_levels.includes(candidate.degree_type)) {
    score += 25;
  }

  // Height Match (15 points)
  const heightPref = prefs.height_pref;
  if (heightPref && candidate.height_cm) {
    if (heightPref.type === 'less' && heightPref.value_cm && candidate.height_cm < heightPref.value_cm) {
      score += 15;
    } else if (heightPref.type === 'greater' && heightPref.value_cm && candidate.height_cm > heightPref.value_cm) {
      score += 15;
    } else if (heightPref.type === 'no preference' || heightPref.type === 'no_preference') {
      score += 15;
    }
  } else if (!heightPref || heightPref.type === 'no preference' || heightPref.type === 'no_preference') {
    score += 15;
  }

  // Hometown Match (15 points) - Case-insensitive partial match
  if (prefs.hometown && candidate.hometown) {
    const prefHometown = prefs.hometown.toLowerCase();
    const candHometown = candidate.hometown.toLowerCase();
    if (candHometown.includes(prefHometown) || prefHometown.includes(candHometown)) {
      score += 15;
    }
  }

  // Skin Tone Match (15 points)
  if (prefs.skin_tone && candidate.skin_tone === prefs.skin_tone) {
    score += 15;
  }

  return score;
}

// GET: Fetch personalized recommendation feed with weighted scoring
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

    // Step 1: Get viewer's profile and gender from profiles table (fallback to users if needed)
    const { data: viewerProfile, error: viewerError } = await supabaseAdmin
      .from('profiles')
      .select('gender, user_id, age, height_cm, degree_type')
      .eq('user_id', userId)
      .single();

    let viewerGender: string | null = null;
    if (viewerProfile && !viewerError) {
      viewerGender = viewerProfile.gender ?? null;
    } else {
      // Fallback to users table for gender if profile is missing
      const { data: viewerUserRow } = await supabaseAdmin
        .from('users')
        .select('gender')
        .eq('id', userId)
        .single();
      viewerGender = (viewerUserRow as any)?.gender ?? null;
    }

    // Get viewer's partner preferences from users table
    const { data: viewerUser, error: prefError } = await supabaseAdmin
      .from('users')
      .select('partner_preferences_json')
      .eq('id', userId)
      .single();

    // If preferences missing, build a sensible default from query params
    let prefs: any = undefined;
    if (!prefError && viewerUser && (viewerUser as any).partner_preferences_json) {
      prefs = (viewerUser as any).partner_preferences_json;
    } else {
      // Defaults: use query minAge/maxAge if provided, otherwise broad range
      const ageMin = validation.data.minAge ?? 18;
      const ageMax = validation.data.maxAge ?? 100;
      prefs = {
        age_min: ageMin,
        age_max: ageMax,
        education_levels: [],
        height_pref: { type: 'no_preference' },
        hometown: '',
        skin_tone: '',
      };
    }

    // Step 2: Get blocked user IDs to exclude
    const { data: blockedUsers } = await supabaseAdmin
      .from('blocks')
      .select('blocked_user_id')
      .eq('blocker_user_id', userId);

    const blockedIds = blockedUsers?.map((b: any) => b.blocked_user_id) || [];

    // Get users who blocked the viewer
    const { data: blockedByUsers } = await supabaseAdmin
      .from('blocks')
      .select('blocker_user_id')
      .eq('blocked_user_id', userId);

    const blockedByIds = blockedByUsers?.map((b: any) => b.blocker_user_id) || [];

    // Get users already interacted with (swipes)
    let interactedUserIds: string[] = [];
    try {
      const { data: interactions } = await supabaseAdmin
        .from('swipes')
        .select('target_user_id')
        .eq('swiper_user_id', userId);
      interactedUserIds = interactions?.map((interaction) => interaction.target_user_id) || [];
    } catch (error) {
      console.log('Swipes table not found, skipping interaction filter');
    }

    // Combine all excluded user IDs
    const excludedUserIds = [...new Set([...blockedIds, ...blockedByIds, ...interactedUserIds, userId])];

    // Step 3: Fetch opposite gender candidates with complete profiles from profiles table
    let query = supabaseAdmin
      .from('profiles')
      .select(`
        user_id,
        age,
        height_cm,
        university,
        faculty,
        degree_type,
        hometown,
        skin_tone,
        bio,
        gender,
        verified,
        anonymous_name,
        real_name
      `)
      .not('gender', 'is', null);

    // Apply opposite gender filter only if viewer gender is known
    if (viewerGender) {
      query = query.neq('gender', viewerGender);
    }

    // Exclude blocked and interacted users
    if (excludedUserIds.length > 0) {
      query = query.not('user_id', 'in', `(${excludedUserIds.join(',')})`);
    }

    // Fetch candidates
    const { data: candidates, error: candidatesError } = await query;

    if (candidatesError) {
      console.error('Error fetching candidates:', candidatesError);
      return NextResponse.json({ 
        error: 'Failed to fetch recommendations' 
      }, { status: 500 });
    }

    if (!candidates || candidates.length === 0) {
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

    // Step 4: Get user details for candidates
    const candidateUserIds = candidates.map(c => c.user_id);
    const { data: candidateUsers } = await supabaseAdmin
      .from('users')
      .select('id, username, full_name, is_restricted, verification_status')
      .in('id', candidateUserIds)
      .eq('is_restricted', false);

    const userMap = new Map(candidateUsers?.map(u => [u.id, u]) || []);

    // Filter out restricted users
    const validCandidates = candidates.filter(c => userMap.has(c.user_id));

    // Step 5: Calculate match scores using weighted algorithm
    const scoredMatches = validCandidates.map((candidate: any) => {
      const user = userMap.get(candidate.user_id);
      
      // Calculate weighted match score
      const matchScore = calculateMatchScore(candidate, prefs);

      // Generate avatar emoji based on gender
      let avatar = '👤';
      if (candidate.gender) {
        if (candidate.gender.toLowerCase() === 'male') avatar = '🧑';
        else if (candidate.gender.toLowerCase() === 'female') avatar = '👩';
        else avatar = '🙋';
      }

      return {
        id: candidate.user_id,
        userId: candidate.user_id,
        anonymousName: candidate.anonymous_name || user?.username || 'Anonymous',
        realName: candidate.real_name || candidate.anonymous_name || user?.username || 'Anonymous',
        avatar,
        age: candidate.age,
        gender: candidate.gender || 'Not specified',
        university: candidate.university || 'University',
        faculty: candidate.faculty || 'Not specified',
        bio: candidate.bio || 'No bio yet',
        height: candidate.height_cm,
        degree: candidate.degree_type,
        hometown: candidate.hometown,
        skinTone: candidate.skin_tone,
        interests: [],
        isVerified: candidate.verified || user?.verification_status === 'verified',
        verificationStatus: user?.verification_status || 'unverified',
        matchScore,
        sharedInterests: [],
        totalReports: 0,
        isLiked: false,
        isSkipped: false,
      };
    });

    // Step 6: Sort by match score (highest first)
    scoredMatches.sort((a, b) => b.matchScore - a.matchScore);

    const validMatches = scoredMatches;

    // Step 7: Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedMatches = validMatches.slice(startIndex, endIndex);

    // Step 8: Check if users were already liked/skipped (in case of cache issues)
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
