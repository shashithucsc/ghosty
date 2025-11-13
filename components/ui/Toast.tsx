'use client';

import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const colors = {
    success: 'bg-green-600 dark:bg-green-700 text-white',
    error: 'bg-red-600 dark:bg-red-700 text-white',
    warning: 'bg-yellow-400 dark:bg-yellow-500 text-black',
    info: 'bg-blue-600 dark:bg-blue-700 text-white',
  };

  return (
    <div className="fixed top-4 right-4 z-9999 animate-slide-in-right">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${colors[type]} min-w-[300px] max-w-md`}>
        <div className="shrink-0">
          {icons[type]}
        </div>
        <p className="flex-1 text-sm font-medium">
          {message}
        </p>
        <button
          onClick={onClose}
          className="shrink-0 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function SuccessToast({ message, onClose }: { message: string; onClose: () => void }) {
  return <Toast message={message} type="success" onClose={onClose} />;
}

export function ErrorToast({ message, onClose }: { message: string; onClose: () => void }) {
  return <Toast message={message} type="error" onClose={onClose} />;
}

export function WarningToast({ message, onClose }: { message: string; onClose: () => void }) {
  return <Toast message={message} type="warning" onClose={onClose} />;
}

export function InfoToast({ message, onClose }: { message: string; onClose: () => void }) {
  return <Toast message={message} type="info" onClose={onClose} />;
}
