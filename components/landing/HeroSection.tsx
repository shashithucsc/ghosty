'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Sparkles } from 'lucide-react';
import { SignInModal } from './SignInModal';

export function HeroSection() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Ghost Icon */}
        <div className="mb-6 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 glassmorphic-card rounded-full">
            <span className="text-6xl sm:text-7xl animate-bounce-gentle">👻</span>
          </div>
        </div>

        {/* Badge */}
        <div className="mb-6 animate-fade-in-delay">
          <span className="inline-flex items-center gap-2 px-4 py-2 glassmorphic-card rounded-full text-sm sm:text-base font-medium text-purple-800 dark:text-purple-200">
            <Sparkles className="w-4 h-4" />
            Anonymous Dating for Students
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 animate-fade-in-delay-2">
          Meet, Chat & Connect{' '}
          <span className="bg-clip-text text-transparent bg-linear-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient-shift">
            Anonymously
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-10 max-w-3xl mx-auto animate-fade-in-delay-3">
          Find your perfect match while staying anonymous. Connect with fellow students in a safe, verified environment.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delay-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="group relative w-full sm:w-auto px-8 py-4 bg-linear-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Heart className="w-5 h-5" />
              Sign Up Free
            </span>
            <div className="absolute inset-0 rounded-full bg-linear-to-r from-purple-700 via-pink-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          <button
            onClick={() => {
              const featuresSection = document.getElementById('features');
              featuresSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-8 py-4 glassmorphic-card text-gray-800 dark:text-white font-semibold rounded-full hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Learn More
          </button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-6 sm:gap-8 max-w-2xl mx-auto animate-fade-in-delay-5">
          <div className="glassmorphic-card p-4 sm:p-6 rounded-2xl">
            <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              10K+
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Active Users
            </div>
          </div>
          <div className="glassmorphic-card p-4 sm:p-6 rounded-2xl">
            <div className="text-2xl sm:text-3xl font-bold text-pink-600 dark:text-pink-400 mb-1">
              5K+
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Matches Made
            </div>
          </div>
          <div className="glassmorphic-card p-4 sm:p-6 rounded-2xl">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              98%
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Satisfaction
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-400 dark:border-gray-600 rounded-full p-1">
          <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-600 rounded-full mx-auto animate-scroll-down"></div>
        </div>
      </div>

      {/* Sign In Modal */}
      <SignInModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
