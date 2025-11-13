import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/register?error=invalid_token`
      );
    }

    // Find user with this activation token
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('activation_token', token)
      .single();

    const user: any = data;

    if (error || !user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/register?error=invalid_token`
      );
    }

    // Check if token has expired
    if (user.activation_token_expires) {
      const expiresAt = new Date(user.activation_token_expires);
      if (expiresAt < new Date()) {
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/register?error=token_expired`
        );
      }
    }

    // Check if already verified
    if (user.email_verified) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/register?success=already_verified`
      );
    }

    // Activate the account
    const updatePayload: any = {
      email_verified: true,
      activation_token: null,
      activation_token_expires: null,
    };

    const { error: updateError } = await (supabaseAdmin as any)
      .from('users')
      .update(updatePayload)
      .eq('id', user.id);

    if (updateError) {
      console.error('Error activating account:', updateError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/register?error=activation_failed`
      );
    }

    // Redirect to profile creation page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/register/profile?userId=${user.id}&verified=true`
    );
  } catch (error) {
    console.error('Activation error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/register?error=server_error`
    );
  }
}
