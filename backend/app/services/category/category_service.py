"""Category service"""
import uuid
from typing import Dict, List

# Mock categories storage
MOCK_CATEGORIES: Dict[str, dict] = {
    "cat-001": {
        "id": "cat-001",
        "name": "Rice & Atta",
        "description": "Rice, flour, and grain products",
        "emoji": "🌾",
        "image_url": None
    },
    "cat-002": {
        "id": "cat-002",
        "name": "Oil & Ghee",
        "description": "Cooking oils, ghee, and butter",
        "emoji": "🫒",
        "image_url": None
    },
    "cat-003": {
        "id": "cat-003",
        "name": "Masala",
        "description": "Spices and masala blends",
        "emoji": "🧂",
        "image_url": None
    },
    "cat-006": {
        "id": "cat-006",
        "name": "Dairy",
        "description": "Milk, yogurt, paneer, and dairy products",
        "emoji": "🥛",
        "image_url": None
    },
    "cat-007": {
        "id": "cat-007",
        "name": "Cosmetics",
        "description": "Beauty and cosmetic products",
        "emoji": "💄",
        "image_url": None
    },
}


class CategoryService:
    """Category business logic"""
    
    @staticmethod
    async def get_all_categories() -> dict:
        """Get all categories"""
        categories = list(MOCK_CATEGORIES.values())
        return {
            "categories": categories,
            "total": len(categories)
        }
    
    @staticmethod
    async def get_category(category_id: str) -> dict:
        """Get category by ID"""
        if category_id not in MOCK_CATEGORIES:
            return {"error": "Category not found"}
        return MOCK_CATEGORIES[category_id]
    
    @staticmethod
    async def create_category(name: str, description: str = None, emoji: str = None, image_url: str = None) -> dict:
        """Create a new category"""
        if not name or len(name.strip()) == 0:
            return {"error": "Category name is required"}
        
        # Check if category with same name already exists
        for cat in MOCK_CATEGORIES.values():
            if cat["name"].lower() == name.lower():
                return {"error": "Category already exists"}
        
        # Generate category ID
        category_id = f"cat-{uuid.uuid4().hex[:6].upper()}"
        
        category = {
            "id": category_id,
            "name": name,
            "description": description,
            "emoji": emoji,
            "image_url": image_url
        }
        
        MOCK_CATEGORIES[category_id] = category
        print(f"✅ DEBUG: Category created: {category_id} - {name}")
        
        return category
    
    @staticmethod
    async def update_category(category_id: str, **kwargs) -> dict:
        """Update a category"""
        if category_id not in MOCK_CATEGORIES:
            return {"error": "Category not found"}
        
        category = MOCK_CATEGORIES[category_id]
        
        # Update fields
        if "name" in kwargs and kwargs["name"]:
            category["name"] = kwargs["name"]
        if "description" in kwargs:
            category["description"] = kwargs["description"]
        if "emoji" in kwargs:
            category["emoji"] = kwargs["emoji"]
        if "image_url" in kwargs:
            category["image_url"] = kwargs["image_url"]
        
        MOCK_CATEGORIES[category_id] = category
        return category
    
    @staticmethod
    async def delete_category(category_id: str) -> dict:
        """Delete a category"""
        if category_id not in MOCK_CATEGORIES:
            return {"error": "Category not found"}
        
        del MOCK_CATEGORIES[category_id]
        print(f"✅ DEBUG: Category deleted: {category_id}")
        
        return {"message": "Category deleted successfully"}
