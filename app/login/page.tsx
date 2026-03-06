'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { User, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // CRITICAL: Clear ALL old localStorage data first to prevent stale values
        const keysToPreserve = ['theme', 'darkMode']; // Preserve non-auth data
        const preserved: Record<string, string> = {};
        keysToPreserve.forEach(key => {
          const value = localStorage.getItem(key);
          if (value) preserved[key] = value;
        });
        localStorage.clear();
        Object.entries(preserved).forEach(([key, value]) => localStorage.setItem(key, value));

        // Store user data in localStorage with fresh values
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('username', data.user.username);
        localStorage.setItem('token', data.token);
        
        if (data.user.fullName) {
          localStorage.setItem('fullName', data.user.fullName);
        }
        
        // CRITICAL: Always set verification status (even if undefined) to clear stale values
        localStorage.setItem('verificationStatus', data.user.verificationStatus || 'unverified');
        localStorage.setItem('registrationType', data.user.registrationType || 'simple');
        
        // Debug log to verify correct values are being set
        console.log('[LOGIN] Set localStorage - verificationStatus:', data.user.verificationStatus, 'registrationType:', data.user.registrationType);

        // Store admin flag and role
        const isAdmin = data.user.isAdmin || false;
        localStorage.setItem('isAdmin', isAdmin.toString());
        localStorage.setItem('userRole', isAdmin ? 'admin' : 'user');

        // Store profile completion status
        if (data.user.isProfileComplete !== undefined) {
          localStorage.setItem('isProfileComplete', data.user.isProfileComplete.toString());
        }

        // Different success messages for admin vs user
        const successMessage = isAdmin 
          ? 'WELCOME BACK, ADMIN! REDIRECTING...' 
          : 'LOGIN SUCCESSFUL! REDIRECTING...';
        
        setToast({ message: successMessage, type: 'success' });
        
        // Redirect based on user role and account status
        setTimeout(() => {
          const freshVerificationStatus = localStorage.getItem('verificationStatus');
          const freshRegistrationType = localStorage.getItem('registrationType');
          
          console.log('[LOGIN] Routing decision - verificationStatus:', freshVerificationStatus, 'registrationType:', freshRegistrationType, 'isAdmin:', isAdmin);

          if (isAdmin) {
            router.push('/admin');
            return;
          }

          if (data.user.isRestricted) {
            router.push('/restricted');
          } else if (data.user.isPending || freshVerificationStatus === 'pending') {
            router.push('/pending-verification');
          } else if (freshVerificationStatus === 'rejected') {
            router.push('/login'); 
          } else if (!data.user.isProfileComplete) {
            router.push('/setup-profile');
          } else {
            router.push('/dashboard');
          }
        }, 1500);
      } else {
        if (data.isRestricted) {
          setToast({ message: 'YOUR ACCOUNT HAS BEEN RESTRICTED.', type: 'error' });
        } else if (data.isRejected) {
          setToast({ message: 'YOUR VERIFICATION WAS REJECTED.', type: 'error' });
        } else {
          setToast({ message: data.error?.toUpperCase() || 'LOGIN FAILED', type: 'error' });
        }
      }
    } catch (error) {
      setToast({ message: 'AN ERROR OCCURRED. PLEASE TRY AGAIN.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center p-4 font-sans text-black">
      {/* Toast Notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl border-4 border-black font-black uppercase tracking-wider shadow-[4px_4px_0px_rgba(0,0,0,1)] ${
            toast.type === 'success'
              ? 'bg-[#A3E635] text-black'
              : 'bg-[#FF6B6B] text-black'
          }`}
        >
          {toast.message}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Main Card */}
        <div className="bg-white p-8 rounded-3xl border-4 border-black shadow-[12px_12px_0px_rgba(0,0,0,1)]">
          
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
              className="inline-block mb-4"
            >
              <Image
                src="/logo.png"
                alt="Logo"
                width={80}
                height={80}
                className="object-contain mx-auto"
              />
            </motion.div>

            <h1 className="text-4xl font-black uppercase tracking-tight mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 font-bold uppercase tracking-widest text-sm">
              Sign in to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Username Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-black uppercase tracking-widest mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black">
                  <User className="w-5 h-5 stroke-[3]" />
                </div>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  placeholder="Username"
                  autoComplete="username"
                  className={`w-full pl-12 pr-4 py-4 bg-[#F8F9FA] border-4 ${
                    errors.username
                      ? 'border-[#FF6B6B] focus:shadow-[4px_4px_0px_rgba(255,107,107,1)]'
                      : 'border-black focus:shadow-[4px_4px_0px_rgba(0,0,0,1)]'
                  } rounded-xl focus:outline-none font-bold transition-shadow placeholder-gray-400`}
                />
              </div>
              {errors.username && (
                <p className="mt-2 text-sm font-bold text-[#FF6B6B] uppercase">{errors.username}</p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-black uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black">
                  <Lock className="w-5 h-5 stroke-[3]" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                  className={`w-full pl-12 pr-12 py-4 bg-[#F8F9FA] border-4 ${
                    errors.password
                      ? 'border-[#FF6B6B] focus:shadow-[4px_4px_0px_rgba(255,107,107,1)]'
                      : 'border-black focus:shadow-[4px_4px_0px_rgba(0,0,0,1)]'
                  } rounded-xl focus:outline-none font-bold transition-shadow placeholder-gray-400`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-[#4ECDC4] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5 stroke-[3]" /> : <Eye className="w-5 h-5 stroke-[3]" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm font-bold text-[#FF6B6B] uppercase">{errors.password}</p>
              )}
            </motion.div>

            {/* Submit Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-[#FFD166] border-4 border-black text-black font-black uppercase tracking-wider text-xl rounded-2xl shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-4 border-black border-t-white rounded-full animate-spin"></div>
                  SIGNING IN...
                </>
              ) : (
                <>
                  <LogIn className="w-6 h-6 stroke-[3]" />
                  SIGN IN
                </>
              )}
            </motion.button>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-4 border-black"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-black font-black uppercase tracking-widest">
                  Don't have an account?
                </span>
              </div>
            </div>

            {/* Register Links */}
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/register/simple"
                className="py-4 px-4 text-center bg-white border-4 border-black text-black font-black uppercase tracking-wider shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-[#F8F9FA] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all"
              >
                Quick Join
              </Link>
            
              <Link
                href="/register/verified"
                className="py-4 px-4 text-center bg-white border-4 border-black text-black font-black uppercase tracking-wider shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-[#F8F9FA] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all"
              >
                Verified Join
              </Link>
            </div>
          </form>
        </div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-center text-xs font-black uppercase tracking-widest text-gray-500"
        >
          By signing in, you agree to our{' '}
          <Link href="/terms" className="text-black underline decoration-2 hover:text-[#4ECDC4] transition-colors">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-black underline decoration-2 hover:text-[#4ECDC4] transition-colors">
            Privacy
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}