'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PendingVerificationPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Get user data from localStorage
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const verificationStatus = localStorage.getItem('verificationStatus');

    if (!userId) {
      router.push('/login');
      return;
    }

    if (verificationStatus === 'verified') {
      router.push('/dashboard');
      return;
    }

    setUserData({ userId, username, verificationStatus });
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* Card */}
        <div className="glassmorphic-card p-8 md:p-12 rounded-3xl shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
              className="inline-block mb-6"
            >
              <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-12 h-12 text-yellow-600 dark:text-yellow-400 animate-pulse" />
              </div>
            </motion.div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-3">
              Verification Pending
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Your account is under review
            </p>

            {/* Status Badge */}
            <div className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">Awaiting Admin Approval</span>
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-6 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                    What happens next?
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Our admin team is reviewing your verification documents. This process typically
                    takes 1-2 business days. You'll receive a notification once your account is
                    approved.
                  </p>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
                Verification Process:
              </h3>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">
                    Application Submitted
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your registration and documents have been received
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">
                    Under Review
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Admin team is verifying your information
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-500 dark:text-gray-400">
                    Account Activation
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Full access to all features once approved
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                Need Help?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                If you have questions or concerns about your verification status, please contact
                our support team:
              </p>
              <a
                href="mailto:support@ghosty.app"
                className="text-sm text-purple-600 dark:text-purple-400 font-semibold hover:underline"
              >
                support@ghosty.app
              </a>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleLogout}
              className="flex-1 py-3 px-6 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Sign Out
            </button>
            <Link
              href="/"
              className="flex-1 py-3 px-6 bg-linear-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400"
        >
          <p>
            You'll receive an email notification once your account is verified.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
