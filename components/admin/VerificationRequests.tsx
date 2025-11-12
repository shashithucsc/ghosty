'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Eye,
  Calendar,
  User
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import { ViewDocumentModal } from './ViewDocumentModal';

interface VerificationRequest {
  id: string;
  userId: string;
  anonymousName: string;
  avatar: string;
  university: string;
  fileType: 'student_id' | 'facebook' | 'academic';
  fileUrl: string;
  uploadDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

export function VerificationRequests() {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [modalAction, setModalAction] = useState<'approve' | 'reject'>('approve');

  useEffect(() => {
    // Mock data - replace with API call
    setTimeout(() => {
      const mockRequests: VerificationRequest[] = [
        {
          id: '1',
          userId: '101',
          anonymousName: 'CharmingSoul456',
          avatar: '👩',
          university: 'Stanford University',
          fileType: 'student_id',
          fileUrl: '/mock-student-id.jpg',
          uploadDate: '2025-01-15T10:30:00',
          status: 'pending',
        },
        {
          id: '2',
          userId: '102',
          anonymousName: 'BraveExplorer789',
          avatar: '🧑',
          university: 'MIT',
          fileType: 'facebook',
          fileUrl: '/mock-facebook.jpg',
          uploadDate: '2025-01-14T14:20:00',
          status: 'pending',
        },
        {
          id: '3',
          userId: '103',
          anonymousName: 'GentleDreamer234',
          avatar: '🌸',
          university: 'Harvard University',
          fileType: 'academic',
          fileUrl: '/mock-academic.pdf',
          uploadDate: '2025-01-13T09:15:00',
          status: 'pending',
        },
      ];
      
      setRequests(mockRequests.filter(r => r.status === 'pending'));
      setLoading(false);
    }, 500);
  }, []);

  const handleAction = (action: 'approve' | 'reject', request: VerificationRequest) => {
    setModalAction(action);
    setSelectedRequest(request);
    setShowConfirmModal(true);
  };

  const confirmAction = () => {
    if (!selectedRequest) return;

    if (modalAction === 'approve') {
      setRequests(requests.filter(r => r.id !== selectedRequest.id));
      // In real app: Update user's isVerified status in database
    } else {
      setRequests(requests.filter(r => r.id !== selectedRequest.id));
      // In real app: Update verification status to rejected
    }

    setShowConfirmModal(false);
    setSelectedRequest(null);
  };

  const viewDocument = (request: VerificationRequest) => {
    setSelectedRequest(request);
    setShowDocumentModal(true);
  };

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

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'student_id':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'facebook':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
      case 'academic':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="spinner-large mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading verification requests...</p>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600 dark:text-green-400" size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            All Caught Up!
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No pending verification requests at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Verification Requests
        </h2>
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl font-semibold">
          <FileText size={20} />
          {requests.length} Pending
        </div>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {requests.map((request) => (
          <div
            key={request.id}
            className="glassmorphic-card p-6 hover:shadow-lg transition-shadow"
          >
            {/* User Info */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{request.avatar}</div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    {request.anonymousName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {request.university}
                  </p>
                </div>
              </div>
            </div>

            {/* File Info */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  File Type:
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${getFileTypeColor(
                    request.fileType
                  )}`}
                >
                  {getFileTypeLabel(request.fileType)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Calendar size={16} />
                  Uploaded:
                </span>
                <span className="text-sm font-semibold text-gray-800 dark:text-white">
                  {new Date(request.uploadDate).toLocaleDateString()} at{' '}
                  {new Date(request.uploadDate).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <User size={16} />
                  User ID:
                </span>
                <span className="text-sm font-mono font-semibold text-gray-800 dark:text-white">
                  #{request.userId}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => viewDocument(request)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-semibold"
              >
                <Eye size={18} />
                View Document
              </button>
              <button
                onClick={() => handleAction('approve', request)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors font-semibold"
              >
                <CheckCircle size={18} />
                Approve
              </button>
              <button
                onClick={() => handleAction('reject', request)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-semibold"
              >
                <XCircle size={18} />
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && selectedRequest && (
        <ConfirmModal
          title={`${modalAction === 'approve' ? 'Approve' : 'Reject'} Verification`}
          message={`Are you sure you want to ${modalAction} the verification request from ${selectedRequest.anonymousName}?`}
          confirmLabel={modalAction === 'approve' ? 'Approve' : 'Reject'}
          cancelLabel="Cancel"
          onConfirm={confirmAction}
          onCancel={() => {
            setShowConfirmModal(false);
            setSelectedRequest(null);
          }}
          type={modalAction === 'reject' ? 'danger' : 'warning'}
        />
      )}

      {/* Document Viewer Modal */}
      {showDocumentModal && selectedRequest && (
        <ViewDocumentModal
          request={selectedRequest}
          onClose={() => {
            setShowDocumentModal(false);
            setSelectedRequest(null);
          }}
          onApprove={() => {
            setShowDocumentModal(false);
            handleAction('approve', selectedRequest);
          }}
          onReject={() => {
            setShowDocumentModal(false);
            handleAction('reject', selectedRequest);
          }}
        />
      )}
    </div>
  );
}
