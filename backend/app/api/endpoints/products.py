"""Product API endpoints"""
from typing import Optional

from fastapi import APIRouter, HTTPException, Query, Request

from app.models.schemas.product import ProductListResponse, ProductResponse, CreateProductRequest, UpdateProductRequest
from app.services.product.product_service import ProductService
from app.services.category.category_service import CategoryService


router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=ProductListResponse)
async def get_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category_id: Optional[str] = None,
    search: Optional[str] = None
):
    """Get products with pagination and filtering by category"""
    result = await ProductService.get_products(page, page_size, category_id, search)
    return result


@router.post("", response_model=ProductResponse, tags=["admin"])
async def create_product(product_req: CreateProductRequest):
    """Create a new product (admin only)"""
    try:
        # Verify category exists
        cat = await CategoryService.get_category(product_req.category_id)
        if "error" in cat:
            raise HTTPException(status_code=404, detail=f"Category not found: {product_req.category_id}")
        
        result = await ProductService.create_product(
            name=product_req.name,
            description=product_req.description,
            category_id=product_req.category_id,
            price=product_req.price,
            quantity_available=product_req.quantity_available,
            unit=product_req.unit,
            image_url=product_req.image_url,
            is_available=product_req.is_available
        )
        
        # Update category_name
        result["category_name"] = cat["name"]
        
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    """Get product by ID"""
    result = await ProductService.get_product(product_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.put("/{product_id}", response_model=ProductResponse, tags=["admin"])
async def update_product(product_id: str, product_req: UpdateProductRequest):
    """Update a product (admin only)"""
    try:
        # Verify product exists
        existing = await ProductService.get_product(product_id)
        if "error" in existing:
            raise HTTPException(status_code=404, detail=existing["error"])
        
        # If category_id is being updated, verify new category exists
        if product_req.category_id:
            cat = await CategoryService.get_category(product_req.category_id)
            if "error" in cat:
                raise HTTPException(status_code=404, detail=f"Category not found: {product_req.category_id}")
        
        # Build update dict, only include fields that are not None
        update_data = {}
        if product_req.name is not None:
            update_data["name"] = product_req.name
        if product_req.description is not None:
            update_data["description"] = product_req.description
        if product_req.category_id is not None:
            update_data["category_id"] = product_req.category_id
        if product_req.price is not None:
            update_data["price"] = product_req.price
        if product_req.quantity_available is not None:
            update_data["quantity_available"] = product_req.quantity_available
        if product_req.unit is not None:
            update_data["unit"] = product_req.unit
        if product_req.image_url is not None:
            update_data["image_url"] = product_req.image_url
        if product_req.is_available is not None:
            update_data["is_available"] = product_req.is_available
        
        result = await ProductService.update_product(product_id, **update_data)
        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])
        
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{product_id}", tags=["admin"])
async def delete_product(product_id: str):
    """Delete a product (admin only)"""
    try:
        # Verify product exists
        existing = await ProductService.get_product(product_id)
        if "error" in existing:
            raise HTTPException(status_code=404, detail=existing["error"])
        
        result = await ProductService.delete_product(product_id)
        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])
        
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
