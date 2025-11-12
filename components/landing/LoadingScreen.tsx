'use client';

import { useEffect, useState } from 'react';

export function LoadingScreen() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number }>>([]);

  useEffect(() => {
    // Generate floating particles
    const particleArray = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
    }));
    setParticles(particleArray);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-linear-to-br from-purple-600 via-pink-600 to-blue-600 overflow-hidden">
      {/* Floating Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 bg-white/30 rounded-full animate-float-particle"
          style={{
            left: `${particle.x}%`,
            top: '100%',
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      {/* Ghost Icon & Text */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Animated Ghost */}
        <div className="relative">
          <div className="text-9xl animate-bounce-gentle filter drop-shadow-2xl">
            👻
          </div>
          {/* Glow effect */}
          <div className="absolute inset-0 text-9xl animate-pulse-slow opacity-50 blur-xl">
            👻
          </div>
        </div>

        {/* App Name */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-5xl sm:text-6xl font-bold text-white animate-fade-in">
            <span className="bg-clip-text text-transparent bg-linear-to-r from-white via-pink-200 to-purple-200 animate-gradient-shift">
              Ghosty
            </span>
          </h1>
          <p className="text-white/80 text-lg animate-fade-in-delay">
            Loading your experience...
          </p>
        </div>

        {/* Loading Spinner */}
        <div className="flex gap-2 animate-fade-in-delay-2">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}
