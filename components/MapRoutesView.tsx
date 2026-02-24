import React from 'react';
import { ArrowLeft, Map as MapIcon, Navigation, MapPin } from 'lucide-react';

interface MapRoutesViewProps {
  onBack: () => void;
}

export const MapRoutesView: React.FC<MapRoutesViewProps> = ({ onBack }) => {
  return (
    <div className="pb-24 animate-in slide-in-from-right duration-500 bg-slate-50 min-h-screen relative font-sans">
      {/* Navigation Header Section */}
      <div className="bg-white sticky top-[60px] z-10 border-b border-slate-100 shadow-sm transition-all">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors py-1 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-base font-bold">ফিরে যান</span>
          </button>
        </div>
        
        <div className="flex items-center justify-center px-6 py-4">
          <div className="text-center animate-in zoom-in duration-300 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-white shadow-md">
                <MapIcon size={20} />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-slate-800">ম্যাপ ও বিভিন্ন রুট</h2>
                <p className="text-xs font-bold text-teal-600 mt-0.5">
                  লোকেশন ও যাতায়াত নির্দেশনা
                </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        
        {/* Premium Map Card */}
        <div className="animate-in slide-in-from-bottom-4 fade-in duration-700">
            <div className="bg-white rounded-[20px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden relative">
                {/* Subtle Gradient Background behind content */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-white pointer-events-none" />

                {/* Card Header */}
                <div className="relative p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="bg-teal-50 p-2 rounded-lg text-teal-600">
                            <MapPin size={18} />
                        </div>
                        <h3 className="font-bold text-slate-700 text-sm">লোকেশন ম্যাপ</h3>
                    </div>
                    
                    {/* Action button */}
                    <a 
                        href="https://maps.app.goo.gl/aXWrfX8dh6x2Sy5f7" 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] font-bold text-teal-600 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
                    >
                        <span>ম্যাপে দেখুন</span>
                        <Navigation size={10} />
                    </a>
                </div>

                {/* Divider */}
                <div className="h-px w-full bg-slate-100 relative z-10" />

                {/* Map Container with Padding */}
                <div className="p-2 relative z-10">
                    <div className="w-full aspect-video rounded-xl overflow-hidden shadow-inner border border-slate-200 bg-slate-100 relative">
                         <iframe 
                            src="https://maps.google.com/maps?q=Holan+Tower+Dakshinkhan+Dhaka&t=&z=15&ie=UTF8&iwloc=&output=embed"
                            width="100%" 
                            height="100%" 
                            style={{ border: 0 }} 
                            allowFullScreen 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Holan Tower Map"
                            className="w-full h-full grayscale-[10%] hover:grayscale-0 transition-all duration-700"
                        ></iframe>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="px-4 pb-4 pt-2 relative z-10">
                    <div className="flex items-start gap-2 text-slate-500">
                        <div className="mt-0.5 min-w-[4px] h-[4px] rounded-full bg-teal-400" />
                        <p className="text-[11px] font-medium leading-relaxed">
                            হলান টাওয়ার, দক্ষিণখান, ঢাকা-১২৩০। ম্যাপ জুম করে বিস্তারিত লোকেশন দেখতে পারেন।
                        </p>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};
