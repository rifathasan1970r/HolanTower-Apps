import React from 'react';
import { Megaphone } from 'lucide-react';
import { NOTICES } from '../constants';

const NoticeBoard: React.FC = () => {
  // Combine all notices into a single string
  const noticeText = NOTICES.map(n => n.text).join(" ••• ");

  return (
    <div className="bg-white border-t border-gray-100 py-2 relative overflow-hidden flex items-center shadow-sm h-10">
      <div className="absolute left-0 z-10 bg-white pl-4 pr-3 py-2 h-full flex items-center border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] gap-2">
        <Megaphone className="w-4 h-4 text-primary-700" />
        <span className="text-xs font-bold text-primary-700 pt-0.5">নোটিশ</span>
      </div>
      
      <div className="whitespace-nowrap overflow-hidden w-full ml-24">
        <div className="animate-marquee inline-block">
          <span className="text-sm font-semibold text-gray-900 mx-4">
            {noticeText}
          </span>
          {/* Duplicate for seamless loop */}
          <span className="text-sm font-semibold text-gray-900 mx-4">
            {noticeText}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NoticeBoard;