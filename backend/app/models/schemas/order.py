"""Order request/response schemas"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class OrderItemSchema(BaseModel):
    """Order item details"""
    product_id: str
    product_name: str
    price_snapshot: float
    quantity: int
    unit: str


class CreateOrderRequest(BaseModel):
    """Request to create an order"""
    customer_name: str = Field(..., min_length=2, max_length=100, description="Customer name")


class OrderResponse(BaseModel):
    """Order response"""
    order_id: str
    user_id: str
    customer_name: str
    items: List[OrderItemSchema]
    total_price: float
    status: str = "PLACED"
    invoice_url: Optional[str] = None
    created_at: str
    updated_at: Optional[str] = None


class OrderStatusResponse(BaseModel):
    """Order status response"""
    order_id: str
    status: str
    created_at: str
    customer_name: str
    items: List[OrderItemSchema]
    total_price: float
    invoice_url: Optional[str] = None
