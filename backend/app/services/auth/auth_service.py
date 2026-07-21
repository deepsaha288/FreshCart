"""Authentication service"""
from datetime import datetime, timedelta
from typing import Optional, Dict

from app.core.security import SecurityUtils
from app.core.config import settings

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
        print(f"[DEBUG] OTP for {phone} is {otp}")
        
        return {
            "message": f"OTP sent to {phone}. Valid for 10 minutes.",
            "phone": phone,
            "otp_expires_in_minutes": 10,
            "otp_for_testing": otp  # DEV: Remove in production
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
            "tokens": {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer",
                "expires_in": 900
            }
        }
    
    @staticmethod
    async def refresh_token(refresh_token: str) -> dict:
        """Refresh access token by decoding the refresh JWT to get user_id"""
        import jwt
        try:
            payload = jwt.decode(
                refresh_token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
            )
        except jwt.ExpiredSignatureError:
            return {"error": "Refresh token expired"}
        except jwt.InvalidTokenError:
            return {"error": "Invalid refresh token"}

        if payload.get("type") != "refresh":
            return {"error": "Invalid token type"}

        user_id = payload.get("user_id")
        if user_id not in MOCK_USERS:
            return {"error": "User not found"}

        user = MOCK_USERS[user_id]
        if user.get("refresh_token") != refresh_token:
            return {"error": "Invalid refresh token"}

        # Generate new access token
        access_token = SecurityUtils.create_access_token(str(user_id))

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
            "phone": user.get("phone"),
            "name": user.get("name"),
            "email": user.get("email"),
            "is_verified": user.get("is_verified", True),
            "role": "customer",
            "created_at": user.get("created_at", datetime.utcnow().isoformat())
        }

    @staticmethod
    async def update_user(user_id: str, name: Optional[str] = None, email: Optional[str] = None, phone: Optional[str] = None) -> dict:
        """Update user profile details"""
        if user_id not in MOCK_USERS:
            return {"error": "User not found"}

        user = MOCK_USERS[user_id]
        if name is not None:
            user["name"] = name
        if email is not None:
            user["email"] = email
        if phone is not None:
            user["phone"] = phone

        return {
            "id": user["id"],
            "phone": user.get("phone"),
            "name": user.get("name"),
            "email": user.get("email"),
            "is_verified": user.get("is_verified", True),
            "role": "customer",
            "created_at": user.get("created_at", datetime.utcnow().isoformat())
        }

    
    @staticmethod
    async def logout(user_id: str) -> dict:
        """Logout user"""
        if user_id in MOCK_USERS:
            MOCK_USERS[user_id]["refresh_token"] = None
        
        return {"message": "Logged out successfully"}
    
    @staticmethod
    async def register_email(email: str, password: str, name: str = None) -> dict:
        """Register user with email and password"""
        # Check if email already exists
        for user in MOCK_USERS.values():
            if user.get("email") == email:
                return {"error": "Email already registered"}
        
        # Hash password
        password_hash = SecurityUtils.hash_password(password)
        
        # Create user
        user_id = email
        MOCK_USERS[email] = {
            "id": email,
            "phone": None,
            "email": email,
            "name": name or email.split("@")[0],
            "password_hash": password_hash,
            "is_verified": True,
            "created_at": datetime.utcnow().isoformat()
        }
        
        # Generate tokens
        access_token = SecurityUtils.create_access_token(email)
        refresh_token = SecurityUtils.create_refresh_token(email)
        MOCK_USERS[email]["refresh_token"] = refresh_token
        
        print(f"[DEBUG] User registered with email: {email}")
        
        return {
            "message": "Registration successful",
            "user": {
                "id": MOCK_USERS[email]["id"],
                "email": MOCK_USERS[email]["email"],
                "name": MOCK_USERS[email]["name"],
                "phone": None,
                "is_verified": True,
                "role": "customer",
                "created_at": MOCK_USERS[email]["created_at"]
            },
            "tokens": {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer",
                "expires_in": 900
            }
        }
    
    @staticmethod
    async def login_email(email: str, password: str) -> dict:
        """Login with email and password"""
        # Find user by email
        user = None
        for u in MOCK_USERS.values():
            if u.get("email") == email:
                user = u
                break
        
        if not user:
            return {"error": "Email not found"}
        
        # Verify password
        if "password_hash" not in user:
            return {"error": "Password not set for this account"}
        
        if not SecurityUtils.verify_password(password, user["password_hash"]):
            return {"error": "Invalid password"}
        
        # Generate tokens
        access_token = SecurityUtils.create_access_token(email)
        refresh_token = SecurityUtils.create_refresh_token(email)
        user["refresh_token"] = refresh_token
        user["last_login"] = datetime.utcnow().isoformat()
        
        print(f"[DEBUG] User logged in with email: {email}")
        
        return {
            "message": "Login successful",
            "user": {
                "id": user["id"],
                "email": user["email"],
                "name": user["name"],
                "phone": user.get("phone"),
                "is_verified": True,
                "role": "customer",
                "created_at": user["created_at"]
            },
            "tokens": {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer",
                "expires_in": 900
            }
        }
