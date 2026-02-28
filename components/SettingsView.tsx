import React, { useState } from 'react';
import { ArrowLeft, Moon, Sun, Settings, ChevronRight, ShieldCheck, Lock, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsViewProps {
  onBack: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onBack, darkMode, toggleDarkMode }) => {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [pinError, setPinError] = useState(false);
  
  // State for Maintenance Popup
  const [showMaintenancePopup, setShowMaintenancePopup] = useState(() => {
    // Default to TRUE if not set (null), or if explicitly 'true'
    const storedValue = localStorage.getItem('SHOW_MAINTENANCE_POPUP');
    return storedValue !== 'false';
  });

  const handleAdminLogin = () => {
    if (adminPin === '1966') {
      setIsAdminAuthenticated(true);
      setShowAdminLogin(false);
      setAdminPin('');
      setPinError(false);
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 1000);
    }
  };

  const toggleMaintenancePopup = () => {
    const newValue = !showMaintenancePopup;
    setShowMaintenancePopup(newValue);
    localStorage.setItem('SHOW_MAINTENANCE_POPUP', String(newValue));
  };

  return (
    <div className="pb-24 relative">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">সেটিং</h2>
      </div>

      {/* Settings Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden space-y-1">
        {/* Dark Mode Toggle */}
        <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              darkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-orange-50 text-orange-500'
            }`}>
              {darkMode ? <Moon size={20} /> : <Sun size={20} />}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">ডার্ক মোড</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {darkMode ? 'চালু আছে' : 'বন্ধ আছে'}
              </p>
            </div>
          </div>

          <button
            onClick={toggleDarkMode}
            className={`relative w-12 h-7 rounded-full transition-colors duration-300 focus:outline-none ${
              darkMode ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-600'
            }`}
          >
            <motion.div
              layout
              className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm"
              animate={{ x: darkMode ? 20 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
        </div>

        {/* Admin Panel Entry */}
        <div 
          onClick={() => !isAdminAuthenticated && setShowAdminLogin(true)}
          className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer border-t border-slate-50 dark:border-slate-700"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">অ্যাডমিন প্যানেল</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {isAdminAuthenticated ? 'লগইন করা হয়েছে' : 'লগইন করুন'}
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </div>

        {/* Admin Controls (Visible only after auth) */}
        <AnimatePresence>
          {isAdminAuthenticated && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700"
            >
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">মেইনটেন্যান্স পপআপ</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">হোম পেজে 'কাজ চলছে' পপআপ দেখান</p>
                  </div>
                  <button
                    onClick={toggleMaintenancePopup}
                    className={`relative w-10 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
                      showMaintenancePopup ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <motion.div
                      layout
                      className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm"
                      animate={{ x: showMaintenancePopup ? 16 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* App Version */}
        <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer border-t border-slate-50 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center">
              <Settings size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">অ্যাপ ভার্সন</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">v1.0.0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showAdminLogin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl max-w-xs w-full border border-slate-100 dark:border-slate-700"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Lock size={18} className="text-rose-500" /> অ্যাডমিন লগইন
                </h3>
                <button 
                  onClick={() => {
                    setShowAdminLogin(false);
                    setAdminPin('');
                    setPinError(false);
                  }}
                  className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">পিন কোড দিন</label>
                  <input
                    type="password"
                    value={adminPin}
                    onChange={(e) => {
                      setAdminPin(e.target.value);
                      setPinError(false);
                    }}
                    className={`w-full bg-slate-50 dark:bg-slate-900 border ${pinError ? 'border-rose-500' : 'border-slate-200 dark:border-slate-600'} rounded-xl py-3 px-4 text-center text-lg font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all`}
                    placeholder="••••"
                    maxLength={4}
                    autoFocus
                  />
                  {pinError && (
                    <p className="text-[10px] text-rose-500 font-bold mt-1 text-center animate-pulse">ভুল পিন! আবার চেষ্টা করুন।</p>
                  )}
                </div>
                
                <button
                  onClick={handleAdminLogin}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-rose-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  লগইন <Check size={16} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
