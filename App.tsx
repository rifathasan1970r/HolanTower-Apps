import React, { useState, useEffect } from 'react';
import { Building2, Phone, MapPin, ChevronRight, User, CloudSun, Calendar, Zap, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { APP_NAME_BN, APP_NAME_EN, MENU_ITEMS, TRANSLATIONS } from './constants';
import { ViewState } from './types';
import NoticeBoard from './components/NoticeBoard';
import BottomNav from './components/BottomNav';
import Assistant from './components/Assistant';
import { ServiceChargeView } from './components/ServiceChargeView';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();
      
      let greetingKey: keyof typeof t.greeting = 'morning';
      if (hour < 12) greetingKey = 'morning';
      else if (hour < 17) greetingKey = 'afternoon';
      else if (hour < 20) greetingKey = 'evening';
      else greetingKey = 'night';
      
      setGreeting(t.greeting[greetingKey]);

      const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      // Use 'bn-BD' for Bangla, 'en-US' for English
      const locale = lang === 'bn' ? 'bn-BD' : 'en-US';
      setCurrentDate(now.toLocaleDateString(locale, options));
      
      setCurrentTime(now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }));
    };

    updateTime();
    const timer = setInterval(updateTime, 1000); // Update every second for clock
    return () => clearInterval(timer);
  }, [lang, t]);

  const toggleLanguage = () => {
    setLang(prev => prev === 'bn' ? 'en' : 'bn');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'SERVICE_CHARGE':
        return <ServiceChargeView lang={lang} />;
      
      case 'DESCO':
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-gray-800 border-l-4 border-yellow-500 pl-3">
                {lang === 'bn' ? 'ডেসকো প্রিপেইড' : 'Desco Prepaid'}
            </h2>
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-xl text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5">
                 <Zap size={150} />
               </div>
              <p className="text-yellow-400 text-xs font-medium mb-1 tracking-wider uppercase">
                  {lang === 'bn' ? 'মিটার নম্বর' : 'Meter Number'}
              </p>
              <p className="text-xl font-mono mb-6 tracking-widest">8899 3322 110</p>
              
              <div className="flex flex-col gap-1">
                 <span className="text-slate-400 text-xs">
                     {lang === 'bn' ? 'বর্তমান ব্যালেন্স' : 'Current Balance'}
                 </span>
                 <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">৳৮৫০</span>
                    <span className="text-sm font-medium text-slate-400">.০০</span>
                 </div>
              </div>

              <div className="mt-6 flex gap-3">
                 <div className="bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                    <p className="text-[10px] text-slate-400">
                        {lang === 'bn' ? 'ইউনিট অবশিষ্ট' : 'Remaining Units'}
                    </p>
                    <p className="font-bold text-sm">
                        {lang === 'bn' ? '১২৪.৫০' : '124.50'}
                    </p>
                 </div>
                 <div className="bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                    <p className="text-[10px] text-slate-400">
                        {lang === 'bn' ? 'সর্বশেষ রিচার্জ' : 'Last Recharge'}
                    </p>
                    <p className="font-bold text-sm">
                        {lang === 'bn' ? '১০ মে' : '10 May'}
                    </p>
                 </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
               <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                 <Zap size={18} className="text-yellow-500" />
                 {lang === 'bn' ? 'দ্রুত রিচার্জ' : 'Quick Recharge'}
               </h3>
               <div className="grid grid-cols-3 gap-3">
                 {[500, 1000, 2000].map(amount => (
                   <button key={amount} className="border border-gray-200 py-3 rounded-xl hover:bg-yellow-50 hover:border-yellow-400 transition-all text-sm font-bold text-gray-600 active:scale-95 shadow-sm">
                     ৳{amount}
                   </button>
                 ))}
               </div>
            </div>
          </div>
        );

      case 'CONTACT':
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-gray-800 border-l-4 border-indigo-600 pl-3">
                {lang === 'bn' ? 'জরুরী যোগাযোগ' : 'Emergency Contact'}
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
               {[
                 { 
                    name: lang === 'bn' ? 'ম্যানেজার (রহিম সাহেব)' : 'Manager (Mr. Rahim)', 
                    phone: '01700000000', 
                    role: lang === 'bn' ? 'ম্যানেজমেন্ট' : 'Management', 
                    color: 'bg-indigo-100 text-indigo-600' 
                 },
                 { 
                    name: lang === 'bn' ? 'সিকিউরিটি গেট' : 'Security Gate', 
                    phone: '01911223344', 
                    role: lang === 'bn' ? 'নিরাপত্তা' : 'Security', 
                    color: 'bg-rose-100 text-rose-600' 
                 },
                 { 
                    name: lang === 'bn' ? 'লিফট মেইনটেনেন্স' : 'Lift Maintenance', 
                    phone: '01811556677', 
                    role: lang === 'bn' ? 'টেকনিক্যাল' : 'Technical', 
                    color: 'bg-amber-100 text-amber-600' 
                 },
                 { 
                    name: lang === 'bn' ? 'ফায়ার সার্ভিস' : 'Fire Service', 
                    phone: '999', 
                    role: lang === 'bn' ? 'জরুরী সেবা' : 'Emergency', 
                    color: 'bg-red-500 text-white' 
                 },
               ].map((contact, i) => (
                 <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 ${contact.color} rounded-full flex items-center justify-center shadow-sm`}>
                          <Phone size={18} />
                       </div>
                       <div>
                         <h4 className="font-bold text-gray-800 text-sm">{contact.name}</h4>
                         <p className="text-[11px] text-gray-500 font-medium">{contact.role}</p>
                       </div>
                    </div>
                    <a 
                      href={`tel:${contact.phone}`} 
                      className="px-4 py-2 bg-gray-100 rounded-lg text-xs font-bold text-gray-600 hover:bg-green-500 hover:text-white transition-all active:scale-95"
                    >
                      {lang === 'bn' ? 'কল করুন' : 'Call'}
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
          <div className="space-y-6 pb-6">
            {/* Premium Hero Dashboard for Home */}
            {currentView === 'HOME' && (
              <div className="relative rounded-3xl overflow-hidden shadow-2xl group transition-all duration-500">
                {/* Background with Gradient and Noise */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800"></div>
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                
                {/* Content */}
                <div className="relative z-10 p-6 text-white">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-xl font-light opacity-90 mb-1">{greeting},</h2>
                      <h1 className="text-2xl font-bold tracking-tight">{t.role}</h1>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20 shadow-lg">
                      <CloudSun size={24} className="text-yellow-300" />
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="bg-teal-500/30 p-2.5 rounded-xl">
                           <Calendar size={20} className="text-white" />
                        </div>
                        <div>
                           <p className="text-[10px] opacity-70 uppercase tracking-wider font-semibold">{t.dateLabel}</p>
                           <p className="text-sm font-bold leading-tight">{currentDate}</p>
                        </div>
                     </div>
                     <div className="text-right border-l border-white/10 pl-4">
                        <p className="text-2xl font-bold font-mono tracking-wider">{currentTime}</p>
                     </div>
                  </div>
                </div>
              </div>
            )}

            {/* Grid Menu */}
            <div>
              <div className="flex justify-between items-end mb-4 px-1">
                 <h3 className="text-lg font-bold text-slate-800">
                   {currentView === 'MENU' ? t.allServices : t.quickAccess}
                 </h3>
                 {currentView === 'HOME' && (
                   <button onClick={() => setCurrentView('MENU')} className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors">
                     {t.seeAll}
                   </button>
                 )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {MENU_ITEMS.slice(0, currentView === 'HOME' ? 4 : undefined).map((item, index) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentView(item.view)}
                    className="relative bg-white p-4 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-white overflow-hidden group text-left h-32 flex flex-col justify-between"
                  >
                    {/* Background Gradient Blob */}
                    <div className={`absolute -right-4 -top-4 w-20 h-20 bg-gradient-to-br ${item.gradient || 'from-gray-100 to-gray-200'} opacity-10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500`}></div>
                    
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient || 'from-gray-500 to-gray-700'} flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110`}>
                      <item.icon size={20} />
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm mb-0.5 group-hover:text-primary-700 transition-colors">
                          {lang === 'bn' ? item.label : item.labelEn}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium line-clamp-1">
                          {lang === 'bn' ? item.description : item.descriptionEn}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Recent Activity Section (Only Home) */}
            {currentView === 'HOME' && (
              <div className="pb-4">
                <div className="flex justify-between items-center mb-3 px-1">
                  <h3 className="text-lg font-bold text-gray-800">{t.recentTransactions}</h3>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
                  {[1, 2].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border-b border-gray-50 last:border-0 hover:bg-slate-50 transition-colors rounded-lg">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                        <User size={18} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-800">
                            {lang === 'bn' ? 'সার্ভিস চার্জ (এপ্রিল)' : 'Service Charge (April)'}
                        </h4>
                        <p className="text-[10px] text-gray-400 font-medium">
                            {lang === 'bn' ? '১০ মে, ২০২৪ • ৩:৩০ অপরাহ্ন' : '10 May, 2024 • 3:30 PM'}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-md">-৳৩,৫০০</span>
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
    <div className="min-h-screen pb-24 max-w-md mx-auto bg-[#F8FAFC] relative shadow-2xl overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[20%] bg-teal-200/20 blur-[100px] rounded-full"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[20%] bg-indigo-200/20 blur-[100px] rounded-full"></div>
      </div>

      {/* Top Header - Fixed */}
      <header className="fixed top-0 left-0 right-0 max-w-md mx-auto z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 transition-all duration-300">
        <div className="px-5 py-3 flex items-center justify-start">
          <div className="flex items-center gap-3 text-left">
            <div className="w-9 h-9 bg-gradient-to-tr from-teal-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-200 shrink-0 transform rotate-3">
              <Building2 className="text-white" size={18} />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-800 leading-tight">
                {lang === 'bn' ? APP_NAME_BN : APP_NAME_EN}
              </h1>
              <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                <MapPin size={10} /> {t.location}
              </p>
            </div>
          </div>
          <div className="ml-auto">
             <button 
                onClick={toggleLanguage}
                className="h-9 px-3 rounded-full bg-slate-100 border border-slate-200 flex items-center gap-2 text-slate-600 hover:bg-slate-200 hover:text-primary-700 transition-all active:scale-95"
             >
                <Languages size={16} />
                <span className="text-xs font-bold">{lang === 'bn' ? 'বাংলা' : 'English'}</span>
             </button>
          </div>
        </div>
        {currentView === 'HOME' && <NoticeBoard lang={lang} />}
      </header>

      {/* Main Content Area */}
      <main 
        className={`px-5 relative z-10 transition-all duration-300 ${
          currentView === 'HOME' ? 'pt-[125px]' : 'pt-[90px]'
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Gemini Assistant - Only visible on HOME view */}
      <Assistant isVisible={currentView === 'HOME'} lang={lang} />

      {/* Bottom Navigation */}
      <BottomNav currentView={currentView} setView={setCurrentView} lang={lang} />
    </div>
  );
};

export default App;