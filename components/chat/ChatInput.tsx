'use client';

import { useState } from 'react';
import { Send, Smile } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  onTyping?: () => void;
  disabled?: boolean;
  disabledMessage?: string;
}

export function ChatInput({ onSend, onTyping, disabled = false, disabledMessage }: ChatInputProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSend(text.trim());
      setText('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Trigger typing indicator
    if (onTyping && e.target.value.length > 0) {
      onTyping();
    }
  };

  return (
    <div className="sticky bottom-0 bg-white border-t-4 border-black px-3 sm:px-4 py-2 sm:py-3 pb-16 sm:pb-4 z-10 font-sans text-black">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        {/* Disabled Message */}
        {disabled && disabledMessage && (
          <div className="mb-1 text-center text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#FF6B6B]">
            {disabledMessage}
          </div>
        )}
        
        <div className="flex items-end gap-2">
          {/* Input Field */}
          <div className="flex-1 relative">
            <textarea
              value={text}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={disabled && disabledMessage ? disabledMessage.toUpperCase() : "TYPE A MESSAGE..."}
              rows={1}
              disabled={disabled}
              className="w-full px-3 py-2 sm:px-4 sm:py-3 pr-10 sm:pr-12 bg-[#F8F9FA] border-3 sm:border-4 border-black rounded-xl sm:rounded-2xl text-black font-bold placeholder-gray-500 focus:outline-none focus:shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-shadow resize-none max-h-24 text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ minHeight: '40px' }}
            />
            
            {/* Emoji Button (placeholder) */}
            <button
              type="button"
              className="absolute right-2 sm:right-3 bottom-2 sm:bottom-3 p-1 text-black hover:text-[#4ECDC4] transition-colors"
              title="Emoji (coming soon)"
            >
              <Smile className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
            </button>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!text.trim() || disabled}
            className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-[#4ECDC4] border-3 sm:border-4 border-black text-black rounded-xl sm:rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[5px_5px_0px_rgba(0,0,0,1)] active:translate-y-[3px] active:translate-x-[3px] active:shadow-none flex items-center justify-center"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
          </button>
        </div>
      </form>
    </div>
  );
}