'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, ShieldCheck, Sparkles, ChevronRight, Heart, Ghost } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const router = useRouter();
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (isOpen) {
      const particleArray = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 6 + 3,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 2,
      }));
      setParticles(particleArray);
    }
  }, [isOpen]);

  const handleNavigate = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Enhanced Backdrop with Ambient Effects */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50"
            onClick={onClose}
          >
            <div className="absolute inset-0 bg-[#030014]/95 backdrop-blur-xl" />
            
            {/* Ambient Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Grain Texture */}
              <div 
                className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                style={{ 
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
                }} 
              />
              
              {/* Plasma Gradients */}
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-purple-900/30 blur-[100px] rounded-full" 
              />
              <motion.div 
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.15, 0.3, 0.15]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-pink-900/20 blur-[100px] rounded-full" 
              />
            </div>

            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {particles.map((particle) => (
                <motion.div
                  key={particle.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 0.5, 0],
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
                  className="absolute bg-purple-400/30 rounded-full blur-sm"
                  style={{
                    left: `${particle.x}%`,
                    top: `${particle.y}%`,
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', duration: 0.6, bounce: 0.3 }}
              className="relative w-full max-w-md pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Floating Decorative Elements */}
              <motion.div
                animate={{ 
                  y: [0, -12, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-40px] left-[-30px] pointer-events-none hidden sm:block"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 flex items-center justify-center shadow-2xl transform -rotate-12">
                  <Ghost className="w-7 h-7 text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
                </div>
              </motion.div>

              <motion.div
                animate={{ 
                  y: [0, 15, 0],
                  rotate: [0, -5, 0]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-[-30px] right-[-30px] pointer-events-none hidden sm:block"
              >
                <div className="w-14 h-14 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 flex items-center justify-center shadow-2xl">
                  <Heart className="w-6 h-6 text-pink-400 fill-pink-400/20 drop-shadow-[0_0_8px_rgba(236,72,153,0.4)]" />
                </div>
              </motion.div>

              {/* Glass Card */}
              <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl overflow-hidden">
                {/* Glow Effect */}
                <motion.div
                  animate={{ 
                    opacity: [0.3, 0.5, 0.3],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-purple-500/10 blur-3xl pointer-events-none"
                />

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </button>

                {/* Header */}
                <div className="relative text-center mb-8">
                  {/* Logo with Glass Container */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
                    className="inline-block mb-6"
                  >
                    <div className="relative p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg">
                      <motion.div
                        animate={{ 
                          rotate: [0, 5, -5, 0],
                          y: [0, -5, 0]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Image
                          src="/logo.png"
                          alt="Logo"
                          width={70}
                          height={70}
                          className="object-contain"
                        />
                      </motion.div>
                      
                      {/* Corner Sparkle */}
                      <motion.div
                        animate={{ 
                          scale: [0, 1, 0],
                          rotate: [0, 180, 360]
                        }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                        className="absolute top-1 right-1"
                      >
                        <Sparkles className="w-4 h-4 text-purple-400" />
                      </motion.div>
                    </div>
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl font-bold text-white mb-3"
                  >
                    Choose Your Path
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-400 text-sm"
                  >
                    Select how you'd like to join අතැගිලි
                  </motion.p>
                </div>

                {/* Registration Options */}
                <div className="relative space-y-4">
                  {/* Quick Join Button */}
                  <motion.button
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, type: 'spring' }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleNavigate('/register/simple')}
                    className="w-full group relative overflow-hidden"
                  >
                    <div className="relative p-6 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 hover:border-purple-400/30 rounded-2xl transition-all flex items-center gap-4">
                      {/* Hover Glow */}
                      <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/10 transition-all duration-300 rounded-2xl" />
                      
                      <div className="relative flex-shrink-0 p-3 bg-purple-500/20 rounded-xl">
                        <Zap className="w-6 h-6 text-purple-400" />
                      </div>
                      
                      <div className="relative flex-1 text-left">
                        <h3 className="text-lg font-bold text-white mb-1">
                          Quick Join
                        </h3>
                        <p className="text-xs text-gray-400">Start instantly, no verification needed</p>
                      </div>
                      
                      <div className="relative flex-shrink-0">
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </motion.button>

                  {/* Verified Join Button */}
                  <motion.button
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, type: 'spring' }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleNavigate('/register/verified')}
                    className="w-full group relative overflow-hidden"
                  >
                    <div className="relative p-6 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 hover:border-pink-400/30 rounded-2xl transition-all flex items-center gap-4">
                      {/* Hover Glow */}
                      <div className="absolute inset-0 bg-pink-500/0 group-hover:bg-pink-500/10 transition-all duration-300 rounded-2xl" />
                      
                      <div className="relative flex-shrink-0 p-3 bg-pink-500/20 rounded-xl">
                        <ShieldCheck className="w-6 h-6 text-pink-400" />
                      </div>
                      
                      <div className="relative flex-1 text-left">
                        <h3 className="text-lg font-bold text-white mb-1">
                          Verified Join
                        </h3>
                        <p className="text-xs text-gray-400">Get verified badge with campus email</p>
                      </div>
                      
                      <div className="relative flex-shrink-0">
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </motion.button>
                </div>

                {/* Footer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="relative mt-8 pt-6 border-t border-white/10"
                >
                  <p className="text-center text-sm text-gray-400">
                    Already have an account?{' '}
                    <button
                      onClick={() => handleNavigate('/login')}
                      className="text-purple-400 font-semibold hover:text-purple-300 transition-colors"
                    >
                      Sign In
                    </button>
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
