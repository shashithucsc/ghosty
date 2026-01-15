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

  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'match' | 'message' | 'request';
    message: string;
    from?: string;
  }>>([]);

  // Load user data from localStorage and update context
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const avatar = localStorage.getItem('avatar');
    
    if (userId) {
      setUser({
        anonymousName: username || 'User',
        avatar: avatar || '👤',
        userId,
      });
    } else {
      // Redirect to login if no user ID found
      window.location.href = '/login';
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-20">
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Filter Button - Mobile & Desktop */}
        <div className="mb-6">
          <button
            onClick={() => setShowFilters(true)}
            className="w-full sm:w-auto bg-white shadow-lg border border-gray-200 px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-gray-800 font-semibold hover:shadow-xl hover:border-purple-300 transition-all duration-300"
          >
            <SlidersHorizontal className="w-5 h-5 text-purple-600" />
            <span>Filters & Preferences</span>
            {(filters.universities.length > 0 || filters.interests.length > 0) && (
              <span className="bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {filters.universities.length + filters.interests.length}
              </span>
            )}
          </button>
        </div>

        {user?.userId ? (
          <RecommendationFeed
            filters={filters}
            onRequestSent={handleRequestSent}
          />
        ) : (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="spinner-large mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your recommendations...</p>
            </div>
          </div>
        )}
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
