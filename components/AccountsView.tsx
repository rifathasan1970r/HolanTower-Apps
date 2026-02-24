import React from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, CreditCard, Banknote, Droplets, Trash2, Zap, User, MoreHorizontal, Calculator } from 'lucide-react';

interface AccountsViewProps {
  onBack: () => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({ onBack }) => {
  return (
    <div className="pb-24 animate-in slide-in-from-right duration-500 bg-slate-50 dark:bg-slate-900 min-h-screen relative transition-colors duration-300">
      {/* Navigation Header Section */}
      <div className="bg-white dark:bg-slate-800 sticky top-[var(--header-height)] z-10 border-b border-slate-100 dark:border-slate-700 shadow-sm transition-all">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50 dark:border-slate-700">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors py-1 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-base font-bold">ফিরে যান</span>
          </button>
        </div>
        
        <div className="flex items-center justify-center px-6 py-4">
          <div className="text-center animate-in zoom-in duration-300 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                <Calculator size={20} />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">স্বচ্ছ হিসাব কেন্দ্র</h2>
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  এই বিল্ডিং এর সকল আয় ও ব্যয়ের হিসাব
                </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        
        {/* Income Section */}
        <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400">
                    <TrendingUp size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">মোট আয় হিসাব</h3>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="divide-y divide-slate-50 dark:divide-slate-700">
                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <Wallet size={18} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">উদ্বৃত্ত অর্থ</h4>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">পূর্বের জমা</p>
                            </div>
                        </div>
                        <span className="font-bold text-slate-800 dark:text-white">৳০.০০</span>
                    </div>

                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                <CreditCard size={18} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">সার্ভিস চার্জ এর টাকা</h4>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">চলতি মাস</p>
                            </div>
                        </div>
                        <span className="font-bold text-slate-800 dark:text-white">৳০.০০</span>
                    </div>

                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                <Banknote size={18} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">অন্যান্য থেকে আয়</h4>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">বিবিধ</p>
                            </div>
                        </div>
                        <span className="font-bold text-slate-800 dark:text-white">৳০.০০</span>
                    </div>
                </div>
                <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-3 border-t border-emerald-100 dark:border-emerald-900/30 flex justify-between items-center">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">সর্বমোট আয়</span>
                    <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">৳০.০০</span>
                </div>
            </div>
        </div>

        {/* Expense Section */}
        <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
                <div className="bg-rose-100 dark:bg-rose-900/30 p-1.5 rounded-lg text-rose-600 dark:text-rose-400">
                    <TrendingDown size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">মোট ব্যয় হিসাব</h3>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="divide-y divide-slate-50 dark:divide-slate-700">
                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                                <Droplets size={18} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">পানি বিল</h4>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">ওয়াসা</p>
                            </div>
                        </div>
                        <span className="font-bold text-slate-800 dark:text-white">৳০.০০</span>
                    </div>

                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                                <Trash2 size={18} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">ময়লা বিল</h4>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">সিটি কর্পোরেশন</p>
                            </div>
                        </div>
                        <span className="font-bold text-slate-800 dark:text-white">৳০.০০</span>
                    </div>

                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 flex items-center justify-center">
                                <Zap size={18} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">বিদ্যুৎ বিল</h4>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">কমন মিটার</p>
                            </div>
                        </div>
                        <span className="font-bold text-slate-800 dark:text-white">৳০.০০</span>
                    </div>

                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                <User size={18} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">কেয়ারটেকার বেতন</h4>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">মাসিক</p>
                            </div>
                        </div>
                        <span className="font-bold text-slate-800 dark:text-white">৳০.০০</span>
                    </div>

                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                                <MoreHorizontal size={18} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">অন্যান্য ব্যয়</h4>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">মেরামত ও রক্ষণাবেক্ষণ</p>
                            </div>
                        </div>
                        <span className="font-bold text-slate-800 dark:text-white">৳০.০০</span>
                    </div>
                </div>
                <div className="bg-rose-50/50 dark:bg-rose-900/10 p-3 border-t border-rose-100 dark:border-rose-900/30 flex justify-between items-center">
                    <span className="text-xs font-bold text-rose-700 dark:text-rose-400">সর্বমোট ব্যয়</span>
                    <span className="text-sm font-black text-rose-700 dark:text-rose-400">৳০.০০</span>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};
