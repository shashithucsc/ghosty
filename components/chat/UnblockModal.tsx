'use client';

import { X } from 'lucide-react';

interface UnblockModalProps {
  userName: string;
  onUnblock: () => void;
  onClose: () => void;
}

export function UnblockModal({ userName, onUnblock, onClose }: UnblockModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="glassmorphic-card max-w-md w-full p-6 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Unblock User?
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              You are about to unblock <span className="font-semibold">{userName}</span>.
            </p>
          </div>

          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-start gap-2">
              <span className="text-lg">✅</span>
              <p>They will be able to send you messages again</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">💬</span>
              <p>You can start a new conversation with them</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">🔄</span>
              <p>You can block them again anytime if needed</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onUnblock}
            className="flex-1 px-4 py-3 bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Unblock
          </button>
        </div>
      </div>
    </div>
  );
}
