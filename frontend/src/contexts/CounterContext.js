import React, { createContext, useContext, useState, useEffect } from 'react';

const CounterContext = createContext();

export const useCounter = () => {
  const context = useContext(CounterContext);
  if (!context) {
    throw new Error('useCounter must be used within CounterProvider');
  }
  return context;
};

export const CounterProvider = ({ children }) => {
  const [counters, setCounters] = useState({}); // { [noteId]: { views, downloads, rating, rating_count } }
  const [myRatings, setMyRatings] = useState({}); // { [noteId]: 1-5 } — the logged-in user's own rating per note

  // Fetch latest stats from backend
  const refreshStats = async (noteId) => {
    try {
      const response = await fetch(`https://study-portal-pi2w.onrender.com/api/notes/${noteId}/stats`);
      const data = await response.json();
      if (data.success) {
        setCounters(prev => ({
          ...prev,
          [noteId]: data.stats
        }));
      }
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  };

  // Fetch the current user's own rating for a note (separate from the
  // community average) — only meaningful when logged in. Cached in
  // myRatings so we don't refetch every time the widget remounts.
  const fetchMyRating = async (noteId) => {
    const token = localStorage.getItem('study_portal_token');
    if (!token) return;
    try {
      const response = await fetch(`https://study-portal-pi2w.onrender.com/api/notes/${noteId}/user-rating`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setMyRatings(prev => ({ ...prev, [noteId]: data.rating || 0 }));
    } catch (error) {
      console.error('Error fetching your rating:', error);
    }
  };

  // Increment view
  const incrementView = async (noteId) => {
    try {
      // Optimistic update
      setCounters(prev => ({
        ...prev,
        [noteId]: {
          ...(prev[noteId] || { views: 0, downloads: 0, rating: 0 }),
          views: ((prev[noteId]?.views || 0) + 1)
        }
      }));

      // Backend call
      const token = localStorage.getItem('study_portal_token');
      await fetch(`https://study-portal-pi2w.onrender.com/api/notes/${noteId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      // Refresh to get accurate count
      await refreshStats(noteId);
    } catch (error) {
      console.error('Error incrementing view:', error);
    }
  };

  // Increment download
  const incrementDownload = async (noteId) => {
    try {
      // Optimistic update
      setCounters(prev => ({
        ...prev,
        [noteId]: {
          ...(prev[noteId] || { views: 0, downloads: 0, rating: 0 }),
          downloads: ((prev[noteId]?.downloads || 0) + 1)
        }
      }));

      // Backend call
      const token = localStorage.getItem('study_portal_token');
      await fetch(`https://study-portal-pi2w.onrender.com/api/notes/${noteId}/download`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      // Refresh to get accurate count
      await refreshStats(noteId);
    } catch (error) {
      console.error('Error incrementing download:', error);
    }
  };

  // Update rating — returns a result object so the calling widget can show
  // proper feedback (success toast, "please log in", or an error) instead
  // of silently doing nothing.
  const updateRating = async (noteId, ratingValue) => {
    const token = localStorage.getItem('study_portal_token');
    if (!token) {
      return { success: false, reason: 'unauthenticated' };
    }
    try {
      const response = await fetch(`https://study-portal-pi2w.onrender.com/api/notes/${noteId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: ratingValue })
      });

      if (response.ok) {
        // Optimistically record it as "my rating" immediately, then
        // refresh the community average in the background.
        setMyRatings(prev => ({ ...prev, [noteId]: ratingValue }));
        refreshStats(noteId);
        return { success: true };
      }
      const data = await response.json().catch(() => ({}));
      return { success: false, reason: 'error', message: data.error };
    } catch (error) {
      console.error('Error updating rating:', error);
      return { success: false, reason: 'error', message: error.message };
    }
  };

  return (
    <CounterContext.Provider value={{
      counters,
      myRatings,
      incrementView,
      incrementDownload,
      updateRating,
      refreshStats,
      fetchMyRating
    }}>
      {children}
    </CounterContext.Provider>
  );
};