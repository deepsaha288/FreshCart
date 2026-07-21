"""Order API endpoints"""
import os
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import FileResponse

from app.core.security import SecurityUtils
from app.models.schemas.order import (
    CreateOrderRequest,
    OrderResponse,
    OrderStatusResponse
)
from app.services.order.order_service import OrderService
from app.services.cart.cart_service import CartService
from app.services.invoice.pdf_service import PDFInvoiceService


router = APIRouter(prefix="/api/orders", tags=["orders"])


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


@router.post("/checkout", response_model=OrderResponse)
async def checkout(request_body: CreateOrderRequest, request: Request):
    """Create order from cart and checkout"""
    authorization = request.headers.get("authorization")

    try:
        user_id = get_current_user(authorization)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

    cart_result = await CartService.get_cart(user_id)

    if not cart_result.get("items") or len(cart_result["items"]) == 0:
        raise HTTPException(status_code=400, detail="Cannot checkout with empty cart")

    order_result = await OrderService.create_order(
        user_id=user_id,
        customer_name=request_body.customer_name,
        items=cart_result["items"],
        total_price=cart_result["total_price"],
    )

    if "error" in order_result:
        raise HTTPException(status_code=400, detail=order_result["error"])

    await CartService.clear_cart(user_id)

    return order_result


@router.get("/orders/{order_id}", response_model=OrderStatusResponse)
async def get_order(order_id: str, request: Request):
    """Get order details"""
    authorization = request.headers.get("authorization")

    try:
        user_id = get_current_user(authorization)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

    result = await OrderService.get_order(order_id)

    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])

    if result.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Cannot access this order")

    return result


@router.get("/my-orders")
async def get_my_orders(request: Request):
    """Get all orders for current user"""
    authorization = request.headers.get("authorization")

    try:
        user_id = get_current_user(authorization)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

    result = await OrderService.get_user_orders(user_id)
    return result


@router.get("/{order_id}/invoice")
async def download_invoice(order_id: str):
    """Download local PDF invoice for order"""
    order = await OrderService.get_order(order_id)
    if "error" in order:
        raise HTTPException(status_code=404, detail="Order not found")

    filepath = PDFInvoiceService.get_invoice_filepath(order_id)

    # Generate if not created yet
    if not filepath.exists():
        filepath = Path(PDFInvoiceService.generate_invoice(order))

    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Invoice PDF file not found")

    return FileResponse(
        path=str(filepath),
        filename=f"FreshCart_Invoice_{order_id}.pdf",
        media_type="application/pdf"
    )


# ==================== ADMIN ENDPOINTS ====================

@router.get("/admin/all", tags=["admin"])
async def get_all_orders():
    """Get all orders for admin management."""
    return await OrderService.get_all_orders()


@router.post("/admin/{order_id}/accept", response_model=OrderResponse, tags=["admin"])
async def accept_order(order_id: str):
    """Admin accepts order (PLACED -> ACCEPTED)"""
    result = await OrderService.accept_order(order_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.post("/admin/{order_id}/preparing", response_model=OrderResponse, tags=["admin"])
async def start_preparing(order_id: str):
    """Admin starts order preparation (ACCEPTED -> PREPARING)"""
    result = await OrderService.start_preparing(order_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.post("/admin/{order_id}/mark-packed", response_model=OrderResponse, tags=["admin"])
async def mark_packed(order_id: str):
    """Admin marks packing done (PREPARING -> PACKED) & sends SMS alert"""
    result = await OrderService.mark_packed(order_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.post("/admin/{order_id}/mark-delivered", response_model=OrderResponse, tags=["admin"])
async def mark_delivered(order_id: str):
    """Admin marks order delivered (PACKED -> DELIVERED) & generates local PDF invoice"""
    result = await OrderService.mark_delivered(order_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.post("/admin/{order_id}/mark-ready", response_model=OrderResponse, tags=["admin"])
async def mark_order_ready(order_id: str):
    """Legacy endpoint alias for mark-packed"""
    return await mark_packed(order_id)
