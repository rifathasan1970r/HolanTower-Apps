import React from 'react';
import {
  ArrowLeft, ArrowUpDown, Phone, Users, Weight, DoorOpen, Ban, Siren, Wind, Bell, PowerOff, ChevronsUpDown, Hand, UserCheck, Trash2, VolumeX, Building
} from 'lucide-react';

interface LiftInstructionsViewProps {
  onBack: () => void;
}

const instructions = [
  { icon: Building, text: "হলান টাওয়ার লিফটে আপনাকে স্বাগতম।" },
  { icon: Users, text: "অনুগ্রহপূর্বক লাইনে দাঁড়ান" },
  { icon: ChevronsUpDown, text: "উপরে বা নিচে নামার জন্য নির্ধারিত বাটন চাপুন" },
  { icon: Hand, text: "বাটন চাপার পর আলো জ্বলা পর্যন্ত অপেক্ষা করুন" },
  { icon: DoorOpen, text: "লিফট এর দরজা খুলে গেলে ভিতরে প্রবেশ করুন।" },
  { icon: UserCheck, text: "আপনার কাঙ্ক্ষিত ফ্লোরের পুশ বাটন চাপুন।" },
  { icon: Weight, text: "ধারন ক্ষমতার অতিরিক্ত ওজন বহন থেকে বিরত থাকুন। (সর্বোচ্চ ৮ জন বা ৬৩০ কেজি)" },
  { icon: VolumeX, text: "অতিরিক্ত ওজনের সংকেত বাজলে শেষ আরোহনকারী নেমে পড়ুন।" },
  { icon: Ban, text: "লিফটের ভিতরে ধুমপান থেকে বিরত থাকুন।" },
  { icon: Users, text: "শিশু ও বৃদ্ধদের একা একা লিফটে ভ্রমণ থেকে বিরত থাকাই উত্তম।" },
  { icon: Trash2, text: "লিফটে সকল প্রকার ময়লা আবর্জনা ফেলা থেকে বিরত থাকুন।" },
  { icon: PowerOff, text: "হঠাৎ বিদ্যুৎ চলে গেলে আতঙ্কিত হবেন না, অটো রেস্কিউ ডিভাইস আপনাকে নিকটস্থ ফ্লোরে নিয়ে যাবে।" },
  { icon: Bell, text: "যান্ত্রিক ত্রুটিতে লিফটের ভিতরের কলিং বেল চাপুন এবং লিফটম্যানের সাহায্য নিন।" },
  { icon: Wind, text: "লিফটের ভিতরে স্বাভাবিক বায়ু চলাচল ও ইমারজেন্সি লাইটের ব্যবস্থা আছে।" },
];

export const LiftInstructionsView: React.FC<LiftInstructionsViewProps> = ({ onBack }) => {
  return (
    <div className="pb-24 animate-in slide-in-from-right duration-500 bg-gray-50 min-h-screen">
      <div className="bg-white/80 backdrop-blur-xl sticky top-[60px] z-10 border-b border-gray-200/50">
        <div className="flex items-center justify-between px-4 py-3">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors py-1 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-base font-bold">ফিরে যান</span>
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-3xl shadow-2xl shadow-slate-900/20 mb-6">
            <div className="flex items-center gap-4 text-white">
              <div className="bg-white/10 p-3 rounded-xl border border-white/20">
                <ArrowUpDown size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">লিফট নির্দেশাবলি</h2>
                <p className="text-sm opacity-80">নিরাপদ ও সুন্দর অভিজ্ঞতার জন্য</p>
              </div>
            </div>
        </div>
        
        <div className="space-y-3">
          {instructions.map((item, index) => (
            <div key={index} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-start gap-4 transition-all hover:border-indigo-100 hover:shadow-md">
              <div className="bg-indigo-50 text-indigo-600 w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center">
                <item.icon size={20} />
              </div>
              <p className="flex-1 font-semibold text-slate-700 text-sm pt-2">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-5 text-white shadow-lg shadow-red-500/20">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-full border border-white/30">
              <Phone size={20} />
            </div>
            <div>
              <p className="font-bold">জরুরি প্রয়োজনে যোগাযোগ করুন</p>
              <p className="text-lg font-bold tracking-wider">01310-988954 ( রিফাত )</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-slate-500">
          <p className="font-bold text-base">ধন্যবাদান্তে,</p>
          <p className="font-semibold text-sm">হলান টাওয়ারের কর্তৃপক্ষ</p>
        </div>
      </div>
    </div>
  );
};
