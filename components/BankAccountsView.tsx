import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building2, Plus, Minus, Landmark, Wallet } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface BankAccountsViewProps {
  onBack: () => void;
}

interface BankTransaction {
  id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  date: string;
  note: string;
}

interface BankAccount {
  id: string;
  name: string;
  balance: number;
  transactions: BankTransaction[];
}

const initialBanks: BankAccount[] = [
  {
    id: 'islami',
    name: 'ইসলামী ব্যাংক',
    balance: 0,
    transactions: []
  },
  {
    id: 'ific',
    name: 'আইএফআইসি ব্যাংক',
    balance: 0,
    transactions: []
  }
];

export const BankAccountsView: React.FC<BankAccountsViewProps> = ({ onBack }) => {
  const [banks, setBanks] = useState<BankAccount[]>(initialBanks);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('bank_accounts').select('*, bank_transactions(*)');
      if (error) {
        console.error('Error fetching bank accounts', error);
      } else if (data) {
        setBanks(data.map(b => ({
          ...b,
          transactions: b.bank_transactions.map(t => ({
            ...t,
            date: t.date
          }))
        })));
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('holan_tower_bank_accounts', JSON.stringify(banks));
    }
  }, [banks, loading]);

  const handleTransaction = async (bankId: string, type: 'deposit' | 'withdraw') => {
    const amountStr = prompt(`কত টাকা ${type === 'deposit' ? 'জমা' : 'উত্তোলন'} করতে চান?`);
    if (!amountStr) return;
    
    const amount = parseInt(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert('সঠিক টাকার পরিমাণ দিন');
      return;
    }

    const note = prompt('বিবরণ (ঐচ্ছিক):') || '';
    
    const bank = banks.find(b => b.id === bankId);
    if (!bank) return;

    const newBalance = type === 'deposit' ? bank.balance + amount : bank.balance - amount;

    const { error: updateError } = await supabase
      .from('bank_accounts')
      .update({ balance: newBalance })
      .eq('id', bankId);

    if (updateError) {
      console.error('Error updating balance', updateError);
      return;
    }

    const newTransaction = {
      id: Date.now().toString(),
      bank_id: bankId,
      type,
      amount,
      date: new Date().toISOString(),
      note
    };

    const { error: insertError } = await supabase
      .from('bank_transactions')
      .insert(newTransaction);

    if (insertError) {
      console.error('Error inserting transaction', insertError);
      return;
    }

    setBanks(prev => prev.map(b => {
      if (b.id === bankId) {
        return {
          ...b,
          balance: newBalance,
          transactions: [newTransaction, ...b.transactions]
        };
      }
      return b;
    }));
  };

  const totalBalance = banks.reduce((sum, bank) => sum + bank.balance, 0);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white sticky top-0 z-20 border-b border-slate-200 shadow-sm">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 active:scale-95 transition-transform"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-800">ব্যাংক হিসাব</h1>
            <p className="text-xs text-slate-500">সকল ব্যাংক অ্যাকাউন্টের বিবরণ</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Total Balance Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
            <Landmark size={24} />
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">সর্বমোট ব্যাংক ব্যালেন্স</p>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">৳ {totalBalance.toLocaleString()}</h2>
        </div>

        {/* Bank Accounts */}
        <div className="space-y-4">
          {banks.map(bank => (
            <div key={bank.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Wallet size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{bank.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">বর্তমান ব্যালেন্স</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-slate-800">৳ {bank.balance.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleTransaction(bank.id, 'deposit')}
                    className="flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-sm active:scale-95 transition-transform"
                  >
                    <Plus size={16} /> টাকা জমা
                  </button>
                  <button 
                    onClick={() => handleTransaction(bank.id, 'withdraw')}
                    className="flex items-center justify-center gap-2 py-2.5 bg-rose-50 text-rose-700 rounded-xl font-bold text-sm active:scale-95 transition-transform"
                  >
                    <Minus size={16} /> টাকা উত্তোলন
                  </button>
                </div>
              </div>

              {/* Recent Transactions */}
              {bank.transactions.length > 0 && (
                <div className="bg-slate-50/50 p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">সাম্প্রতিক লেনদেন</p>
                  <div className="space-y-3">
                    {bank.transactions.slice(0, 3).map(tx => (
                      <div key={tx.id} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'deposit' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                            {tx.type === 'deposit' ? <Plus size={14} /> : <Minus size={14} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-700">{tx.type === 'deposit' ? 'জমা' : 'উত্তোলন'}</p>
                            <p className="text-[10px] text-slate-500">{new Date(tx.date).toLocaleDateString('bn-BD')} {tx.note && `• ${tx.note}`}</p>
                          </div>
                        </div>
                        <p className={`text-sm font-bold ${tx.type === 'deposit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {tx.type === 'deposit' ? '+' : '-'} ৳ {tx.amount.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
