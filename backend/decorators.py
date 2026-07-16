"""
Shared route decorators.

Fix applied here: every admin-only route used to repeat this same 5 lines:

    user_id = get_jwt_identity()
    user = db.session.get(User, int(user_id))
    if not user or user.role != 'admin':
        return jsonify({'success': False, 'error': 'Admin access required'}), 403

...copy-pasted into ~14 different routes. That's a bug waiting to happen —
one day someone adds a new admin route and forgets the check, and now it's
open to any logged-in user. @admin_required makes that impossible to forget.
"""

from functools import wraps
from flask import jsonify, g
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models import User


def admin_required(fn):
    """
    Combines @jwt_required() with an admin-role check.
    Use it INSTEAD of @jwt_required() (not in addition to it) on admin routes.

    On success, stashes the User object on flask.g.current_user so the route
    doesn't have to look it up a second time.
    """
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        user = db.session.get(User, int(user_id))
        if not user or user.role != 'admin':
            return jsonify({'success': False, 'error': 'Admin access required'}), 403
        g.current_user = user
        return fn(*args, **kwargs)
    return wrapper
