import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building2, Plus, Minus, Landmark, Wallet, Lock, X, Check, Unlock, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const EDIT_PIN = "1966";

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
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // PIN Protection State
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [newTx, setNewTx] = useState({
    bankId: '',
    type: 'deposit' as 'deposit' | 'withdraw',
    amount: '',
    note: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('bank_accounts').select('*, bank_transactions(*)');
      if (error) {
        console.error('Error fetching bank accounts', error);
      } else if (data && data.length > 0) {
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

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const { bankId, type, amount, note } = newTx;
    if (!bankId || !amount || parseInt(amount) <= 0) {
      alert('সবগুলো তথ্য সঠিকভাবে দিন');
      return;
    }

    const amt = parseInt(amount);
    const bank = banks.find(b => b.id === bankId);
    if (!bank) return;

    const newBalance = type === 'deposit' ? bank.balance + amt : bank.balance - amt;

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
      amount: amt,
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

    setIsAddingTransaction(false);
    setNewTx({ bankId: '', type: 'deposit', amount: '', note: '' });
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

  const totalBalance = banks.reduce((sum, bank) => sum + bank.balance, 0);

  if (loading) return null;

  const selectedBank = banks.find(b => b.id === selectedBankId);

  if (selectedBankId && selectedBank) {
    return (
      <div className="min-h-screen bg-slate-50 pb-20">
        {/* Header */}
        <div className="bg-white sticky top-0 z-20 border-b border-slate-200 shadow-sm">
          <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedBankId(null)}
                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 active:scale-95 transition-transform"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-lg font-bold text-slate-800">{selectedBank.name}</h1>
                <p className="text-xs text-slate-500">লেনদেনের বিবরণ</p>
              </div>
            </div>
            <button 
              onClick={() => isAuthorized ? setIsAuthorized(false) : setShowPinModal(true)}
              className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-all border ${isAuthorized ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
            >
              {isAuthorized ? <Unlock size={18} /> : <Lock size={18} />}
            </button>
          </div>
        </div>

        <div className="max-w-md mx-auto p-4 space-y-6">
          {/* PIN Modal */}
          {showPinModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <div 
                onClick={() => setShowPinModal(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <div 
                className="relative w-full max-w-[300px] bg-white rounded-2xl shadow-2xl p-8 border border-slate-100"
              >
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Lock size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">নিরাপত্তা পিন</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">এডিট মোড আনলক করুন</p>
                </div>

                <form onSubmit={handlePinSubmit} className="space-y-6">
                  <input 
                    type="password"
                    maxLength={4}
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      setPinError(false);
                    }}
                    autoFocus
                    className={`w-full text-center text-3xl tracking-[0.5em] font-bold py-3 bg-slate-50 border-2 rounded-xl focus:outline-none transition-all ${pinError ? 'border-rose-500' : 'border-slate-100 focus:border-emerald-500'}`}
                    placeholder="••••"
                  />
                  {pinError && (
                    <p className="text-[10px] text-center font-bold text-rose-500 uppercase">ভুল পিন কোড!</p>
                  )}
                  <button 
                    type="submit"
                    className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm active:scale-95 transition-transform"
                  >
                    আনলক করুন
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Quick Add Section (Inline Style) */}
          {isAuthorized && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                  <Plus className="text-emerald-500" size={18} /> লেনদেন যোগ করুন
                </h3>
                <button 
                  onClick={() => setIsAddingTransaction(!isAddingTransaction)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isAddingTransaction ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}
                >
                  {isAddingTransaction ? <X size={16} /> : <Plus size={16} />}
                </button>
              </div>

              {isAddingTransaction && (
                <form 
                  onSubmit={handleQuickAdd} 
                  className="space-y-4 overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewTx({...newTx, type: 'deposit', bankId: selectedBank.id})}
                      className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${newTx.type === 'deposit' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}
                    >
                      <Plus size={14} /> জমা
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTx({...newTx, type: 'withdraw', bankId: selectedBank.id})}
                      className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${newTx.type === 'withdraw' ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}
                    >
                      <Minus size={14} /> উত্তোলন
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">টাকার পরিমাণ</label>
                    <input 
                      required
                      type="number"
                      placeholder="৳ ০.০০"
                      value={newTx.amount}
                      onChange={e => setNewTx({...newTx, amount: e.target.value, bankId: selectedBank.id})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-lg font-black focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">বিবরণ (ঐচ্ছিক)</label>
                    <input 
                      type="text"
                      placeholder="বিবরণ লিখুন"
                      value={newTx.note}
                      onChange={e => setNewTx({...newTx, note: e.target.value, bankId: selectedBank.id})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                  >
                    <Check size={16} /> নিশ্চিত করুন
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Bank Balance Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-4">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${selectedBank.id === 'islami' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
              <Landmark size={40} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">বর্তমান ব্যালেন্স</p>
              <h2 className="text-4xl font-black text-slate-900">৳ {selectedBank.balance.toLocaleString()}</h2>
            </div>

            <div className="grid grid-cols-2 w-full gap-3 pt-4">
              <button 
                onClick={() => handleTransaction(selectedBank.id, 'deposit')}
                className="flex items-center justify-center gap-2 py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-sm active:scale-95 transition-transform"
              >
                <Plus size={18} /> জমা
              </button>
              <button 
                onClick={() => handleTransaction(selectedBank.id, 'withdraw')}
                className="flex items-center justify-center gap-2 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm active:scale-95 transition-transform"
              >
                <Minus size={18} /> উত্তোলন
              </button>
            </div>
          </div>

          {/* Transaction History */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider px-2">সাম্প্রতিক লেনদেন</h3>
            {selectedBank.transactions.length > 0 ? (
              <div className="space-y-3">
                {selectedBank.transactions.map(tx => (
                  <div key={tx.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'deposit' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {tx.type === 'deposit' ? <Plus size={16} /> : <Minus size={16} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">{tx.type === 'deposit' ? 'জমা' : 'উত্তোলন'}</p>
                        <p className="text-[11px] text-slate-500">{new Date(tx.date).toLocaleDateString('bn-BD')} {tx.note && `• ${tx.note}`}</p>
                      </div>
                    </div>
                    <p className={`text-base font-black ${tx.type === 'deposit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tx.type === 'deposit' ? '+' : '-'} ৳ {tx.amount.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-slate-200">
                <p className="text-sm text-slate-400">কোনো লেনদেন পাওয়া যায়নি</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white sticky top-0 z-20 border-b border-slate-200 shadow-sm">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 active:scale-95 transition-transform"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-800">ব্যাংক হিসাব</h1>
              <p className="text-xs text-slate-500">ব্যাংক নির্বাচন করুন</p>
            </div>
          </div>
          <button 
            onClick={() => isAuthorized ? setIsAuthorized(false) : setShowPinModal(true)}
            className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-all border ${isAuthorized ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
          >
            {isAuthorized ? <Unlock size={18} /> : <Lock size={18} />}
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* PIN Modal */}
        {/* PIN Modal */}
        {showPinModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div 
              onClick={() => setShowPinModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <div 
              className="relative w-full max-w-[300px] bg-white rounded-2xl shadow-2xl p-8 border border-slate-100"
            >
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Lock size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">নিরাপত্তা পিন</h3>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">এডিট মোড আনলক করুন</p>
              </div>

              <form onSubmit={handlePinSubmit} className="space-y-6">
                <input 
                  type="password"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  autoFocus
                  className={`w-full text-center text-3xl tracking-[0.5em] font-bold py-3 bg-slate-50 border-2 rounded-xl focus:outline-none transition-all ${pinError ? 'border-rose-500' : 'border-slate-100 focus:border-emerald-500'}`}
                  placeholder="••••"
                />
                {pinError && (
                  <p className="text-[10px] text-center font-bold text-rose-500 uppercase">ভুল পিন কোড!</p>
                )}
                <button 
                  type="submit"
                  className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm active:scale-95 transition-transform"
                >
                  আনলক করুন
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Quick Add Section (Inline Style) */}
        {isAuthorized && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                <Plus className="text-emerald-500" size={18} /> লেনদেন যোগ করুন
              </h3>
              <button 
                onClick={() => setIsAddingTransaction(!isAddingTransaction)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isAddingTransaction ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}
              >
                {isAddingTransaction ? <X size={16} /> : <Plus size={16} />}
              </button>
            </div>

            {isAddingTransaction && (
              <form 
                onSubmit={handleQuickAdd} 
                className="space-y-4 overflow-hidden"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ব্যাংক নির্বাচন করুন</label>
                  <select 
                    required
                    value={newTx.bankId}
                    onChange={e => setNewTx({...newTx, bankId: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:border-emerald-500 outline-none transition-all"
                  >
                    <option value="">নির্বাচন করুন</option>
                    {banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewTx({...newTx, type: 'deposit'})}
                    className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${newTx.type === 'deposit' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}
                  >
                    <Plus size={14} /> জমা
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTx({...newTx, type: 'withdraw'})}
                    className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${newTx.type === 'withdraw' ? 'bg-rose-500 text-white shadow-lg shadow-rose-100' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}
                  >
                    <Minus size={14} /> উত্তোলন
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">টাকার পরিমাণ</label>
                  <input 
                    required
                    type="number"
                    placeholder="৳ ০.০০"
                    value={newTx.amount}
                    onChange={e => setNewTx({...newTx, amount: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-lg font-black focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">বিবরণ (ঐচ্ছিক)</label>
                  <input 
                    type="text"
                    placeholder="বিবরণ লিখুন"
                    value={newTx.note}
                    onChange={e => setNewTx({...newTx, note: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                >
                  <Check size={16} /> নিশ্চিত করুন
                </button>
              </form>
            )}
          </div>
        )}

        {/* Bank List - Vertical Stack */}
        <div className="space-y-3">
          {banks.map(bank => (
            <button
              key={bank.id}
              onClick={() => setSelectedBankId(bank.id)}
              className="w-full bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between active:scale-[0.98] transition-all hover:border-indigo-200 group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${bank.id === 'islami' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'}`}>
                  <Landmark size={28} />
                </div>
                <div className="text-left overflow-hidden">
                  <h3 className="text-lg font-bold text-slate-800 whitespace-nowrap truncate">{bank.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ট্যাপ করে বিস্তারিত দেখুন</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-colors">
                <ArrowLeft size={16} className="rotate-180" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
