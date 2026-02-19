import React, { useState, useMemo } from 'react';
import { Search, Zap, Filter, Check, Copy, Hash, ExternalLink, ShieldCheck, Lightbulb, ChevronRight, X, User, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Constants
const EKPAY_LINK = "https://ekpay.gov.bd/#/payment/electricity-bill";

// Desco Data
const DESCO_DATA = [
  { flat: '2A', name: 'MATIN', account: '41371285' },
  { flat: '2B', name: 'HANIF', account: '41371286' },
  { flat: '2C', name: 'MINA', account: '41371287' },
  { flat: '3A', name: 'JILLUR', account: '41371298' },
  { flat: '3B', name: 'KAIYUM', account: '41371308' },
  { flat: '3C', name: 'FARUK', account: '41371291' },
  { flat: '4A', name: 'SAIDUR', account: '41371310' },
  { flat: '4B', name: 'IBRAHIM', account: '41371303' },
  { flat: '4C', name: 'AYUB', account: '41371296' },
  { flat: '5A', name: 'MOJAMMEL', account: '41371302' },
  { flat: '5B', name: 'NESAR', account: '41371295' },
  { flat: '5C', name: 'JUWEL', account: '41371309' },
  { flat: '6A', name: 'NESAR', account: '41371299' },
  { flat: '6B', name: 'SHAHIN', account: '41371305' },
  { flat: '6C', name: 'SHAHIDULAH', account: '41371292' },
  { flat: '7A', name: 'AZAD', account: '41371294' },
  { flat: '7B', name: 'MOROL', account: '41371293' },
  { flat: '7C', name: 'NAZRUL', account: '41371284' },
  { flat: '8A', name: 'ATIQ', account: '41371306' },
  { flat: '8B', name: 'MOSTOFA', account: '41371304' },
  { flat: '8C', name: 'FIROZ', account: '41371301' },
  { flat: '9A', name: 'KAIYUM', account: '41371307' },
  { flat: '9B', name: 'AZHAR', account: '41371297' },
  { flat: '9C', name: 'SAYED', account: '41371300' },
  { flat: '10A', name: 'HAKIM', account: '41371288' },
  { flat: '10B', name: 'MOTIUR', account: '41371289' },
  { flat: '10C', name: 'ASHRAF', account: '41371290' },
  { flat: 'MAIN', name: 'NAZRUL', account: '41371283' }
];

interface DescoViewProps {
  lang: 'bn' | 'en';
}

const DescoView: React.FC<DescoViewProps> = ({ lang }) => {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [confirmModalData, setConfirmModalData] = useState<{flat: string, name: string, account: string} | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Translations
  const t = {
    title: lang === 'bn' ? 'ডেসকো সেবা' : 'Desco Service',
    subtitle: lang === 'bn' ? 'প্রিপেইড রিচার্জ' : 'Prepaid Recharge',
    searchPlaceholder: lang === 'bn' ? 'ইউনিট নম্বর লিখুন (যেমন 2A)' : 'Search Unit (e.g., 2A)',
    allFloors: lang === 'bn' ? 'সব ফ্লোর' : 'All Floors',
    recharge: lang === 'bn' ? 'রিচার্জ করুন' : 'Recharge',
    account: lang === 'bn' ? 'অ্যাকাউন্ট' : 'Account',
    owner: lang === 'bn' ? 'নাম' : 'Name',
    flat: lang === 'bn' ? 'ফ্ল্যাট' : 'Flat',
    confirmTitle: lang === 'bn' ? 'পেমেন্ট নিশ্চিতকরণ' : 'Confirm Payment',
    confirmDesc: lang === 'bn' ? 'সঠিক মিটারে রিচার্জ করতে তথ্য মিলিয়ে নিন' : 'Verify details to recharge correct meter',
    payNow: lang === 'bn' ? 'পেমেন্ট গেটওয়েতে যান' : 'Go to Payment Gateway',
    copySuccess: lang === 'bn' ? 'কপি হয়েছে!' : 'Copied!',
    notice: lang === 'bn' 
      ? 'জরুরী: টাকা পাঠানোর আগে মিটার নম্বর অবশ্যই মিলিয়ে নিবেন।'
      : 'Important: Verify meter number before sending money.',
    floor: lang === 'bn' ? 'তলা' : 'Floor',
    paymentNote: lang === 'bn' ? 'পরবর্তী ধাপে বিকাশ/নগদ/রকেট বা কার্ড সিলেক্ট করুন' : 'Select bKash/Nagad/Rocket or Card in next step',
    mainMeter: lang === 'bn' ? 'মেইন মিটার' : 'Main Meter',
    postpaid: 'POSTPAID',
    prepaid: 'PREPAID'
  };

  // Grouping Logic
  const filteredData = useMemo(() => {
    return DESCO_DATA.filter(item => {
      const matchSearch = 
        item.flat.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.account.includes(searchTerm);
      
      const floor = item.flat === 'MAIN' ? 'main' : item.flat.replace(/\D/g, '');
      const matchFloor = selectedFloor === '' || floor === selectedFloor;

      return matchSearch && matchFloor;
    });
  }, [searchTerm, selectedFloor]);

  const groupedData = useMemo(() => {
    const groups: Record<string, typeof DESCO_DATA> = {};
    filteredData.forEach(item => {
      let floorKey = item.flat === 'MAIN' ? 'main' : item.flat.replace(/\D/g, '');
      if (!groups[floorKey]) groups[floorKey] = [];
      groups[floorKey].push(item);
    });
    return groups;
  }, [filteredData]);

  const sortedFloors = Object.keys(groupedData).sort((a, b) => {
    if (a === 'main') return 1;
    if (b === 'main') return -1;
    return parseInt(a) - parseInt(b);
  });

  // Handlers
  const handleCopy = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
        console.error('Copy failed', err);
    }
  };

  const handleProceedToPayment = async () => {
    if (!confirmModalData) return;
    
    // Copy first
    handleCopy(confirmModalData.account);
      
    // Open EkPay in new tab
    setTimeout(() => {
      window.open(EKPAY_LINK, '_blank');
      setConfirmModalData(null);
    }, 800);
  };

  const getFloorLabel = (key: string) => {
    if (key === 'main') return lang === 'bn' ? 'মেইন মিটার' : 'Main Meter';
    const floorNum = parseInt(key);
    const bnFloors = ['১ম', '২য়', '৩য়', '৪র্থ', '৫ম', '৬ষ্ঠ', '৭ম', '৮ম', '৯ম', '১০ম'];
    if (lang === 'bn' && floorNum <= 10 && floorNum > 0) {
      return `${bnFloors[floorNum - 1]} তলা`;
    }
    return `${key}${lang === 'bn' ? 'ম তলা' : 'th Floor'}`;
  };

  return (
    <div className="pb-28 bg-slate-50 min-h-screen relative overflow-hidden font-sans">
      
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-100/40 via-white to-slate-50 pointer-events-none" />
      <div className="fixed -top-20 -right-20 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header Section */}
      <div className="pt-6 px-4 pb-4 relative z-10">
        <div className="flex items-center justify-between mb-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                    <Zap className="text-yellow-500 fill-yellow-500" size={24} />
                    {t.title}
                </h2>
                <p className="text-sm text-slate-500 font-medium ml-1">
                    {t.subtitle}
                </p>
            </div>
            {/* Logo Placeholder or Icon */}
            <div className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center border border-slate-100">
                <Lightbulb size={20} className="text-indigo-600" />
            </div>
        </div>

        {/* Search & Filter Bar - Fixed: Added background and padding to mask content behind */}
        <div className="sticky top-[64px] z-30 bg-slate-50/95 backdrop-blur-md py-2 -mx-4 px-4 mb-2 transition-all shadow-sm">
            <div className="flex gap-3">
                <div className="relative flex-1 group shadow-lg shadow-slate-200/50 rounded-2xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder={t.searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-semibold text-slate-700 placeholder:text-slate-400 h-12"
                    />
                </div>
                <div className="relative w-[32%] shadow-lg shadow-slate-200/50 rounded-2xl">
                    <select 
                        value={selectedFloor}
                        onChange={(e) => setSelectedFloor(e.target.value)}
                        className="w-full bg-indigo-600 border border-indigo-500 text-white font-bold text-xs h-12 rounded-2xl px-3 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-center"
                    >
                        <option value="" className="text-slate-800 bg-white">{t.allFloors}</option>
                        {[2,3,4,5,6,7,8,9,10].map(f => (
                            <option key={f} value={f.toString()} className="text-slate-800 bg-white">
                                {lang === 'bn' ? `${['২','৩','৪','৫','৬','৭','৮','৯','১০'][f-2]} তলা` : `${f}th Floor`}
                            </option>
                        ))}
                        <option value="main" className="text-slate-800 bg-white">{t.mainMeter}</option>
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white/80">
                        <Filter size={12} />
                    </div>
                </div>
            </div>
        </div>
        
        {/* Notice Bar */}
        <div className="mt-4 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2 flex items-center gap-2">
            <ShieldCheck size={14} className="text-orange-500 shrink-0" />
            <p className="text-[11px] font-medium text-orange-700 leading-tight">
                {t.notice}
            </p>
        </div>
      </div>

      {/* List Container */}
      <div className="px-4 space-y-6 relative z-10">
        {sortedFloors.map((floorKey) => (
          <div key={floorKey}>
            {/* Floor Header */}
            <div className="flex items-center gap-3 mb-3 pl-1">
                <div className="bg-slate-200 h-px flex-1"></div>
                <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm uppercase">
                    {getFloorLabel(floorKey)}
                </span>
                <div className="bg-slate-200 h-px flex-1"></div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {groupedData[floorKey].map((item, idx) => {
                const isMain = item.flat === 'MAIN';
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={idx} 
                    className="bg-white rounded-2xl p-4 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden group"
                  >
                     <div className="flex items-center gap-4">
                        {/* Flat Avatar */}
                        <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center text-lg font-black text-white shadow-md ${isMain ? 'bg-slate-700' : 'bg-gradient-to-br from-indigo-500 to-blue-600'}`}>
                            {item.flat}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <h3 className="font-bold text-slate-800 truncate">{item.name}</h3>
                                {isMain && <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 rounded border border-slate-200 font-bold">POST</span>}
                            </div>
                            
                            <p className="text-[9px] text-slate-400 font-bold mb-0.5 ml-0.5">{t.account}</p>

                            {/* Copyable Account Chip */}
                            <button 
                                onClick={() => handleCopy(item.account)}
                                className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 transition-colors group/acc"
                            >
                                <Hash size={10} className="text-slate-400" />
                                <span className="font-mono text-sm font-bold text-slate-600 tracking-wide">{item.account}</span>
                                <Copy size={10} className="text-slate-300 group-hover/acc:text-indigo-500" />
                            </button>
                        </div>

                        {/* Action - PREMIUM GRADIENT BUTTON */}
                        {!isMain && (
                            <button 
                                onClick={() => setConfirmModalData(item)}
                                className="shrink-0 flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-lg hover:shadow-indigo-200 text-white px-4 py-2.5 rounded-xl transition-all active:scale-95 shadow-md group/btn"
                            >
                                <Zap size={16} className="text-yellow-300 fill-yellow-300 group-hover/btn:scale-110 transition-transform" />
                                <span className="text-xs font-bold">{t.recharge}</span>
                            </button>
                        )}
                     </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}

        {sortedFloors.length === 0 && (
            <div className="text-center py-20 opacity-50">
                <Search size={48} className="mx-auto mb-3 text-slate-300" />
                <p className="font-bold text-slate-400">কোনো মিটার পাওয়া যায়নি</p>
            </div>
        )}
      </div>

      {/* Premium Disclaimer Note */}
      <div className="px-4 mt-6 relative z-10">
        <div className="relative bg-white rounded-2xl p-5 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.15)] border border-indigo-50 overflow-hidden">
            {/* Background Gradient Accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-500/5 to-violet-500/5 rounded-full blur-xl -ml-8 -mb-8"></div>
            
            <div className="relative z-10 flex gap-4 items-start">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                    <Info size={20} />
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
                        বিশেষ দ্রষ্টব্য
                        <div className="h-px flex-1 bg-gradient-to-r from-indigo-100 to-transparent"></div>
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        শুধু মাত্র <span className="text-indigo-600 font-bold">❝হলান টাওয়ার❞</span> এর মোট ২৭ টি ইউনিট এর ডেসকো মিটার নম্বর দেওয়া হয়েছে রিচার্জ করার সুবিধা জন্য। <span className="text-rose-500 font-bold">ভুল নম্বরে রিচার্জ করলে কর্তৃপক্ষ দায়ী থাকবে না।</span>
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* Confirmation Modal - Bottom Sheet Style */}
      <AnimatePresence>
      {confirmModalData && (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end justify-center sm:items-center p-0 sm:p-4"
        >
           <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-[2rem] sm:rounded-3xl w-full max-w-sm shadow-2xl relative overflow-hidden"
           >
              {/* Header */}
              <div className="px-6 pt-6 pb-4 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
                  <div>
                      <h3 className="text-xl font-bold text-slate-800">{t.confirmTitle}</h3>
                      <p className="text-xs text-slate-500 mt-1">{t.confirmDesc}</p>
                  </div>
                  <button 
                    onClick={() => setConfirmModalData(null)}
                    className="p-2 bg-white rounded-full text-slate-400 hover:text-red-500 shadow-sm border border-slate-100"
                  >
                    <X size={20} />
                  </button>
              </div>

              <div className="p-6 space-y-6">
                 {/* Meter Details Card */}
                 <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 shadow-sm bg-white">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex flex-col items-center justify-center shadow-lg">
                        <span className="text-xs font-medium text-indigo-100 uppercase">{t.flat}</span>
                        <span className="text-2xl font-black">{confirmModalData.flat}</span>
                    </div>
                    <div className="flex-1 space-y-2">
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400">{t.owner}</p>
                            <p className="font-bold text-slate-700">{confirmModalData.name}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400">{t.account}</p>
                            <div className="flex items-center gap-2">
                                <p className="font-mono text-lg font-bold text-indigo-600 tracking-wider">{confirmModalData.account}</p>
                            </div>
                        </div>
                    </div>
                 </div>

                 {/* Instructions */}
                 <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                     <p className="text-xs text-blue-700 text-center font-medium leading-relaxed">
                        {t.paymentNote}
                     </p>
                 </div>

                 {/* Action Buttons */}
                 <div className="flex flex-col gap-3">
                    <button 
                        onClick={handleProceedToPayment}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm shadow-lg shadow-indigo-200 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <span>{t.payNow}</span>
                        <ExternalLink size={18} />
                    </button>
                 </div>
              </div>
              
              {/* Payment Methods Footer */}
              <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                  <div className="h-6 w-10 bg-pink-600 rounded"></div>
                  <div className="h-6 w-10 bg-orange-500 rounded"></div>
                  <div className="h-6 w-10 bg-purple-600 rounded"></div>
                  <div className="h-6 w-10 bg-blue-600 rounded"></div>
              </div>

           </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
      {showToast && (
        <motion.div 
            initial={{ y: 50, opacity: 0, x: "-50%" }}
            animate={{ y: 0, opacity: 1, x: "-50%" }}
            exit={{ y: 50, opacity: 0, x: "-50%" }}
            className="fixed bottom-24 left-1/2 z-[200] bg-[#1e1b4b] text-white px-5 py-3 rounded-full text-sm font-bold shadow-2xl flex items-center gap-2 whitespace-nowrap"
        >
           <Check size={16} className="text-green-400" />
           {t.copySuccess}
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default DescoView;