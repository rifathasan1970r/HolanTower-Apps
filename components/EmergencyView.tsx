import React from 'react';
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
  Siren
} from 'lucide-react';
import { motion } from 'framer-motion';

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.101-.472-.149-.671.149-.198.297-.767.967-.94 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.607.134-.133.297-.347.446-.521.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.671-1.616-.92-2.214-.242-.58-.487-.502-.671-.511-.173-.009-.372-.011-.571-.011-.198 0-.52.074-.792.372-.272.297-1.042 1.018-1.042 2.481 0 1.462 1.066 2.875 1.214 3.074.149.198 2.103 3.213 5.1 4.504.714.307 1.27.491 1.704.628.717.228 1.369.196 1.883.119.575-.085 1.758-.712 2.006-1.402.248-.69.248-1.283.173-1.406-.074-.123-.27-.197-.567-.346zM12.003 22.002h-.003a9.953 9.953 0 0 1-5.073-1.381l-.364-.216-3.77.989 1.006-3.674-.237-.377a9.957 9.957 0 1 1 18.557-5.52 9.928 9.928 0 0 1-2.914 7.047 9.9 9.9 0 0 1-7.202 3.132z" />
  </svg>
);

export const EmergencyView = () => {
  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Small feedback UI could be added here, currently just using basic browser alert like original code 
      // or we can just rely on the user knowing it copied.
      alert('কপি হয়েছে: ' + text);
    } catch (err) {
      alert('কপি করা যায়নি');
    }
  };

  const ActionButtons = ({ phone, wa = true }: { phone: string, wa?: boolean }) => {
    // Clean phone for tel: link (remove hyphens/spaces)
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
      <h2 className="text-2xl font-bold text-slate-800 px-1 border-l-4 border-red-500 pl-3">
        জরুরী সার্ভিস ও কন্ট্রাক্টর
      </h2>

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
          <dl className="space-y-2 text-sm mt-2">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <dt className="text-slate-500">নাম</dt>
              <dd className="font-bold text-base">রিফাত</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-slate-500">মোবাইল</dt>
              <dd className="font-mono font-extrabold text-lg text-slate-700">+8801310-988954</dd>
            </div>
          </dl>
          <ActionButtons phone="+8801310-988954" />
        </Card>

        {/* Manager */}
        <Card 
          title="ম্যানেজার" 
          icon={User} 
          desc="বিল্ডিং এর ম্যানেজমেন্ট ব্যবস্থাপনার প্রয়োজনে"
          colorClass="bg-blue-50/50"
          iconColor="text-blue-600"
        >
          <dl className="space-y-2 text-sm mt-2">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <dt className="text-slate-500">নাম</dt>
              <dd className="font-bold text-base">আবু সাঈদ</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-slate-500">মোবাইল</dt>
              <dd className="font-mono font-extrabold text-lg text-slate-700">+8801716-524033</dd>
            </div>
          </dl>
          <ActionButtons phone="+8801716-524033" />
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
          <dl className="space-y-2 text-sm mt-2">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <dt className="text-slate-500">নাম</dt>
              <dd className="font-bold text-base">সম্রাট</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-slate-500">মোবাইল</dt>
              <dd className="font-mono font-extrabold text-lg text-slate-700">01648-496150</dd>
            </div>
          </dl>
          <ActionButtons phone="01648-496150" />
        </Card>

        {/* Electric */}
        <Card 
          title="বিদ্যুৎ ঠিকাদার" 
          icon={Zap} 
          desc="ইলেকট্রিক লাইন, মিটার ও যে কোনো বিদ্যুৎ সমস্যায়"
          colorClass="bg-yellow-50/50"
          iconColor="text-yellow-500"
        >
          <dl className="space-y-2 text-sm mt-2">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <dt className="text-slate-500">নাম</dt>
              <dd className="font-bold text-base">সুমন</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-slate-500">মোবাইল</dt>
              <dd className="font-mono font-extrabold text-lg text-slate-700">01674-200082</dd>
            </div>
          </dl>
          <ActionButtons phone="01674-200082" />
        </Card>

        {/* Sewage */}
        <Card 
          title="পয়ঃনিষ্কাশন ঠিকাদার" 
          icon={Droplets} 
          desc="স্যানিটারি সমস্যার সমাধানে (কন্ট্রাক্টর)"
          colorClass="bg-cyan-50/50"
          iconColor="text-cyan-600"
        >
          <dl className="space-y-2 text-sm mt-2">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <dt className="text-slate-500">নাম</dt>
              <dd className="font-bold text-base">ইউসুফ</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-slate-500">মোবাইল</dt>
              <dd className="font-mono font-extrabold text-lg text-slate-700">01826-535683</dd>
            </div>
          </dl>
          <ActionButtons phone="01826-535683" />
        </Card>

        {/* Plumbing */}
        <Card 
          title="প্লাম্বিং জরুরি সার্ভিস" 
          icon={Wrench} 
          desc="(বিকল্প নম্বর) পানির লাইন লিকেজ, টয়লেট মেরামত"
          colorClass="bg-indigo-50/50"
          iconColor="text-indigo-600"
        >
          <dl className="space-y-2 text-sm mt-2">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <dt className="text-slate-500">নাম</dt>
              <dd className="font-bold text-base">এরশাদ</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-slate-500">মোবাইল</dt>
              <dd className="font-mono font-extrabold text-lg text-slate-700">01946500016</dd>
            </div>
          </dl>
          <div className="flex gap-2 mt-4">
             <a 
              href="tel:01626678138" 
              className="flex-1 px-3 py-2.5 bg-blue-600 rounded-xl text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Phone size={14} /> কল
            </a>
            <button 
              onClick={() => copyText('01946500016')} 
              className="flex-1 px-3 py-2.5 bg-slate-100 rounded-xl text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Copy size={14} /> কপি
            </button>
          </div>
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
          <dl className="space-y-2 text-sm mt-2">
            <div className="flex justify-between items-center">
              <dt className="text-slate-500">নম্বর</dt>
              <dd className="font-mono font-extrabold text-lg text-slate-700">01797550346</dd>
            </div>
          </dl>
          <div className="flex gap-2 mt-4">
             <a 
              href="tel:01797550346" 
              className="flex-1 px-3 py-2.5 bg-blue-600 rounded-xl text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Phone size={14} /> কল
            </a>
            <button 
              onClick={() => copyText('01797550346')} 
              className="flex-1 px-3 py-2.5 bg-slate-100 rounded-xl text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Copy size={14} /> কপি
            </button>
          </div>
        </Card>

        {/* Gas */}
        <Card 
          title="গ্যাস সিলিন্ডার সরবরাহ" 
          icon={Flame} 
          desc="(কম খরছে) এলপিজি সিলিন্ডার অর্ডার ও ডেলিভারি"
          colorClass="bg-orange-50/50"
          iconColor="text-orange-500"
        >
          <dl className="space-y-2 text-sm mt-2">
            <div className="flex justify-between items-center">
              <dt className="text-slate-500">নম্বর</dt>
              <dd className="font-mono font-extrabold text-lg text-slate-700">01660183718</dd>
            </div>
          </dl>
          <div className="flex gap-2 mt-4">
             <a 
              href="tel:01660183718" 
              className="flex-1 px-3 py-2.5 bg-blue-600 rounded-xl text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Phone size={14} /> কল
            </a>
            <button 
              onClick={() => copyText('01660183718')} 
              className="flex-1 px-3 py-2.5 bg-slate-100 rounded-xl text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Copy size={14} /> কপি
            </button>
          </div>
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
          <div className="space-y-6 mt-2">
             {/* Item 1 */}
             <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-500">কোম্পানির নাম</span>
                  <span className="font-bold text-sm text-red-600">সার্কেল নেটওয়ার্ক</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-slate-500">মোবাইল</span>
                  <span className="font-mono font-bold text-base text-slate-800">16237</span>
                </div>
                <div className="flex gap-2">
                    <a href="tel:16237" className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold text-center">📞 কল</a>
                    <button onClick={() => copyText('16237')} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold text-center">📋 কপি</button>
                </div>
             </div>

             {/* Item 2 */}
             <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-500">কোম্পানির নাম</span>
                  <span className="font-bold text-sm text-red-600">সার্কেল নেটওয়ার্ক</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-slate-500">মোবাইল</span>
                  <span className="font-mono font-bold text-base text-slate-800">09611-800900</span>
                </div>
                <div className="flex gap-2">
                    <a href="tel:09611800900" className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold text-center">📞 কল</a>
                    <button onClick={() => copyText('09611-800900')} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold text-center">📋 কপি</button>
                </div>
             </div>

             {/* Item 3 */}
             <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-500">কোম্পানির নাম</span>
                  <span className="font-bold text-sm text-red-600">নেট 3 লিংক</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-slate-500">মোবাইল</span>
                  <span className="font-mono font-bold text-base text-slate-800">09639179384</span>
                </div>
                <div className="flex gap-2">
                    <a href="tel:09639179384" className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold text-center">📞 কল</a>
                    <button onClick={() => copyText('09639179384')} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold text-center">📋 কপি</button>
                </div>
             </div>
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
          <div className="space-y-6 mt-2">
             {/* Item 1 */}
             <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-500">কোম্পানির নাম</span>
                  <span className="font-bold text-sm text-red-600">টাস কেবল</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-slate-500">মোবাইল</span>
                  <span className="font-mono font-bold text-base text-slate-800">01951498883</span>
                </div>
                <div className="flex gap-2">
                    <a href="tel:01951498883" className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold text-center">📞 কল</a>
                    <button onClick={() => copyText('01951498883')} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold text-center">📋 কপি</button>
                </div>
             </div>

             {/* Item 2 */}
             <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-500">বিল কালেক্টর</span>
                  <span className="font-bold text-sm text-slate-800">সোহান</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-slate-500">মোবাইল</span>
                  <span className="font-mono font-bold text-base text-slate-800">01329727781</span>
                </div>
                <div className="flex gap-2">
                    <a href="tel:01329727781" className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold text-center">📞 কল</a>
                    <button onClick={() => copyText('01329727781')} className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold text-center">📋 কপি</button>
                </div>
             </div>
          </div>
      </Card>
    </div>
  );
};

export default EmergencyView;
