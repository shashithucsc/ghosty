'use client';

import { AlertTriangle, XCircle } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'warning' | 'danger' | 'info';
  showReasonInput?: boolean;
  reason?: string;
  onReasonChange?: (reason: string) => void;
  disabled?: boolean;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  type = 'warning',
  showReasonInput = false,
  reason = '',
  onReasonChange,
  disabled = false,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="glassmorphic-card w-full max-w-md p-6 animate-scale-in">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              type === 'danger'
                ? 'bg-red-100 dark:bg-red-900/30'
                : 'bg-orange-100 dark:bg-orange-900/30'
            }`}
          >
            {type === 'danger' ? (
              <XCircle
                className="text-red-600 dark:text-red-400"
                size={32}
              />
            ) : (
              <AlertTriangle
                className="text-orange-600 dark:text-orange-400"
                size={32}
              />
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-center text-gray-800 dark:text-white mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
          {message}
        </p>

        {/* Reason Input (for rejections) */}
        {showReasonInput && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rejection Reason (optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => onReasonChange?.(e.target.value)}
              placeholder="Provide a reason for rejection..."
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800 dark:text-white resize-none"
              rows={3}
              disabled={disabled}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={disabled}
            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={disabled}
            className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              type === 'danger'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
