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
  reporterId: string;
  reporterName: string;
  reportedUserId: string;
  reportedUserName: string;
  reportedUserAvatar: string;
  reason: string;
  description: string;
  date: string;
  status: 'pending' | 'resolved' | 'ignored';
}

export function ReportsManagement() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved' | 'ignored'>('all');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalAction, setModalAction] = useState<{ type: string; report: Report | null }>({ type: '', report: null });

  useEffect(() => {
    // Mock data - replace with API call
    setTimeout(() => {
      const mockReports: Report[] = [
        {
          id: '1',
          reporterId: '201',
          reporterName: 'CharmingSoul456',
          reportedUserId: '101',
          reportedUserName: 'BraveExplorer789',
          reportedUserAvatar: '🧑',
          reason: 'Inappropriate Content',
          description: 'Sending inappropriate messages in chat.',
          date: '2025-01-15T14:30:00',
          status: 'pending',
        },
        {
          id: '2',
          reporterId: '202',
          reporterName: 'GentleDreamer234',
          reportedUserId: '102',
          reportedUserName: 'SmartVibes567',
          reportedUserAvatar: '👨',
          reason: 'Harassment',
          description: 'Repeatedly messaging after being asked to stop.',
          date: '2025-01-14T10:15:00',
          status: 'pending',
        },
        {
          id: '3',
          reporterId: '203',
          reporterName: 'BoldAdventurer123',
          reportedUserId: '103',
          reportedUserName: 'QuietSoul890',
          reportedUserAvatar: '🌸',
          reason: 'Fake Profile',
          description: 'Profile seems to be using fake information.',
          date: '2025-01-13T16:45:00',
          status: 'resolved',
        },
        {
          id: '4',
          reporterId: '204',
          reporterName: 'CleverMind321',
          reportedUserId: '104',
          reportedUserName: 'CoolBreeze654',
          reportedUserAvatar: '✨',
          reason: 'Spam',
          description: 'Sending spam messages to multiple users.',
          date: '2025-01-12T09:20:00',
          status: 'pending',
        },
      ];
      
      setReports(mockReports);
      setFilteredReports(mockReports);
      setLoading(false);
    }, 500);
  }, []);

  // Filter by status
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredReports(reports);
    } else {
      setFilteredReports(reports.filter(r => r.status === statusFilter));
    }
  }, [statusFilter, reports]);

  const handleAction = (type: string, report: Report) => {
    setModalAction({ type, report });
    setShowConfirmModal(true);
  };

  const confirmAction = () => {
    if (!modalAction.report) return;

    switch (modalAction.type) {
      case 'resolve':
        setReports(reports.map(r => 
          r.id === modalAction.report!.id ? { ...r, status: 'resolved' as const } : r
        ));
        break;
      case 'ignore':
        setReports(reports.map(r => 
          r.id === modalAction.report!.id ? { ...r, status: 'ignored' as const } : r
        ));
        break;
      case 'restrict':
        setReports(reports.map(r => 
          r.id === modalAction.report!.id ? { ...r, status: 'resolved' as const } : r
        ));
        // In real app: Also restrict the reported user
        break;
    }

    setShowConfirmModal(false);
    setModalAction({ type: '', report: null });
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
              All ({reports.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                statusFilter === 'pending'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Pending ({reports.filter(r => r.status === 'pending').length})
            </button>
            <button
              onClick={() => setStatusFilter('resolved')}
              className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                statusFilter === 'resolved'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Resolved ({reports.filter(r => r.status === 'resolved').length})
            </button>
            <button
              onClick={() => setStatusFilter('ignored')}
              className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                statusFilter === 'ignored'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Ignored ({reports.filter(r => r.status === 'ignored').length})
            </button>
          </div>
        </div>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
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
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="glassmorphic-card p-6 hover:shadow-lg transition-shadow"
            >
              {/* Report Header */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="text-4xl">{report.reportedUserAvatar}</div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      {report.reportedUserName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Reported by: {report.reporterName}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getReasonColor(report.reason)}`}>
                    {report.reason}
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
                {new Date(report.date).toLocaleDateString()} at{' '}
                {new Date(report.date).toLocaleTimeString([], {
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
                    onClick={() => handleAction('ignore', report)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-semibold"
                  >
                    <XCircle size={18} />
                    Ignore
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
          message={`Are you sure you want to ${modalAction.type} this report against ${modalAction.report.reportedUserName}?`}
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
