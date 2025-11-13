import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// Zod validation schema
const SimpleRegistrationSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  gender: z.enum(['Male', 'Female'], { message: 'Please select your gender' }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate with Zod
    const validation = SimpleRegistrationSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Validation failed';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { username, password, gender } = validation.data;

    // Sanitize username (lowercase)
    const sanitizedUsername = username.toLowerCase().trim();

    // Check if username already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, username')
      .eq('username', sanitizedUsername)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user with simple registration
    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert({
        username: sanitizedUsername,
        password_hash: passwordHash,
        email: null, // Simple registration doesn't require email
        email_verified: false,
        registration_type: 'simple',
        verification_status: 'unverified',
        gender: gender,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating user:', createError);
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    // Create profile record
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: newUser.id,
        anonymous_name: sanitizedUsername,
        gender: gender,
        verified: false,
        public: true,
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // Don't fail registration if profile creation fails, just log it
    }

    return NextResponse.json(
      {
        message: 'Account created successfully!',
        userId: newUser.id,
        username: newUser.username,
        registrationType: 'simple',
        verificationStatus: 'unverified',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
