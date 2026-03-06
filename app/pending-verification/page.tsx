'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, Shield, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PendingVerificationPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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
              setToast({ message: 'Your verification has been approved!', type: 'success' });
              clearInterval(intervalId);
              setTimeout(() => router.push('/dashboard'), 2000);
            } else if (newStatus === 'rejected') {
              console.log('[PENDING-VERIFICATION] ❌ Rejected! Redirecting to login...');
              setToast({ message: 'Your verification was rejected. Please contact support.', type: 'error' });
              clearInterval(intervalId);
              setTimeout(() => router.push('/login'), 2000);
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
        
        setUserData((prev: any) => ({ ...prev, verificationStatus: newStatus }));
        
        // If verified, redirect
        if (newStatus === 'verified') {
          setToast({ message: 'Your verification has been approved! Redirecting...', type: 'success' });
          setTimeout(() => router.push('/dashboard'), 2000);
        } else if (newStatus === 'rejected') {
          setToast({ message: 'Your verification was rejected. Please contact support.', type: 'error' });
          setTimeout(() => router.push('/login'), 2000);
        } else {
          setToast({ message: 'Your verification is still pending approval.', type: 'info' });
        }
      }
    } catch (error) {
      console.error('[PENDING-VERIFICATION] Error checking status:', error);
      setToast({ message: 'Error checking status. Please try again.', type: 'error' });
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
      <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-[#FFD166] rounded-full animate-spin mx-auto shadow-[4px_4px_0px_rgba(0,0,0,1)]"></div>
          <p className="mt-6 text-black font-black uppercase tracking-widest text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F5] flex items-center justify-center p-4 font-sans text-black">
      
      {/* Toast Notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-6 right-6 z-50 px-8 py-4 rounded-xl border-4 border-black font-black uppercase tracking-wider shadow-[6px_6px_0px_rgba(0,0,0,1)] max-w-md ${
            toast.type === 'success'
              ? 'bg-[#A3E635] text-black'
              : toast.type === 'error'
              ? 'bg-[#FF6B6B] text-black'
              : 'bg-[#FFD166] text-black'
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {toast.type === 'success' && <CheckCircle className="w-6 h-6 stroke-[3]" />}
              {toast.type === 'error' && <span className="text-2xl">❌</span>}
              {toast.type === 'info' && <Clock className="w-6 h-6 stroke-[3]" />}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-black hover:scale-110 transition-transform flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* Main Card */}
        <div className="bg-white p-8 md:p-12 rounded-3xl border-4 border-black shadow-[12px_12px_0px_rgba(0,0,0,1)]">
          
          {/* Header */}
          <div className="text-center mb-10 border-b-4 border-black pb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
              className="inline-block mb-6"
            >
              <div className="w-24 h-24 bg-[#FFD166] border-4 border-black rounded-3xl flex items-center justify-center mx-auto shadow-[6px_6px_0px_rgba(0,0,0,1)] transform -rotate-6">
                <Clock className="w-12 h-12 stroke-[3] text-black animate-pulse" />
              </div>
            </motion.div>

            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-3">
              Verification Pending
            </h1>
            <p className="text-gray-600 font-bold uppercase tracking-widest">
              Your account is under review
            </p>

            {/* Status Badge */}
            <div className="mt-6 inline-flex items-center gap-3 px-6 py-3 bg-[#FFD166] border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] text-black font-black uppercase tracking-wider text-sm">
              <Clock className="w-5 h-5 stroke-[3]" />
              <span>Awaiting Admin Approval</span>
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-8 mb-10">
            <div className="bg-[#4ECDC4] border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white border-4 border-black rounded-full flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  <Shield className="w-6 h-6 stroke-[3] text-black" />
                </div>
                <div>
                  <h3 className="font-black uppercase text-xl mb-2">
                    What happens next?
                  </h3>
                  <p className="text-sm font-bold uppercase leading-relaxed">
                    Our admin team is reviewing your verification documents. This process typically
                    takes 1-2 business days. You'll receive a notification once your account is approved.
                  </p>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              <h3 className="font-black uppercase tracking-widest text-lg mb-6">
                Verification Process
              </h3>

              <div className="flex items-center gap-4 bg-[#F8F9FA] border-4 border-black p-4 rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <div className="w-10 h-10 bg-[#A3E635] border-4 border-black rounded-xl flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  <CheckCircle className="w-5 h-5 stroke-[3] text-black" />
                </div>
                <div>
                  <p className="font-black uppercase tracking-wide">Application Submitted</p>
                  <p className="text-xs font-bold text-gray-500 uppercase">Documents received</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-[#FFD166] border-4 border-black p-4 rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <div className="w-10 h-10 bg-white border-4 border-black rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                  <Clock className="w-5 h-5 stroke-[3] text-black" />
                </div>
                <div>
                  <p className="font-black uppercase tracking-wide">Under Review</p>
                  <p className="text-xs font-bold text-black uppercase">Verifying your information</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white border-4 border-dashed border-gray-400 p-4 rounded-xl opacity-60">
                <div className="w-10 h-10 bg-gray-200 border-4 border-gray-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 stroke-[3] text-gray-400" />
                </div>
                <div>
                  <p className="font-black uppercase tracking-wide text-gray-500">Account Activation</p>
                  <p className="text-xs font-bold text-gray-400 uppercase">Full access once approved</p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-[#F8F9FA] border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
              <h3 className="font-black uppercase tracking-widest mb-2">
                Need Help?
              </h3>
              <p className="text-sm font-bold uppercase mb-3 text-gray-600">
                If you have questions about your status, contact support:
              </p>
              <a
                href="mailto:support@ghosty.app"
                className="inline-block text-sm font-black uppercase text-black bg-[#FFD166] border-2 border-black px-3 py-1 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all"
              >
                support@ghosty.app
              </a>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <button
              onClick={handleCheckStatus}
              disabled={isChecking}
              className="flex-1 py-4 px-6 bg-[#A3E635] border-4 border-black text-black font-black uppercase tracking-wider text-lg rounded-xl shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <RefreshCw className={`w-6 h-6 stroke-[3] ${isChecking ? 'animate-spin' : ''}`} />
              {isChecking ? 'CHECKING...' : 'CHECK STATUS'}
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 py-4 px-6 bg-white border-4 border-black text-black font-black uppercase tracking-wider text-lg rounded-xl shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:bg-[#F8F9FA] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all"
            >
              SIGN OUT
            </button>
          </div>

        </div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-xs font-black uppercase tracking-widest text-gray-500"
        >
          <p>
            You'll receive an email notification once your account is verified.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}