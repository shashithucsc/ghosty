import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/users/[userId] - Get user details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Fetch user data from users_v2 and profiles_v2
    const { data: userAuth, error: authError } = await supabase
      .from('users_v2')
      .select('id, gender, verification_status')
      .eq('id', userId)
      .single();

    if (authError || !userAuth) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch anonymous profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles_v2')
      .select('anonymous_name, anonymous_avatar_url, bio, age, height_cm, skin_tone, degree_type, hometown')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Return user data with anonymous persona
    return NextResponse.json({
      success: true,
      user: {
        id: userAuth.id,
        username: profile.anonymous_name, // Anonymous name for privacy
        avatar: profile.anonymous_avatar_url,
        gender: userAuth.gender,
        bio: profile.bio,
        age: profile.age,
        height: profile.height_cm,
        skinTone: profile.skin_tone,
        degree: profile.degree_type,
        hometown: profile.hometown,
        verificationStatus: userAuth.verification_status,
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
