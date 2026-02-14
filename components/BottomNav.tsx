import React from 'react';
import { Home, Search, Heart } from 'lucide-react';
import { Tab } from '../types';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 glass-nav z-30 pb-4 px-6 flex items-center justify-around">
      <button 
        onClick={() => setActiveTab('home')}
        className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'home' ? 'text-pink-500 scale-110' : 'text-gray-500 hover:text-gray-300'}`}
      >
        <Home size={24} fill={activeTab === 'home' ? "currentColor" : "none"} />
        <span className="text-[10px] font-medium">Home</span>
      </button>

      <button 
        onClick={() => setActiveTab('search')}
        className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'search' ? 'text-purple-500 scale-110' : 'text-gray-500 hover:text-gray-300'}`}
      >
        <Search size={24} strokeWidth={activeTab === 'search' ? 3 : 2} />
        <span className="text-[10px] font-medium">Search</span>
      </button>

      <button 
        onClick={() => setActiveTab('favorites')}
        className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'favorites' ? 'text-red-500 scale-110' : 'text-gray-500 hover:text-gray-300'}`}
      >
        <Heart size={24} fill={activeTab === 'favorites' ? "currentColor" : "none"} />
        <span className="text-[10px] font-medium">Favorites</span>
      </button>
    </nav>
  );
};

export default BottomNav;
