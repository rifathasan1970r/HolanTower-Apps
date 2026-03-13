import React from 'react';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import ImageSlider from './ImageSlider';

interface GalleryViewProps {
  onBack: () => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ onBack }) => {
  return (
    <div className="pb-24 animate-in fade-in duration-500 bg-[#f8fafc] dark:bg-slate-900 min-h-screen relative font-sans text-slate-900 dark:text-slate-100">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center px-4 py-4 max-w-md mx-auto">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:border-primary-200 dark:group-hover:border-primary-900 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-all">
              <ArrowLeft size={18} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest">ফিরে যান</span>
          </button>
        </div>
      </div>

      <div className="w-full max-w-md mx-auto px-4 py-6 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-900/20 text-pink-500 flex items-center justify-center shadow-sm">
              <ImageIcon size={24} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">গ্যালারি</h2>
          </div>
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-13">ভবনের ছবিসমূহ</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-4">
          <ImageSlider />
        </div>
      </div>
    </div>
  );
};
