import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import { sign } from 'jsonwebtoken';
import { z } from 'zod';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// =============================================
// ZOD VALIDATION SCHEMAS
// =============================================

const LoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

// =============================================
// POST /api/auth/login - User login
// =============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = LoginSchema.parse(body);
    const { username, password } = validatedData;

    // Find user by username
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Verify password first before any other checks
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Determine user role
    const isAdmin = user.is_admin || false;

    // Admin bypass: Admins skip restriction and verification checks
    if (!isAdmin) {
      // Check if account is restricted (only for normal users)
      if (user.is_restricted) {
        return NextResponse.json(
          { 
            error: 'Your account has been restricted. Please contact support.',
            isRestricted: true 
          },
          { status: 403 }
        );
      }

      // Check verification status for verified registration type (only for normal users)
      if (user.registration_type === 'verified' && user.verification_status === 'pending') {
        return NextResponse.json(
          {
            success: true,
            message: 'Login successful. Your account is pending verification.',
            user: {
              id: user.id,
              username: user.username,
              verificationStatus: user.verification_status,
              registrationType: user.registration_type,
              isAdmin: false,
              isPending: true,
            },
            token: sign(
              { 
                userId: user.id, 
                username: user.username,
                verificationStatus: user.verification_status,
                isAdmin: false,
                registrationType: user.registration_type,
              },
              process.env.JWT_SECRET || 'your-secret-key',
              { expiresIn: '7d' }
            ),
          },
          { status: 200 }
        );
      }

      // Reject unverified users who tried to register with verified registration
      if (user.registration_type === 'verified' && user.verification_status === 'rejected') {
        return NextResponse.json(
          { 
            error: 'Your verification was rejected. Please contact support or register with a different method.',
            isRejected: true 
          },
          { status: 403 }
        );
      }
    }

    // Check if profile is complete (exists in profiles table with required fields)
    // Admins don't need complete profiles
    let isProfileComplete = true;
    
    if (!isAdmin) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, age, height_cm, degree_type')
        .eq('user_id', user.id)
        .single();

      isProfileComplete = !!(profile && profile.age && profile.height_cm && profile.degree_type);
    }

    // Generate JWT token with admin flag
    const token = sign(
      { 
        userId: user.id, 
        username: user.username,
        verificationStatus: user.verification_status,
        isAdmin: isAdmin,
        registrationType: user.registration_type,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Return user data (excluding password_hash)
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      emailVerified: user.email_verified,
      registrationType: user.registration_type,
      verificationStatus: user.verification_status,
      proofType: user.proof_type,
      fullName: user.full_name,
      birthday: user.birthday,
      gender: user.gender,
      universityName: user.university_name,
      faculty: user.faculty,
      bio: user.bio,
      preferences: user.preferences,
      partnerPreferences: user.partner_preferences,
      partnerPreferencesJson: user.partner_preferences_json,
      reportCount: user.report_count,
      isRestricted: user.is_restricted,
      isAdmin: isAdmin,
      isProfileComplete,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        token,
        user: userData,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
