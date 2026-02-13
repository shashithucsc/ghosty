import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import {
  generateAnonymousName,
  generateAvatar,
  calculateAge,
  isValidDateOfBirth,
  sanitizeInput,
} from '@/lib/utils/helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      realName,
      dateOfBirth,
      gender,
      university,
      faculty,
      bio,
      interests,
      preferencesAgeMin,
      preferencesAgeMax,
      preferencesGender,
      preferencesInterests,
      preferencesHopes,
    } = body;

    // Validate required fields
    if (!userId || !realName || !dateOfBirth || !gender || !university || !faculty || !bio) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Verify user exists in users_v2
    const { data: user, error: userError } = await supabaseAdmin
      .from('users_v2')
      .select('id, email_verified')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.email_verified) {
      return NextResponse.json(
        { error: 'Email must be verified before creating profile' },
        { status: 403 }
      );
    }

    // Check if profile already exists in profiles_v2
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles_v2')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Profile already exists for this user' },
        { status: 409 }
      );
    }

    // Validate date of birth
    const dobValidation = isValidDateOfBirth(dateOfBirth);
    if (!dobValidation.valid) {
      return NextResponse.json(
        { error: dobValidation.message },
        { status: 400 }
      );
    }

    // Validate gender
    const validGenders = ['Male', 'Female', 'Non-binary', 'Other'];
    if (!validGenders.includes(gender)) {
      return NextResponse.json(
        { error: 'Invalid gender value' },
        { status: 400 }
      );
    }

    // Validate bio length
    if (bio.length < 20 || bio.length > 500) {
      return NextResponse.json(
        { error: 'Bio must be between 20 and 500 characters' },
        { status: 400 }
      );
    }

    // Validate age preferences
    if (preferencesAgeMin < 18 || preferencesAgeMax > 100 || preferencesAgeMin > preferencesAgeMax) {
      return NextResponse.json(
        { error: 'Invalid age preference range' },
        { status: 400 }
      );
    }

    // Calculate age
    const age = calculateAge(dateOfBirth);

    // Generate anonymous name (ensure uniqueness in profiles_v2)
    let anonymousName = generateAnonymousName();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const { data: existingName } = await supabaseAdmin
        .from('profiles_v2')
        .select('user_id')
        .eq('anonymous_name', anonymousName)
        .single();

      if (!existingName) {
        isUnique = true;
      } else {
        anonymousName = generateAnonymousName();
        attempts++;
      }
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: 'Failed to generate unique anonymous name. Please try again.' },
        { status: 500 }
      );
    }

    // Generate avatar based on gender
    const avatar = generateAvatar(gender);

    // Sanitize text inputs
    const sanitizedData = {
      realName: sanitizeInput(realName),
      university: sanitizeInput(university),
      faculty: sanitizeInput(faculty),
      bio: sanitizeInput(bio),
      preferencesHopes: preferencesHopes ? sanitizeInput(preferencesHopes) : '',
    };

    // Update users_v2 with private identity data
    const { error: userUpdateError } = await supabaseAdmin
      .from('users_v2')
      .update({
        full_name: sanitizedData.realName,
        birthday: dateOfBirth,
        gender: gender,
        university_name: sanitizedData.university,
        faculty: sanitizedData.faculty,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (userUpdateError) {
      console.error('Error updating user:', userUpdateError);
      return NextResponse.json(
        { error: 'Failed to update user data' },
        { status: 500 }
      );
    }

    // Create profile in profiles_v2 (public anonymous persona)
    const { data: newProfile, error: createError } = await supabaseAdmin
      .from('profiles_v2')
      .insert({
        user_id: userId,
        anonymous_name: anonymousName,
        anonymous_avatar_url: avatar,
        bio: sanitizedData.bio,
        age: age,
        public: true,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating profile:', createError);
      return NextResponse.json(
        { error: 'Failed to create profile' },
        { status: 500 }
      );
    }

    // Return profile (excluding sensitive info)
    const profileData = {
      userId: newProfile.user_id,
      anonymousName: newProfile.anonymous_name,
      avatar: newProfile.anonymous_avatar_url,
      age: newProfile.age,
      bio: newProfile.bio,
      profileCompleted: true,
      createdAt: newProfile.created_at,
    };

    return NextResponse.json(
      {
        message: 'Profile created successfully!',
        profile: profileData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Profile creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve profile by user ID (V2)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { data: profile, error } = await supabaseAdmin
      .from('profiles_v2')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Get verification status from users_v2
    const { data: user } = await supabaseAdmin
      .from('users_v2')
      .select('verification_status')
      .eq('id', userId)
      .single();

    // Return profile (public data only)
    const profileData = {
      userId: profile.user_id,
      anonymousName: profile.anonymous_name,
      avatar: profile.anonymous_avatar_url,
      age: profile.age,
      bio: profile.bio,
      heightCm: profile.height_cm,
      skinTone: profile.skin_tone,
      degreeType: profile.degree_type,
      hometown: profile.hometown,
      isVerified: user?.verification_status === 'verified',
      totalReports: profile.total_reports,
      isPublic: profile.public,
      createdAt: profile.created_at,
    };

    return NextResponse.json({ profile: profileData }, { status: 200 });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
