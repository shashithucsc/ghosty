'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Download, Loader, ExternalLink, User, Building, BookOpen, Calendar, FileText } from 'lucide-react';

interface ViewDocumentModalProps {
  request: {
    id: string;
    userId: string;
    anonymousName: string;
    avatar: string;
    fileType: string;
    fileUrl: string;
    university: string;
    uploadDate?: string;
    status?: string;
    fullName?: string | null;
    faculty?: string | null;
    bio?: string | null;
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
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'pdf' | 'unknown'>('unknown');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch signed URL for document
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        const response = await fetch(
          `/api/admin/verifications/document?verificationId=${request.id}&userId=${request.userId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch document');
        }

        const data = await response.json();
        setDocumentUrl(data.document?.url || request.fileUrl);
        setFileType(data.document?.fileType || 'unknown');
      } catch (err) {
        console.error('Error fetching document:', err);
        setError(err instanceof Error ? err.message : 'Failed to load document');
        // Fallback to original URL
        setDocumentUrl(request.fileUrl);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [request.id, request.userId, request.fileUrl]);

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

  const openInNewTab = () => {
    if (documentUrl) {
      window.open(documentUrl, '_blank');
    }
  };

  const isPending = request.status === 'pending';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glassmorphic-card w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between z-10">
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

        <div className="p-6">
          {/* User Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* User Info Card */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
              <h4 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <User size={18} />
                User Information
              </h4>
              
              {request.fullName && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Full Name:</span>
                  <span className="font-medium text-gray-800 dark:text-white">{request.fullName}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Username:</span>
                <span className="font-medium text-gray-800 dark:text-white">{request.anonymousName}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">User ID:</span>
                <span className="font-mono text-xs text-gray-600 dark:text-gray-400">{request.userId}</span>
              </div>
            </div>

            {/* University Info Card */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
              <h4 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <Building size={18} />
                Academic Information
              </h4>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">University:</span>
                <span className="font-medium text-gray-800 dark:text-white">{request.university}</span>
              </div>
              
              {request.faculty && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Faculty:</span>
                  <span className="font-medium text-gray-800 dark:text-white">{request.faculty}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Proof Type:</span>
                <span className="font-medium text-gray-800 dark:text-white">{getFileTypeLabel(request.fileType)}</span>
              </div>
              
              {request.uploadDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Submitted:</span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {new Date(request.uploadDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bio Section */}
          {request.bio && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6">
              <h4 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-2">
                <BookOpen size={18} />
                Bio
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{request.bio}</p>
            </div>
          )}

          {/* Document Preview */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <FileText size={18} />
                Verification Document
              </h4>
              {documentUrl && (
                <button
                  onClick={openInNewTab}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                >
                  <ExternalLink size={16} />
                  Open in New Tab
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <Loader className="animate-spin text-purple-600 mb-4" size={40} />
                <p className="text-gray-600 dark:text-gray-400">Loading document...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                  <XCircle className="text-red-600 dark:text-red-400" size={40} />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  Failed to Load Document
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                {documentUrl && (
                  <button
                    onClick={openInNewTab}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Try Opening Directly
                  </button>
                )}
              </div>
            ) : documentUrl ? (
              <div className="min-h-[400px]">
                {fileType === 'image' ? (
                  <div className="flex justify-center">
                    <img
                      src={documentUrl}
                      alt="Verification Document"
                      className="max-w-full max-h-[500px] rounded-lg object-contain"
                      onError={() => setError('Failed to load image')}
                    />
                  </div>
                ) : fileType === 'pdf' ? (
                  <iframe
                    src={documentUrl}
                    className="w-full h-[500px] rounded-lg"
                    title="Verification Document"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                    <div className="w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                      <Download className="text-purple-600 dark:text-purple-400" size={40} />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                      Document Ready
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Click below to view or download the document
                    </p>
                    <button
                      onClick={openInNewTab}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <ExternalLink size={18} />
                      Open Document
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <FileText className="text-gray-400" size={40} />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  No Document Available
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  The verification document could not be found.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-semibold"
            >
              Close
            </button>
            {isPending && (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
