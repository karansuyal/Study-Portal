"""Small stateless helpers, used by more than one route file."""

import base64
import io
from urllib.parse import quote

from flask import current_app


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
        'pa': upi_id,                       # payee address (your UPI ID)
        'pn': payee_name,                   # payee name
        'am': f"{amount_rupees:.2f}",
        'cu': 'INR',
        'tr': transaction_ref,              # your own order reference
        'tn': f"StudyPortal-{note_title}"[:50],
    }
    query = '&'.join(f"{k}={quote(str(v))}" for k, v in params.items())
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