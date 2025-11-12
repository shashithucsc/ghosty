'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldOff, AlertTriangle, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RestrictedPage() {
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="glassmorphic-card p-8 md:p-12 rounded-3xl shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
              className="inline-block mb-6"
            >
              <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                <ShieldOff className="w-12 h-12 text-red-600 dark:text-red-400" />
              </div>
            </motion.div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-3">
              Account Restricted
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Your account has been temporarily restricted
            </p>

            {/* Status Badge */}
            <div className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">Access Denied</span>
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-6 mb-8">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3">
                Why was my account restricted?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Your account has been restricted due to violations of our community guidelines or
                terms of service. This may include:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li>Multiple reports from other users</li>
                <li>Inappropriate behavior or content</li>
                <li>Violation of community standards</li>
                <li>Suspicious account activity</li>
              </ul>
            </div>

            {/* Contact Support */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                    Appeal Your Restriction
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                    If you believe this restriction was made in error, please contact our support
                    team to appeal the decision. Include your username and a brief explanation.
                  </p>
                  <a
                    href="mailto:support@ghosty.app?subject=Account%20Restriction%20Appeal"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    <Mail className="w-4 h-4" />
                    support@ghosty.app
                  </a>
                </div>
              </div>
            </div>

            {/* What to do */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-3">
                What can I do?
              </h3>
              <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li>Review our Community Guidelines and Terms of Service</li>
                <li>Contact support to understand the specific reason for restriction</li>
                <li>Submit an appeal if you believe this was a mistake</li>
                <li>Wait for a response from our moderation team (typically 2-3 business days)</li>
              </ol>
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
            <a
              href="mailto:support@ghosty.app?subject=Account%20Restriction%20Appeal"
              className="flex-1 py-3 px-6 bg-linear-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all text-center"
            >
              Contact Support
            </a>
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
            We take community safety seriously. All restrictions are carefully reviewed.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
