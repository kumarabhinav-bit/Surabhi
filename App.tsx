import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import MiniPlayer from './components/MiniPlayer';
import FullPlayer from './components/FullPlayer';
import { SongCard } from './components/SongCard';
import { Song, PlayerState, Tab } from './types';
import { searchSongs } from './services/api';
import { INITIAL_SEARCH_TERMS } from './constants';
import { Search as SearchIcon, Heart, Music, AlertCircle, FolderOpen } from 'lucide-react';

// --- IndexedDB Helpers ---
const DB_NAME = 'SurabhiMusicDB';
const STORE_NAME = 'songs';
const DB_VERSION = 1;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

const saveSongToDB = async (song: Song, file: File) => {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const record = {
      id: song.trackId,
      file: file,
      metadata: { ...song, previewUrl: '' } // url is transient
    };
    store.add(record);
    return true;
  } catch (e) {
    console.error("Error saving song", e);
    return false;
  }
};

const getSongsFromDB = async (): Promise<Song[]> => {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => {
        const records = request.result || [];
        const songs = records.map((record: any) => ({
          ...record.metadata,
          previewUrl: URL.createObjectURL(record.file)
        }));
        resolve(songs);
      };
      request.onerror = () => resolve([]);
    });
  } catch (e) {
    console.error("Error loading songs", e);
    return [];
  }
};

// Custom Hook for Audio Logic
const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentSong: null,
    isPlaying: false,
    queue: [],
    currentIndex: -1,
    duration: 0,
    currentTime: 0,
    volume: 1,
    isShuffle: false,
    repeatMode: 'off'
  });

  const [favorites, setFavorites] = useState<Song[]>([]);

  // Load favorites from local storage
  useEffect(() => {
    const saved = localStorage.getItem('surabhi_favorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }
    // Initialize audio
    audioRef.current = new Audio();
    audioRef.current.volume = 1;
  }, []);

  // Sync favorites
  useEffect(() => {
    localStorage.setItem('surabhi_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const playSong = useCallback((song: Song, newQueue?: Song[]) => {
    if (!audioRef.current) return;

    let queue = newQueue || playerState.queue;
    // If no queue provided and song not in current queue, make a single song queue
    if (!newQueue && !queue.find(s => s.trackId === song.trackId)) {
        queue = [song];
    }
    
    // If new queue provided, use it.
    // If playing from existing queue, just update index.
    const index = queue.findIndex(s => s.trackId === song.trackId);

    setPlayerState(prev => ({
      ...prev,
      currentSong: song,
      queue: queue,
      currentIndex: index,
      isPlaying: true
    }));

    audioRef.current.src = song.previewUrl;
    audioRef.current.play().catch(e => console.log("Play failed", e));
  }, [playerState.queue]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !playerState.currentSong) return;

    if (playerState.isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log("Play failed", e));
    }
    setPlayerState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, [playerState.isPlaying, playerState.currentSong]);

  const nextSong = useCallback(() => {
    const { queue, currentIndex, isShuffle, repeatMode } = playerState;
    if (queue.length === 0) return;

    let nextIndex;
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      return;
    }
    
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = (currentIndex + 1) % queue.length;
      // Stop if at end and not repeating all
      if (currentIndex === queue.length - 1 && repeatMode === 'off') {
         setPlayerState(prev => ({ ...prev, isPlaying: false }));
         return;
      }
    }
    
    playSong(queue[nextIndex]);
  }, [playerState, playSong]);

  const prevSong = useCallback(() => {
    const { queue, currentIndex } = playerState;
    if (queue.length === 0) return;
    
    // If played more than 3 seconds, restart song
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    playSong(queue[prevIndex]);
  }, [playerState, playSong]);

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setPlayerState(prev => ({ ...prev, currentTime: time }));
    }
  };

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      setPlayerState(prev => ({ ...prev, volume }));
    }
  }, []);

  const toggleShuffle = () => setPlayerState(prev => ({ ...prev, isShuffle: !prev.isShuffle }));
  
  const toggleRepeat = () => {
    setPlayerState(prev => {
      const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
      const nextMode = modes[(modes.indexOf(prev.repeatMode) + 1) % modes.length];
      return { ...prev, repeatMode: nextMode };
    });
  };

  const toggleFavorite = (song: Song) => {
    setFavorites(prev => {
      const exists = prev.find(s => s.trackId === song.trackId);
      if (exists) return prev.filter(s => s.trackId !== song.trackId);
      return [...prev, song];
    });
  };

  const isFavorite = (id: number) => !!favorites.find(s => s.trackId === id);

  // Audio Event Listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setPlayerState(prev => ({ ...prev, currentTime: audio.currentTime }));
    const updateDuration = () => setPlayerState(prev => ({ ...prev, duration: audio.duration }));
    const handleEnded = () => nextSong();

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [nextSong]);

  return {
    playerState,
    playSong,
    togglePlay,
    nextSong,
    prevSong,
    seek,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    toggleFavorite,
    isFavorite,
    favorites
  };
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  
  // Data State
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [newReleases, setNewReleases] = useState<Song[]>([]);
  const [localSongs, setLocalSongs] = useState<Song[]>([]);
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const {
    playerState,
    playSong,
    togglePlay,
    nextSong,
    prevSong,
    seek,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    toggleFavorite,
    isFavorite,
    favorites
  } = useAudioPlayer();

  // Load Persisted Local Songs
  useEffect(() => {
    const loadLocalMusic = async () => {
      const songs = await getSongsFromDB();
      if (songs.length > 0) {
        setLocalSongs(songs);
      }
    };
    loadLocalMusic();
  }, []);

  // Initial Data Load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [trending, releases] = await Promise.all([
            searchSongs(INITIAL_SEARCH_TERMS.trending, 8),
            searchSongs(INITIAL_SEARCH_TERMS.newReleases, 20)
        ]);
        setTrendingSongs(trending);
        setNewReleases(releases);
      } catch (e) {
        console.log("Offline or API Error", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Search Logic
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim().length > 2) {
        setIsLoading(true);
        try {
            const results = await searchSongs(searchQuery);
            setSearchResults(results);
            setHasSearched(true);
        } catch (e) {
            console.log("Search failed", e);
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
      } else if (searchQuery.trim().length === 0) {
        setSearchResults([]);
        setHasSearched(false);
      }
    }, 600); // Debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle File Import with Persistence
  const handleImportMusic = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const newSongs: Song[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const song: Song = {
            trackId: Date.now() + i + Math.random(),
            trackName: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
            artistName: "Offline Music",
            collectionName: "Local Library",
            artworkUrl100: "default",
            previewUrl: URL.createObjectURL(file),
            kind: 'local'
        };
        
        // Save to DB
        await saveSongToDB(song, file);
        newSongs.push(song);
      }

      setLocalSongs(prev => [...newSongs, ...prev]);
      setActiveTab('home'); // Switch to home to see imported songs
    }
  };

  // --- Views ---

  const renderHome = () => (
    <div className="pb-32 pt-20 px-4 space-y-8 animate-in fade-in duration-500">
      
      {/* Local Music Section (Visible only if songs exist) */}
      {localSongs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FolderOpen size={20} className="text-green-400" />
              Your Local Music
            </h2>
          </div>
          <div className="flex flex-col gap-2">
            {localSongs.map(song => (
              <SongCard 
                key={song.trackId} 
                song={song} 
                layout="list"
                isPlaying={playerState.currentSong?.trackId === song.trackId}
                onClick={() => playSong(song, localSongs)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Trending Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Trending Bollywood Hits</h2>
          <span className="text-xs text-pink-400 font-medium">See All</span>
        </div>
        
        {isLoading && trendingSongs.length === 0 ? (
           <div className="grid grid-cols-2 gap-4">
             {[1,2,3,4].map(i => <div key={i} className="aspect-square bg-white/5 rounded-2xl animate-pulse" />)}
           </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {trendingSongs.map(song => (
              <SongCard 
                key={song.trackId} 
                song={song} 
                isPlaying={playerState.currentSong?.trackId === song.trackId}
                onClick={() => playSong(song, trendingSongs)}
              />
            ))}
          </div>
        )}
      </section>

      {/* New Releases Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">New Indian Releases</h2>
        </div>
        <div className="flex flex-col gap-2">
           {isLoading && newReleases.length === 0 ? (
             [1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />)
           ) : (
             newReleases.map(song => (
              <SongCard 
                key={song.trackId} 
                song={song} 
                layout="list"
                isPlaying={playerState.currentSong?.trackId === song.trackId}
                onClick={() => playSong(song, newReleases)}
              />
            ))
           )}
        </div>
      </section>
    </div>
  );

  const renderSearch = () => (
    <div className="pb-32 pt-20 px-4 h-full animate-in fade-in slide-in-from-right-4 duration-300">
      {isLoading ? (
        <div className="flex justify-center mt-12">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {searchResults.length > 0 ? (
            searchResults.map(song => (
              <SongCard 
                key={song.trackId} 
                song={song} 
                layout="list"
                isPlaying={playerState.currentSong?.trackId === song.trackId}
                onClick={() => playSong(song, searchResults)}
              />
            ))
          ) : hasSearched ? (
            <div className="flex flex-col items-center justify-center mt-20 text-gray-500">
              <AlertCircle size={48} className="mb-2 opacity-50" />
              <p>No results found for "{searchQuery}"</p>
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center mt-20 text-gray-600">
              <Music size={48} className="mb-2 opacity-30" />
              <p>Start searching above</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderFavorites = () => (
    <div className="pb-32 pt-20 px-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Heart className="fill-red-500 text-red-500" />
        Your Favorites
      </h2>
      
      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-32 text-gray-500">
           <p className="text-lg">No favorites yet</p>
           <p className="text-sm">Songs you like will appear here</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {favorites.map(song => (
            <SongCard 
              key={song.trackId} 
              song={song} 
              layout="list"
              isPlaying={playerState.currentSong?.trackId === song.trackId}
              onClick={() => playSong(song, favorites)}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gray-950">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-900/20 rounded-full blur-[100px]" />
      </div>

      <Header 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchFocus={() => setActiveTab('search')}
        activeTab={activeTab}
        onImportMusic={handleImportMusic}
      />

      <main>
        {activeTab === 'home' && renderHome()}
        {activeTab === 'search' && renderSearch()}
        {activeTab === 'favorites' && renderFavorites()}
      </main>

      <MiniPlayer 
        playerState={playerState} 
        onTogglePlay={togglePlay}
        onOpenFull={() => setIsFullPlayerOpen(true)}
      />

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <FullPlayer 
        isOpen={isFullPlayerOpen} 
        onClose={() => setIsFullPlayerOpen(false)} 
        playerState={playerState}
        controls={{
          togglePlay,
          nextSong,
          prevSong,
          toggleShuffle,
          toggleRepeat,
          seek,
          toggleFavorite,
          isFavorite,
          setVolume
        }}
      />
    </div>
  );
};

export default App;