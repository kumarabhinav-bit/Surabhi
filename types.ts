export interface Song {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100: string; // We will upgrade this to 600x600
  previewUrl: string;
  kind: string;
}

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  currentIndex: number;
  duration: number;
  currentTime: number;
  volume: number;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
}

export type Tab = 'home' | 'search' | 'favorites';

export interface AudioContextType {
  playerState: PlayerState;
  playSong: (song: Song, newQueue?: Song[]) => void;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  seek: (time: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleFavorite: (song: Song) => void;
  isFavorite: (songId: number) => boolean;
  favorites: Song[];
  isFullPlayerOpen: boolean;
  setIsFullPlayerOpen: (isOpen: boolean) => void;
}
