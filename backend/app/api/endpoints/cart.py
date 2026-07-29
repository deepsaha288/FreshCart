"""Cart API endpoints"""
from typing import Optional

from fastapi import APIRouter, HTTPException, Header, Request

from app.core.security import SecurityUtils
from app.models.schemas.cart import (
    CartResponse,
    AddToCartRequest,
    UpdateCartItemRequest
)
from app.services.cart.cart_service import CartService


router = APIRouter(prefix="/api/cart", tags=["cart"])


def get_current_user(authorization: Optional[str]) -> str:
    """Get user from token"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    try:
        token = authorization.split(" ")[1]
    except IndexError:
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    payload = SecurityUtils.decode_token(token)
    if "error" in payload:
        raise HTTPException(status_code=401, detail=payload["error"])
    
    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token type")
    
    return payload["user_id"]


@router.get("", response_model=CartResponse)
async def get_cart(request: Request):
    """Get user's cart"""
    authorization = request.headers.get("authorization")
    try:
        user_id = get_current_user(authorization)
    except HTTPException as error:
        raise error

    result = await CartService.get_cart(user_id)
    return result


@router.post("/add")
async def add_to_cart(request: Request):
    """Add product to cart"""
    try:
        body = await request.json()
        print(f"DEBUG add_to_cart: Request body: {body}")
    except Exception as e:
        print(f"DEBUG add_to_cart: Error reading body: {e}")
        return {"error": str(e)}
    
    authorization = request.headers.get("authorization")
    print(f"DEBUG add_to_cart: Authorization header: {authorization}")
    
    try:
        user_id = get_current_user(authorization)
        print(f"DEBUG add_to_cart: Got user_id from token: {user_id}")
    except Exception as e:
        print(f"DEBUG add_to_cart: Auth error: {e}")
        raise HTTPException(status_code=401, detail=str(e))
    
    # Manual validation
    if 'product_id' not in body or 'quantity' not in body:
        return {"error": "Missing required fields"}
    
    try:
        product_id = str(body['product_id'])
        quantity = int(body['quantity'])
        variant_id = body.get('variant_id')
        result = await CartService.add_to_cart(user_id, product_id, quantity, variant_id)
        print(f"DEBUG add_to_cart: Result for user_id={user_id}: {result}")
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return {
            "items": result["items"],
            "total_price": result["total_price"]
        }
    except Exception as e:
        print(f"DEBUG add_to_cart: Error processing request: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/items/{product_id}", response_model=CartResponse)
async def update_cart_item(
    product_id: str,
    request_body: UpdateCartItemRequest,
    request: Request,
    variant_id: Optional[str] = None
):
    """Update quantity of item in cart"""
    authorization = request.headers.get("authorization")
    user_id = get_current_user(authorization)
    result = await CartService.update_cart_item(user_id, product_id, request_body.quantity, variant_id)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return {
        "items": result["items"],
        "total_price": result["total_price"]
    }


@router.delete("/items/{product_id}", response_model=CartResponse)
async def remove_from_cart(product_id: str, request: Request, variant_id: Optional[str] = None):
    """Remove item from cart"""
    authorization = request.headers.get("authorization")
    user_id = get_current_user(authorization)
    result = await CartService.remove_from_cart(user_id, product_id, variant_id)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return {
        "items": result["items"],
        "total_price": result["total_price"]
    }


@router.delete("", response_model=CartResponse)
async def clear_cart(request: Request):
    """Clear entire cart"""
    authorization = request.headers.get("authorization")
    user_id = get_current_user(authorization)
    result = await CartService.clear_cart(user_id)
    return {
        "items": result["items"],
        "total_price": result["total_price"]
    }
