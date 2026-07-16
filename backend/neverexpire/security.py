import hashlib
import hmac
import secrets

_ALGORITHM = "sha256"
_ITERATIONS = 260_000


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(_ALGORITHM, password.encode("utf-8"), bytes.fromhex(salt), _ITERATIONS)
    return f"{_ALGORITHM}${_ITERATIONS}${salt}${digest.hex()}"


def verify_password(password: str, hashed_password: str) -> bool:
    algorithm, iterations, salt, digest_hex = hashed_password.split("$")
    candidate = hashlib.pbkdf2_hmac(algorithm, password.encode("utf-8"), bytes.fromhex(salt), int(iterations))
    return hmac.compare_digest(candidate.hex(), digest_hex)


def hash_token(raw_token: str) -> str:
    """
    For password-reset tokens, not passwords: the token itself is already a
    high-entropy random secret (not a low-entropy user-chosen value), so a
    plain fast hash is appropriate here — PBKDF2's slow hashing is for
    resisting brute-force of guessable passwords, which doesn't apply to a
    32-byte random token.
    """
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
