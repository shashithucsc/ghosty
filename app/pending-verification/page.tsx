'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Shield, ArrowLeft, RefreshCw, Bug } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PendingVerificationPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    userId: '',
    username: '',
    verificationStatus: '',
    registrationType: '',
    timestamp: '',
  });

  useEffect(() => {
    // Get user data from localStorage
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const verificationStatus = localStorage.getItem('verificationStatus');
    const registrationType = localStorage.getItem('registrationType');

    console.log('[PENDING-VERIFICATION] Current localStorage:', {
      userId,
      username,
      verificationStatus,
      registrationType,
    });

    setDebugInfo({
      userId: userId || 'Not found',
      username: username || 'Not found',
      verificationStatus: verificationStatus || 'Not found',
      registrationType: registrationType || 'Not found',
      timestamp: new Date().toLocaleString(),
    });

    if (!userId) {
      router.push('/login');
      return;
    }

    if (verificationStatus === 'verified') {
      console.log('[PENDING-VERIFICATION] User is verified, redirecting to dashboard');
      router.push('/dashboard');
      return;
    }

    setUserData({ userId, username, verificationStatus, registrationType });

    // Auto-check status every 10 seconds
    const intervalId = setInterval(async () => {
      console.log('[PENDING-VERIFICATION] Auto-checking status...');
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/profile/edit?userId=${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        
        const data = await response.json();
        if (data.success && data.data) {
          const newStatus = data.data.verificationStatus || 'unverified';
          const oldStatus = localStorage.getItem('verificationStatus');
          
          console.log('[PENDING-VERIFICATION] Auto-check: Old status:', oldStatus, '→ New status:', newStatus);
          
          if (newStatus !== oldStatus) {
            localStorage.setItem('verificationStatus', newStatus);
            
            if (newStatus === 'verified') {
              console.log('[PENDING-VERIFICATION] ✅ Approved! Redirecting to dashboard...');
              alert('✅ Your verification has been approved! Redirecting...');
              clearInterval(intervalId);
              router.push('/dashboard');
            } else if (newStatus === 'rejected') {
              console.log('[PENDING-VERIFICATION] ❌ Rejected! Redirecting to login...');
              alert('❌ Your verification was rejected. Please contact support.');
              clearInterval(intervalId);
              router.push('/login');
            }
          }
        }
      } catch (error) {
        console.error('[PENDING-VERIFICATION] Auto-check error:', error);
      }
    }, 10000); // Check every 10 seconds

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [router]);

  const handleCheckStatus = async () => {
    setIsChecking(true);
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      
      console.log('[PENDING-VERIFICATION] Checking status for user:', userId);
      
      // Query the API to get fresh verification status
      const response = await fetch(`/api/profile/edit?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      console.log('[PENDING-VERIFICATION] API response:', data);
      
      if (data.success && data.data) {
        const newStatus = data.data.verificationStatus || 'unverified';
        console.log('[PENDING-VERIFICATION] Current verification status from API:', newStatus);
        
        // Update localStorage with fresh value
        localStorage.setItem('verificationStatus', newStatus);
        
        // Update debug info
        setDebugInfo(prev => ({
          ...prev,
          verificationStatus: newStatus,
          timestamp: new Date().toLocaleString(),
        }));
        
        setUserData((prev: any) => ({ ...prev, verificationStatus: newStatus }));
        
        // If verified, redirect
        if (newStatus === 'verified') {
          alert('✅ Your verification has been approved! Redirecting to dashboard...');
          setTimeout(() => router.push('/dashboard'), 500);
        } else if (newStatus === 'rejected') {
          alert('❌ Your verification was rejected. Please contact support.');
          setTimeout(() => router.push('/login'), 500);
        } else {
          alert('⏳ Your verification is still pending approval.');
        }
      }
    } catch (error) {
      console.error('[PENDING-VERIFICATION] Error checking status:', error);
      alert('Error checking status. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

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
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <button
              onClick={handleCheckStatus}
              disabled={isChecking}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-5 h-5 ${isChecking ? 'animate-spin' : ''}`} />
              {isChecking ? 'Checking...' : 'Check Status'}
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 py-3 px-6 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Sign Out
            </button>
          </div>

          {/* Debug Toggle */}
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
          >
            <Bug className="w-4 h-4" />
            {showDebug ? 'Hide' : 'Show'} Debug Info
          </button>

          {/* Debug Panel */}
          {showDebug && (
            <div className="mt-4 p-4 bg-gray-900 text-white rounded-lg text-xs font-mono">
              <div className="font-bold mb-2 text-green-400">Debug Information:</div>
              <div className="space-y-1">
                <div><span className="text-gray-400">User ID:</span> {debugInfo.userId}</div>
                <div><span className="text-gray-400">Username:</span> {debugInfo.username}</div>
                <div><span className="text-gray-400">Verification Status:</span> <span className={debugInfo.verificationStatus === 'verified' ? 'text-green-400' : 'text-yellow-400'}>{debugInfo.verificationStatus}</span></div>
                <div><span className="text-gray-400">Registration Type:</span> {debugInfo.registrationType}</div>
                <div><span className="text-gray-400">Last Checked:</span> {debugInfo.timestamp}</div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-700 text-gray-400">
                Press F12 to view browser console for detailed logs
              </div>
            </div>
          )}
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
