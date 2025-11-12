'use client';

import { Check, X, Lock, MoreVertical } from 'lucide-react';
import { ChatRequest } from '@/app/inbox/page';
import { useState } from 'react';

interface InboxListProps {
  requests: ChatRequest[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onBlock: (id: string) => void;
  onOpenChat: (id: string) => void;
}

export function InboxList({ requests, onAccept, onReject, onBlock, onOpenChat }: InboxListProps) {
  const [showMenuId, setShowMenuId] = useState<string | null>(null);

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <div
          key={request.id}
          className="glassmorphic-card p-4 sm:p-5 animate-slide-up hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start gap-3 sm:gap-4">
            {/* Avatar */}
            <div className="text-4xl sm:text-5xl shrink-0">{request.from.avatar}</div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white truncate">
                    {request.from.anonymousName}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {request.from.age} • {request.from.gender}
                  </p>
                </div>

                {/* Timestamp & Menu */}
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap">
                    {getTimeAgo(request.timestamp)}
                  </span>
                  {request.status === 'accepted' && (
                    <div className="relative">
                      <button
                        onClick={() => setShowMenuId(showMenuId === request.id ? null : request.id)}
                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      
                      {showMenuId === request.id && (
                        <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 min-w-[120px] z-10 animate-scale-in">
                          <button
                            onClick={() => {
                              onBlock(request.id);
                              setShowMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            Block User
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Message Preview */}
              <div className="mb-3">
                {request.status === 'pending' && !request.isBlocked ? (
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-500 text-sm">
                    <Lock className="w-4 h-4" />
                    <span className="italic">Accept to view message</span>
                  </div>
                ) : request.isBlocked ? (
                  <p className="text-sm text-red-600 dark:text-red-400 italic">
                    User blocked
                  </p>
                ) : (
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                    {request.message}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              {request.status === 'pending' && !request.isBlocked && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onAccept(request.id)}
                    className="flex-1 py-2 px-4 bg-linear-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all text-sm sm:text-base flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Accept
                  </button>
                  <button
                    onClick={() => onReject(request.id)}
                    className="flex-1 py-2 px-4 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 border-2 border-red-500 rounded-lg font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-sm sm:text-base flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}

              {request.status === 'accepted' && !request.isBlocked && (
                <button
                  onClick={() => onOpenChat(request.id)}
                  className="w-full py-2 px-4 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all text-sm sm:text-base"
                >
                  Open Chat
                </button>
              )}

              {request.status === 'rejected' && !request.isBlocked && (
                <p className="text-sm text-gray-500 dark:text-gray-500 italic">
                  Request rejected
                </p>
              )}

              {request.isBlocked && (
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  This user has been blocked
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
