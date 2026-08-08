import { useEffect, useMemo, useRef } from 'react';
import { API_URL } from '../services/api';

const POLL_INTERVAL_MS = 8000;

function getToken() {
  return localStorage.getItem('noteshub_token') || localStorage.getItem('study_portal_token');
}

/**
 * Silently polls `/api/payments/notes/<id>/access` for every locked premium
 * item currently in `items`, and calls `onUnlocked(id)` the moment an admin
 * approves the pending purchase — so the note flips from locked to
 * downloadable without the student needing to refresh the page.
 *
 * - Only polls items that are actually locked + premium; stops entirely
 *   once nothing needs watching.
 * - Pauses while the tab is in the background (document.hidden) to avoid
 *   wasting requests on an inactive tab.
 * - Depends on a stable string key (not the `items` array reference) so it
 *   doesn't restart the interval on every render just because the parent
 *   re-created the array.
 */
export function usePendingUnlock(items, onUnlocked) {
  const onUnlockedRef = useRef(onUnlocked);
  onUnlockedRef.current = onUnlocked;

  const lockedIdsKey = useMemo(() => {
    const ids = (items || [])
      .filter((m) => m && m.is_premium && m.locked)
      .map((m) => m.id);
    return ids.join(',');
  }, [items]);

  useEffect(() => {
    if (!lockedIdsKey) return undefined;
    const ids = lockedIdsKey.split(',').map(Number);
    let cancelled = false;

    const poll = async () => {
      if (document.hidden) return;
      const token = getToken();
      await Promise.all(
        ids.map(async (id) => {
          try {
            const res = await fetch(`${API_URL}/payments/notes/${id}/access`, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();
            if (!cancelled && data.success && data.has_access) {
              onUnlockedRef.current(id);
            }
          } catch {
            // transient network error — just try again next tick
          }
        })
      );
    };

    const interval = setInterval(poll, POLL_INTERVAL_MS);
    const kickoff = setTimeout(poll, 1500); // also check shortly after mount

    return () => {
      cancelled = true;
      clearInterval(interval);
      clearTimeout(kickoff);
    };
  }, [lockedIdsKey]);
}
