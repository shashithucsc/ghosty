'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProfileView from '@/components/profile/ProfileView';
import { Loader2 } from 'lucide-react';
import { Toast } from '@/components/ui/Toast';

// =============================================
// PROFILE PAGE (OTHER USERS)
// =============================================

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isLimited, setIsLimited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  useEffect(() => {
    // Unwrap params and get profile ID
    params.then(({ id }) => {
      setProfileId(id);
    });

    // Get current user from localStorage
    const userId = localStorage.getItem('userId');
    if (userId) {
      setCurrentUserId(userId);
    }
  }, [params]);

  useEffect(() => {
    // Fetch profile data when profileId is available
    if (profileId) {
      fetchProfile();
    }
  }, [profileId]);

  const fetchProfile = async () => {
    if (!profileId) return;
    
    try {
      const response = await fetch(`/api/profile/${profileId}`);
      const data = await response.json();

      if (response.ok) {
        setProfile(data.profile);
        setIsLimited(data.limited);
      } else if (response.status === 404) {
        setToast({ message: 'User not found', type: 'error' });
        setTimeout(() => router.push('/dashboard'), 1500);
      } else {
        setToast({ message: data.error || 'Failed to load profile', type: 'error' });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setToast({ message: 'Something went wrong', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <ProfileView
        profile={profile}
        isLimited={isLimited}
        isOwnProfile={false}
        currentUserId={currentUserId || undefined}
      />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
