'use client';

import { useState, useEffect } from 'react';
import { InboxList } from '@/components/chat/InboxList';
import { Toast } from '@/components/ui/Toast';
import { 
  MessageSquare, 
  Inbox, 
  User, 
  Trash2, 
  ArrowLeft, 
  Bell, 
  Search,
  Clock,
  CheckCircle,
  ShieldCheck,
  Loader2,
  UserCircle,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface ChatRequest {
  id: string;
  from: {
    id: string;
    anonymousName: string;
    avatar: string;
    age?: number;
    gender: string;
    university?: string;
    verified?: boolean;
  };
  message: string;
  timestamp: Date;
  status: 'pending' | 'accepted' | 'rejected';
  isBlocked?: boolean;
  conversationId?: string;
}

export interface ActiveChat {
  id: string;
  conversationId: string;
  otherUser: {
    id: string;
    anonymousName: string;
    avatar: string;
    verified: boolean;
    gender: string;
    age?: number;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export default function InboxPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'requests' | 'chats'>('requests');
  const [requests, setRequests] = useState<ChatRequest[]>([]);
  const [chats, setChats] = useState<ActiveChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
      router.push('/login');
      return;
    }

    setCurrentUserId(userId);
    fetchRequests(userId);
    fetchChats(userId);
  }, [router]);

  const fetchRequests = async (userId: string) => {
    try {
      setLoading(true);

      // Fetch received requests
      const response = await fetch(`/api/inbox/requests?userId=${userId}&type=received&status=all`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();

      // Transform API data to ChatRequest format
      const transformedRequests: ChatRequest[] = (data.requests || []).map((req: any) => ({
        id: req.id,
        from: {
          id: req.sender_id,
          anonymousName: req.sender?.profiles?.full_name || req.sender?.username || 'Anonymous',
          avatar: req.sender?.profiles?.avatar_url || '👤',
          age: req.sender?.profiles?.age,
          gender: req.sender?.profiles?.gender || 'Unknown',
          university: 'Unknown',
        },
        message: req.message || 'Would like to chat with you!',
        timestamp: new Date(req.created_at),
        status: req.status,
        conversationId: req.conversation_id,
      }));

      setRequests(transformedRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChats = async (userId: string) => {
    try {
      const response = await fetch(`/api/inbox/chats?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }

      const data = await response.json();
      setChats(data.chats || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const handleAccept = async (requestId: string) => {
    if (!currentUserId) return;

    try {
      const response = await fetch('/api/inbox/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          userId: currentUserId,
          action: 'accept',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept request');
      }

      // Update local state
      setRequests(
        requests.map((req) =>
          req.id === requestId 
            ? { ...req, status: 'accepted', conversationId: data.conversationId } 
            : req
        )
      );

      setToast({ message: '✅ Request accepted! You can now start chatting.', type: 'success' });
      
      // Refresh chats to show the new conversation
      if (currentUserId) {
        fetchChats(currentUserId);
      }
      
      // Switch to chats tab
      setActiveTab('chats');
    } catch (error: any) {
      console.error('Error accepting request:', error);
      setToast({ message: error.message || 'Failed to accept request', type: 'error' });
    }
  };

  const handleReject = async (requestId: string) => {
    if (!currentUserId) return;

    try {
      const response = await fetch('/api/inbox/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          userId: currentUserId,
          action: 'reject',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject request');
      }

      // Update local state
      setRequests(
        requests.map((req) =>
          req.id === requestId ? { ...req, status: 'rejected' } : req
        )
      );

      setToast({ message: 'Request rejected', type: 'info' });
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      setToast({ message: error.message || 'Failed to reject request', type: 'error' });
    }
  };

  const handleBlock = async (requestId: string) => {
    const request = requests.find((req) => req.id === requestId);
    if (!request || !currentUserId) return;

    try {
      // First reject the request
      await handleReject(requestId);

      // Then block the user
      const blockResponse = await fetch('/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blocker_id: currentUserId,
          blocked_id: request.from.id,
          reason: 'Blocked from inbox',
        }),
      });

      if (!blockResponse.ok) {
        throw new Error('Failed to block user');
      }

      // Update local state
      setRequests(
        requests.map((req) =>
          req.id === requestId ? { ...req, isBlocked: true, status: 'rejected' } : req
        )
      );

      setToast({ message: 'User blocked successfully', type: 'success' });
    } catch (error: any) {
      console.error('Error blocking user:', error);
      setToast({ message: error.message || 'Failed to block user', type: 'error' });
    }
  };

  const handleOpenChat = (requestId: string) => {
    const request = requests.find((req) => req.id === requestId);
    if (request && request.status === 'accepted' && request.conversationId) {
      router.push(`/chat/${request.conversationId}?userId=${request.from.id}`);
    } else if (request && request.status === 'accepted') {
      // If no conversation ID, create one
      router.push(`/chat/${requestId}?userId=${request.from.id}`);
    }
  };

  const pendingRequests = requests.filter((req) => req.status === 'pending' && !req.isBlocked);
  const blockedRequests = requests.filter((req) => req.isBlocked);

  const handleOpenActiveChat = (conversationId: string, otherUserId: string) => {
    router.push(`/chat/${conversationId}?userId=${otherUserId}`);
  };

  const handleDeleteChat = async (conversationId: string, chatName: string) => {
    if (!currentUserId) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete your conversation with ${chatName}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/conversations?userId=${currentUserId}&conversationId=${conversationId}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete conversation');
      }

      // Remove from local state
      setChats(chats.filter(chat => chat.conversationId !== conversationId));

      setToast({ message: 'Conversation deleted successfully', type: 'success' });
    } catch (error: any) {
      console.error('Error deleting conversation:', error);
      setToast({ message: error.message || 'Failed to delete conversation', type: 'error' });
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getGenderIcon = (gender: string) => {
    const g = gender?.toLowerCase();
    if (g === 'male') return <User className="w-full h-full text-blue-400" />;
    if (g === 'female') return <User className="w-full h-full text-pink-400" />;
    return <User className="w-full h-full text-purple-400" />;
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black"></div>
      <div className="fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-40"></div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header - Mobile First */}
      <header className="relative z-20 sticky top-0 bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
        <div className="px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>

            {/* Title */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Inbox className="w-4 h-4 text-purple-400" />
              </div>
              <h1 className="text-lg font-bold text-white">Inbox</h1>
            </div>

            {/* Notification Bell */}
            <button className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all">
              <Bell className="w-5 h-5 text-white/70" />
              {(pendingRequests.length + chats.reduce((acc, c) => acc + c.unreadCount, 0)) > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                  {pendingRequests.length + chats.reduce((acc, c) => acc + c.unreadCount, 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tabs - Pill Style */}
        <div className="px-4 pb-3">
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2 p-1 bg-white/5 rounded-2xl">
              <button
                onClick={() => setActiveTab('requests')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm transition-all ${
                  activeTab === 'requests'
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Inbox className="w-4 h-4" />
                <span>Requests</span>
                {pendingRequests.length > 0 && (
                  <span className={`min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold flex items-center justify-center ${
                    activeTab === 'requests' ? 'bg-white/20 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    {pendingRequests.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('chats')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm transition-all ${
                  activeTab === 'chats'
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chats</span>
                {chats.length > 0 && (
                  <span className={`min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold flex items-center justify-center ${
                    activeTab === 'chats' ? 'bg-white/20 text-white' : 'bg-emerald-500 text-white'
                  }`}>
                    {chats.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 px-4 py-4 pb-24 max-w-2xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-sm flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
            <p className="text-white/50 text-sm">Loading conversations...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Requests Tab */}
            {activeTab === 'requests' && (
              <>
                {pendingRequests.length > 0 && (
                  <section className="space-y-3">
                    {/* Section Header */}
                    <div className="flex items-center gap-2 px-1">
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                      <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                        Pending · {pendingRequests.length}
                      </span>
                    </div>
                    <InboxList
                      requests={pendingRequests}
                      onAccept={handleAccept}
                      onReject={handleReject}
                      onBlock={handleBlock}
                      onOpenChat={handleOpenChat}
                    />
                  </section>
                )}

                {blockedRequests.length > 0 && (
                  <section className="space-y-3 mt-6">
                    <div className="flex items-center gap-2 px-1">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                        Blocked · {blockedRequests.length}
                      </span>
                    </div>
                    <InboxList
                      requests={blockedRequests}
                      onAccept={handleAccept}
                      onReject={handleReject}
                      onBlock={handleBlock}
                      onOpenChat={handleOpenChat}
                    />
                  </section>
                )}

                {/* Empty State */}
                {pendingRequests.length === 0 && blockedRequests.length === 0 && (
                  <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6">
                    <div className="w-20 h-20 rounded-3xl bg-white/5 backdrop-blur-sm flex items-center justify-center mb-6">
                      <Inbox className="w-10 h-10 text-white/20" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      No Requests Yet
                    </h3>
                    <p className="text-white/40 text-sm mb-8 max-w-[280px]">
                      When someone wants to connect with you, their request will appear here.
                    </p>
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 active:scale-95 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/25"
                    >
                      <Sparkles className="w-4 h-4" />
                      Discover People
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Chats Tab */}
            {activeTab === 'chats' && (
              <>
                {chats.length > 0 ? (
                  <section className="space-y-2">
                    {/* Section Header */}
                    <div className="flex items-center gap-2 px-1 mb-3">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                        Active · {chats.length}
                      </span>
                    </div>

                    {/* Chat List */}
                    <div className="space-y-2">
                      {chats.map((chat) => (
                        <div
                          key={chat.id}
                          className="group relative bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-sm border border-white/[0.05] hover:border-white/[0.1] rounded-2xl p-3 sm:p-4 transition-all duration-200 active:scale-[0.98]"
                        >
                          <div 
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={() => handleOpenActiveChat(chat.conversationId, chat.otherUser.id)}
                          >
                            {/* Avatar */}
                            <div className="relative shrink-0">
                              <div 
                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/profile/${chat.otherUser.id}`);
                                }}
                              >
                                {getGenderIcon(chat.otherUser.gender)}
                              </div>
                              {/* Online indicator */}
                              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950"></div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2 min-w-0">
                                  <h3 className="font-semibold text-white truncate text-sm sm:text-base">
                                    {chat.otherUser.anonymousName}
                                  </h3>
                                  {chat.otherUser.verified && (
                                    <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                                  )}
                                </div>
                                <span className="text-[11px] text-white/30 shrink-0">
                                  {getTimeAgo(chat.lastMessageTime)}
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm text-white/40 truncate">
                                  {chat.lastMessage || 'Start a conversation'}
                                </p>
                                {chat.unreadCount > 0 && (
                                  <span className="shrink-0 min-w-[20px] h-5 px-1.5 bg-purple-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                                    {chat.unreadCount}
                                  </span>
                                )}
                              </div>

                              {/* Age & Gender Tag */}
                              {chat.otherUser.age && (
                                <div className="flex items-center gap-1.5 mt-2">
                                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-white/30">
                                    {chat.otherUser.age} · {chat.otherUser.gender}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Arrow */}
                            <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/40 shrink-0 transition-colors" />
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteChat(chat.conversationId, chat.otherUser.anonymousName);
                            }}
                            className="absolute top-3 right-3 p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 sm:top-4 sm:right-4"
                            title="Delete conversation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6">
                    <div className="w-20 h-20 rounded-3xl bg-white/5 backdrop-blur-sm flex items-center justify-center mb-6">
                      <MessageSquare className="w-10 h-10 text-white/20" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      No Chats Yet
                    </h3>
                    <p className="text-white/40 text-sm mb-8 max-w-[280px]">
                      Accept a message request to start your first conversation.
                    </p>
                    <button
                      onClick={() => setActiveTab('requests')}
                      className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 active:scale-95 text-white font-semibold rounded-xl transition-all border border-white/10"
                    >
                      <Inbox className="w-4 h-4" />
                      View Requests
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
