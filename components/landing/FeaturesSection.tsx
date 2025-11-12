'use client';

import { ShieldCheck, UserX, MessageSquare, Sparkles } from 'lucide-react';

const features = [
  {
    icon: UserX,
    title: 'Anonymous Profiles',
    description: 'Stay completely anonymous with auto-generated aliases and avatars. Your real identity stays hidden until you choose to reveal it.',
    gradient: 'from-purple-500 to-purple-700',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Badge',
    description: 'Get verified by uploading your student ID. Stand out with a trusted badge that shows you\'re a real student.',
    gradient: 'from-pink-500 to-pink-700',
  },
  {
    icon: MessageSquare,
    title: 'Safe Chat Requests',
    description: 'Accept or reject chat requests with ease. Block and report features ensure a safe and comfortable experience.',
    gradient: 'from-blue-500 to-blue-700',
  },
  {
    icon: Sparkles,
    title: 'Fun & Interactive UI',
    description: 'Swipe through profiles with smooth animations. Modern glassmorphic design makes every interaction delightful.',
    gradient: 'from-indigo-500 to-indigo-700',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose{' '}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-purple-600 to-pink-600">
              Ghosty?
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Your safety and privacy are our top priorities. Discover what makes Ghosty special.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group glassmorphic-card p-6 sm:p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-linear-to-br ${feature.gradient} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
