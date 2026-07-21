"""Cart schemas"""
from typing import Optional

from pydantic import BaseModel, Field


class CartItemRequest(BaseModel):
    """Cart item request"""
    product_id: str
    quantity: int = Field(..., gt=0, description="Quantity must be greater than 0")


class CartItemResponse(BaseModel):
    """Cart item response"""
    product_id: str
    product_name: str
    price_snapshot: float
    quantity: int
    unit: str


class CartResponse(BaseModel):
    """Cart response"""
    items: list[CartItemResponse]
    total_price: float


class AddToCartRequest(BaseModel):
    """Request to add item to cart"""
    product_id: str
    quantity: int = Field(..., gt=0, description="Quantity must be greater than 0")


class UpdateCartItemRequest(BaseModel):
    """Request to update cart item quantity"""
    quantity: int = Field(..., gt=0, description="Quantity must be greater than 0")
