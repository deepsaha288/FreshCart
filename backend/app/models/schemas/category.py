"""Category request/response schemas"""
from typing import Optional
from pydantic import BaseModel, Field


class CreateCategoryRequest(BaseModel):
    """Request to create a category"""
    name: str = Field(..., min_length=2, max_length=50, description="Category name")
    description: Optional[str] = Field(None, max_length=200, description="Category description")
    emoji: Optional[str] = Field(None, max_length=5, description="Category emoji icon")
    image_url: Optional[str] = Field(None, description="Category image URL")


class CategoryResponse(BaseModel):
    """Category response"""
    id: str
    name: str
    description: Optional[str]
    emoji: Optional[str]
    image_url: Optional[str] = None
    product_count: int = 0


class UpdateCategoryRequest(BaseModel):
    """Request to update a category"""
    name: Optional[str] = Field(None, min_length=2, max_length=50)
    description: Optional[str] = Field(None, max_length=200)
    emoji: Optional[str] = Field(None, max_length=5)
    image_url: Optional[str] = Field(None, description="Category image URL")
