"""Small stateless helpers, used by more than one route file."""

import base64
import io
import re
from urllib.parse import quote

from flask import current_app


def slugify_text(text):
    """
    Turns arbitrary text into a URL-safe slug fragment: lowercase,
    non-alphanumeric runs collapsed to a single '-', no leading/trailing
    '-'. Pure string function, no DB access, so it's easy to unit test
    and reuse from both the upload route and any backfill script.

    'DBMS Unit-1 (Notes) 2024!!' -> 'dbms-unit-1-notes-2024'
    """
    text = (text or '').lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')


def build_note_slug(title, note_id, course_name=None, subject_name=None,
                     semester=None, note_type=None, max_base_len=180):
    """
    Builds a human-readable, SEO-friendly slug for a Note, e.g.
    'btech-sem-3-dbms-unit-1-notes-42'.

    The trailing '-<note_id>' is what actually guarantees uniqueness (a DB
    row id is never reused), so a slug collision is impossible even if two
    notes have the exact same title/course/subject — the base part is only
    there to make the URL readable and keyword-rich for search engines.
    Callers must pass `note_id` (flush the session first if it's a brand
    new, not-yet-committed row) so it can be appended.
    """
    parts = []
    if course_name:
        parts.append(course_name)
    if semester:
        parts.append(f"sem {semester}")
    if subject_name:
        parts.append(subject_name)
    if note_type:
        parts.append(note_type)
    parts.append(title or 'note')

    base = slugify_text(' '.join(parts))[:max_base_len].strip('-')
    if not base:
        base = 'note'
    return f"{base}-{note_id}"


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']


def build_upi_uri(upi_id, payee_name, amount_rupees, transaction_ref, note_title):
    """
    Builds a standard UPI 'intent' URI (the same format every UPI app —
    GPay, PhonePe, Paytm, BHIM — reads when you scan a QR or tap a
    upi://pay link). Putting the amount (am) and a unique transaction ref
    (tr) in the link means the app opens with the amount pre-filled and
    the payment traceable back to this specific order.

    We deliberately do NOT rely on this alone to confirm payment — UPI
    gives no server-side callback for a personal VPA, which is exactly why
    the manual-review flow (UTR submission + admin approval) still exists.
    """
    params = {
        # 'pa' (VPA) must keep its '@' literal — UPI apps resolve the payee's
        # bank name by looking up the raw "handle@bank" string, and a %40
        # encoded '@' makes several apps (BHIM, some bank apps) fail that
        # lookup even though the link still technically opens.
        'pa': quote(str(upi_id), safe='@.-_'),
        'pn': quote(str(payee_name)),       # payee name (spaces etc. OK to encode)
        'am': f"{amount_rupees:.2f}",
        'cu': 'INR',
        'tr': quote(str(transaction_ref)),  # your own order reference
        'tn': quote(f"StudyPortal-{note_title}"[:50]),
    }
    query = '&'.join(f"{k}={v}" for k, v in params.items())
    return f"upi://pay?{query}"


def generate_qr_data_uri(data):
    """
    Renders `data` (any string, typically a upi:// URI) as a PNG QR code and
    returns it as a data: URI the frontend can drop straight into an <img
    src=...> with no extra request or file storage needed.
    """
    import qrcode

    img = qrcode.make(data, box_size=8, border=2)
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    encoded = base64.b64encode(buf.getvalue()).decode('ascii')
    return f"data:image/png;base64,{encoded}"


def format_bytes(size_bytes):
    if not size_bytes:
        return 'N/A'
    units = ['B', 'KB', 'MB', 'GB']
    size = size_bytes
    unit_index = 0
    while size >= 1024 and unit_index < len(units) - 1:
        size /= 1024
        unit_index += 1
    return f"{size:.1f} {units[unit_index]}"