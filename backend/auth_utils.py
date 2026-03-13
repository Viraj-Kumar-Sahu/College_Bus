from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize password hashing context
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT configuration
JWT_SECRET = os.getenv("JWT_SECRET", "devsecret")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))  # 7 days

# --- Password Utilities ---
def hash_password(password: str) -> str:
    """
    Hash a password safely. Bcrypt only supports up to 72 bytes, 
    so we truncate if necessary to prevent runtime errors.
    """
    password = password.encode("utf-8")[:72].decode("utf-8", errors="ignore")
    return pwd.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """
    Verify a password against its hash using the same truncation rule.
    Gracefully handle missing/blank hashes by returning False.
    """
    if not hashed:
        return False
    plain = plain.encode("utf-8")[:72].decode("utf-8", errors="ignore")
    try:
        return pwd.verify(plain, hashed)
    except Exception:
        return False

# --- JWT Utilities ---
def create_access_token(data: dict, minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES) -> str:
    """
    Create a JWT access token with expiration time.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=minutes)
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, JWT_SECRET, algorithm="HS256")
    return token


def decode_token(token: str):
    """
    Decode and verify a JWT token.
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None  # Token expired
    except jwt.InvalidTokenError:
        return None  # Invalid token
