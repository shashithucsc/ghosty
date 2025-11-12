'use client';

import { useState } from 'react';
import { X, ShieldAlert, Flag } from 'lucide-react';

interface BlockReportModalProps {
  userName: string;
  onBlock: (reason: string) => void;
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
    const finalReason = reason === 'Other' ? otherReason : reason;
    if (finalReason.trim()) {
      onBlock(finalReason);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="glassmorphic-card p-6 sm:p-8 max-w-md w-full animate-scale-in pointer-events-auto max-h-[90vh] overflow-y-auto custom-scrollbar">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-1">
                {action === 'block' ? 'Block User' : action === 'report' ? 'Report User' : 'Actions'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {userName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors -mt-2 -mr-2"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Initial Options */}
          {!action && (
            <div className="space-y-3">
              <button
                onClick={() => setAction('block')}
                className="w-full p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400" />
                  <div>
                    <h3 className="font-semibold text-red-600 dark:text-red-400">Block User</h3>
                    <p className="text-xs text-red-600/80 dark:text-red-400/80">
                      They won't be able to contact you
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setAction('report')}
                className="w-full p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500 rounded-xl hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <Flag className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  <div>
                    <h3 className="font-semibold text-yellow-600 dark:text-yellow-400">Report User</h3>
                    <p className="text-xs text-yellow-600/80 dark:text-yellow-400/80">
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
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-300">
                  <strong>Note:</strong> Blocking this user will prevent them from contacting you.
                  You can unblock them later from settings.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for blocking (optional)
                </label>
                <div className="space-y-2">
                  {blockReasons.map((r) => (
                    <label key={r} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="reason"
                        value={r}
                        checked={reason === r}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-4 h-4 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                        {r}
                      </span>
                    </label>
                  ))}
                </div>

                {reason === 'Other' && (
                  <input
                    type="text"
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    placeholder="Please specify..."
                    className="mt-3 w-full input-field"
                  />
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setAction(null)}
                  className="flex-1 btn-secondary py-3"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
                >
                  Block User
                </button>
              </div>
            </div>
          )}

          {/* Report Form */}
          {action === 'report' && (
            <div className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  <strong>Note:</strong> Your report will be reviewed by our moderation team.
                  False reports may result in account suspension.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for reporting <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {reportReasons.map((r) => (
                    <label key={r} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="reason"
                        value={r}
                        checked={reason === r}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-4 h-4 text-yellow-600 focus:ring-yellow-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                        {r}
                      </span>
                    </label>
                  ))}
                </div>

                {reason === 'Other safety concern' && (
                  <textarea
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    placeholder="Please provide details..."
                    rows={3}
                    className="mt-3 w-full input-field resize-none"
                  />
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setAction(null)}
                  className="flex-1 btn-secondary py-3"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!reason}
                  className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors"
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
