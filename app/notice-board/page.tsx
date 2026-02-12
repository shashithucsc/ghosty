'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ClipboardList, 
  Plus, 
  Clock, 
  CheckCircle, 
  User, 
  Calendar,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Loader2,
  X,
  Send,
  FileText
} from 'lucide-react';

interface NoticePost {
  id: string;
  title: string;
  content: string;
  category: 'girl' | 'boy' | 'general';
  status: 'pending' | 'approved' | 'rejected';
  is_admin_post: boolean;
  created_at: string;
  approved_at: string | null;
  rejection_reason: string | null;
  author: {
    id: string;
    username: string;
    isAdmin: boolean;
  } | null;
}

export default function NoticeBoardPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<NoticePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' as 'girl' | 'boy' | 'general' });
  const [successMessage, setSuccessMessage] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'girl' | 'boy' | 'general'>('all');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const verificationStatus = localStorage.getItem('verificationStatus');
    const registrationType = localStorage.getItem('registrationType');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    // Check if user is logged in
    if (!userId) {
      router.push('/login');
      return;
    }

    // Admin bypass
    if (!isAdmin) {
      // Check verification status for verified registration type
      if (registrationType === 'verified' && verificationStatus === 'pending') {
        router.push('/pending-verification');
        return;
      }

      if (registrationType === 'verified' && verificationStatus === 'rejected') {
        localStorage.clear();
        router.push('/login');
        return;
      }

      if (registrationType === 'verified' && verificationStatus !== 'verified') {
        router.push('/pending-verification');
        return;
      }
    }

    setCurrentUserId(userId);
    setIsCheckingAuth(false);
    
    if (userId) {
      checkVerificationStatus(userId);
    }
    
    fetchPosts(userId);
  }, []);

  const checkVerificationStatus = async (userId: string) => {
    try {
      const response = await fetch(`/api/verification/status?userId=${userId}`);
      const data = await response.json();
      if (response.ok) {
        setIsVerified(data.status === 'verified');
      }
    } catch (err) {
      console.error('Error checking verification status:', err);
    }
  };

  const fetchPosts = async (userId: string | null) => {
    try {
      setLoading(true);
      const url = userId 
        ? `/api/notice-board?userId=${userId}`
        : '/api/notice-board';
      
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok && data.success) {
        setPosts(data.posts);
      } else {
        setError(data.error || 'Failed to load posts');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!currentUserId || !newPost.title.trim() || !newPost.content.trim()) {
      return;
    }

    try {
      setCreating(true);
      const response = await fetch('/api/notice-board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          title: newPost.title,
          content: newPost.content,
          category: newPost.category,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage(data.message);
        setNewPost({ title: '', content: '', category: 'general' });
        setShowCreateModal(false);
        fetchPosts(currentUserId);
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setError(data.error || 'Failed to create post');
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post');
    } finally {
      setCreating(false);
    }
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

  const getStatusBadge = (post: NoticePost) => {
    if (post.status === 'approved') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
          <CheckCircle className="w-3 h-3" />
          Published
        </span>
      );
    }
    if (post.status === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
          <Clock className="w-3 h-3" />
          Pending Approval
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">
        <AlertCircle className="w-3 h-3" />
        Rejected
      </span>
    );
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
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  // Separate posts into approved (visible) and user's pending/rejected
  const approvedPosts = posts.filter(p => p.status === 'approved');
  const filteredApprovedPosts = categoryFilter === 'all' 
    ? approvedPosts 
    : approvedPosts.filter(p => p.category === categoryFilter);
  const myPendingPosts = posts.filter(
    p => p.author?.id === currentUserId && p.status !== 'approved'
  );

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-800 dark:text-white text-lg">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-800 dark:text-white text-lg">Loading notices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-950 py-6 px-4 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Notice Board
            </h1>
          </div>
          
          {/* Create Post Button - Only for verified users */}
          {currentUserId && isVerified && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Create Post</span>
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="mb-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700/50 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by Category:
            </label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  categoryFilter === 'all'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setCategoryFilter('girl')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  categoryFilter === 'girl'
                    ? 'bg-pink-600 text-white shadow-lg'
                    : 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 hover:bg-pink-200 dark:hover:bg-pink-800/40'
                }`}
              >
                Girls
              </button>
              <button
                onClick={() => setCategoryFilter('boy')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  categoryFilter === 'boy'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/40'
                }`}
              >
                Boys
              </button>
              <button
                onClick={() => setCategoryFilter('general')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  categoryFilter === 'general'
                    ? 'bg-gray-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                General
              </button>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700/50">
            <p className="text-green-800 dark:text-green-300 text-center font-medium">
              {successMessage}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700/50">
            <p className="text-red-800 dark:text-red-300 text-center font-medium">{error}</p>
          </div>
        )}

        {/* User's Pending/Rejected Posts Section */}
        {myPendingPosts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              My Submissions
            </h2>
            <div className="space-y-4">
              {myPendingPosts.map(post => (
                <div
                  key={post.id}
                  className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700/50 rounded-2xl p-5 shadow-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(post)}
                        {getCategoryBadge(post.category)}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-4">
                    {post.content}
                  </p>

                  {post.rejection_reason && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg mb-4">
                      <p className="text-sm text-red-700 dark:text-red-400">
                        <strong>Rejection Reason:</strong> {post.rejection_reason}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Submitted {formatDate(post.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Published Posts */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Published Notices
          </h2>
          
          {approvedPosts.length === 0 ? (
            <div className="text-center py-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700/50">
              <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No notices published yet
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                Check back later for updates
              </p>
            </div>
          ) : filteredApprovedPosts.length === 0 ? (
            <div className="text-center py-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700/50">
              <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No notices in this category
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                Try selecting a different category
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApprovedPosts.map(post => (
                <div
                  key={post.id}
                  className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700/50 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getCategoryBadge(post.category)}
                        {post.is_admin_post && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">
                            <ShieldCheck className="w-3 h-3" />
                            Official
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-4">
                    {post.content}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <User className="w-4 h-4" />
                      <span>
                        {post.author?.isAdmin ? 'Admin' : post.author?.username || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(post.approved_at || post.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-600" />
                Create Notice
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value as 'girl' | 'boy' | 'general' })}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="general">General (Everyone)</option>
                  <option value="girl">Girls Only</option>
                  <option value="boy">Boys Only</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Choose who can see this post
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="Enter notice title..."
                  maxLength={200}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {newPost.title.length}/200 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content *
                </label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Write your notice content..."
                  rows={6}
                  maxLength={5000}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {newPost.content.length}/5000 characters (minimum 20)
                </p>
              </div>

              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-400 flex items-start gap-2">
                  <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  Your post will be reviewed by an admin before being published.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                disabled={creating || newPost.title.length < 5 || newPost.content.length < 20}
                className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
