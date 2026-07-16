"""Small stateless helpers, used by more than one route file."""

from flask import current_app


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']


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
