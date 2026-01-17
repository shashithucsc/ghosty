'use client';

import { useState } from 'react';
import { Trash2, Check, CheckCheck } from 'lucide-react';
import { Message } from '@/app/chat/[id]/page';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface ChatMessageProps {
  message: Message;
  onDelete?: (messageId: string) => void;
}

export function ChatMessage({ message, onDelete }: ChatMessageProps) {
  const [showDelete, setShowDelete] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (message.isOwn) {
    return (
      <>
        <div 
          className="flex justify-end animate-slide-up group"
          onMouseEnter={() => setShowDelete(true)}
          onMouseLeave={() => setShowDelete(false)}
        >
          <div className="max-w-[75%] sm:max-w-[60%] relative">
            {/* Delete Button */}
            {onDelete && showDelete && !message.isOptimistic && (
              <button
                onClick={() => setShowConfirmModal(true)}
                className="absolute -left-10 top-1/2 -translate-y-1/2 p-2 rounded-full bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors opacity-0 group-hover:opacity-100"
                title="Delete message"
              >
                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
              </button>
            )}
            
            <div className={`bg-purple-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-lg ${message.isOptimistic ? 'opacity-70' : ''}`}>
              <p className="text-sm sm:text-base wrap-break-word">{message.text}</p>
            </div>
            
            {/* Timestamp and Read Receipt */}
            <div className="flex items-center justify-end gap-1 mt-1">
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {formatTime(message.timestamp)}
              </p>
              {!message.isOptimistic && (
                <>
                  {message.isRead ? (
                    <span title="Read">
                      <CheckCheck className="w-4 h-4 text-blue-500" />
                    </span>
                  ) : (
                    <span title="Delivered">
                      <Check className="w-4 h-4 text-gray-400" />
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Confirm Delete Modal */}
        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={() => onDelete && onDelete(message.id)}
          title="Delete Message?"
          message="Are you sure you want to delete this message? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          icon="trash"
        />
      </>
    );
  }

  return (
    <div className="flex justify-start animate-slide-up">
      <div className="max-w-[75%] sm:max-w-[60%]">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl text-gray-900 dark:text-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-lg border border-gray-200 dark:border-gray-700/50">
          <p className="text-sm sm:text-base wrap-break-word">{message.text}</p>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}
