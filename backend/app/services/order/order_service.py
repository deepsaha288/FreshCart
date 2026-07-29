import uuid
import asyncio
from datetime import datetime
from typing import Dict, List

from app.services.notification.sms_service import SMSService
from app.services.invoice.pdf_service import PDFInvoiceService
from app.services.product.product_service import ProductService, MOCK_PRODUCTS

# Mock orders storage
MOCK_ORDERS: Dict[str, dict] = {}
checkout_lock = asyncio.Lock()


class OrderService:
    """Order business logic"""

    @staticmethod
    async def create_order(
        user_id: str,
        customer_name: str,
        items: List[dict],
        total_price: float,
    ) -> dict:
        """Create a new order from cart with initial PLACED status and atomic stock validation"""
        if not items:
            return {"error": "Cannot place order with empty cart"}

        async with checkout_lock:
            # 1. Validate stock for all items
            for item in items:
                product_id = item["product_id"]
                quantity_requested = item["quantity"]

                product = await ProductService.get_product(product_id)
                if "error" in product:
                    return {"error": f"Product '{item['product_name']}' not found"}

                if not product.get("is_available", True) or product.get("quantity_available", 0) < quantity_requested:
                    avail = product.get("quantity_available", 0)
                    return {"error": f"Insufficient stock for '{item['product_name']}'. Only {avail} left."}

            # 2. Deduct stock
            for item in items:
                product_id = item["product_id"]
                quantity_requested = item["quantity"]

                for p in MOCK_PRODUCTS:
                    if p["id"] == product_id:
                        p["quantity_available"] -= quantity_requested
                        if p["quantity_available"] <= 0:
                            p["quantity_available"] = 0
                            p["is_available"] = False

            order_id = f"ORD-{uuid.uuid4().hex[:8].upper()}"

            order = {
                "order_id": order_id,
                "user_id": user_id,
                "customer_name": customer_name,
                "items": items,
                "total_price": total_price,
                "status": "PLACED",
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }

            MOCK_ORDERS[order_id] = order

            print(f"DEBUG: Order created: {order_id} with status PLACED and stock decremented")

            return order

    @staticmethod
    async def get_order(order_id: str) -> dict:
        """Get order details"""
        if order_id not in MOCK_ORDERS:
            return {"error": "Order not found"}

        return MOCK_ORDERS[order_id]

    @staticmethod
    async def get_user_orders(user_id: str) -> dict:
        """Get all orders for a user"""
        user_orders = sorted(
            [order for order in MOCK_ORDERS.values() if order["user_id"] == user_id],
            key=lambda order: order["created_at"],
            reverse=True,
        )

        return {
            "orders": user_orders,
            "total_orders": len(user_orders)
        }

    @staticmethod
    async def get_all_orders() -> dict:
        """Get all orders for the administrator queue."""
        orders = sorted(
            MOCK_ORDERS.values(),
            key=lambda order: order["created_at"],
            reverse=True,
        )
        return {"orders": orders, "total_orders": len(orders)}

    @staticmethod
    async def accept_order(order_id: str) -> dict:
        """Accept order (PLACED -> ACCEPTED)"""
        if order_id not in MOCK_ORDERS:
            return {"error": "Order not found"}

        order = MOCK_ORDERS[order_id]
        order["status"] = "ACCEPTED"
        order["accepted_at"] = datetime.utcnow().isoformat()
        order["updated_at"] = datetime.utcnow().isoformat()
        return order

    @staticmethod
    async def decline_order(order_id: str, reason: str = "Declined by store admin") -> dict:
        """Decline order (PLACED -> DECLINED)"""
        if order_id not in MOCK_ORDERS:
            return {"error": "Order not found"}

        order = MOCK_ORDERS[order_id]
        order["status"] = "DECLINED"
        order["decline_reason"] = reason
        order["declined_at"] = datetime.utcnow().isoformat()
        order["updated_at"] = datetime.utcnow().isoformat()
        return order


    @staticmethod
    async def start_preparing(order_id: str) -> dict:
        """Start preparing order (ACCEPTED -> PREPARING)"""
        if order_id not in MOCK_ORDERS:
            return {"error": "Order not found"}

        order = MOCK_ORDERS[order_id]
        order["status"] = "PREPARING"
        order["preparing_at"] = datetime.utcnow().isoformat()
        order["updated_at"] = datetime.utcnow().isoformat()
        return order

    @staticmethod
    async def mark_packed(order_id: str) -> dict:
        """Mark packing done (PREPARING -> PACKED) and send SMS alert"""
        if order_id not in MOCK_ORDERS:
            return {"error": "Order not found"}

        order = MOCK_ORDERS[order_id]
        order["status"] = "PACKED"
        order["packed_at"] = datetime.utcnow().isoformat()
        order["updated_at"] = datetime.utcnow().isoformat()

        # Send SMS alert to customer
        customer_phone = order.get("user_id", "")
        customer_name = order.get("customer_name", "")
        SMSService.send_packing_done_sms(customer_phone, order_id, customer_name)

        return order

    @staticmethod
    async def mark_delivered(order_id: str) -> dict:
        """Mark as delivered (PACKED -> DELIVERED) and generate local PDF invoice"""
        if order_id not in MOCK_ORDERS:
            return {"error": "Order not found"}

        order = MOCK_ORDERS[order_id]
        order["status"] = "DELIVERED"
        order["delivered_at"] = datetime.utcnow().isoformat()
        order["updated_at"] = datetime.utcnow().isoformat()

        # Generate local PDF Invoice
        try:
            pdf_path = PDFInvoiceService.generate_invoice(order)
            order["invoice_generated"] = True
            order["invoice_url"] = f"/api/orders/{order_id}/invoice"
        except Exception as e:
            print(f"[ERROR] Error generating invoice for {order_id}: {e}")

        return order

