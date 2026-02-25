import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

export const PullToRefresh: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pullY, setPullY] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Use refs for mutable values in event handlers
  const startYRef = useRef(0);
  const isHoldingRef = useRef(false);
  const pullYRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startYRef.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startYRef.current === 0) return;
      const currentY = e.touches[0].clientY;
      const diff = currentY - startYRef.current;

      // Only handle pull down at the top
      if (diff > 0 && window.scrollY <= 0) {
        // Prevent default only if we are pulling down significantly to avoid interfering with normal scroll
        if (diff > 10 && e.cancelable) {
            e.preventDefault(); 
        }

        const newPullY = Math.min(diff * 0.4, 120); // Resistance
        pullYRef.current = newPullY;
        setPullY(newPullY);
        
        // Threshold to start timer
        if (newPullY > 60 && !isHoldingRef.current) {
          isHoldingRef.current = true;
          setIsHolding(true);
        } else if (newPullY < 60 && isHoldingRef.current) {
          isHoldingRef.current = false;
          setIsHolding(false);
          setProgress(0);
        }
      }
    };

    const handleTouchEnd = () => {
      startYRef.current = 0;
      pullYRef.current = 0;
      isHoldingRef.current = false;
      setPullY(0);
      setIsHolding(false);
      setProgress(0);
    };

    // Add listeners to window or document body
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    // passive: false is required to preventDefault
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Timer logic for 3 seconds hold
  useEffect(() => {
    if (isHolding) {
      const startTime = Date.now();
      const duration = 2000; // 2 seconds

      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / duration) * 100, 100);
        setProgress(newProgress);

        if (newProgress >= 100) {
          clearInterval(interval);
          window.location.reload();
        }
      }, 16);

      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [isHolding]);

  return (
    <div className="relative min-h-screen">
      {/* Loading Indicator Overlay */}
      <AnimatePresence>
        {pullY > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: pullY - 50 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 flex justify-center pointer-events-none z-[100]"
          >
            <div className="bg-white dark:bg-slate-800 rounded-full px-4 py-2 shadow-lg border border-slate-100 dark:border-slate-700 flex items-center gap-3">
              <div className="relative w-5 h-5 flex items-center justify-center">
                {/* Background Circle */}
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="4"
                  />
                  {/* Progress Circle */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#4F46E5"
                    strokeWidth="4"
                    strokeDasharray={`${progress}, 100`}
                    className="transition-all duration-75 ease-linear"
                  />
                </svg>
                <RefreshCw size={12} className={`text-indigo-600 dark:text-indigo-400 ${progress >= 100 ? 'animate-spin' : ''}`} />
              </div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                {progress >= 100 ? 'রিলোড হচ্ছে...' : 'ধরে রাখুন...'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content with Transform */}
      <motion.div
        animate={{ y: pullY }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </div>
  );
};
