import React, { useState, useEffect } from 'react';
import { Building2, Phone, MapPin, ChevronRight, User, CloudSun, Calendar, Zap, Key, Bed, Bath, Maximize, AlertTriangle, X, LogOut, Sun, Moon, Sunset, Wrench, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { APP_NAME, MENU_ITEMS, TRANSLATIONS, MENU_NOTICE_TEXT, DESCO_NOTICE_TEXT, SERVICE_CHARGE_NOTICE_TEXT, EMERGENCY_NOTICE_TEXT } from './constants';
import { ViewState } from './types';
import NoticeBoard from './components/NoticeBoard';
import BottomNav from './components/BottomNav';
import Assistant from './components/Assistant';
import { DescoView } from './components/DescoView';
import { DescoInfoView } from './components/DescoInfoView';
import { DescoRulesView } from './components/DescoRulesView';
import { AccountsView } from './components/AccountsView';
import { MapRoutesView } from './components/MapRoutesView';
import { ServiceChargeView } from './components/ServiceChargeView';
import { EmergencyView } from './components/EmergencyView';
import { ToLetView } from './components/ToLetView';
import { WaterBillView } from './components/WaterBillView';
import { LiftInstructionsView } from './components/LiftInstructionsView';
import ImageSlider from './components/ImageSlider';
import { MaintenanceView } from './components/MaintenanceView';
import { SettingsView } from './components/SettingsView';
import { PrayerTimeView } from './components/PrayerTimeView';
import { RechargeRulesView } from './components/RechargeRulesView';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [showSummaryList, setShowSummaryList] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [currentSeconds, setCurrentSeconds] = useState('');
  const [amPm, setAmPm] = useState('');
  const [timeIcon, setTimeIcon] = useState<React.ReactNode>(<CloudSun size={24} className="text-yellow-300" />);
  
  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  // Apply Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      const totalMinutes = hour * 60 + minute;
      
      // 1. Greeting & Icon logic
      if (totalMinutes >= 300 && totalMinutes < 720) { // 5:00 AM – 11:59 AM
        setGreeting('শুভ সকাল');
        setTimeIcon(<Sun size={24} className="text-yellow-300 animate-pulse" />);
      } else if (totalMinutes >= 720 && totalMinutes < 960) { // 12:00 PM – 3:59 PM
        setGreeting('শুভ দুপুর');
        setTimeIcon(<Sun size={24} className="text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]" />);
      } else if (totalMinutes >= 960 && totalMinutes < 1080) { // 4:00 PM – 6:00 PM
        setGreeting('শুভ বিকেল');
        setTimeIcon(<Sunset size={24} className="text-orange-300" />);
      } else if (totalMinutes >= 1080 && totalMinutes < 1170) { // 6:00 PM – 7:30 PM
        setGreeting('শুভ সন্ধ্যা');
        setTimeIcon(<Sunset size={24} className="text-orange-400" />);
      } else { // 7:30 PM – 4:59 AM
        setGreeting('শুভ রাত্রি');
        setTimeIcon(<Moon size={24} className="text-blue-100 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" />);
      }

      const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      setCurrentDate(now.toLocaleDateString('bn-BD', options));
      
      // Time parts
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
      // Example: "05:47:03 AM"
      const [hms, ap] = timeStr.split(' ');
      const [h, m, s] = hms.split(':');
      
      // Convert HH:MM and SS to Bangla digits for consistency with the rest of the app
      const toBanglaDigits = (str: string) => str.replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[parseInt(d)]);
      
      setCurrentTime(toBanglaDigits(`${h}:${m}`));
      setCurrentSeconds(toBanglaDigits(s));
      setAmPm(ap);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Advanced Back Navigation Support
  useEffect(() => {
    // Initialize history state if not already set
    if (!window.history.state || window.history.state.view === undefined) {
      window.history.replaceState({ view: 'BASE' }, '');
      window.history.pushState({ view: 'HOME', unit: null, summary: false }, '');
    }

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      
      if (state) {
        if (state.view === 'BASE') {
          // We hit the bottom of our app history
          setShowExitDialog(true);
          // Push the current view back so we stay in the app
          window.history.pushState({ view: currentView, unit: selectedUnit, summary: showSummaryList }, '');
        } else if (state.view) {
          // Navigate to the view stored in history
          setCurrentView(state.view);
          setSelectedUnit(state.unit !== undefined ? state.unit : null);
          setShowSummaryList(state.summary !== undefined ? !!state.summary : false);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentView, selectedUnit, showSummaryList]);

  // Scroll to top on view or unit change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView, selectedUnit, showSummaryList]);

  // Sync manual navigation with History API
  useEffect(() => {
    const state = window.history.state;
    if (!state || state.view === 'BASE') return;

    const viewChanged = state.view !== currentView;
    const summaryChanged = state.summary !== showSummaryList;
    const unitChanged = state.unit !== selectedUnit;

    // Only push/replace state if something actually changed
    if (viewChanged || summaryChanged || unitChanged) {
      // Rule: When switching/sliding between units, DO NOT create new history entries.
      // If we are already in a unit and we change to another unit, use replaceState.
      const isSlidingUnits = !viewChanged && !summaryChanged && unitChanged && state.unit !== null && selectedUnit !== null;
      
      // Rule: Switching between Grid and Summary List -> replaceState (to keep "All Unit List" as one level)
      const isSwitchingListType = !viewChanged && summaryChanged && !unitChanged && selectedUnit === null;

      if (isSlidingUnits || isSwitchingListType) {
        window.history.replaceState({ view: currentView, unit: selectedUnit, summary: showSummaryList }, '');
      } else {
        window.history.pushState({ view: currentView, unit: selectedUnit, summary: showSummaryList }, '');
      }
    }
  }, [currentView, selectedUnit, showSummaryList]);

  const t = TRANSLATIONS['bn']; // Default to Bangla for now, can be dynamic if needed

  const handleExitApp = () => {
    // Try to close the window
    window.close();
    // If window.close() doesn't work (common in browsers), 
    // we can't do much more than hiding the dialog or showing a message.
    // On Android, if we don't push the state back, the next back press exits.
    setShowExitDialog(false);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'SERVICE_CHARGE':
        return (
          <ServiceChargeView 
            selectedUnit={selectedUnit} 
            onUnitSelect={(unit) => {
              // Rule: From ANY Unit -> Go directly to All Unit List
              // If we are in a unit and want to go back to list, use history.back()
              if (unit === null && selectedUnit !== null) {
                window.history.back();
              } else {
                setSelectedUnit(unit);
              }
            }}
            showSummaryList={showSummaryList}
            onSummaryToggle={(show) => {
              // If we want to treat Grid/Summary as same level, we just set state
              // The useEffect handles replaceState for us
              setShowSummaryList(show);
            }}
          />
        );
      
      case 'DESCO':
        return <DescoView setView={setCurrentView} />;

      case 'DESCO_INFO':
        return <DescoInfoView onBack={() => window.history.back()} />;

      case 'DESCO_RULES':
        return <DescoRulesView />;

      case 'ACCOUNTS':
        return <AccountsView onBack={() => window.history.back()} />;

      case 'MAP_ROUTES':
        return <MapRoutesView onBack={() => window.history.back()} />;

      case 'TO_LET':
        return <ToLetView />;

      case 'EMERGENCY':
        return <EmergencyView />;

      case 'WATER_BILL':
        return <WaterBillView onBack={() => setCurrentView('MENU')} />;

      case 'LIFT_INSTRUCTIONS':
        return <LiftInstructionsView onBack={() => setCurrentView('MENU')} />;

      case 'MAINTENANCE':
        return <MaintenanceView onBack={() => window.history.back()} />;

      case 'SETTINGS':
        return <SettingsView onBack={() => window.history.back()} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
      
      case 'PRAYER_TIME':
        return <PrayerTimeView onBack={() => window.history.back()} />;

      case 'RECHARGE_RULES':
        return <RechargeRulesView onBack={() => window.history.back()} />;

      case 'MENU':
      case 'HOME':
      default:
        return (
          <div className="space-y-6 pb-6">
            {/* Premium Hero Dashboard for Home */}
            {currentView === 'HOME' && (
              <div className="relative rounded-3xl overflow-hidden shadow-2xl group transition-all duration-500">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0">
                  <img 
                    src="https://i.imghippo.com/files/doWD3644bN.jpg" 
                    alt="Hollan Tower Background" 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-900/80 via-teal-800/60 to-emerald-900/80 backdrop-brightness-75"></div>
                </div>
                
                {/* Content */}
                <div className="relative z-10 p-6 text-white">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-xl font-light opacity-90 mb-1">{greeting},</h2>
                      <h1 className="text-2xl font-bold tracking-tight">হলান টাওয়ার বাসী</h1>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20 shadow-lg">
                      {timeIcon}
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="bg-teal-500/30 p-2.5 rounded-xl">
                           <Calendar size={20} className="text-white" />
                        </div>
                        <div>
                           <p className="text-[10px] opacity-70 uppercase tracking-wider font-semibold">আজকের তারিখ</p>
                           <p className="text-sm font-bold leading-tight">{currentDate}</p>
                        </div>
                     </div>
                     <div className="text-right border-l border-white/10 pl-4 flex flex-col justify-center items-end">
                        <p className="text-2xl font-bold font-mono tracking-wider leading-none">{currentTime}</p>
                        <p className="text-[12px] font-bold font-mono opacity-80 mt-1.5 leading-none">{currentSeconds} সেকেন্ড</p>
                        <p className="text-sm font-black opacity-100 mt-2 leading-none tracking-widest bg-white/20 px-2 py-1 rounded-md">{amPm}</p>
                     </div>
                  </div>
                </div>
              </div>
            )}

            {/* Grid Menu */}
            <div>
              <div className="flex justify-between items-end mb-4 px-1">
                 <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                   {currentView === 'MENU' ? 'সকল সেবা' : 'সেবা কেন্দ্র'}
                 </h3>
                 {currentView === 'HOME' && (
                   <button onClick={() => setCurrentView('MENU')} className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors">
                     সব দেখুন
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
                    className="relative bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-white dark:border-slate-700 overflow-hidden group text-left h-32 flex flex-col justify-between"
                  >
                    {/* Background Gradient Blob */}
                    <div className={`absolute -right-4 -top-4 w-20 h-20 bg-gradient-to-br ${item.gradient || 'from-gray-100 to-gray-200'} opacity-10 dark:opacity-5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500`}></div>
                    
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient || 'from-gray-500 to-gray-700'} flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110`}>
                      <item.icon size={20} />
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-0.5 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">{item.label}</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium line-clamp-1">{item.description}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Image Slider Section (Only Home) */}
            {currentView === 'HOME' && (
              <div className="pb-4">
                <div className="flex justify-between items-center mb-3 px-1">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">গ্যালারি</h3>
                </div>
                <ImageSlider />
              </div>
            )}

            {/* Extra Menu Items (Only Menu) */}
            {currentView === 'MENU' && (
              <div className="space-y-3 mt-4 mb-8">
                 {/* Maintenance Desk */}
                 <button 
                    onClick={() => setCurrentView('MAINTENANCE')}
                    className="w-full relative bg-white dark:bg-slate-800 p-4 rounded-[14px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-white dark:border-slate-700 overflow-hidden flex items-center gap-4 group transition-all active:scale-[0.98]"
                 >
                    <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                       <Wrench size={20} />
                    </div>
                    <div className="text-left">
                       <h4 className="text-base font-bold text-slate-800 dark:text-white mb-0.5">মেইনটেন্যান্স ডেস্ক</h4>
                    </div>
                    <ChevronRight className="ml-auto text-slate-300 dark:text-slate-600" size={18} />
                 </button>

                 {/* Settings */}
                 <button 
                    onClick={() => setCurrentView('SETTINGS')}
                    className="w-full relative bg-white dark:bg-slate-800 p-4 rounded-[14px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-white dark:border-slate-700 overflow-hidden flex items-center gap-4 group transition-all active:scale-[0.98]"
                 >
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                       <Settings size={20} />
                    </div>
                    <div className="text-left">
                       <h4 className="text-base font-bold text-slate-800 dark:text-white mb-0.5">সেটিং</h4>
                    </div>
                    <ChevronRight className="ml-auto text-slate-300 dark:text-slate-600" size={18} />
                 </button>
              </div>
            )}
          </div>
        );
    }
  };

  const hasNotice = (currentView === 'HOME' || currentView === 'MENU' || currentView === 'DESCO' || currentView === 'SERVICE_CHARGE' || currentView === 'EMERGENCY');

  return (
    <>
    <div className={`min-h-screen max-w-md mx-auto bg-[#F8FAFC] dark:bg-slate-900 relative shadow-2xl transition-colors duration-300 ${hasNotice ? 'has-notice' : ''}`}>
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[20%] bg-teal-200/20 dark:bg-teal-900/20 blur-[100px] rounded-full"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[20%] bg-indigo-200/20 dark:bg-indigo-900/20 blur-[100px] rounded-full"></div>
      </div>

      {/* Top Header - Fixed */}
      <header className="fixed top-0 left-0 right-0 max-w-md mx-auto z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-800/50 transition-all duration-300">
        <div className="px-5 py-3 flex items-center justify-start">
          <div className="flex items-center gap-3 text-left">
            <div className="w-9 h-9 bg-gradient-to-tr from-teal-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-200 dark:shadow-none shrink-0 transform rotate-3">
              <Building2 className="text-white" size={18} />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-800 dark:text-white leading-tight">
                {APP_NAME}
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                <MapPin size={10} /> হলান, দক্ষিণখান
              </p>
            </div>
          </div>
          <div className="ml-auto">
             <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500">
                <User size={16} />
             </div>
          </div>
        </div>
        {hasNotice && (
          <NoticeBoard 
            key={currentView} 
            text={
              currentView === 'DESCO' ? DESCO_NOTICE_TEXT : 
              currentView === 'SERVICE_CHARGE' ? SERVICE_CHARGE_NOTICE_TEXT :
              (currentView === 'MENU' || currentView === 'EMERGENCY') ? EMERGENCY_NOTICE_TEXT : undefined
            } 
          />
        )}
      </header>

      {/* Main Content Area */}
      <main 
        className="px-5 relative z-10"
        style={{ paddingTop: 'var(--header-height)' }}
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


      {/* Exit Confirmation Dialog */}
      <AnimatePresence>
        {showExitDialog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExitDialog(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xs bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/20 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{t.exitTitle}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  {t.exitMessage}
                </p>
              </div>
              <div className="flex border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => setShowExitDialog(false)}
                  className="flex-1 py-4 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-r border-slate-100 dark:border-slate-700"
                >
                  {t.exitCancel}
                </button>
                <button
                  onClick={handleExitApp}
                  className="flex-1 py-4 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut size={16} />
                  {t.exitConfirm}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>

    {/* Gemini Assistant - Only visible on HOME view */}
    <Assistant isVisible={currentView === 'HOME'} />

    {/* Bottom Navigation Removed */}
    {/* <BottomNav currentView={currentView} setView={setCurrentView} /> */}
    </>
  );
};

export default App;