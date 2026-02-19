import React, { useState } from 'react';
import { Building2, Phone, MapPin, ChevronRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { APP_NAME, MENU_ITEMS } from './constants';
import { ViewState } from './types';
import NoticeBoard from './components/NoticeBoard';
import BottomNav from './components/BottomNav';
import Assistant from './components/Assistant';
import { ServiceChargeView } from './components/ServiceChargeView';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('HOME');

  const renderContent = () => {
    switch (currentView) {
      case 'SERVICE_CHARGE':
        return <ServiceChargeView />;
      
      case 'DESCO':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 border-l-4 border-yellow-500 pl-3">ডেসকো প্রিপেইড</h2>
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-6 rounded-2xl shadow-lg text-white">
              <p className="text-yellow-100 text-sm mb-1">মিটার নং: ৮৮৯৯-৩৩২২-১১০</p>
              <h3 className="text-3xl font-bold mb-4">১২৪.৫০ ইউনিট</h3>
              <div className="flex justify-between items-end">
                <span className="bg-white/20 px-3 py-1 rounded-lg text-xs backdrop-blur-sm">ব্যালেন্স: ৳৮৫০</span>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                   <User size={20} />
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
               <h3 className="font-semibold text-gray-700 mb-3">দ্রুত রিচার্জ</h3>
               <div className="grid grid-cols-3 gap-3">
                 {[500, 1000, 2000].map(amount => (
                   <button key={amount} className="border border-gray-200 py-2 rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition text-sm font-medium">
                     ৳{amount}
                   </button>
                 ))}
               </div>
            </div>
          </div>
        );

      case 'CONTACT':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 border-l-4 border-slate-600 pl-3">জরুরী যোগাযোগ</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               {[
                 { name: 'ম্যানেজার (রহিম সাহেব)', phone: '০১৭১১-০০০০০০', role: 'ম্যানেজমেন্ট' },
                 { name: 'সিকিউরিটি গেট', phone: '০১৯১১-২২৩৩৪৪', role: 'নিরাপত্তা' },
                 { name: 'লিফট মেইনটেনেন্স', phone: '০১৮১১-৫৫৬৬৭৭', role: 'টেকনিক্যাল' },
               ].map((contact, i) => (
                 <div key={i} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <div>
                      <h4 className="font-semibold text-gray-800">{contact.name}</h4>
                      <p className="text-xs text-gray-500">{contact.role}</p>
                    </div>
                    <a href={`tel:${contact.phone}`} className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center hover:bg-green-200 transition">
                      <Phone size={18} />
                    </a>
                 </div>
               ))}
            </div>
          </div>
        );
      
      case 'MENU':
      case 'HOME':
      default:
        return (
          <div className="space-y-6">
            {/* Hero Card for Home */}
            {currentView === 'HOME' && (
              <div className="relative h-48 rounded-3xl overflow-hidden shadow-lg group">
                <img 
                  src="https://picsum.photos/800/400" 
                  alt="Building" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
                  <h2 className="text-white text-2xl font-bold">{APP_NAME}</h2>
                  <p className="text-gray-300 text-sm flex items-center gap-1 mt-1">
                    <MapPin size={14} /> মিরপুর ডিওএইচএস, ঢাকা
                  </p>
                </div>
              </div>
            )}

            {/* Grid Menu */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 px-1">
                {currentView === 'MENU' ? 'সকল সেবা' : 'কুইক অ্যাক্সেস'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {MENU_ITEMS.map((item) => (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentView(item.view)}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-3 relative overflow-hidden group"
                  >
                    <div className={`w-12 h-12 ${item.color} bg-opacity-10 text-opacity-100 rounded-xl flex items-center justify-center text-white shadow-sm`}>
                      <item.icon size={24} className={`${item.color.replace('bg-', 'text-')}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">{item.label}</h4>
                      <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{item.description}</p>
                    </div>
                    {/* Hover Effect */}
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary-100 rounded-2xl transition-colors pointer-events-none" />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Recent Activity Section (Only Home) */}
            {currentView === 'HOME' && (
              <div className="pb-4">
                <div className="flex justify-between items-center mb-3 px-1">
                  <h3 className="text-lg font-bold text-gray-800">সর্বশেষ লেনদেন</h3>
                  <button className="text-xs text-primary-600 font-medium flex items-center">
                    সব দেখুন <ChevronRight size={12} />
                  </button>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
                  {[1, 2].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border-b border-gray-50 last:border-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                        <User size={18} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-800">সার্ভিস চার্জ (এপ্রিল)</h4>
                        <p className="text-[10px] text-gray-400">১০ মে, ২০২৪ • ৩:৩০ অপরাহ্ন</p>
                      </div>
                      <span className="text-sm font-bold text-red-500">-৳৩,৫০০</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto bg-gray-50 relative shadow-2xl">
      {/* Top Header - Fixed */}
      <header className="fixed top-0 left-0 right-0 max-w-md mx-auto z-40 bg-white border-b border-gray-200 transition-all duration-300 shadow-sm">
        <div className="px-5 py-4 flex items-center justify-start">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-200 shrink-0">
              <Building2 className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-teal-800 leading-normal pb-0.5">
                {APP_NAME}
              </h1>
              <p className="text-[11px] text-gray-900 font-bold leading-none -mt-1 tracking-tight">
                House #755, Holan Tower, Ward No. 48,<br/>Holan, Dakshinkhan, Dhaka - 1230
              </p>
            </div>
          </div>
        </div>
        {currentView === 'HOME' && <NoticeBoard />}
      </header>

      {/* Main Content Area */}
      <main 
        className={`px-5 transition-all duration-300 ${
          currentView === 'HOME' ? 'pt-[132px]' : 'pt-[95px]'
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Gemini Assistant - Only visible on HOME view */}
      <Assistant isVisible={currentView === 'HOME'} />

      {/* Bottom Navigation */}
      <BottomNav currentView={currentView} setView={setCurrentView} />
    </div>
  );
};

export default App;