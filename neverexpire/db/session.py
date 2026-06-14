from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker

from .. import config

engine = create_engine(f"sqlite:///{config.DATABASE_PATH}")


@event.listens_for(engine, "connect")
def _enable_sqlite_foreign_keys(dbapi_connection, connection_record):
    # SQLite only enforces FK constraints (and ON DELETE CASCADE/SET NULL)
    # when this pragma is set on each new connection.
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
