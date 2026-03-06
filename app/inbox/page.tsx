'use client';

import { useState, useEffect, useRef } from 'react';
import { InboxList } from '@/components/chat/InboxList';
import { Toast } from '@/components/ui/Toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { createClient } from '@supabase/supabase-js';
import type { RealtimeChannel } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
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
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [activeTab, setActiveTab] = useState<'matches' | 'requests' | 'chats'>('matches');
  const [requests, setRequests] = useState<ChatRequest[]>([]);
  const [chats, setChats] = useState<ActiveChat[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ conversationId: string; chatName: string } | null>(null);
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
    fetchRequests(userId);
    fetchChats(userId);

    const setupRealtimeSubscriptions = async () => {
      const channel = supabase.channel(`inbox-${userId}`, {
        config: {
          broadcast: { self: true },
        },
      });

      channel.on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'inbox_requests' },
        (payload) => {
          const newRequest = payload.new as any;
          if (newRequest.recipient_id === userId) {
            fetchRequests(userId);
          }
        }
      );

      channel.on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'inbox_requests' },
        (payload) => {
          const updatedRequest = payload.new as any;
          if (updatedRequest.recipient_id === userId || updatedRequest.sender_id === userId) {
            fetchRequests(userId);
            if (updatedRequest.status === 'accepted') {
              fetchChats(userId);
            }
          }
        }
      );

      channel.on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chats' },
        (payload) => {
          const newMessage = payload.new as any;
          if (newMessage.receiver_id === userId) {
            fetchChats(userId);
          }
        }
      );

      channel.on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'chats' },
        (payload) => {
          const updatedMessage = payload.new as any;
          if (updatedMessage.sender_id === userId || updatedMessage.receiver_id === userId) {
            fetchChats(userId);
          }
        }
      );

      channel.on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'matches' },
        (payload) => {
          const newMatch = payload.new as any;
          if (newMatch.user1_id === userId || newMatch.user2_id === userId) {
            fetchMatches(userId);
          }
        }
      );

      channel.on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chats' },
        (payload) => {
          const newChat = payload.new as any;
          if (newChat.sender_id === userId || newChat.receiver_id === userId) {
            fetchMatches(userId);
            fetchChats(userId);
          }
        }
      );

      await channel.subscribe();
      channelRef.current = channel;
    };

    setupRealtimeSubscriptions();
    fetchMatches(userId);

    const handleVisibilityChange = () => {
      if (!document.hidden && userId) {
        fetchRequests(userId);
        fetchChats(userId);
        fetchMatches(userId);
      }
    };

    const handleFocus = () => {
      if (userId) {
        fetchRequests(userId);
        fetchChats(userId);
        fetchMatches(userId);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [router]);

  const fetchRequests = async (userId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/inbox/requests?userId=${userId}&type=received&status=all`);
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();

      const transformedRequests: ChatRequest[] = (data.requests || []).map((req: any) => ({
        id: req.id,
        from: {
          id: req.sender_id,
          anonymousName: req.sender?.profiles?.full_name || req.sender?.username || 'Anonymous',
          avatar: req.sender?.profiles?.avatar_url || 'U', // Fallback to letter
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
      if (!response.ok) throw new Error('Failed to fetch chats');
      const data = await response.json();
      setChats(data.chats || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const fetchMatches = async (userId: string) => {
    try {
      setMatchesLoading(true);
      const response = await fetch(`/api/matches?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch matches');
      const data = await response.json();
      setMatches(data.matches || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setMatchesLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    if (!currentUserId) return;
    try {
      const response = await fetch('/api/inbox/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, userId: currentUserId, action: 'accept' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to accept request');

      setRequests(
        requests.map((req) =>
          req.id === requestId 
            ? { ...req, status: 'accepted', conversationId: data.conversationId } 
            : req
        )
      );
      setToast({ message: 'Request accepted! You can now start chatting.', type: 'success' });
      if (currentUserId) fetchChats(currentUserId);
      setActiveTab('chats');
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to accept request', type: 'error' });
    }
  };

  const handleReject = async (requestId: string) => {
    if (!currentUserId) return;
    try {
      const response = await fetch('/api/inbox/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, userId: currentUserId, action: 'reject' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to reject request');

      setRequests(requests.map((req) => req.id === requestId ? { ...req, status: 'rejected' } : req));
      setToast({ message: 'Request rejected', type: 'info' });
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to reject request', type: 'error' });
    }
  };

  const handleBlock = async (requestId: string) => {
    const request = requests.find((req) => req.id === requestId);
    if (!request || !currentUserId) return;
    try {
      await handleReject(requestId);
      const blockResponse = await fetch('/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blocker_id: currentUserId,
          blocked_id: request.from.id,
          reason: 'Blocked from inbox',
        }),
      });
      if (!blockResponse.ok) throw new Error('Failed to block user');

      setRequests(requests.map((req) => req.id === requestId ? { ...req, isBlocked: true, status: 'rejected' } : req));
      setToast({ message: 'User blocked successfully', type: 'success' });
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to block user', type: 'error' });
    }
  };

  const pendingRequests = requests.filter((req) => req.status === 'pending' && !req.isBlocked);

  const handleOpenActiveChat = (conversationId: string, otherUserId: string) => {
    router.push(`/chat/${conversationId}?userId=${otherUserId}`);
  };

  const handleStartChatWithMatch = async (matchUserId: string) => {
    if (!currentUserId) return;
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, otherUserId: matchUserId }),
      });
      const data = await response.json();
      if (response.ok && data.conversation) {
        fetchMatches(currentUserId);
        fetchChats(currentUserId);
        router.push(`/chat/${data.conversation.id}?userId=${matchUserId}`);
      } else {
        setToast({ message: data.error || 'Failed to start chat', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Failed to start chat. Please try again.', type: 'error' });
    }
  };

  const handleDeleteChat = async (conversationId: string, chatName: string) => {
    if (!currentUserId) return;
    setDeleteConfirm({ conversationId, chatName });
  };

  const confirmDeleteChat = async () => {
    if (!currentUserId || !deleteConfirm) return;
    const { conversationId } = deleteConfirm;
    try {
      const response = await fetch(
        `/api/conversations?userId=${currentUserId}&conversationId=${conversationId}`,
        { method: 'DELETE' }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete conversation');

      setChats(chats.filter(chat => chat.conversationId !== conversationId));
      setToast({ message: 'Conversation deleted successfully', type: 'success' });
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to delete conversation', type: 'error' });
    } finally {
      setDeleteConfirm(null);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'NOW';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}M`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}H`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}D`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  };

  // Replaced subtle gender icons with bold text blocks for Neobrutalism
  const getGenderTag = (gender: string) => {
    const g = gender?.toLowerCase();
    if (g === 'male') return <span className="bg-[#4ECDC4] border-2 border-black px-2 py-0.5 text-black font-black uppercase text-[10px] shadow-[2px_2px_0px_rgba(0,0,0,1)]">M</span>;
    if (g === 'female') return <span className="bg-[#FF6B6B] border-2 border-black px-2 py-0.5 text-black font-black uppercase text-[10px] shadow-[2px_2px_0px_rgba(0,0,0,1)]">F</span>;
    return <span className="bg-[#FFD166] border-2 border-black px-2 py-0.5 text-black font-black uppercase text-[10px] shadow-[2px_2px_0px_rgba(0,0,0,1)]">O</span>;
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-[#FFD166] rounded-full animate-spin mx-auto mb-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]"></div>
          <p className="text-black font-black uppercase tracking-wider text-xl">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5] font-sans text-black">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <header className="relative z-20 sticky top-0 bg-[#FFD166] border-b-4 border-black shadow-[0_4px_0px_rgba(0,0,0,1)]">
        <div className="px-4 py-6 max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white border-4 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center justify-center">
              <Inbox className="w-6 h-6 stroke-[3]" />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight">Inbox</h1>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (currentUserId) {
                  fetchRequests(currentUserId);
                  fetchChats(currentUserId);
                  fetchMatches(currentUserId);
                  setToast({ message: 'REFRESHING...', type: 'info' });
                }
              }}
              className="w-12 h-12 bg-white border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all"
              title="Refresh"
            >
              <svg className="w-6 h-6 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

            <button className="relative w-12 h-12 bg-white border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all">
              <Bell className="w-6 h-6 stroke-[3]" />
              {(matches.length + pendingRequests.length + chats.reduce((acc, c) => acc + c.unreadCount, 0)) > 0 && (
                <span className="absolute -top-3 -right-3 w-8 h-8 bg-[#FF6B6B] border-4 border-black text-white font-black flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  {matches.length + pendingRequests.length + chats.reduce((acc, c) => acc + c.unreadCount, 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Thick Tabs */}
        <div className="px-4 pb-6">
          <div className="max-w-2xl mx-auto flex gap-3">
            <button
              onClick={() => setActiveTab('matches')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-2 border-4 font-black uppercase tracking-wider transition-all ${
                activeTab === 'matches'
                  ? 'bg-black text-white border-black shadow-[4px_4px_0px_rgba(78,205,196,1)] translate-y-[-2px] translate-x-[-2px]'
                  : 'bg-white text-black border-black hover:bg-[#F8F9FA] shadow-[4px_4px_0px_rgba(0,0,0,1)]'
              }`}
            >
              <span className="hidden sm:inline">Matches</span>
              <span className="sm:hidden">Match</span>
              {matches.length > 0 && (
                <span className="bg-[#4ECDC4] text-black px-2 py-0.5 border-2 border-black text-xs font-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  {matches.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-2 border-4 font-black uppercase tracking-wider transition-all ${
                activeTab === 'requests'
                  ? 'bg-black text-white border-black shadow-[4px_4px_0px_rgba(255,209,102,1)] translate-y-[-2px] translate-x-[-2px]'
                  : 'bg-white text-black border-black hover:bg-[#F8F9FA] shadow-[4px_4px_0px_rgba(0,0,0,1)]'
              }`}
            >
              <span className="hidden sm:inline">Requests</span>
              <span className="sm:hidden">Reqs</span>
              {pendingRequests.length > 0 && (
                <span className="bg-[#FFD166] text-black px-2 py-0.5 border-2 border-black text-xs font-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  {pendingRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('chats')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-2 border-4 font-black uppercase tracking-wider transition-all ${
                activeTab === 'chats'
                  ? 'bg-black text-white border-black shadow-[4px_4px_0px_rgba(163,230,53,1)] translate-y-[-2px] translate-x-[-2px]'
                  : 'bg-white text-black border-black hover:bg-[#F8F9FA] shadow-[4px_4px_0px_rgba(0,0,0,1)]'
              }`}
            >
              <span>Chats</span>
              {chats.reduce((acc, c) => acc + c.unreadCount, 0) > 0 && (
                <span className="bg-[#A3E635] text-black px-2 py-0.5 border-2 border-black text-xs font-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  {chats.reduce((acc, c) => acc + c.unreadCount, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-8 pb-24 max-w-2xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
            <div className="w-20 h-20 border-8 border-black border-t-[#4ECDC4] rounded-full animate-spin shadow-[4px_4px_0px_rgba(0,0,0,1)]"></div>
            <p className="font-black uppercase tracking-widest text-xl">Loading...</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Matches Tab */}
            {activeTab === 'matches' && (
              <>
                {matchesLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-6">
                    <div className="w-16 h-16 border-4 border-black border-t-[#4ECDC4] rounded-full animate-spin shadow-[4px_4px_0px_rgba(0,0,0,1)]"></div>
                    <p className="font-black uppercase tracking-widest">Finding Matches...</p>
                  </div>
                ) : matches.length > 0 ? (
                  <section>
                    <div className="flex items-center gap-3 mb-6 border-b-4 border-black pb-4">
                      <div className="w-6 h-6 bg-[#4ECDC4] border-4 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]"></div>
                      <h2 className="text-2xl font-black uppercase tracking-tight">Your Matches ({matches.length})</h2>
                    </div>

                    <div className="space-y-4">
                      {matches.map((match: any) => (
                        <div
                          key={match.matchId}
                          className="group bg-white border-4 border-black rounded-2xl p-4 shadow-[8px_8px_0px_rgba(0,0,0,1)] transition-transform hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[10px_10px_0px_rgba(0,0,0,1)]"
                        >
                          <div 
                            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 cursor-pointer"
                            onClick={() => router.push(`/profile/${match.user.id}`)}
                          >
                            <div className="flex items-center gap-4 w-full">
                              <div className="relative shrink-0">
                                <div className="w-16 h-16 bg-[#F8F9FA] border-4 border-black flex items-center justify-center text-3xl font-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                  {match.user.avatar}
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-[#4ECDC4] border-2 border-black px-1.5 py-0.5 text-[10px] font-black uppercase shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                  NEW
                                </div>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-black text-xl uppercase truncate">
                                    {match.user.anonymousName}
                                  </h3>
                                  {match.user.isVerified && (
                                    <ShieldCheck className="w-5 h-5 text-[#A3E635] stroke-[3] shrink-0" />
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-3 flex-wrap mt-2">
                                  <span className="text-sm font-bold uppercase bg-[#F8F9FA] border-2 border-black px-2 py-0.5 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                    {match.user.age} YRS
                                  </span>
                                  {getGenderTag(match.user.gender)}
                                  <span className="text-xs font-black uppercase text-gray-500">
                                    {getTimeAgo(match.matchedAt)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartChatWithMatch(match.user.id);
                                }}
                                className="flex-1 sm:flex-none px-4 py-3 bg-[#A3E635] border-4 border-black text-black font-black uppercase rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all flex items-center justify-center gap-2"
                              >
                                <MessageSquare className="w-5 h-5 stroke-[3]" />
                                Chat
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                    <div className="w-24 h-24 bg-[#FFD166] border-4 border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] transform -rotate-6">
                      <Sparkles className="w-12 h-12 stroke-[3]" />
                    </div>
                    <h3 className="text-2xl font-black uppercase mb-4 tracking-tight">No Matches Yet</h3>
                    <p className="font-bold max-w-xs text-gray-600 uppercase">
                      Keep swiping! When someone likes you back, they'll appear here.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
              <>
                {pendingRequests.length > 0 ? (
                  <section>
                    <div className="flex items-center gap-3 mb-6 border-b-4 border-black pb-4">
                      <div className="w-6 h-6 bg-[#FFD166] border-4 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]"></div>
                      <h2 className="text-2xl font-black uppercase tracking-tight">Pending ({pendingRequests.length})</h2>
                    </div>

                    <div className="space-y-6">
                      {pendingRequests.map((request) => (
                        <div
                          key={request.id}
                          className="bg-white border-4 border-black rounded-2xl p-5 shadow-[8px_8px_0px_rgba(0,0,0,1)] relative overflow-hidden"
                        >
                          <div className="flex flex-col gap-4">
                            <div 
                              className="flex items-center gap-4 cursor-pointer"
                              onClick={() => router.push(`/profile/${request.from.id}`)}
                            >
                              <div className="w-16 h-16 bg-[#F8F9FA] border-4 border-black flex items-center justify-center text-3xl font-black shadow-[4px_4px_0px_rgba(0,0,0,1)] shrink-0">
                                {request.from.avatar}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-black text-xl uppercase truncate">
                                    {request.from.anonymousName}
                                  </h3>
                                  {request.from.verified && (
                                    <ShieldCheck className="w-5 h-5 text-[#A3E635] stroke-[3] shrink-0" />
                                  )}
                                </div>
                                <div className="flex items-center gap-3 flex-wrap mt-2">
                                  <span className="text-sm font-bold uppercase bg-[#F8F9FA] border-2 border-black px-2 py-0.5 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                    {request.from.age} YRS
                                  </span>
                                  {getGenderTag(request.from.gender)}
                                  <span className="text-xs font-black uppercase text-gray-500">
                                    {getTimeAgo(request.timestamp.toISOString())}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {request.message && (
                              <div className="bg-[#F8F9FA] border-4 border-black p-4 rounded-xl shadow-inner">
                                <p className="font-bold italic line-clamp-3">
                                  "{request.message}"
                                </p>
                              </div>
                            )}

                            <div className="flex items-center gap-3 mt-2">
                              <button
                                onClick={() => handleAccept(request.id)}
                                className="flex-1 py-3 bg-[#A3E635] border-4 border-black text-black font-black uppercase rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all flex items-center justify-center gap-2"
                              >
                                <CheckCircle className="w-5 h-5 stroke-[3]" />
                                Accept
                              </button>
                              <button
                                onClick={() => handleReject(request.id)}
                                className="flex-1 py-3 bg-white border-4 border-black text-black font-black uppercase rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-[#F8F9FA] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => handleBlock(request.id)}
                                className="w-14 h-14 bg-[#FF6B6B] border-4 border-black text-black flex items-center justify-center rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all"
                                title="Block user"
                              >
                                <Trash2 className="w-6 h-6 stroke-[3]" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                    <div className="w-24 h-24 bg-[#FF6B6B] border-4 border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] transform -rotate-6">
                      <Inbox className="w-12 h-12 stroke-[3]" />
                    </div>
                    <h3 className="text-2xl font-black uppercase mb-4 tracking-tight">No Requests</h3>
                    <p className="font-bold max-w-xs text-gray-600 uppercase">
                      Your inbox is clear. Incoming chat requests will appear here.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Chats Tab */}
            {activeTab === 'chats' && (
              <>
                {chats.length > 0 ? (
                  <section>
                    <div className="flex items-center gap-3 mb-6 border-b-4 border-black pb-4">
                      <div className="w-6 h-6 bg-[#A3E635] border-4 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]"></div>
                      <h2 className="text-2xl font-black uppercase tracking-tight">Active Chats</h2>
                    </div>

                    <div className="space-y-4">
                      {chats.map((chat) => (
                        <div
                          key={chat.id}
                          className="group bg-white border-4 border-black rounded-2xl p-4 shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[10px_10px_0px_rgba(0,0,0,1)] transition-all relative overflow-hidden cursor-pointer"
                          onClick={() => handleOpenActiveChat(chat.conversationId, chat.otherUser.id)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="relative shrink-0">
                              <div className="w-16 h-16 bg-[#F8F9FA] border-4 border-black flex items-center justify-center text-3xl font-black shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/profile/${chat.otherUser.id}`);
                                }}
                              >
                                {chat.otherUser.avatar}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#A3E635] rounded-full border-4 border-black"></div>
                            </div>

                            <div className="flex-1 min-w-0 pr-10">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2 min-w-0">
                                  <h3 className="font-black text-xl uppercase truncate">
                                    {chat.otherUser.anonymousName}
                                  </h3>
                                  {chat.otherUser.verified && (
                                    <ShieldCheck className="w-5 h-5 text-[#A3E635] stroke-[3] shrink-0" />
                                  )}
                                </div>
                                <span className="text-xs font-black uppercase text-gray-500 shrink-0">
                                  {getTimeAgo(chat.lastMessageTime)}
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-4">
                                <p className="text-base font-bold text-gray-600 truncate">
                                  {chat.lastMessage || 'START A CONVERSATION'}
                                </p>
                                {chat.unreadCount > 0 && (
                                  <span className="shrink-0 bg-[#FFD166] text-black px-2 py-1 border-2 border-black text-xs font-black shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                    {chat.unreadCount} NEW
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteChat(chat.conversationId, chat.otherUser.anonymousName);
                            }}
                            className="absolute top-1/2 -translate-y-1/2 right-4 w-12 h-12 bg-[#FF6B6B] border-4 border-black flex items-center justify-center text-black opacity-0 group-hover:opacity-100 shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all hover:scale-105"
                            title="Delete conversation"
                          >
                            <Trash2 className="w-6 h-6 stroke-[3]" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                    <div className="w-24 h-24 bg-[#4ECDC4] border-4 border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] transform rotate-6">
                      <MessageSquare className="w-12 h-12 stroke-[3]" />
                    </div>
                    <h3 className="text-2xl font-black uppercase mb-4 tracking-tight">No Chats Yet</h3>
                    <p className="font-bold max-w-xs text-gray-600 uppercase mb-8">
                      Start a conversation with one of your matches!
                    </p>
                    <button
                      onClick={() => setActiveTab('matches')}
                      className="flex items-center gap-3 px-8 py-4 bg-black text-white font-black uppercase text-lg border-4 border-black shadow-[6px_6px_0px_rgba(78,205,196,1)] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[8px_8px_0px_rgba(78,205,196,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all"
                    >
                      <Sparkles className="w-6 h-6 stroke-[3]" />
                      View Matches
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDeleteChat}
        title="Delete Conversation"
        message={`ARE YOU SURE YOU WANT TO DELETE YOUR CONVERSATION WITH ${deleteConfirm?.chatName?.toUpperCase()}? THIS CANNOT BE UNDONE.`}
        confirmText="DELETE"
        cancelText="CANCEL"
        type="danger"
      />
    </div>
  );
}