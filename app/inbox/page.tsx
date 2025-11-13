'use client';

import { useState, useEffect } from 'react';
import { InboxList } from '@/components/chat/InboxList';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { Toast } from '@/components/ui/Toast';
import { MessageSquare, Inbox, User } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <ChatHeader
        title="Inbox"
        showBack={true}
        onBack={() => router.push('/dashboard')}
      />

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-16 z-10">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all relative ${
                activeTab === 'requests'
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <Inbox className="w-5 h-5" />
              Requests
              {pendingRequests.length > 0 && (
                <span className="bg-yellow-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
              {activeTab === 'requests' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('chats')}
              className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all relative ${
                activeTab === 'chats'
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              Chats
              {chats.length > 0 && (
                <span className="bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {chats.length}
                </span>
              )}
              {activeTab === 'chats' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-6 max-w-2xl pb-24">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="spinner-large mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Requests Tab */}
            {activeTab === 'requests' && (
              <>
                {/* Pending Requests */}
                {pendingRequests.length > 0 && (
                  <section>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                      Pending Requests ({pendingRequests.length})
                    </h2>
                    <InboxList
                      requests={pendingRequests}
                      onAccept={handleAccept}
                      onReject={handleReject}
                      onBlock={handleBlock}
                      onOpenChat={handleOpenChat}
                    />
                  </section>
                )}

                {/* Blocked Users */}
                {blockedRequests.length > 0 && (
                  <section>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      Blocked ({blockedRequests.length})
                    </h2>
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
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">📬</div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                      No Pending Requests
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      When someone sends you a message request, it will appear here.
                    </p>
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="btn-primary py-3 px-8 max-w-xs mx-auto"
                    >
                      Browse Profiles
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Chats Tab */}
            {activeTab === 'chats' && (
              <>
                {chats.length > 0 ? (
                  <section>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Active Conversations ({chats.length})
                    </h2>
                    <div className="space-y-3">
                      {chats.map((chat) => (
                        <div
                          key={chat.id}
                          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-5 animate-slide-up hover:shadow-xl transition-all group"
                        >
                          <div className="flex items-start gap-3 sm:gap-4">
                            {/* Avatar - Click to view profile */}
                            <div 
                              className="text-4xl sm:text-5xl shrink-0 cursor-pointer hover:scale-110 transition-transform relative group/avatar"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/profile/${chat.otherUser.id}`);
                              }}
                              title="View Profile"
                            >
                              {chat.otherUser.avatar}
                              <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1 opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                <User className="w-3 h-3" />
                              </div>
                            </div>

                            {/* Content - Click to open chat */}
                            <div 
                              className="flex-1 min-w-0 cursor-pointer"
                              onClick={() => handleOpenActiveChat(chat.conversationId, chat.otherUser.id)}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                    {chat.otherUser.anonymousName}
                                  </h3>
                                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                    {chat.otherUser.age ? `${chat.otherUser.age} • ` : ''}{chat.otherUser.gender}
                                    {chat.otherUser.verified && ' • ✓ Verified'}
                                  </p>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap ml-2">
                                  {new Date(chat.lastMessageTime).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                                {chat.lastMessage}
                              </p>
                              {chat.unreadCount > 0 && (
                                <div className="mt-2">
                                  <span className="bg-purple-600 text-white text-xs font-bold rounded-full px-2 py-1">
                                    {chat.unreadCount} new
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                      No Active Chats
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Accept a request to start chatting!
                    </p>
                    <button
                      onClick={() => setActiveTab('requests')}
                      className="btn-primary py-3 px-8 max-w-xs mx-auto"
                    >
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
