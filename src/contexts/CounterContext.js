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
  const [counters, setCounters] = useState({}); // { [noteId]: { views, downloads, rating } }

  // Fetch latest stats from backend
  const refreshStats = async (noteId) => {
    try {
      const response = await fetch(`https://study-portal-ill8.onrender.com/api/notes/${noteId}/stats`);
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
      await fetch(`https://study-portal-ill8.onrender.com/api/notes/${noteId}`, {
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
      await fetch(`https://study-portal-ill8.onrender.com/api/notes/${noteId}/download`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      // Refresh to get accurate count
      await refreshStats(noteId);
    } catch (error) {
      console.error('Error incrementing download:', error);
    }
  };

  // Update rating
  const updateRating = async (noteId, ratingValue) => {
    try {
      const token = localStorage.getItem('study_portal_token');
      const response = await fetch(`https://study-portal-ill8.onrender.com/api/notes/${noteId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: ratingValue })
      });
      
      if (response.ok) {
        await refreshStats(noteId);
      }
    } catch (error) {
      console.error('Error updating rating:', error);
    }
  };

  return (
    <CounterContext.Provider value={{
      counters,
      incrementView,
      incrementDownload,
      updateRating,
      refreshStats
    }}>
      {children}
    </CounterContext.Provider>
  );
};