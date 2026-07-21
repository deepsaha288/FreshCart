"""Cart database model"""
from datetime import datetime
from typing import List, Optional

from beanie import Document
from pydantic import BaseModel


class CartItem(BaseModel):
    """Cart item structure"""
    
    product_id: str
    product_name: str
    price_snapshot: float  # Price at the time of adding to cart
    quantity: int
    unit: str


class Cart(Document):
    """Cart model for MongoDB"""
    
    user_id: str
    items: List[CartItem] = []
    total_price: float = 0.0
    
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()
    
    class Settings:
        """Beanie model settings"""
        collection = "carts"
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "507f1f77bcf86cd799439011",
                "items": [
                    {
                        "product_id": "507f1f77bcf86cd799439012",
                        "product_name": "Fresh Tomatoes",
                        "price_snapshot": 50.0,
                        "quantity": 2,
                        "unit": "kg"
                    }
                ],
                "total_price": 100.0
            }
        }
