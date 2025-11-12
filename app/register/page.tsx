'use client';

import { useState } from 'react';
import { EmailRegistration } from '@/components/registration/EmailRegistration';
import { ProfileCreation } from '@/components/registration/ProfileCreation';
import { VerificationSection } from '@/components/registration/VerificationSection';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [registrationData, setRegistrationData] = useState({
    email: '',
    password: '',
    activationSent: false,
  });

  const handleEmailRegistration = (email: string, password: string) => {
    setRegistrationData({ email, password, activationSent: true });
    setStep(2);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Logo & Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold bg-linear-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Ghosty 👻
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Find your match anonymously
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2 sm:space-x-4">
            {[1, 2].map((num) => (
              <div key={num} className="flex items-center">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-semibold transition-all duration-300 ${
                    step >= num
                      ? 'bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-110'
                      : 'bg-white dark:bg-gray-800 text-gray-400 border-2 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {num}
                </div>
                {num < 2 && (
                  <div
                    className={`w-12 sm:w-20 h-1 mx-2 transition-all duration-300 ${
                      step > num
                        ? 'bg-linear-to-r from-purple-600 to-pink-600'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 px-2 sm:px-8">
            <span className={`text-xs sm:text-sm ${step === 1 ? 'text-purple-600 font-semibold' : 'text-gray-500'}`}>
              Sign Up
            </span>
            <span className={`text-xs sm:text-sm ${step === 2 ? 'text-purple-600 font-semibold' : 'text-gray-500'}`}>
              Profile
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="transition-all duration-500">
          {step === 1 && <EmailRegistration onSuccess={handleEmailRegistration} />}
          {step === 2 && <ProfileCreation email={registrationData.email} />}
        </div>
      </div>
    </div>
  );
}
