'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, ChevronRight, ShieldCheck, Zap } from 'lucide-react';
import { SignInModal } from './SignInModal';

export function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleStartDating = () => {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    
    if (userId && userId !== 'null' && userId !== 'undefined' && userId.trim() !== '' && username) {
      router.push('/dashboard');
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden bg-background">
      
      {/* --- Premium Matte Background --- */}
      <div className="absolute inset-0 w-full h-full bg-background">
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
        {/* Top Spotlight */}
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-zinc-900/50 to-transparent pointer-events-none" />
      </div>

      {/* --- Main Content --- */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center justify-center text-center">
        
        {/* High-End Pill Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "circOut" }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-700 bg-zinc-900/50 mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          <span className="text-xs font-semibold text-zinc-300 tracking-widest uppercase">
            Exclusive Campus Network
          </span>
        </motion.div>

        {/* Hero Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight text-primary leading-tight">
            Connect without <br />
            <span className="text-zinc-500">Expectations.</span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-xl text-lg sm:text-xl text-secondary mb-10 font-normal leading-relaxed"
        >
          A private, verified dating space for university students. 
          <span className="block text-zinc-300 mt-1">Chat anonymously. Reveal when ready.</span>
        </motion.p>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <button
            onClick={handleStartDating}
            className="group relative px-8 py-4 bg-primary text-black font-bold text-lg rounded-xl transition-all hover:bg-white/90 hover:scale-[1.02] flex items-center justify-center gap-3"
          >
            Start Matching
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

      
      </div>

      <SignInModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}