import React from 'react';
import { motion } from 'framer-motion';
import { BOTTOM_NAV_ITEMS } from '../constants';
import { ViewState } from '../types';

interface BottomNavProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const BottomNav: React.FC<BottomNavProps> = React.memo(({ currentView, setView }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-0 pointer-events-none">
      <div className="max-w-md mx-auto relative pointer-events-auto">
        {/* Premium Glass Container with Rounded Top - White Theme */}
        <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-t border-purple-100/50 dark:border-slate-800/50 shadow-[0_-8px_30px_-5px_rgba(0,0,0,0.1),0_-2px_10px_-2px_rgba(0,0,0,0.05)] rounded-t-[24px]">
           {/* Soft Gradient Overlay */}
           <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-white/20 dark:from-slate-800/50 dark:to-slate-800/20 rounded-t-[24px] pointer-events-none" />
        </div>
        
        <div className="relative px-2 h-[80px] flex justify-around items-center pb-3">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.view)}
              className="relative flex flex-col items-center justify-center w-16 h-full group outline-none space-y-1"
            >
              <item.icon 
                size={24} 
                strokeWidth={isActive ? 2.5 : 2} 
                className={`transition-all duration-200 relative z-10 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-primary-600 dark:group-hover:text-primary-400'}`}
              />
              <span className={`text-[10px] font-bold tracking-wide transition-all duration-200 relative z-10 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="active-nav-indicator"
                  className="absolute inset-0 bg-primary-50 dark:bg-slate-800 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>
      </div>
    </div>
  );
});

export default BottomNav;
