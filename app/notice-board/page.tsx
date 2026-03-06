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
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'boy' as 'girl' | 'boy' | 'general' });
  const [successMessage, setSuccessMessage] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'girl' | 'boy' | 'general'>('all');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const verificationStatus = localStorage.getItem('verificationStatus');
    const registrationType = localStorage.getItem('registrationType');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    if (!userId) {
      router.push('/login');
      return;
    }

    if (!isAdmin) {
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
    
    if (userId) checkVerificationStatus(userId);
    fetchPosts(userId);
  }, []);

  const checkVerificationStatus = async (userId: string) => {
    try {
      const response = await fetch(`/api/verification/status?userId=${userId}`);
      const data = await response.json();
      if (response.ok) setIsVerified(data.status === 'verified');
    } catch (err) {
      console.error('Error checking verification status:', err);
    }
  };

  const fetchPosts = async (userId: string | null) => {
    try {
      setLoading(true);
      const url = userId ? `/api/notice-board?userId=${userId}` : '/api/notice-board';
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok && data.success) setPosts(data.posts);
      else setError(data.error || 'Failed to load posts');
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!currentUserId || !newPost.title.trim() || !newPost.content.trim()) return;

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
        setNewPost({ title: '', content: '', category: 'boy' });
        setShowCreateModal(false);
        fetchPosts(currentUserId);
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setError(data.error || 'Failed to create post');
      }
    } catch (err) {
      setError('Failed to create post');
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  // Neobrutalist Badges
  const getStatusBadge = (post: NoticePost) => {
    if (post.status === 'approved') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black uppercase tracking-wider bg-[#A3E635] text-black border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
          <CheckCircle className="w-3 h-3 stroke-[3]" /> Published
        </span>
      );
    }
    if (post.status === 'pending') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black uppercase tracking-wider bg-[#FFD166] text-black border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
          <Clock className="w-3 h-3 stroke-[3]" /> Reviewing
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black uppercase tracking-wider bg-[#FF6B6B] text-black border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
        <AlertCircle className="w-3 h-3 stroke-[3]" /> Rejected
      </span>
    );
  };

  const getCategoryBadge = (category: string) => {
    const badges = {
      girl: { color: 'bg-[#FF6B6B] text-black', label: 'Girls Section' },
      boy: { color: 'bg-[#4ECDC4] text-black', label: 'Boys Section' },
      general: { color: 'bg-white text-black', label: 'General' },
    };
    const badge = badges[category as keyof typeof badges] || badges.general;
    return (
      <span className={`inline-flex items-center px-3 py-1 text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const approvedPosts = posts.filter(p => p.status === 'approved');
  const filteredApprovedPosts = categoryFilter === 'all' 
    ? approvedPosts 
    : approvedPosts.filter(p => p.category === categoryFilter);
  const myPendingPosts = posts.filter(
    p => p.author?.id === currentUserId && p.status !== 'approved'
  );

  if (isCheckingAuth || loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-black border-t-[#FFD166] rounded-full animate-spin mb-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]"></div>
          <p className="font-black uppercase tracking-widest text-black text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5] py-8 px-4 pb-24 font-sans text-black">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 border-b-4 border-black pb-8">
          <div>
            <h1 className="text-4xl font-black text-black uppercase flex items-center gap-3 tracking-tight">
              <div className="bg-[#FF9F1C] p-2 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <ClipboardList className="w-8 h-8 stroke-[3]" />
              </div>
              Notice Board
            </h1>
            <p className="text-black font-bold mt-4 uppercase tracking-widest text-sm">Campus updates & anonymous thoughts</p>
          </div>
          
          {currentUserId && isVerified && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-[#FFD166] border-4 border-black hover:bg-[#FFC033] text-black font-black uppercase text-lg rounded-2xl shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-y-[6px] active:translate-x-[6px] active:shadow-none transition-all"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
              <span>New Post</span>
            </button>
          )}
        </div>

        {/* Chunky Category Filter */}
        <div className="mb-10 overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-4 min-w-max">
            {[
              { id: 'all', label: 'All Posts' },
              { id: 'girl', label: 'Girls Section' },
              { id: 'boy', label: 'Boys Section' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id as any)}
                className={`px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all border-4 border-black ${
                  categoryFilter === cat.id
                    ? 'bg-black text-white shadow-[4px_4px_0px_rgba(78,205,196,1)] translate-y-[-2px] translate-x-[-2px]'
                    : 'bg-white text-black hover:bg-[#F8F9FA] shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="mb-8 p-6 rounded-2xl bg-[#A3E635] border-4 border-black text-black font-black uppercase tracking-wider text-center shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="mb-8 p-6 rounded-2xl bg-[#FF6B6B] border-4 border-black text-black font-black uppercase tracking-wider text-center shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            {error}
          </div>
        )}

        {/* My Pending Submissions */}
        {myPendingPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg font-black text-black uppercase tracking-widest mb-6 flex items-center gap-3">
              <FileText className="w-6 h-6 stroke-[3]" />
              My Pending Submissions
            </h2>
            <div className="space-y-6">
              {myPendingPosts.map(post => (
                <div key={post.id} className="bg-white border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-black uppercase mb-3">{post.title}</h3>
                      <div className="flex items-center gap-2">{getStatusBadge(post)}</div>
                    </div>
                  </div>
                  <p className="text-black font-bold mb-4 line-clamp-2 bg-[#F8F9FA] p-4 border-2 border-black rounded-xl">{post.content}</p>
                  
                  {post.rejection_reason && (
                    <div className="p-4 bg-[#FF6B6B] border-4 border-black rounded-xl text-black font-bold mb-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                      <strong className="font-black uppercase mr-2">Reason:</strong> {post.rejection_reason}
                    </div>
                  )}
                  <div className="text-sm font-black uppercase tracking-wider text-gray-500">Submitted: {formatDate(post.created_at)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Published Posts Feed */}
        <div>
          <h2 className="text-lg font-black text-black uppercase tracking-widest mb-6 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 stroke-[3]" />
            Recent Updates
          </h2>
          
          {approvedPosts.length === 0 ? (
            <div className="text-center py-20 bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,1)]">
              <div className="w-20 h-20 bg-[#F8F9FA] border-4 border-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] transform -rotate-6">
                <ClipboardList className="w-10 h-10 stroke-[3]" />
              </div>
              <p className="font-black uppercase tracking-widest text-xl">No notices published yet</p>
            </div>
          ) : filteredApprovedPosts.length === 0 ? (
            <div className="text-center py-20 bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,1)]">
              <p className="font-black uppercase tracking-widest text-xl">No posts in this category</p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredApprovedPosts.map(post => (
                <div
                  key={post.id}
                  className="bg-white border-4 border-black rounded-3xl p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[10px_10px_0px_rgba(0,0,0,1)] transition-all"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-3 mb-4">
                        {getCategoryBadge(post.category)}
                        {post.is_admin_post && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-black bg-[#FFD166] text-black border-2 border-black rounded-none uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                            <ShieldCheck className="w-3 h-3 stroke-[3]" /> Admin
                          </span>
                        )}
                      </div>
                      <h3 className="text-3xl font-black text-black uppercase tracking-tight leading-tight">{post.title}</h3>
                    </div>
                  </div>
                  
                  <div className="bg-[#F8F9FA] border-4 border-black rounded-2xl p-6 mb-6 shadow-inner">
                    <p className="text-black font-bold text-lg leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t-4 border-black">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white border-2 border-black">
                        <User className="w-5 h-5 stroke-[3]" />
                      </div>
                      <span className="text-sm font-black uppercase tracking-wider">
                        {post.author?.isAdmin ? 'Admin Team' : 'Anonymous Student'}
                      </span>
                    </div>
                    <span className="text-sm font-black uppercase tracking-widest bg-white border-2 border-black px-3 py-1 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                      {formatDate(post.approved_at || post.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
          <div className="w-full max-w-lg bg-white border-4 border-black rounded-3xl shadow-[12px_12px_0px_rgba(255,209,102,1)] overflow-hidden animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between p-6 border-b-4 border-black bg-[#FFD166]">
              <h3 className="text-2xl font-black uppercase tracking-tight">New Notice</h3>
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="w-10 h-10 bg-white border-4 border-black flex items-center justify-center hover:bg-[#FF6B6B] hover:text-white transition-colors shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
              >
                <X className="w-6 h-6 stroke-[4]" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-black text-black uppercase tracking-widest mb-3">Category</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'boy', label: 'Boys' },
                    { id: 'girl', label: 'Girls' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setNewPost({...newPost, category: opt.id as any})}
                      className={`py-4 px-4 rounded-xl text-sm font-black uppercase tracking-wider border-4 transition-all ${
                        newPost.category === opt.id 
                          ? 'bg-black border-black text-white shadow-[4px_4px_0px_rgba(78,205,196,1)] translate-y-[-2px] translate-x-[-2px]' 
                          : 'bg-white border-black text-black hover:bg-[#F8F9FA] shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:translate-x-[-2px]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-sm font-black text-black uppercase tracking-widest mb-3">Topic</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="WHAT IS THIS ABOUT?"
                  maxLength={200}
                  className="w-full px-4 py-4 bg-[#F8F9FA] border-4 border-black rounded-xl focus:outline-none focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] font-bold text-lg transition-shadow placeholder-gray-400"
                />
              </div>

              {/* Content Input */}
              <div>
                <label className="block text-sm font-black text-black uppercase tracking-widest mb-3">Details</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="TYPE YOUR MESSAGE HERE..."
                  rows={5}
                  maxLength={5000}
                  className="w-full px-4 py-4 bg-[#F8F9FA] border-4 border-black rounded-xl focus:outline-none focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] font-bold text-lg transition-shadow placeholder-gray-400 resize-none"
                />
              </div>

              {/* Notice Warning */}
              <div className="p-4 bg-[#F8F9FA] border-4 border-black rounded-xl flex items-start gap-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <div className="w-8 h-8 bg-black border-2 border-black rounded-full flex items-center justify-center shrink-0 mt-1">
                  <Clock className="w-4 h-4 text-white stroke-[3]" />
                </div>
                <p className="text-sm font-bold text-black leading-relaxed uppercase">
                  Posts are reviewed by admins. Your identity remains 100% anonymous.
                </p>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleCreatePost}
                disabled={creating || newPost.title.length < 5 || newPost.content.length < 20}
                className="w-full py-5 bg-[#4ECDC4] border-4 border-black text-black font-black uppercase text-xl tracking-wider rounded-xl shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-y-[6px] active:translate-x-[6px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
              >
                {creating ? <Loader2 className="w-6 h-6 stroke-[3] animate-spin" /> : <Send className="w-6 h-6 stroke-[3]" />}
                {creating ? 'SUBMITTING...' : 'SUBMIT FOR REVIEW'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}