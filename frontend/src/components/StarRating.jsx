import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNoteStats } from '../hooks/useNoteStats';
import { useCounter } from '../contexts/CounterContext';

/**
 * Interactive star rating for a note.
 *
 * Fixes over the old inline version:
 * - Stars reflect the CURRENT USER's own rating (fetched once, cached in
 *   CounterContext), not the community average — clicking always shows
 *   what you personally gave it, not a number that silently changes to
 *   the aggregate.
 * - Logged-out users get a clear "Log in to rate" prompt instead of a
 *   click that silently does nothing.
 * - A brief "Thanks for rating!" confirmation shows after a successful
 *   submit, and a real error message shows if the request fails.
 *
 * Props:
 *   noteId        - required
 *   size           - 'sm' | 'md' (default 'md')
 *   showCount      - show "(N ratings)" next to the average (default true)
 */
export default function StarRating({ noteId, size = 'md', showCount = true }) {
  const { isAuthenticated } = useAuth();
  const { myRatings, fetchMyRating } = useCounter();
  const stats = useNoteStats(noteId);
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error'|'auth', text }

  const myRating = myRatings[noteId] || 0;

  useEffect(() => {
    if (isAuthenticated) fetchMyRating(noteId);
  }, [isAuthenticated, noteId]);

  useEffect(() => {
    if (!feedback) return undefined;
    const t = setTimeout(() => setFeedback(null), 2200);
    return () => clearTimeout(t);
  }, [feedback]);

  const navigate = useNavigate();

  const handleClick = async (value) => {
    if (submitting) return;

    if (!isAuthenticated) {
      setFeedback({ type: 'auth', text: 'Log in to rate this note' });
      return;
    }

    setSubmitting(true);
    const result = await stats.updateRating(value);
    setSubmitting(false);

    if (result?.success) {
      setFeedback({ type: 'success', text: 'Thanks for rating!' });
    } else {
      setFeedback({ type: 'error', text: "Couldn't save your rating — try again" });
    }
  };

  const starSize = size === 'sm' ? 15 : 19;
  // Priority for what a star's fill reflects: live hover preview > your own
  // rating (once loaded) > nothing pre-filled. Never falls back to
  // silently showing the community average as if it were "your" rating.
  const displayValue = hover || myRating;

  return (
    <div className="sr-wrap" onClick={(e) => e.stopPropagation()}>
      <div className="sr-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="sr-star-btn"
            onClick={() => handleClick(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            disabled={submitting}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            style={{
              fontSize: starSize,
              color: displayValue >= star ? '#f5b301' : '#d8dbe2',
            }}
          >
            ★
          </button>
        ))}
      </div>

      <span className="sr-avg">
        {stats.rating > 0 ? stats.rating.toFixed(1) : '—'}
        {showCount && <> · {stats.ratingCount} rating{stats.ratingCount === 1 ? '' : 's'}</>}
      </span>

      {myRating > 0 && !feedback && (
        <span className="sr-mine">You rated {myRating}★</span>
      )}

      {feedback && (
        <span className={`sr-feedback sr-feedback--${feedback.type}`}>
          {feedback.text}
          {feedback.type === 'auth' && (
            <button type="button" className="sr-login-link" onClick={() => navigate('/login')}>
              Log in
            </button>
          )}
        </span>
      )}

      <style>{`
        .sr-wrap { display: inline-flex; align-items: center; gap: 8px; flex-wrap: wrap; font-family: inherit; }
        .sr-stars { display: inline-flex; align-items: center; }
        .sr-star-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 1px 2px;
          line-height: 1;
          transition: color 0.12s, transform 0.1s;
        }
        .sr-star-btn:hover:not(:disabled) { transform: scale(1.12); }
        .sr-star-btn:disabled { cursor: default; opacity: 0.7; }
        .sr-avg { font-size: 12.5px; color: #6b7280; white-space: nowrap; }
        .sr-mine { font-size: 12px; font-weight: 600; color: #10b981; white-space: nowrap; }
        .sr-feedback {
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          animation: sr-fade-in 0.15s ease;
        }
        .sr-feedback--success { color: #10b981; }
        .sr-feedback--error { color: #ef4444; }
        .sr-feedback--auth { color: #6366f1; }
        .sr-login-link {
          background: #eef2ff;
          color: #4f46e5;
          border: none;
          border-radius: 6px;
          padding: 2px 8px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }
        @keyframes sr-fade-in {
          from { opacity: 0; transform: translateY(-2px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
