import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, ChevronDown, ChevronUp, Search, Check } from 'lucide-react';
import { FLAT_OWNERS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

interface DescoInfoViewProps {
  onBack: () => void;
}

export const DescoInfoView: React.FC<DescoInfoViewProps> = ({ onBack }) => {
  const [showModal, setShowModal] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const filteredData = FLAT_OWNERS.filter(item => 
    item.flat.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.account.includes(searchTerm)
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setToastMsg('কপি হয়েছে');
    setTimeout(() => setToastMsg(''), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col max-w-md mx-auto">
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 relative z-20">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-bold text-slate-800">ডেসকো মিটারের তথ্য</h2>
      </div>
      
      <div className="flex-1 w-full overflow-hidden relative z-10">
        <iframe 
          src="https://prepaid.desco.org.bd/customer/#/customer-info" 
          className="absolute inset-0 w-full h-full border-none"
          title="Desco Customer Info"
        />
      </div>

      {/* Top Popup Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-[60px] left-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="p-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
              <h3 className="font-bold text-sm text-center">আপনার ডেসকো একাউন্ট নম্বর কপি করুন</h3>
            </div>
            
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors mb-3"
              >
                <span className="font-bold text-slate-700 text-sm">
                  {isExpanded ? 'লিস্ট বন্ধ করুন' : 'লিস্ট দেখুন (২৭ টি ইউনিট)'}
                </span>
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mb-3 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input 
                        type="text" 
                        placeholder="ইউনিট খুঁজুন..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                      {filteredData.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm">
                          <div className="min-w-0 flex-1 mr-2">
                            <div className="flex items-center gap-2">
                              <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-200">{item.flat}</span>
                              <span className="text-[11px] font-bold text-slate-800 truncate">{item.name}</span>
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 mt-0.5">{item.account}</div>
                          </div>
                          <button 
                            onClick={() => handleCopy(item.account)}
                            className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 active:scale-95 transition-all"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-3 text-center">
                <p className="text-[10px] text-slate-500 mb-3 font-medium">
                  Search Customer (with Account/Meter No)
                </p>
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-full bg-slate-800 text-white font-bold py-2.5 rounded-xl hover:bg-slate-900 active:scale-95 transition-all text-sm"
                >
                  ওকে
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 z-[60]"
          >
            <Check size={14} className="text-green-400" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
