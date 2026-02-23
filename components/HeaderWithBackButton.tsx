import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderWithBackButtonProps {
  title: string;
  onBack: () => void;
}

export const HeaderWithBackButton: React.FC<HeaderWithBackButtonProps> = ({ title, onBack }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-between py-4 px-1 mb-4 border-b border-slate-100"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors py-1 group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
        <span className="text-base font-bold">ফিরে যান</span>
      </button>
      <h2 className="text-xl font-bold text-slate-800">{title}</h2>
    </motion.div>
  );
};
