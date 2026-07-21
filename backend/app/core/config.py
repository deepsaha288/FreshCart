"""Configuration management for FreshCart"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings from environment variables"""
    
    # API
    API_TITLE: str = "FreshCart API"
    API_VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    
    # Database
    MONGODB_URI: str = "mongodb://admin:freshcart123@localhost:27017/freshcartdb?authSource=admin&replicaSet=rs0"
    
    # JWT
    JWT_SECRET: str = "freshcart-secret-key-change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    
    # OTP
    OTP_DIGITS: int = 6
    OTP_EXPIRY_MINUTES: int = 10
    OTP_MAX_ATTEMPTS: int = 3
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
