'use client';

import { MessageCircle, X } from 'lucide-react';
import { UserProfile } from '@/app/dashboard/page';

interface MatchModalProps {
  user: UserProfile;
  onClose: () => void;
}

export function MatchModal({ user, onClose }: MatchModalProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="glassmorphic-card p-8 max-w-md w-full text-center animate-scale-in pointer-events-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Celebration */}
          <div className="mb-6">
            <div className="text-6xl mb-4 animate-bounce-gentle">🎉</div>
            <h2 className="text-3xl font-bold bg-linear-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              It's a Match!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              You and {user.anonymousName} liked each other
            </p>
          </div>

          {/* User Info */}
          <div className="mb-6 p-6 bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
            <div className="text-5xl mb-3">{user.avatar}</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
              {user.anonymousName}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {user.age} • {user.gender}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => alert('Chat feature coming soon!')}
              className="w-full btn-primary py-4 text-lg font-semibold flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Send a Message
            </button>
            <button
              onClick={onClose}
              className="w-full btn-secondary py-3 text-base font-semibold"
            >
              Keep Swiping
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
