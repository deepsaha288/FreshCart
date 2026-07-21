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
        
        for product_id, item_data in cart.items():
            items.append({
                "product_id": product_id,
                "product_name": item_data["product_name"],
                "price_snapshot": item_data["price"],
                "quantity": item_data["quantity"],
                "unit": item_data["unit"]
            })
            total_price += item_data["price"] * item_data["quantity"]
        
        return {"items": items, "total_price": total_price}
    
    @staticmethod
    async def add_to_cart(user_id: str, product_id: str, quantity: int) -> dict:
        """Add product to cart"""
        product = await ProductService.get_product(product_id)
        if "error" in product:
            return product
        
        if not product["is_available"] or product["quantity_available"] < quantity:
            return {"error": "Product not available or insufficient stock"}
        
        # Get or create cart
        if user_id not in MOCK_CARTS:
            MOCK_CARTS[user_id] = {}
        
        cart = MOCK_CARTS[user_id]
        
        # Add or update item
        if product_id in cart:
            cart[product_id]["quantity"] += quantity
        else:
            cart[product_id] = {
                "product_name": product["name"],
                "price": product["price"],
                "quantity": quantity,
                "unit": product["unit"]
            }
        
        # Build response
        items = []
        total_price = 0.0
        for pid, item_data in cart.items():
            items.append({
                "product_id": pid,
                "product_name": item_data["product_name"],
                "price_snapshot": item_data["price"],
                "quantity": item_data["quantity"],
                "unit": item_data["unit"]
            })
            total_price += item_data["price"] * item_data["quantity"]
        
        return {"items": items, "total_price": total_price}
    
    @staticmethod
    async def update_cart_item(user_id: str, product_id: str, quantity: int) -> dict:
        """Update quantity of item in cart"""
        if user_id not in MOCK_CARTS:
            return {"error": "Cart not found"}
        
        cart = MOCK_CARTS[user_id]
        
        if product_id not in cart:
            return {"error": "Item not in cart"}
        
        if quantity <= 0:
            del cart[product_id]
        else:
            cart[product_id]["quantity"] = quantity
        
        # Build response
        items = []
        total_price = 0.0
        for pid, item_data in cart.items():
            items.append({
                "product_id": pid,
                "product_name": item_data["product_name"],
                "price_snapshot": item_data["price"],
                "quantity": item_data["quantity"],
                "unit": item_data["unit"]
            })
            total_price += item_data["price"] * item_data["quantity"]
        
        return {"items": items, "total_price": total_price}
    
    @staticmethod
    async def remove_from_cart(user_id: str, product_id: str) -> dict:
        """Remove item from cart"""
        if user_id not in MOCK_CARTS:
            return {"error": "Cart not found"}
        
        cart = MOCK_CARTS[user_id]
        
        if product_id not in cart:
            return {"error": "Item not in cart"}
        
        del cart[product_id]
        
        # Build response
        items = []
        total_price = 0.0
        for pid, item_data in cart.items():
            items.append({
                "product_id": pid,
                "product_name": item_data["product_name"],
                "price_snapshot": item_data["price"],
                "quantity": item_data["quantity"],
                "unit": item_data["unit"]
            })
            total_price += item_data["price"] * item_data["quantity"]
        
        return {"items": items, "total_price": total_price}
    
    @staticmethod
    async def clear_cart(user_id: str) -> dict:
        """Clear user's cart"""
        if user_id in MOCK_CARTS:
            del MOCK_CARTS[user_id]
        
        return {"items": [], "total_price": 0.0}
