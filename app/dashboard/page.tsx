'use client';

import { useState, useEffect } from 'react';
import { RecommendationFeed } from '@/components/dashboard/RecommendationFeed';
import { FilterPanel } from '@/components/dashboard/FilterPanel';
import { NotificationBar } from '@/components/dashboard/NotificationBar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { MatchModal } from '@/components/dashboard/MatchModal';

export interface UserProfile {
  id: string;
  anonymousName: string;
  age: number;
  gender: string;
  avatar: string;
  bio: string;
  isVerified: boolean;
  interests: string[];
  university: string;
  faculty: string;
  distance?: string;
}

export interface FilterOptions {
  ageRange: [number, number];
  universities: string[];
  interests: string[];
}

export default function DashboardPage() {
  const [currentUser] = useState({
    anonymousName: 'MysteriousGhost123',
    avatar: '👤',
  });

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    ageRange: [18, 30],
    universities: [],
    interests: [],
  });

  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'match' | 'message';
    message: string;
    from?: string;
  }>>([]);

  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedUser, setMatchedUser] = useState<UserProfile | null>(null);

  // Simulate new match notification
  useEffect(() => {
    const timer = setTimeout(() => {
      // Uncomment to test match notification
      // handleNewMatch({
      //   id: '999',
      //   anonymousName: 'CharmingSoul456',
      //   age: 24,
      //   gender: 'Female',
      //   avatar: '👩',
      //   bio: 'Love adventure and deep conversations',
      //   isVerified: true,
      //   interests: ['Travel', 'Music', 'Art'],
      //   university: 'Stanford University',
      //   faculty: 'Arts',
      // });
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleNewMatch = (user: UserProfile) => {
    setMatchedUser(user);
    setShowMatchModal(true);
    setNotifications([
      {
        id: Date.now().toString(),
        type: 'match',
        message: `You matched with ${user.anonymousName}!`,
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
        <RecommendationFeed
          filters={filters}
          onMatch={handleNewMatch}
        />
      </main>

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel
          currentFilters={filters}
          onApply={handleApplyFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Match Modal */}
      {showMatchModal && matchedUser && (
        <MatchModal
          user={matchedUser}
          onClose={() => setShowMatchModal(false)}
        />
      )}
    </div>
  );
}
