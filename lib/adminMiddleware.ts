import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

// =============================================
// ADMIN MIDDLEWARE - Verify JWT and Admin Role
// =============================================

export interface AdminUser {
  userId: string;
  username: string;
  isAdmin: boolean;
  verificationStatus: string;
  registrationType: string;
}

export function requireAdmin(
  handler: (request: NextRequest, user: AdminUser) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Get token from Authorization header
      const authHeader = request.headers.get('authorization');
      let token: string | null = null;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }

      // Fallback: check cookie
      if (!token) {
        const cookies = request.headers.get('cookie') || '';
        const match = cookies.match(/ghosty_session=([^;]+)/);
        if (match) {
          token = match[1];
        }
      }

      // Fallback: check localStorage (passed in header)
      if (!token) {
        token = request.headers.get('x-auth-token');
      }

      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Verify JWT
      const payload = verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key'
      ) as AdminUser;

      // Check if user is admin
      if (!payload.isAdmin) {
        return NextResponse.json(
          { error: 'Admin access only. Insufficient permissions.' },
          { status: 403 }
        );
      }

      // Call the actual handler with user data
      return handler(request, payload);
    } catch (error) {
      console.error('Admin auth error:', error);
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }
  };
}

// =============================================
// VERIFY ADMIN FROM REQUEST (for App Router)
// =============================================
export async function verifyAdminFromRequest(
  request: NextRequest
): Promise<AdminUser | null> {
  try {
    const authHeader = request.headers.get('authorization');
    let token: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token) {
      const cookies = request.headers.get('cookie') || '';
      const match = cookies.match(/ghosty_session=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }

    if (!token) {
      token = request.headers.get('x-auth-token');
    }

    if (!token) return null;

    const payload = verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as AdminUser;

    if (!payload.isAdmin) return null;

    return payload;
  } catch (error) {
    return null;
  }
}
