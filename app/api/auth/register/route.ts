import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase/client';
import { sendActivationEmail } from '@/lib/email/sendEmail';
import {
  isValidEmail,
  isValidPassword,
  generateActivationToken,
  getTokenExpiration,
  sanitizeInput,
} from '@/lib/utils/helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Sanitize email
    const sanitizedEmail = sanitizeInput(email.toLowerCase());

    // Validate email format
    if (!isValidEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data } = await supabaseAdmin
      .from('users')
      .select('id, email_verified')
      .eq('email', sanitizedEmail)
      .single();

    const existingUser: any = data;

    if (existingUser) {
      if (existingUser.email_verified) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        );
      } else {
        // User exists but hasn't verified email - resend activation
        const activationToken = generateActivationToken();
        const tokenExpires = getTokenExpiration();

        const updatePayload: any = {
          activation_token: activationToken,
          activation_token_expires: tokenExpires,
        };

        await (supabaseAdmin as any)
          .from('users')
          .update(updatePayload)
          .eq('email', sanitizedEmail);

        await sendActivationEmail({
          to: sanitizedEmail,
          activationToken,
        });

        return NextResponse.json(
          {
            message: 'Activation email resent. Please check your inbox.',
            userId: existingUser.id,
          },
          { status: 200 }
        );
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate activation token
    const activationToken = generateActivationToken();
    const tokenExpires = getTokenExpiration();

    // Create user
    const insertPayload: any = {
      email: sanitizedEmail,
      password_hash: passwordHash,
      email_verified: false,
      activation_token: activationToken,
      activation_token_expires: tokenExpires,
    };

    const { data: newUser, error: createError } = await (supabaseAdmin as any)
      .from('users')
      .insert(insertPayload)
      .select()
      .single();

    if (createError) {
      console.error('Error creating user:', createError);
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    // Send activation email
    try {
      await sendActivationEmail({
        to: sanitizedEmail,
        activationToken,
      });
    } catch (emailError) {
      console.error('Error sending activation email:', emailError);
      // User is created but email failed - still return success
      return NextResponse.json(
        {
          message: 'Account created but failed to send activation email. Please contact support.',
          userId: newUser.id,
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        message: 'Registration successful! Please check your email to activate your account.',
        userId: newUser.id,
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
