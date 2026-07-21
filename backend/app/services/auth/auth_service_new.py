"""Authentication service - In-memory for local testing"""
from datetime import datetime, timedelta
from typing import Dict

from app.core.security import SecurityUtils

# In-memory user storage for development/testing
MOCK_USERS: Dict[str, dict] = {}
MOCK_OTPS: Dict[str, dict] = {}


class AuthService:
    """Authentication business logic"""
    
    @staticmethod
    async def send_otp(phone: str) -> dict:
        """Send OTP to phone number"""
        # Generate OTP
        otp = SecurityUtils.generate_otp()
        otp_hash = SecurityUtils.hash_otp(otp)  # Use SHA256 for OTP
        
        # Set expiry
        otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
        
        # Store OTP in memory for this phone
        MOCK_OTPS[phone] = {
            "otp_hash": otp_hash,
            "otp_expires_at": otp_expires_at,
            "otp_attempts": 0
        }
        
        # Print OTP for development (in production, send via SMS)
        print(f"🔐 DEBUG: OTP for {phone} is {otp}")
        
        return {
            "message": f"OTP sent to {phone}. Valid for 10 minutes.",
            "phone": phone,
            "otp_expires_in_minutes": 10
        }
    
    @staticmethod
    async def verify_otp(phone: str, otp: str) -> dict:
        """Verify OTP and return tokens"""
        # Check if OTP was sent
        if phone not in MOCK_OTPS:
            return {"error": "User not found"}
        
        otp_data = MOCK_OTPS[phone]
        
        # Check if OTP is expired
        if datetime.utcnow() > otp_data["otp_expires_at"]:
            return {"error": "OTP expired"}
        
        # Check OTP attempts
        if otp_data["otp_attempts"] >= 3:
            return {"error": "Too many OTP attempts. Please request a new OTP."}
        
        # Verify OTP
        if not SecurityUtils.verify_otp(otp, otp_data["otp_hash"]):
            otp_data["otp_attempts"] += 1
            return {"error": "Invalid OTP"}
        
        # Create user in memory if doesn't exist
        if phone not in MOCK_USERS:
            MOCK_USERS[phone] = {
                "id": phone,
                "phone": phone,
                "name": None,
                "email": None,
                "is_verified": True,
                "created_at": datetime.utcnow().isoformat()
            }
        
        user = MOCK_USERS[phone]
        user["is_verified"] = True
        user["last_login"] = datetime.utcnow().isoformat()
        
        # Generate tokens
        access_token = SecurityUtils.create_access_token(str(phone))
        refresh_token = SecurityUtils.create_refresh_token(str(phone))
        user["refresh_token"] = refresh_token
        
        # Clean up OTP
        del MOCK_OTPS[phone]
        
        return {
            "message": "Login successful",
            "user": {
                "id": user["id"],
                "phone": user["phone"],
                "name": user["name"],
                "email": user["email"],
                "is_verified": user["is_verified"],
                "role": "customer",
                "created_at": user["created_at"]
            },
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": 900
        }
    
    @staticmethod
    async def refresh_token_fn(phone: str, refresh_token: str) -> dict:
        """Refresh access token"""
        if phone not in MOCK_USERS:
            return {"error": "User not found"}
        
        user = MOCK_USERS[phone]
        if user.get("refresh_token") != refresh_token:
            return {"error": "Invalid refresh token"}
        
        # Generate new access token
        access_token = SecurityUtils.create_access_token(str(phone))
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": 900
        }
    
    @staticmethod
    async def get_user(user_id: str) -> dict:
        """Get user by ID"""
        if user_id not in MOCK_USERS:
            return {"error": "User not found"}
        
        user = MOCK_USERS[user_id]
        return {
            "id": user["id"],
            "phone": user["phone"],
            "name": user["name"],
            "email": user["email"],
            "is_verified": user["is_verified"],
            "role": "customer",
            "created_at": user["created_at"]
        }
    
    @staticmethod
    async def logout(user_id: str) -> dict:
        """Logout user"""
        if user_id in MOCK_USERS:
            MOCK_USERS[user_id]["refresh_token"] = None
        
        return {"message": "Logged out successfully"}
