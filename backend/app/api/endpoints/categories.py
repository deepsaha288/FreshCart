"""Category API endpoints"""
from fastapi import APIRouter, HTTPException, Request

from app.models.schemas.category import CreateCategoryRequest, UpdateCategoryRequest, CategoryResponse
from app.services.category.category_service import CategoryService


router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("", response_model=list[CategoryResponse])
async def get_categories():
    """Get all product categories"""
    result = await CategoryService.get_all_categories()
    return result.get("categories", [])


@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(category_id: str):
    """Get category by ID"""
    result = await CategoryService.get_category(category_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.post("", response_model=CategoryResponse, tags=["admin"])
async def create_category(category_req: CreateCategoryRequest):
    """Create a new category (admin only)"""
    try:
        result = await CategoryService.create_category(
            name=category_req.name,
            description=category_req.description,
            emoji=category_req.emoji,
            image_url=category_req.image_url
        )
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{category_id}", response_model=CategoryResponse, tags=["admin"])
async def update_category(category_id: str, category_req: UpdateCategoryRequest):
    """Update a category (admin only)"""
    try:
        # Verify category exists
        existing = await CategoryService.get_category(category_id)
        if "error" in existing:
            raise HTTPException(status_code=404, detail=existing["error"])
        
        # Build update dict
        update_data = {}
        if category_req.name is not None:
            update_data["name"] = category_req.name
        if category_req.description is not None:
            update_data["description"] = category_req.description
        if category_req.emoji is not None:
            update_data["emoji"] = category_req.emoji
        if category_req.image_url is not None:
            update_data["image_url"] = category_req.image_url
        
        result = await CategoryService.update_category(category_id, **update_data)
        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])
        
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{category_id}", tags=["admin"])
async def delete_category(category_id: str):
    """Delete a category (admin only)"""
    try:
        result = await CategoryService.delete_category(category_id)
        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
