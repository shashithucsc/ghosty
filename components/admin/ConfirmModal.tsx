'use client';

import { AlertTriangle, XCircle } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'warning' | 'danger';
}

export function ConfirmModal({
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  type = 'warning',
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
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-semibold"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-colors ${
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
