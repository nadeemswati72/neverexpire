import sys

from sqlalchemy.orm import Session

from .accounts import promote_to_admin, register_user
from .models import User
from .session import SessionLocal


def create_admin(session: Session, email: str, password: str, full_name: str) -> User:
    email = email.strip().lower()
    if session.query(User).filter_by(email=email).first() is None:
        register_user(session, email, password, full_name)
    return promote_to_admin(session, email)


if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python -m neverexpire.db.create_admin <email> <password> <full_name>")
        raise SystemExit(1)

    _, arg_email, arg_password, arg_full_name = sys.argv
    with SessionLocal() as session:
        admin_user = create_admin(session, arg_email, arg_password, arg_full_name)
        print(f"Admin user ready: {admin_user.email} (role={admin_user.role})")
