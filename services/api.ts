import { ITUNES_API_BASE } from '../constants';
import { Song } from '../types';

export const searchSongs = async (term: string, limit = 20): Promise<Song[]> => {
  try {
    const response = await fetch(`${ITUNES_API_BASE}?term=${encodeURIComponent(term)}&media=music&entity=song&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.results.filter((item: any) => item.kind === 'song' && item.previewUrl);
  } catch (error) {
    console.error('Error fetching songs:', error);
    return [];
  }
};
