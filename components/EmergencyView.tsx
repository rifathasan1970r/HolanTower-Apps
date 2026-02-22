import React, { useState } from 'react';
import { 
  Phone, 
  Copy, 
  Trash2, 
  Zap, 
  Droplets, 
  PaintBucket, 
  Wifi, 
  Tv, 
  Flame, 
  Hammer, 
  ShieldAlert, 
  User, 
  Wrench,
  Siren,
  Plus,
  X,
  Edit,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalStorage } from '../src/hooks/useLocalStorage';

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.101-.472-.149-.671.149-.198.297-.767.967-.94 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.607.134-.133.297-.347.446-.521.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.671-1.616-.92-2.214-.242-.58-.487-.502-.671-.511-.173-.009-.372-.011-.571-.011-.198 0-.52.074-.792.372-.272.297-1.042 1.018-1.042 2.481 0 1.462 1.066 2.875 1.214 3.074.149.198 2.103 3.213 5.1 4.504.714.307 1.27.491 1.704.628.717.228 1.369.196 1.883.119.575-.085 1.758-.712 2.006-1.402.248-.69.248-1.283.173-1.406-.074-.123-.27-.197-.567-.346zM12.003 22.002h-.003a9.953 9.953 0 0 1-5.073-1.381l-.364-.216-3.77.989 1.006-3.674-.237-.377a9.957 9.957 0 1 1 18.557-5.52 9.928 9.928 0 0 1-2.914 7.047 9.9 9.9 0 0 1-7.202 3.132z" />
  </svg>
);

const initialEmergencyContacts = {
  security: { id: 'sec-1', name: 'রিফাত', phone: '+8801310-988954', wa: true },
  manager: { id: 'man-1', name: 'আবু সাঈদ', phone: '+8801716-524033', wa: true },
  construction: { id: 'con-1', name: 'সম্রাট', phone: '01648-496150', wa: true },
  electric: { id: 'elec-1', name: 'সুমন', phone: '01674-200082', wa: true },
  sewage: { id: 'sew-1', name: 'ইউসুফ', phone: '01826-535683', wa: true },
  plumbing: { id: 'plumb-1', name: 'এরশাদ', phone: '01946500016', wa: false },
  garbage: { id: 'garb-1', phone: '01797550346' },
  gas: { id: 'gas-1', phone: '01660183718' },
  isp: [
    { id: 'isp-1', name: 'সার্কেল নেটওয়ার্ক', phone: '16237' },
    { id: 'isp-2', name: 'সার্কেল নেটওয়ার্ক', phone: '09611-800900' },
    { id: 'isp-3', name: 'নেট 3 লিংক', phone: '09639179384' },
  ],
  cable: [
    { id: 'cab-1', name: 'টাস কেবল', phone: '01951498883' },
    { id: 'cab-2', name: 'সোহান', role: 'বিল কালেক্টর', phone: '01329727781' },
  ]
};

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '123';

export const EmergencyView = () => {
  const [contacts, setContacts] = useLocalStorage('emergencyContacts_v2', initialEmergencyContacts);
  const [isAdmin, setIsAdmin] = useLocalStorage('isAdmin_v2', false);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('কপি হয়েছে: ' + text);
    } catch (err) {
      alert('কপি করা যায়নি');
    }
  };

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowLogin(false);
      setError('');
      setPassword('');
    } else {
      setError('ভুল পাসওয়ার্ড');
    }
  };
  
  const handleLogout = () => {
    setIsAdmin(false);
  };

  const handleEdit = (key: string, data: any, index: number | null = null) => {
    setEditingContact({ key, data, index });
    setShowEditor(true);
  };

  const handleAdd = (key: string) => {
    let newContactData;
    if (key === 'isp' || key === 'cable') {
      newContactData = { id: `new-${Date.now()}`, name: '', phone: '', role: key === 'cable' ? '' : undefined };
    } else {
      return; // Should not happen for single contacts
    }
    setEditingContact({ key, data: newContactData, index: contacts[key].length });
    setShowEditor(true);
  };

  const handleDelete = (key: string, index: number) => {
    if (window.confirm('আপনি কি নিশ্চিত যে আপনি এই নম্বরটি মুছে ফেলতে চান?')) {
      const newList = [...contacts[key]];
      newList.splice(index, 1);
      setContacts({ ...contacts, [key]: newList });
    }
  };

  const handleSave = ({ key, data, index }: { key: string, data: any, index: number | null }) => {
    if (index !== null && (key === 'isp' || key === 'cable')) {
      const newList = [...contacts[key]];
      if (index >= newList.length) { // Adding new
        newList.push({ ...data, id: data.id || `new-${Date.now()}`});
      } else { // Editing existing
        newList[index] = data;
      }
      setContacts({ ...contacts, [key]: newList });
    } else {
      setContacts({ ...contacts, [key]: data });
    }
    setShowEditor(false);
    setEditingContact(null);
  };

  const ActionButtons = ({ phone, wa = true }: { phone: string, wa?: boolean }) => {
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    
    return (
      <div className="flex gap-2 mt-4">
        <a 
          href={`tel:${cleanPhone}`} 
          className="flex-1 px-3 py-2.5 bg-blue-600 rounded-xl text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
        >
          <Phone size={14} /> কল
        </a>
        {wa && (
          <a 
            href={`https://wa.me/${cleanPhone.replace('+', '')}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex-1 px-3 py-2.5 bg-[#25D366] rounded-xl text-white text-xs font-bold hover:bg-[#20b85a] transition-colors shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
          >
            <WhatsAppIcon /> WhatsApp
          </a>
        )}
        <button 
          onClick={() => copyText(phone)} 
          className="px-4 py-2.5 bg-slate-100 rounded-xl text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
        >
          <Copy size={14} /> কপি
        </button>
      </div>
    );
  };

  const Card = ({ 
    title, 
    icon: Icon, 
    desc, 
    colorClass, 
    iconColor,
    children 
  }: { 
    title: string, 
    icon: any, 
    desc: string, 
    colorClass: string, 
    iconColor: string, 
    children: React.ReactNode 
  }) => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-5 rounded-2xl border border-white/40 shadow-sm ${colorClass} relative overflow-hidden`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
           <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
             <Icon size={18} className={iconColor} /> {title}
           </h3>
           <div className="bg-slate-100/80 text-slate-600 text-[10px] px-2 py-0.5 rounded-md inline-block mt-1">
             {desc}
           </div>
        </div>
      </div>
      {children}
    </motion.div>
  );

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-2 pb-6">
      <AnimatePresence>
        {showLogin && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowLogin(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: -20 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-slate-800 mb-4">অ্যাডমিন লগইন</h3>
              <input 
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="পাসওয়ার্ড দিন"
                className="w-full p-3 border border-slate-300 rounded-lg mb-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
              <button onClick={handleLogin} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                লগইন
              </button>
            </motion.div>
          </motion.div>
        )}
        {showEditor && editingContact && (
          <ContactEditor 
            contactInfo={editingContact}
            onSave={handleSave}
            onClose={() => setShowEditor(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center pr-2">
        <h2 className="text-2xl font-bold text-slate-800 px-1 border-l-4 border-red-500 pl-3">
          জরুরী সার্ভিস ও কন্ট্রাক্টর
        </h2>
        {!isAdmin ? (
          <button onClick={() => setShowLogin(true)} className="text-sm font-medium text-indigo-600 hover:underline">
            অ্যাডমিন লগইন
          </button>
        ) : (
          <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:underline flex items-center gap-1">
            <LogOut size={14}/> লগআউট
          </button>
        )}
      </div>

      {/* Emergency 999 */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card rounded-2xl p-5 shadow-lg border border-red-100 bg-gradient-to-r from-red-50 to-white"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-red-200">
            <Siren size={28} className="animate-pulse" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-extrabold text-red-600 leading-none mb-1">জরুরী জাতীয় হেল্পলাইন</h2>
            <p className="text-xs text-slate-600 font-medium">বাংলাদেশের যে কোনো জরুরী সহায়তা</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between bg-white p-3 rounded-xl border border-red-100">
           <span className="text-3xl font-black tracking-widest text-red-600 pl-2">৯৯৯</span>
           <a className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-bold text-sm shadow hover:bg-red-700 active:scale-95 transition-all flex items-center gap-2" href="tel:999">
             <Phone size={16} /> কল করুন
           </a>
        </div>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Security */}
        <Card 
          title="নিরাপত্তা ও তত্ত্বাবধানে" 
          icon={ShieldAlert} 
          desc="বিল্ডিং এর যে কোনো প্রয়োজনে"
          colorClass="bg-green-50/50"
          iconColor="text-green-600"
        >
          {isAdmin && <EditButton onClick={() => handleEdit('security', contacts.security)} />}
          <dl className="space-y-2 text-sm mt-2">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <dt className="text-slate-500">নাম</dt>
              <dd className="font-bold text-base">{contacts.security.name}</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-slate-500">মোবাইল</dt>
              <dd className="font-mono font-extrabold text-lg text-slate-700">{contacts.security.phone}</dd>
            </div>
          </dl>
          <ActionButtons phone={contacts.security.phone} wa={contacts.security.wa} />
        </Card>

        {/* Manager */}
        <Card 
          title="ম্যানেজার" 
          icon={User} 
          desc="বিল্ডিং এর ম্যানেজমেন্ট ব্যবস্থাপনার প্রয়োজনে"
          colorClass="bg-blue-50/50"
          iconColor="text-blue-600"
        >
          {isAdmin && <EditButton onClick={() => handleEdit('manager', contacts.manager)} />}
          <dl className="space-y-2 text-sm mt-2">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <dt className="text-slate-500">নাম</dt>
              <dd className="font-bold text-base">{contacts.manager.name}</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-slate-500">মোবাইল</dt>
              <dd className="font-mono font-extrabold text-lg text-slate-700">{contacts.manager.phone}</dd>
            </div>
          </dl>
          <ActionButtons phone={contacts.manager.phone} wa={contacts.manager.wa} />
        </Card>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
         {/* Construction */}
         <Card 
          title="নির্মাণ ঠিকাদার" 
          icon={Hammer} 
          desc="ভবন নির্মাণ ও সিভিল মেরামতের কাজের তথ্যের প্রয়োজনে"
          colorClass="bg-amber-50/50"
          iconColor="text-amber-600"
        >
          {isAdmin && <EditButton onClick={() => handleEdit('construction', contacts.construction)} />}
          <dl className="space-y-2 text-sm mt-2">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <dt className="text-slate-500">নাম</dt>
              <dd className="font-bold text-base">{contacts.construction.name}</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-slate-500">মোবাইল</dt>
              <dd className="font-mono font-extrabold text-lg text-slate-700">{contacts.construction.phone}</dd>
            </div>
          </dl>
          <ActionButtons phone={contacts.construction.phone} wa={contacts.construction.wa} />
        </Card>

        {/* Electric */}
        <Card 
          title="বিদ্যুৎ ঠিকাদার" 
          icon={Zap} 
          desc="ইলেকট্রিক লাইন, মিটার ও যে কোনো বিদ্যুৎ সমস্যায়"
          colorClass="bg-yellow-50/50"
          iconColor="text-yellow-500"
        >
          {isAdmin && <EditButton onClick={() => handleEdit('electric', contacts.electric)} />}
          <dl className="space-y-2 text-sm mt-2">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <dt className="text-slate-500">নাম</dt>
              <dd className="font-bold text-base">{contacts.electric.name}</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-slate-500">মোবাইল</dt>
              <dd className="font-mono font-extrabold text-lg text-slate-700">{contacts.electric.phone}</dd>
            </div>
          </dl>
          <ActionButtons phone={contacts.electric.phone} wa={contacts.electric.wa} />
        </Card>

        {/* Sewage */}
        <Card 
          title="পয়ঃনিষ্কাশন ঠিকাদার" 
          icon={Droplets} 
          desc="স্যানিটারি সমস্যার সমাধানে (কন্ট্রাক্টর)"
          colorClass="bg-cyan-50/50"
          iconColor="text-cyan-600"
        >
          {isAdmin && <EditButton onClick={() => handleEdit('sewage', contacts.sewage)} />}
          <dl className="space-y-2 text-sm mt-2">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <dt className="text-slate-500">নাম</dt>
              <dd className="font-bold text-base">{contacts.sewage.name}</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-slate-500">মোবাইল</dt>
              <dd className="font-mono font-extrabold text-lg text-slate-700">{contacts.sewage.phone}</dd>
            </div>
          </dl>
          <ActionButtons phone={contacts.sewage.phone} wa={contacts.sewage.wa} />
        </Card>

        {/* Plumbing */}
        <Card 
          title="প্লাম্বিং জরুরি সার্ভিস" 
          icon={Wrench} 
          desc="(বিকল্প নম্বর) পানির লাইন লিকেজ, টয়লেট মেরামত"
          colorClass="bg-indigo-50/50"
          iconColor="text-indigo-600"
        >
          {isAdmin && <EditButton onClick={() => handleEdit('plumbing', contacts.plumbing)} />}
          <dl className="space-y-2 text-sm mt-2">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <dt className="text-slate-500">নাম</dt>
              <dd className="font-bold text-base">{contacts.plumbing.name}</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-slate-500">মোবাইল</dt>
              <dd className="font-mono font-extrabold text-lg text-slate-700">{contacts.plumbing.phone}</dd>
            </div>
          </dl>
          <ActionButtons phone={contacts.plumbing.phone} wa={contacts.plumbing.wa} />
        </Card>

        {/* Paint */}
        <Card 
          title="রঙ ঠিকাদার" 
          icon={PaintBucket} 
          desc="পেইন্টিং, কোটিং, দেয়াল/গ্রিল রঙের কাজে"
          colorClass="bg-pink-50/50"
          iconColor="text-pink-600"
        >
           <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500 mt-2 font-medium">
             রঙ এর ঠিকাদার নিখোঁজ 😕
           </div>
        </Card>

        {/* Garbage */}
        <Card 
          title="ময়লা ফেলার সার্ভিস" 
          icon={Trash2} 
          desc="দৈনিক ময়লা অপসারণ ও রিসাইক্লিং"
          colorClass="bg-rose-50/50"
          iconColor="text-rose-500"
        >
          {isAdmin && <EditButton onClick={() => handleEdit('garbage', contacts.garbage)} />}
          <dl className="space-y-2 text-sm mt-2">
            <div className="flex justify-between items-center">
              <dt className="text-slate-500">নম্বর</dt>
              <dd className="font-mono font-extrabold text-lg text-slate-700">{contacts.garbage.phone}</dd>
            </div>
          </dl>
          <ActionButtons phone={contacts.garbage.phone} wa={false} />
        </Card>

        {/* Gas */}
        <Card 
          title="গ্যাস সিলিন্ডার সরবরাহ" 
          icon={Flame} 
          desc="(কম খরছে) এলপিজি সিলিন্ডার অর্ডার ও ডেলিভারি"
          colorClass="bg-orange-50/50"
          iconColor="text-orange-500"
        >
          {isAdmin && <EditButton onClick={() => handleEdit('gas', contacts.gas)} />}
          <dl className="space-y-2 text-sm mt-2">
            <div className="flex justify-between items-center">
              <dt className="text-slate-500">নম্বর</dt>
              <dd className="font-mono font-extrabold text-lg text-slate-700">{contacts.gas.phone}</dd>
            </div>
          </dl>
          <ActionButtons phone={contacts.gas.phone} wa={false} />
        </Card>
      </div>

      {/* ISP Section */}
      <Card 
          title="ইন্টারনেট সার্ভিস (ISP)" 
          icon={Wifi} 
          desc="বিল্ডিংয়ের ইন্টারনেট সংযোগ ও সাপোর্ট"
          colorClass="bg-sky-50/50"
          iconColor="text-sky-600"
      >
          {isAdmin && <button onClick={() => handleAdd('isp')} className="absolute top-4 right-4 bg-sky-100 text-sky-700 p-1.5 rounded-full hover:bg-sky-200"><Plus size={14}/></button>}
          <div className="space-y-6 mt-2">
             {contacts.isp.map((item, index) => (
               <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative">
                  {isAdmin && (
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button onClick={() => handleEdit('isp', item, index)} className="bg-blue-100 text-blue-600 p-1 rounded-full hover:bg-blue-200"><Edit size={12}/></button>
                      <button onClick={() => handleDelete('isp', index)} className="bg-red-100 text-red-600 p-1 rounded-full hover:bg-red-200"><Trash2 size={12}/></button>
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-500">কোম্পানির নাম</span>
                    <span className="font-bold text-sm text-red-600">{item.name}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-slate-500">মোবাইল</span>
                    <span className="font-mono font-bold text-base text-slate-800">{item.phone}</span>
                  </div>
                  <div className="flex gap-2">
                      <a href={`tel:${item.phone}`} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold text-center">📞 কল</a>
                      <button onClick={() => copyText(item.phone)} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold text-center">📋 কপি</button>
                  </div>
               </div>
             ))}
          </div>
      </Card>

      {/* Cable TV */}
      <Card 
          title="ডিস / কেবল টিভি সার্ভিস" 
          icon={Tv} 
          desc="কেবল টিভি সংযোগ ও মেইনটেন্যান্স"
          colorClass="bg-purple-50/50"
          iconColor="text-purple-600"
      >
          {isAdmin && <button onClick={() => handleAdd('cable')} className="absolute top-4 right-4 bg-purple-100 text-purple-700 p-1.5 rounded-full hover:bg-purple-200"><Plus size={14}/></button>}
          <div className="space-y-6 mt-2">
            {contacts.cable.map((item, index) => (
              <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative">
                {isAdmin && (
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button onClick={() => handleEdit('cable', item, index)} className="bg-blue-100 text-blue-600 p-1 rounded-full hover:bg-blue-200"><Edit size={12}/></button>
                    <button onClick={() => handleDelete('cable', index)} className="bg-red-100 text-red-600 p-1 rounded-full hover:bg-red-200"><Trash2 size={12}/></button>
                  </div>
                )}
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-500">{item.role ? 'বিল কালেক্টর' : 'কোম্পানির নাম'}</span>
                  <span className="font-bold text-sm text-red-600">{item.name}</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-slate-500">মোবাইল</span>
                  <span className="font-mono font-bold text-base text-slate-800">{item.phone}</span>
                </div>
                <div className="flex gap-2">
                    <a href={`tel:${item.phone}`} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold text-center">📞 কল</a>
                    <button onClick={() => copyText(item.phone)} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold text-center">📋 কপি</button>
                </div>
              </div>
            ))}
          </div>
      </Card>
    </div>
  );
};

const EditButton = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} className="absolute top-4 right-4 bg-slate-100 text-slate-600 p-1.5 rounded-full hover:bg-slate-200">
    <Edit size={14}/>
  </button>
);

const ContactEditor = ({ contactInfo, onSave, onClose }: { contactInfo: any, onSave: (data: any) => void, onClose: () => void }) => {
  const [formData, setFormData] = useState(contactInfo.data);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...contactInfo, data: formData });
  };

  const isArrayItem = Array.isArray(contactInfo.data);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: -20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: -20 }}
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className='absolute top-3 right-3 bg-slate-100 text-slate-600 p-1.5 rounded-full hover:bg-slate-200'>
          <X size={16}/>
        </button>
        <h3 className="text-lg font-bold text-slate-800 mb-4">
          {contactInfo.data.id.startsWith('new-') ? 'নতুন নম্বর যোগ করুন' : 'নম্বর এডিট করুন'}
        </h3>
        <form onSubmit={handleSubmit} className='space-y-3'>
          {Object.keys(formData).map(key => {
            if (key === 'id' || key === 'wa') return null;
            const label = { name: 'নাম', phone: 'মোবাইল নম্বর', role: 'ভূমিকা' }[key] || key;
            return (
              <div key={key}>
                <label className='text-xs font-bold text-slate-600'>{label}</label>
                <input 
                  type="text" 
                  name={key} 
                  value={formData[key] || ''} 
                  onChange={handleChange} 
                  className="w-full p-3 border border-slate-300 rounded-lg mt-1 focus:ring-2 focus:ring-indigo-500 outline-none" 
                  required 
                />
              </div>
            )
          })}
          {'wa' in formData && (
            <div className='flex items-center gap-2'>
              <input type="checkbox" name="wa" id="wa" checked={formData.wa} onChange={handleChange} className='h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500' />
              <label htmlFor="wa" className='text-sm font-medium text-slate-700'>WhatsApp আছে</label>
            </div>
          )}
          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors">
            সেভ করুন
          </button>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default EmergencyView;
