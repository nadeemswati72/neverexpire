import secrets
import uuid
from datetime import date, datetime, timedelta
from pathlib import Path

from PIL import Image
from sqlalchemy.orm import Session
from werkzeug.datastructures import FileStorage

from .. import config
from ..security import hash_password, hash_token, verify_password
from .models import FamilyRelationType, PasswordResetToken, Person, PersonRelationship, User

ALLOWED_PHOTO_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
RESET_TOKEN_TTL_HOURS = 1


def register_user(
    session: Session,
    email: str,
    password: str,
    full_name: str,
    date_of_birth: date | None = None,
) -> tuple[User, Person]:
    email = email.strip().lower()
    if session.query(User).filter_by(email=email).first() is not None:
        raise ValueError(f"A user with email {email!r} already exists")

    user = User(
        email=email,
        hashed_password=hash_password(password),
        full_name=full_name.strip(),
    )
    session.add(user)
    session.flush()

    person = Person(
        user_id=user.id,
        full_name=full_name.strip(),
        date_of_birth=date_of_birth,
        is_primary=True,
    )
    session.add(person)
    session.commit()

    return user, person


def authenticate_user(session: Session, email: str, password: str) -> User | None:
    user = session.query(User).filter_by(email=email.strip().lower()).first()
    if user is None or not user.is_active:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def promote_to_admin(session: Session, email: str) -> User:
    user = session.query(User).filter_by(email=email.strip().lower()).first()
    if user is None:
        raise ValueError(f"No user found with email {email!r}")
    user.role = "admin"
    session.commit()
    return user


def add_family_member(
    session: Session,
    owner_person_id: int,
    full_name: str,
    relation_type_code: str,
    date_of_birth: date | None = None,
) -> tuple[Person, PersonRelationship]:
    owner = session.get(Person, owner_person_id)
    if owner is None:
        raise ValueError(f"Person {owner_person_id} does not exist")

    relation_type = (
        session.query(FamilyRelationType)
        .filter_by(code=relation_type_code.strip().upper())
        .first()
    )
    if relation_type is None:
        raise ValueError(f"Unknown family relation type: {relation_type_code!r}")

    member = Person(user_id=owner.user_id, full_name=full_name.strip(), date_of_birth=date_of_birth)
    session.add(member)
    session.flush()

    relationship_row = PersonRelationship(
        person_id=owner.id,
        related_person_id=member.id,
        relation_type_id=relation_type.id,
    )
    session.add(relationship_row)
    session.commit()

    return member, relationship_row


def set_person_photo(session: Session, person: Person, file: FileStorage) -> None:
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_PHOTO_EXTENSIONS:
        raise ValueError("Unsupported image type. Use JPG, PNG, GIF, or WEBP.")

    config.AVATAR_DIR.mkdir(parents=True, exist_ok=True)
    filename = f"person_{person.id}_{uuid.uuid4().hex}{suffix}"
    dest = config.AVATAR_DIR / filename
    file.save(dest)

    try:
        with Image.open(dest) as image:
            image.verify()
    except Exception as exc:
        dest.unlink(missing_ok=True)
        raise ValueError("The uploaded file is not a valid image.") from exc

    old_photo_path = person.photo_path
    person.photo_path = f"avatars/{filename}"
    session.commit()

    if old_photo_path:
        (config.AVATAR_DIR / Path(old_photo_path).name).unlink(missing_ok=True)


def change_password(session: Session, user_id: int, current_password: str, new_password: str) -> bool:
    """Verify the caller's current password and set a new one. Returns False if it doesn't match."""
    user = session.get(User, user_id)
    if user is None or not verify_password(current_password, user.hashed_password):
        return False
    user.hashed_password = hash_password(new_password)
    session.commit()
    return True


def create_password_reset_token(session: Session, user: User) -> str:
    """Generate a reset token, store only its hash, and return the raw token (for the email link)."""
    raw_token = secrets.token_urlsafe(32)
    session.add(PasswordResetToken(
        user_id=user.id,
        token_hash=hash_token(raw_token),
        expires_at=datetime.utcnow() + timedelta(hours=RESET_TOKEN_TTL_HOURS),
    ))
    session.commit()
    return raw_token


def consume_password_reset_token(session: Session, raw_token: str, new_password: str) -> bool:
    """Validate a reset token (unused, unexpired) and set the new password. Returns success."""
    record = session.query(PasswordResetToken).filter_by(token_hash=hash_token(raw_token)).first()
    if record is None or record.used_at is not None or record.expires_at < datetime.utcnow():
        return False

    user = session.get(User, record.user_id)
    if user is None:
        return False

    user.hashed_password = hash_password(new_password)
    record.used_at = datetime.utcnow()
    session.commit()
    return True
