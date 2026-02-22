import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft, Search, CheckCircle2, XCircle, Clock, Users, Home, PieChart, CalendarDays, TrendingUp, Wallet, ArrowUpRight, ListFilter, RefreshCw, Lock, Unlock, Edit3, Save, X, Grid, Calendar as CalendarIcon, DollarSign, Check } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabaseClient';
import { TRANSLATIONS, FLAT_OWNERS } from '../constants';

// কনফিগারেশন: ২৭টি ইউনিট (ফ্লোর ২ থেকে ১০)
const FLOORS = [2, 3, 4, 5, 6, 7, 8, 9, 10];
const UNITS_PER_FLOOR = ['A', 'B', 'C'];
const ALL_UNITS = FLOORS.flatMap(f => UNITS_PER_FLOOR.map(u => `${f}${u}`));
const SERVICE_CHARGE_AMOUNT = 2000;

// English months array to map logic consistently, UI will use translated array
const MONTHS_LOGIC = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

type Status = 'PAID' | 'DUE' | 'UPCOMING';

interface MonthlyRecord {
  month: string;
  monthIndex: number;
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
  note?: string;
}

interface ServiceChargeViewProps {
  lang?: 'bn' | 'en';
}

export const ServiceChargeView: React.FC<ServiceChargeViewProps> = ({ lang = 'bn' }) => {
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [showSummaryList, setShowSummaryList] = useState<boolean>(false);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Supabase State
  const [dbData, setDbData] = useState<PaymentData[]>([]);
  const [unitsInfo, setUnitsInfo] = useState<Record<string, { is_occupied: boolean, note: string }>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [useMock, setUseMock] = useState<boolean>(false);

  // Admin State
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showLogin, setShowLogin] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [processingUpdate, setProcessingUpdate] = useState<boolean>(false);
  const [editingNote, setEditingNote] = useState<boolean>(false);
  const [noteInput, setNoteInput] = useState<string>('');

  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editModalData, setEditModalData] = useState({
    unit: '',
    month: '',
    year: 2026,
    amount: 2000,
    due: 0,
    day: '1',
    monthName: 'জানুয়ারি',
    yearVal: '2026',
    isDateEnabled: true,
    status: 'PAID' as 'PAID' | 'DUE' | 'UPCOMING'
  });

  const t = TRANSLATIONS[lang];

  // Date Helper
  const getBanglaDate = () => {
    // Just using standard localized date based on lang
    const locale = lang === 'bn' ? 'bn-BD' : 'en-US';
    return new Date().toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }).replace(/,/g, '');
  };

  // Fetch data from Supabase
  const fetchData = async (showLoading = true, fetchUnitsInfo = true) => {
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
      if (fetchUnitsInfo) {
        const { data: uData, error: uError } = await supabase
          .from('units_info')
          .select('*');
        
        if (uError) {
            console.warn("units_info table not found, using default occupancy logic.");
        } else if (uData) {
            const mapping: Record<string, { is_occupied: boolean, note: string }> = {};
            uData.forEach((u: UnitInfo) => mapping[u.unit_text] = { is_occupied: u.is_occupied, note: u.note || '' });
            setUnitsInfo(mapping);
        }
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
      alert('PIN Error!');
    }
  };

  const handleToggleOccupancy = async (unit: string | null) => {
    if (!unit || !isAdmin || processingUpdate) return;
    setProcessingUpdate(true);
    
    const isOccupiedDefault = unit.slice(-1) !== 'B';
    const currentInfo = unitsInfo[unit] || { is_occupied: isOccupiedDefault, note: '' };
    const newVal = !currentInfo.is_occupied;

    // Optimistic update - immediate UI feedback
    setUnitsInfo(prev => ({ ...prev, [unit]: { ...currentInfo, is_occupied: newVal } }));

    try {
        // Use a more robust check-then-act pattern to ensure persistence
        const { data: existing, error: fetchError } = await supabase
            .from('units_info')
            .select('unit_text')
            .eq('unit_text', unit)
            .maybeSingle();

        if (fetchError) throw fetchError;

        let error = null;
        if (existing) {
            const { error: updateError } = await supabase
                .from('units_info')
                .update({ is_occupied: newVal })
                .eq('unit_text', unit);
            error = updateError;
        } else {
            const { error: insertError } = await supabase
                .from('units_info')
                .insert({ unit_text: unit, is_occupied: newVal, note: currentInfo.note });
            error = insertError;
        }

        if (error) {
            console.error("Supabase error updating occupancy:", error);
            // Rollback on error
            setUnitsInfo(prev => ({ ...prev, [unit]: currentInfo }));
        }
    } catch (err) {
        console.error("Error updating occupancy:", err);
        // Rollback on catch
        setUnitsInfo(prev => ({ ...prev, [unit]: currentInfo }));
    } finally {
        setProcessingUpdate(false);
    }
  };

  const startEditing = (unit: string, month: string) => {
    if (!isAdmin) return;
    const existing = dbData.find(d => d.unit_text === unit && d.month_name === month && d.year_num === selectedYear);
    
    const monthIndex = MONTHS_LOGIC.indexOf(month);
    let nextMonthIndex = monthIndex + 1;
    let nextYear = selectedYear;
    if (nextMonthIndex > 11) {
        nextMonthIndex = 0;
        nextYear += 1;
    }
    
    let day = '1';
    let monthName = MONTHS_LOGIC[nextMonthIndex];
    let yearVal = nextYear.toString();
    let isDateEnabled = true;

    if (existing?.paid_date) {
        const parts = existing.paid_date.split(' ');
        if (parts.length >= 3) {
            day = parts[0];
            monthName = parts[1];
            yearVal = parts[2];
        }
    } else if (existing && !existing.paid_date) {
        isDateEnabled = false;
    }

    const isOccupied = unitsInfo[unit]?.is_occupied ?? (unit.slice(-1) !== 'B');
    const defaultAmount = isOccupied ? 2000 : 500;

    let initialStatus: 'PAID' | 'DUE' | 'UPCOMING' = 'PAID';
    let initialAmount = defaultAmount;
    let initialDue = 0;

    if (existing) {
        if (existing.amount > 0) {
            initialStatus = 'PAID';
            initialAmount = existing.amount;
            initialDue = existing.due;
        } else if (existing.due > 0) {
            initialStatus = 'DUE';
            initialAmount = 0;
            initialDue = existing.due;
            if (!existing.paid_date) isDateEnabled = false;
        } else {
            initialStatus = 'UPCOMING';
            initialAmount = 0;
            initialDue = 0;
            isDateEnabled = false;
        }
    } else {
        const now = new Date();
        const currentRealYear = now.getFullYear();
        const currentRealMonthIdx = now.getMonth();
        const isFuture = selectedYear > currentRealYear || (selectedYear === currentRealYear && monthIndex > currentRealMonthIdx);
        
        if (isFuture) {
            initialStatus = 'UPCOMING';
            initialAmount = 0;
            initialDue = 0;
            isDateEnabled = false;
        } else {
            initialStatus = 'DUE';
            initialAmount = 0;
            initialDue = defaultAmount;
            isDateEnabled = false;
        }
    }

    setEditModalData({
      unit,
      month,
      year: selectedYear,
      amount: initialAmount,
      due: initialDue,
      day,
      monthName,
      yearVal,
      isDateEnabled,
      status: initialStatus
    });
    setIsEditModalOpen(true);
  };

  const handleModalSave = async () => {
    if (processingUpdate) return;
    setProcessingUpdate(true);

    const { unit, month, year, amount, due, day, monthName, yearVal, isDateEnabled, status } = editModalData;
    // Construct date string
    const paidDate = (isDateEnabled && status !== 'UPCOMING') ? `${day} ${monthName} ${yearVal}` : '';
    const finalAmount = status === 'UPCOMING' ? 0 : amount;
    const finalDue = status === 'UPCOMING' ? 0 : due;

    try {
      // ১. প্রথমে চেক করি এই মাস ও ইউনিটের ডাটা সার্ভারে আগে থেকেই আছে কিনা
      const { data: existingData, error: fetchError } = await supabase
        .from('payments')
        .select('id')
        .eq('unit_text', unit)
        .eq('month_name', month)
        .eq('year_num', year)
        .maybeSingle();

      if (fetchError) throw fetchError;

      let error = null;

      if (existingData) {
        // UPDATE (যদি ডাটা থাকে)
        const res = await supabase
          .from('payments')
          .update({
            amount: finalAmount,
            due: finalDue,
            paid_date: paidDate
          })
          .eq('id', existingData.id);
        error = res.error;
      } else {
        // INSERT (যদি ডাটা না থাকে)
        const newRecord = {
          unit_text: unit,
          month_name: month,
          year_num: year,
          amount: finalAmount,
          due: finalDue,
          paid_date: paidDate
        };

        const res = await supabase
          .from('payments')
          .insert(newRecord);
        error = res.error;
      }

      if (error) throw error;

      // রিফ্রেশ পেমেন্ট ডাটা শুধুমাত্র (বসবাসের ধরন যাতে রিভার্ট না হয়)
      await fetchData(false, false); 
      setIsEditModalOpen(false);
      
    } catch (err: any) {
      console.error("Error saving payment:", err);
      alert(`${t.saveFail}: ${err.message}`);
    } finally {
      setProcessingUpdate(false);
    }
  };

  const handleQuickStatusToggle = async (unit: string, month: string) => {
      // For grid view, we can still use quick toggle or open modal?
      // User said "মাসে ক্লিক করলে ডেটা এন্ট্রি জন্য পপআপ উইন্ডো আসবে"
      // Assuming this applies to the detailed view table mainly.
      // But for consistency, let's make grid view also open modal if admin.
      if (!isAdmin) return;
      startEditing(unit, month);
  };

  const handleSaveNote = async () => {
    if (!isAdmin || processingUpdate || !selectedUnit) return;
    setProcessingUpdate(true);
    
    const isOccupiedDefault = selectedUnit.slice(-1) !== 'B';
    const currentInfo = unitsInfo[selectedUnit] || { is_occupied: isOccupiedDefault, note: '' };

    try {
        const { error } = await supabase
            .from('units_info')
            .upsert({ unit_text: selectedUnit, is_occupied: currentInfo.is_occupied, note: noteInput }, { onConflict: 'unit_text' });

        if (error) throw error;
        setUnitsInfo(prev => ({ ...prev, [selectedUnit]: { ...currentInfo, note: noteInput } }));
        setEditingNote(false);
    } catch (err) {
        console.error("Error saving note:", err);
        // Fallback to local state if column doesn't exist
        setUnitsInfo(prev => ({ ...prev, [selectedUnit]: { ...currentInfo, note: noteInput } }));
        setEditingNote(false);
    } finally {
        setProcessingUpdate(false);
    }
  };

  // Generate Data
  const getUnitData = (unit: string): MonthlyRecord[] => {
    const now = new Date();
    const currentRealYear = now.getFullYear();
    const currentRealMonthIdx = now.getMonth();

    return MONTHS_LOGIC.map((month, index) => {
      let paymentRecord: PaymentData | undefined;
      
      paymentRecord = dbData.find(
        d => d.unit_text === unit && d.month_name === month && d.year_num === selectedYear
      );

      // UI display month string
      const displayMonth = t.months[index];

      if (paymentRecord) {
        let recStatus: Status = 'DUE';
        if (paymentRecord.amount > 0) recStatus = 'PAID';
        else if (paymentRecord.amount === 0 && paymentRecord.due === 0) recStatus = 'UPCOMING';

        return {
          month: displayMonth, // Use translated month for display
          monthIndex: index,
          date: paymentRecord.paid_date || '-',
          amount: paymentRecord.amount,
          due: paymentRecord.due,
          status: recStatus
        };
      }

      const isOccupied = unitsInfo[unit]?.is_occupied ?? (unit.slice(-1) !== 'B');
      const defaultAmount = isOccupied ? 2000 : 500;

      const isFuture = selectedYear > currentRealYear || (selectedYear === currentRealYear && index > currentRealMonthIdx);
      if (isFuture) {
        return { month: displayMonth, monthIndex: index, date: '-', amount: 0, due: 0, status: 'UPCOMING' };
      } else {
        return { month: displayMonth, monthIndex: index, date: '-', amount: 0, due: defaultAmount, status: 'DUE' };
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
  }, [selectedYear, dbData, unitsInfo, lang]); // Added lang dependency to re-calculate month names

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
                <span className="text-[9px] font-bold text-green-700">{t.paid}</span>
            </div>
        );
      case 'DUE':
        return (
            <div className="flex flex-col items-center justify-center">
                <div className="bg-red-100 text-red-600 p-1 rounded-full mb-0.5">
                    <XCircle size={14} />
                </div>
                <span className="text-[9px] font-bold text-red-700">{t.due}</span>
            </div>
        );
      default:
        return (
            <div className="flex flex-col items-center justify-center">
                <div className="bg-slate-100 text-slate-400 p-1 rounded-full mb-0.5">
                    <Clock size={14} />
                </div>
                <span className="text-[9px] font-medium text-slate-500">{t.upcoming}</span>
            </div>
        );
    }
  };

  // Login Modal
  const loginModalContent = showLogin && (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl animate-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800">{t.adminLogin}</h3>
          <button onClick={() => setShowLogin(false)} className="text-slate-400 hover:text-red-500">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-slate-500 mb-4">{t.loginPrompt}:</p>
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
          {t.loginBtn}
        </button>
      </div>
    </div>
  );

  const handleStatusChange = (newStatus: 'PAID' | 'DUE' | 'UPCOMING') => {
      const isOccupied = unitsInfo[editModalData.unit]?.is_occupied ?? (editModalData.unit.slice(-1) !== 'B');
      const defaultAmount = isOccupied ? 2000 : 500;

      if (newStatus === 'PAID') {
          setEditModalData(prev => ({ ...prev, status: newStatus, amount: defaultAmount, due: 0, isDateEnabled: true }));
      } else if (newStatus === 'DUE') {
          setEditModalData(prev => ({ ...prev, status: newStatus, amount: 0, due: defaultAmount, isDateEnabled: false }));
      } else if (newStatus === 'UPCOMING') {
          setEditModalData(prev => ({ ...prev, status: newStatus, amount: 0, due: 0, isDateEnabled: false }));
      }
  };

  // Payment Edit Modal
  const paymentEditModalContent = isEditModalOpen && (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">পেমেন্ট আপডেট</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              ইউনিট: <span className="font-bold text-slate-700">{editModalData.unit}</span> | মাস: <span className="font-bold text-slate-700">{editModalData.month} {editModalData.year}</span>
            </p>
          </div>
          <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-red-500 bg-slate-50 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
            {/* Status Selection */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                    onClick={() => handleStatusChange('PAID')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${editModalData.status === 'PAID' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    পরিশোধিত
                </button>
                <button 
                    onClick={() => handleStatusChange('DUE')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${editModalData.status === 'DUE' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    বকেয়া
                </button>
                <button 
                    onClick={() => handleStatusChange('UPCOMING')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${editModalData.status === 'UPCOMING' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    আসন্ন
                </button>
            </div>

            {editModalData.status !== 'UPCOMING' && (
                <>
                    {/* Amount & Due Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">{t.amount}</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                                <input 
                                    type="number" 
                                    value={editModalData.amount}
                                    onChange={(e) => setEditModalData({...editModalData, amount: Number(e.target.value)})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-8 pr-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">{t.due}</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                                <input 
                                    type="number" 
                                    value={editModalData.due}
                                    onChange={(e) => setEditModalData({...editModalData, due: Number(e.target.value)})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-8 pr-3 text-sm font-bold text-red-600 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Date Selection Row */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-bold text-slate-600">পেমেন্ট তারিখ</label>
                            <button 
                                onClick={() => setEditModalData({...editModalData, isDateEnabled: !editModalData.isDateEnabled})}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${editModalData.isDateEnabled ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}
                            >
                                {editModalData.isDateEnabled ? 'অন আছে' : 'অফ আছে'}
                            </button>
                        </div>
                        
                        {editModalData.isDateEnabled && (
                            <div className="grid grid-cols-3 gap-2">
                                {/* Day Dropdown */}
                                <select 
                                    value={editModalData.day}
                                    onChange={(e) => setEditModalData({...editModalData, day: e.target.value})}
                                    className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
                                >
                                    {Array.from({length: 31}, (_, i) => i + 1).map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>

                                {/* Month Dropdown */}
                                <select 
                                    value={editModalData.monthName}
                                    onChange={(e) => setEditModalData({...editModalData, monthName: e.target.value})}
                                    className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
                                >
                                    {MONTHS_LOGIC.map((m) => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>

                                {/* Year Dropdown */}
                                <select 
                                    value={editModalData.yearVal}
                                    onChange={(e) => setEditModalData({...editModalData, yearVal: e.target.value})}
                                    className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
                                >
                                    <option value="2025">2025</option>
                                    <option value="2026">2026</option>
                                    <option value="2027">2027</option>
                                </select>
                            </div>
                        )}
                    </div>
                </>
            )}
            
            {editModalData.status === 'UPCOMING' && (
                <div className="py-8 text-center bg-slate-50 rounded-xl border border-slate-100">
                    <Clock size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-bold text-slate-600">এই মাসের বিল এখনো তৈরি হয়নি</p>
                    <p className="text-xs text-slate-400 mt-1">তারিখ বা টাকার পরিমাণ প্রয়োজন নেই</p>
                </div>
            )}
        </div>

        <div className="mt-8 flex gap-3">
            <button 
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
            >
                বাতিল
            </button>
            <button 
                onClick={handleModalSave}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
                <Save size={16} />
                সেভ করুন
            </button>
        </div>
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
    const upcomingCount = records.filter(r => r.status === 'UPCOMING').length;
    
    const isOccupied = unitsInfo[selectedUnit]?.is_occupied ?? (selectedUnit.slice(-1) !== 'B'); 
    const occupancyStatus = isOccupied ? t.occupied : t.vacant;
    const unitNote = unitsInfo[selectedUnit]?.note || '';

    // Important: Changing occupancy status should NOT affect already saved payment records.
    // getUnitData handles this by checking if a payment record exists first.

    // Summary Modal
    const summaryModalContent = showSummaryModal && selectedUnit && (
      <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowSummaryModal(false)}>
        <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden" onClick={e => e.stopPropagation()}>
          {/* Decorative background */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full blur-2xl opacity-60 pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-50 rounded-full blur-2xl opacity-60 pointer-events-none"></div>
          
          <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-2.5 rounded-xl shadow-md shadow-indigo-200">
                          <PieChart size={22} className="text-white" />
                      </div>
                      <div>
                          <h3 className="text-lg font-bold text-slate-800 tracking-tight">সামারি রিপোর্ট</h3>
                          <p className="text-xs font-medium text-slate-500">{selectedYear} সাল</p>
                      </div>
                  </div>
                  <button onClick={() => setShowSummaryModal(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-500 p-1.5 rounded-full transition-colors">
                      <X size={16} />
                  </button>
              </div>

              <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 text-slate-600">
                          <Home size={18} className="text-indigo-500" />
                          <span className="text-sm font-medium">ফ্ল্যাট নম্বর</span>
                      </div>
                      <span className="text-base font-bold text-slate-800">{selectedUnit}</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 text-slate-600">
                          <Users size={18} className="text-blue-500" />
                          <span className="text-sm font-medium">ফ্ল্যাট মালিক</span>
                      </div>
                      <span className="text-sm font-bold text-slate-800 text-right">{FLAT_OWNERS.find(f => f.flat === selectedUnit)?.name || 'অজানা'}</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 text-slate-600">
                          <Grid size={18} className={occupancyStatus === t.occupied ? 'text-green-500' : 'text-orange-500'} />
                          <span className="text-sm font-medium">বসবাসের ধরন</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${occupancyStatus === t.occupied ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {occupancyStatus}
                        </span>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 text-white shadow-lg shadow-slate-900/20">
                          <p className="text-[10px] text-slate-300 font-medium uppercase tracking-wider mb-1">মোট টাকা</p>
                          <p className="font-bold text-lg">৳ {totalAmount.toLocaleString()}</p>
                      </div>
                      <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-4 text-white shadow-lg shadow-red-500/20">
                          <p className="text-[10px] text-red-100 font-medium uppercase tracking-wider mb-1">মোট বকেয়া</p>
                          <p className="font-bold text-lg">৳ {totalDue.toLocaleString()}</p>
                      </div>
                  </div>
              </div>
              
              <button 
                  onClick={() => setShowSummaryModal(false)}
                  className="w-full mt-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors text-sm"
              >
                  বন্ধ করুন
              </button>
          </div>
        </div>
      </div>
    );

    return (
      <div key={`${selectedUnit}-${selectedYear}`} className="pb-24 animate-in slide-in-from-right duration-500 bg-slate-50 min-h-screen relative">
        {loginModalContent}
        {paymentEditModalContent}
        {summaryModalContent}
        
        {/* Navigation Header Section */}
        <div className="bg-white sticky top-[60px] z-10 border-b border-slate-100 shadow-sm transition-all">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
                 <button 
                  onClick={() => setSelectedUnit(null)}
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors py-1 group"
                >
                  <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                  <span className="text-base font-bold">{t.back}</span>
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
                    <h2 className="text-3xl font-bold text-slate-800">{t.unit} {selectedUnit}</h2>
                    <p className="text-sm font-bold text-primary-600 mt-1">
                      {FLAT_OWNERS.find(f => f.flat === selectedUnit)?.name || 'Unknown'}
                    </p>
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
             <Edit3 size={12} /> {t.editInfo}
           </div>
        )}

        {/* Year Selection Tabs */}
        <div className="px-4 pt-4 pb-0">
             <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-100 flex">
                <button 
                    onClick={() => setSelectedYear(2025)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${selectedYear === 2025 ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <CalendarDays size={16} /> 2025
                </button>
                <button 
                    onClick={() => setSelectedYear(2026)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${selectedYear === 2026 ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <CalendarDays size={16} /> 2026
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
                    disabled={!isAdmin || processingUpdate}
                    className={`text-center px-1 flex flex-col items-center justify-center transition-all ${isAdmin && !processingUpdate ? 'active:scale-95 cursor-pointer' : 'opacity-80 cursor-not-allowed'}`}
                >
                    <p className="text-[10px] text-white/80 font-medium uppercase mb-1">{t.occupancy}</p>
                    <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${occupancyStatus === t.occupied ? 'bg-white text-blue-600' : 'bg-white/90 text-orange-600'}`}>
                        {processingUpdate ? (
                            <RefreshCw size={12} className="animate-spin" />
                        ) : (
                            <>
                                {occupancyStatus === t.occupied ? <Users size={12} /> : <Home size={12} />}
                                {occupancyStatus}
                            </>
                        )}
                    </div>
                </button>
                <div className="text-center px-1 flex flex-col items-center justify-center">
                    <p className="text-[10px] text-white/80 font-medium uppercase mb-1">{t.totalAmount}</p>
                    <p className="font-bold text-white text-base">৳ {totalAmount.toLocaleString()}</p>
                </div>
                <div className="text-center px-1 flex flex-col items-center justify-center">
                    <p className="text-[10px] text-white/80 font-medium uppercase mb-1">{t.totalDue}</p>
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
                            <th className="py-3 pl-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[28%]">{t.monthDate}</th>
                            <th className="py-3 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[22%]">{t.amount}</th>
                            <th className="py-3 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[22%]">{t.due}</th>
                            <th className="py-3 pr-3 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider w-[28%]">{t.status}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {records.map((record, idx) => {
                            const isEditable = isAdmin && !processingUpdate;
                            // For DB operations, we need the original month name (Bangla)
                            const dbMonth = MONTHS_LOGIC[record.monthIndex];

                            return (
                              <tr 
                                key={idx} 
                                className={`
                                  transition-all duration-200 
                                  ${record.status === 'DUE' ? 'bg-red-50/10' : ''}
                                  ${isEditable ? 'hover:bg-indigo-50 active:bg-indigo-100/50' : 'hover:bg-slate-50/50'}
                                `}
                              >
                                  <td onClick={() => isEditable && startEditing(selectedUnit, dbMonth)} className="py-3 pl-3 align-middle cursor-pointer">
                                      <div className="font-bold text-slate-800 text-sm">{record.month}</div>
                                      <div className="text-[10px] text-slate-400 font-medium mt-0.5 whitespace-nowrap">{record.date}</div>
                                  </td>
                                  <td onClick={() => isEditable && startEditing(selectedUnit, dbMonth)} className="py-3 align-middle text-center cursor-pointer">
                                      <div className={`font-semibold text-sm ${record.amount > 0 ? 'text-slate-700' : 'text-slate-300'}`}>
                                          {record.amount > 0 ? `৳${record.amount}` : '-'}
                                      </div>
                                  </td>
                                  <td onClick={() => isEditable && startEditing(selectedUnit, dbMonth)} className="py-3 align-middle text-center cursor-pointer">
                                        <div className={`font-semibold text-sm ${record.due > 0 ? 'text-red-600' : 'text-slate-300'}`}>
                                          {record.due > 0 ? `৳${record.due}` : '-'}
                                        </div>
                                  </td>
                                  <td className="py-3 pr-3 align-middle flex justify-end">
                                      <div onClick={() => isEditable && startEditing(selectedUnit, dbMonth)}>
                                        {isAdmin ? (
                                            <div className={`px-2 py-1.5 rounded-lg text-[9px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                                            record.status === 'PAID' 
                                                ? 'bg-green-100 text-green-700 border-green-200 shadow-sm' 
                                                : record.status === 'DUE'
                                                ? 'bg-white text-red-500 border-red-200 shadow-sm'
                                                : 'bg-slate-100 text-slate-500 border-slate-200 shadow-sm'
                                            }`}>
                                            {record.status === 'PAID' ? <CheckCircle2 size={10} /> : record.status === 'DUE' ? <XCircle size={10} /> : <Clock size={10} />}
                                            {record.status === 'PAID' ? t.paid : record.status === 'DUE' ? t.due : t.upcoming}
                                            </div>
                                        ) : (
                                            getStatusElement(record.status)
                                        )}
                                      </div>
                                  </td>
                              </tr>
                          );
                        })}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t border-slate-200">
                        <tr>
                            <td className="py-3 pl-3 text-sm font-bold text-slate-700">{t.total}</td>
                            <td className="py-3 text-center text-sm font-bold text-slate-700">৳ {totalAmount.toLocaleString()}</td>
                            <td className="py-3 text-center text-sm font-bold text-red-600">{totalDue > 0 ? `৳ ${totalDue.toLocaleString()}` : '-'}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            {/* Premium Note Box */}
            <div className="mb-6 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 to-orange-500"></div>
                <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="bg-amber-100/50 p-2 rounded-xl text-amber-600">
                                <Edit3 size={18} strokeWidth={2.5} />
                            </div>
                            <h4 className="text-base font-bold text-slate-800 tracking-tight">জরুরী নোট</h4>
                        </div>
                        {isAdmin && !editingNote && (
                            <button 
                                onClick={() => { setNoteInput(unitNote); setEditingNote(true); }}
                                className="text-[11px] font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100"
                            >
                                <Edit3 size={12} /> এডিট
                            </button>
                        )}
                    </div>
                    
                    <div className="pl-11 pr-2">
                        {editingNote ? (
                            <div className="animate-in fade-in zoom-in-95 duration-200">
                                <textarea 
                                    value={noteInput}
                                    onChange={(e) => setNoteInput(e.target.value)}
                                    className="w-full bg-slate-50 border border-amber-200/60 rounded-xl p-3.5 text-sm text-slate-700 focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 min-h-[100px] resize-none transition-all"
                                    placeholder="এখানে জরুরী নোট লিখুন..."
                                    autoFocus
                                />
                                <div className="flex justify-end gap-2 mt-3">
                                    <button 
                                        onClick={() => setEditingNote(false)}
                                        className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                                    >
                                        বাতিল
                                    </button>
                                    <button 
                                        onClick={handleSaveNote}
                                        className="px-5 py-2 text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 rounded-xl transition-all shadow-md shadow-amber-500/20 active:scale-95"
                                    >
                                        সেভ করুন
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div 
                                className={`text-sm leading-relaxed ${unitNote ? 'text-slate-700' : 'text-slate-400 italic'} min-h-[40px] ${isAdmin ? 'cursor-pointer' : ''}`}
                                onClick={() => {
                                    if (isAdmin) {
                                        setNoteInput(unitNote);
                                        setEditingNote(true);
                                    }
                                }}
                            >
                                {unitNote || (isAdmin ? 'নোট যোগ করতে এখানে ক্লিক করুন...' : 'কোনো নোট নেই')}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment Status Graph */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-3">
                    <PieChart size={20} className="text-indigo-600" />
                    <h3 className="font-bold text-slate-800 text-lg">{t.paymentStatus} ({selectedYear})</h3>
                </div>
                
                {/* Premium Pie Chart */}
                <div className="flex flex-col items-center justify-center mb-2">
                    <div className="w-full h-[250px] cursor-pointer" onClick={() => setShowSummaryModal(true)}>
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                                <Pie
                                    data={[
                                        { name: t.paid, value: paidCount, color: '#22c55e' },
                                        { name: t.due, value: dueCount, color: '#ef4444' },
                                        { name: t.upcoming, value: upcomingCount, color: '#cbd5e1' },
                                    ].filter(item => item.value > 0)}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={65}
                                    dataKey="value"
                                    labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                                    label={({ cx, cy, midAngle, innerRadius, outerRadius, value, name }) => {
                                        const RADIAN = Math.PI / 180;
                                        const radius = outerRadius + 20;
                                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                        
                                        return (
                                            <text x={x} y={y} fill="#334155" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-bold">
                                                {`${name} ${value}`}
                                            </text>
                                        );
                                    }}
                                >
                                    {[
                                        { name: t.paid, value: paidCount, color: '#22c55e' },
                                        { name: t.due, value: dueCount, color: '#ef4444' },
                                        { name: t.upcoming, value: upcomingCount, color: '#cbd5e1' },
                                    ].filter(item => item.value > 0).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </RechartsPieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Status List */}
                    <div className="w-full grid grid-cols-3 gap-3 mt-4">
                        <div className="bg-green-50/50 border border-green-100 rounded-xl p-3 flex flex-col items-center justify-center">
                            <span className="text-xl font-black text-green-600">{paidCount}</span>
                            <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">{t.paid}</span>
                        </div>
                        <div className="bg-red-50/50 border border-red-100 rounded-xl p-3 flex flex-col items-center justify-center">
                            <span className="text-xl font-black text-red-600">{dueCount}</span>
                            <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider">{t.due}</span>
                        </div>
                        <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 flex flex-col items-center justify-center">
                            <span className="text-xl font-black text-slate-600">{upcomingCount}</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t.upcoming}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Month Grid Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-2">
                    <CalendarDays size={18} className="text-primary-600" />
                    <h3 className="font-bold text-slate-700">{t.month} গ্রিড ({selectedYear})</h3>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {records.map((record, idx) => {
                        const dbMonth = MONTHS_LOGIC[record.monthIndex];
                        return (
                        <div
                            key={idx}
                            onClick={() => isAdmin && !processingUpdate && handleQuickStatusToggle(selectedUnit, dbMonth)}
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
                                <span className="text-[9px] mt-0.5 font-bold opacity-90">{t.due}</span>
                            )}
                             {record.status === 'UPCOMING' && (
                                <span className="text-[9px] mt-0.5 font-bold opacity-90">{t.upcoming}</span>
                            )}
                        </div>
                    );
                    })}
                </div>
            </div>
        </div>
      </div>
    );
  }

  // VIEW 2 & 3 Combined Logic Wrapper
  return (
    <div className="px-4 py-6 pb-24 animate-in slide-in-from-bottom-4 duration-500">
      {loginModalContent}
      {paymentEditModalContent}
      
      {/* Loading State */}
      {loading && (
         <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
             <RefreshCw className="animate-spin text-primary-500" size={40} />
         </div>
      )}

      {/* Main Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">{t.serviceCharge}</h2>
        <div className="flex items-center gap-2">
           {useMock && (
             <span className="text-[9px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full border border-yellow-200">{t.demo}</span>
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
               <p className="text-sm font-bold text-indigo-900">{t.adminDashboard}</p>
               <p className="text-xs text-indigo-600 mt-1">{t.editInfo}</p>
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
                    <h2 className="text-xl font-bold text-slate-800">{t.allUnitsCalc}</h2>
                    <p className="text-xs text-primary-600 font-medium">{t.financialYear}: {selectedYear}</p>
                </div>
             </div>

             {/* Year Selection Tabs - Added for All Units Summary */}
             <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-100 flex mb-4">
                <button 
                    onClick={() => setSelectedYear(2025)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${selectedYear === 2025 ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <CalendarDays size={16} /> 2025
                </button>
                <button 
                    onClick={() => setSelectedYear(2026)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${selectedYear === 2026 ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <CalendarDays size={16} /> 2026
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
                        {t.total} {t.status} ({selectedYear})
                    </h3>
                </div>
                
                <div className="grid grid-cols-3 divide-x divide-white/20">
                    <div className="pr-4">
                        <p className="text-[10px] text-indigo-200 font-medium uppercase mb-1">{t.unit}</p>
                        <p className="text-lg font-bold">{ALL_UNITS.length}</p>
                    </div>
                    <div className="px-4 text-center">
                        <p className="text-[10px] text-indigo-200 font-medium uppercase mb-1">{t.totalCollected}</p>
                        <p className="text-lg font-bold">৳ {grandTotalCollected.toLocaleString()}</p>
                    </div>
                    <div className="pl-4 text-right">
                        <p className="text-[10px] text-red-200 font-medium uppercase mb-1">{t.totalDue}</p>
                        <p className="text-lg font-bold text-red-100">৳ {grandTotalDue.toLocaleString()}</p>
                    </div>
                </div>
            </div>

             {/* Search Bar */}
             <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                type="text" 
                placeholder={t.searchUnit}
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
                                <th className="py-3 pl-4 text-left text-xs font-bold text-slate-500 uppercase">{t.unit}</th>
                                <th className="py-3 text-center text-xs font-bold text-slate-500 uppercase">{t.totalCollected}</th>
                                <th className="py-3 pr-4 text-right text-xs font-bold text-slate-500 uppercase">{t.totalDue}</th>
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
                                            <div className="flex flex-col">
                                              <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1.5 rounded-lg text-sm w-fit">{data.unit}</span>
                                              <span className="text-[10px] font-bold text-slate-400 mt-1 ml-1">
                                                {FLAT_OWNERS.find(f => f.flat === data.unit)?.name}
                                              </span>
                                            </div>
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
                                                <CheckCircle2 size={10} /> {t.paid}
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
                    <CalendarDays size={16} /> 2025
                </button>
                <button 
                    onClick={() => setSelectedYear(2026)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${selectedYear === 2026 ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <CalendarDays size={16} /> 2026
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
                        {t.allUnitsCalc} ({selectedYear})
                    </h3>
                    <div className="bg-white/20 p-1 rounded-lg">
                        <ListFilter size={16} />
                    </div>
                </div>
                
                <div className="grid grid-cols-3 divide-x divide-white/20">
                    <div className="pr-4">
                        <p className="text-[10px] text-indigo-200 font-medium uppercase mb-1">{t.flatType}</p>
                        <p className="text-lg font-bold">{t.all}</p>
                    </div>
                    <div className="px-4 text-center">
                        <p className="text-[10px] text-indigo-200 font-medium uppercase mb-1">{t.totalCollected}</p>
                        <p className="text-lg font-bold">৳ {grandTotalCollected.toLocaleString()}</p>
                    </div>
                    <div className="pl-4 text-right">
                        <p className="text-[10px] text-red-200 font-medium uppercase mb-1">{t.totalDue}</p>
                        <p className="text-lg font-bold text-red-100">৳ {grandTotalDue.toLocaleString()}</p>
                    </div>
                </div>
                <p className="text-[10px] text-indigo-200 mt-3 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {t.details}
                </p>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                type="text" 
                placeholder={t.searchUnit}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-primary-500 transition-all shadow-sm"
                />
            </div>

            <div className="flex justify-between items-center mb-4 px-1">
                <p className="text-sm font-semibold text-slate-600">{t.all} {t.unit} ({ALL_UNITS.length})</p>
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
                    <span className="text-[10px] font-bold text-slate-400 mt-1">
                      {FLAT_OWNERS.find(f => f.flat === data.unit)?.name || '-'}
                    </span>
                    
                    {/* Real-time Status Indicator */}
                    <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${data.due > 0 ? 'bg-red-500' : 'bg-green-500'}`}></span>
                </button>
                ))}
                {filteredUnitsData.length === 0 && (
                    <div className="col-span-3 py-8 text-center text-slate-400 text-sm">
                        কোনো ইউনিট পাওয়া যায়নি
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};
