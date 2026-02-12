'use client';

import { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  CheckCircle, 
  XCircle, 
  Eye,
  Calendar,
  User,
  RefreshCw,
  Filter,
  Trash2,
  ShieldCheck,
  AlertCircle,
  Clock,
  FileText,
  Loader2
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

interface NoticePost {
  id: string;
  title: string;
  content: string;
  category: 'girl' | 'boy' | 'general';
  status: 'pending' | 'approved' | 'rejected';
  isAdminPost: boolean;
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
  rejectionReason: string | null;
  author: {
    id: string;
    username: string;
    fullName: string | null;
    isAdmin: boolean;
    verificationStatus: string;
  } | null;
}

export function NoticeBoardManagement() {
  const [posts, setPosts] = useState<NoticePost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<NoticePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<NoticePost | null>(null);
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | 'delete'>('approve');
  const [rejectReason, setRejectReason] = useState('');
  
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  const fetchPosts = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/notice-board', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch posts');
      }

      const data = await response.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/notice-board/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchStats();
  }, []);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(posts.filter(p => p.status === statusFilter));
    }
  }, [statusFilter, posts]);

  const handleAction = async () => {
    if (!selectedPost) return;

    try {
      setActionLoading(selectedPost.id);
      const token = localStorage.getItem('token');

      if (modalAction === 'delete') {
        const response = await fetch(`/api/admin/notice-board?postId=${selectedPost.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete post');
        }
      } else {
        const response = await fetch('/api/admin/notice-board', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            postId: selectedPost.id,
            action: modalAction,
            rejectionReason: modalAction === 'reject' ? rejectReason : undefined,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to ${modalAction} post`);
        }
      }

      // Refresh data
      fetchPosts();
      fetchStats();
      setShowConfirmModal(false);
      setSelectedPost(null);
      setRejectReason('');
    } catch (err) {
      console.error('Error performing action:', err);
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const openActionModal = (post: NoticePost, action: 'approve' | 'reject' | 'delete') => {
    setSelectedPost(post);
    setModalAction(action);
    setRejectReason('');
    setShowConfirmModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  const getCategoryBadge = (category: string) => {
    const badges = {
      girl: {
        color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
        label: 'Girls',
      },
      boy: {
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        label: 'Boys',
      },
      general: {
        color: 'bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-400',
        label: 'General',
      },
    };
    
    const badge = badges[category as keyof typeof badges] || badges.general;
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading notice board...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Posts</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.approved}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.rejected}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Posts</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        
        <button
          onClick={() => fetchPosts(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl">
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No posts found</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
            >
              {/* Post Header */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {post.title}
                      </h3>
                      {getCategoryBadge(post.category)}
                      {post.isAdminPost && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">
                          <ShieldCheck className="w-3 h-3" />
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {post.author?.username || 'Unknown'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(post.status)}`}>
                    {getStatusIcon(post.status)}
                    {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Post Content */}
              <div className="p-4">
                <p className={`text-gray-700 dark:text-gray-300 whitespace-pre-wrap ${
                  expandedPost === post.id ? '' : 'line-clamp-3'
                }`}>
                  {post.content}
                </p>
                {post.content.length > 200 && (
                  <button
                    onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium mt-2"
                  >
                    {expandedPost === post.id ? 'Show less' : 'Show more'}
                  </button>
                )}

                {post.rejectionReason && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-400">
                      <strong>Rejection Reason:</strong> {post.rejectionReason}
                    </p>
                  </div>
                )}
              </div>

              {/* Post Actions */}
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-2">
                {post.status === 'pending' && (
                  <>
                    <button
                      onClick={() => openActionModal(post, 'approve')}
                      disabled={actionLoading === post.id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => openActionModal(post, 'reject')}
                      disabled={actionLoading === post.id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => openActionModal(post, 'delete')}
                  disabled={actionLoading === post.id}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && selectedPost && (
        <ConfirmModal
          title={
            modalAction === 'approve' 
              ? 'Approve Post' 
              : modalAction === 'reject' 
              ? 'Reject Post' 
              : 'Delete Post'
          }
          message={
            modalAction === 'approve'
              ? `Are you sure you want to approve "${selectedPost.title}"? It will become visible to all users.`
              : modalAction === 'reject'
              ? `Are you sure you want to reject "${selectedPost.title}"?`
              : `Are you sure you want to delete "${selectedPost.title}"? This action cannot be undone.`
          }
          confirmLabel={modalAction.charAt(0).toUpperCase() + modalAction.slice(1)}
          cancelLabel="Cancel"
          onConfirm={handleAction}
          onCancel={() => {
            setShowConfirmModal(false);
            setSelectedPost(null);
            setRejectReason('');
          }}
          type={modalAction === 'approve' ? 'info' : 'danger'}
          showReasonInput={modalAction === 'reject'}
          reason={rejectReason}
          onReasonChange={setRejectReason}
          disabled={actionLoading === selectedPost.id}
        />
      )}
    </div>
  );
}
