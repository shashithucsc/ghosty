'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Heart, Sparkles, Ghost, Zap } from 'lucide-react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export function LoadingScreen() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Generate ambient floating particles
    const particleArray = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }));
    setParticles(particleArray);

    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#030014] overflow-hidden">
      
      {/* --- Ambient Background Effects --- */}
      <div className="absolute inset-0 w-full h-full">
        {/* Grain/Noise Texture Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none z-[1]" 
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
          }} 
        />

        {/* Deep Plasma Gradients */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-20%] w-[70vw] h-[70vw] bg-purple-900/30 blur-[120px] rounded-full mix-blend-screen" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-10%] right-[-20%] w-[70vw] h-[70vw] bg-indigo-900/20 blur-[120px] rounded-full mix-blend-screen" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            x: [-20, 20, -20],
            y: [-20, 20, -20]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[500px] h-[500px] bg-fuchsia-600/10 blur-[100px] rounded-full pointer-events-none" 
        />
      </div>

      {/* --- Floating Particles --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 0.6, 0],
                scale: [0, 1, 0],
                x: [0, (Math.random() - 0.5) * 200],
                y: [0, (Math.random() - 0.5) * 200],
              }}
              transition={{ 
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: "easeInOut"
              }}
              className="absolute bg-purple-400/40 rounded-full blur-sm"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* --- Main Content --- */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6">
        
        {/* Floating Glass Decorations */}
        <motion.div 
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, 5, 0]
          }} 
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-120px] left-[-100px] hidden sm:block"
        >
          <div className="w-20 h-20 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 flex items-center justify-center shadow-2xl transform -rotate-12">
            <Ghost className="w-9 h-9 text-purple-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
          </div>
        </motion.div>

        <motion.div 
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -5, 0]
          }} 
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute top-[-80px] right-[-120px] hidden sm:block"
        >
          <div className="w-16 h-16 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 flex items-center justify-center shadow-2xl">
            <Heart className="w-7 h-7 text-pink-400 fill-pink-400/20 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]" />
          </div>
        </motion.div>

        {/* Animated Logo with Glass Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "backOut" }}
          className="relative"
        >
          {/* Glass Container */}
          <div className="relative p-8 rounded-[2rem] bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl">
            {/* Pulsing Glow Ring */}
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-[2rem] bg-purple-500/20 blur-2xl"
            />
            
            {/* Logo */}
            <div className="relative w-32 h-32 sm:w-40 sm:h-40">
              <motion.div 
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-full h-full filter drop-shadow-2xl"
              >
                <Image
                  src="/logo.png"
                  alt="Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </motion.div>
              
              {/* Multi-layer Glow */}
              <div className="absolute inset-0 blur-xl opacity-40">
                <Image
                  src="/logo.png"
                  alt="Logo Glow"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="absolute inset-0 blur-3xl opacity-20">
                <Image
                  src="/logo.png"
                  alt="Logo Glow"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* Corner Sparkles */}
            <motion.div
              animate={{ 
                scale: [0, 1, 0],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              className="absolute top-2 right-2"
            >
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </motion.div>
            <motion.div
              animate={{ 
                scale: [0, 1, 0],
                rotate: [0, -180, -360]
              }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1, delay: 1 }}
              className="absolute bottom-2 left-2"
            >
              <Zap className="w-5 h-5 text-purple-400" />
            </motion.div>
          </div>
        </motion.div>

        {/* App Name with Enhanced Typography */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col items-center gap-3"
        >
          <h1 className="text-5xl sm:text-6xl font-bold">
            <span className="relative inline-block">
              <span className="absolute inset-0 blur-2xl bg-purple-600/40" />
              <span className="relative text-purple-400">
                අතැගිලි
              </span>
            </span>
          </h1>
          
          <motion.p 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-gray-400 text-lg tracking-wide"
          >
            welcome to අතැගිලි...
          </motion.p>
        </motion.div>

        {/* Interactive Loading Bar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-64 sm:w-80"
        >
          {/* Glass Container for Progress Bar */}
          <div className="relative p-1 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg">
            <div className="relative h-2 bg-black/20 rounded-full overflow-hidden">
              {/* Progress Fill */}
              <motion.div 
                className="absolute inset-y-0 left-0 bg-purple-500 rounded-full"
                style={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.3 }}
              />
              {/* Shimmer Effect */}
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
            </div>
          </div>
          
          {/* Progress Text */}
          <motion.p 
            className="text-center mt-3 text-sm text-gray-400 font-medium"
            key={Math.floor(progress)}
          >
            {Math.floor(Math.min(progress, 100))}%
          </motion.p>
        </motion.div>

        {/* Animated Loading Dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                y: [0, -15, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut"
              }}
              className="w-3 h-3 rounded-full bg-purple-400 shadow-lg shadow-purple-500/50"
            />
          ))}
        </div>
      </div>

      {/* Bottom Floating Elements */}
      <motion.div 
        animate={{ 
          y: [0, 15, 0],
          rotate: [0, -3, 0]
        }} 
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[10%] left-[10%] hidden lg:block"
      >
        <div className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 flex items-center justify-center shadow-2xl transform rotate-12">
          <Heart className="w-7 h-7 text-pink-300 fill-pink-300/30" />
        </div>
      </motion.div>

      <motion.div 
        animate={{ 
          y: [0, -12, 0],
          rotate: [0, 4, 0]
        }} 
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[15%] right-[8%] hidden lg:block"
      >
        <div className="w-14 h-14 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 flex items-center justify-center shadow-2xl">
          <Sparkles className="w-6 h-6 text-purple-300" />
        </div>
      </motion.div>
    </div>
  );
}
