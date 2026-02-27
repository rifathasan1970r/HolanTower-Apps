import React from 'react';
import { ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';

interface PolicyViewProps {
  onBack: () => void;
}

export const PolicyView: React.FC<PolicyViewProps> = ({ onBack }) => {
  const policies = [
    "হলান টাওয়ার পূর্বের হিসাব সম্পন্ন করা।",
    "হলান টাওয়ার পরিচালনার নিমিত্তে নতুন করে সেক্রেটারি নিয়োগ করা। তিনি নতুন ভাবে সকল হিসাব সংরক্ষণ করবেন।",
    "হলান টাওয়ারের কাছাকাছি ডাচবাংলা ব্যাংকে নতুন একটি যৌথ ব্যাংক একাউন্ট খোলা।",
    "প্রতিমাসের সার্ভিস চার্জ, ভাড়াটিয়ার গ্যারেজ ভাড়া এবং যে কোন আয়ের উৎস হতে প্রাপ্ত অর্থের জমা এবং একাউন্টের খরচ যুক্ত করা।",
    "পানি, গ্যাস, বিদ্যুৎ, বিল ভাউচার ফাইল তৈরী করা।",
    "আনুষঙ্গিক অন্যান্য খরচাদির ভাউচার ফাইল তৈরী করা।",
    "সভাপতির অনুমতি ব্যতীত কোন প্রকার খরচাদি সম্পন্ন না করা।",
    "ভাড়াটিয়ার গাড়ী থাকলে গ্যারেজ ভাড়া আদায় করা।",
    "২১জন মালিকের ব্যক্তিগত প্রাইভেট গাড়ীর গ্যারেজ ভাড়া নির্ধারণ।",
    "২১ জন মালিকের ব্যক্তিগত বাইকের গ্যারেজ ভাড়া নির্ধারণ।",
    "ভাড়াটিয়ার ব্যক্তিগত প্রাইভেট গাড়ীর গ্যারেজ ভাড়া নির্ধারণ। (গ্যারেজ ফাঁকা সাপেক্ষে সুবিধা পাবেন)",
    "ভাড়াটিয়ার ব্যক্তিগত বাইকের গ্যারেজ ভাড়া নির্ধারণ (গ্যারেজ ফাঁকা সাপেক্ষে সুবিধা পাবেন)",
    "ভাড়াটিয়ার বাসা ভাড়া ফরম (থানা কর্তৃক প্রদত্ত) পূরণ করতঃ প্রত্যেক সদস্যদের ১ কপি পিপি সাইজের ছবি, এনআইডি এর ফটোকপি, কর্মস্থলের ঠিকানা সেক্রেটারীকে জমা প্রদান।",
    "ভাড়াটিয়ার করণীয় বর্জনীয় বিষয় সমূহ সেক্রেটারী কর্তৃক লিখিত ভাবে প্রদান।",
    "হলান টাওয়ারে বসবাসকারী মালিকদের মধ্য হতে প্রতি বছর সভাপতি ও সেক্রেটারী নির্বাচিত হবে।",
    "হলান টাওয়ারের মালিকদের মধ্য হতে ০৪ সদস্য বিশিষ্ট কার্য নির্বাহী কমিটি গঠন করা। উক্ত কমিটি হলান টাওয়ারের নিয়ম শৃঙ্খলা এবং উন্নয়নমূলক কার্যক্রম সংক্রান্ত বিষয়াদি সেক্রেটারী এবং সভাপতির সহিত সমন্বয় সাধন করবেন।",
    "কোন ফ্লাটের মালিক কোন প্রকার সাবলেট ভাড়া প্রদান না করা।",
    "কোন ফ্লাটের মালিক সাবলেট ভাড়া প্রদান করিলে, সার্ভিস চার্জ ৫,০০০/০০ ধার্য করা।",
    "কোন ফ্লাটের মালিক তার ফ্লাট ভাড়া দেওয়ার পূর্বে ভাড়াটিয়ার এনআইডি, কর্মস্থলের ঠিকানা সেক্রেটারী নিকট জমা প্রদান নিশ্চিত করা।",
    "১১০০ ঘটিকার পর গেইট সম্পূর্ণ বন্ধ করা।",
    "১২০০ ঘটিকার গেইটে আলাদা তালা লাগানো। যার চাবি প্রধানত কেয়ার টেকারের কাছে থাকবে।",
    "সব সময় গেইট লক থাকবে। কেয়ারটেকার পরিচয় নিশ্চিত না হওয়া পর্যন্ত কাউকে প্রবেশ করতে না দেওয়া।",
    "কোন ভাড়াটিয়ার রাষ্ট্র বিরোধী কার্য এবং অসদাচরণের জন্য, সভাপতি এবং সেক্রেটারী সেই ভাড়াটিয়াকে বাসা ছেড়ে দেওয়ার আদেশ দিতে পারিবেন। সে ক্ষেত্রে ফ্লাট মালিকের কোন আপত্তি থাকিতে পারিবেনা।",
    "সভাপতি, সেক্রেটারীর অনুমতি ব্যতীত, বহিরাগত জনসমাগম ফ্রী ভাবে হল রুম ব্যবহার সম্পূর্ণ নিষেধ করা।",
    "কেয়ার টেকারের পোস্ট খালি রেখে, ব্যক্তিগত কাজে কেয়ার টেকারকে ব্যবহার না করা।",
    "ছাদ সম্পূর্ণ খালি রাখা। কেউ কোন প্রকার গাছ টপ ব্যবহার করতে পারবেনা।",
    "আর্থিক অথবা বড় কোন সিদ্ধান্ত গ্রহণের ক্ষেত্রে গ্রুপ মিটিং আয়োজন করা।"
  ];

  return (
    <div className="animate-in slide-in-from-right duration-300 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-b-3xl shadow-sm border-b border-slate-100 dark:border-slate-700 mb-6 sticky top-[60px] z-30">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">পরিচালনার প্রস্তাবিত নীতিমালা</h2>
            <p className="text-xs text-rose-500 font-medium">হলান টাওয়ার ব্যবস্থাপনা</p>
          </div>
          <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400">
            <FileText size={20} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 space-y-0 relative">
        {/* Vertical Line */}
        <div className="absolute left-8 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-700"></div>

        {policies.map((policy, index) => (
          <div key={index} className="relative pl-12 py-4 group">
            {/* Number Bubble */}
            <div className="absolute left-4 top-4 w-8 h-8 -ml-4 bg-white dark:bg-slate-900 border-2 border-rose-500 text-rose-500 rounded-full flex items-center justify-center text-xs font-bold z-10 shadow-sm group-hover:scale-110 transition-transform">
              {index + 1}
            </div>
            
            {/* Content Card */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 group-hover:border-rose-200 dark:group-hover:border-rose-900/50 transition-colors">
               <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium">
                  {policy}
               </p>
            </div>
          </div>
        ))}

        <div className="mt-8 p-6 bg-gradient-to-br from-rose-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-3xl border border-rose-100 dark:border-slate-700 text-center relative z-10">
          <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto mb-3">
            <FileText size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">ধন্যবাদ</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            সকলের সহযোগিতায় আমাদের ভবনকে সুন্দর ও সুশৃঙ্খল রাখা সম্ভব।
          </p>
        </div>
      </div>
    </div>
  );
};
