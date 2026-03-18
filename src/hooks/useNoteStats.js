import { useEffect, useState } from 'react';
import { useCounter } from '../contexts/CounterContext';

export const useNoteStats = (noteId, initialStats = {}) => {
  const { counters, incrementView, incrementDownload, updateRating, refreshStats } = useCounter();
  const [localStats, setLocalStats] = useState(initialStats);

  useEffect(() => {
    // Initial load - agar counter mein nahi hai to fetch karo
    if (noteId && !counters[noteId]) {
      refreshStats(noteId);
    }
  }, [noteId]);

  // Get current stats from global state (ya local fallback)
  const currentStats = counters[noteId] || localStats;

  return {
    views: currentStats.views || 0,
    downloads: currentStats.downloads || 0,
    rating: currentStats.rating || 0,
    ratingCount: currentStats.rating_count || 0,
    incrementView: () => incrementView(noteId),
    incrementDownload: () => incrementDownload(noteId),
    updateRating: (rating) => updateRating(noteId, rating)
  };
};