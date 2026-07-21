"""Authentication request/response schemas"""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class SendOTPRequest(BaseModel):
    """Request to send OTP"""
    phone: str = Field(..., min_length=10, max_length=15, description="Phone number")


class SendOTPResponse(BaseModel):
    """Response after OTP is sent"""
    message: str
    phone: str
    otp_expires_in_minutes: int
    otp_for_testing: Optional[str] = None  # DEV: Remove in production


class VerifyOTPRequest(BaseModel):
    """Request to verify OTP"""
    phone: str = Field(..., min_length=10, max_length=15, description="Phone number")
    otp: str = Field(..., min_length=6, max_length=6, description="6-digit OTP")


class TokenResponse(BaseModel):
    """Token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # Seconds


class UserResponse(BaseModel):
    """User response"""
    id: str
    phone: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    role: str = "customer"
    is_verified: bool
    created_at: str


class VerifyOTPResponse(BaseModel):
    """Response after OTP verification"""
    message: str
    user: UserResponse
    tokens: TokenResponse


class RefreshTokenRequest(BaseModel):
    """Request to refresh token"""
    refresh_token: str


class RefreshTokenResponse(BaseModel):
    """Response after token refresh"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class LogoutRequest(BaseModel):
    """Logout request"""
    pass


class LogoutResponse(BaseModel):
    """Logout response"""
    message: str


class EmailRegisterRequest(BaseModel):
    """Request to register with email"""
    email: str = Field(..., min_length=5, description="Email address")
    password: str = Field(..., min_length=6, description="Password (min 6 characters)")
    name: Optional[str] = Field(None, description="User name")


class EmailLoginRequest(BaseModel):
    """Request to login with email"""
    email: str = Field(..., min_length=5, description="Email address")
    password: str = Field(..., min_length=6, description="Password")


class UpdateProfileRequest(BaseModel):
    """Request to update user profile"""
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

