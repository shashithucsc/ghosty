'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle,
  Ban,
  Trash2,
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

interface User {
  id: string;
  username: string;
  email: string | null;
  registration_type: string;
  verification_status: string;
  is_restricted: boolean;
  report_count: number;
  created_at: string;
  university_name?: string | null;
}

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalAction, setModalAction] = useState<{ type: string; user: User | null }>({ type: '', user: null });
  const usersPerPage = 20;

  useEffect(() => {
    fetchUsers();
  }, [currentPage, verifiedFilter, searchQuery]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: usersPerPage.toString(),
      });

      if (verifiedFilter !== 'all') {
        params.append('verificationStatus', verifiedFilter);
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('Users API response status:', response.status);
      const data = await response.json();
      console.log('Users API response data:', data);
      
      if (response.ok) {
        setUsers(data.users || []);
        setTotalUsers(data.pagination?.total || 0);
      } else {
        console.error('API error:', data.error);
        if (data.details) {
          console.error('Validation details:', data.details);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Pagination
  const totalPages = Math.ceil(totalUsers / usersPerPage);

  const handleAction = (type: string, user: User) => {
    setModalAction({ type, user });
    setShowConfirmModal(true);
  };

  const confirmAction = async () => {
    if (!modalAction.user) return;

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      if (!token || !userId) return;

      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          adminId: userId,
          userId: modalAction.user.id,
          action: modalAction.type,
        }),
      });

      console.log('Action response status:', response.status);
      const data = await response.json();
      console.log('Action response data:', data);

      if (response.ok) {
        // Refresh users list
        fetchUsers();
      } else {
        console.error('Action failed:', data.error);
      }
    } catch (error) {
      console.error('Error performing action:', error);
    }

    setShowConfirmModal(false);
    setModalAction({ type: '', user: null });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="spinner-large mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Users Management
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total: {totalUsers} users
        </div>
      </div>

      {/* Search & Filters */}
      <div className="glassmorphic-card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or university..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 text-gray-800 dark:text-white"
            />
          </div>

          {/* Verified Filter */}
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400" size={20} />
            <select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value as any)}
              className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 text-gray-800 dark:text-white"
            >
              <option value="all">All Users</option>
              <option value="verified">Verified Only</option>
              <option value="unverified">Non-Verified Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table/Cards */}
      <div className="space-y-4">
        {/* Desktop Table View */}
        <div className="hidden lg:block glassmorphic-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    University
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Reports
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 dark:text-white">
                            {user.username}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {user.university_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {user.verification_status === 'verified' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-sm font-semibold">
                          <CheckCircle size={16} />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-sm font-semibold">
                          <XCircle size={16} />
                          Not Verified
                        </span>
                      )}
                      {user.is_restricted && (
                        <span className="ml-2 inline-flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-sm font-semibold">
                          <Ban size={16} />
                          Restricted
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        user.report_count > 3
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          : user.report_count > 0
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}>
                        {user.report_count}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {user.is_restricted ? (
                          <button
                            onClick={() => handleAction('unrestrict', user)}
                            className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                            title="Unrestrict User"
                          >
                            <CheckCircle size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAction('restrict', user)}
                            className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                            title="Restrict User"
                          >
                            <Ban size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleAction('delete', user)}
                          className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {users.map((user) => (
            <div key={user.id} className="glassmorphic-card p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      {user.username}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.university_name || 'No university'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {user.verification_status === 'verified' ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-sm font-semibold">
                    <CheckCircle size={16} />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-sm font-semibold">
                    <XCircle size={16} />
                    Not Verified
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  user.report_count > 3
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}>
                  {user.report_count} Reports
                </span>
              </div>

              <div className="flex gap-2">
                {user.is_restricted ? (
                  <button
                    onClick={() => handleAction('unrestrict', user)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors font-semibold"
                  >
                    <CheckCircle size={18} />
                    Unrestrict
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction('restrict', user)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors font-semibold"
                  >
                    <Ban size={18} />
                    Restrict
                  </button>
                )}
                <button
                  onClick={() => handleAction('delete', user)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors font-semibold"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between glassmorphic-card p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && modalAction.user && (
        <ConfirmModal
          title={`Confirm ${modalAction.type.charAt(0).toUpperCase() + modalAction.type.slice(1)}`}
          message={`Are you sure you want to ${modalAction.type} user ${modalAction.user.username}?`}
          confirmLabel={modalAction.type.charAt(0).toUpperCase() + modalAction.type.slice(1)}
          cancelLabel="Cancel"
          onConfirm={confirmAction}
          onCancel={() => setShowConfirmModal(false)}
          type={modalAction.type === 'delete' ? 'danger' : modalAction.type === 'restrict' ? 'warning' : 'info'}
        />
      )}
    </div>
  );
}
