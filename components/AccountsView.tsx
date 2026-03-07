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
  const currentMonthName = useMemo(() => {
    const date = new Date();
    const monthIndex = date.getMonth();
    return MONTHS[monthIndex];
  }, []);

  const [selectedYear, setSelectedYear] = useState(INITIAL_YEAR);
  const [accounts, setAccounts] = useState<MonthlyAccountData[]>(getDefaultAccounts(INITIAL_YEAR));
  const [editingMonth, setEditingMonth] = useState<string | null>(currentMonthName);
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

  // Set editData when editingMonth changes (for initial load or clicks)
  useEffect(() => {
    if (editingMonth && accounts.length > 0) {
      const account = accounts.find(a => a.month === editingMonth);
      if (account) {
        setEditData(JSON.parse(JSON.stringify(account)));
      }
    }
  }, [editingMonth, accounts]);

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
    if (editingMonth === month) {
      setEditingMonth(null);
      setEditData(null);
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
    <div className="pb-24 animate-in fade-in duration-1000 bg-[#fdfcfd] min-h-screen relative font-sans text-slate-900">
      
      {/* Header - Ultra Minimal Glass */}
      <div className="bg-white/40 backdrop-blur-3xl sticky top-0 z-30 border-b border-slate-200/40">
        <div className="flex items-center justify-between px-5 py-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-purple-600 transition-all group"
          >
            <div className="w-8 h-8 rounded-full border border-slate-200/60 flex items-center justify-center group-hover:border-purple-200 group-hover:bg-purple-50 transition-all">
              <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">ফিরে যান</span>
          </button>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => isAuthorized ? setIsAuthorized(false) : setShowPinModal(true)}
              className={`h-9 px-4 rounded-xl transition-all flex items-center gap-2 ${isAuthorized 
                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-200/50' 
                : 'bg-slate-100/50 text-slate-400 border border-slate-200/50'}`}
            >
              {isAuthorized ? <Unlock size={16} /> : <Lock size={16} />}
              <span className="text-[9px] font-black uppercase tracking-[0.15em] hidden sm:inline">
                {isAuthorized ? "এডিট" : "লকড"}
              </span>
            </button>
            <div className="flex bg-slate-100/50 border border-slate-200/50 rounded-xl p-0.5">
              <button 
                  onClick={() => setSelectedYear(2025)}
                  className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${selectedYear === 2025 ? 'bg-white shadow-sm text-purple-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                  2025
              </button>
              <button 
                  onClick={() => setSelectedYear(2026)}
                  className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${selectedYear === 2026 ? 'bg-white shadow-sm text-purple-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                  2026
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md mx-auto px-5 py-8 space-y-8">
        {/* Title Section - Elegant & Centered */}
        <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-[1.8rem] bg-gradient-to-br from-purple-900 to-purple-800 flex items-center justify-center text-white shadow-xl shadow-purple-100 mb-1 transform -rotate-3">
                <Calculator size={28} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter">স্বচ্ছ হিসাব কেন্দ্র</h2>
            <div className="flex items-center gap-3">
              <div className="h-[1px] w-8 bg-slate-200"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                বাৎসরিক বিবরণী • {selectedYear}
              </p>
              <div className="h-[1px] w-8 bg-slate-200"></div>
            </div>
        </div>

        {/* Luxury Summary Card - Full Width & Deep */}
        <div className="relative group">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-purple-500/10 to-violet-500/10 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
          <div className="relative overflow-hidden rounded-[2.2rem] bg-[#1a1033] border border-white/5 p-8 text-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]">
             <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-purple-500/20 rounded-full blur-[60px]"></div>
             <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 bg-violet-500/20 rounded-full blur-[60px]"></div>
             
             <div className="relative z-10 flex flex-col space-y-8">
                <div className="space-y-1">
                    <p className="text-purple-300/60 text-[9px] font-black uppercase tracking-[0.3em]">বর্তমান স্থিতি (Balance)</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-light text-purple-300/40">৳</span>
                      <h3 className="text-4xl font-black tracking-tighter text-white">
                        {summary.balance.toLocaleString()}
                      </h3>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-emerald-400">
                            <div className="w-6 h-6 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                              <ArrowUpRight size={14} />
                            </div>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em]">মোট আয়</p>
                        </div>
                        <p className="text-2xl font-black tracking-tight">৳{summary.totalIncome.toLocaleString()}</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-rose-400">
                            <div className="w-6 h-6 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                              <ArrowDownRight size={14} />
                            </div>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em]">মোট ব্যয়</p>
                        </div>
                        <p className="text-2xl font-black tracking-tight">৳{summary.totalExpense.toLocaleString()}</p>
                    </div>
                </div>
             </div>
          </div>
        </div>

        {/* Monthly List Header */}
        <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-600 shadow-lg shadow-purple-200"></div>
                মাসিক বিবরণী
            </h3>
            {loading && <Loader2 size={16} className="animate-spin text-purple-600" />}
        </div>

        {/* Monthly List - Expansive & Premium */}
        <div className="space-y-5">
            {accounts.length === 0 && !loading && (
              <div className="text-center py-16 bg-[#f8f6fa]/50 rounded-[2.5rem] border border-dashed border-slate-200">
                <Calendar size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">কোনো তথ্য পাওয়া যায়নি</p>
              </div>
            )}
            {accounts.map((acc, index) => {
                const { inc, exp, bal } = getMonthSummary(acc);
                const isPositive = bal >= 0;
                const isCurrentMonth = acc.month === currentMonthName;

                return (
                    <motion.div
                        key={acc.month}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className={`group bg-[#f8f6fa] rounded-[2rem] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.03)] transition-all overflow-hidden border border-transparent ${editingMonth === acc.month ? 'ring-2 ring-purple-600/30 shadow-purple-100/40' : 'hover:bg-[#f3eff5] hover:shadow-slate-200/50'}`}
                    >
                        <div 
                          onClick={() => handleEditClick(acc.month)}
                          className={`p-5 cursor-pointer active:scale-[0.99] transition-all`}
                        >
                            <div className="flex items-center justify-between gap-4 mb-5">
                                <div className="flex items-center gap-4">
                                    <div className={`w-11 h-11 rounded-[1.2rem] flex items-center justify-center font-black text-[9px] uppercase tracking-widest border transition-all duration-700 ${isCurrentMonth ? 'bg-purple-600 border-purple-500 text-white shadow-xl shadow-purple-200' : 'bg-white border-slate-200/60 text-slate-400 group-hover:border-purple-200 group-hover:text-purple-600'}`}>
                                        {acc.month.substring(0, 3)}
                                    </div>
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                          <h4 className="font-black text-slate-900 text-lg tracking-tighter">{acc.month}</h4>
                                          {isCurrentMonth && (
                                            <span className="text-[7px] bg-purple-600 text-white px-2 py-1 rounded-full uppercase font-black tracking-[0.1em] shadow-sm">
                                              বর্তমান
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <div className={`w-1 h-1 rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                          <span className={`text-[8px] font-black uppercase tracking-[0.15em] ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                                              {isPositive ? 'উদ্বৃত্ত' : 'ঘাটতি'}
                                          </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  {isAuthorized ? (
                                    <button className={`h-9 px-4 rounded-xl flex items-center gap-2 transition-all duration-500 ${editingMonth === acc.month ? 'bg-purple-600 text-white shadow-xl shadow-purple-200' : 'text-purple-600 bg-white border border-purple-100 hover:bg-purple-50'}`}>
                                      {editingMonth === acc.month ? <X size={14} /> : <Save size={14} />}
                                      <span className="text-[9px] font-black uppercase tracking-widest">
                                        {editingMonth === acc.month ? 'বন্ধ' : 'এডিট'}
                                      </span>
                                    </button>
                                  ) : (
                                    <div className="w-9 h-9 bg-white rounded-xl border border-slate-200/60 flex items-center justify-center shadow-sm">
                                      <Lock size={14} className="text-slate-300" />
                                    </div>
                                  )}
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-700 ${editingMonth === acc.month ? 'bg-purple-100 text-purple-600 rotate-90' : 'text-slate-300'}`}>
                                    <ChevronRight size={18} />
                                  </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-center bg-white/60 backdrop-blur-md rounded-[1.5rem] p-4 border border-white/40">
                                <div className="space-y-1">
                                    <p className="text-[8px] text-slate-400 font-black uppercase tracking-[0.2em]">আয়</p>
                                    <p className="text-sm font-black text-emerald-600 tracking-tight">৳{inc.toLocaleString()}</p>
                                </div>
                                <div className="space-y-1 border-x border-slate-200/60">
                                    <p className="text-[8px] text-slate-400 font-black uppercase tracking-[0.2em]">ব্যয়</p>
                                    <p className="text-sm font-black text-rose-600 tracking-tight">৳{exp.toLocaleString()}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[8px] text-slate-400 font-black uppercase tracking-[0.2em]">স্থিতি</p>
                                    <p className={`text-sm font-black tracking-tight ${bal >= 0 ? 'text-purple-600' : 'text-rose-600'}`}>৳{bal.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Inline Edit Form / View Details */}
                        <AnimatePresence>
                          {editingMonth === acc.month && editData && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                              className="border-t border-white/40 bg-white/30"
                            >
                              <div className="p-6 space-y-10">
                                {/* Income Section */}
                                <div className="space-y-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm border border-emerald-100">
                                            <TrendingUp size={16} />
                                        </div>
                                        <div className="space-y-0.5">
                                          <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-800">আয় সমূহ</h4>
                                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">মাসিক আয়ের বিবরণ</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        {[
                                          { label: 'পূর্বের জমা', field: 'surplus' },
                                          { label: 'সার্ভিস চার্জ', field: 'serviceCharge' },
                                          { label: 'অন্যান্য আয়', field: 'others' }
                                        ].map((item) => (
                                          <div key={item.field} className="flex items-center justify-between bg-white/60 border border-white rounded-xl py-3 px-5 shadow-sm">
                                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{item.label}</label>
                                              {isAuthorized ? (
                                                <input 
                                                    type="number" 
                                                    value={(editData.income as any)[item.field] || ''}
                                                    onChange={(e) => handleInputChange('income', item.field, e.target.value)}
                                                    className="w-24 bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-sm font-black text-slate-900 focus:ring-0 focus:border-purple-600 transition-all outline-none text-right"
                                                    placeholder="0"
                                                />
                                              ) : (
                                                <div className="text-sm font-black text-slate-900">৳ {(editData.income as any)[item.field].toLocaleString()}</div>
                                              )}
                                          </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Expense Section */}
                                <div className="space-y-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-sm border border-rose-100">
                                            <TrendingDown size={16} />
                                        </div>
                                        <div className="space-y-0.5">
                                          <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-800">ব্যয় সমূহ</h4>
                                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">মাসিক ব্যয়ের বিবরণ</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        {[
                                          { label: 'পানি', field: 'water' },
                                          { label: 'বিদ্যুৎ', field: 'electricity' },
                                          { label: 'ময়লা', field: 'garbage' },
                                          { label: 'গার্ড', field: 'caretaker' },
                                          { label: 'অন্যান্য', field: 'others' }
                                        ].map((item) => (
                                          <div key={item.field} className="flex items-center justify-between bg-white/60 border border-white rounded-xl py-3 px-5 shadow-sm">
                                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{item.label}</label>
                                              {isAuthorized ? (
                                                <input 
                                                    type="number" 
                                                    value={(editData.expense as any)[item.field] || ''}
                                                    onChange={(e) => handleInputChange('expense', item.field, e.target.value)}
                                                    className="w-24 bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-sm font-black text-slate-900 focus:ring-0 focus:border-purple-600 transition-all outline-none text-right"
                                                    placeholder="0"
                                                />
                                              ) : (
                                                <div className="text-sm font-black text-slate-900">৳ {(editData.expense as any)[item.field].toLocaleString()}</div>
                                              )}
                                          </div>
                                        ))}
                                    </div>
                                </div>

                                {isAuthorized && (
                                  <div className="flex flex-col items-center gap-6 pt-8 border-t border-white/60">
                                      <div className="space-y-1 text-center">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">মাসিক নিট স্থিতি</p>
                                        <p className={`text-2xl font-black tracking-tight ${((editData.income.surplus + editData.income.serviceCharge + editData.income.others) - (editData.expense.water + editData.expense.electricity + editData.expense.garbage + editData.expense.caretaker + editData.expense.others)) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                          ৳{((editData.income.surplus + editData.income.serviceCharge + editData.income.others) - (editData.expense.water + editData.expense.electricity + editData.expense.garbage + editData.expense.caretaker + editData.expense.others)).toLocaleString()}
                                        </p>
                                      </div>
                                      <button 
                                          onClick={handleSaveEdit}
                                          disabled={isSaving}
                                          className="w-full py-4 px-10 bg-purple-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-[0_15px_40px_-10px_rgba(147,51,234,0.4)] hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-3 transition-all active:scale-95"
                                      >
                                          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                          {isSaving ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
                                      </button>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                    </motion.div>
                );
            })}
        </div>
      </div>

      {/* PIN Modal - Ultra Luxury Glass */}
      <AnimatePresence>
        {showPinModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPinModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-3xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="relative w-full max-w-[280px] bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] p-10 overflow-hidden border border-white"
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-50 to-white border border-slate-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-slate-900 shadow-xl">
                  <Lock size={36} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">পিন কোড</h3>
                <p className="text-[9px] font-black text-slate-400 mt-2 uppercase tracking-[0.3em]">এডিট করার জন্য ৪ ডিজিট</p>
              </div>

              <form onSubmit={handlePinSubmit} className="space-y-8">
                <div className="relative group">
                  <div className="absolute -inset-1.5 bg-purple-600/10 rounded-[2rem] blur opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                  <input 
                    type="password"
                    maxLength={4}
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      setPinError(false);
                    }}
                    autoFocus
                    className={`relative w-full text-center text-5xl tracking-[0.3em] font-black py-6 bg-slate-50 border-2 rounded-[2rem] focus:outline-none transition-all ${pinError ? 'border-rose-500 animate-shake' : 'border-slate-100 focus:border-purple-600 shadow-inner'}`}
                    placeholder="••••"
                  />
                </div>
                {pinError && (
                  <p className="text-[9px] text-center font-black text-rose-500 uppercase tracking-widest animate-bounce">ভুল পিন!</p>
                )}
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setShowPinModal(false)}
                    className="flex-1 py-5 font-black text-slate-400 bg-slate-50 rounded-[1.5rem] hover:bg-slate-100 transition-colors uppercase text-[9px] tracking-widest"
                  >
                    বাতিল
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-5 font-black text-white bg-purple-600 rounded-[1.5rem] shadow-xl shadow-purple-100 hover:bg-purple-700 transition-colors uppercase text-[9px] tracking-widest"
                  >
                    নিশ্চিত
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
