'use client';

import { useEffect } from 'react';
import { X, Heart, MessageCircle, Send } from 'lucide-react';

interface Notification {
  id: string;
  type: 'match' | 'message' | 'request';
  message: string;
  from?: string;
}

interface NotificationBarProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

export function NotificationBar({ notification, onDismiss }: NotificationBarProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  return (
    <div className="mb-2 animate-slide-down">
      <div className={`glassmorphic-card p-4 flex items-center gap-3 shadow-xl border-l-4 ${
        notification.type === 'request' ? 'border-purple-500' : 
        notification.type === 'match' ? 'border-pink-500' : 'border-blue-500'
      }`}>
        <div className={`p-2 rounded-full ${
          notification.type === 'match' 
            ? 'bg-pink-100 dark:bg-pink-900/30' 
            : notification.type === 'request'
            ? 'bg-purple-100 dark:bg-purple-900/30'
            : 'bg-blue-100 dark:bg-blue-900/30'
        }`}>
          {notification.type === 'match' ? (
            <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400 fill-current" />
          ) : notification.type === 'request' ? (
            <Send className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          ) : (
            <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          )}
        </div>
        
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800 dark:text-white">
            {notification.type === 'match' ? '🎉 New Match!' : 
             notification.type === 'request' ? '💌 Request Sent!' : '💬 New Message'}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {notification.message}
          </p>
        </div>

        <button
          onClick={() => onDismiss(notification.id)}
          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    </div>
  );
}
