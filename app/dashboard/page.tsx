'use client';

import { useState, useEffect } from 'react';
import { RecommendationFeed } from '@/components/dashboard/RecommendationFeed';
import { FilterPanel } from '@/components/dashboard/FilterPanel';
import { NotificationBar } from '@/components/dashboard/NotificationBar';
import { useUser } from '@/lib/contexts/UserContext';
import { SlidersHorizontal } from 'lucide-react';

export interface UserProfile {
  id: string;
  anonymousName: string;
  realName?: string;
  age: number;
  gender: string;
  avatar: string;
  bio: string;
  isVerified: boolean;
  interests: string[];
  university: string;
  faculty: string;
  distance?: string;
  height?: number;
  degree?: string;
  hometown?: string;
  skinTone?: string;
}

export interface FilterOptions {
  ageRange: [number, number];
  universities: string[];
  interests: string[];
}

export default function DashboardPage() {
  const { user, setUser } = useUser();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    ageRange: [18, 30],
    universities: [],
    interests: [],
  });
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'match' | 'message' | 'request';
    message: string;
    from?: string;
  }>>([]);

  // Check authentication and verification status
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const avatar = localStorage.getItem('avatar');
    const verificationStatus = localStorage.getItem('verificationStatus');
    const registrationType = localStorage.getItem('registrationType');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    // Debug log to diagnose verification issues
    console.log('[DASHBOARD] Auth check - userId:', userId, 'registrationType:', registrationType, 'verificationStatus:', verificationStatus);
    
    // 1. Check if user is logged in
    if (!userId) {
      window.location.href = '/login';
      return;
    }

    // 2. Admin bypass - admins can access dashboard
    if (isAdmin) {
      setUser({
        anonymousName: username || 'Admin',
        avatar: avatar || 'User', // Removed emoji fallback
        userId,
      });
      setIsCheckingAuth(false);
      return;
    }

    // 3. Check if user registered with verified type and is pending approval
    if (registrationType === 'verified' && verificationStatus === 'pending') {
      window.location.href = '/pending-verification';
      return;
    }

    // 4. Check if verification was rejected
    if (registrationType === 'verified' && verificationStatus === 'rejected') {
      localStorage.clear();
      window.location.href = '/login';
      return;
    }

    // 5. For verified registration type, must be verified to access dashboard
    if (registrationType === 'verified' && verificationStatus !== 'verified') {
      window.location.href = '/pending-verification';
      return;
    }

    // 6. User is authenticated and authorized
    setUser({
      anonymousName: username || 'User',
      avatar: avatar || 'User', // Removed emoji fallback
      userId,
    });
    setIsCheckingAuth(false);
  }, [setUser]);

  const handleRequestSent = (user: UserProfile) => {
    setNotifications([
      {
        id: Date.now().toString(),
        type: 'request',
        message: `Message request sent to ${user.anonymousName}!`,
        from: user.anonymousName,
      },
      ...notifications,
    ]);
  };

  const handleDismissNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setShowFilters(false);
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="fixed inset-0 pt-16 sm:pt-20 pb-16 sm:pb-20 bg-[#FDF8F5] flex items-center justify-center font-sans text-black">
        <div className="text-center">
          {/* Neobrutalist Spinner */}
          <div className="w-16 h-16 border-4 border-black border-t-[#FFD166] rounded-full animate-spin mx-auto mb-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]"></div>
          <p className="text-black font-black uppercase tracking-wider text-xl">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pt-16 sm:pt-20 pb-16 sm:pb-20 bg-[#FDF8F5] overflow-hidden font-sans text-black">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-20 left-0 right-0 z-40 px-4">
          {notifications.slice(0, 3).map((notification) => (
            <NotificationBar
              key={notification.id}
              notification={notification}
              onDismiss={handleDismissNotification}
            />
          ))}
        </div>
      )}

      {/* Main Content - Flex layout to fill screen */}
      <main className="container mx-auto px-4 h-full max-w-2xl flex flex-col">
        {/* Filter Button */}
        <div className="py-4 flex-shrink-0">
          <button
            onClick={() => setShowFilters(true)}
            className="w-full bg-white border-4 border-black px-6 py-4 rounded-xl flex items-center justify-center gap-3 text-black font-black uppercase tracking-wide shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-y-[6px] active:translate-x-[6px] active:shadow-none transition-all duration-200"
          >
            <SlidersHorizontal className="w-6 h-6 stroke-[3]" />
            <span>Filters & Preferences</span>
            {(filters.universities.length > 0 || filters.interests.length > 0) && (
              <span className="bg-[#4ECDC4] text-black text-sm font-black px-3 py-1 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                {filters.universities.length + filters.interests.length}
              </span>
            )}
          </button>
        </div>

        {/* Recommendation Feed - Takes remaining space */}
        <div className="flex-1 min-h-0 overflow-hidden mt-2">
          {user?.userId ? (
            <RecommendationFeed
              filters={filters}
              onRequestSent={handleRequestSent}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                {/* Neobrutalist Spinner */}
                <div className="w-16 h-16 border-4 border-black border-t-[#4ECDC4] rounded-full animate-spin mx-auto mb-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]"></div>
                <p className="text-black font-black uppercase tracking-wider text-xl">Loading Matches...</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel
          currentFilters={filters}
          onApply={handleApplyFilters}
          onClose={() => setShowFilters(false)}
        />
      )}
    </div>
  );
}