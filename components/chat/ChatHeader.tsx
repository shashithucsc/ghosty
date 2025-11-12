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
}

export function ChatHeader({
  title,
  subtitle,
  avatar,
  showBack = false,
  showMenu = false,
  onBack,
  onBlockReport,
}: ChatHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Left: Back Button */}
          {showBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors -ml-2"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
          )}

          {/* Center: Title & Avatar */}
          <div className="flex-1 flex items-center gap-3 ml-2">
            {avatar && (
              <div className="text-3xl sm:text-4xl">{avatar}</div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white truncate">
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
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <MoreVertical className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
