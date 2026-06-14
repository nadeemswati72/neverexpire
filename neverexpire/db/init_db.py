from .. import config
from . import models  # noqa: F401  (registers models on Base.metadata)
from .base import Base
from .session import engine


def init_db() -> None:
    config.DATA_DIR.mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_db()
