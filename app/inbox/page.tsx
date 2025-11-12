'use client';

import { useState, useEffect } from 'react';
import { InboxList } from '@/components/chat/InboxList';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface ChatRequest {
  id: string;
  from: {
    anonymousName: string;
    avatar: string;
    age: number;
    gender: string;
  };
  message: string;
  timestamp: Date;
  status: 'pending' | 'accepted' | 'rejected';
  isBlocked?: boolean;
}

export default function InboxPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<ChatRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock chat requests
    const mockRequests: ChatRequest[] = [
      {
        id: '1',
        from: {
          anonymousName: 'CharmingSoul456',
          avatar: '👩',
          age: 24,
          gender: 'Female',
        },
        message: 'Hey! I loved your profile, would love to chat! 😊',
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 min ago
        status: 'pending',
      },
      {
        id: '2',
        from: {
          anonymousName: 'BraveExplorer789',
          avatar: '🧑',
          age: 26,
          gender: 'Male',
        },
        message: 'Hi there! We matched! Let\'s talk about tech and coffee ☕',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        status: 'accepted',
      },
      {
        id: '3',
        from: {
          anonymousName: 'GentleDreamer234',
          avatar: '🌸',
          age: 23,
          gender: 'Female',
        },
        message: 'Your taste in music is amazing! Would love to know more about you 🎵',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        status: 'pending',
      },
      {
        id: '4',
        from: {
          anonymousName: 'SmartVibes567',
          avatar: '👨',
          age: 25,
          gender: 'Male',
        },
        message: 'Hey! Saw we both love gaming. What are you playing these days?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        status: 'accepted',
      },
      {
        id: '5',
        from: {
          anonymousName: 'LovelySpirit890',
          avatar: '💃',
          age: 22,
          gender: 'Female',
        },
        message: 'Hi! You seem interesting, let\'s get to know each other better!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        status: 'pending',
      },
    ];

    setRequests(mockRequests);
    setLoading(false);
  }, []);

  const handleAccept = (requestId: string) => {
    setRequests(
      requests.map((req) =>
        req.id === requestId ? { ...req, status: 'accepted' } : req
      )
    );
  };

  const handleReject = (requestId: string) => {
    setRequests(
      requests.map((req) =>
        req.id === requestId ? { ...req, status: 'rejected' } : req
      )
    );
  };

  const handleBlock = (requestId: string) => {
    setRequests(
      requests.map((req) =>
        req.id === requestId ? { ...req, isBlocked: true, status: 'rejected' } : req
      )
    );
  };

  const handleOpenChat = (requestId: string) => {
    const request = requests.find((req) => req.id === requestId);
    if (request && request.status === 'accepted') {
      router.push(`/chat/${requestId}`);
    }
  };

  const pendingRequests = requests.filter((req) => req.status === 'pending' && !req.isBlocked);
  const acceptedRequests = requests.filter((req) => req.status === 'accepted' && !req.isBlocked);
  const blockedRequests = requests.filter((req) => req.isBlocked);

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950">
      {/* Header */}
      <ChatHeader
        title="Inbox"
        showBack={true}
        onBack={() => router.push('/dashboard')}
      />

      {/* Content */}
      <main className="container mx-auto px-4 py-6 max-w-2xl pb-24">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="spinner-large mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading messages...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                  Chat Requests ({pendingRequests.length})
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

            {/* Accepted Chats */}
            {acceptedRequests.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Active Chats ({acceptedRequests.length})
                </h2>
                <InboxList
                  requests={acceptedRequests}
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
            {requests.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  No Messages Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Start matching to receive chat requests!
                </p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="btn-primary py-3 px-8 max-w-xs mx-auto"
                >
                  Start Matching
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
