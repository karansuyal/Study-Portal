// Vercel Edge Middleware — runs on Vercel's edge network before the
// vercel.json rewrite that sends every path to /index.html.
//
// WHY THIS FILE EXISTS:
// react-helmet-async (see src/pages/NoteDetail.jsx) sets the page
// <title>/description/og:* tags client-side, after React mounts and the
// note data has been fetched. That's enough for Google — Googlebot
// executes JavaScript and waits for the page to render before indexing
// it. It is NOT enough for link-preview crawlers: WhatsApp, Telegram,
// Facebook, Twitter/X, Slack, Discord etc. fetch the raw HTML of a
// shared URL and do NOT execute JavaScript, so they only ever see
// whatever is in frontend/public/index.html's static <head> — i.e. the
// generic site title, not "DBMS Unit 1 Notes".
//
// This middleware detects those specific bot user-agents and, only for
// them, returns a small hand-built HTML page with the real og:title /
// og:description / og:image for that note (fetched from the backend),
// plus a meta-refresh to the real SPA URL for the rare bot that does
// follow redirects/refresh. Every other visitor (real humans, Googlebot)
// falls through untouched to the normal SPA via the vercel.json rewrite.
//
// This is the standard, widely-used "dynamic rendering for crawlers"
// pattern for SPAs that don't have full SSR — it only needs to cover the
// `/notes/:slug` path, since that's the only page students actually
// paste into a WhatsApp group.

export const config = {
  matcher: '/notes/:slug*',
};

const BOT_USER_AGENT_RE =
  /facebookexternalhit|Facebot|Twitterbot|WhatsApp|TelegramBot|Slackbot|Discordbot|LinkedInBot|SkypeUriPreview|Pinterest|redditbot|vkShare|W3C_Validator|Googlebot/i;

const API_BASE = 'https://study-portal-pi2w.onrender.com/api';
const SITE_URL = 'https://study-portal-app.vercel.app';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[ch]));
}

export default async function middleware(request) {
  const userAgent = request.headers.get('user-agent') || '';
  if (!BOT_USER_AGENT_RE.test(userAgent)) {
    // Not a known crawler — let the request continue to the normal
    // vercel.json rewrite (-> index.html) so real visitors get the SPA.
    return;
  }

  const url = new URL(request.url);
  const slug = decodeURIComponent(url.pathname.replace(/^\/notes\//, '').replace(/\/$/, ''));
  if (!slug) return;

  try {
    const apiResponse = await fetch(`${API_BASE}/notes/slug/${encodeURIComponent(slug)}`, {
      headers: { accept: 'application/json' },
    });
    if (!apiResponse.ok) return; // fall through to the normal SPA (which will show its own 404)

    const data = await apiResponse.json();
    const note = data && data.note;
    if (!data.success || !note) return;

    const pageUrl = `${SITE_URL}/notes/${slug}`;
    const title = note.title || 'Study Portal';
    const rawDescription =
      note.description ||
      `Download ${title} for ${note.subject_name || note.course_name || 'your course'} on Study Portal — free, student-uploaded notes.`;
    const description = String(rawDescription).replace(/\s+/g, ' ').trim().slice(0, 160);
    const image = note.youtube_thumbnail || `${SITE_URL}/logo.png`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)} | Study Portal</title>
<meta name="description" content="${escapeHtml(description)}" />
<link rel="canonical" href="${pageUrl}" />

<meta property="og:type" content="article" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:image" content="${escapeHtml(image)}" />
<meta property="og:url" content="${pageUrl}" />
<meta property="og:site_name" content="Study Portal" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${escapeHtml(image)}" />

<meta http-equiv="refresh" content="0; url=${escapeHtml(pageUrl)}" />
</head>
<body>
<p><a href="${escapeHtml(pageUrl)}">${escapeHtml(title)}</a></p>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  } catch (err) {
    // Backend unreachable, bad response, etc. — never block the request,
    // just let it fall through to the normal SPA.
    return;
  }
}
