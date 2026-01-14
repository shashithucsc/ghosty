'use client';

import { Message } from '@/app/chat/[id]/page';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (message.isOwn) {
    return (
      <div className="flex justify-end animate-slide-up">
        <div className="max-w-[75%] sm:max-w-[60%]">
          <div className="bg-purple-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-lg">
            <p className="text-sm sm:text-base wrap-break-word">{message.text}</p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 text-right">
            {formatTime(message.timestamp)}
          </p>
        </div>
      </div>
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
