'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Ghost, ArrowRight, Stars, Globe } from 'lucide-react';
import { SignInModal } from './SignInModal';

export function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="relative min-h-[100dvh] w-full flex items-center justify-center overflow-hidden bg-[#030014]">
      {/* Background Gradients & Ambient Effects */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* Deep atmospheric glow */}
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[60%] bg-purple-900/20 blur-[120px] rounded-full mix-blend-screen animate-pulse-slow pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[60%] bg-indigo-900/20 blur-[120px] rounded-full mix-blend-screen animate-pulse-slow animation-delay-2000 pointer-events-none" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-fuchsia-900/15 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />
        
        {/* Subtle Grid */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, 
            backgroundSize: '50px 50px' 
          }}
        />
        
        {/* Floating Particles/Stars */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: 0, opacity: 0.1 }}
                animate={{ 
                  y: [0, -100, 0], 
                  opacity: [0.1, 0.3, 0.1],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 10 + i * 2, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: i * 1.5
                }}
                className="absolute text-purple-200/20"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + (i % 3) * 20}%`
                }}
              >
                <Stars className="w-4 h-4" />
              </motion.div>
           ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center text-center">
        
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "backOut" }}
          className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-10 hover:bg-white/10 transition-all cursor-default overflow-hidden"
        >
          <div className="absolute inset-0 bg-linear-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
          <span className="text-sm font-medium text-purple-100/90 tracking-wide">
            The #1 Anonymous Campus Dating App
          </span>
        </motion.div>

        {/* Hero Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="relative mb-8"
        >
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight">
            <span className="block text-white mb-2 drop-shadow-2xl">
              Connect
            </span>
            <span className="relative inline-block">
              {/* Glow effect behind text */}
              <span className="absolute -inset-4 bg-purple-600/30 blur-3xl rounded-full opacity-50" />
              <span className="relative bg-clip-text text-transparent bg-linear-to-r from-purple-400 via-pink-400 to-indigo-400 font-extrabold drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                Ghosty
              </span>
            </span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-2xl text-lg sm:text-xl md:text-2xl text-gray-400 mb-12 leading-relaxed font-light"
        >
          Experience dating without the bias.
          <span className="block sm:inline text-gray-200 font-normal"> Find your soulmate through conversation first.</span>
        </motion.p>

        {/* Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto px-4 sm:px-0"
        >
          <button
            onClick={() => setIsModalOpen(true)}
            className="group relative w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-r from-purple-100 to-pink-100 opacity-0 group-hover:opacity-20 transition-opacity" />
            <Heart className="w-5 h-5 text-purple-600 fill-purple-600 group-hover:animate-bounce-gentle" />
            <span>Start Dating Now</span>
          </button>

          <button
             onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
             className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group"
          >
            <Globe className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            <span>Explore Features</span>
          </button>
        </motion.div>
      </div>

      {/* Floating 3D Elements (Decorative) */}
      <motion.div 
        animate={{ 
          y: [0, -30, 0],
          rotate: [0, 5, 0]
        }} 
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-[5%] lg:left-[15%] hidden md:block opacity-60 pointer-events-none"
      >
        <div className="w-20 h-20 bg-linear-to-br from-purple-500/20 to-indigo-500/20 rounded-3xl backdrop-blur-xl border border-white/10 flex items-center justify-center transform -rotate-12 shadow-2xl">
           <Ghost className="w-10 h-10 text-purple-300" />
        </div>
      </motion.div>

      <motion.div 
        animate={{ 
          y: [0, 40, 0],
          rotate: [0, -5, 0]
        }} 
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/3 right-[5%] lg:right-[15%] hidden md:block opacity-60 pointer-events-none"
      >
        <div className="w-16 h-16 bg-linear-to-br from-pink-500/20 to-rose-500/20 rounded-full backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl">
           <Heart className="w-8 h-8 text-pink-300" />
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 pointer-events-none"
      >
        <span className="text-xs uppercase tracking-widest font-light">Scroll</span>
        <div className="w-[1px] h-12 bg-linear-to-b from-white/0 via-white/50 to-white/0" />
      </motion.div>

      <SignInModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
