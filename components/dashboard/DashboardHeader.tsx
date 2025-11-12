'use client';

import { Settings, Bell, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DashboardHeaderProps {
  user: {
    anonymousName: string;
    avatar: string;
  };
  onShowFilters: () => void;
  notificationCount: number;
}

export function DashboardHeader({
  user,
  onShowFilters,
  notificationCount = 0,
}: DashboardHeaderProps) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo & User */}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Ghosty 👻
            </h1>
          </div>

          {/* User Info */}
          <div className="hidden sm:flex items-center gap-2 glassmorphic-card px-4 py-2">
            <span className="text-2xl">{user.avatar}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {user.anonymousName}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Messages */}
            <button
              onClick={() => router.push('/inbox')}
              className="relative p-2 sm:p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Messages"
            >
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Notifications */}
            <button
              className="relative p-2 sm:p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" />
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Filters/Settings */}
            <button
              onClick={onShowFilters}
              className="p-2 sm:p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Filters"
            >
              <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Mobile User Info */}
        <div className="sm:hidden mt-3 flex items-center justify-center gap-2 glassmorphic-card px-4 py-2">
          <span className="text-xl">{user.avatar}</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {user.anonymousName}
          </span>
        </div>
      </div>
    </header>
  );
}
