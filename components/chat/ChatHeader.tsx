'use client';

import { ArrowLeft, MoreVertical } from 'lucide-react';

interface ChatHeaderProps {
  title: string;
  subtitle?: string;
  avatar?: string;
  showBack?: boolean;
  showMenu?: boolean;
  onBack?: () => void;
  onBlockReport?: () => void;
  userId?: string;
  onProfileClick?: () => void;
}

export function ChatHeader({
  title,
  subtitle,
  avatar,
  showBack = false,
  showMenu = false,
  onBack,
  onBlockReport,
  userId,
  onProfileClick,
}: ChatHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700/50 shadow-lg">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Left: Back Button */}
          {showBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors -ml-2"
            >
              <ArrowLeft className="w-6 h-6 text-gray-800 dark:text-gray-300" />
            </button>
          )}

          {/* Center: Title & Avatar - Clickable for profile */}
          <div 
            className={`flex-1 flex items-center gap-3 ml-2 ${onProfileClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
            onClick={onProfileClick}
            title={onProfileClick ? 'View Profile' : undefined}
          >
            {avatar && (
              <div className="text-3xl sm:text-4xl">{avatar}</div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className={`text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate ${onProfileClick ? 'hover:text-purple-600 dark:hover:text-purple-400' : ''}`}>
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right: Menu */}
          {showMenu && (
            <button
              onClick={onBlockReport}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <MoreVertical className="w-6 h-6 text-gray-800 dark:text-gray-300" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
