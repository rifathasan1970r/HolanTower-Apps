import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft, Search, CheckCircle2, XCircle, Clock, Users, Home, PieChart, CalendarDays, TrendingUp, Wallet, ArrowUpRight, ListFilter, RefreshCw, Lock, Unlock, Edit3, Save, X, Grid, Calendar as CalendarIcon, DollarSign, Check } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// কনফিগারেশন: ২৭টি ইউনিট (ফ্লোর ২ থেকে ১০)
const FLOORS = [2, 3, 4, 5, 6, 7, 8, 9, 10];
const UNITS_PER_FLOOR = ['A', 'B', 'C'];
const ALL_UNITS = FLOORS.flatMap(f => UNITS_PER_FLOOR.map(u => `${f}${u}`));
const SERVICE_CHARGE_AMOUNT = 2000;

const MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

type Status = 'PAID' | 'DUE' | 'UPCOMING';

interface MonthlyRecord {
  month: string;
  date: string;
  amount: number;
  due: number;
  status: Status;
}

interface PaymentData {
  id?: number;
  unit_text: string;
  month_name: string;
  year_num: number;
  amount: number;
  due: number;
  paid_date: string;
}

interface UnitInfo {
  unit_text: string;
  is_occupied: boolean;
}

export const ServiceChargeView: React.FC = () => {
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [showSummaryList, setShowSummaryList] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Supabase State
  const [dbData, setDbData] = useState<PaymentData[]>([]);
  const [unitsInfo, setUnitsInfo] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [useMock, setUseMock] = useState<boolean>(false);

  // Admin State
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showLogin, setShowLogin] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [processingUpdate, setProcessingUpdate] = useState<boolean>(false);

  // Inline Edit State
  const [editingMonth, setEditingMonth] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({ amount: 2000, due: 0, date: '' });

  // Date Helper
  const getBanglaDate = () => {
    return new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' }).replace(/,/g, '');
  };

  // Fetch data from Supabase
  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      // Fetch Payments
      const { data: payData, error: payError } = await supabase
        .from('payments')
        .select('*')
        .eq('year_num', selectedYear);

      if (payError) throw payError;
      if (payData) setDbData(payData as PaymentData[]);

      // Fetch Units Occupancy Info
      const { data: uData, error: uError } = await supabase
        .from('units_info')
        .select('*');
      
      if (uError) {
          console.warn("units_info table not found, using default occupancy logic.");
      } else if (uData) {
          const mapping: Record<string, boolean> = {};
          uData.forEach((u: UnitInfo) => mapping[u.unit_text] = u.is_occupied);
          setUnitsInfo(mapping);
      }
      
      setUseMock(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setUseMock(true);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  // Admin Logic
  const handleLogin = () => {
    if (pinInput === '1234') { 
      setIsAdmin(true);
      setShowLogin(false);
      setPinInput('');
    } else {
      alert('ভুল পিন!');
    }
  };

  const handleToggleOccupancy = async (unit: string) => {
    if (!isAdmin || processingUpdate) return;
    setProcessingUpdate(true);
    
    const currentVal = unitsInfo[unit] ?? (unit.charCodeAt(1) % 2 !== 0);
    const newVal = !currentVal;

    try {
        const { error } = await supabase
            .from('units_info')
            .upsert({ unit_text: unit, is_occupied: newVal }, { onConflict: 'unit_text' });

        if (error) throw error;
        setUnitsInfo(prev => ({ ...prev, [unit]: newVal }));
    } catch (err) {
        console.error("Error updating occupancy:", err);
    } finally {
        setProcessingUpdate(false);
    }
  };

  const startEditing = (unit: string, month: string) => {
    if (!isAdmin) return;
    const existing = dbData.find(d => d.unit_text === unit && d.month_name === month && d.year_num === selectedYear);
    
    setEditingMonth(month);
    setEditFormData({
      amount: existing?.amount ?? 2000,
      due: existing?.due ?? 0,
      date: existing?.paid_date ?? getBanglaDate()
    });
  };

  const cancelEditing = () => {
    setEditingMonth(null);
    setEditFormData({ amount: 2000, due: 0, date: '' });
  };

  const handleInlineSave = async (unit: string, month: string) => {
    if (processingUpdate) return;
    setProcessingUpdate(true);

    try {
      // ১. প্রথমে চেক করি এই মাস ও ইউনিটের ডাটা সার্ভারে আগে থেকেই আছে কিনা
      const { data: existingData, error: fetchError } = await supabase
        .from('payments')
        .select('id')
        .eq('unit_text', unit)
        .eq('month_name', month)
        .eq('year_num', selectedYear)
        .maybeSingle();

      if (fetchError) throw fetchError;

      let error = null;

      if (existingData) {
        // UPDATE (যদি ডাটা থাকে)
        const res = await supabase
          .from('payments')
          .update({
            amount: editFormData.amount,
            due: editFormData.due,
            paid_date: editFormData.date
          })
          .eq('id', existingData.id);
        error = res.error;
      } else {
        // INSERT (যদি ডাটা না থাকে)
        const newRecord = {
          unit_text: unit,
          month_name: month,
          year_num: selectedYear,
          amount: editFormData.amount,
          due: editFormData.due,
          paid_date: editFormData.date
        };

        const res = await supabase
          .from('payments')
          .insert(newRecord);
        error = res.error;
      }

      if (error) throw error;

      // রিফ্রেশ ডাটা (সরাসরি সার্ভার থেকে) - যাতে আপডেট নিশ্চিত হয়
      await fetchData(false); 
      setEditingMonth(null);
      
    } catch (err: any) {
      console.error("Error saving payment:", err);
      alert(`আপডেট ব্যর্থ হয়েছে: ${err.message || "অজানা সমস্যা"}`);
    } finally {
      setProcessingUpdate(false);
    }
  };

  const handleQuickStatusToggle = async (unit: string, month: string) => {
      if (!isAdmin || processingUpdate) return;
      setProcessingUpdate(true);

      try {
          // ১. চেক করি ডাটা আছে কিনা
          const { data: existingData } = await supabase
            .from('payments')
            .select('id')
            .eq('unit_text', unit)
            .eq('month_name', month)
            .eq('year_num', selectedYear)
            .maybeSingle();

          if (existingData) {
              // Toggle to DUE: ডাটা ডিলিট করে বকেয়া বানানো
              const { error } = await supabase.from('payments').delete().eq('id', existingData.id);
              if (error) throw error;
              
              // UI আপডেট
              setDbData(prev => prev.filter(d => d.id !== existingData.id));
          } else {
              // Toggle to PAID: নতুন এন্ট্রি তৈরি করা
              const paidDate = getBanglaDate();
              const { data, error } = await supabase.from('payments').insert({
                  unit_text: unit,
                  month_name: month,
                  year_num: selectedYear,
                  amount: 2000,
                  due: 0,
                  paid_date: paidDate
              }).select();
              
              if (error) throw error;
              if (data) setDbData(prev => [...prev, data[0] as PaymentData]);
          }
      } catch (err: any) {
          console.error(err);
          alert("স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।");
      } finally {
          setProcessingUpdate(false);
      }
  };

  // Generate Data
  const getUnitData = (unit: string): MonthlyRecord[] => {
    const now = new Date();
    const currentRealYear = now.getFullYear();
    const currentRealMonthIdx = now.getMonth();

    return MONTHS.map((month, index) => {
      let paymentRecord: PaymentData | undefined;
      
      paymentRecord = dbData.find(
        d => d.unit_text === unit && d.month_name === month
      );

      if (paymentRecord) {
        return {
          month,
          date: paymentRecord.paid_date || '-',
          amount: paymentRecord.amount,
          due: paymentRecord.due,
          status: paymentRecord.amount > 0 ? 'PAID' : 'DUE'
        };
      }

      const isFuture = selectedYear > currentRealYear || (selectedYear === currentRealYear && index > currentRealMonthIdx);
      if (isFuture) {
        return { month, date: '-', amount: 0, due: 0, status: 'UPCOMING' };
      } else {
        return { month, date: '-', amount: 0, due: SERVICE_CHARGE_AMOUNT, status: 'DUE' };
      }
    });
  };

  const allUnitsSummary = useMemo(() => {
    return ALL_UNITS.map(unit => {
        const records = getUnitData(unit);
        const collected = records.reduce((sum, r) => sum + (r.status === 'PAID' ? r.amount : 0), 0);
        const due = records.reduce((sum, r) => sum + r.due, 0);
        return { unit, collected, due };
    });
  }, [selectedYear, dbData, unitsInfo]);

  const grandTotalCollected = allUnitsSummary.reduce((acc, curr) => acc + curr.collected, 0);
  const grandTotalDue = allUnitsSummary.reduce((acc, curr) => acc + curr.due, 0);

  const filteredUnitsData = allUnitsSummary.filter(data => 
    data.unit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusElement = (status: Status) => {
    switch (status) {
      case 'PAID':
        return (
            <div className="flex flex-col items-center justify-center">
                <div className="bg-green-100 text-green-600 p-1 rounded-full mb-0.5">
                    <CheckCircle2 size={14} />
                </div>
                <span className="text-[9px] font-bold text-green-700">পরিশোধিত</span>
            </div>
        );
      case 'DUE':
        return (
            <div className="flex flex-col items-center justify-center">
                <div className="bg-red-100 text-red-600 p-1 rounded-full mb-0.5">
                    <XCircle size={14} />
                </div>
                <span className="text-[9px] font-bold text-red-700">বকেয়া</span>
            </div>
        );
      default:
        return (
            <div className="flex flex-col items-center justify-center">
                <div className="bg-slate-100 text-slate-400 p-1 rounded-full mb-0.5">
                    <Clock size={14} />
                </div>
                <span className="text-[9px] font-medium text-slate-500">আসন্ন</span>
            </div>
        );
    }
  };

  // Login Modal
  const LoginModal = () => (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl animate-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800">অ্যাডমিন লগইন</h3>
          <button onClick={() => setShowLogin(false)} className="text-slate-400 hover:text-red-500">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-slate-500 mb-4">ডেটা এডিট করতে পিন কোড দিন:</p>
        <input 
          type="password" 
          value={pinInput}
          onChange={(e) => setPinInput(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-4 text-center text-2xl tracking-widest font-bold focus:outline-none focus:border-indigo-500 transition-colors"
          placeholder="••••"
          maxLength={4}
          autoFocus
        />
        <button 
          onClick={handleLogin}
          className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all"
        >
          লগইন করুন
        </button>
      </div>
    </div>
  );

  // VIEW 1: SINGLE UNIT DETAILED VIEW
  if (selectedUnit) {
    const currentIndex = ALL_UNITS.indexOf(selectedUnit);
    const prevUnit = currentIndex > 0 ? ALL_UNITS[currentIndex - 1] : null;
    const nextUnit = currentIndex < ALL_UNITS.length - 1 ? ALL_UNITS[currentIndex + 1] : null;

    const records = getUnitData(selectedUnit);
    const totalAmount = records.reduce((sum, r) => sum + r.amount, 0);
    const totalDue = records.reduce((sum, r) => sum + r.due, 0);
    
    // Stats for Graph
    const paidCount = records.filter(r => r.status === 'PAID').length;
    const dueCount = records.filter(r => r.status === 'DUE').length;
    
    const totalMonths = 12;
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const paidOffset = circumference - (paidCount / totalMonths) * circumference;
    const dueOffset = circumference - (dueCount / totalMonths) * circumference;
    
    const isOccupied = unitsInfo[selectedUnit] ?? (selectedUnit.charCodeAt(1) % 2 !== 0); 
    const occupancyStatus = isOccupied ? 'বসবাসরত' : 'খালি';

    return (
      <div key={`${selectedUnit}-${selectedYear}`} className="pb-24 animate-in slide-in-from-right duration-500 bg-slate-50 min-h-screen relative">
        {showLogin && <LoginModal />}
        
        {/* Navigation Header Section */}
        <div className="bg-white sticky top-[60px] z-10 border-b border-slate-100 shadow-sm transition-all">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
                 <button 
                  onClick={() => setSelectedUnit(null)}
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors py-1 group"
                >
                  <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                  <span className="text-base font-bold">ফিরে যান</span>
                </button>

                {/* Admin Toggle in Unit View */}
                <button 
                  onClick={() => isAdmin ? setIsAdmin(false) : setShowLogin(true)}
                  className={`p-2 rounded-full transition-colors ${isAdmin ? 'bg-indigo-100 text-indigo-600' : 'text-slate-300 hover:text-slate-500'}`}
                >
                  {isAdmin ? <Unlock size={18} /> : <Lock size={18} />}
                </button>
            </div>
            
            <div className="flex items-center justify-between px-6 py-3">
                 <button 
                    onClick={() => prevUnit && setSelectedUnit(prevUnit)}
                    disabled={!prevUnit}
                    className={`p-2 rounded-full transition-all ${!prevUnit ? 'text-slate-100 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-100 active:scale-95 hover:text-primary-600'}`}
                 >
                    <ChevronLeft size={32} />
                 </button>
                 
                 <div className="text-center animate-in zoom-in duration-300">
                    <h2 className="text-3xl font-bold text-slate-800">ইউনিট {selectedUnit}</h2>
                 </div>

                 <button 
                    onClick={() => nextUnit && setSelectedUnit(nextUnit)}
                    disabled={!nextUnit}
                    className={`p-2 rounded-full transition-all ${!nextUnit ? 'text-slate-100 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-100 active:scale-95 hover:text-primary-600'}`}
                 >
                    <ChevronRight size={32} />
                 </button>
            </div>
        </div>

        {/* Admin Tip */}
        {isAdmin && (
           <div className="bg-indigo-600 text-white text-[10px] py-1.5 px-4 text-center font-bold animate-in slide-in-from-top flex items-center justify-center gap-2">
             <Edit3 size={12} /> তথ্য পরিবর্তন করতে যেকোনো লাইনে ক্লিক করুন
           </div>
        )}

        {/* Year Selection Tabs */}
        <div className="px-4 pt-4 pb-0">
             <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-100 flex">
                <button 
                    onClick={() => setSelectedYear(2025)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${selectedYear === 2025 ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <CalendarDays size={16} /> ২০২৫
                </button>
                <button 
                    onClick={() => setSelectedYear(2026)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${selectedYear === 2026 ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <CalendarDays size={16} /> ২০২৬
                </button>
            </div>
        </div>

        {/* Summary Box */}
        <div className="px-4 pt-4">
            <div 
                className="rounded-2xl p-4 shadow-lg border border-white/10 grid grid-cols-3 gap-2 divide-x divide-white/20 text-white transition-all duration-500"
                style={{ background: 'linear-gradient(135deg, #6a11cb, #2575fc)' }}
            >
                <button 
                    onClick={() => handleToggleOccupancy(selectedUnit)}
                    disabled={!isAdmin}
                    className={`text-center px-1 flex flex-col items-center justify-center transition-all ${isAdmin ? 'active:scale-95 cursor-pointer' : ''}`}
                >
                    <p className="text-[10px] text-white/80 font-medium uppercase mb-1">বসবাসের ধরন</p>
                    <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${occupancyStatus === 'বসবাসরত' ? 'bg-white text-blue-600' : 'bg-white/90 text-orange-600'}`}>
                        {occupancyStatus === 'বসবাসরত' ? <Users size={12} /> : <Home size={12} />}
                        {occupancyStatus}
                    </div>
                </button>
                <div className="text-center px-1 flex flex-col items-center justify-center">
                    <p className="text-[10px] text-white/80 font-medium uppercase mb-1">মোট টাকা</p>
                    <p className="font-bold text-white text-base">৳ {totalAmount.toLocaleString()}</p>
                </div>
                <div className="text-center px-1 flex flex-col items-center justify-center">
                    <p className="text-[10px] text-white/80 font-medium uppercase mb-1">মোট বাকি</p>
                    <p className="font-bold text-base text-white">৳ {totalDue.toLocaleString()}</p>
                </div>
            </div>
        </div>

        {/* Ledger Table Section */}
        <div className="p-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="py-3 pl-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[28%]">মাস ও তারিখ</th>
                            <th className="py-3 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[22%]">টাকা</th>
                            <th className="py-3 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[22%]">বকেয়া</th>
                            <th className="py-3 pr-3 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[28%]">অবস্থা</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {records.map((record, idx) => {
                            const isEditable = isAdmin && !processingUpdate;
                            const isEditing = editingMonth === record.month;

                            return (
                              <tr 
                                key={idx} 
                                className={`
                                  transition-all duration-200 
                                  ${record.status === 'DUE' ? 'bg-red-50/10' : ''}
                                  ${isEditable && !isEditing ? 'hover:bg-indigo-50 active:bg-indigo-100/50' : 'hover:bg-slate-50/50'}
                                  ${isEditing ? 'bg-indigo-50/50' : ''}
                                `}
                              >
                                  {isEditing ? (
                                    <>
                                      <td className="py-2 pl-2 align-middle">
                                          <div className="font-bold text-slate-800 text-xs mb-1">{record.month}</div>
                                          <input 
                                            type="text" 
                                            value={editFormData.date}
                                            onChange={(e) => setEditFormData({...editFormData, date: e.target.value})}
                                            className="w-full text-[10px] border border-slate-300 rounded px-1 py-1 focus:border-indigo-500 outline-none"
                                            placeholder="তারিখ"
                                            autoFocus
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                      </td>
                                      <td className="py-2 align-middle text-center px-1">
                                          <input 
                                            type="number" 
                                            value={editFormData.amount}
                                            onChange={(e) => setEditFormData({...editFormData, amount: Number(e.target.value)})}
                                            className="w-full text-xs font-bold text-center border border-slate-300 rounded px-1 py-1 focus:border-indigo-500 outline-none text-slate-700"
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                      </td>
                                      <td className="py-2 align-middle text-center px-1">
                                          <input 
                                            type="number" 
                                            value={editFormData.due}
                                            onChange={(e) => setEditFormData({...editFormData, due: Number(e.target.value)})}
                                            className="w-full text-xs font-bold text-center border border-slate-300 rounded px-1 py-1 focus:border-indigo-500 outline-none text-red-600"
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                      </td>
                                      <td className="py-2 pr-2 align-middle text-right">
                                         <div className="flex justify-end gap-1">
                                            <button 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleInlineSave(selectedUnit, record.month);
                                              }}
                                              className="p-1.5 bg-green-500 text-white rounded shadow-sm hover:bg-green-600 active:scale-95"
                                            >
                                              <Check size={14} />
                                            </button>
                                            <button 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                cancelEditing();
                                              }}
                                              className="p-1.5 bg-slate-200 text-slate-500 rounded shadow-sm hover:bg-slate-300 active:scale-95"
                                            >
                                              <X size={14} />
                                            </button>
                                         </div>
                                      </td>
                                    </>
                                  ) : (
                                    <>
                                      <td onClick={() => isEditable && startEditing(selectedUnit, record.month)} className="py-3 pl-3 align-middle cursor-pointer">
                                          <div className="font-bold text-slate-800 text-sm">{record.month}</div>
                                          <div className="text-[10px] text-slate-400 font-medium mt-0.5 whitespace-nowrap">{record.date}</div>
                                      </td>
                                      <td onClick={() => isEditable && startEditing(selectedUnit, record.month)} className="py-3 align-middle text-center cursor-pointer">
                                          <div className={`font-semibold text-sm ${record.amount > 0 ? 'text-slate-700' : 'text-slate-300'}`}>
                                              {record.amount > 0 ? `৳${record.amount}` : '-'}
                                          </div>
                                      </td>
                                      <td onClick={() => isEditable && startEditing(selectedUnit, record.month)} className="py-3 align-middle text-center cursor-pointer">
                                           <div className={`font-semibold text-sm ${record.due > 0 ? 'text-red-600' : 'text-slate-300'}`}>
                                              {record.due > 0 ? `৳${record.due}` : '-'}
                                           </div>
                                      </td>
                                      <td className="py-3 pr-3 align-middle flex justify-end">
                                          <div onClick={() => isEditable && handleQuickStatusToggle(selectedUnit, record.month)}>
                                            {isAdmin ? (
                                                <div className={`px-2 py-1.5 rounded-lg text-[9px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                                                record.status === 'PAID' 
                                                    ? 'bg-green-100 text-green-700 border-green-200 shadow-sm' 
                                                    : 'bg-white text-red-500 border-red-200 shadow-sm'
                                                }`}>
                                                {record.status === 'PAID' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                                                {record.status === 'PAID' ? 'পরিশোধিত' : 'বকেয়া'}
                                                </div>
                                            ) : (
                                                getStatusElement(record.status)
                                            )}
                                          </div>
                                      </td>
                                    </>
                                  )}
                              </tr>
                          );
                        })}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t border-slate-200">
                        <tr>
                            <td className="py-3 pl-3 text-sm font-bold text-slate-700">সর্বমোট</td>
                            <td className="py-3 text-center text-sm font-bold text-slate-700">৳ {totalAmount.toLocaleString()}</td>
                            <td className="py-3 text-center text-sm font-bold text-red-600">{totalDue > 0 ? `৳ ${totalDue.toLocaleString()}` : '-'}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            {/* Payment Status Graph & Grid Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                  <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-2">
                      <PieChart size={18} className="text-primary-600" />
                      <h3 className="font-bold text-slate-700">পেমেন্ট স্ট্যাটাস ({selectedYear})</h3>
                  </div>
                  
                  {/* Pie Chart & Legend */}
                  <div className="flex items-center justify-between gap-4 mb-6">
                      <div className="relative w-32 h-32 flex-shrink-0">
                          <svg className="w-full h-full transform -rotate-90">
                              <circle cx="50%" cy="50%" r={radius} stroke="#f1f5f9" strokeWidth="12" fill="transparent"/>
                              <circle cx="50%" cy="50%" r={radius} stroke="#22c55e" strokeWidth="12" fill="transparent" strokeDasharray={circumference} strokeDashoffset={paidOffset} strokeLinecap="round"/>
                              <circle cx="50%" cy="50%" r={radius} stroke="#ef4444" strokeWidth="12" fill="transparent" strokeDasharray={circumference} strokeDashoffset={dueOffset} strokeLinecap="round" style={{ transformOrigin: 'center', transform: `rotate(${paidCount * (360/12)}deg)` }}/>
                          </svg>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                              <span className="block text-2xl font-bold text-slate-700">{Math.round((paidCount/totalMonths)*100)}%</span>
                              <span className="text-[10px] text-slate-400 font-medium">পরিশোধ</span>
                          </div>
                      </div>

                      <div className="flex-1 space-y-3">
                          <div className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2">
                                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                  <span className="text-slate-600 font-medium">পরিশোধ</span>
                              </div>
                              <span className="font-bold text-slate-800">{paidCount} মাস</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2">
                                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                  <span className="text-slate-600 font-medium">বকেয়া</span>
                              </div>
                              <span className="font-bold text-slate-800">{dueCount} মাস</span>
                          </div>
                      </div>
                  </div>

                  {/* Month Grid */}
                  <div className="grid grid-cols-4 gap-2 border-t border-slate-50 pt-4">
                    {records.map((record, idx) => (
                        <div
                            key={idx}
                            onClick={() => isAdmin && !processingUpdate && handleQuickStatusToggle(selectedUnit, record.month)}
                            className={`
                                aspect-[4/3] rounded-lg flex flex-col items-center justify-center text-center transition-all relative overflow-hidden shadow-sm border
                                ${record.status === 'PAID' ? 'bg-green-500 text-white border-green-600' : ''}
                                ${record.status === 'DUE' ? 'bg-red-500 text-white border-red-600' : ''}
                                ${record.status === 'UPCOMING' ? 'bg-slate-50 text-slate-400 border-slate-100' : ''}
                                ${isAdmin ? 'cursor-pointer hover:opacity-90 active:scale-95' : ''}
                            `}
                        >
                            <span className="text-[10px] font-bold leading-tight">{record.month}</span>
                            {record.status === 'PAID' && (
                                <div className="mt-0.5"><CheckCircle2 size={12} /></div>
                            )}
                             {record.status === 'DUE' && (
                                <span className="text-[9px] mt-0.5 font-bold opacity-90">বাকি</span>
                            )}
                        </div>
                    ))}
                  </div>
              </div>
        </div>
      </div>
    );
  }

  // VIEW 2 & 3 Combined Logic Wrapper
  return (
    <div className="px-4 py-6 pb-24 animate-in slide-in-from-bottom-4 duration-500">
      {showLogin && <LoginModal />}
      
      {/* Loading State */}
      {loading && (
         <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
             <RefreshCw className="animate-spin text-primary-500" size={40} />
         </div>
      )}

      {/* Main Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">সার্ভিস চার্জ</h2>
        <div className="flex items-center gap-2">
           {useMock && (
             <span className="text-[9px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full border border-yellow-200">ডেমো</span>
           )}
           <button 
             onClick={() => isAdmin ? setIsAdmin(false) : setShowLogin(true)}
             className={`p-2 rounded-full transition-colors ${isAdmin ? 'bg-indigo-100 text-indigo-600 shadow-sm' : 'text-slate-300 hover:text-slate-500'}`}
           >
             {isAdmin ? <Unlock size={18} /> : <Lock size={18} />}
           </button>
        </div>
      </div>

      {isAdmin && (
         <div className="mb-4 bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-start gap-3">
             <div className="bg-indigo-100 p-2 rounded-full text-indigo-600 mt-0.5">
               <Edit3 size={16} />
             </div>
             <div>
               <p className="text-sm font-bold text-indigo-900">অ্যাডমিন ড্যাশবোর্ড</p>
               <p className="text-xs text-indigo-600 mt-1">টেবিলে ক্লিক করে তথ্য এডিট করুন।</p>
             </div>
         </div>
      )}

      {/* VIEW 2: ALL UNITS SUMMARY LIST */}
      {showSummaryList ? (
        <div className="animate-in slide-in-from-right duration-300">
             <div className="flex items-center gap-3 mb-4">
                 <button 
                  onClick={() => setShowSummaryList(false)}
                  className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200 transition-colors active:scale-95"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-800">সকল ইউনিট হিসাব</h2>
                    <p className="text-xs text-primary-600 font-medium">অর্থবছর: {selectedYear}</p>
                </div>
             </div>

             {/* Year Selection Tabs - Added for All Units Summary */}
             <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-100 flex mb-4">
                <button 
                    onClick={() => setSelectedYear(2025)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${selectedYear === 2025 ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <CalendarDays size={16} /> ২০২৫
                </button>
                <button 
                    onClick={() => setSelectedYear(2026)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${selectedYear === 2026 ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <CalendarDays size={16} /> ২০২৬
                </button>
            </div>

             {/* Replaced Summary Card matching the Dashboard design */}
            <div 
                className="mb-6 relative overflow-hidden rounded-2xl shadow-lg border border-white/10 p-5 text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #6a11cb, #2575fc)' }}
            >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <TrendingUp size={100} />
                </div>
                
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-semibold text-indigo-100 flex items-center gap-2">
                        <Wallet size={18} />
                        সর্বমোট হিসাব ({selectedYear})
                    </h3>
                </div>
                
                <div className="grid grid-cols-3 divide-x divide-white/20">
                    <div className="pr-4">
                        <p className="text-[10px] text-indigo-200 font-medium uppercase mb-1">মোট ইউনিট</p>
                        <p className="text-lg font-bold">{ALL_UNITS.length}টি</p>
                    </div>
                    <div className="px-4 text-center">
                        <p className="text-[10px] text-indigo-200 font-medium uppercase mb-1">মোট জমা</p>
                        <p className="text-lg font-bold">৳ {grandTotalCollected.toLocaleString()}</p>
                    </div>
                    <div className="pl-4 text-right">
                        <p className="text-[10px] text-red-200 font-medium uppercase mb-1">মোট বাকি</p>
                        <p className="text-lg font-bold text-red-100">৳ {grandTotalDue.toLocaleString()}</p>
                    </div>
                </div>
            </div>

             {/* Search Bar */}
             <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                type="text" 
                placeholder="ইউনিট খুঁজুন..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-primary-500 transition-all shadow-sm"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="py-3 pl-4 text-left text-xs font-bold text-slate-500 uppercase">ইউনিট</th>
                                <th className="py-3 text-center text-xs font-bold text-slate-500 uppercase">মোট জমা</th>
                                <th className="py-3 pr-4 text-right text-xs font-bold text-slate-500 uppercase">মোট বাকি</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUnitsData.map((data, idx) => (
                                <tr 
                                    key={idx} 
                                    onClick={() => setSelectedUnit(data.unit)}
                                    className="hover:bg-slate-50 transition-colors cursor-pointer active:bg-slate-100 group"
                                >
                                    <td className="py-3 pl-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1.5 rounded-lg text-sm">{data.unit}</span>
                                            <ArrowUpRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </td>
                                    <td className="py-3 text-center">
                                        <span className={`text-sm font-semibold ${data.collected > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                                            {data.collected > 0 ? `৳ ${data.collected.toLocaleString()}` : '-'}
                                        </span>
                                    </td>
                                    <td className="py-3 pr-4 text-right">
                                        {data.due > 0 ? (
                                            <span className="text-sm font-bold text-red-500">৳ {data.due.toLocaleString()}</span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                                <CheckCircle2 size={10} /> পরিশোধিত
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      ) : (
        // VIEW 3: MAIN GRID DASHBOARD
        <div>
            {/* Year Selection Tabs */}
            <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-100 flex mb-6">
                <button 
                    onClick={() => setSelectedYear(2025)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${selectedYear === 2025 ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <CalendarDays size={16} /> ২০২৫
                </button>
                <button 
                    onClick={() => setSelectedYear(2026)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${selectedYear === 2026 ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <CalendarDays size={16} /> ২০২৬
                </button>
            </div>

            {/* Grand Summary Box (All Units) - CLICKABLE */}
            <div 
                onClick={() => setShowSummaryList(true)}
                className="mb-6 relative overflow-hidden rounded-2xl shadow-lg border border-white/10 p-5 text-white cursor-pointer active:scale-[0.98] transition-all group"
                style={{ background: 'linear-gradient(135deg, #6a11cb, #2575fc)' }}
            >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingUp size={100} />
                </div>
                
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-semibold text-indigo-100 flex items-center gap-2">
                        <Wallet size={18} />
                        সকল ইউনিট হিসাব ({selectedYear})
                    </h3>
                    <div className="bg-white/20 p-1 rounded-lg">
                        <ListFilter size={16} />
                    </div>
                </div>
                
                <div className="grid grid-cols-3 divide-x divide-white/20">
                    <div className="pr-4">
                        <p className="text-[10px] text-indigo-200 font-medium uppercase mb-1">ফ্ল্যাটের ধরন</p>
                        <p className="text-lg font-bold">সকল</p>
                    </div>
                    <div className="px-4 text-center">
                        <p className="text-[10px] text-indigo-200 font-medium uppercase mb-1">মোট জমা</p>
                        <p className="text-lg font-bold">৳ {grandTotalCollected.toLocaleString()}</p>
                    </div>
                    <div className="pl-4 text-right">
                        <p className="text-[10px] text-red-200 font-medium uppercase mb-1">মোট বাকি</p>
                        <p className="text-lg font-bold text-red-100">৳ {grandTotalDue.toLocaleString()}</p>
                    </div>
                </div>
                <p className="text-[10px] text-indigo-200 mt-3 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    বিস্তারিত দেখতে ক্লিক করুন
                </p>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                type="text" 
                placeholder="ইউনিট খুঁজুন (যেমন: 2A)" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-primary-500 transition-all shadow-sm"
                />
            </div>

            <div className="flex justify-between items-center mb-4 px-1">
                <p className="text-sm font-semibold text-slate-600">সকল ইউনিট ({ALL_UNITS.length})</p>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{selectedYear}</span>
            </div>

            {/* Grid View */}
            <div className="grid grid-cols-3 gap-3">
                {filteredUnitsData.map((data) => (
                <button
                    key={data.unit}
                    onClick={() => setSelectedUnit(data.unit)}
                    className="group relative bg-white border border-slate-200 hover:border-primary-500 rounded-xl p-4 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-all active:scale-95"
                >
                    <span className="text-lg font-bold text-slate-700 group-hover:text-primary-600">{data.unit}</span>
                    <span className="text-[10px] text-slate-400 mt-1">বিবরণ দেখুন</span>
                    
                    {/* Real-time Status Indicator */}
                    <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${data.due > 0 ? 'bg-red-500' : 'bg-green-500'}`}></span>
                </button>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};