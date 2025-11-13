'use client';

import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Ban,
  Filter,
  Calendar
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

interface Report {
  id: string;
  reporter_id: string | null;
  reported_user_id: string | null;
  reason: string | null;
  description: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  updated_at: string;
  reporter?: {
    id: string;
    username: string;
    email: string | null;
  };
  reported_user?: {
    id: string;
    username: string;
    email: string | null;
    verification_status: string;
    is_restricted: boolean;
    report_count: number;
  };
}

export function ReportsManagement() {
  const [reports, setReports] = useState<Report[]>([]);
  const [totalReports, setTotalReports] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed' | 'resolved' | 'dismissed'>('all');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalAction, setModalAction] = useState<{ type: string; report: Report | null }>({ type: '', report: null });
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const params = new URLSearchParams({
        status: statusFilter,
        limit: '50',
      });

      const response = await fetch(`/api/admin/reports?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('Reports API response status:', response.status);
      const data = await response.json();
      console.log('Reports API response data:', data);
      
      if (response.ok) {
        setReports(data.reports || []);
        setTotalReports(data.pagination?.total || 0);
      } else {
        console.error('API error:', data.error);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleAction = (type: string, report: Report) => {
    setModalAction({ type, report });
    setAdminNotes('');
    setShowConfirmModal(true);
  };

  const confirmAction = async () => {
    if (!modalAction.report) return;

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      if (!token || !userId) return;

      let status: string;
      let restrictUser = false;

      switch (modalAction.type) {
        case 'resolve':
          status = 'resolved';
          break;
        case 'dismiss':
          status = 'dismissed';
          break;
        case 'restrict':
          status = 'resolved';
          restrictUser = true;
          break;
        default:
          return;
      }

      const response = await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          adminId: userId,
          reportId: modalAction.report.id,
          status,
          adminNotes: adminNotes || undefined,
          restrictUser,
        }),
      });

      if (response.ok) {
        // Refresh reports
        fetchReports();
      }
    } catch (error) {
      console.error('Error updating report:', error);
    }

    setShowConfirmModal(false);
    setModalAction({ type: '', report: null });
    setAdminNotes('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';
      case 'resolved':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'ignored':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'Harassment':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      case 'Inappropriate Content':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
      case 'Fake Profile':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
      case 'Spam':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';
      default:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="spinner-large mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading reports...</p>
        </div>
      </div>
    );
  }

  const pendingCount = reports.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Reports Management
        </h2>
        <div className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-semibold">
          <AlertTriangle size={20} />
          {pendingCount} Pending
        </div>
      </div>

      {/* Filter */}
      <div className="glassmorphic-card p-4">
        <div className="flex items-center gap-4">
          <Filter className="text-gray-400" size={20} />
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                statusFilter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              All ({totalReports})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Pending ({statusFilter === 'pending' ? reports.length : '?'})
            </button>
            <button
              onClick={() => setStatusFilter('resolved')}
              className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                statusFilter === 'resolved'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Resolved ({statusFilter === 'resolved' ? reports.length : '?'})
            </button>
            <button
              onClick={() => setStatusFilter('dismissed')}
              className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                statusFilter === 'dismissed'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Dismissed ({statusFilter === 'dismissed' ? reports.length : '?'})
            </button>
          </div>
        </div>
      </div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600 dark:text-green-400" size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              No Reports Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {statusFilter === 'all' 
                ? 'No reports at the moment.' 
                : `No ${statusFilter} reports.`}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="glassmorphic-card p-6 hover:shadow-lg transition-shadow"
            >
              {/* Report Header */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-linear-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {report.reported_user?.username?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      {report.reported_user?.username || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Reported by: {report.reporter?.username || 'Unknown'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getReasonColor(report.reason || '')}`}>
                    {report.reason || 'No reason'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(report.status)}`}>
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Report Details */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {report.description}
                </p>
              </div>

              {/* Report Meta */}
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <Calendar size={16} />
                {new Date(report.created_at).toLocaleDateString()} at{' '}
                {new Date(report.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>

              {/* Actions */}
              {report.status === 'pending' && (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleAction('resolve', report)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors font-semibold"
                  >
                    <CheckCircle size={18} />
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => handleAction('restrict', report)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-semibold"
                  >
                    <Ban size={18} />
                    Restrict User
                  </button>
                  <button
                    onClick={() => handleAction('dismiss', report)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-semibold"
                  >
                    <XCircle size={18} />
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && modalAction.report && (
        <ConfirmModal
          title={`Confirm ${modalAction.type.charAt(0).toUpperCase() + modalAction.type.slice(1)}`}
          message={`Are you sure you want to ${modalAction.type} this report against ${modalAction.report.reported_user?.username || 'this user'}?`}
          confirmLabel={modalAction.type.charAt(0).toUpperCase() + modalAction.type.slice(1)}
          cancelLabel="Cancel"
          onConfirm={confirmAction}
          onCancel={() => {
            setShowConfirmModal(false);
            setModalAction({ type: '', report: null });
          }}
          type={modalAction.type === 'restrict' ? 'danger' : 'warning'}
        />
      )}
    </div>
  );
}
