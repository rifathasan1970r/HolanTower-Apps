import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, Wrench } from 'lucide-react';

interface FlatInfoViewProps {
  onBack: () => void;
}

export const FlatInfoView: React.FC<FlatInfoViewProps> = ({ onBack }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 pb-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={onBack}
          className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Building2 className="text-blue-500" size={24} />
            ফ্ল্যাটের তথ্য
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">ফ্ল্যাট সম্পর্কিত বিস্তারিত তথ্য</p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
          <Wrench className="text-blue-500 dark:text-blue-400 animate-pulse" size={40} />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">কাজ চলমান</h3>
        <p className="text-slate-500 dark:text-slate-400 text-lg">দ্রুত আপডেট হচ্ছে..</p>
      </div>
    </motion.div>
  );
};
