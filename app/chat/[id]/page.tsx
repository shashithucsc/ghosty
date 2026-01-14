'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical } from 'lucide-react';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { BlockReportModal } from '@/components/chat/BlockReportModal';
import { UnblockModal } from '@/components/chat/UnblockModal';
import { Toast } from '@/components/ui/Toast';
import { createClient } from '@supabase/supabase-js';

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
}

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
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

  // Fetch messages and determine other user
  useEffect(() => {
    if (!currentUserId || !conversationId) return;

    let isFirstLoad = true;
    let isMounted = true;

    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `/api/chats?conversationId=${conversationId}&userId=${currentUserId}&limit=100`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }

        const data = await response.json();

        if (!isMounted) return;

        if (data.success && data.messages) {
          // Transform messages to include proper Date objects
          const transformedMessages = data.messages.map((msg: any) => ({
            id: msg.id,
            senderId: msg.senderId,
            text: msg.text,
            timestamp: new Date(msg.timestamp),
            isOwn: msg.isOwn,
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

        // Stop loading after first fetch
        if (isFirstLoad) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        if (isFirstLoad) {
          setLoading(false);
        }
      } finally {
        isFirstLoad = false;
      }
    };

    fetchMessages();

    // Poll for new messages every 3 seconds
    const interval = setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentUserId, conversationId]);

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

      // Optimistically add message to UI
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        senderId: currentUserId,
        text,
        timestamp: new Date(),
        isOwn: true,
      };

      setMessages((prev) => [...prev, tempMessage]);

      // Send message to API
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
        // Replace temp message with real one
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempMessage.id
              ? {
                  id: data.message.id,
                  senderId: data.message.senderId,
                  text: data.message.text,
                  timestamp: new Date(data.message.timestamp),
                  isOwn: true,
                }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove failed message from UI
      setMessages((prev) => prev.filter((msg) => !msg.id.startsWith('temp-')));
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message. Please try again.';
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setSending(false);
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
          setIsBlocked(true);
          setShowBlockModal(false);
          setToast({ message: 'User blocked successfully.', type: 'success' });
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
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
        setBlockStatus({ isBlocked: false });
        setIsBlocked(false);
        setShowUnblockModal(false);
        
        // Show success message
        setToast({ 
          message: data.message || 'User unblocked successfully. You can now send messages.', 
          type: 'success' 
        });
        
        // Refresh the page to update UI after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
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
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950 flex items-center justify-center p-4">
        <div className="glassmorphic-card p-8 text-center max-w-md animate-scale-in">
          <div className="text-6xl mb-4 animate-pulse">💬</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
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
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950 flex items-center justify-center p-4">
        <div className="glassmorphic-card p-8 text-center max-w-md animate-scale-in">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
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
    <div className="h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-950 flex flex-col overflow-hidden">
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
        />
      </div>

      {/* Mobile Header - Compact */}
      <div className="md:hidden bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700/50 shadow-lg">
        <div className="px-4 py-3 flex items-center justify-between">
          <div 
            className="flex-1 flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={otherUserId ? () => router.push(`/profile/${otherUserId}`) : undefined}
          >
            {chatPartner.avatar && (
              <div className="text-3xl">{chatPartner.avatar}</div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-gray-900 dark:text-white truncate">
                {chatPartner.realName}
              </h1>
              {chatPartner.age > 0 && (
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {chatPartner.age} • {chatPartner.gender}
                </p>
              )}
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
        <div className="bg-red-100 dark:bg-red-900/30 border-b border-red-300 dark:border-red-700/50 px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <span className="text-2xl">🚫</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                {blockStatus.blockedBy === 'you' 
                  ? `You have blocked ${chatPartner.anonymousName}`
                  : `${chatPartner.anonymousName} has blocked you`
                }
              </p>
              <p className="text-xs text-red-700 dark:text-red-300">
                {blockStatus.blockedBy === 'you'
                  ? 'You cannot send or receive messages from this user.'
                  : 'You cannot send messages to this user.'}
              </p>
            </div>
            {blockStatus.blockedBy === 'you' && (
              <button
                onClick={() => setShowUnblockModal(true)}
                className="px-4 py-2 bg-white dark:bg-gray-800/95 text-green-700 dark:text-green-400 border-2 border-green-600 dark:border-green-500 rounded-lg text-sm font-semibold hover:bg-green-50 dark:hover:bg-gray-700 transition-all duration-200"
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
              <ChatMessage key={message.id} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <ChatInput 
        onSend={handleSendMessage} 
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
