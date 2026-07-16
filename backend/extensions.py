"""
Central place to create Flask extension instances.

Why this file exists:
Earlier everything (db, jwt, mail, oauth) lived inside app.py, which meant
every route file had to `from app import db` — and app.py had to import
every route file. That's a circular import.

Instead: extensions are created here with NO app attached yet.
app.py calls `db.init_app(app)` etc. Route files just do
`from extensions import db` and it works no matter what order things load in.
"""

from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from authlib.integrations.flask_client import OAuth

db = SQLAlchemy()
jwt = JWTManager()
mail = Mail()
oauth = OAuth()

# Rate limiter — used mainly on /api/auth/login and /api/auth/register
# to stop brute-force login attempts and mass fake registrations.
# Default storage is in-memory, which is fine for a single Render instance.
# If you ever scale to multiple backend instances, switch storage_uri to Redis
# (e.g. storage_uri="redis://...") so all instances share the same counters.
limiter = Limiter(key_func=get_remote_address, default_limits=[])
