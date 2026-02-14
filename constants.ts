export const ITUNES_API_BASE = 'https://itunes.apple.com/search';

// Base64 SVG for offline/default artwork
export const DEFAULT_ARTWORK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%238b5cf6;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23ec4899;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='600' height='600' fill='url(%23grad)' /%3E%3Ccircle cx='300' cy='300' r='120' fill='none' stroke='white' stroke-width='20' opacity='0.5' /%3E%3Ccircle cx='300' cy='300' r='60' fill='white' opacity='0.5' /%3E%3C/svg%3E";

// Helper to get high res image
export const getHighResArtwork = (url: string) => {
  if (!url || url === 'default') return DEFAULT_ARTWORK;
  return url.replace('100x100', '600x600');
};

export const INITIAL_SEARCH_TERMS = {
  trending: 'bollywood hits 2024',
  newReleases: 'new indian songs'
};