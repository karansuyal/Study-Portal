import React, { useState } from 'react';
import { FaWhatsapp, FaTelegramPlane, FaLink, FaCheck } from 'react-icons/fa';

/**
 * Share buttons for a single note's SEO page.
 *
 * This is the main organic-growth lever the whole slug/SEO feature is
 * built around: students forward notes to their class WhatsApp/Telegram
 * groups constantly, and every one of those shares is a free, trusted
 * link back to a specific /notes/<slug> page (not just the homepage) for
 * whoever clicks it next.
 *
 * Uses WhatsApp/Telegram's documented share-intent URLs — no SDK, no API
 * key, works identically on mobile (opens the app) and desktop (opens
 * web.whatsapp.com / web Telegram).
 *
 * Props:
 *   url          - required, absolute URL to share (the note's /notes/:slug page)
 *   title        - required, note title, used in the pre-filled message
 *   size         - 'sm' | 'md' (default 'md')
 *   variant      - 'row' (icons inline, default) | 'stacked' (icons with labels, full width)
 *   darkMode     - optional, for icon-button contrast on dark backgrounds
 */
export default function ShareButtons({ url, title, size = 'md', variant = 'row', darkMode = false }) {
  const [copied, setCopied] = useState(false);

  const shareText = `📚 ${title} — Study Portal\n${url}`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const telegramHref = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`📚 ${title} — Study Portal`)}`;

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can fail (older browsers, non-HTTPS) — fall back to
      // a manual prompt so the link is still copyable instead of silently
      // doing nothing.
      window.prompt('Copy this link:', url);
    }
  };

  const iconSize = size === 'sm' ? 14 : 17;
  const btnPad = size === 'sm' ? '6px' : '9px';

  if (variant === 'stacked') {
    return (
      <div className="sb-stacked" onClick={(e) => e.stopPropagation()}>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="sb-stacked-btn sb-whatsapp"
        >
          <FaWhatsapp size={iconSize + 2} /> Share on WhatsApp
        </a>
        <a
          href={telegramHref}
          target="_blank"
          rel="noopener noreferrer"
          className="sb-stacked-btn sb-telegram"
        >
          <FaTelegramPlane size={iconSize + 2} /> Share on Telegram
        </a>
        <button type="button" className="sb-stacked-btn sb-copy" onClick={handleCopy}>
          {copied ? <FaCheck size={iconSize} /> : <FaLink size={iconSize} />}
          {copied ? 'Link copied!' : 'Copy link'}
        </button>

        <style>{`
          .sb-stacked { display: flex; flex-direction: column; gap: 8px; width: 100%; }
          .sb-stacked-btn {
            display: flex; align-items: center; justify-content: center; gap: 8px;
            padding: 11px 16px; border-radius: 8px; border: none; cursor: pointer;
            font-weight: 600; font-size: 14px; text-decoration: none; width: 100%;
            box-sizing: border-box; transition: filter 0.15s;
          }
          .sb-stacked-btn:hover { filter: brightness(0.95); }
          .sb-whatsapp { background: #25D366; color: white; }
          .sb-telegram { background: #229ED9; color: white; }
          .sb-copy { background: ${darkMode ? '#252530' : '#f3f4f6'}; color: ${darkMode ? '#f0f0fa' : '#374151'}; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="sb-row" onClick={(e) => e.stopPropagation()}>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="sb-icon-btn sb-whatsapp"
        style={{ padding: btnPad }}
        title="Share on WhatsApp"
        aria-label="Share on WhatsApp"
      >
        <FaWhatsapp size={iconSize} />
      </a>
      <a
        href={telegramHref}
        target="_blank"
        rel="noopener noreferrer"
        className="sb-icon-btn sb-telegram"
        style={{ padding: btnPad }}
        title="Share on Telegram"
        aria-label="Share on Telegram"
      >
        <FaTelegramPlane size={iconSize} />
      </a>
      <button
        type="button"
        className="sb-icon-btn sb-copy"
        style={{ padding: btnPad, background: darkMode ? '#252530' : '#f3f4f6', color: darkMode ? '#f0f0fa' : '#374151' }}
        onClick={handleCopy}
        title={copied ? 'Copied!' : 'Copy link'}
        aria-label="Copy link"
      >
        {copied ? <FaCheck size={iconSize} /> : <FaLink size={iconSize} />}
      </button>

      <style>{`
        .sb-row { display: inline-flex; align-items: center; gap: 6px; }
        .sb-icon-btn {
          display: inline-flex; align-items: center; justify-content: center;
          border: none; border-radius: 7px; cursor: pointer; text-decoration: none;
          transition: filter 0.15s, transform 0.1s;
        }
        .sb-icon-btn:hover { filter: brightness(0.95); transform: scale(1.06); }
        .sb-whatsapp { background: #25D366; color: white; }
        .sb-telegram { background: #229ED9; color: white; }
      `}</style>
    </div>
  );
}
