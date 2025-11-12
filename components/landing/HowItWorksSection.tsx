'use client';

import { UserPlus, Sliders, MessageCircle, ShieldCheck } from 'lucide-react';

const steps = [
  {
    number: 1,
    icon: UserPlus,
    title: 'Sign Up',
    description: 'Create your account with just your email and password. Set up your anonymous profile in minutes.',
    color: 'purple',
  },
  {
    number: 2,
    icon: Sliders,
    title: 'Set Preferences',
    description: 'Choose your interests, age range, and university. Our algorithm will find the best matches for you.',
    color: 'pink',
  },
  {
    number: 3,
    icon: MessageCircle,
    title: 'Start Chatting',
    description: 'Swipe through profiles and send chat requests. Accept requests to start meaningful conversations.',
    color: 'blue',
  },
  {
    number: 4,
    icon: ShieldCheck,
    title: 'Get Verified',
    description: 'Upload your student ID to get a verified badge. Build trust and increase your match rate.',
    color: 'indigo',
  },
];

export function HowItWorksSection() {
  return (
    <section className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-white/30 dark:bg-black/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            How{' '}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-purple-600 to-blue-600">
              It Works
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Get started in 4 simple steps. It's quick, easy, and completely free!
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const colorMap: Record<string, {
              bg: string;
              border: string;
              text: string;
              gradient: string;
            }> = {
              purple: {
                bg: 'bg-purple-600',
                border: 'border-purple-500',
                text: 'text-purple-600 dark:text-purple-400',
                gradient: 'from-purple-500 to-purple-700',
              },
              pink: {
                bg: 'bg-pink-600',
                border: 'border-pink-500',
                text: 'text-pink-600 dark:text-pink-400',
                gradient: 'from-pink-500 to-pink-700',
              },
              blue: {
                bg: 'bg-blue-600',
                border: 'border-blue-500',
                text: 'text-blue-600 dark:text-blue-400',
                gradient: 'from-blue-500 to-blue-700',
              },
              indigo: {
                bg: 'bg-indigo-600',
                border: 'border-indigo-500',
                text: 'text-indigo-600 dark:text-indigo-400',
                gradient: 'from-indigo-500 to-indigo-700',
              },
            };
            const colorClasses = colorMap[step.color];

            return (
              <div
                key={index}
                className="relative group animate-slide-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Connector Line (Desktop) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-linear-to-r from-gray-300 to-transparent dark:from-gray-700 -z-10" />
                )}

                {/* Card */}
                <div className="glassmorphic-card p-6 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 h-full">
                  {/* Step Number */}
                  <div className={`relative inline-flex items-center justify-center w-16 h-16 rounded-full ${colorClasses.bg} mb-6 shadow-lg`}>
                    <span className="text-2xl font-bold text-white">{step.number}</span>
                    <div className={`absolute inset-0 rounded-full bg-linear-to-br ${colorClasses.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  </div>

                  {/* Icon */}
                  <div className="mb-4">
                    <Icon className={`w-8 h-8 ${colorClasses.text}`} />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <button
            onClick={() => window.location.href = '/register'}
            className="group px-10 py-5 bg-linear-to-r from-purple-600 via-pink-600 to-blue-600 text-white text-lg font-semibold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <span className="relative z-10">Get Started Now - It's Free! 🚀</span>
          </button>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            No credit card required • 100% anonymous • Join 10,000+ students
          </p>
        </div>
      </div>
    </section>
  );
}
