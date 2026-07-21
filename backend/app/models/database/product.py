"""Product database model"""
from datetime import datetime
from typing import Optional

from beanie import Document


class Product(Document):
    """Product model for MongoDB"""
    
    name: str
    description: str
    category: str
    price: float
    quantity_available: int
    unit: str = "kg"  # kg, liter, piece, etc.
    image_url: Optional[str] = None
    
    is_available: bool = True
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()
    
    class Settings:
        """Beanie model settings"""
        collection = "products"
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Fresh Tomatoes",
                "description": "Fresh red tomatoes",
                "category": "Vegetables",
                "price": 50.0,
                "quantity_available": 100,
                "unit": "kg"
            }
        }
