"""Order database model"""
from datetime import datetime
from typing import List, Optional

from beanie import Document
from pydantic import BaseModel


class OrderItem(BaseModel):
    """Order item structure"""
    
    product_id: str
    product_name: str
    price_snapshot: float
    quantity: int
    unit: str


class Order(Document):
    """Order model for MongoDB"""
    
    user_id: str
    phone: str
    items: List[OrderItem] = []
    total_price: float = 0.0
    
    status: str = "pending"  # pending, confirmed, packing, packed, delivered
    payment_method: str = "cash"  # cash, upi, card
    payment_status: str = "pending"  # pending, completed, failed
    
    notes: Optional[str] = None
    
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()
    
    class Settings:
        """Beanie model settings"""
        collection = "orders"
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "507f1f77bcf86cd799439011",
                "phone": "9876543210",
                "items": [
                    {
                        "product_id": "507f1f77bcf86cd799439012",
                        "product_name": "Fresh Tomatoes",
                        "price_snapshot": 50.0,
                        "quantity": 2,
                        "unit": "kg"
                    }
                ],
                "total_price": 100.0,
                "status": "pending"
            }
        }
