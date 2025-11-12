'use client';

import { useState } from 'react';
import { Send, Smile } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  disabledMessage?: string;
}

export function ChatInput({ onSend, disabled = false, disabledMessage }: ChatInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <div className="sticky bottom-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:py-4 shadow-lg">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        {/* Disabled Message */}
        {disabled && disabledMessage && (
          <div className="mb-2 text-center text-sm text-red-600 dark:text-red-400 font-medium">
            {disabledMessage}
          </div>
        )}
        
        <div className="flex items-end gap-2 sm:gap-3">
          {/* Input Field */}
          <div className="flex-1 relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={disabled && disabledMessage ? disabledMessage : "Type a message..."}
              rows={1}
              disabled={disabled}
              className="w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none max-h-32 text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ minHeight: '48px' }}
            />
            
            {/* Emoji Button (placeholder) */}
            <button
              type="button"
              className="absolute right-3 bottom-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Emoji (coming soon)"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!text.trim() || disabled}
            className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center"
          >
            <Send className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </form>
    </div>
  );
}
