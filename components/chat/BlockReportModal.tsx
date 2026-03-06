'use client';

import { useState } from 'react';
import { X, ShieldAlert, Flag } from 'lucide-react';

interface BlockReportModalProps {
  userName: string;
  onBlock: (action: 'block' | 'report', reason: string) => void;
  onClose: () => void;
}

export function BlockReportModal({ userName, onBlock, onClose }: BlockReportModalProps) {
  const [action, setAction] = useState<'block' | 'report' | null>(null);
  const [reason, setReason] = useState('');
  const [otherReason, setOtherReason] = useState('');

  const blockReasons = [
    'Inappropriate behavior',
    'Spam or scam',
    'Harassment',
    'Fake profile',
    'Not interested',
    'Other',
  ];

  const reportReasons = [
    'Harassment or bullying',
    'Inappropriate content',
    'Spam or scam',
    'Fake profile',
    'Violent threats',
    'Other safety concern',
  ];

  const handleSubmit = () => {
    const finalReason = reason === 'Other' || reason === 'Other safety concern' ? otherReason : reason;
    if (finalReason.trim()) {
      onBlock(action!, finalReason);
    }
  };

  return (
    <>
      {/* Backdrop (Solid Black, No Blur) */}
      <div
        className="fixed inset-0 bg-black/90 z-50 animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none font-sans text-black">
        <div className="bg-white border-4 border-black shadow-[12px_12px_0px_rgba(0,0,0,1)] p-6 sm:p-8 max-w-md w-full animate-scale-in pointer-events-auto max-h-[90vh] overflow-y-auto custom-scrollbar">
          
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight mb-1">
                {action === 'block' ? 'Block User' : action === 'report' ? 'Report User' : 'Actions'}
              </h2>
              <p className="text-sm font-bold text-gray-600 uppercase tracking-widest">
                {userName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white border-4 border-black flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-[#FF6B6B] hover:text-white active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all -mt-2 -mr-2"
            >
              <X className="w-5 h-5 stroke-[4]" />
            </button>
          </div>

          {/* Initial Options */}
          {!action && (
            <div className="space-y-3">
              <button
                onClick={() => setAction('block')}
                className="w-full p-4 bg-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-[#FF6B6B] hover:text-white hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black border-2 border-black rounded-full flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-6 h-6 text-white stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-black uppercase text-lg group-hover:text-white">Block User</h3>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-600 group-hover:text-white/90">
                      They won't be able to contact you
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setAction('report')}
                className="w-full p-4 bg-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-[#FFD166] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black border-2 border-black rounded-full flex items-center justify-center shrink-0">
                    <Flag className="w-6 h-6 text-white stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="font-black uppercase text-lg group-hover:text-black">Report User</h3>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-600 group-hover:text-black/80">
                      Report to moderators for review
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Block Form */}
          {action === 'block' && (
            <div className="space-y-4">
              <div className="bg-[#FF6B6B] border-4 border-black p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <p className="text-sm font-bold text-black uppercase leading-relaxed">
                  <strong className="font-black text-lg block mb-1">Note:</strong> 
                  Blocking this user will prevent them from contacting you. You can unblock them later from settings.
                </p>
              </div>

              <div>
                <label className="block text-sm font-black uppercase tracking-widest text-black mb-3">
                  Reason for blocking (optional)
                </label>
                <div className="space-y-2">
                  {blockReasons.map((r) => (
                    <label key={r} className="block cursor-pointer">
                      <div className={`w-full p-3 border-4 border-black font-black uppercase tracking-wider text-sm transition-all ${
                        reason === r 
                          ? 'bg-black text-white shadow-[4px_4px_0px_rgba(255,107,107,1)] translate-y-[-2px] translate-x-[-2px]' 
                          : 'bg-white text-black hover:bg-[#F8F9FA]'
                      }`}>
                        <input
                          type="radio"
                          name="reason"
                          value={r}
                          checked={reason === r}
                          onChange={(e) => setReason(e.target.value)}
                          className="sr-only" // Hidden radio button, letting the label act as the block
                        />
                        {r}
                      </div>
                    </label>
                  ))}
                </div>

                {reason === 'Other' && (
                  <input
                    type="text"
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    placeholder="PLEASE SPECIFY..."
                    className="mt-3 w-full p-4 bg-[#F8F9FA] border-4 border-black font-bold uppercase focus:outline-none focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-shadow placeholder-gray-500"
                  />
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setAction(null)}
                  className="flex-1 py-4 bg-white border-4 border-black text-black font-black uppercase shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-[#F8F9FA] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-4 bg-[#FF6B6B] border-4 border-black text-black font-black uppercase shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-[#ff5252] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all"
                >
                  Block User
                </button>
              </div>
            </div>
          )}

          {/* Report Form */}
          {action === 'report' && (
            <div className="space-y-4">
              <div className="bg-[#FFD166] border-4 border-black p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <p className="text-sm font-bold text-black uppercase leading-relaxed">
                  <strong className="font-black text-lg block mb-1">Note:</strong> 
                  Your report will be reviewed by our moderation team. False reports may result in account suspension.
                </p>
              </div>

              <div>
                <label className="block text-sm font-black uppercase tracking-widest text-black mb-3">
                  Reason for reporting <span className="text-[#FF6B6B] text-lg">*</span>
                </label>
                <div className="space-y-2">
                  {reportReasons.map((r) => (
                    <label key={r} className="block cursor-pointer">
                      <div className={`w-full p-3 border-4 border-black font-black uppercase tracking-wider text-sm transition-all ${
                        reason === r 
                          ? 'bg-black text-white shadow-[4px_4px_0px_rgba(255,209,102,1)] translate-y-[-2px] translate-x-[-2px]' 
                          : 'bg-white text-black hover:bg-[#F8F9FA]'
                      }`}>
                        <input
                          type="radio"
                          name="reason"
                          value={r}
                          checked={reason === r}
                          onChange={(e) => setReason(e.target.value)}
                          className="sr-only" // Hidden radio button
                        />
                        {r}
                      </div>
                    </label>
                  ))}
                </div>

                {reason === 'Other safety concern' && (
                  <textarea
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    placeholder="PLEASE PROVIDE DETAILS..."
                    rows={3}
                    className="mt-3 w-full p-4 bg-[#F8F9FA] border-4 border-black font-bold uppercase focus:outline-none focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-shadow placeholder-gray-500 resize-none"
                  />
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setAction(null)}
                  className="flex-1 py-4 bg-white border-4 border-black text-black font-black uppercase shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-[#F8F9FA] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!reason}
                  className="flex-1 py-4 bg-[#FFD166] border-4 border-black text-black font-black uppercase shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-[#ffc033] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:translate-x-0 disabled:hover:shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                >
                  Submit Report
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}