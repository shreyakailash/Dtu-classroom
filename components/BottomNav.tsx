
import React from 'react';
import { NAV_ITEMS } from '../constants';
import type { Screen } from '../types';

interface BottomNavProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, setActiveScreen }) => {
  return (
    <nav className="bg-[#161621] border-t border-t-purple-900/30">
      <div className="flex justify-around items-center h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = activeScreen === item.name;
          return (
            <button
              key={item.name}
              onClick={() => setActiveScreen(item.name)}
              className={`flex flex-col items-center justify-center gap-1 w-20 h-full transition-colors duration-300 ${isActive ? 'text-purple-400' : 'text-gray-500 hover:text-purple-300'}`}
            >
              <item.icon className="w-6 h-6" />
              <span className={`text-xs font-medium ${isActive ? 'font-bold' : ''}`}>{item.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
