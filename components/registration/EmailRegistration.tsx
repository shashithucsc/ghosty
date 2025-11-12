'use client';

import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Info, Check } from 'lucide-react';

interface EmailRegistrationProps {
  onSuccess: (email: string, password: string) => void;
}

export function EmailRegistration({ onSuccess }: EmailRegistrationProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [activationSent, setActivationSent] = useState(false);

  const passwordRequirements = [
    { regex: /.{8,}/, text: 'At least 8 characters' },
    { regex: /[A-Z]/, text: 'One uppercase letter' },
    { regex: /[a-z]/, text: 'One lowercase letter' },
    { regex: /[0-9]/, text: 'One number' },
    { regex: /[^A-Za-z0-9]/, text: 'One special character' },
  ];

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return passwordRequirements.every((req) => req.regex.test(password));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password does not meet requirements';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setActivationSent(true);
    setLoading(false);

    // Wait 2 seconds before proceeding
    setTimeout(() => {
      onSuccess(email, password);
    }, 2000);
  };

  if (activationSent) {
    return (
      <div className="glassmorphic-card p-8 sm:p-10 text-center animate-scale-in">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-linear-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-gentle">
          <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-4">
          Check your email! 📧
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          We've sent an activation link to
        </p>
        <p className="text-purple-600 font-semibold mb-6">{email}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Please click the link to verify your email address.
          <br />
          Proceeding to profile creation...
        </p>
      </div>
    );
  }

  return (
    <div className="glassmorphic-card p-6 sm:p-10 animate-slide-up">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Create your account
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
          Start your anonymous dating journey
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Input */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: '' });
              }}
              className={`input-field pl-10 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="you@university.edu"
            />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><Info className="w-3 h-3" />{errors.email}</p>}
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors({ ...errors, password: '' });
              }}
              className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><Info className="w-3 h-3" />{errors.password}</p>}
          
          {/* Password Requirements */}
          {password && (
            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-1">
              {passwordRequirements.map((req, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <Check
                    className={`w-3 h-3 ${
                      req.regex.test(password) ? 'text-green-500' : 'text-gray-400'
                    }`}
                  />
                  <span
                    className={
                      req.regex.test(password)
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }
                  >
                    {req.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirm Password Input */}
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors({ ...errors, confirmPassword: '' });
              }}
              className={`input-field pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><Info className="w-3 h-3" />{errors.confirmPassword}</p>}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300">
            An activation link will be sent to your email. Please verify your email to continue.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-3 sm:py-4 text-base sm:text-lg font-semibold"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="spinner" />
              Sending activation link...
            </span>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <a href="/login" className="text-purple-600 hover:text-purple-700 font-semibold">
          Sign in
        </a>
      </p>
    </div>
  );
}
