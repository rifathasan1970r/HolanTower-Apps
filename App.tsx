import React, { useState, useEffect } from 'react';
import { Building2, Phone, MapPin, ChevronRight, User, CloudSun, Calendar, Zap, Languages, MessageCircle, Bell, BellRing, X, CheckCircle2, Send, Lock, Unlock, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { APP_NAME_BN, APP_NAME_EN, MENU_ITEMS, TRANSLATIONS, NOTICES as FALLBACK_NOTICES } from './constants';
import { ViewState } from './types';
import NoticeBoard from './components/NoticeBoard';
import BottomNav from './components/BottomNav';
import Assistant from './components/Assistant';
import { ServiceChargeView } from './components/ServiceChargeView';
import EmergencyView from './components/EmergencyView';
import DescoView from './components/DescoView';
import { supabase } from './lib/supabaseClient';

const MENU_NOTICE = "হলান টাওয়ারে আপনাকে স্বাগতম। আমাদের ভবনের সকল গুরুত্বপূর্ণ তথ্য ও দৈনন্দিন সেবাগুলি এখনে দ্রুত পেয়ে যাবেন। এখানে জরুরী নোটিশ, ইউটিলিটি ও সার্ভিস চার্জ, ডেসকো রিচার্জ, যোগাযোগ ও জরুরী হেল্পলাইন, ম্যাপ ও রুট নির্দেশনা, প্রিপেইড মিটার নাম্বার, লিফট ব্যবহারের নিয়ম, গ্যালারি এবং বাসাভাড়ার তথ্য একসাথে সহজে খুঁজে পাবেন। এটি হলান টাওয়ারের বাসিন্দাদের জন্য একটি দ্রুত, সহজ ও নির্ভরযোগ্য ডিজিটাল সার্ভিস কেন্দ্র।";

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  
  // Notification State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [hasUnread, setHasUnread] = useState(false);
  const [notices, setNotices] = useState<any[]>([]);
  
  // Admin Notification State
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [pin, setPin] = useState('');
  const [composeMode, setComposeMode] = useState(false);
  const [newNoticeText, setNewNoticeText] = useState('');
  const [isSending, setIsSending] = useState(false);

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
      const locale = lang === 'bn' ? 'bn-BD' : 'en-US';
      setCurrentDate(now.toLocaleDateString(locale, options));
      
      setCurrentTime(now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }));
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Initial Fetch
    fetchNotices();

    // Realtime Subscription
    const channel = supabase
      .channel('public:notices')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notices' }, (payload) => {
          const newNotice = payload.new;
          
          // Prevent duplicates using functional update and ID check
          setNotices(prev => {
             if (prev.some(n => n.id === newNotice.id)) return prev;
             return [newNotice, ...prev];
          });
          
          setHasUnread(true);
          
          // Trigger Browser Notification
          if (Notification.permission === 'granted') {
             try {
               new Notification(APP_NAME_BN, {
                  body: newNotice.text,
                  icon: 'https://cdn-icons-png.flaticon.com/512/1827/1827301.png',
                  tag: 'notice-' + newNotice.id // Prevent duplicate notifications
               });
             } catch (e) {
               console.error("Notification error:", e);
             }
          }
      })
      .subscribe();

    return () => {
        clearInterval(timer);
        supabase.removeChannel(channel);
    };
  }, [lang, t]);

  const fetchNotices = async () => {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (data && data.length > 0) {
          setNotices(data);
      } else {
          setNotices(FALLBACK_NOTICES);
      }
  };

  const handleAdminLogin = () => {
      if (pin === '1234') {
          setIsAdmin(true);
          setShowAdminLogin(false);
          setPin('');
      } else {
          alert('ভুল পিন!');
      }
  };

  const handleSendNotice = async () => {
      if (!newNoticeText.trim()) return;
      setIsSending(true);

      try {
          const payload = {
              text: newNoticeText.trim(),
              date: new Date().toISOString().split('T')[0],
              // Let Supabase handle created_at default if column exists, 
              // otherwise this ISO string works for standard text/timestamp columns
              created_at: new Date().toISOString()
          };

          const { data, error } = await supabase
            .from('notices')
            .insert(payload)
            .select();

          if (error) throw error;
          
          // Optimistic update handled by Realtime subscription usually, 
          // but if that fails, we can uncomment below. 
          // For now, let's rely on realtime for consistency across clients.

          setNewNoticeText('');
          setComposeMode(false);
          alert(lang === 'bn' ? 'নোটিফিকেশন সফলভাবে পাঠানো হয়েছে!' : 'Notification sent successfully!');
      } catch (err: any) {
          console.error('Send notice error:', err);
          alert(lang === 'bn' 
            ? `পাঠানো যায়নি: ${err.message || 'অজানা ত্রুটি'}` 
            : `Failed to send: ${err.message || 'Unknown error'}`);
      } finally {
          setIsSending(false);
      }
  };

  const handleDeleteNotice = async (id: number) => {
      if (!window.confirm('মুছে ফেলতে চান?')) return;
      
      try {
        const { error } = await supabase.from('notices').delete().eq('id', id);
        if (error) throw error;
        setNotices(prev => prev.filter(n => n.id !== id));
      } catch(err) {
        console.error(err);
      }
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'bn' ? 'en' : 'bn');
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert("This browser does not support desktop notification");
      return;
    }
    
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        new Notification(lang === 'bn' ? "নোটিফিকেশন চালু হয়েছে" : "Notifications Enabled", {
          body: lang === 'bn' ? "এখন থেকে সকল আপডেট পাবেন।" : "You will receive updates.",
        });
      }
    } catch (error) {
      console.error("Error requesting permission", error);
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
        setHasUnread(false);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'EMERGENCY':
        return <EmergencyView />;

      case 'SERVICE_CHARGE':
        return <ServiceChargeView lang={lang} />;
      
      case 'DESCO':
        return <DescoView lang={lang} />;

      case 'CONTACT':
        const contacts = [
            {
                nameBn: 'আইয়ুব খান',
                nameEn: 'Ayub Khan',
                phone: '01720503870',
                displayPhone: '+880 1720-503870',
                roleBn: 'ম্যানেজমেন্ট',
                roleEn: 'Management',
                gradient: 'from-blue-500 to-indigo-600',
            },
            {
                nameBn: 'নজরুল ইসলাম',
                nameEn: 'Nazrul Islam',
                phone: '01731597652',
                displayPhone: '+880 1731-597652',
                roleBn: 'ম্যানেজমেন্ট',
                roleEn: 'Management',
                gradient: 'from-violet-500 to-purple-600',
            },
            {
                nameBn: 'আবু সাঈদ',
                nameEn: 'Abu Sayed',
                phone: '01716524033',
                displayPhone: '+880 1716-524033',
                roleBn: 'ম্যানেজমেন্ট',
                roleEn: 'Management',
                gradient: 'from-cyan-500 to-teal-600',
            },
            {
                nameBn: 'রিফাত',
                nameEn: 'Rifat',
                phone: '01310988954',
                displayPhone: '+880 1310-988954',
                roleBn: 'নিরাপত্তা ও তত্ত্বাবধানে',
                roleEn: 'Security & Supervision',
                gradient: 'from-rose-500 to-pink-600',
            }
        ];

        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-2 pb-6">
            <h2 className="text-2xl font-bold text-slate-800 px-1 border-l-4 border-indigo-500 pl-3">
                {lang === 'bn' ? 'জরুরী যোগাযোগ' : 'Emergency Contact'}
            </h2>
            <div className="grid gap-5">
               {contacts.map((contact, i) => (
                 <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="bg-white rounded-[1.5rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group"
                 >
                    {/* Decorative Gradient Blob */}
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${contact.gradient} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity duration-500 -mr-10 -mt-10`}></div>

                    <div className="flex items-center gap-4 relative z-10 mb-5">
                       <div className={`w-14 h-14 bg-gradient-to-br ${contact.gradient} rounded-2xl flex items-center justify-center shadow-lg text-white transform group-hover:scale-105 transition-transform duration-300`}>
                          <User size={24} />
                       </div>
                       <div>
                         <h4 className="font-bold text-slate-800 text-lg leading-tight">{lang === 'bn' ? contact.nameBn : contact.nameEn}</h4>
                         <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {lang === 'bn' ? contact.roleBn : contact.roleEn}
                         </span>
                         <p className="text-xs text-slate-400 font-mono mt-1 font-medium">{contact.displayPhone}</p>
                       </div>
                    </div>
                    
                    <div className="flex gap-3 relative z-10"> 
                        <a 
                          href={`tel:${contact.phone}`} 
                          className="flex-1 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-800 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2 group/btn shadow-sm"
                        >
                          <Phone size={16} className="group-hover/btn:rotate-12 transition-transform" />
                          {lang === 'bn' ? 'কল করুন' : 'Call'}
                        </a>
                        <a 
                          href={`https://wa.me/88${contact.phone}`} 
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-3 rounded-xl bg-[#DCF8C6]/50 border border-[#25D366]/20 text-[#075E54] font-bold text-sm hover:bg-[#25D366] hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2 group/btn shadow-sm"
                        >
                          <MessageCircle size={16} className="group-hover/btn:rotate-12 transition-transform" />
                          WhatsApp
                        </a>
                    </div>
                 </motion.div>
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
          <div className="ml-auto flex items-center gap-2">
             {/* Notification Bell */}
             <div className="relative">
                <button
                   onClick={handleNotificationClick}
                   className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-200 hover:text-indigo-600 transition-all active:scale-95"
                >
                   {hasUnread ? <BellRing size={18} className="text-indigo-600" /> : <Bell size={18} />}
                   {hasUnread && (
                      <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                   )}
                </button>

                {/* Notification Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                       initial={{ opacity: 0, y: 10, scale: 0.95 }}
                       animate={{ opacity: 1, y: 0, scale: 1 }}
                       exit={{ opacity: 0, y: 10, scale: 0.95 }}
                       className="absolute right-0 top-full mt-3 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 origin-top-right"
                    >
                       <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                            {lang === 'bn' ? 'নোটিফিকেশন' : 'Notifications'}
                            {isAdmin && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full border border-indigo-200">Admin</span>}
                          </h3>
                          <div className="flex items-center gap-2">
                              {/* Admin Toggle */}
                              <button 
                                onClick={() => isAdmin ? setIsAdmin(false) : setShowAdminLogin(true)}
                                className={`p-1.5 rounded-full transition-colors ${isAdmin ? 'bg-indigo-100 text-indigo-600' : 'text-slate-300 hover:text-slate-500'}`}
                              >
                                {isAdmin ? <Unlock size={14} /> : <Lock size={14} />}
                              </button>
                              <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                          </div>
                       </div>
                       
                       {/* Admin Login Form inside Dropdown */}
                       {showAdminLogin && !isAdmin && (
                         <div className="p-3 bg-slate-50 border-b border-slate-100">
                            <input 
                              type="password" 
                              placeholder="PIN (1234)" 
                              value={pin}
                              onChange={e => setPin(e.target.value)}
                              className="w-full text-xs p-2 rounded border border-slate-200 mb-2"
                            />
                            <button onClick={handleAdminLogin} className="w-full bg-slate-800 text-white text-xs py-1.5 rounded font-bold">Login</button>
                         </div>
                       )}

                       {/* Compose Area for Admin */}
                       {isAdmin && (
                         <div className="p-3 border-b border-slate-100 bg-indigo-50/50">
                            {!composeMode ? (
                                <button 
                                  onClick={() => setComposeMode(true)}
                                  className="w-full py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 hover:bg-indigo-700 active:scale-95"
                                >
                                   <Plus size={14} /> {lang === 'bn' ? 'নতুন নোটিশ লিখুন' : 'Compose Notice'}
                                </button>
                            ) : (
                                <div className="space-y-2">
                                    <textarea 
                                      value={newNoticeText}
                                      onChange={(e) => setNewNoticeText(e.target.value)}
                                      placeholder={lang === 'bn' ? 'নোটিশ লিখুন...' : 'Write notice...'}
                                      className="w-full text-xs p-2 rounded-lg border border-indigo-200 focus:outline-none focus:border-indigo-500 min-h-[60px]"
                                    />
                                    <div className="flex gap-2">
                                        <button 
                                          onClick={() => setComposeMode(false)}
                                          className="flex-1 py-1.5 bg-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-300"
                                        >
                                           বাতিল
                                        </button>
                                        <button 
                                          onClick={handleSendNotice}
                                          disabled={isSending}
                                          className="flex-1 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-1"
                                        >
                                           {isSending ? 'পাঠানো হচ্ছে...' : 'সেন্ড করুন'} <Send size={12} />
                                        </button>
                                    </div>
                                </div>
                            )}
                         </div>
                       )}

                       {/* Permission Request Banner */}
                       {notificationPermission !== 'granted' && (
                         <div className="p-3 bg-orange-50 border-b border-orange-100">
                            <p className="text-xs text-orange-800 mb-2 font-medium">
                               {lang === 'bn' ? 'নতুন আপডেট মিস না করতে পুশ নোটিফিকেশন চালু করুন।' : 'Enable push notifications to never miss an update.'}
                            </p>
                            <button 
                              onClick={requestNotificationPermission}
                              className="w-full py-1.5 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600 active:scale-95"
                            >
                               {lang === 'bn' ? 'চালু করুন' : 'Enable'}
                            </button>
                         </div>
                       )}

                       <div className="max-h-[300px] overflow-y-auto p-2 space-y-2">
                          {notices.length > 0 ? (
                             notices.map((notice, idx) => (
                                 <div key={notice.id || idx} className="p-3 bg-white rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors shadow-sm relative group">
                                    <div className="flex gap-2.5 items-start">
                                       <div className="mt-0.5 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                          <Bell size={12} />
                                       </div>
                                       <div className="flex-1">
                                          <p className="text-xs text-slate-700 leading-relaxed font-medium">{notice.text}</p>
                                          <p className="text-[10px] text-slate-400 mt-1.5 font-bold flex justify-between items-center">
                                            <span>{notice.date}</span>
                                            {/* Delete button for Admin */}
                                            {isAdmin && notice.id && (
                                                <button 
                                                  onClick={(e) => { e.stopPropagation(); handleDeleteNotice(notice.id); }}
                                                  className="text-red-400 hover:text-red-600 p-1"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            )}
                                          </p>
                                       </div>
                                    </div>
                                 </div>
                               ))
                          ) : (
                            <div className="py-8 text-center text-slate-400 text-xs">
                               {lang === 'bn' ? 'কোনো নোটিফিকেশন নেই' : 'No notifications'}
                            </div>
                          )}
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>

             <button 
                onClick={toggleLanguage}
                className="h-9 px-3 rounded-full bg-slate-100 border border-slate-200 flex items-center gap-2 text-slate-600 hover:bg-slate-200 hover:text-primary-700 transition-all active:scale-95"
             >
                <Languages size={16} />
                <span className="text-xs font-bold">{lang === 'bn' ? 'বাংলা' : 'English'}</span>
             </button>
          </div>
        </div>
        {(currentView === 'HOME' || currentView === 'MENU') && (
          <NoticeBoard 
            lang={lang} 
            text={currentView === 'MENU' ? MENU_NOTICE : undefined} 
          />
        )}
      </header>

      {/* Main Content Area */}
      <main 
        className={`px-5 relative z-10 transition-all duration-300 ${
          (currentView === 'HOME' || currentView === 'MENU') ? 'pt-[125px]' : 'pt-[90px]'
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