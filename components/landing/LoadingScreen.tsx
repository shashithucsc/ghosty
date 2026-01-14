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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-purple-950 overflow-hidden">
      {/* Floating Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 bg-purple-400/40 dark:bg-purple-300/30 rounded-full animate-float-particle"
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
          <div className="absolute inset-0 text-9xl animate-pulse-slow opacity-30 blur-xl">
            👻
          </div>
        </div>

        {/* App Name */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-5xl sm:text-6xl font-bold animate-fade-in">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 dark:from-purple-400 dark:via-pink-400 dark:to-purple-400">
              Ghosty
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg animate-fade-in-delay">
            Loading your experience...
          </p>
        </div>

        {/* Loading Spinner */}
        <div className="flex gap-2 animate-fade-in-delay-2">
          <div className="w-3 h-3 bg-purple-600 dark:bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-3 h-3 bg-pink-600 dark:bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-purple-600 dark:bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}
