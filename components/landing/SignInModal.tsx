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
        size: Math.random() * 10 + 6,
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
          {/* Solid Backdrop (No Blur) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/90"
            onClick={onClose}
          >
            {/* Ambient Background Pattern */}
            <div 
              className="absolute inset-0 opacity-10" 
              style={{ 
                backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px)', 
                backgroundSize: '30px 30px' 
              }} 
            />

            {/* Floating Particles (Solid Squares) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {particles.map((particle) => (
                <motion.div
                  key={particle.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0],
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
                  className="absolute bg-white border-2 border-black"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none font-sans text-black">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.4 }}
              className="relative w-full max-w-md pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Floating Decorative Elements (Solid) */}
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [-12, -8, -12] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-35px] left-[-25px] pointer-events-none hidden sm:block"
              >
                <div className="w-16 h-16 bg-white border-4 border-black flex items-center justify-center shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                  <Ghost className="w-8 h-8 text-black stroke-[3]" />
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-[-25px] right-[-25px] pointer-events-none hidden sm:block"
              >
                <div className="w-14 h-14 rounded-full bg-[#FF6B6B] border-4 border-black flex items-center justify-center shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                  <Heart className="w-7 h-7 text-black fill-black stroke-[3]" />
                </div>
              </motion.div>

              {/* Main Solid Card */}
              <div className="relative bg-white border-4 border-black p-8 rounded-none shadow-[12px_12px_0px_rgba(0,0,0,1)] overflow-hidden">
                
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 w-10 h-10 bg-white border-4 border-black flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-[#FF6B6B] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all group"
                >
                  <X className="w-6 h-6 text-black stroke-[4]" />
                </button>

                {/* Header */}
                <div className="relative text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
                    className="inline-block mb-6"
                  >
                    <div className="relative p-4 bg-[#FFD166] border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                      <Image
                        src="/logo.png"
                        alt="Logo"
                        width={70}
                        height={70}
                        className="object-contain"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-3 -right-3 bg-white border-2 border-black p-1"
                      >
                        <Sparkles className="w-4 h-4 text-black stroke-[3]" />
                      </motion.div>
                    </div>
                  </motion.div>

                  <h2 className="text-4xl font-black uppercase tracking-tight mb-2">
                    Choose Path
                  </h2>
                  <p className="text-gray-600 font-bold uppercase tracking-widest text-xs">
                    Select your registration type
                  </p>
                </div>

                {/* Registration Options */}
                <div className="space-y-4">
                  {/* Quick Join Button */}
                  <button
                    onClick={() => handleNavigate('/register/simple')}
                    className="w-full group relative"
                  >
                    <div className="relative p-5 bg-[#4ECDC4] border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] group-hover:translate-y-[-2px] group-hover:translate-x-[-2px] group-hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all flex items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-white border-4 border-black flex items-center justify-center">
                        <Zap className="w-6 h-6 text-black stroke-[3]" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-xl font-black uppercase tracking-tight">Quick Join</h3>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-black/70">NO VERIFICATION REQUIRED</p>
                      </div>
                      <ChevronRight className="w-6 h-6 stroke-[4]" />
                    </div>
                  </button>

                  {/* Verified Join Button */}
                  <button
                    onClick={() => handleNavigate('/register/verified')}
                    className="w-full group relative"
                  >
                    <div className="relative p-5 bg-[#A3E635] border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] group-hover:translate-y-[-2px] group-hover:translate-x-[-2px] group-hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all flex items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-white border-4 border-black flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-black stroke-[3]" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-xl font-black uppercase tracking-tight">Verified Join</h3>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-black/70">FULL ACCESS + VERIFIED BADGE</p>
                      </div>
                      <ChevronRight className="w-6 h-6 stroke-[4]" />
                    </div>
                  </button>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t-4 border-black">
                  <p className="text-center text-xs font-black uppercase tracking-widest text-gray-500">
                    HAVE AN ACCOUNT?{' '}
                    <button
                      onClick={() => handleNavigate('/login')}
                      className="text-black underline decoration-4 underline-offset-2 hover:text-[#4ECDC4] transition-colors"
                    >
                      SIGN IN
                    </button>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}