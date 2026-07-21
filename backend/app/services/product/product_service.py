"""Product service"""
import uuid
from typing import List, Dict

# Mock product data for development - organized by category
MOCK_PRODUCTS: List[Dict] = [
    # Rice & Atta
    {
        "id": "prod-001",
        "name": "Basmati Rice",
        "description": "Premium long-grain basmati rice",
        "category_id": "cat-001",
        "category_name": "Rice & Atta",
        "price": 180.00,
        "quantity_available": 100,
        "unit": "kg",
        "image_url": "https://via.placeholder.com/200?text=BasmatiRice",
        "is_available": True
    },
    {
        "id": "prod-002",
        "name": "Whole Wheat Flour",
        "description": "Fresh whole wheat flour (Atta)",
        "category_id": "cat-001",
        "category_name": "Rice & Atta",
        "price": 45.00,
        "quantity_available": 80,
        "unit": "kg",
        "image_url": "https://via.placeholder.com/200?text=Atta",
        "is_available": True
    },
    # Oil & Ghee
    {
        "id": "prod-003",
        "name": "Sunflower Oil",
        "description": "Pure sunflower cooking oil",
        "category_id": "cat-002",
        "category_name": "Oil & Ghee",
        "price": 120.00,
        "quantity_available": 50,
        "unit": "litre",
        "image_url": "https://via.placeholder.com/200?text=Oil",
        "is_available": True
    },
    {
        "id": "prod-004",
        "name": "Pure Ghee",
        "description": "Organic pure cow ghee",
        "category_id": "cat-002",
        "category_name": "Oil & Ghee",
        "price": 450.00,
        "quantity_available": 30,
        "unit": "kg",
        "image_url": "https://via.placeholder.com/200?text=Ghee",
        "is_available": True
    },
    # Masala
    {
        "id": "prod-005",
        "name": "Garam Masala",
        "description": "Aromatic blend of spices",
        "category_id": "cat-003",
        "category_name": "Masala",
        "price": 180.00,
        "quantity_available": 25,
        "unit": "kg",
        "image_url": "https://via.placeholder.com/200?text=GaramMasala",
        "is_available": True
    },
    {
        "id": "prod-006",
        "name": "Turmeric Powder",
        "description": "Pure turmeric powder",
        "category_id": "cat-003",
        "category_name": "Masala",
        "price": 120.00,
        "quantity_available": 40,
        "unit": "kg",
        "image_url": "https://via.placeholder.com/200?text=Turmeric",
        "is_available": True
    },
    # Dairy
    {
        "id": "prod-012",
        "name": "Milk 1L",
        "description": "Fresh pasteurized milk",
        "category_id": "cat-006",
        "category_name": "Dairy",
        "price": 60.00,
        "quantity_available": 200,
        "unit": "litre",
        "image_url": "https://via.placeholder.com/200?text=Milk",
        "is_available": True
    },
    {
        "id": "prod-013",
        "name": "Paneer",
        "description": "Fresh cottage cheese (paneer)",
        "category_id": "cat-006",
        "category_name": "Dairy",
        "price": 280.00,
        "quantity_available": 50,
        "unit": "kg",
        "image_url": "https://via.placeholder.com/200?text=Paneer",
        "is_available": True
    },
    {
        "id": "prod-014",
        "name": "Yogurt",
        "description": "Fresh set yogurt",
        "category_id": "cat-006",
        "category_name": "Dairy",
        "price": 40.00,
        "quantity_available": 80,
        "unit": "kg",
        "image_url": "https://via.placeholder.com/200?text=Yogurt",
        "is_available": True
    },
    # Cosmetics
    {
        "id": "prod-015",
        "name": "Coconut Oil",
        "description": "Pure organic coconut oil for hair and skin",
        "category_id": "cat-007",
        "category_name": "Cosmetics",
        "price": 250.00,
        "quantity_available": 60,
        "unit": "litre",
        "image_url": "https://via.placeholder.com/200?text=CoconutOil",
        "is_available": True
    },
]


class ProductService:
    """Product business logic"""
    
    @staticmethod
    async def get_products(page: int = 1, page_size: int = 20, category_id: str = None, search: str = None) -> dict:
        """Get products with pagination and filtering"""
        skip = (page - 1) * page_size
        
        # Filter products
        filtered = MOCK_PRODUCTS
        
        if category_id:
            filtered = [p for p in filtered if p["category_id"] == category_id]
        
        if search:
            search_lower = search.lower()
            filtered = [
                p for p in filtered 
                if search_lower in p["name"].lower() or search_lower in p["description"].lower()
            ]
        
        total = len(filtered)
        products = filtered[skip:skip + page_size]
        
        return {
            "items": products,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size
        }
    
    @staticmethod
    async def get_product(product_id: str) -> dict:
        """Get product by ID"""
        for p in MOCK_PRODUCTS:
            if p["id"] == product_id:
                return p
        return {"error": "Product not found"}
    
    @staticmethod
    async def create_product(name: str, description: str, category_id: str, price: float, 
                            quantity_available: int, unit: str, image_url: str = None, 
                            is_available: bool = True) -> dict:
        """Create a new product"""
        # Generate product ID
        product_id = f"prod-{uuid.uuid4().hex[:6].upper()}"
        
        product = {
            "id": product_id,
            "name": name,
            "description": description,
            "category_id": category_id,
            "category_name": category_id,  # Will be updated by endpoint
            "price": price,
            "quantity_available": quantity_available,
            "unit": unit,
            "image_url": image_url,
            "is_available": is_available
        }
        
        MOCK_PRODUCTS.append(product)
        print(f"✅ DEBUG: Product created: {product_id} - {name}")
        
        return product
    
    @staticmethod
    async def update_product(product_id: str, **kwargs) -> dict:
        """Update a product"""
        for i, p in enumerate(MOCK_PRODUCTS):
            if p["id"] == product_id:
                # Update fields
                for key in ["name", "description", "category_id", "price", "quantity_available", "unit", "image_url", "is_available"]:
                    if key in kwargs and kwargs[key] is not None:
                        p[key] = kwargs[key]
                MOCK_PRODUCTS[i] = p
                return p
        return {"error": "Product not found"}
    
    @staticmethod
    async def delete_product(product_id: str) -> dict:
        """Delete a product"""
        for i, p in enumerate(MOCK_PRODUCTS):
            if p["id"] == product_id:
                MOCK_PRODUCTS.pop(i)
                print(f"✅ DEBUG: Product deleted: {product_id}")
                return {"message": "Product deleted successfully"}
        return {"error": "Product not found"}

