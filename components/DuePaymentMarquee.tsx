import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const MONTHS_BN = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

export const DuePaymentMarquee: React.FC = () => {
  const [dueUnits, setDueUnits] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDueUnits = async () => {
      const now = new Date();
      const currentMonth = MONTHS_BN[now.getMonth()];
      const currentYear = now.getFullYear();

      try {
        // Fetch all payments for current month/year
        const { data, error } = await supabase
          .from('payments')
          .select('unit_text, amount')
          .eq('month_name', currentMonth)
          .eq('year_num', currentYear);

        if (error) throw error;

        // Get all units that HAVE paid (amount > 0)
        const paidUnits = new Set(data?.filter(p => p.amount > 0 && p.due === 0).map(p => p.unit_text) || []);
        const partialUnits = new Set(data?.filter(p => p.amount > 0 && p.due > 0).map(p => p.unit_text) || []);

        // Define all units
        const FLOORS = [2, 3, 4, 5, 6, 7, 8, 9, 10];
        const UNITS_PER_FLOOR = ['A', 'B', 'C'];
        const ALL_UNITS = FLOORS.flatMap(f => UNITS_PER_FLOOR.map(u => `${f}${u}`));

        // Filter units that haven't paid fully
        const unpaid = ALL_UNITS.filter(unit => !paidUnits.has(unit));
        setDueUnits(unpaid);
      } catch (err) {
        console.error('Error fetching due units:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDueUnits();

    // Subscribe to changes
    const channel = supabase
      .channel('payments_due_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
        fetchDueUnits();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading || dueUnits.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-red-100 dark:bg-red-900/30 p-1.5 rounded-lg text-red-600 dark:text-red-400">
            <AlertCircle size={18} />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">বকেয়া সার্ভিস চার্জ (চলতি মাস)</h3>
        </div>
        <span className="text-[10px] font-bold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
          {dueUnits.length} টি ইউনিট বাকি
        </span>
      </div>

      <div className="relative flex overflow-hidden">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ 
            duration: Math.max(dueUnits.length * 2, 10), 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="flex items-center gap-4 py-1"
        >
          {dueUnits.map((unit) => (
            <div key={unit} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-600 shrink-0">
              <span className="text-xs font-black text-slate-800 dark:text-white">{unit}</span>
              <span className="text-[10px] font-bold text-red-500 dark:text-red-400">বকেয়া</span>
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {dueUnits.map((unit) => (
            <div key={`${unit}-dup`} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-600 shrink-0">
              <span className="text-xs font-black text-slate-800 dark:text-white">{unit}</span>
              <span className="text-[10px] font-bold text-red-500 dark:text-red-400">বকেয়া</span>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};
