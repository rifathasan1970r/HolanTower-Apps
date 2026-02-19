import React from 'react';
import { motion } from 'framer-motion';
import { BOTTOM_NAV_ITEMS } from '../constants';
import { ViewState } from '../types';

interface BottomNavProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  lang: 'bn' | 'en';
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView, lang }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-white/90 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"></div>
      
      <div className="relative max-w-md mx-auto px-4 h-20 flex justify-between items-center">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const isActive = currentView === item.view;
          const isHome = item.id === 'home';

          return (
            <button
              key={item.id}
              onClick={() => setView(item.view)}
              className={`relative flex flex-col items-center justify-center transition-colors duration-300 ${
                isHome ? '-mt-8' : ''
              } ${isActive ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {isHome ? (
                // Floating Home Button
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`p-4 rounded-full shadow-lg ${
                    isActive 
                      ? 'bg-gradient-to-br from-primary-500 to-primary-700 text-white' 
                      : 'bg-white text-gray-500 border border-gray-100'
                  }`}
                >
                  <item.icon size={28} strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
              ) : (
                // Standard Icons
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center p-2"
                >
                  <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary-50' : 'bg-transparent'}`}>
                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary-600 rounded-full"
                      />
                    )}
                  </div>
                </motion.div>
              )}
              
              <span className={`text-[10px] font-medium mt-1 ${isHome ? 'mb-1' : ''} ${isActive ? 'font-bold' : ''}`}>
                {lang === 'bn' ? item.label : item.labelEn}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;