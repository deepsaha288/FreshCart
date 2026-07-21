"""Security utilities for JWT, OTP, and password hashing"""
import hashlib
import random
import string
from datetime import datetime, timedelta
from typing import Optional

import jwt

from app.core.config import settings


class SecurityUtils:
    """Utility functions for security operations"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using SHA256"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password
    
    @staticmethod
    def hash_otp(otp: str) -> str:
        """Hash an OTP using SHA256 (simpler for temporary codes)"""
        return hashlib.sha256(otp.encode()).hexdigest()
    
    @staticmethod
    def verify_otp(plain_otp: str, hashed_otp: str) -> bool:
        """Verify an OTP against its hash"""
        return hashlib.sha256(plain_otp.encode()).hexdigest() == hashed_otp
    
    @staticmethod
    def generate_otp(digits: int = settings.OTP_DIGITS) -> str:
        """Generate a random OTP"""
        return ''.join(random.choices(string.digits, k=digits))
    
    @staticmethod
    def create_access_token(user_id: str, expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token"""
        if expires_delta is None:
            expires_delta = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
        
        expire = datetime.utcnow() + expires_delta
        to_encode = {"user_id": user_id, "exp": expire, "type": "access"}
        
        encoded_jwt = jwt.encode(
            to_encode,
            settings.JWT_SECRET,
            algorithm=settings.JWT_ALGORITHM
        )
        return encoded_jwt
    
    @staticmethod
    def create_refresh_token(user_id: str, expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT refresh token"""
        if expires_delta is None:
            expires_delta = timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
        
        expire = datetime.utcnow() + expires_delta
        to_encode = {"user_id": user_id, "exp": expire, "type": "refresh"}
        
        encoded_jwt = jwt.encode(
            to_encode,
            settings.JWT_SECRET,
            algorithm=settings.JWT_ALGORITHM
        )
        return encoded_jwt
    
    @staticmethod
    def decode_token(token: str) -> dict:
        """Decode and verify a JWT token"""
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            return {"error": "Token expired"}
        except jwt.InvalidTokenError:
            return {"error": "Invalid token"}
