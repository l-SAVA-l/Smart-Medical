'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'cookie-consent-accepted';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Check if user has already accepted cookies
    const hasAccepted = localStorage.getItem(COOKIE_CONSENT_KEY);

    if (!hasAccepted) {
      // Show cookie consent immediately
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isMounted]);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    setIsVisible(false);
  };

  const handleClose = () => {
    // Mark as handled even if not accepted (so onboarding can show)
    localStorage.setItem(COOKIE_CONSENT_KEY, 'closed');
    setIsVisible(false);
  };

  // Don't render anything until mounted to avoid hydration mismatch
  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50"
        >
          <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-br from-[#18A36C] via-[#15905f] to-[#128a54] shadow-[0_0_30px_rgba(24,163,108,0.4)]">
            {/* Animated gradient overlay */}
            <motion.div
              className="absolute inset-0 opacity-30"
              animate={{
                background: [
                  'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                  'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                  'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                ],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            {/* Content */}
            <div className="relative p-5">
              <div className="flex gap-4">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                  className="flex-shrink-0"
                >
                  <div className="relative rounded-full p-2.5 bg-white/20 backdrop-blur-sm">
                    <Cookie className="w-6 h-6 text-white" />
                  </div>
                </motion.div>

                {/* Text */}
                <div className="flex-1">
                  <motion.h4
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="font-bold text-base text-white mb-1"
                  >
                    Мы используем Cookie
                  </motion.h4>
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="text-sm text-emerald-50 leading-relaxed"
                  >
                    Мы используем файлы cookie для улучшения работы сайта и персонализации контента.
                  </motion.p>
                </div>

                {/* Close button */}
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ delay: 0.3 }}
                  onClick={handleClose}
                  className="flex-shrink-0 rounded-lg p-1.5 hover:bg-white/20 transition-colors text-white"
                  aria-label="Закрыть"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Action button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 flex justify-end"
              >
                <button
                  onClick={handleAccept}
                  className="px-5 py-2 bg-white text-[#18A36C] font-medium rounded-xl hover:bg-emerald-50 transition-colors shadow-lg"
                >
                  Принять
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
