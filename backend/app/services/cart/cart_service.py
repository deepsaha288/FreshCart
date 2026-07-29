"""Cart service"""
from typing import List, Dict

from app.services.product.product_service import ProductService

# Mock product data (same as in product_service)
MOCK_PRODUCTS: List[Dict] = [
    {
        "id": "1",
        "name": "Fresh Tomatoes",
        "description": "Ripe red tomatoes, freshly picked",
        "category": "vegetables",
        "price": 45.00,
        "quantity_available": 100,
        "unit": "kg",
        "image_url": "https://via.placeholder.com/200?text=Tomatoes",
        "is_available": True
    },
    {
        "id": "2",
        "name": "Organic Spinach",
        "description": "Tender green spinach leaves",
        "category": "vegetables",
        "price": 60.00,
        "quantity_available": 80,
        "unit": "bunch",
        "image_url": "https://via.placeholder.com/200?text=Spinach",
        "is_available": True
    },
    {
        "id": "3",
        "name": "Bananas",
        "description": "Golden yellow bananas",
        "category": "fruits",
        "price": 50.00,
        "quantity_available": 150,
        "unit": "dozen",
        "image_url": "https://via.placeholder.com/200?text=Bananas",
        "is_available": True
    },
    {
        "id": "4",
        "name": "Red Apples",
        "description": "Crispy and sweet red apples",
        "category": "fruits",
        "price": 120.00,
        "quantity_available": 120,
        "unit": "kg",
        "image_url": "https://via.placeholder.com/200?text=Apples",
        "is_available": True
    },
    {
        "id": "5",
        "name": "Whole Wheat Bread",
        "description": "Freshly baked whole wheat bread",
        "category": "bakery",
        "price": 40.00,
        "quantity_available": 50,
        "unit": "loaf",
        "image_url": "https://via.placeholder.com/200?text=Bread",
        "is_available": True
    },
    {
        "id": "6",
        "name": "Carrot Juice",
        "description": "Freshly squeezed carrot juice",
        "category": "beverages",
        "price": 80.00,
        "quantity_available": 60,
        "unit": "liter",
        "image_url": "https://via.placeholder.com/200?text=CarrotJuice",
        "is_available": True
    }
]

# Mock cart storage: {user_id: {product_id: {product_name, price, quantity, unit}}}
MOCK_CARTS: Dict[str, Dict] = {}


class CartService:
    """Cart business logic"""
    
    @staticmethod
    async def get_cart(user_id: str) -> dict:
        """Get user's cart"""
        if user_id not in MOCK_CARTS:
            return {"items": [], "total_price": 0.0}
        
        cart = MOCK_CARTS[user_id]
        items = []
        total_price = 0.0
        
        for item_key, item_data in cart.items():
            if ":" in item_key:
                product_id, variant_id = item_key.split(":")
            else:
                product_id = item_key
                variant_id = None
                
            product = await ProductService.get_product(product_id)
            if "error" in product:
                quantity_available = 0
                is_available = False
                price = item_data["price"]
                unit = item_data["unit"]
            else:
                if variant_id:
                    variants = product.get("variants") or []
                    variant = next((v for v in variants if v["id"] == variant_id), None)
                    if variant:
                        quantity_available = variant.get("quantity_available", 0)
                        is_available = product.get("is_available", True) and (quantity_available > 0)
                        price = variant.get("price", product["price"])
                        unit = variant.get("size", product["unit"])
                    else:
                        quantity_available = 0
                        is_available = False
                        price = item_data["price"]
                        unit = item_data["unit"]
                else:
                    quantity_available = product.get("quantity_available", 0)
                    is_available = product.get("is_available", True)
                    price = product["price"]
                    unit = product["unit"]
                
            items.append({
                "product_id": product_id,
                "variant_id": variant_id,
                "product_name": item_data["product_name"],
                "price_snapshot": price,
                "quantity": item_data["quantity"],
                "unit": unit,
                "quantity_available": quantity_available,
                "is_available": is_available
            })
            total_price += price * item_data["quantity"]
        
        return {"items": items, "total_price": total_price}
    
    @staticmethod
    async def add_to_cart(user_id: str, product_id: str, quantity: int, variant_id: str = None) -> dict:
        """Add product to cart"""
        product = await ProductService.get_product(product_id)
        if "error" in product:
            return product
        
        price = product["price"]
        unit = product["unit"]
        quantity_available = product["quantity_available"]
        
        if variant_id:
            variants = product.get("variants") or []
            variant = next((v for v in variants if v["id"] == variant_id), None)
            if not variant:
                return {"error": "Product variant not found"}
            price = variant["price"]
            unit = variant["size"]
            quantity_available = variant["quantity_available"]
            
        if not product["is_available"] or quantity_available < quantity:
            return {"error": "Product not available or insufficient stock"}
        
        # Get or create cart
        if user_id not in MOCK_CARTS:
            MOCK_CARTS[user_id] = {}
        
        cart = MOCK_CARTS[user_id]
        item_key = f"{product_id}:{variant_id}" if variant_id else product_id
        
        # Add or update item
        if item_key in cart:
            cart[item_key]["quantity"] += quantity
        else:
            cart[item_key] = {
                "product_name": product["name"],
                "price": price,
                "quantity": quantity,
                "unit": unit
            }
        
        return await CartService.get_cart(user_id)
    
    @staticmethod
    async def update_cart_item(user_id: str, product_id: str, quantity: int, variant_id: str = None) -> dict:
        """Update quantity of item in cart"""
        if user_id not in MOCK_CARTS:
            return {"error": "Cart not found"}
        
        cart = MOCK_CARTS[user_id]
        item_key = f"{product_id}:{variant_id}" if variant_id else product_id
        
        if item_key not in cart:
            return {"error": "Item not in cart"}
        
        if quantity <= 0:
            del cart[item_key]
        else:
            cart[item_key]["quantity"] = quantity
        
        return await CartService.get_cart(user_id)
    
    @staticmethod
    async def remove_from_cart(user_id: str, product_id: str, variant_id: str = None) -> dict:
        """Remove item from cart"""
        if user_id not in MOCK_CARTS:
            return {"error": "Cart not found"}
        
        cart = MOCK_CARTS[user_id]
        item_key = f"{product_id}:{variant_id}" if variant_id else product_id
        
        if item_key not in cart:
            return {"error": "Item not in cart"}
        
        del cart[item_key]
        
        return await CartService.get_cart(user_id)
    
    @staticmethod
    async def clear_cart(user_id: str) -> dict:
        """Clear user's cart"""
        if user_id in MOCK_CARTS:
            del MOCK_CARTS[user_id]
        
        return {"items": [], "total_price": 0.0}
