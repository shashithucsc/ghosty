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
    }).toUpperCase();
  };

  if (message.isOwn) {
    return (
      <>
        <div 
          className="flex justify-end animate-slide-up group font-sans"
          onMouseEnter={() => setShowDelete(true)}
          onMouseLeave={() => setShowDelete(false)}
        >
          <div className="max-w-[75%] sm:max-w-[60%] relative">
            {/* Delete Button */}
            {onDelete && showDelete && !message.isOptimistic && (
              <button
                onClick={() => setShowConfirmModal(true)}
                className="absolute -left-12 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-[#FF6B6B] border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] text-black opacity-0 group-hover:opacity-100 transition-all hover:-translate-y-[calc(50%+2px)] hover:-translate-x-[2px] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-[calc(50%+2px)] active:translate-x-[2px] active:shadow-none"
                title="Delete message"
              >
                <Trash2 className="w-4 h-4 stroke-[3]" />
              </button>
            )}
            
            {/* Own Message Bubble */}
            <div className={`bg-[#4ECDC4] border-2 border-black text-black rounded-2xl rounded-tr-none px-4 py-3 shadow-[4px_4px_0px_rgba(0,0,0,1)] ${message.isOptimistic ? 'opacity-70' : ''}`}>
              <p className="text-sm sm:text-base font-bold wrap-break-word leading-relaxed">{message.text}</p>
            </div>
            
            {/* Timestamp and Read Receipt */}
            <div className="flex items-center justify-end gap-1.5 mt-2">
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-600">
                {formatTime(message.timestamp)}
              </p>
              {!message.isOptimistic && (
                <>
                  {message.isRead ? (
                    <span title="Read">
                      <CheckCheck className="w-4 h-4 stroke-[3] text-black" />
                    </span>
                  ) : (
                    <span title="Delivered">
                      <Check className="w-4 h-4 stroke-[3] text-gray-400" />
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
          title="DELETE MESSAGE?"
          message="ARE YOU SURE YOU WANT TO DELETE THIS MESSAGE? THIS ACTION CANNOT BE UNDONE."
          confirmText="DELETE"
          cancelText="CANCEL"
          type="danger"
          icon="trash"
        />
      </>
    );
  }

  return (
    <div className="flex justify-start animate-slide-up font-sans">
      <div className="max-w-[75%] sm:max-w-[60%]">
        {/* Other Message Bubble */}
        <div className="bg-white text-black border-2 border-black rounded-2xl rounded-tl-none px-4 py-3 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <p className="text-sm sm:text-base font-bold wrap-break-word leading-relaxed">{message.text}</p>
        </div>
        
        {/* Timestamp */}
        <p className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-600 mt-2">
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}