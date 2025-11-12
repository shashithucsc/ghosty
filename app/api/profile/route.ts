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

    // Verify user exists and email is verified
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
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

    // Check if profile already exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
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

    // Generate anonymous name (ensure uniqueness)
    let anonymousName = generateAnonymousName();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const { data: existingName } = await supabaseAdmin
        .from('profiles')
        .select('id')
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

    // Create profile
    const { data: newProfile, error: createError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: userId,
        anonymous_name: anonymousName,
        avatar,
        real_name: sanitizedData.realName,
        date_of_birth: dateOfBirth,
        age,
        gender,
        university: sanitizedData.university,
        faculty: sanitizedData.faculty,
        bio: sanitizedData.bio,
        interests: interests || [],
        is_verified: false,
        preferences_age_min: preferencesAgeMin || 18,
        preferences_age_max: preferencesAgeMax || 35,
        preferences_gender: preferencesGender || [],
        preferences_interests: preferencesInterests || [],
        preferences_hopes: sanitizedData.preferencesHopes,
        profile_completed: true,
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
      id: newProfile.id,
      anonymousName: newProfile.anonymous_name,
      avatar: newProfile.avatar,
      age: newProfile.age,
      gender: newProfile.gender,
      university: newProfile.university,
      faculty: newProfile.faculty,
      bio: newProfile.bio,
      interests: newProfile.interests,
      isVerified: newProfile.is_verified,
      preferences: {
        ageMin: newProfile.preferences_age_min,
        ageMax: newProfile.preferences_age_max,
        gender: newProfile.preferences_gender,
        interests: newProfile.preferences_interests,
        hopes: newProfile.preferences_hopes,
      },
      profileCompleted: newProfile.profile_completed,
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

// GET endpoint to retrieve profile by user ID
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
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Return profile (excluding sensitive real name and DOB)
    const profileData = {
      id: profile.id,
      anonymousName: profile.anonymous_name,
      avatar: profile.avatar,
      age: profile.age,
      gender: profile.gender,
      university: profile.university,
      faculty: profile.faculty,
      bio: profile.bio,
      interests: profile.interests,
      isVerified: profile.is_verified,
      preferences: {
        ageMin: profile.preferences_age_min,
        ageMax: profile.preferences_age_max,
        gender: profile.preferences_gender,
        interests: profile.preferences_interests,
        hopes: profile.preferences_hopes,
      },
      profileCompleted: profile.profile_completed,
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
