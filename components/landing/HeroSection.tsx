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
    <div className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden bg-[#FDF8F5] font-sans text-black">
      
      {/* --- Hard Neobrutalist Background --- */}
      <div className="absolute inset-0 w-full h-full bg-[#FDF8F5]">
        {/* Solid, non-fading dot grid */}
        <div 
          className="absolute inset-0 opacity-10" 
          style={{ 
            backgroundImage: 'radial-gradient(#000000 3px, transparent 3px)', 
            backgroundSize: '40px 40px' 
          }} 
        />
      </div>

      {/* --- Main Content --- */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center justify-center text-center">
        
        {/* High-End Pill Badge -> Chunky Solid Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "circOut" }}
          className="inline-flex items-center gap-3 px-6 py-2 border-4 border-black bg-[#FFD166] shadow-[4px_4px_0px_rgba(0,0,0,1)] mb-10"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full bg-[#FF6B6B] border-2 border-black"></span>
            <span className="relative inline-flex h-3 w-3 bg-[#FF6B6B] border-2 border-black"></span>
          </span>
          <span className="text-sm font-black text-black tracking-widest uppercase">
            Exclusive Campus Network
          </span>
        </motion.div>

        {/* Hero Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-black leading-[1.1] uppercase">
            Connect Without <br />
            {/* Highlighted text block with a slight tilt */}
            <span className="inline-block mt-4 bg-[#4ECDC4] border-4 border-black px-6 py-2 shadow-[8px_8px_0px_rgba(0,0,0,1)] transform -rotate-2">
              Expectations.
            </span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl text-lg sm:text-xl text-gray-800 font-bold uppercase tracking-widest mt-6 mb-12 leading-relaxed"
        >
          A private, verified dating space for university students. 
          <span className="block text-[#FF6B6B] mt-2 font-black">Chat anonymously. Reveal when ready.</span>
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
            className="group relative px-10 py-5 bg-[#A3E635] text-black font-black uppercase tracking-wider text-xl border-4 border-black rounded-2xl shadow-[8px_8px_0px_rgba(0,0,0,1)] transition-all hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[12px_12px_0px_rgba(0,0,0,1)] active:translate-y-[8px] active:translate-x-[8px] active:shadow-none flex items-center justify-center gap-4"
          >
            Start Matching
            <ChevronRight className="w-6 h-6 stroke-[4] group-hover:translate-x-2 transition-transform" />
          </button>
        </motion.div>
      </div>

      <SignInModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}