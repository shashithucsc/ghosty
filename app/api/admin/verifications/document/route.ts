import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminFromRequest } from '@/lib/adminMiddleware';

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// GET: Get a signed URL for viewing a verification document (admin only)
export async function GET(request: NextRequest) {
  // Verify admin authentication
  const admin = await verifyAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const verificationId = searchParams.get('verificationId');
    const userId = searchParams.get('userId');
    const fileUrl = searchParams.get('fileUrl');

    // At least one identifier is required
    if (!verificationId && !userId && !fileUrl) {
      return NextResponse.json(
        { error: 'Missing required parameter: verificationId, userId, or fileUrl' },
        { status: 400 }
      );
    }

    let documentUrl: string | null = null;
    let verificationData: any = null;
    let userData: any = null;

    // If verificationId is provided, fetch from verifications table
    if (verificationId) {
      const { data: verification, error: verificationError } = await supabaseAdmin
        .from('verifications')
        .select('*')
        .eq('id', verificationId)
        .single();

      if (verificationError || !verification) {
        return NextResponse.json({ error: 'Verification not found' }, { status: 404 });
      }

      verificationData = verification;
      documentUrl = verification.file_url;

      // Also get user data
      if (verification.user_id) {
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('id, username, full_name, email, university_name, faculty, birthday, gender, bio, proof_type, proof_url, verification_status')
          .eq('id', verification.user_id)
          .single();
        
        userData = user;
      }
    }
    // If userId is provided, fetch user's verification document
    else if (userId) {
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('id, username, full_name, email, university_name, faculty, birthday, gender, bio, proof_type, proof_url, verification_status')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      userData = user;
      documentUrl = user.proof_url;

      // Also get verification record
      const { data: verification } = await supabaseAdmin
        .from('verifications')
        .select('*')
        .eq('user_id', userId)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .single();

      verificationData = verification;
      
      // Prefer verification table URL if available
      if (verification?.file_url) {
        documentUrl = verification.file_url;
      }
    }
    // If fileUrl is provided directly, use it
    else if (fileUrl) {
      documentUrl = fileUrl;
    }

    if (!documentUrl) {
      return NextResponse.json({ error: 'No document URL found' }, { status: 404 });
    }

    // Generate a signed URL if this is a Supabase Storage URL
    let signedUrl = documentUrl;
    
    if (documentUrl.includes('supabase') && documentUrl.includes('storage')) {
      const filePath = extractFilePathFromUrl(documentUrl);
      
      if (filePath) {
        const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin
          .storage
          .from('proof_uploads')
          .createSignedUrl(filePath, 3600); // 1 hour expiry

        if (signedUrlError) {
          console.error('Error creating signed URL:', signedUrlError);
          // Fall back to public URL
        } else if (signedUrlData?.signedUrl) {
          signedUrl = signedUrlData.signedUrl;
        }
      }
    }

    // Determine file type from URL
    const fileType = getFileTypeFromUrl(documentUrl);

    return NextResponse.json({
      success: true,
      document: {
        url: signedUrl,
        originalUrl: documentUrl,
        fileType,
        expiresIn: 3600, // 1 hour
      },
      verification: verificationData ? {
        id: verificationData.id,
        proofType: verificationData.proof_type,
        status: verificationData.status,
        submittedAt: verificationData.submitted_at,
        reviewedAt: verificationData.reviewed_at,
      } : null,
      user: userData ? {
        id: userData.id,
        username: userData.username,
        fullName: userData.full_name,
        email: userData.email,
        university: userData.university_name,
        faculty: userData.faculty,
        birthday: userData.birthday,
        gender: userData.gender,
        bio: userData.bio,
        proofType: userData.proof_type,
        verificationStatus: userData.verification_status,
      } : null,
    }, { status: 200 });

  } catch (error) {
    console.error('Unexpected error in GET /api/admin/verifications/document:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

// Helper function to extract file path from Supabase Storage URL
function extractFilePathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');

    // Find the bucket index (proof_uploads)
    const bucketIndex = pathParts.findIndex((part) => part === 'proof_uploads');

    if (bucketIndex === -1) {
      // Try alternative bucket names or patterns
      const publicIndex = pathParts.indexOf('public');
      if (publicIndex !== -1 && pathParts.length > publicIndex + 2) {
        return pathParts.slice(publicIndex + 2).join('/');
      }
      return null;
    }

    // Everything after the bucket name is the file path
    const filePath = pathParts.slice(bucketIndex + 1).join('/');
    return filePath || null;
  } catch (error) {
    console.error('Error parsing file URL:', error);
    return null;
  }
}

// Helper function to determine file type from URL
function getFileTypeFromUrl(url: string): 'image' | 'pdf' | 'unknown' {
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('.pdf')) {
    return 'pdf';
  }
  
  if (lowerUrl.includes('.jpg') || lowerUrl.includes('.jpeg') || lowerUrl.includes('.png') || lowerUrl.includes('.gif') || lowerUrl.includes('.webp')) {
    return 'image';
  }
  
  // Check content type hints in URL
  if (lowerUrl.includes('image/') || lowerUrl.includes('content-type=image')) {
    return 'image';
  }
  
  if (lowerUrl.includes('application/pdf') || lowerUrl.includes('content-type=pdf')) {
    return 'pdf';
  }
  
  return 'unknown';
}
