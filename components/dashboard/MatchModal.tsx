'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, X, Heart, ShieldCheck } from 'lucide-react';
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

      // Create or get conversation with matched user
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
        // Navigate to chat page with conversation ID
        router.push(`/chat/${data.conversation.id}?userId=${user.id}`);
        onClose();
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
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Neobrutalist Confetti Effect */}
      {showConfetti && (
        <div key="confetti" className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={`confetti-${i}`}
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
              className="absolute w-4 h-4 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]"
              style={{
                backgroundColor: ['#FFD166', '#4ECDC4', '#A3E635', '#FF6B6B'][
                  Math.floor(Math.random() * 4)
                ],
              }}
            />
          ))}
        </div>
      )}

      {/* Neobrutalist Modal */}
      <motion.div
        key="modal"
        initial={{ scale: 0.5, opacity: 0, rotate: -5 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 0.5, opacity: 0, rotate: 5 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none font-sans"
      >
        <div className="bg-white border-6 border-black rounded-3xl p-8 max-w-md w-full text-center pointer-events-auto relative overflow-hidden shadow-[12px_12px_0px_rgba(0,0,0,1)]">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-[#F8F9FA] border-4 border-black flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all z-10"
          >
            <X className="w-5 h-5 stroke-[3] text-black" />
          </button>

          {/* Celebration Header */}
          <motion.div
            key="celebration"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.1, damping: 15 }}
            className="mb-6"
          >
            <motion.div 
              className="inline-block mb-4"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, -10, 10, -10, 0]
              }}
              transition={{ 
                duration: 0.8, 
                repeat: Infinity, 
                repeatDelay: 1 
              }}
            >
              <div className="text-7xl">💝</div>
            </motion.div>
            <h2 className="text-4xl font-black uppercase tracking-tight text-black mb-2 relative inline-block">
              It's a Match!
              <div className="absolute -top-2 -right-8 w-6 h-6 bg-[#FFD166] border-2 border-black rotate-12"></div>
            </h2>
            <p className="font-bold uppercase tracking-widest text-black text-sm mt-3 bg-[#A3E635] border-2 border-black px-4 py-2 shadow-[2px_2px_0px_rgba(0,0,0,1)] inline-block">
              You both liked each other!
            </p>
          </motion.div>

          {/* User Info Card */}
          <motion.div
            key="user-info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6 p-6 bg-[#F8F9FA] border-4 border-black rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,1)] relative"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-2">
              <Heart className="w-6 h-6 fill-[#FF6B6B] stroke-black stroke-2" />
              <Heart className="w-6 h-6 fill-[#FF6B6B] stroke-black stroke-2" />
            </div>
            
            <div className="text-6xl mb-4 mt-2">{user.avatar}</div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <h3 className="text-2xl font-black uppercase tracking-tight text-black">
                {user.anonymousName}
              </h3>
              {user.isVerified && (
                <ShieldCheck className="w-6 h-6 text-[#A3E635] stroke-[3]" />
              )}
            </div>
            <div className="flex items-center justify-center gap-3 flex-wrap mt-3">
              <span className="text-sm font-black uppercase bg-white border-2 border-black px-3 py-1 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                {user.age} YRS
              </span>
              <span className="text-sm font-black uppercase bg-white border-2 border-black px-3 py-1 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                {user.gender}
              </span>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            key="actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <button
              onClick={handleStartChat}
              disabled={isCreatingChat}
              className="w-full px-6 py-5 bg-[#A3E635] border-4 border-black text-black font-black uppercase text-xl tracking-wider rounded-xl shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isCreatingChat ? (
                <>
                  <div className="w-6 h-6 border-4 border-black border-t-white rounded-full animate-spin"></div>
                  Opening...
                </>
              ) : (
                <>
                  <MessageCircle className="w-6 h-6 stroke-[3]" />
                  Send Message
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="w-full px-6 py-4 bg-white border-4 border-black text-black font-black uppercase text-lg tracking-wider rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all"
            >
              Keep Swiping
            </button>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
