'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { BlockReportModal } from '@/components/chat/BlockReportModal';

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isOwn: boolean;
}

export default function ChatPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatPartner, setChatPartner] = useState({
    anonymousName: 'CharmingSoul456',
    avatar: '👩',
    age: 24,
    gender: 'Female',
  });
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    // Mock messages
    const mockMessages: Message[] = [
      {
        id: '1',
        senderId: 'partner',
        text: 'Hey! I loved your profile, would love to chat! 😊',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        isOwn: false,
      },
      {
        id: '2',
        senderId: 'me',
        text: 'Hi! Thanks for reaching out. I saw we have similar interests!',
        timestamp: new Date(Date.now() - 1000 * 60 * 25),
        isOwn: true,
      },
      {
        id: '3',
        senderId: 'partner',
        text: 'Yes! I love traveling and trying new food. What\'s your favorite cuisine?',
        timestamp: new Date(Date.now() - 1000 * 60 * 20),
        isOwn: false,
      },
      {
        id: '4',
        senderId: 'me',
        text: 'I\'m a huge fan of Japanese food! Have you been to Japan?',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        isOwn: true,
      },
      {
        id: '5',
        senderId: 'partner',
        text: 'Not yet, but it\'s definitely on my bucket list! I want to visit Tokyo and Kyoto.',
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
        isOwn: false,
      },
    ];

    setMessages(mockMessages);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      text,
      timestamp: new Date(),
      isOwn: true,
    };

    setMessages([...messages, newMessage]);

    // Simulate partner response after 2 seconds
    setTimeout(() => {
      const responses = [
        'That sounds amazing! Tell me more!',
        'I totally agree! 😊',
        'Interesting! I\'ve never thought about it that way.',
        'Haha, that\'s funny! 😄',
        'What do you think about trying that sometime?',
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const partnerMessage: Message = {
        id: (Date.now() + 1).toString(),
        senderId: 'partner',
        text: randomResponse,
        timestamp: new Date(),
        isOwn: false,
      };

      setMessages((prev) => [...prev, partnerMessage]);
    }, 2000);
  };

  const handleBlock = (reason: string) => {
    setIsBlocked(true);
    setShowBlockModal(false);
    setTimeout(() => {
      router.push('/inbox');
    }, 2000);
  };

  if (isBlocked) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950 flex items-center justify-center p-4">
        <div className="glassmorphic-card p-8 text-center max-w-md animate-scale-in">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            User Blocked
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You have blocked this user. They won't be able to contact you anymore.
          </p>
          <button
            onClick={() => router.push('/inbox')}
            className="btn-primary py-3 px-8"
          >
            Back to Inbox
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950 flex flex-col">
      {/* Header */}
      <ChatHeader
        title={chatPartner.anonymousName}
        subtitle={`${chatPartner.age} • ${chatPartner.gender}`}
        avatar={chatPartner.avatar}
        showBack={true}
        showMenu={true}
        onBack={() => router.push('/inbox')}
        onBlockReport={() => setShowBlockModal(true)}
      />

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-4 custom-scrollbar">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <ChatInput onSend={handleSendMessage} />

      {/* Block/Report Modal */}
      {showBlockModal && (
        <BlockReportModal
          userName={chatPartner.anonymousName}
          onBlock={handleBlock}
          onClose={() => setShowBlockModal(false)}
        />
      )}
    </div>
  );
}
