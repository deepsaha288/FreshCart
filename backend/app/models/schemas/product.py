"""Product schemas"""
from typing import Optional

from pydantic import BaseModel, Field


class ProductResponse(BaseModel):
    """Product response"""
    id: str
    name: str
    description: str
    category_id: str
    category_name: str
    price: float
    quantity_available: int
    unit: str
    image_url: Optional[str] = None
    is_available: bool


class CreateProductRequest(BaseModel):
    """Request to create a product"""
    name: str = Field(..., min_length=2, max_length=100, description="Product name")
    description: str = Field(..., min_length=5, max_length=300, description="Product description")
    category_id: str = Field(..., description="Category ID")
    price: float = Field(..., gt=0, description="Price must be greater than 0")
    quantity_available: int = Field(..., ge=0, description="Available quantity")
    unit: str = Field(..., description="Unit of measurement (kg, litre, dozen, etc)")
    image_url: Optional[str] = None
    is_available: bool = True


class UpdateProductRequest(BaseModel):
    """Request to update a product"""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = Field(None, min_length=5, max_length=300)
    category_id: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    quantity_available: Optional[int] = Field(None, ge=0)
    unit: Optional[str] = None
    image_url: Optional[str] = None
    is_available: Optional[bool] = None


class ProductListResponse(BaseModel):
    """Product list response"""
    items: list[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
