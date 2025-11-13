'use client';

import { useState, useEffect } from 'react';
import { RecommendationFeed } from '@/components/dashboard/RecommendationFeed';
import { FilterPanel } from '@/components/dashboard/FilterPanel';
import { NotificationBar } from '@/components/dashboard/NotificationBar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

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
  const [currentUser, setCurrentUser] = useState({
    anonymousName: 'MysteriousGhost123',
    avatar: '👤',
    userId: '',
  });

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

  // Load user data from localStorage
  useEffect(() => {
    // Get user ID from localStorage (set during login)
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const avatar = localStorage.getItem('avatar');
    
    if (userId) {
      setCurrentUser({
        anonymousName: username || 'User',
        avatar: avatar || '👤',
        userId,
      });
    } else {
      // Redirect to login if no user ID found
      window.location.href = '/login';
    }
  }, []);

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
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950">
      {/* Header */}
      <DashboardHeader
        user={currentUser}
        onShowFilters={() => setShowFilters(true)}
        notificationCount={notifications.length}
      />

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
        {currentUser.userId ? (
          <RecommendationFeed
            filters={filters}
            onRequestSent={handleRequestSent}
          />
        ) : (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="spinner-large mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading...</p>
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
