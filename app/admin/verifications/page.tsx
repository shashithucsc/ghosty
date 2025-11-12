'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  CheckCircle,
  XCircle,
  Eye,
  User,
  Calendar,
  FileText,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Download,
} from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import Link from 'next/link';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Verification {
  id: string;
  user_id: string;
  file_url: string;
  proof_type: string;
  status: string;
  admin_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  user?: {
    id: string;
    username: string;
    full_name: string;
    email: string | null;
    university: string;
    faculty: string;
    bio: string;
    partner_preferences: string;
    birthday: string;
    gender: string;
  };
}

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [filteredVerifications, setFilteredVerifications] = useState<Verification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const itemsPerPage = 10;

  // Fetch verifications from Supabase
  useEffect(() => {
    fetchVerifications();
  }, []);

  // Filter and search
  useEffect(() => {
    let filtered = verifications;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((v) => v.status === statusFilter);
    }

    // Search by username, university, or proof type
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.user?.username?.toLowerCase().includes(query) ||
          v.user?.full_name?.toLowerCase().includes(query) ||
          v.user?.university?.toLowerCase().includes(query) ||
          v.proof_type.toLowerCase().includes(query)
      );
    }

    setFilteredVerifications(filtered);
    setCurrentPage(1);
  }, [verifications, statusFilter, searchQuery]);

  const fetchVerifications = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('verifications')
        .select(
          `
          *,
          user:users!verifications_user_id_fkey (
            id,
            username,
            full_name,
            email,
            university,
            faculty,
            bio,
            partner_preferences,
            birthday,
            gender
          )
        `
        )
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching verifications:', error);
        showToast('Failed to fetch verifications', 'error');
        return;
      }

      setVerifications(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
      showToast('An unexpected error occurred', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (verification: Verification) => {
    if (!confirm(`Are you sure you want to approve ${verification.user?.username}'s verification?`)) {
      return;
    }

    setProcessingId(verification.id);

    try {
      // Call API to approve verification
      const response = await fetch('/api/admin/verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          verificationId: verification.id,
          userId: verification.user_id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(`${verification.user?.username}'s verification approved successfully!`, 'success');
        fetchVerifications(); // Refresh list
      } else {
        showToast(data.error || 'Failed to approve verification', 'error');
      }
    } catch (error) {
      console.error('Error approving verification:', error);
      showToast('An error occurred while approving', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (verification: Verification) => {
    const reason = prompt(
      `Why are you rejecting ${verification.user?.username}'s verification?\n\nEnter rejection reason:`
    );

    if (!reason || !reason.trim()) {
      return; // User cancelled or empty reason
    }

    setProcessingId(verification.id);

    try {
      // Call API to reject verification
      const response = await fetch('/api/admin/verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          verificationId: verification.id,
          userId: verification.user_id,
          reason: reason.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(`${verification.user?.username}'s verification rejected`, 'success');
        fetchVerifications(); // Refresh list
      } else {
        showToast(data.error || 'Failed to reject verification', 'error');
      }
    } catch (error) {
      console.error('Error rejecting verification:', error);
      showToast('An error occurred while rejecting', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const viewProfile = (verification: Verification) => {
    setSelectedVerification(verification);
    setShowModal(true);
  };

  const viewFile = (verification: Verification) => {
    setSelectedVerification(verification);
    setShowFileModal(true);
  };

  const getProofTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      student_id: '🎓 Student ID',
      facebook: '📘 Facebook Profile',
      academic: '📄 Academic Document',
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  // Pagination
  const totalPages = Math.ceil(filteredVerifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVerifications = filteredVerifications.slice(startIndex, endIndex);

  const calculateAge = (birthday: string) => {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader />

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg max-w-md animate-slide-in ${
            toast.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Verification Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Review and manage user verification requests
              </p>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Back to Dashboard
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {verifications.length}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {verifications.filter((v) => v.status === 'pending').length}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {verifications.filter((v) => v.status === 'approved').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Rejected</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {verifications.filter((v) => v.status === 'rejected').length}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by username, name, or university..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : currentVerifications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No verifications found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {statusFilter !== 'all'
                  ? `No ${statusFilter} verifications at the moment`
                  : 'There are no verification requests yet'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Proof Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        University
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {currentVerifications.map((verification) => (
                      <tr
                        key={verification.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {verification.user?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {verification.user?.username || 'Unknown'}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {verification.user?.full_name || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 dark:text-white">
                            {getProofTypeLabel(verification.proof_type)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {verification.user?.university || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {verification.user?.faculty || ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(verification.submitted_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusBadge(
                              verification.status
                            )}`}
                          >
                            {verification.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => viewProfile(verification)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="View Profile"
                            >
                              <User className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => viewFile(verification)}
                              className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                              title="View Document"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {verification.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(verification)}
                                  disabled={processingId === verification.id}
                                  className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors disabled:opacity-50"
                                  title="Approve"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleReject(verification)}
                                  disabled={processingId === verification.id}
                                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-gray-200 dark:divide-gray-700">
                {currentVerifications.map((verification) => (
                  <div key={verification.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {verification.user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {verification.user?.username || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {verification.user?.full_name || 'N/A'}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusBadge(
                          verification.status
                        )}`}
                      >
                        {verification.status}
                      </span>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400 w-32">Proof Type:</span>
                        <span className="text-gray-900 dark:text-white">
                          {getProofTypeLabel(verification.proof_type)}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400 w-32">University:</span>
                        <span className="text-gray-900 dark:text-white">
                          {verification.user?.university || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400 w-32">Submitted:</span>
                        <span className="text-gray-900 dark:text-white">
                          {new Date(verification.submitted_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => viewProfile(verification)}
                        className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        <User className="w-4 h-4 inline mr-1" />
                        Profile
                      </button>
                      <button
                        onClick={() => viewFile(verification)}
                        className="flex-1 px-3 py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-semibold hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                      >
                        <Eye className="w-4 h-4 inline mr-1" />
                        Document
                      </button>
                      {verification.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(verification)}
                            disabled={processingId === verification.id}
                            className="px-3 py-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(verification)}
                            disabled={processingId === verification.id}
                            className="px-3 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredVerifications.length)} of{' '}
                      {filteredVerifications.length} results
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {showModal && selectedVerification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Profile</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b dark:border-gray-700">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {selectedVerification.user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {selectedVerification.user?.full_name || 'N/A'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      @{selectedVerification.user?.username || 'unknown'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Age</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {selectedVerification.user?.birthday
                        ? calculateAge(selectedVerification.user.birthday)
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Gender</p>
                    <p className="font-semibold text-gray-900 dark:text-white capitalize">
                      {selectedVerification.user?.gender || 'N/A'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">University</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {selectedVerification.user?.university || 'N/A'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Faculty</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {selectedVerification.user?.faculty || 'N/A'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Bio</p>
                  <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    {selectedVerification.user?.bio || 'No bio provided'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Partner Preferences
                  </p>
                  <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    {selectedVerification.user?.partner_preferences || 'No preferences provided'}
                  </p>
                </div>

                {selectedVerification.admin_notes && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-400 mb-1">
                      Admin Notes
                    </p>
                    <p className="text-yellow-700 dark:text-yellow-300">
                      {selectedVerification.admin_notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Modal */}
      {showFileModal && selectedVerification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Verification Document
                </h2>
                <button
                  onClick={() => setShowFileModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Proof Type: <span className="font-semibold">{getProofTypeLabel(selectedVerification.proof_type)}</span>
                </p>
              </div>

              {selectedVerification.file_url.endsWith('.pdf') ? (
                <div className="text-center">
                  <FileText className="w-24 h-24 text-red-500 mx-auto mb-4" />
                  <p className="text-gray-700 dark:text-gray-300 mb-4">PDF Document</p>
                  <a
                    href={selectedVerification.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Open PDF in New Tab
                  </a>
                </div>
              ) : (
                <img
                  src={selectedVerification.file_url}
                  alt="Verification Document"
                  className="w-full rounded-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
