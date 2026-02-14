import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, ChevronDown, Heart, Volume2, Volume1, VolumeX } from 'lucide-react';
import { PlayerState, Song } from '../types';
import { getHighResArtwork } from '../constants';

interface FullPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  playerState: PlayerState;
  controls: {
    togglePlay: () => void;
    nextSong: () => void;
    prevSong: () => void;
    toggleShuffle: () => void;
    toggleRepeat: () => void;
    seek: (time: number) => void;
    toggleFavorite: (song: Song) => void;
    isFavorite: (id: number) => boolean;
    setVolume: (volume: number) => void;
  };
}

const formatTime = (time: number) => {
  if (isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const FullPlayer: React.FC<FullPlayerProps> = ({ isOpen, onClose, playerState, controls }) => {
  const { currentSong, isPlaying, currentTime, duration, isShuffle, repeatMode, volume } = playerState;
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(0);

  useEffect(() => {
    if (!isDragging) {
      setDragValue(currentTime);
    }
  }, [currentTime, isDragging]);

  if (!isOpen || !currentSong) return null;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDragValue(Number(e.target.value));
  };

  const handleSeekEnd = () => {
    controls.seek(dragValue);
    setIsDragging(false);
  };

  const isLiked = controls.isFavorite(currentSong.trackId);
  
  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-900 animate-in slide-in-from-bottom duration-300">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src={getHighResArtwork(currentSong.artworkUrl100)} 
          className="h-full w-full object-cover opacity-30 blur-3xl scale-125" 
          alt="bg"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-900/80 to-gray-900" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-12 pb-6">
        <button onClick={onClose} className="p-2 text-white/80 hover:text-white transition-transform active:scale-90">
          <ChevronDown size={32} />
        </button>
        <span className="text-sm font-medium tracking-widest uppercase text-white/60">Now Playing</span>
        <button className="p-2 text-transparent">
          <ChevronDown size={32} />
        </button>
      </div>

      {/* Album Art */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-8">
        <div className={`relative w-[300px] h-[300px] rounded-full shadow-2xl shadow-black/50 border-4 border-gray-800/50 overflow-hidden transition-transform duration-700 ${isPlaying ? 'vinyl-spin scale-105' : 'vinyl-paused scale-100'}`}>
             <img 
              src={getHighResArtwork(currentSong.artworkUrl100)} 
              alt="Album Art" 
              className="w-full h-full object-cover"
            />
            {/* Vinyl Center */}
            <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-gray-900 rounded-full transform -translate-x-1/2 -translate-y-1/2 border-2 border-gray-700 z-20" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 to-transparent pointer-events-none z-10" />
        </div>
      </div>

      {/* Song Info & Controls */}
      <div className="relative z-10 px-8 pb-12 flex flex-col gap-8">
        
        {/* Title & Artist */}
        <div className="flex items-center justify-between">
          <div className="flex-1 overflow-hidden pr-4">
            <h2 className="text-2xl font-bold text-white truncate">{currentSong.trackName}</h2>
            <p className="text-lg text-gray-400 truncate">{currentSong.artistName}</p>
          </div>
          <button 
            onClick={() => controls.toggleFavorite(currentSong)}
            className={`p-3 rounded-full transition-all duration-300 active:scale-75 ${isLiked ? 'text-pink-500 heart-beat drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]' : 'text-gray-400 hover:text-white'}`}
          >
            <Heart size={28} fill={isLiked ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex flex-col gap-2 group">
          <input
            type="range"
            min={0}
            max={duration || 30}
            value={isDragging ? dragValue : currentTime}
            onChange={handleSeekChange}
            onMouseDown={() => setIsDragging(true)}
            onTouchStart={() => setIsDragging(true)}
            onMouseUp={handleSeekEnd}
            onTouchEnd={handleSeekEnd}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer hover:bg-gray-600 focus:outline-none transition-all group-hover:h-2"
            style={{
                backgroundImage: `linear-gradient(to right, #d946ef 0%, #8b5cf6 ${(currentTime / (duration || 1)) * 100}%, #374151 ${(currentTime / (duration || 1)) * 100}%, #374151 100%)`
            }}
          />
          <div className="flex justify-between text-xs font-medium text-gray-400">
            <span>{formatTime(isDragging ? dragValue : currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-between">
          <button 
            onClick={controls.toggleShuffle}
            className={`p-2 transition-all duration-300 active:scale-90 ${isShuffle ? 'text-purple-400 rotate-180' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Shuffle size={20} />
          </button>
          
          <button 
            onClick={controls.prevSong}
            className="p-4 text-white hover:text-purple-400 transition-all duration-200 active:scale-75 hover:scale-110"
          >
            <SkipBack size={32} fill="currentColor" />
          </button>

          <button 
            onClick={controls.togglePlay}
            className={`h-20 w-20 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 shadow-xl transition-all duration-300 ${isPlaying ? 'shadow-purple-500/50 scale-105 ring-4 ring-purple-500/20' : 'shadow-purple-900/40 hover:scale-110'} active:scale-90`}
          >
            {isPlaying ? (
                <Pause size={36} fill="white" className="text-white animate-in zoom-in duration-200" />
            ) : (
                <Play size={36} fill="white" className="ml-1 text-white animate-in zoom-in duration-200" />
            )}
          </button>

          <button 
            onClick={controls.nextSong}
            className="p-4 text-white hover:text-purple-400 transition-all duration-200 active:scale-75 hover:scale-110"
          >
            <SkipForward size={32} fill="currentColor" />
          </button>

          <button 
             onClick={controls.toggleRepeat}
             className={`p-2 transition-all duration-300 active:scale-90 relative ${repeatMode !== 'off' ? 'text-purple-400 rotate-180' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Repeat size={20} />
            {repeatMode === 'one' && (
                <span className="absolute top-1 right-0 text-[10px] font-bold bg-gray-900 px-1 rounded-full border border-purple-400 animate-in zoom-in">1</span>
            )}
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-4 px-2">
            <button 
                onClick={() => controls.setVolume(volume === 0 ? 1 : 0)} 
                className="text-gray-400 hover:text-white transition-colors p-2"
            >
                <VolumeIcon size={20} />
            </button>
            <div className="flex-1 group">
                <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={(e) => controls.setVolume(Number(e.target.value))}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer hover:bg-gray-600 focus:outline-none transition-all group-hover:h-2"
                    style={{
                        backgroundImage: `linear-gradient(to right, #d946ef 0%, #8b5cf6 ${(volume) * 100}%, #374151 ${(volume) * 100}%, #374151 100%)`
                    }}
                />
            </div>
        </div>

      </div>
    </div>
  );
};

export default FullPlayer;