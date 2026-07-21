// Frontend type definitions

export interface User {
  id: string
  phone: string
  name?: string
  email?: string
  role: string
  is_verified: boolean
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string
  category?: string
  category_id: string
  category_name: string
  price: number
  quantity_available: number
  unit: string
  image_url?: string
  is_available: boolean
}

export interface CartItem {
  product_id: string
  product_name: string
  price_snapshot: number
  quantity: number
  unit: string
}

export interface Cart {
  items: CartItem[]
  total_price: number
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}
