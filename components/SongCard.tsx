import React from 'react';
import { Song } from '../types';
import { getHighResArtwork } from '../constants';
import { MoreVertical, Play } from 'lucide-react';

interface SongCardProps {
  song: Song;
  isPlaying: boolean;
  onClick: () => void;
  layout?: 'grid' | 'list';
}

export const SongCard: React.FC<SongCardProps> = ({ song, isPlaying, onClick, layout = 'grid' }) => {
  if (layout === 'grid') {
    return (
      <div 
        onClick={onClick}
        className="group relative flex flex-col gap-2 p-3 rounded-2xl glass-panel hover:bg-white/10 transition-all cursor-pointer active:scale-95"
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-xl shadow-lg">
          <img 
            src={getHighResArtwork(song.artworkUrl100)} 
            alt={song.trackName} 
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          {isPlaying && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
               <div className="flex gap-1 h-4 items-end">
                  <div className="w-1 bg-pink-500 animate-[bounce_1s_infinite] h-2"></div>
                  <div className="w-1 bg-purple-500 animate-[bounce_1.2s_infinite] h-4"></div>
                  <div className="w-1 bg-pink-500 animate-[bounce_0.8s_infinite] h-3"></div>
               </div>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          <h3 className="font-semibold text-sm truncate text-white">{song.trackName}</h3>
          <p className="text-xs text-gray-400 truncate">{song.artistName}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-2xl hover:bg-white/10 transition-all cursor-pointer active:scale-98 ${isPlaying ? 'bg-white/10 border border-purple-500/30' : 'border border-transparent'}`}
    >
      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-gray-800">
        <img 
          src={getHighResArtwork(song.artworkUrl100)} 
          alt={song.trackName} 
          className="h-full w-full object-cover"
          loading="lazy"
        />
        {isPlaying && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Play size={16} className="fill-white text-white" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
        <h3 className={`font-medium text-sm truncate ${isPlaying ? 'text-pink-400' : 'text-white'}`}>
          {song.trackName}
        </h3>
        <p className="text-xs text-gray-400 truncate">{song.artistName}</p>
      </div>
      <button className="p-2 text-gray-400 hover:text-white transition-colors">
        <MoreVertical size={18} />
      </button>
    </div>
  );
};
