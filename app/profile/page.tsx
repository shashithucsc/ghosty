'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProfileView from '@/components/profile/ProfileView';
import { Loader2, Edit } from 'lucide-react';
import { Toast } from '@/components/ui/Toast';

// =============================================
// OWN PROFILE PAGE
// =============================================

export default function MyProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isLimited, setIsLimited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  useEffect(() => {
    // Get current user from localStorage
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setToast({ message: 'Please log in to view your profile', type: 'error' });
      setTimeout(() => router.push('/login'), 1500);
      return;
    }

    setCurrentUserId(userId);
    fetchProfile(userId);
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const response = await fetch(`/api/profile/${userId}`);
      const data = await response.json();

      if (response.ok) {
        setProfile(data.profile);
        setIsLimited(data.limited);
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
          <p className="text-gray-600">Loading your profile...</p>
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
    <div className="relative">
      <ProfileView
        profile={profile}
        isLimited={isLimited}
        isOwnProfile={true}
        currentUserId={currentUserId || undefined}
      />
      
      {/* Floating Edit Button */}
      <button
        onClick={() => setToast({ message: '✏️ Profile editing coming soon!', type: 'info' })}
        className="fixed bottom-24 right-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all z-20"
      >
        <Edit className="w-6 h-6" />
      </button>

      {/* Toast Notification */}
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
