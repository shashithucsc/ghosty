'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Eye,
  Calendar,
  User,
  RefreshCw,
  Filter
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import { ViewDocumentModal } from './ViewDocumentModal';

interface VerificationRequest {
  id: string;
  userId: string;
  username: string;
  fullName: string | null;
  email: string | null;
  university: string;
  faculty: string | null;
  birthday: string | null;
  gender: string | null;
  bio: string | null;
  proofType: 'student_id' | 'facebook' | 'academic';
  fileUrl: string;
  submittedAt: string;
  reviewedAt: string | null;
  status: 'pending' | 'approved' | 'rejected';
}

export function VerificationRequests() {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [modalAction, setModalAction] = useState<'approve' | 'reject'>('approve');
  const [rejectReason, setRejectReason] = useState('');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch verification requests from API
  const fetchVerifications = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/verifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch verifications');
      }

      const data = await response.json();
      
      // Map API response to component format
      const mappedRequests: VerificationRequest[] = data.verifications.map((v: any) => ({
        id: v.id,
        userId: v.userId,
        username: v.username || 'Unknown',
        fullName: v.fullName,
        email: v.email,
        university: v.university || 'Unknown University',
        faculty: v.faculty,
        birthday: v.birthday,
        gender: v.gender,
        bio: v.bio,
        proofType: v.proofType || 'student_id',
        fileUrl: v.fileUrl,
        submittedAt: v.submittedAt,
        reviewedAt: v.reviewedAt,
        status: v.status,
      }));

      setRequests(mappedRequests);
    } catch (err) {
      console.error('Error fetching verifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch verifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  // Filter requests based on status
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter(r => r.status === statusFilter));
    }
  }, [requests, statusFilter]);

  const handleAction = (action: 'approve' | 'reject', request: VerificationRequest) => {
    setModalAction(action);
    setSelectedRequest(request);
    setRejectReason('');
    setShowConfirmModal(true);
  };

  const confirmAction = async () => {
    if (!selectedRequest) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/verifications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: modalAction,
          verificationId: selectedRequest.id,
          userId: selectedRequest.userId,
          reason: modalAction === 'reject' ? rejectReason : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${modalAction} verification`);
      }

      // Update local state - remove from pending or update status
      setRequests(prev => 
        prev.map(r => 
          r.id === selectedRequest.id 
            ? { ...r, status: modalAction === 'approve' ? 'approved' : 'rejected' as const }
            : r
        )
      );

      setShowConfirmModal(false);
      setSelectedRequest(null);
      setRejectReason('');
    } catch (err) {
      console.error(`Error ${modalAction}ing verification:`, err);
      setError(err instanceof Error ? err.message : `Failed to ${modalAction} verification`);
    } finally {
      setActionLoading(false);
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';
      case 'approved':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    }
  };

  const getAvatarEmoji = (gender: string | null) => {
    switch (gender?.toLowerCase()) {
      case 'male':
        return '👨';
      case 'female':
        return '👩';
      default:
        return '🧑';
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="text-red-600 dark:text-red-400" size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Error Loading Verifications
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => fetchVerifications()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (filteredRequests.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header with Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Verification Requests
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-sm"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="all">All</option>
              </select>
            </div>
            <button
              onClick={() => fetchVerifications(true)}
              disabled={refreshing}
              className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600 dark:text-green-400" size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              {statusFilter === 'pending' ? 'All Caught Up!' : `No ${statusFilter} requests`}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {statusFilter === 'pending' 
                ? 'No pending verification requests at the moment.'
                : `There are no ${statusFilter} verification requests.`}
            </p>
          </div>
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
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl font-semibold">
            <FileText size={20} />
            {requests.filter(r => r.status === 'pending').length} Pending
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-sm"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All</option>
            </select>
          </div>
          <button
            onClick={() => fetchVerifications(true)}
            disabled={refreshing}
            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRequests.map((request) => (
          <div
            key={request.id}
            className="glassmorphic-card p-6 hover:shadow-lg transition-shadow"
          >
            {/* User Info */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-4xl">{getAvatarEmoji(request.gender)}</div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">
                    {request.username}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {request.university}
                  </p>
                  {request.fullName && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {request.fullName}
                    </p>
                  )}
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </span>
            </div>

            {/* File Info */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Proof Type:
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${getFileTypeColor(
                    request.proofType
                  )}`}
                >
                  {getFileTypeLabel(request.proofType)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Calendar size={16} />
                  Submitted:
                </span>
                <span className="text-sm font-semibold text-gray-800 dark:text-white">
                  {new Date(request.submittedAt).toLocaleDateString()} at{' '}
                  {new Date(request.submittedAt).toLocaleTimeString([], {
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
                <span className="text-sm font-mono font-semibold text-gray-800 dark:text-white truncate max-w-[150px]">
                  {request.userId.slice(0, 8)}...
                </span>
              </div>

              {request.faculty && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Faculty:
                  </span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-white">
                    {request.faculty}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => viewDocument(request)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-semibold"
              >
                <Eye size={18} />
                View
              </button>
              {request.status === 'pending' && (
                <>
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
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && selectedRequest && (
        <ConfirmModal
          title={`${modalAction === 'approve' ? 'Approve' : 'Reject'} Verification`}
          message={
            modalAction === 'approve'
              ? `Are you sure you want to approve the verification request from ${selectedRequest.username}? This will grant them verified status.`
              : `Are you sure you want to reject the verification request from ${selectedRequest.username}?`
          }
          confirmLabel={actionLoading ? 'Processing...' : (modalAction === 'approve' ? 'Approve' : 'Reject')}
          cancelLabel="Cancel"
          onConfirm={confirmAction}
          onCancel={() => {
            setShowConfirmModal(false);
            setSelectedRequest(null);
            setRejectReason('');
          }}
          type={modalAction === 'reject' ? 'danger' : 'warning'}
          showReasonInput={modalAction === 'reject'}
          reason={rejectReason}
          onReasonChange={setRejectReason}
          disabled={actionLoading}
        />
      )}

      {/* Document Viewer Modal */}
      {showDocumentModal && selectedRequest && (
        <ViewDocumentModal
          request={{
            id: selectedRequest.id,
            userId: selectedRequest.userId,
            anonymousName: selectedRequest.username,
            avatar: getAvatarEmoji(selectedRequest.gender),
            university: selectedRequest.university,
            fileType: selectedRequest.proofType,
            fileUrl: selectedRequest.fileUrl,
            uploadDate: selectedRequest.submittedAt,
            status: selectedRequest.status,
            fullName: selectedRequest.fullName,
            faculty: selectedRequest.faculty,
            bio: selectedRequest.bio,
          }}
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
