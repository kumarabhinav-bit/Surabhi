import React, { useState, useEffect, useRef } from 'react';
import { Menu, Info, HelpCircle, X, Search, FolderOpen, Music } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearchFocus: () => void;
  activeTab: string;
  onImportMusic: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, setSearchQuery, onSearchFocus, activeTab, onImportMusic }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Sync search visibility with active tab
  useEffect(() => {
    if (activeTab === 'search') {
      setIsSearchOpen(true);
    } else {
      setIsSearchOpen(false);
    }
  }, [activeTab]);

  // Auto-focus input when search opens
  useEffect(() => {
    if (isSearchOpen && activeTab === 'search') {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen, activeTab]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-16 px-4 flex items-center justify-between glass-nav">
        
        {isSearchOpen ? (
          <div className="flex items-center w-full gap-3 animate-in fade-in slide-in-from-right duration-200">
             {/* Search Input Area */}
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  ref={inputRef}
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={onSearchFocus}
                  placeholder="Search songs, artists..."
                  className="w-full h-10 bg-white/10 border border-white/10 rounded-full pl-10 pr-10 text-white placeholder-gray-400 focus:outline-none focus:bg-white/20 transition-all text-sm"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                )}
             </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleMenu}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
              >
                <Menu size={24} />
              </button>
              
              {/* Import Button */}
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-pink-400"
                title="Import Offline Music"
              >
                <FolderOpen size={24} />
              </button>
              <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="audio/*" 
                  multiple 
                  onChange={onImportMusic}
              />
            </div>

            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 tracking-tight absolute left-1/2 -translate-x-1/2 pointer-events-none">
              Surabhi
            </h1>

            <button 
              onClick={() => { onSearchFocus(); }}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
            >
              <Search size={24} />
            </button>
          </>
        )}

        {/* Dropdown Menu Overlay - Fixed Background Opacity */}
        {isMenuOpen && !isSearchOpen && (
          <div className="absolute top-16 left-2 w-64 rounded-2xl bg-gray-900/95 backdrop-blur-xl border border-white/10 shadow-2xl p-2 flex flex-col gap-1 transform transition-all animate-in fade-in slide-in-from-top-4 z-50">
            <button 
              className="flex items-center gap-3 p-3 text-sm font-medium text-gray-200 hover:bg-white/10 rounded-xl transition-colors w-full text-left" 
              onClick={() => { setIsMenuOpen(false); setShowAbout(true); }}
            >
              <Info size={18} className="text-purple-400" />
              <span>About</span>
            </button>
            <button className="flex items-center gap-3 p-3 text-sm font-medium text-gray-200 hover:bg-white/10 rounded-xl transition-colors w-full text-left" onClick={() => setIsMenuOpen(false)}>
              <Info size={18} className="text-blue-400" />
              <span>Version 1.0.0</span>
            </button>
            <button 
              className="flex items-center gap-3 p-3 text-sm font-medium text-gray-200 hover:bg-white/10 rounded-xl transition-colors w-full text-left" 
              onClick={() => { setIsMenuOpen(false); fileInputRef.current?.click(); }}
            >
              <FolderOpen size={18} className="text-green-400" />
              <span>Import Music</span>
            </button>
            <button className="flex items-center gap-3 p-3 text-sm font-medium text-gray-200 hover:bg-white/10 rounded-xl transition-colors w-full text-left" onClick={() => setIsMenuOpen(false)}>
              <HelpCircle size={18} className="text-pink-400" />
              <span>Help</span>
            </button>
            <div className="h-px bg-white/10 my-1" />
            <button 
              className="flex items-center gap-3 p-3 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-colors w-full text-left" 
              onClick={() => setIsMenuOpen(false)}
            >
              <X size={18} />
              <span>Close Menu</span>
            </button>
          </div>
        )}
      </header>

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-gray-900/95 border border-white/10 p-6 rounded-3xl max-w-sm w-full shadow-2xl relative flex flex-col items-center text-center">
                <button
                    onClick={() => setShowAbout(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white p-2"
                >
                    <X size={20} />
                </button>

                <div className="h-16 w-16 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 mb-4 mt-2">
                    <Music size={32} className="text-white" />
                </div>

                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 mb-4">
                    Surabhi
                </h2>

                <p className="text-sm text-gray-300 leading-relaxed mb-6">
                    Surabhi is a modern music app where you can easily listen to your favorite songs. The app offers a smooth interface, high-quality sound, and an enhanced music experience. Surabhi is designed for music lovers and perfectly complements every mood.
                </p>

                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />

                <p className="text-sm text-gray-400">
                    Developed by <span className="text-pink-400 font-medium">Abhinav Kumar</span>
                </p>
            </div>
        </div>
      )}
    </>
  );
};

export default Header;