"""
Shared rate limiter instance. Created here (unbound) and attached to the app
in create_app() via limiter.init_app(app), so route modules can import and
decorate with @limiter.limit(...) without a circular import on the app object.

In-memory storage is fine at this scale (single gunicorn worker, matching the
same constraint already documented for the APScheduler reminder job) — revisit
if this ever moves to multiple workers or a distributed deployment.
"""
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(key_func=get_remote_address, default_limits=[])
