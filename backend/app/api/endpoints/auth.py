"""Authentication API endpoints"""
from typing import Optional

from fastapi import APIRouter, HTTPException, Request

from app.core.security import SecurityUtils
from app.models.schemas.auth import (
    SendOTPRequest,
    SendOTPResponse,
    VerifyOTPRequest,
    VerifyOTPResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    LogoutResponse,
    UserResponse,
    EmailRegisterRequest,
    EmailLoginRequest,
    UpdateProfileRequest
)
from app.services.auth.auth_service import AuthService


router = APIRouter(prefix="/api/auth", tags=["auth"])


def get_current_user(authorization: Optional[str]) -> str:
    """Get user from token"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    try:
        token = authorization.split(" ")[1]
    except IndexError:
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    payload = SecurityUtils.decode_token(token)
    if "error" in payload:
        raise HTTPException(status_code=401, detail=payload["error"])
    
    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token type")
    
    return payload["user_id"]


@router.post("/send-otp", response_model=SendOTPResponse)
async def send_otp(request: SendOTPRequest):
    """Send OTP to phone number"""
    result = await AuthService.send_otp(request.phone)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/verify-otp", response_model=VerifyOTPResponse)
async def verify_otp(request: VerifyOTPRequest):
    """Verify OTP and login user"""
    result = await AuthService.verify_otp(request.phone, request.otp)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/refresh", response_model=RefreshTokenResponse)
async def refresh_token(request: RefreshTokenRequest):
    """Refresh access token"""
    result = await AuthService.refresh_token(request.refresh_token)
    if "error" in result:
        raise HTTPException(status_code=401, detail=result["error"])
    return result


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(request: Request):
    """Get current user information"""
    authorization = request.headers.get("authorization")
    user_id = get_current_user(authorization)
    result = await AuthService.get_user(user_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.put("/profile", response_model=UserResponse)
async def update_profile(profile_req: UpdateProfileRequest, request: Request):
    """Update current user profile information"""
    authorization = request.headers.get("authorization")
    user_id = get_current_user(authorization)
    result = await AuthService.update_user(
        user_id=user_id,
        name=profile_req.name,
        email=profile_req.email,
        phone=profile_req.phone
    )
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result



@router.post("/logout", response_model=LogoutResponse)
async def logout(request: Request):
    """Logout user"""
    authorization = request.headers.get("authorization")
    user_id = get_current_user(authorization)
    result = await AuthService.logout(user_id)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/register-email", response_model=VerifyOTPResponse)
async def register_email(request: EmailRegisterRequest):
    """Register new user with email and password"""
    result = await AuthService.register_email(request.email, request.password, request.name)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/login-email", response_model=VerifyOTPResponse)
async def login_email(request: EmailLoginRequest):
    """Login with email and password"""
    result = await AuthService.login_email(request.email, request.password)
    if "error" in result:
        raise HTTPException(status_code=401, detail=result["error"])
    return result
