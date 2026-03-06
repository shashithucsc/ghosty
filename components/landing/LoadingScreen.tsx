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
    // Generate ambient floating square particles
    const particleArray = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 12 + 8,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }));
    setParticles(particleArray);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FDF8F5] overflow-hidden font-sans text-black">
      
      {/* --- Ambient Neobrutalist Background (Solid Patterns) --- */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Solid Dot Grid */}
        <div 
          className="absolute inset-0 opacity-10" 
          style={{ 
            backgroundImage: 'radial-gradient(#000000 2px, transparent 2px)', 
            backgroundSize: '30px 30px' 
          }} 
        />
        
        {/* Large Decorative Solid Shapes */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -left-20 w-96 h-96 border-8 border-black opacity-5 rounded-none"
        />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-[#FFD166] border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] opacity-20" />
      </div>

      {/* --- Floating Particles (Solid Squares) --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: [0, (Math.random() - 0.5) * 150],
                y: [0, (Math.random() - 0.5) * 150],
              }}
              transition={{ 
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: "easeInOut"
              }}
              className="absolute bg-black border-2 border-black"
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
        
        {/* Floating Icons with Hard Shadows */}
        <motion.div 
          animate={{ y: [0, -15, 0], rotate: [-12, -8, -12] }} 
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-120px] left-[-100px] hidden sm:block"
        >
          <div className="w-20 h-20 bg-white border-4 border-black flex items-center justify-center shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            <Ghost className="w-10 h-10 text-black stroke-[3]" />
          </div>
        </motion.div>

        <motion.div 
          animate={{ y: [0, 20, 0], rotate: [0, 5, 0] }} 
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute top-[-80px] right-[-120px] hidden sm:block"
        >
          <div className="w-16 h-16 rounded-full bg-[#FF6B6B] border-4 border-black flex items-center justify-center shadow-[6px_6px_0px_rgba(0,0,0,1)]">
            <Heart className="w-8 h-8 text-black stroke-[3] fill-black" />
          </div>
        </motion.div>

        {/* Logo Container (No Blurs, Solid Shadow) */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "backOut" }}
          className="relative"
        >
          <div className="relative p-10 bg-white border-8 border-black shadow-[16px_16px_0px_rgba(0,0,0,1)]">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40">
              <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-full h-full"
              >
                <Image
                  src="/logo.png"
                  alt="Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </motion.div>
            </div>

            {/* Corner Indicators */}
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute -top-6 -right-6 bg-[#FFD166] border-4 border-black p-2 shadow-[4px_4px_0px_rgba(0,0,0,1)]"
            >
              <Sparkles className="w-6 h-6 text-black stroke-[3]" />
            </motion.div>
            
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              className="absolute -bottom-6 -left-6 bg-[#A3E635] border-4 border-black p-2 shadow-[4px_4px_0px_rgba(0,0,0,1)]"
            >
              <Zap className="w-6 h-6 text-black stroke-[3]" />
            </motion.div>
          </div>
        </motion.div>

        {/* Loading Bar Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-72 sm:w-96 text-center"
        >
          {/* Progress Container */}
          <div className="relative p-2 bg-white border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)]">
            <div className="relative h-6 bg-gray-200 border-2 border-black overflow-hidden">
              <motion.div 
                className="absolute inset-y-0 left-0 bg-[#4ECDC4] border-r-4 border-black"
                style={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
          
          <h2 className="mt-4 font-black uppercase text-2xl tracking-widest italic">
            LOADING MATCHES... {Math.floor(Math.min(progress, 100))}%
          </h2>
        </motion.div>

        {/* Bouncing Blocks (Replacing Dots) */}
        <div className="flex gap-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, 90, 0]
              }}
              transition={{ 
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "anticipate"
              }}
              className={`w-5 h-5 border-4 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] ${
                i === 0 ? 'bg-[#FF6B6B]' : i === 1 ? 'bg-[#FFD166]' : 'bg-[#A3E635]'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}