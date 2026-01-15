'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Ghost, Globe, ChevronRight } from 'lucide-react';
import { SignInModal } from './SignInModal';

export function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden bg-[#030014]">
      
      {/* --- Ambient Background Effects --- */}
      <div className="absolute inset-0 w-full h-full">
        {/* Grain/Noise Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-[1]" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
        />

        {/* Deep Plasma Gradients */}
        <div className="absolute top-[-10%] left-[-20%] w-[70vw] h-[70vw] bg-purple-900/30 blur-[120px] rounded-full mix-blend-screen animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[70vw] h-[70vw] bg-indigo-900/20 blur-[120px] rounded-full mix-blend-screen animate-pulse-slow animation-delay-2000" />
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[500px] h-[500px] bg-fuchsia-600/10 blur-[100px] rounded-full pointer-events-none" />
      </div>

      {/* --- Main Content --- */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 flex flex-col items-center justify-center text-center mt-[-5vh]">
        
        {/* Glass Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl mb-8 shadow-lg shadow-purple-500/10"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-xs sm:text-sm font-medium text-purple-200/80 tracking-wide uppercase">
            Anonymous Campus Dating
          </span>
        </motion.div>

        {/* Hero Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="relative mb-6"
        >
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight leading-[0.9]">
            <span className="block text-white drop-shadow-xl">
             Welcome to
            </span>
            <span className="relative inline-block mt-2">
              <span className="absolute inset-0 blur-3xl bg-purple-600/40" />
              <span className="relative bg-clip-text text-transparent bg-purple-400 text-glow">
                අතැගිලි
              </span>
            </span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-xl text-lg sm:text-xl text-gray-400 mb-10 leading-relaxed font-light"
        >
          Dating without the bias. <br className="hidden sm:block" />
          <span className="text-gray-200 font-normal">Chat first, reveal later.</span>
        </motion.p>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-glass-primary px-8 py-4 flex items-center justify-center gap-3 group"
          >
            <Heart className="w-5 h-5 fill-current text-purple-600 group-hover:scale-110 transition-transform" />
            <span className="text-lg">Start Dating</span>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </button>

         
        </motion.div>
      </div>

      {/* --- Floating Glass Elements (3D Decoration) --- */}
      {/* Left Element */}
      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} 
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] left-[5%] hidden lg:block"
      >
        <div className="w-24 h-24 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 flex items-center justify-center shadow-2xl transform -rotate-12">
           <Ghost className="w-10 h-10 text-purple-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
        </div>
      </motion.div>

      {/* Right Element */}
      <motion.div 
        animate={{ y: [0, 25, 0], rotate: [0, -5, 0] }} 
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[20%] right-[5%] hidden lg:block"
      >
        <div className="w-20 h-20 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 flex items-center justify-center shadow-2xl">
           <Heart className="w-8 h-8 text-pink-400 fill-pink-400/20 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]" />
        </div>
      </motion.div>

      {/* SignIn Modal (Logic Preserved) */}
      <SignInModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}