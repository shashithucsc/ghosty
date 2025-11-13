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
// GET /api/profile/[userId] - Get user profile
// =============================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: paramUserId } = await params;
    const validatedParams = UserIdSchema.parse({ userId: paramUserId });
    const { userId } = validatedParams;

    // Get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, birthday, gender, report_count, verification_status, registration_type, bio, university_name, faculty, preferences, partner_preferences, created_at')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('Error fetching user:', userError);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }

    // Calculate age from birthday
    let age = null;
    if (user.birthday) {
      const birthDate = new Date(user.birthday);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    } else if (profile?.dob) {
      const birthDate = new Date(profile.dob);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    // Check if user is verified
    const isVerified = user.verification_status === 'verified' || profile?.verified === true;

    // Base response (available for all users)
    const baseProfile = {
      id: user.id,
      username: user.username,
      age: age,
      reportCount: user.report_count || profile?.total_reports || 0,
      isVerified: isVerified,
      registrationType: user.registration_type,
      avatar: profile?.anonymous_avatar_url || '👤',
      anonymousName: profile?.anonymous_name || user.username,
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
      // Personal info
      realName: profile?.real_name || user.username,
      gender: user.gender || profile?.gender,
      bio: user.bio || profile?.bio,
      
      // Education info
      university: user.university_name || profile?.university,
      faculty: user.faculty || profile?.faculty,
      
      // Preferences (parsed if JSON string)
      preferences: user.preferences ? 
        (typeof user.preferences === 'string' ? JSON.parse(user.preferences) : user.preferences) : null,
      partnerPreferences: user.partner_preferences ?
        (typeof user.partner_preferences === 'string' ? JSON.parse(user.partner_preferences) : user.partner_preferences) : null,
      
      // Additional profile data
      verificationType: profile?.verification_type || user.verification_status,
      isPublic: profile?.public !== false,
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
