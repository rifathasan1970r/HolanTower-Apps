import React from 'react';
import { ArrowLeft, Moon, Sun, Settings, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface SettingsViewProps {
  onBack: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onBack, darkMode, toggleDarkMode }) => {
  return (
    <div className="pb-24">
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
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        {/* Dark Mode Toggle */}
        <div className="p-4 flex items-center justify-between border-b border-slate-50 dark:border-slate-700 last:border-0">
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

        {/* Other Settings (Placeholder) */}
        <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center">
              <Settings size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">অ্যাপ ভার্সন</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">v1.0.0</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400" />
        </div>
      </div>
    </div>
  );
};
