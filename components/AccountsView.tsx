import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, CreditCard, Banknote, Droplets, Trash2, Zap, User, MoreHorizontal, Calculator, Calendar, ChevronRight, Save, X, Plus, Minus, PieChart, ArrowUpRight, ArrowDownRight, Lock, Unlock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

interface AccountsViewProps {
  onBack: () => void;
}

interface MonthlyAccountData {
  id?: string;
  month: string;
  year: number;
  income: {
    surplus: number;
    serviceCharge: number;
    others: number;
  };
  expense: {
    water: number;
    electricity: number;
    garbage: number;
    caretaker: number;
    others: number;
  };
}

const MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

const INITIAL_YEAR = 2026;
const EDIT_PIN = "1234"; // Default PIN for editing

const getDefaultAccounts = (year: number): MonthlyAccountData[] => 
  MONTHS.map(month => ({
    month,
    year,
    income: { surplus: 0, serviceCharge: 0, others: 0 },
    expense: { water: 0, electricity: 0, garbage: 0, caretaker: 0, others: 0 }
  }));

export const AccountsView: React.FC<AccountsViewProps> = ({ onBack }) => {
  const [selectedYear, setSelectedYear] = useState(INITIAL_YEAR);
  const [accounts, setAccounts] = useState<MonthlyAccountData[]>(getDefaultAccounts(INITIAL_YEAR));
  const [editingMonth, setEditingMonth] = useState<string | null>(null);
  const [editData, setEditData] = useState<MonthlyAccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // PIN Protection State
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pendingMonth, setPendingMonth] = useState<string | null>(null);

  // Initialize Data
  useEffect(() => {
    loadData();
  }, [selectedYear]);

  const loadData = async () => {
    setLoading(true);
    
    // 1. Try to load from Supabase
    try {
      const { data, error } = await supabase
        .from('building_accounts')
        .select('*')
        .eq('year', selectedYear);

      if (error) {
        // If table doesn't exist or other error, fallback to local
        console.warn("Supabase fetch failed, using local fallback:", error.message);
        throw error;
      }

      if (data && data.length > 0) {
        // Map data to ensure all months exist
        const mappedData = MONTHS.map(month => {
          const existing = data.find(d => d.month === month);
          return existing || {
            month,
            year: selectedYear,
            income: { surplus: 0, serviceCharge: 0, others: 0 },
            expense: { water: 0, electricity: 0, garbage: 0, caretaker: 0, others: 0 }
          };
        });
        setAccounts(mappedData);
      } else {
        // No data in Supabase, check LocalStorage
        const localKey = `accounts_${selectedYear}`;
        const localData = localStorage.getItem(localKey);
        
        if (localData) {
          setAccounts(JSON.parse(localData));
        } else {
          setAccounts(getDefaultAccounts(selectedYear));
        }
      }
    } catch (err) {
      // Fallback to LocalStorage on any error
      const localKey = `accounts_${selectedYear}`;
      const localData = localStorage.getItem(localKey);
      if (localData) {
        setAccounts(JSON.parse(localData));
      } else {
        setAccounts(getDefaultAccounts(selectedYear));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (month: string) => {
    if (!isAuthorized) {
      setPendingMonth(month);
      setShowPinModal(true);
      return;
    }
    
    const account = accounts.find(a => a.month === month);
    if (account) {
      setEditData(JSON.parse(JSON.stringify(account))); // Deep copy
      setEditingMonth(month);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === EDIT_PIN) {
      setIsAuthorized(true);
      setShowPinModal(false);
      setPinInput("");
      setPinError(false);
      
      if (pendingMonth) {
        const account = accounts.find(a => a.month === pendingMonth);
        if (account) {
          setEditData(JSON.parse(JSON.stringify(account)));
          setEditingMonth(pendingMonth);
        }
        setPendingMonth(null);
      }
    } else {
      setPinError(true);
      setPinInput("");
    }
  };

  const handleSaveEdit = async () => {
    if (!editData) return;
    
    setIsSaving(true);
    try {
      // 1. Update Local State
      const updatedAccounts = accounts.map(a => a.month === editData.month ? editData : a);
      setAccounts(updatedAccounts);
      localStorage.setItem(`accounts_${selectedYear}`, JSON.stringify(updatedAccounts));

      // 2. Sync with Supabase
      const { error } = await supabase
        .from('building_accounts')
        .upsert({
          month: editData.month,
          year: editData.year,
          income: editData.income,
          expense: editData.expense,
          updated_at: new Date().toISOString()
        }, { onConflict: 'month,year' });

      if (error) throw error;

      setEditingMonth(null);
      setEditData(null);
    } catch (err) {
      console.error("Save error:", err);
      alert("তথ্য সেভ করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (section: 'income' | 'expense', field: string, value: string) => {
    if (!editData) return;
    const numValue = parseFloat(value) || 0;
    setEditData({
      ...editData,
      [section]: {
        ...editData[section],
        [field]: numValue
      }
    });
  };

  // Calculations
  const summary = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    accounts.forEach(acc => {
      totalIncome += (acc.income.surplus + acc.income.serviceCharge + acc.income.others);
      totalExpense += (acc.expense.water + acc.expense.electricity + acc.expense.garbage + acc.expense.caretaker + acc.expense.others);
    });

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    };
  }, [accounts]);

  const getMonthSummary = (acc: MonthlyAccountData) => {
    const inc = acc.income.surplus + acc.income.serviceCharge + acc.income.others;
    const exp = acc.expense.water + acc.expense.electricity + acc.expense.garbage + acc.expense.caretaker + acc.expense.others;
    return { inc, exp, bal: inc - exp };
  };

  return (
    <div className="pb-24 animate-in slide-in-from-right duration-500 bg-slate-50 dark:bg-slate-900 min-h-screen relative transition-colors duration-300 font-sans">
      
      {/* Header - Sticky Navigation Only */}
      <div className="bg-white dark:bg-slate-800 sticky top-0 z-20 border-b border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors py-1 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-base font-bold">ফিরে যান</span>
          </button>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => isAuthorized ? setIsAuthorized(false) : setShowPinModal(true)}
              className={`p-2 rounded-lg transition-all flex items-center gap-2 ${isAuthorized 
                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200'}`}
              title={isAuthorized ? "লক করুন" : "আনলক করুন"}
            >
              {isAuthorized ? <Unlock size={18} /> : <Lock size={18} />}
              <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">
                {isAuthorized ? "এডিট মোড" : "লকড"}
              </span>
            </button>
            <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
              <button 
                  onClick={() => setSelectedYear(2025)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${selectedYear === 2025 ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}
              >
                  2025
              </button>
              <button 
                  onClick={() => setSelectedYear(2026)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${selectedYear === 2026 ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}
              >
                  2026
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Title & Summary Card Section (Scrollable) */}
        <div>
          <div className="flex items-center gap-3 mb-4 px-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 dark:shadow-none">
                <Calculator size={20} />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">স্বচ্ছ হিসাব কেন্দ্র</h2>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  বাৎসরিক হিসাব বিবরণী - {selectedYear}
                </p>
            </div>
          </div>

          {/* Premium Summary Card */}
          <div className="relative overflow-hidden rounded-2xl shadow-xl border border-white/10 p-6 text-white group">
             <div className="absolute inset-0 bg-gradient-to-br from-[#4f46e5] to-[#7c3aed] z-0"></div>
             <div className="absolute top-0 right-0 p-8 opacity-10 transform rotate-12 group-hover:scale-110 transition-transform duration-700">
                <PieChart size={120} />
             </div>
             
             <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">বর্তমান স্থিতি (Balance)</p>
                        <h3 className="text-3xl font-black tracking-tight">৳ {summary.balance.toLocaleString()}</h3>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md p-2 rounded-lg">
                        <Wallet size={24} className="text-white" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div>
                        <div className="flex items-center gap-1.5 mb-1 text-emerald-300">
                            <ArrowUpRight size={14} />
                            <p className="text-[10px] font-bold uppercase">মোট আয়</p>
                        </div>
                        <p className="text-lg font-bold">৳ {summary.totalIncome.toLocaleString()}</p>
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5 mb-1 text-rose-300">
                            <ArrowDownRight size={14} />
                            <p className="text-[10px] font-bold uppercase">মোট ব্যয়</p>
                        </div>
                        <p className="text-lg font-bold">৳ {summary.totalExpense.toLocaleString()}</p>
                    </div>
                </div>
             </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-1 pt-2">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Calendar size={16} className="text-indigo-500" />
                মাসিক বিবরণী
            </h3>
            {loading && <Loader2 size={16} className="animate-spin text-slate-400" />}
        </div>

        {/* Monthly List */}
        <div className="space-y-3">
            {accounts.length === 0 && !loading && (
              <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <Calendar size={40} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">কোনো তথ্য পাওয়া যায়নি।</p>
              </div>
            )}
            {accounts.map((acc, index) => {
                const { inc, exp, bal } = getMonthSummary(acc);
                const isPositive = bal >= 0;

                return (
                    <motion.div
                        key={acc.month}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleEditClick(acc.month)}
                        className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all cursor-pointer active:scale-[0.99] group"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-xs border border-slate-100 dark:border-slate-600 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {acc.month.substring(0, 3)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-white">{acc.month}</h4>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'}`}>
                                        {isPositive ? 'উদ্বৃত্ত' : 'ঘাটতি'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isAuthorized ? (
                                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md flex items-center gap-1">
                                  <Save size={10} />
                                  এডিট
                                </span>
                              ) : (
                                <Lock size={14} className="text-slate-300" />
                              )}
                              <ChevronRight size={18} className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors" />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center divide-x divide-slate-100 dark:divide-slate-700 bg-slate-50 dark:bg-slate-700/30 rounded-lg p-2">
                            <div>
                                <p className="text-[9px] text-slate-400 dark:text-slate-500 mb-0.5">আয়</p>
                                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">৳{inc.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-[9px] text-slate-400 dark:text-slate-500 mb-0.5">ব্যয়</p>
                                <p className="text-xs font-bold text-rose-600 dark:text-rose-400">৳{exp.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-[9px] text-slate-400 dark:text-slate-500 mb-0.5">স্থিতি</p>
                                <p className={`text-xs font-bold ${bal >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'}`}>৳{bal.toLocaleString()}</p>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
      </div>

      {/* PIN Modal */}
      <AnimatePresence>
        {showPinModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPinModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400">
                  <Lock size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">পিন কোড দিন</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">এডিট করার জন্য ৪ ডিজিটের পিন দিন</p>
              </div>

              <form onSubmit={handlePinSubmit} className="space-y-4">
                <input 
                  type="password"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  autoFocus
                  className={`w-full text-center text-3xl tracking-[1em] font-black py-4 bg-slate-50 dark:bg-slate-700 border-2 rounded-xl focus:outline-none transition-all ${pinError ? 'border-rose-500 animate-shake' : 'border-slate-100 dark:border-slate-600 focus:border-indigo-500'}`}
                  placeholder="••••"
                />
                {pinError && (
                  <p className="text-xs text-center font-bold text-rose-500">ভুল পিন! আবার চেষ্টা করুন।</p>
                )}
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowPinModal(false)}
                    className="flex-1 py-3 font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    বাতিল
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 font-bold text-white bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-colors"
                  >
                    নিশ্চিত করুন
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingMonth && editData && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setEditingMonth(null)}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />
                
                <motion.div 
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
                >
                    {/* Modal Header */}
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800 sticky top-0 z-10">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{editData.month} মাসের হিসাব</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">তথ্য হালনাগাদ করুন</p>
                        </div>
                        <button 
                            onClick={() => setEditingMonth(null)}
                            className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 hover:bg-rose-100 hover:text-rose-500 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="overflow-y-auto p-6 space-y-6">
                        {/* Income Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                <TrendingUp size={18} />
                                <h4 className="font-bold text-sm uppercase tracking-wider">আয় সমূহ</h4>
                            </div>
                            
                            <div className="grid gap-3">
                                <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">পূর্বের জমা / উদ্বৃত্ত</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                                        <input 
                                            type="number" 
                                            value={editData.income.surplus || ''}
                                            onChange={(e) => handleInputChange('income', 'surplus', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg py-2 pl-8 pr-3 font-bold text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">সার্ভিস চার্জ আদায়</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                                        <input 
                                            type="number" 
                                            value={editData.income.serviceCharge || ''}
                                            onChange={(e) => handleInputChange('income', 'serviceCharge', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg py-2 pl-8 pr-3 font-bold text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">অন্যান্য আয়</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                                        <input 
                                            type="number" 
                                            value={editData.income.others || ''}
                                            onChange={(e) => handleInputChange('income', 'others', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg py-2 pl-8 pr-3 font-bold text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Expense Section */}
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                                <TrendingDown size={18} />
                                <h4 className="font-bold text-sm uppercase tracking-wider">ব্যয় সমূহ</h4>
                            </div>
                            
                            <div className="grid gap-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">পানি বিল</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                value={editData.expense.water || ''}
                                                onChange={(e) => handleInputChange('expense', 'water', e.target.value)}
                                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg py-2 px-3 font-bold text-slate-800 dark:text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">বিদ্যুৎ বিল</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                value={editData.expense.electricity || ''}
                                                onChange={(e) => handleInputChange('expense', 'electricity', e.target.value)}
                                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg py-2 px-3 font-bold text-slate-800 dark:text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">ময়লা বিল</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                value={editData.expense.garbage || ''}
                                                onChange={(e) => handleInputChange('expense', 'garbage', e.target.value)}
                                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg py-2 px-3 font-bold text-slate-800 dark:text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">কেয়ারটেকার</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                value={editData.expense.caretaker || ''}
                                                onChange={(e) => handleInputChange('expense', 'caretaker', e.target.value)}
                                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg py-2 px-3 font-bold text-slate-800 dark:text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">অন্যান্য ব্যয়</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                                        <input 
                                            type="number" 
                                            value={editData.expense.others || ''}
                                            onChange={(e) => handleInputChange('expense', 'others', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg py-2 pl-8 pr-3 font-bold text-slate-800 dark:text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Live Summary in Modal */}
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl flex justify-between items-center border border-indigo-100 dark:border-indigo-800/50">
                            <span className="text-sm font-bold text-indigo-800 dark:text-indigo-300">মাসিক স্থিতি</span>
                            <span className={`text-lg font-black ${
                                (editData.income.surplus + editData.income.serviceCharge + editData.income.others) - 
                                (editData.expense.water + editData.expense.electricity + editData.expense.garbage + editData.expense.caretaker + editData.expense.others) >= 0 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : 'text-rose-600 dark:text-rose-400'
                            }`}>
                                ৳ {((editData.income.surplus + editData.income.serviceCharge + editData.income.others) - 
                                (editData.expense.water + editData.expense.electricity + editData.expense.garbage + editData.expense.caretaker + editData.expense.others)).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 sticky bottom-0 z-10 pb-8 sm:pb-4">
                        <button 
                            onClick={handleSaveEdit}
                            disabled={isSaving}
                            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                            {isSaving ? 'সেভ হচ্ছে...' : 'সংরক্ষণ করুন'}
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};
