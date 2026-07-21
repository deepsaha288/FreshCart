"""User database model"""
from datetime import datetime
from typing import Optional

from beanie import Document


class User(Document):
    """User model for MongoDB"""
    
    phone: str  # Unique phone number
    otp_hash: Optional[str] = None
    otp_attempts: int = 0
    otp_expires_at: Optional[datetime] = None
    
    refresh_token: Optional[str] = None
    
    name: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    
    role: str = "customer"  # customer or admin
    is_verified: bool = False
    is_active: bool = True
    is_blocked: bool = False
    
    last_login: Optional[datetime] = None
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()
    
    class Settings:
        """Beanie model settings"""
        collection = "users"
    
    class Config:
        json_schema_extra = {
            "example": {
                "phone": "9876543210",
                "name": "John Doe",
                "email": "john@example.com",
                "role": "customer",
                "is_verified": True,
            }
        }
