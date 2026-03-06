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
    <div className="sticky bottom-0 bg-white border-t-4 border-black px-4 py-3 sm:py-4 pb-20 sm:pb-4 z-10 font-sans text-black">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        {/* Disabled Message */}
        {disabled && disabledMessage && (
          <div className="mb-2 text-center text-xs font-black uppercase tracking-widest text-[#FF6B6B]">
            {disabledMessage}
          </div>
        )}
        
        <div className="flex items-end gap-2 sm:gap-3">
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
              className="w-full px-4 py-3 pr-12 bg-[#F8F9FA] border-4 border-black rounded-2xl text-black font-bold placeholder-gray-500 focus:outline-none focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-shadow resize-none max-h-32 text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ minHeight: '48px' }}
            />
            
            {/* Emoji Button (placeholder) */}
            <button
              type="button"
              className="absolute right-3 bottom-3 p-1 text-black hover:text-[#4ECDC4] transition-colors"
              title="Emoji (coming soon)"
            >
              <Smile className="w-5 h-5 stroke-[3]" />
            </button>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!text.trim() || disabled}
            className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-[#4ECDC4] border-4 border-black text-black rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none flex items-center justify-center"
          >
            <Send className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
          </button>
        </div>
      </form>
    </div>
  );
}