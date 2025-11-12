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
  anonymousName: string;
  avatar: string;
  isVerified: boolean;
  totalReports: number;
  university: string;
  registrationDate: string;
  isRestricted: boolean;
}

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'non-verified'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalAction, setModalAction] = useState<{ type: string; user: User | null }>({ type: '', user: null });
  const usersPerPage = 10;

  useEffect(() => {
    // Mock data - replace with API call
    setTimeout(() => {
      const mockUsers: User[] = [
        {
          id: '1',
          anonymousName: 'CharmingSoul456',
          avatar: '👩',
          isVerified: true,
          totalReports: 0,
          university: 'Stanford University',
          registrationDate: '2025-10-15',
          isRestricted: false,
        },
        {
          id: '2',
          anonymousName: 'BraveExplorer789',
          avatar: '🧑',
          isVerified: false,
          totalReports: 2,
          university: 'MIT',
          registrationDate: '2025-10-28',
          isRestricted: false,
        },
        {
          id: '3',
          anonymousName: 'GentleDreamer234',
          avatar: '🌸',
          isVerified: true,
          totalReports: 0,
          university: 'Harvard University',
          registrationDate: '2025-11-01',
          isRestricted: false,
        },
        {
          id: '4',
          anonymousName: 'SmartVibes567',
          avatar: '👨',
          isVerified: false,
          totalReports: 5,
          university: 'UC Berkeley',
          registrationDate: '2025-11-05',
          isRestricted: true,
        },
        // Add more mock users as needed
      ];
      
      // Duplicate for testing pagination
      const allUsers = [...mockUsers, ...mockUsers.map((u, i) => ({
        ...u,
        id: `${parseInt(u.id) + 4 + i}`,
        anonymousName: u.anonymousName + (i + 1),
      }))];
      
      setUsers(allUsers);
      setFilteredUsers(allUsers);
      setLoading(false);
    }, 500);
  }, []);

  // Search and filter
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.anonymousName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.university.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Verified filter
    if (verifiedFilter === 'verified') {
      filtered = filtered.filter((user) => user.isVerified);
    } else if (verifiedFilter === 'non-verified') {
      filtered = filtered.filter((user) => !user.isVerified);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchQuery, verifiedFilter, users]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const handleAction = (type: string, user: User) => {
    setModalAction({ type, user });
    setShowConfirmModal(true);
  };

  const confirmAction = () => {
    if (!modalAction.user) return;

    switch (modalAction.type) {
      case 'approve':
        setUsers(users.map(u => 
          u.id === modalAction.user!.id ? { ...u, isVerified: true } : u
        ));
        break;
      case 'reject':
        setUsers(users.map(u => 
          u.id === modalAction.user!.id ? { ...u, isVerified: false } : u
        ));
        break;
      case 'restrict':
        setUsers(users.map(u => 
          u.id === modalAction.user!.id ? { ...u, isRestricted: true } : u
        ));
        break;
      case 'delete':
        setUsers(users.filter(u => u.id !== modalAction.user!.id));
        break;
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
          Total: {filteredUsers.length} users
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
              <option value="non-verified">Non-Verified Only</option>
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
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{user.avatar}</div>
                        <div>
                          <div className="font-semibold text-gray-800 dark:text-white">
                            {user.anonymousName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {user.university}
                    </td>
                    <td className="px-6 py-4">
                      {user.isVerified ? (
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
                      {user.isRestricted && (
                        <span className="ml-2 inline-flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-sm font-semibold">
                          <Ban size={16} />
                          Restricted
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        user.totalReports > 3
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          : user.totalReports > 0
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}>
                        {user.totalReports}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(user.registrationDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        {!user.isVerified && (
                          <button
                            onClick={() => handleAction('approve', user)}
                            className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                            title="Approve Verification"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        {!user.isRestricted && (
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
          {paginatedUsers.map((user) => (
            <div key={user.id} className="glassmorphic-card p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{user.avatar}</div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      {user.anonymousName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.university}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {user.isVerified ? (
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
                  user.totalReports > 3
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}>
                  {user.totalReports} Reports
                </span>
              </div>

              <div className="flex gap-2">
                {!user.isVerified && (
                  <button
                    onClick={() => handleAction('approve', user)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors font-semibold"
                  >
                    <CheckCircle size={18} />
                    Approve
                  </button>
                )}
                <button
                  onClick={() => handleAction('restrict', user)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors font-semibold"
                >
                  <Ban size={18} />
                  Restrict
                </button>
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
          message={`Are you sure you want to ${modalAction.type} ${modalAction.user.anonymousName}?`}
          confirmLabel={modalAction.type.charAt(0).toUpperCase() + modalAction.type.slice(1)}
          cancelLabel="Cancel"
          onConfirm={confirmAction}
          onCancel={() => setShowConfirmModal(false)}
          type={modalAction.type === 'delete' ? 'danger' : 'warning'}
        />
      )}
    </div>
  );
}
