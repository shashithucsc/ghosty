import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/client';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Validation schema
const SetupProfileSchema = z.object({
  qualifications: z.object({
    height_cm: z.number().min(100).max(250).nullable(),
    university: z.string().nullable(),
    degree: z.string().nullable(),
    hometown: z.string().nullable(),
    age: z.number().min(18).max(100),
    skin_tone: z.string().nullable(),
  }),
  partner_preferences: z.object({
    age_min: z.number().min(18).max(100),
    age_max: z.number().min(18).max(100),
    education_levels: z.array(z.string()).min(1),
    height_pref: z
      .object({
        type: z.enum(['less', 'greater']),
        value_cm: z.number().min(100).max(250),
      })
      .nullable(),
    hometown: z.string().nullable(),
    skin_tone: z.string().nullable(),
  }),
});

// Auth helper
function verifyToken(request: NextRequest): { userId: string } | null {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    return { userId: decoded.userId };
  } catch (error) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = verifyToken(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const { userId } = auth;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = SetupProfileSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { qualifications, partner_preferences } = validationResult.data;

    // Validate age range logic
    if (partner_preferences.age_min >= partner_preferences.age_max) {
      return NextResponse.json(
        { error: 'Minimum age must be less than maximum age' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: existingUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update users table with partner preferences
    const { error: userUpdateError } = await (supabaseAdmin as any)
      .from('users')
      .update({
        partner_preferences_json: partner_preferences,
      })
      .eq('id', userId);

    if (userUpdateError) {
      console.error('Error updating user preferences:', userUpdateError);
      return NextResponse.json(
        { error: 'Failed to save partner preferences' },
        { status: 500 }
      );
    }

    // Get user's username for anonymous_name
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('username')
      .eq('id', userId)
      .single();

    // Upsert profile (insert or update)
    const profileData: any = {
      user_id: userId,
      anonymous_name: userData?.username || `User${userId.slice(0, 8)}`,
      age: qualifications.age,
    };
    
    // Add optional fields only if provided
    if (qualifications.height_cm) profileData.height_cm = qualifications.height_cm;
    if (qualifications.university) profileData.university = qualifications.university;
    if (qualifications.degree) profileData.degree_type = qualifications.degree;
    if (qualifications.hometown) profileData.hometown = qualifications.hometown;
    if (qualifications.skin_tone) profileData.skin_tone = qualifications.skin_tone;

    const { data: profile, error: profileError } = await (supabaseAdmin as any)
      .from('profiles')
      .upsert(profileData, { onConflict: 'user_id' })
      .select()
      .single();

    if (profileError) {
      console.error('Error upserting profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to save profile data' },
        { status: 500 }
      );
    }

    // Return sanitized profile (exclude sensitive data)
    const sanitizedProfile = {
      user_id: profile.user_id,
      height_cm: profile.height_cm,
      university: profile.university,
      degree_type: profile.degree_type,
      hometown: profile.hometown,
      age: profile.age,
      skin_tone: profile.skin_tone,
      bio: profile.bio,
    };

    return NextResponse.json(
      {
        message: 'Profile and preferences saved successfully',
        profile: sanitizedProfile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Setup profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
