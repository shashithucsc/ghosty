'use client';

import { useState, useEffect, useRef, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical } from 'lucide-react';
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
    anonymousName: 'Loading...',
    avatar: '�',
    age: 0,
    gender: '',
    realName: 'Loading...',
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
  
  // New state for enhanced features
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Unwrap params using React.use()
  const { id: conversationId } = use(params);

  // Get current user ID from localStorage
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/login');
      return;
    }
    setCurrentUserId(userId);

    // Check if otherUserId is passed in URL query params (for new conversations)
    const urlParams = new URLSearchParams(window.location.search);
    const userIdFromUrl = urlParams.get('userId');
    if (userIdFromUrl) {
      setOtherUserId(userIdFromUrl);
      setLoading(false); // Stop loading immediately if we have the user ID
    }
  }, [router]);

  // Mark messages as read when user opens chat
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

  // Setup Supabase Realtime subscription (STOP POLLING, START LISTENING)
  useEffect(() => {
    if (!currentUserId || !conversationId) return;

    let isMounted = true;

    const setupRealtimeSubscription = async () => {
      try {
        // Initial fetch of messages
        const response = await fetch(
          `/api/chats?conversationId=${conversationId}&userId=${currentUserId}&limit=100`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }

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

          // Determine the other user ID from messages if not already set
          if (transformedMessages.length > 0 && !otherUserId) {
            const firstMsg = transformedMessages[0];
            const otherId = firstMsg.senderId === currentUserId 
              ? data.messages[0].receiverId 
              : firstMsg.senderId;
            setOtherUserId(otherId);
          }
        }

        setLoading(false);

        // Mark messages as read
        await markMessagesAsRead();

        // Create a channel for this conversation
        const channel = supabase.channel(`chat-${conversationId}`, {
          config: {
            presence: {
              key: currentUserId,
            },
          },
        });

        // Subscribe to new messages (INSERT events)
        channel.on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chats',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            if (!isMounted) return;
            
            console.log('📨 New message received via Realtime:', payload);
            
            const newMessage = payload.new as any;
            
            // Don't add if it's our own optimistic message
            setMessages((prev) => {
              // Check if this message already exists (from optimistic update)
              const exists = prev.some(msg => msg.id === newMessage.id);
              if (exists) {
                console.log('Message already exists (optimistic), skipping');
                return prev;
              }

              const message: Message = {
                id: newMessage.id,
                senderId: newMessage.sender_id,
                text: newMessage.message,
                timestamp: new Date(newMessage.created_at),
                isOwn: newMessage.sender_id === currentUserId,
                isRead: newMessage.is_read || false,
                readAt: newMessage.read_at ? new Date(newMessage.read_at) : null,
              };

              console.log('✅ Adding new message to state:', message);

              // Mark as read if it's not our message
              if (!message.isOwn) {
                setTimeout(() => markMessagesAsRead(), 500);
              }

              return [...prev, message];
            });
          }
        );

        // Subscribe to message updates (for read receipts)
        channel.on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'chats',
            filter: `conversation_id=eq.${conversationId}`,
          },
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

        // Subscribe to message deletions
        channel.on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'chats',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            if (!isMounted) return;
            
            const deletedMessage = payload.old as any;
            
            setMessages((prev) => prev.filter((msg) => msg.id !== deletedMessage.id));
          }
        );

        // Subscribe to presence for typing indicators and online status
        channel.on('presence', { event: 'sync' }, () => {
          if (!isMounted) return;
          
          const state = channel.presenceState<PresenceState>();
          
          // Check if other user is online and typing
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

        // Subscribe to the channel
        await channel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Realtime channel subscribed successfully');
            // Track our presence (online)
            await channel.track({
              user_id: currentUserId,
              online: true,
              typing: false,
            });
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Realtime channel error');
          } else if (status === 'TIMED_OUT') {
            console.error('⏱️ Realtime subscription timed out');
          }
        });

        channelRef.current = channel;

      } catch (error) {
        console.error('Error setting up realtime subscription:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    setupRealtimeSubscription();

    // Cleanup
    return () => {
      isMounted = false;
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [currentUserId, conversationId, otherUserId, markMessagesAsRead]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!channelRef.current || !currentUserId) return;

    // Send typing indicator
    channelRef.current.track({
      user_id: currentUserId,
      online: true,
      typing: true,
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of no input
    typingTimeoutRef.current = setTimeout(() => {
      if (channelRef.current && currentUserId) {
        channelRef.current.track({
          user_id: currentUserId,
          online: true,
          typing: false,
        });
      }
    }, 2000);
  }, [currentUserId]);

  // Fetch other user's profile and check block status
  useEffect(() => {
    if (!otherUserId || !currentUserId) return;

    const fetchUserProfile = async () => {
      try {
        // Fetch from profiles table for complete info
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('real_name, anonymous_name, anonymous_avatar_url, dob, age, gender')
          .eq('user_id', otherUserId)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          // Fallback to users table
          const response = await fetch(`/api/users/${otherUserId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.user) {
              const user = data.user;
              const birthday = new Date(user.birthday);
              const age = new Date().getFullYear() - birthday.getFullYear();
              setChatPartner({
                realName: user.username || 'Anonymous',
                anonymousName: user.username || 'Anonymous',
                avatar: user.gender === 'Male' ? '👨' : user.gender === 'Female' ? '👩' : '👤',
                age: age,
                gender: user.gender || 'Unknown',
              });
            }
          }
          return;
        }

        // Calculate age from dob if available
        let calculatedAge = profile?.age || 0;
        if (profile?.dob) {
          const birthDate = new Date(profile.dob);
          const today = new Date();
          calculatedAge = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            calculatedAge--;
          }
        }

        setChatPartner({
          realName: profile?.real_name || profile?.anonymous_name || 'Anonymous',
          anonymousName: profile?.real_name || profile?.anonymous_name || 'Anonymous',
          avatar: profile?.anonymous_avatar_url || '👤',
          age: calculatedAge,
          gender: profile?.gender || 'Unknown',
        });
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    const checkBlockStatus = async () => {
      try {
        // Use the new dedicated block check endpoint
        const response = await fetch(
          `/api/blocks/check?userId=${currentUserId}&otherUserId=${otherUserId}`
        );
        
        if (!response.ok) {
          console.error('Failed to check block status');
          setBlockStatus({ isBlocked: false });
          return;
        }

        const data = await response.json();
        
        if (data.success && data.blockStatus) {
          setBlockStatus(data.blockStatus);
          
          // If blocked, update the isBlocked state for UI
          if (data.blockStatus.isBlocked) {
            setIsBlocked(true);
          }
        } else {
          setBlockStatus({ isBlocked: false });
        }
      } catch (error) {
        console.error('Error checking block status:', error);
        setBlockStatus({ isBlocked: false });
      }
    };

    fetchUserProfile();
    checkBlockStatus();
  }, [otherUserId, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (text: string) => {
    if (!currentUserId || !otherUserId || !text.trim() || sending) return;

    // Check if blocked before sending
    if (blockStatus?.isBlocked) {
      const message = blockStatus.blockedBy === 'you'
        ? 'You have blocked this user. Unblock them to send messages.'
        : 'This user has blocked you. You cannot send messages.';
      setToast({ message, type: 'warning' });
      return;
    }

    try {
      setSending(true);

      // Create optimistic message with temp ID (OPTIMISTIC UI)
      const tempId = `temp-${Date.now()}`;
      const optimisticMessage: Message = {
        id: tempId,
        senderId: currentUserId,
        text,
        timestamp: new Date(),
        isOwn: true,
        isOptimistic: true,
      };

      // Immediately add to UI - Don't wait for server response
      setMessages((prev) => [...prev, optimisticMessage]);

      // Stop typing indicator
      if (channelRef.current) {
        channelRef.current.track({
          user_id: currentUserId,
          online: true,
          typing: false,
        });
      }

      // Send message to API in background
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          senderId: currentUserId,
          receiverId: otherUserId,
          message: text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error messages from the API
        if (response.status === 403 && data.error?.includes('blocked')) {
          // User was blocked during the session, refresh block status
          const blockCheckResponse = await fetch(
            `/api/blocks/check?userId=${currentUserId}&otherUserId=${otherUserId}`
          );
          if (blockCheckResponse.ok) {
            const blockData = await blockCheckResponse.json();
            if (blockData.success && blockData.blockStatus) {
              setBlockStatus(blockData.blockStatus);
              if (blockData.blockStatus.isBlocked) {
                setIsBlocked(true);
              }
            }
          }
          throw new Error(data.error || 'Cannot send message. One user has blocked the other.');
        }
        throw new Error(data.error || 'Failed to send message');
      }

      if (data.success && data.message) {
        // Replace optimistic message with real one from server
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
      console.error('Error sending message:', error);
      // Remove failed optimistic message from UI
      setMessages((prev) => prev.filter((msg) => !msg.id.startsWith('temp-')));
      
      // Show user-friendly error message
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: currentUserId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete message');
      }

      // Message will be removed via Realtime subscription
      setToast({ message: 'Message deleted', type: 'success' });
    } catch (error) {
      console.error('Error deleting message:', error);
      setToast({ 
        message: error instanceof Error ? error.message : 'Failed to delete message', 
        type: 'error' 
      });
    }
  };
  const handleBlockOrReport = async (action: 'block' | 'report', reason: string) => {
    if (!currentUserId || !otherUserId) return;

    try {
      if (action === 'block') {
        // Block user
        const response = await fetch('/api/blocks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            blockerId: currentUserId,
            blockedId: otherUserId,
            reason,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Update block status immediately
          setBlockStatus({
            isBlocked: true,
            blockedBy: 'you',
            canSendMessages: false,
          });
          setIsBlocked(true);
          setShowBlockModal(false);
          setToast({ 
            message: 'User blocked successfully. You can unblock them anytime from this conversation.', 
            type: 'success' 
          });
          // Don't redirect - keep user in the conversation so they can see the block status
        } else {
          setToast({ message: data.error || 'Failed to block user', type: 'error' });
        }
      } else {
        // Report user
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
          setToast({ 
            message: data.message || 'Report submitted successfully. Our team will review it shortly.', 
            type: 'success' 
          });
          setShowBlockModal(false);
        } else {
          setToast({ message: data.error || 'Failed to submit report', type: 'error' });
        }
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      setToast({ message: `Failed to ${action} user. Please try again.`, type: 'error' });
    }
  };

  const handleUnblock = async () => {
    if (!currentUserId || !otherUserId) {
      return;
    }

    try {
      const response = await fetch(
        `/api/blocks?blockerId=${currentUserId}&blockedId=${otherUserId}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Update block status
        setBlockStatus({ isBlocked: false, canSendMessages: true });
        setIsBlocked(false);
        setShowUnblockModal(false);
        
        // Show success message
        setToast({ 
          message: data.message || 'User unblocked successfully. You can now send messages.', 
          type: 'success' 
        });
        // No need to reload - state is updated and UI will reflect the change
      } else {
        setToast({ message: data.error || 'Failed to unblock user', type: 'error' });
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
      setToast({ message: 'Failed to unblock user. Please try again.', type: 'error' });
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-950 flex items-center justify-center p-4">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700/50 rounded-2xl shadow-2xl p-8 text-center max-w-md animate-scale-in">
          <div className="text-6xl mb-4 animate-pulse">💬</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Loading Chat...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we load your conversation
          </p>
        </div>
      </div>
    );
  }

  if (isBlocked && blockStatus?.isBlocked) {
    const blockedByYou = blockStatus.blockedBy === 'you';
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-950 flex items-center justify-center p-4">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700/50 rounded-2xl shadow-2xl p-8 text-center max-w-md animate-scale-in">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {blockedByYou ? 'User Blocked' : 'You Are Blocked'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {blockedByYou 
              ? `You have blocked ${chatPartner.anonymousName}. They won't be able to contact you anymore.`
              : `${chatPartner.anonymousName} has blocked you. You cannot send messages to them.`
            }
          </p>
          {blockStatus.reason && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                Reason:
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                {blockStatus.reason}
              </p>
            </div>
          )}
          <div className="flex gap-3 w-full">
            {blockedByYou && (
              <button
                type="button"
                onClick={() => setShowUnblockModal(true)}
                className="w-full px-6 py-3 bg-linear-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer"
              >
                Unblock User
              </button>
            )}
          </div>
        </div>

        {/* Unblock Modal for Blocked Screen */}
        {showUnblockModal && (
          <UnblockModal
            userName={chatPartner.anonymousName}
            onUnblock={handleUnblock}
            onClose={() => setShowUnblockModal(false)}
          />
        )}

        {/* Toast Notification */}
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

  return (
    <div className="h-screen pt-0 md:pt-20 bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-950 flex flex-col overflow-hidden">
      {/* Header - Hidden on mobile */}
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

      {/* Mobile Header - Compact */}
      <div className="md:hidden bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700/50 shadow-lg">
        <div className="px-4 py-3 flex items-center justify-between">
          <div 
            className="flex-1 flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={otherUserId ? () => router.push(`/profile/${otherUserId}`) : undefined}
          >
            <div className="relative">
              {chatPartner.avatar && (
                <div className="text-3xl">{chatPartner.avatar}</div>
              )}
              {isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-gray-900 dark:text-white truncate">
                {chatPartner.realName}
              </h1>
              {isTyping ? (
                <p className="text-xs text-purple-600 dark:text-purple-400 truncate">
                  typing...
                </p>
              ) : chatPartner.age > 0 ? (
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {isOnline && <span className="text-green-500">● </span>}
                  {chatPartner.age} • {chatPartner.gender}
                </p>
              ) : null}
            </div>
          </div>
          <button
            onClick={() => setShowBlockModal(true)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Block Status Warning Banner */}
      {blockStatus?.isBlocked && (
        <div className="bg-gradient-to-r from-red-500/10 via-red-600/10 to-red-500/10 dark:bg-gradient-to-r dark:from-red-900/20 dark:via-red-800/20 dark:to-red-900/20 backdrop-blur-sm border-b-2 border-red-400/30 dark:border-red-600/30 px-4 py-4">
          <div className="max-w-2xl mx-auto flex items-center gap-4">
            {/* Icon with glow */}
            <div className="shrink-0 w-10 h-10 rounded-full bg-red-500/20 dark:bg-red-500/30 flex items-center justify-center shadow-lg shadow-red-500/20">
              <span className="text-2xl">🚫</span>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-red-900 dark:text-red-100 mb-0.5">
                {blockStatus.blockedBy === 'you' 
                  ? `You have blocked ${chatPartner.realName}`
                  : `${chatPartner.realName} has blocked you`
                }
              </p>
              <p className="text-xs text-red-800/90 dark:text-red-200/80">
                {blockStatus.blockedBy === 'you'
                  ? 'You cannot send or receive messages. Click Unblock to restore communication.'
                  : 'You cannot send messages to this user.'}
              </p>
            </div>
            
            {/* Unblock Button */}
            {blockStatus.blockedBy === 'you' && (
              <button
                onClick={() => setShowUnblockModal(true)}
                className="shrink-0 px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl text-sm font-bold hover:from-green-500 hover:to-green-400 transition-all duration-200 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-105 active:scale-95"
              >
                Unblock
              </button>
            )}
          </div>
        </div>
      )}

      {/* Messages - Scrollable Container with bottom padding for mobile navbar */}
      <main className="flex-1 overflow-y-auto px-4 py-6 pb-20 sm:pb-6 space-y-4 custom-scrollbar">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👋</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Start the Conversation
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
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
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start animate-slide-up">
              <div className="max-w-[75%] sm:max-w-[60%]">
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl rounded-tl-sm px-4 py-3 shadow-lg border border-gray-200 dark:border-gray-700/50">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <ChatInput 
        onSend={handleSendMessage} 
        onTyping={handleTyping}
        disabled={sending || (blockStatus?.isBlocked ?? false)}
        disabledMessage={
          blockStatus?.isBlocked 
            ? blockStatus.blockedBy === 'you'
              ? '🚫 You have blocked this user'
              : '🚫 This user has blocked you'
            : undefined
        }
      />

      {/* Block/Report Modal */}
      {showBlockModal && (
        <BlockReportModal
          userName={chatPartner.anonymousName}
          onBlock={handleBlockOrReport}
          onClose={() => setShowBlockModal(false)}
        />
      )}

      {/* Unblock Modal */}
      {showUnblockModal && (
        <UnblockModal
          userName={chatPartner.anonymousName}
          onUnblock={handleUnblock}
          onClose={() => setShowUnblockModal(false)}
        />
      )}

      {/* Toast Notification */}
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
