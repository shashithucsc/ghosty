'use client';

import { X, CheckCircle, XCircle, Download } from 'lucide-react';

interface ViewDocumentModalProps {
  request: {
    id: string;
    anonymousName: string;
    avatar: string;
    fileType: string;
    fileUrl: string;
    university: string;
  };
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export function ViewDocumentModal({
  request,
  onClose,
  onApprove,
  onReject,
}: ViewDocumentModalProps) {
  const getFileTypeLabel = (type: string) => {
    switch (type) {
      case 'student_id':
        return 'Student ID';
      case 'facebook':
        return 'Facebook Profile';
      case 'academic':
        return 'Academic Document';
      default:
        return type;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glassmorphic-card w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{request.avatar}</div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                {request.anonymousName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {getFileTypeLabel(request.fileType)} - {request.university}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="text-gray-600 dark:text-gray-400" size={24} />
          </button>
        </div>

        {/* Document Preview */}
        <div className="p-6">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 mb-6">
            {/* Mock document preview */}
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <div className="w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                <Download className="text-purple-600 dark:text-purple-400" size={40} />
              </div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Document Preview
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                In a real application, the uploaded document would be displayed here.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                File: {request.fileUrl}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-semibold"
            >
              Close
            </button>
            <button
              onClick={onReject}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-semibold"
            >
              <XCircle size={20} />
              Reject
            </button>
            <button
              onClick={onApprove}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors font-semibold"
            >
              <CheckCircle size={20} />
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
