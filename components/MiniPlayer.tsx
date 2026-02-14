import React from 'react';
import { Play, Pause, X } from 'lucide-react';
import { Song, PlayerState } from '../types';
import { getHighResArtwork } from '../constants';

interface MiniPlayerProps {
  playerState: PlayerState;
  onTogglePlay: () => void;
  onOpenFull: () => void;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({ playerState, onTogglePlay, onOpenFull }) => {
  const { currentSong, isPlaying } = playerState;

  if (!currentSong) return null;

  return (
    <div 
      className="fixed bottom-[80px] left-2 right-2 z-40"
      onClick={onOpenFull}
    >
      <div className="bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 pr-4 flex items-center gap-3 shadow-2xl shadow-purple-900/20 animate-in slide-in-from-bottom-4 duration-300">
        <div className={`relative h-12 w-12 flex-shrink-0 rounded-full overflow-hidden border border-white/10 ${isPlaying ? 'vinyl-spin' : ''}`}>
           <img 
            src={getHighResArtwork(currentSong.artworkUrl100)} 
            alt="Art" 
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 rounded-full" />
          <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-gray-900 rounded-full transform -translate-x-1/2 -translate-y-1/2 border border-gray-700" />
        </div>
        
        <div className="flex-1 overflow-hidden">
          <h4 className="text-sm font-semibold text-white truncate">{currentSong.trackName}</h4>
          <p className="text-xs text-gray-400 truncate">{currentSong.artistName}</p>
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}
          className="h-10 w-10 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 transition-transform shadow-lg shadow-white/10"
        >
          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
        </button>
      </div>
    </div>
  );
};

export default MiniPlayer;
