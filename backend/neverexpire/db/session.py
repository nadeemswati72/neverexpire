from contextlib import contextmanager

from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, sessionmaker

from .. import config

_engine = None
_SessionLocal = None


def init_engine():
    global _engine, _SessionLocal

    if config.DATABASE_URL:
        # Postgres (e.g. Neon) — real, persistent storage. No SQLite-specific
        # pragmas/connect_args needed; pool_pre_ping guards against the
        # provider closing idle connections out from under a long-lived worker.
        _engine = create_engine(config.DATABASE_URL, pool_pre_ping=True)
    else:
        config.DATA_DIR.mkdir(parents=True, exist_ok=True)
        _engine = create_engine(
            f"sqlite:///{config.DATABASE_PATH}",
            connect_args={"check_same_thread": False},
        )

        @event.listens_for(_engine, "connect")
        def _enable_fk(dbapi_connection, _):
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()

    _SessionLocal = sessionmaker(bind=_engine, autoflush=False, expire_on_commit=False)


@contextmanager
def get_session() -> Session:
    if _SessionLocal is None:
        raise RuntimeError("Call init_engine() before using get_session()")
    session = _SessionLocal()
    try:
        yield session
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
