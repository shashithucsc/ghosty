import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

// GET - Fetch full user profile data for editing
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

    // Fetch user data
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, username, email, full_name, birthday, gender, university_name, faculty, bio')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      );
    }

    // Fetch profile data
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
    }

    // Combine user and profile data
    const combinedData = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      fullName: userData.full_name,
      birthday: userData.birthday,
      gender: userData.gender,
      universityName: userData.university_name,
      faculty: userData.faculty,
      bio: userData.bio,
      // Profile data
      anonymousName: profileData?.anonymous_name || '',
      anonymousAvatar: profileData?.anonymous_avatar_url || '👤',
      age: profileData?.age || null,
      heightCm: profileData?.height_cm || null,
      skinTone: profileData?.skin_tone || '',
      degreeType: profileData?.degree_type || '',
      hometown: profileData?.hometown || '',
      isPublic: profileData?.public ?? true,
    };

    return NextResponse.json({ success: true, data: combinedData });
  } catch (error) {
    console.error('Error in GET /api/profile/edit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update user profile data
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      fullName,
      birthday,
      gender,
      universityName,
      faculty,
      bio,
      anonymousName,
      anonymousAvatar,
      heightCm,
      skinTone,
      degreeType,
      hometown,
      isPublic,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Calculate age from birthday
    let age = null;
    if (birthday) {
      const birthDate = new Date(birthday);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    // Update users table
    const { error: userError } = await supabaseAdmin
      .from('users')
      .update({
        full_name: fullName,
        birthday: birthday,
        gender: gender,
        university_name: universityName,
        faculty: faculty,
        bio: bio,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (userError) {
      console.error('Error updating user:', userError);
      return NextResponse.json(
        { error: 'Failed to update user data' },
        { status: 500 }
      );
    }

    // Check if profile exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (existingProfile) {
      // Update existing profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({
          anonymous_name: anonymousName,
          anonymous_avatar_url: anonymousAvatar,
          real_name: fullName,
          dob: birthday,
          gender: gender,
          university: universityName,
          faculty: faculty,
          bio: bio,
          age: age,
          height_cm: heightCm,
          skin_tone: skinTone,
          degree_type: degreeType,
          hometown: hometown,
          public: isPublic,
        })
        .eq('user_id', userId);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        return NextResponse.json(
          { error: 'Failed to update profile data' },
          { status: 500 }
        );
      }
    } else {
      // Create new profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: userId,
          anonymous_name: anonymousName || 'Anonymous',
          anonymous_avatar_url: anonymousAvatar || '👤',
          real_name: fullName,
          dob: birthday,
          gender: gender,
          university: universityName,
          faculty: faculty,
          bio: bio,
          age: age,
          height_cm: heightCm,
          skin_tone: skinTone,
          degree_type: degreeType,
          hometown: hometown,
          public: isPublic ?? true,
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        return NextResponse.json(
          { error: 'Failed to create profile data' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        username: anonymousName,
        avatar: anonymousAvatar,
      },
    });
  } catch (error) {
    console.error('Error in PUT /api/profile/edit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
