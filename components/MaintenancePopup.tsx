import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench } from 'lucide-react';

export const MaintenancePopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the popup is enabled in localStorage
    const isEnabled = localStorage.getItem('SHOW_MAINTENANCE_POPUP') === 'true';
    
    if (isEnabled) {
      setIsVisible(true);
      
      // Auto close after 3 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl max-w-sm w-full text-center border border-slate-100 dark:border-slate-700">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Wrench size={32} className="text-orange-500 dark:text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">কাজ চলছে...</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              অ্যাপস এর কাজ চলমান। সাময়িক অসুবিধার জন্য দুঃখিত।
            </p>
            <div className="mt-4 w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-orange-500"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 3, ease: "linear" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
