import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

// GET - Fetch full user profile data for editing (V2)
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

    // Fetch user data from users_v2 (private identity)
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users_v2')
      .select('id, username, email, full_name, birthday, gender, university_name, faculty, verification_status, registration_type, is_admin')
      .eq('id', userId)
      .single();

    console.log(`[API /profile/edit] Fetching user ${userId} - verification_status:`, userData?.verification_status);

    if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      );
    }

    // Fetch profile data from profiles_v2 (public anonymous persona)
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles_v2')
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
      // Verification info
      verificationStatus: userData.verification_status,
      registrationType: userData.registration_type,
      isAdmin: userData.is_admin,
      // All profile data from profiles_v2
      bio: profileData?.bio || '',
      anonymousName: profileData?.anonymous_name || '',
      anonymousAvatar: profileData?.anonymous_avatar_url || '👤',
      age: profileData?.age || null,
      heightCm: profileData?.height_cm || null,
      skinTone: profileData?.skin_tone || '',
      degreeType: profileData?.degree_type || '',
      hometown: profileData?.hometown || '',
      isPublic: profileData?.public ?? true,
    };

    console.log(`[API /profile/edit] Returning data with verification_status:`, combinedData.verificationStatus);

    return NextResponse.json({ success: true, data: combinedData });
  } catch (error) {
    console.error('Error in GET /api/profile/edit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update user profile data (V2)
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
      email,  // Optional: only if changing email
      password, // Optional: only if changing password
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

    // Only update users_v2 if changing private identity data or auth credentials
    const userUpdates: any = {
      full_name: fullName,
      birthday: birthday,
      gender: gender,
      university_name: universityName,
      faculty: faculty,
      updated_at: new Date().toISOString(),
    };

    // Add email/password if provided (auth changes)
    if (email) userUpdates.email = email;
    if (password) {
      const bcrypt = require('bcryptjs');
      userUpdates.password_hash = await bcrypt.hash(password, 12);
    }

    const { error: userError } = await supabaseAdmin
      .from('users_v2')
      .update(userUpdates)
      .eq('id', userId);

    if (userError) {
      console.error('Error updating user:', userError);
      return NextResponse.json(
        { error: 'Failed to update user data' },
        { status: 500 }
      );
    }

    // Check if profile exists in profiles_v2
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles_v2')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (existingProfile) {
      // Update existing profile in profiles_v2 (public data only)
      const { error: profileError } = await supabaseAdmin
        .from('profiles_v2')
        .update({
          anonymous_name: anonymousName,
          anonymous_avatar_url: anonymousAvatar,
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
      // Create new profile in profiles_v2
      const { error: profileError } = await supabaseAdmin
        .from('profiles_v2')
        .insert({
          user_id: userId,
          anonymous_name: anonymousName || 'Anonymous',
          anonymous_avatar_url: anonymousAvatar || '👤',
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
