import React from 'react';
import { motion } from 'framer-motion';
import { BOTTOM_NAV_ITEMS } from '../constants';
import { ViewState } from '../types';

interface BottomNavProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  lang?: 'bn' | 'en';
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-0">
      {/* Premium Glass Container with Rounded Top - White Theme */}
      <div className="absolute inset-0 bg-white/90 backdrop-blur-2xl border-t border-purple-100/50 shadow-[0_-8px_30px_-5px_rgba(0,0,0,0.1),0_-2px_10px_-2px_rgba(0,0,0,0.05)] rounded-t-[24px]">
         {/* Soft Gradient Overlay */}
         <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-white/20 rounded-t-[24px] pointer-events-none" />
      </div>
      
      <div className="relative max-w-lg mx-auto px-2 h-[80px] flex justify-around items-end pb-3">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const isActive = currentView === item.view;
          const isHome = item.id === 'home';

          return (
            <button
              key={item.id}
              onClick={() => setView(item.view)}
              className="relative flex flex-col items-center justify-end w-16 h-full group outline-none"
            >
              {isHome ? (
                // Floating Home Button - High End Style
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                   <motion.div
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className={`relative p-4 rounded-full shadow-[0_10px_25px_-5px_rgba(76,29,149,0.3)] transition-all duration-400 ${
                      isActive 
                        ? 'bg-gradient-to-br from-[#4C1D95] to-[#6D28D9] text-white ring-[6px] ring-white shadow-[0_15px_35px_-5px_rgba(76,29,149,0.5)]' 
                        : 'bg-white text-[#4C1D95] shadow-slate-200 border border-purple-50 ring-[6px] ring-white'
                    }`}
                  >
                    {/* Subtle Pulse Animation for Home */}
                    {isActive && (
                        <motion.div
                            className="absolute inset-0 rounded-full bg-[#4C1D95]"
                            initial={{ opacity: 0.4, scale: 1 }}
                            animate={{ opacity: 0, scale: 1.4 }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
                        />
                    )}
                    
                    <item.icon size={28} strokeWidth={2.5} className="relative z-10 drop-shadow-sm" />
                  </motion.div>
                </div>
              ) : (
                // Standard Icons - Premium Micro-interactions
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  className="flex flex-col items-center gap-1.5 py-1 w-full relative z-10"
                >
                  <div className="relative p-1">
                    {/* Active Soft Highlight */}
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-purple-50 rounded-xl -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    
                    {/* Icon with Bounce Effect */}
                    <motion.div
                        animate={isActive ? { y: [0, -4, 0] } : { y: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                    >
                        <item.icon 
                        size={24} 
                        strokeWidth={isActive ? 2.5 : 2} 
                        className={`transition-all duration-300 ${
                            isActive 
                            ? 'text-[#4C1D95] drop-shadow-[0_2px_8px_rgba(76,29,149,0.25)]' 
                            : 'text-slate-400 group-hover:text-[#4C1D95]'
                        }`} 
                        />
                    </motion.div>
                  </div>
                  
                  {/* Label */}
                  <span className={`text-[10px] font-bold tracking-wide transition-all duration-300 ${
                    isActive ? 'text-[#4C1D95]' : 'text-slate-400'
                  }`}>
                    {item.label}
                  </span>
                  
                  {/* Active Indicator Line */}
                  {isActive && (
                     <motion.div 
                       layoutId="nav-line"
                       className="absolute -bottom-2 w-8 h-1 bg-[#4C1D95] rounded-t-full shadow-[0_-2px_6px_rgba(76,29,149,0.3)]"
                     />
                  )}
                </motion.div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
