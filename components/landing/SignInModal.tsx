'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
              className="relative w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glass Card */}
              <div className="glassmorphic-card p-8 rounded-3xl shadow-2xl">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
                    className="inline-block mb-4"
                  >
                    <div className="w-16 h-16 bg-linear-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-3xl">👻</span>
                    </div>
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl font-bold text-gray-800 dark:text-white mb-2"
                  >
                    Choose Your Registration Type
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-600 dark:text-gray-400 text-sm"
                  >
                    Select how you'd like to join Ghosty
                  </motion.p>
                </div>

                {/* Registration Options */}
                <div className="space-y-4">
                  {/* Quick Join Button */}
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleNavigate('/register/simple')}
                    className="w-full group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-linear-to-r from-blue-600 to-purple-600 rounded-2xl"></div>
                    <div className="absolute inset-0 bg-linear-to-r from-blue-700 to-purple-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative p-6 flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1 text-left">
                        <h3 className="text-lg font-bold text-white mb-1">
                          Quick Join
                        </h3>
                        {/* <p className="text-white/80 text-sm">
                          Get started in seconds with just username and password
                        </p>
                        <div className="mt-2 inline-flex items-center gap-1 text-xs text-white/60">
                          <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                          Unverified • Limited features
                        </div> */}
                      </div>
                      
                      <div className="flex-shrink-0 text-white/60 group-hover:text-white transition-colors">
                        →
                      </div>
                    </div>
                  </motion.button>

                  {/* Verified Join temporarily hidden */}
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleNavigate('/register/verified')}
                    className="w-full group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-linear-to-r from-purple-600 to-pink-600 rounded-2xl"></div>
                    <div className="absolute inset-0 bg-linear-to-r from-purple-700 to-pink-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative p-6 flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1 text-left">
                        <h3 className="text-lg font-bold text-white mb-1">
                          Verified Join
                          <span className="ml-2 px-2 py-0.5 bg-green-500 text-xs rounded-full">
                            Recommended
                          </span>
                        </h3>
                        <p className="text-white/80 text-sm">
                          Full access with identity verification and profile details
                        </p>
                        <div className="mt-2 inline-flex items-center gap-1 text-xs text-white/60">
                          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                          Verified • Full features
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 text-white/60 group-hover:text-white transition-colors">
                        →
                      </div>
                    </div>
                  </motion.button>
                 
                </div>

                {/* Footer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
                >
                  <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <button
                      onClick={() => handleNavigate('/login')}
                      className="text-purple-600 dark:text-purple-400 font-semibold hover:underline"
                    >
                      Sign In
                    </button>
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
