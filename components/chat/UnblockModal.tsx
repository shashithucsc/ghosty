'use client';

import { X, CheckCircle2, MessageSquare, RefreshCcw } from 'lucide-react';

interface UnblockModalProps {
  userName: string;
  onUnblock: () => void;
  onClose: () => void;
}

export function UnblockModal({ userName, onUnblock, onClose }: UnblockModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 animate-fade-in font-sans text-black">
      {/* Modal Container */}
      <div className="bg-white border-4 border-black shadow-[12px_12px_0px_rgba(0,0,0,1)] max-w-md w-full p-6 animate-scale-in">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black uppercase tracking-tight">
            Unblock User?
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-white border-4 border-black flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-[#FF6B6B] hover:text-white active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all"
          >
            <X className="w-5 h-5 stroke-[4]" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          {/* Warning Box */}
          <div className="bg-[#4ECDC4] border-4 border-black rounded-xl p-4 mb-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <p className="text-sm font-bold text-black uppercase leading-relaxed">
              You are about to unblock <span className="font-black px-2 py-0.5 bg-white border-2 border-black mx-1 shadow-[2px_2px_0px_rgba(0,0,0,1)]">{userName}</span>.
            </p>
          </div>

          {/* Details List (Replaced Emojis with Lucide Icons) */}
          <div className="space-y-3 text-sm font-bold text-gray-800 uppercase tracking-wider">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 stroke-[3] text-[#A3E635] shrink-0 mt-0.5" />
              <p>They will be able to send you messages again</p>
            </div>
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 stroke-[3] text-[#FFD166] shrink-0 mt-0.5" />
              <p>You can start a new conversation with them</p>
            </div>
            <div className="flex items-start gap-3">
              <RefreshCcw className="w-5 h-5 stroke-[3] shrink-0 mt-0.5 text-black" />
              <p>You can block them again anytime if needed</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white border-4 border-black text-black font-black uppercase shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-[#F8F9FA] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onUnblock}
            className="flex-1 px-4 py-3 bg-[#A3E635] border-4 border-black text-black font-black uppercase shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-[#86efac] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all"
          >
            Unblock
          </button>
        </div>
      </div>
    </div>
  );
}