import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Initialize Supabase client with service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// =============================================
// ZOD VALIDATION SCHEMAS
// =============================================

const UserIdSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
});

// =============================================
// GET /api/profile/[userId] - Get user profile (V2)
// =============================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: paramUserId } = await params;
    const validatedParams = UserIdSchema.parse({ userId: paramUserId });
    const { userId } = validatedParams;

    // Get user data from users_v2 (verification status, registration type)
    const { data: user, error: userError } = await supabase
      .from('users_v2')
      .select('id, username, verification_status, registration_type, created_at')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('Error fetching user:', userError);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get profile data from profiles_v2 (all public display data)
    const { data: profile, error: profileError } = await supabase
      .from('profiles_v2')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Check if user is verified
    const isVerified = user.verification_status === 'verified';

    // Base response (available for all users)
    const baseProfile = {
      id: user.id,
      username: user.username,
      age: profile.age || null,
      reportCount: profile.total_reports || 0,
      isVerified: isVerified,
      registrationType: user.registration_type,
      avatar: profile.anonymous_avatar_url || '👤',
      anonymousName: profile.anonymous_name || user.username,
      // Include profile display fields
      degree_type: profile.degree_type || null,
      height_cm: profile.height_cm || null,
      hometown: profile.hometown || null,
      skin_tone: profile.skin_tone || null,
    };

    // If user is unverified (simple registration), return limited data
    if (!isVerified) {
      return NextResponse.json({
        success: true,
        profile: baseProfile,
        limited: true,
      });
    }

    // If verified, return full profile details
    const fullProfile = {
      ...baseProfile,
      bio: profile.bio || '',
      isPublic: profile.public !== false,
      memberSince: user.created_at,
    };

    return NextResponse.json({
      success: true,
      profile: fullProfile,
      limited: false,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error in GET /api/profile/[userId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
