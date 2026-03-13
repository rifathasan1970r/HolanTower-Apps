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
  const [currentMonth, setCurrentMonth] = useState('');
  const [currentYear, setCurrentYear] = useState(0);

  useEffect(() => {
    const fetchDueUnits = async () => {
      const now = new Date();
      let monthIndex = now.getMonth() - 1;
      let year = now.getFullYear();
      
      if (monthIndex < 0) {
        monthIndex = 11;
        year -= 1;
      }
      
      const month = MONTHS_BN[monthIndex];
      setCurrentMonth(month);
      setCurrentYear(year);

      try {
        const { data, error } = await supabase
          .from('payments')
          .select('unit_text')
          .eq('year_num', year)
          .eq('month_name', month)
          .gt('due', 0);

        if (error) throw error;

        if (data) {
          const dueList = Array.from(new Set(data
            .map(record => record.unit_text)
            .filter(unit => unit && !unit.endsWith('_P'))));
          setDueUnits(dueList);
        }
      } catch (err) {
        console.error("Error fetching due units for marquee:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDueUnits();

    const channel = supabase
      .channel('public:payments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        () => {
          fetchDueUnits();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-800/80 dark:to-slate-900/40 backdrop-blur-xl rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/20 dark:border-slate-700/50 overflow-hidden shadow-[0_0_20px_rgba(225,29,72,0.1)] dark:shadow-[0_0_20px_rgba(225,29,72,0.15)]"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl text-white shadow-lg ${dueUnits.length > 0 ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/20' : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20'}`}>
            <AlertCircle size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">বকেয়া সার্ভিস চার্জ</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
              {currentMonth} {currentYear}
            </p>
          </div>
        </div>
        <div className={`border px-3 py-1.5 rounded-xl ${dueUnits.length > 0 ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800' : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800'}`}>
          <span className={`text-[11px] font-bold whitespace-nowrap ${dueUnits.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {dueUnits.length > 0 ? `${dueUnits.length} টি বাকি` : 'সব পরিশোধিত'}
          </span>
        </div>
      </div>

      <div className="relative flex overflow-hidden w-full">
        {dueUnits.length > 0 ? (
          <motion.div 
            animate={{ x: ["0%", "-50%"] }}
            transition={{ 
              duration: Math.max(dueUnits.length * 4, 25), 
              repeat: Infinity, 
              ease: "linear",
              repeatType: "loop"
            }}
            className="flex items-center gap-3 py-1 whitespace-nowrap"
          >
            {dueUnits.map((unit) => (
              <div key={unit} className="flex items-center gap-2 bg-white/60 dark:bg-slate-700/40 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200/50 dark:border-slate-600/50 shadow-sm shrink-0">
                <span className="text-xs font-black text-slate-900 dark:text-white">{unit}</span>
                <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400 uppercase tracking-wider">বকেয়া</span>
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {dueUnits.map((unit) => (
              <div key={`${unit}-dup`} className="flex items-center gap-2 bg-white/60 dark:bg-slate-700/40 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200/50 dark:border-slate-600/50 shadow-sm shrink-0">
                <span className="text-xs font-black text-slate-900 dark:text-white">{unit}</span>
                <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400 uppercase tracking-wider">বকেয়া</span>
              </div>
            ))}
          </motion.div>
        ) : (
          <div className="flex items-center justify-center w-full py-2 bg-white/60 dark:bg-slate-700/40 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-600/50">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">এই মাসে কোনো বকেয়া নেই</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
