'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '@/app/dashboard/page';

interface MatchModalProps {
  user: UserProfile;
  onClose: () => void;
  conversationId?: string;
}

export function MatchModal({ user, onClose, conversationId }: MatchModalProps) {
  const router = useRouter();
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleStartChat = async () => {
    setIsCreatingChat(true);
    
    try {
      const currentUserId = localStorage.getItem('userId');
      
      if (!currentUserId) {
        alert('Please log in to start a chat');
        return;
      }

      // If we already have a conversation ID from the match, use it directly
      if (conversationId) {
        router.push(`/chat/${conversationId}`);
        onClose();
        return;
      }

      // Otherwise, create or get conversation
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          otherUserId: user.id,
        }),
      });

      const data = await response.json();

      if (response.ok && data.conversation) {
        // Navigate to chat page with conversation ID and other user ID
        router.push(`/chat/${data.conversation.id}?userId=${user.id}`);
      } else {
        alert(data.error || 'Failed to start chat');
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Failed to start chat. Please try again.');
    } finally {
      setIsCreatingChat(false);
    }
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                top: '-10%',
                left: `${Math.random() * 100}%`,
                rotate: 0,
              }}
              animate={{
                top: '110%',
                rotate: 360,
                transition: {
                  duration: 2 + Math.random() * 2,
                  ease: 'linear',
                  delay: Math.random() * 0.5,
                },
              }}
              className="absolute w-3 h-3 rounded-full"
              style={{
                backgroundColor: ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981'][
                  Math.floor(Math.random() * 4)
                ],
              }}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="glassmorphic-card p-8 max-w-md w-full text-center pointer-events-auto relative overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 via-pink-400/10 to-purple-400/10 animate-pulse pointer-events-none"></div>
          
          <div className="relative z-10">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Celebration */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.1, damping: 15 }}
            className="mb-6"
          >
            <div className="text-6xl mb-4">💝</div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              It's a Match!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              You and {user.anonymousName} liked each other
            </p>
          </motion.div>

          {/* User Info */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl"
          >
            <div className="text-5xl mb-3">{user.avatar}</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
              {user.anonymousName}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {user.age} • {user.gender}
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <button
              onClick={handleStartChat}
              disabled={isCreatingChat}
              className="w-full btn-primary py-4 text-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingChat ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Opening Chat...
                </>
              ) : (
                <>
                  <MessageCircle className="w-5 h-5" />
                  Send a Message
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="w-full btn-secondary py-3 text-base font-semibold"
            >
              Keep Swiping
            </button>
          </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
