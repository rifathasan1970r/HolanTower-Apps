import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface DescoInfoViewProps {
  onBack: () => void;
}

export const DescoInfoView: React.FC<DescoInfoViewProps> = ({ onBack }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col max-w-md mx-auto">
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-bold text-slate-800">ডেসকো মিটারের তথ্য</h2>
      </div>
      <div className="flex-1 w-full overflow-hidden relative">
        <iframe 
          src="https://prepaid.desco.org.bd/customer/#/customer-info" 
          className="absolute inset-0 w-full h-full border-none"
          title="Desco Customer Info"
        />
      </div>
    </div>
  );
};
