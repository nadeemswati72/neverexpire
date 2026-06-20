from .. import config
from . import models  # noqa: F401
from .base import Base
from .session import init_engine


def init_db() -> None:
    config.DATA_DIR.mkdir(parents=True, exist_ok=True)
    init_engine()
    from .session import _engine
    Base.metadata.create_all(bind=_engine)
    print(f"Database initialised at {config.DATABASE_PATH}")


if __name__ == "__main__":
    init_db()
