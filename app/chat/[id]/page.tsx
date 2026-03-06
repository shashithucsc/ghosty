'use client';

import { useState, useEffect, useRef, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, Ban, MessageCircle, AlertOctagon, Hand } from 'lucide-react';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { BlockReportModal } from '@/components/chat/BlockReportModal';
import { UnblockModal } from '@/components/chat/UnblockModal';
import { Toast } from '@/components/ui/Toast';
import { createClient } from '@supabase/supabase-js';
import type { RealtimeChannel } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isOwn: boolean;
  isRead?: boolean;
  readAt?: Date | null;
  isOptimistic?: boolean;
}

interface PresenceState {
  [key: string]: Array<{
    presence_ref: string;
    user_id: string;
    typing?: boolean;
    online?: boolean;
  }>;
}

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatPartner, setChatPartner] = useState({
    anonymousName: 'LOADING...',
    avatar: 'U',
    age: 0,
    gender: '',
    realName: 'LOADING...',
  });
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [blockStatus, setBlockStatus] = useState<{ 
    isBlocked: boolean; 
    blockedBy?: 'you' | 'them' | null;
    reason?: string | null;
    blockedAt?: string | null;
    canSendMessages?: boolean;
  } | null>(null);
  
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { id: conversationId } = use(params);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/login');
      return;
    }
    setCurrentUserId(userId);

    const urlParams = new URLSearchParams(window.location.search);
    const userIdFromUrl = urlParams.get('userId');
    if (userIdFromUrl) {
      setOtherUserId(userIdFromUrl);
      setLoading(false);
    }
  }, [router]);

  const markMessagesAsRead = useCallback(async () => {
    if (!currentUserId || !conversationId) return;
    try {
      await fetch('/api/chats/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          userId: currentUserId,
        }),
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [currentUserId, conversationId]);

  useEffect(() => {
    if (!currentUserId || !conversationId) return;
    let isMounted = true;

    const setupRealtimeSubscription = async () => {
      try {
        const response = await fetch(
          `/api/chats?conversationId=${conversationId}&userId=${currentUserId}&limit=100`
        );

        if (!response.ok) throw new Error('Failed to fetch messages');
        const data = await response.json();
        if (!isMounted) return;

        if (data.success && data.messages) {
          const transformedMessages = data.messages.map((msg: any) => ({
            id: msg.id,
            senderId: msg.senderId,
            text: msg.text,
            timestamp: new Date(msg.timestamp),
            isOwn: msg.isOwn,
            isRead: msg.isRead || false,
            readAt: msg.readAt ? new Date(msg.readAt) : null,
          }));

          setMessages(transformedMessages);

          if (transformedMessages.length > 0 && !otherUserId) {
            const firstMsg = transformedMessages[0];
            const otherId = firstMsg.senderId === currentUserId 
              ? data.messages[0].receiverId 
              : firstMsg.senderId;
            setOtherUserId(otherId);
          }
        }

        setLoading(false);
        await markMessagesAsRead();

        const channel = supabase.channel(`chat-${conversationId}`, {
          config: { presence: { key: currentUserId } },
        });

        channel.on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'chats', filter: `conversation_id=eq.${conversationId}` },
          (payload) => {
            if (!isMounted) return;
            const newMessage = payload.new as any;
            
            if (newMessage.sender_id === currentUserId) return;
            
            setMessages((prev) => {
              const exists = prev.some(msg => msg.id === newMessage.id);
              if (exists) return prev;

              const message: Message = {
                id: newMessage.id,
                senderId: newMessage.sender_id,
                text: newMessage.message,
                timestamp: new Date(newMessage.created_at),
                isOwn: false,
                isRead: newMessage.is_read || false,
                readAt: newMessage.read_at ? new Date(newMessage.read_at) : null,
              };

              setTimeout(() => markMessagesAsRead(), 500);
              return [...prev, message];
            });
          }
        );

        channel.on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'chats', filter: `conversation_id=eq.${conversationId}` },
          (payload) => {
            if (!isMounted) return;
            const updatedMessage = payload.new as any;
            
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === updatedMessage.id
                  ? {
                      ...msg,
                      isRead: updatedMessage.is_read || false,
                      readAt: updatedMessage.read_at ? new Date(updatedMessage.read_at) : null,
                    }
                  : msg
              )
            );
          }
        );

        channel.on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'chats', filter: `conversation_id=eq.${conversationId}` },
          (payload) => {
            if (!isMounted) return;
            const deletedMessage = payload.old as any;
            setMessages((prev) => prev.filter((msg) => msg.id !== deletedMessage.id));
          }
        );

        channel.on('presence', { event: 'sync' }, () => {
          if (!isMounted) return;
          const state = channel.presenceState<PresenceState>();
          
          let otherUserOnline = false;
          let otherUserTyping = false;

          Object.values(state).forEach((presences) => {
            presences.forEach((presence: any) => {
              if (presence.user_id !== currentUserId) {
                if (presence.online) otherUserOnline = true;
                if (presence.typing) otherUserTyping = true;
              }
            });
          });

          setIsOnline(otherUserOnline);
          setIsTyping(otherUserTyping);
        });

        await channel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({ user_id: currentUserId, online: true, typing: false });
          }
        });

        channelRef.current = channel;

      } catch (error) {
        console.error('Error setting up realtime subscription:', error);
        if (isMounted) setLoading(false);
      }
    };

    setupRealtimeSubscription();

    return () => {
      isMounted = false;
      if (channelRef.current) channelRef.current.unsubscribe();
    };
  }, [currentUserId, conversationId, otherUserId, markMessagesAsRead]);

  // Mark messages as read when user returns to the tab/window
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && currentUserId && conversationId) {
        markMessagesAsRead();
      }
    };

    const handleFocus = () => {
      if (currentUserId && conversationId) {
        markMessagesAsRead();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [currentUserId, conversationId, markMessagesAsRead]);

  const handleTyping = useCallback(() => {
    if (!channelRef.current || !currentUserId) return;

    channelRef.current.track({ user_id: currentUserId, online: true, typing: true });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      if (channelRef.current && currentUserId) {
        channelRef.current.track({ user_id: currentUserId, online: true, typing: false });
      }
    }, 2000);
  }, [currentUserId]);

  useEffect(() => {
    if (!otherUserId || !currentUserId) return;

    const fetchUserProfile = async () => {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles_v2')
          .select(`anonymous_name, anonymous_avatar_url, age, user_id, users_v2!inner(gender)`)
          .eq('user_id', otherUserId)
          .single();

        if (profileError) {
          const response = await fetch(`/api/users/${otherUserId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.user) {
              const user = data.user;
              setChatPartner({
                realName: user.anonymousName || 'ANONYMOUS',
                anonymousName: user.anonymousName || 'ANONYMOUS',
                avatar: user.anonymousAvatarUrl || (user.gender?.toLowerCase() === 'male' ? '🧑' : user.gender?.toLowerCase() === 'female' ? '👩' : '👤'),
                age: user.age || 18,
                gender: user.gender || 'UNKNOWN',
              });
            }
          }
          return;
        }

        const calculatedAge = profile?.age || 18;
        const gender = (profile?.users_v2 as any)?.gender || 'UNKNOWN';

        setChatPartner({
          realName: profile?.anonymous_name || 'ANONYMOUS',
          anonymousName: profile?.anonymous_name || 'ANONYMOUS',
          avatar: profile?.anonymous_avatar_url || (gender.toLowerCase() === 'male' ? '🧑' : gender.toLowerCase() === 'female' ? '👩' : '👤'),
          age: calculatedAge,
          gender: gender,
        });
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    const checkBlockStatus = async () => {
      try {
        const response = await fetch(`/api/blocks/check?userId=${currentUserId}&otherUserId=${otherUserId}`);
        if (!response.ok) {
          setBlockStatus({ isBlocked: false });
          return;
        }

        const data = await response.json();
        if (data.success && data.blockStatus) {
          setBlockStatus(data.blockStatus);
          if (data.blockStatus.isBlocked) setIsBlocked(true);
        } else {
          setBlockStatus({ isBlocked: false });
        }
      } catch (error) {
        setBlockStatus({ isBlocked: false });
      }
    };

    fetchUserProfile();
    checkBlockStatus();
  }, [otherUserId, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (text: string) => {
    if (!currentUserId || !otherUserId || !text.trim() || sending) return;

    if (blockStatus?.isBlocked) {
      const message = blockStatus.blockedBy === 'you'
        ? 'You have blocked this user. Unblock them to send messages.'
        : 'This user has blocked you. You cannot send messages.';
      setToast({ message, type: 'warning' });
      return;
    }

    try {
      setSending(true);

      const tempId = `temp-${Date.now()}`;
      const optimisticMessage: Message = {
        id: tempId,
        senderId: currentUserId,
        text,
        timestamp: new Date(),
        isOwn: true,
        isOptimistic: true,
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      if (channelRef.current) {
        channelRef.current.track({ user_id: currentUserId, online: true, typing: false });
      }

      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          senderId: currentUserId,
          receiverId: otherUserId,
          message: text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403 && data.error?.includes('blocked')) {
          const blockCheckResponse = await fetch(`/api/blocks/check?userId=${currentUserId}&otherUserId=${otherUserId}`);
          if (blockCheckResponse.ok) {
            const blockData = await blockCheckResponse.json();
            if (blockData.success && blockData.blockStatus) {
              setBlockStatus(blockData.blockStatus);
              if (blockData.blockStatus.isBlocked) setIsBlocked(true);
            }
          }
          throw new Error(data.error || 'Cannot send message. One user has blocked the other.');
        }
        throw new Error(data.error || 'Failed to send message');
      }

      if (data.success && data.message) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId
              ? {
                  id: data.message.id,
                  senderId: data.message.senderId,
                  text: data.message.text,
                  timestamp: new Date(data.message.timestamp),
                  isOwn: true,
                  isRead: false,
                  readAt: null,
                  isOptimistic: false,
                }
              : msg
          )
        );
      }
    } catch (error) {
      setMessages((prev) => prev.filter((msg) => !msg.id.startsWith('temp-')));
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message. Please try again.';
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!currentUserId) return;
    try {
      const response = await fetch(`/api/chats/${messageId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete message');

      setToast({ message: 'Message deleted', type: 'success' });
    } catch (error) {
      setToast({ message: error instanceof Error ? error.message : 'Failed to delete message', type: 'error' });
    }
  };

  const handleBlockOrReport = async (action: 'block' | 'report', reason: string) => {
    if (!currentUserId || !otherUserId) return;
    try {
      if (action === 'block') {
        const response = await fetch('/api/blocks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ blockerId: currentUserId, blockedId: otherUserId, reason }),
        });
        const data = await response.json();
        if (response.ok) {
          setBlockStatus({ isBlocked: true, blockedBy: 'you', canSendMessages: false });
          setIsBlocked(true);
          setShowBlockModal(false);
          setToast({ message: 'User blocked successfully.', type: 'success' });
        } else {
          setToast({ message: data.error || 'Failed to block user', type: 'error' });
        }
      } else {
        const response = await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reporterId: currentUserId,
            reportedUserId: otherUserId,
            reason: mapReasonToEnum(reason),
            description: reason,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          setToast({ message: 'Report submitted successfully.', type: 'success' });
          setShowBlockModal(false);
        } else {
          setToast({ message: data.error || 'Failed to submit report', type: 'error' });
        }
      }
    } catch (error) {
      setToast({ message: `Failed to ${action} user.`, type: 'error' });
    }
  };

  const handleUnblock = async () => {
    if (!currentUserId || !otherUserId) return;
    try {
      const response = await fetch(`/api/blocks?blockerId=${currentUserId}&blockedId=${otherUserId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (response.ok) {
        setBlockStatus({ isBlocked: false, canSendMessages: true });
        setIsBlocked(false);
        setShowUnblockModal(false);
        setToast({ message: 'User unblocked successfully.', type: 'success' });
      } else {
        setToast({ message: data.error || 'Failed to unblock user', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Failed to unblock user.', type: 'error' });
    }
  };

  const mapReasonToEnum = (reason: string): string => {
    const mapping: Record<string, string> = {
      'Harassment or bullying': 'harassment',
      'Inappropriate content': 'inappropriate_content',
      'Spam or scam': 'spam',
      'Fake profile': 'fake_profile',
      'Violent threats': 'harassment',
      'Other safety concern': 'other',
    };
    return mapping[reason] || 'other';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center p-4 font-sans text-black">
        <div className="bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,1)] p-10 text-center max-w-sm w-full">
          <div className="w-20 h-20 border-8 border-black border-t-[#FFD166] rounded-full animate-spin mx-auto mb-8 shadow-[4px_4px_0px_rgba(0,0,0,1)]"></div>
          <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Loading</h2>
          <p className="font-bold text-gray-600 uppercase">Connecting to chat...</p>
        </div>
      </div>
    );
  }

  if (isBlocked && blockStatus?.isBlocked) {
    const blockedByYou = blockStatus.blockedBy === 'you';
    return (
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center p-4 font-sans text-black">
        <div className="bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,1)] p-8 text-center max-w-md w-full">
          <div className="w-24 h-24 bg-[#FF6B6B] border-4 border-black rounded-full flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <Ban className="w-12 h-12 stroke-[3]" />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight mb-4">
            {blockedByYou ? 'User Blocked' : 'You Are Blocked'}
          </h2>
          <p className="font-bold text-gray-700 uppercase mb-8 leading-relaxed">
            {blockedByYou 
              ? `You have blocked ${chatPartner.anonymousName}. They won't be able to contact you anymore.`
              : `${chatPartner.anonymousName} has blocked you. You cannot send messages to them.`
            }
          </p>
          
          {blockStatus.reason && (
            <div className="bg-[#FFD166] border-4 border-black p-4 mb-8 text-left shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              <p className="text-sm font-black uppercase tracking-wider mb-1">Reason:</p>
              <p className="font-bold text-black">{blockStatus.reason}</p>
            </div>
          )}

          {blockedByYou && (
            <button
              type="button"
              onClick={() => setShowUnblockModal(true)}
              className="w-full px-6 py-5 bg-[#4ECDC4] border-4 border-black text-black rounded-xl font-black uppercase text-xl tracking-wider shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all"
            >
              Unblock User
            </button>
          )}
        </div>

        {showUnblockModal && (
          <UnblockModal
            userName={chatPartner.anonymousName}
            onUnblock={handleUnblock}
            onClose={() => setShowUnblockModal(false)}
          />
        )}

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#FDF8F5] flex flex-col overflow-hidden font-sans text-black pt-0 md:pt-20">
      
      {/* Desktop Header */}
      <div className="hidden md:block">
        <ChatHeader
          title={chatPartner.realName}
          subtitle={chatPartner.age > 0 ? `${chatPartner.age} • ${chatPartner.gender}` : chatPartner.gender}
          avatar={chatPartner.avatar}
          showBack={false}
          showMenu={true}
          onBlockReport={() => setShowBlockModal(true)}
          userId={otherUserId || undefined}
          onProfileClick={otherUserId ? () => router.push(`/profile/${otherUserId}`) : undefined}
          isOnline={isOnline}
          isTyping={isTyping}
        />
      </div>

      {/* Mobile Neobrutalist Header */}
      <div className="md:hidden bg-white border-b-4 border-black shadow-[0_4px_0px_rgba(0,0,0,1)] z-20 sticky top-0">
        <div className="px-4 py-4 flex items-center justify-between">
          <div 
            className="flex-1 flex items-center gap-4 cursor-pointer group"
            onClick={otherUserId ? () => router.push(`/profile/${otherUserId}`) : undefined}
          >
            <div className="relative shrink-0">
              <div className="w-14 h-14 bg-[#FFD166] border-4 border-black flex items-center justify-center text-3xl font-black shadow-[2px_2px_0px_rgba(0,0,0,1)] group-hover:translate-y-[2px] group-hover:translate-x-[2px] group-hover:shadow-none transition-all">
                {chatPartner.avatar}
              </div>
              {isOnline && (
                <div className="absolute -bottom-2 -right-2 w-5 h-5 bg-[#A3E635] border-2 border-black"></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-black uppercase truncate tracking-tight text-black">
                {chatPartner.realName}
              </h1>
              {isTyping ? (
                <p className="text-sm font-black text-[#FF6B6B] uppercase tracking-widest truncate">
                  Typing...
                </p>
              ) : chatPartner.age > 0 ? (
                <div className="flex items-center gap-2 mt-1">
                  {isOnline && <span className="w-2 h-2 bg-[#A3E635] border border-black rounded-full"></span>}
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wider truncate">
                    {chatPartner.age} YRS • {chatPartner.gender}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
          
          <button
            onClick={() => setShowBlockModal(true)}
            className="w-12 h-12 bg-white border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-[#F8F9FA] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all"
          >
            <MoreVertical className="w-6 h-6 stroke-[3] text-black" />
          </button>
        </div>
      </div>

      {/* Block Status Warning Banner */}
      {blockStatus?.isBlocked && (
        <div className="bg-[#FF6B6B] border-b-4 border-black px-4 py-4 z-10 shadow-[0_4px_0px_rgba(0,0,0,1)]">
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="shrink-0 w-12 h-12 bg-white border-4 border-black flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <AlertOctagon className="w-6 h-6 stroke-[3] text-black" />
              </div>
              <div>
                <p className="text-lg font-black uppercase tracking-tight text-black">
                  {blockStatus.blockedBy === 'you' ? `You blocked ${chatPartner.realName}` : `Blocked by ${chatPartner.realName}`}
                </p>
                <p className="text-sm font-bold text-black uppercase mt-1">
                  {blockStatus.blockedBy === 'you' ? 'Click Unblock to resume chat.' : 'You cannot send messages.'}
                </p>
              </div>
            </div>
            
            {blockStatus.blockedBy === 'you' && (
              <button
                onClick={() => setShowUnblockModal(true)}
                className="w-full sm:w-auto px-6 py-3 bg-[#4ECDC4] border-4 border-black text-black font-black uppercase tracking-wider rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all"
              >
                Unblock
              </button>
            )}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6 pb-24 space-y-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-16 bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,1)] mt-8">
              <div className="w-24 h-24 bg-[#FFD166] border-4 border-black rounded-full flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <Hand className="w-12 h-12 stroke-[3] text-black" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-2">
                Start the Chat
              </h3>
              <p className="font-bold text-gray-600 uppercase tracking-widest">
                Say hi to {chatPartner.anonymousName}!
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage 
                key={message.id} 
                message={message} 
                onDelete={message.isOwn ? handleDeleteMessage : undefined}
              />
            ))
          )}
          
          {/* Neobrutalist Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border-4 border-black rounded-2xl rounded-tl-none px-5 py-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] inline-block">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-black border-2 border-black rounded-none animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-3 h-3 bg-[#FFD166] border-2 border-black rounded-none animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-3 h-3 bg-[#4ECDC4] border-2 border-black rounded-none animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <ChatInput 
        onSend={handleSendMessage} 
        onTyping={handleTyping}
        disabled={sending || (blockStatus?.isBlocked ?? false)}
        disabledMessage={
          blockStatus?.isBlocked 
            ? blockStatus.blockedBy === 'you'
              ? 'YOU HAVE BLOCKED THIS USER'
              : 'THIS USER HAS BLOCKED YOU'
            : undefined
        }
      />

      {/* Modals */}
      {showBlockModal && (
        <BlockReportModal
          userName={chatPartner.anonymousName}
          onBlock={handleBlockOrReport}
          onClose={() => setShowBlockModal(false)}
        />
      )}

      {showUnblockModal && (
        <UnblockModal
          userName={chatPartner.anonymousName}
          onUnblock={handleUnblock}
          onClose={() => setShowUnblockModal(false)}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}