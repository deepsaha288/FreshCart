// Initialize MongoDB with sample data
db = db.getSiblingDB('freshcartdb');

// Create collections
db.createCollection('users');
db.createCollection('products');
db.createCollection('carts');
db.createCollection('orders');

// Insert sample products
db.products.insertMany([
  {
    name: 'Fresh Tomatoes',
    description: 'Red, juicy tomatoes from local farms',
    category: 'Vegetables',
    price: 50,
    quantity_available: 100,
    unit: 'kg',
    is_available: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'Organic Carrots',
    description: 'Sweet and crunchy organic carrots',
    category: 'Vegetables',
    price: 40,
    quantity_available: 80,
    unit: 'kg',
    is_available: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'Fresh Milk',
    description: 'Pure, fresh milk delivered daily',
    category: 'Dairy',
    price: 60,
    quantity_available: 50,
    unit: 'liter',
    is_available: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'Bananas',
    description: 'Fresh yellow bananas',
    category: 'Fruits',
    price: 45,
    quantity_available: 120,
    unit: 'kg',
    is_available: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'Apples',
    description: 'Crisp red apples',
    category: 'Fruits',
    price: 100,
    quantity_available: 60,
    unit: 'kg',
    is_available: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: 'Onions',
    description: 'Fresh onions',
    category: 'Vegetables',
    price: 30,
    quantity_available: 150,
    unit: 'kg',
    is_available: true,
    created_at: new Date(),
    updated_at: new Date()
  }
]);

print('Sample products inserted successfully');
