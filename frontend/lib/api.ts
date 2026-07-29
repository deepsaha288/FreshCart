// API client with interceptors
import axios, { AxiosInstance, AxiosError } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class APIClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired - try to refresh
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/auth'
        }
        return Promise.reject(error)
      }
    )
  }

  // Auth endpoints
  async sendOTP(phone: string) {
    return this.client.post('/api/auth/send-otp', { phone })
  }

  async verifyOTP(phone: string, otp: string) {
    return this.client.post('/api/auth/verify-otp', { phone, otp })
  }

  async registerEmail(email: string, password: string, name?: string) {
    return this.client.post('/api/auth/register-email', { email, password, name })
  }

  async loginEmail(email: string, password: string) {
    return this.client.post('/api/auth/login-email', { email, password })
  }

  async refreshToken(refreshToken: string) {
    return this.client.post('/api/auth/refresh', { refresh_token: refreshToken })
  }

  async getCurrentUser() {
    return this.client.get('/api/auth/me')
  }

  async updateProfile(profileData: { name?: string; email?: string; phone?: string }) {
    return this.client.put('/api/auth/profile', profileData)
  }

  async logout() {
    return this.client.post('/api/auth/logout')
  }

  // Product endpoints
  async getProducts(page: number = 1, pageSize: number = 20, categoryId?: string, search?: string) {
    return this.client.get('/api/products', {
      params: { page, page_size: pageSize, category_id: categoryId, search },
    })
  }

  async getProduct(id: string) {
    return this.client.get(`/api/products/${id}`)
  }

  async createProduct(productData: {
    name: string
    description: string
    category_id: string
    price: number
    quantity_available: number
    unit: string
    image_url?: string
    is_available?: boolean
  }) {
    return this.client.post('/api/products', productData)
  }

  async updateProduct(productId: string, productData: any) {
    return this.client.put(`/api/products/${productId}`, productData)
  }

  async deleteProduct(productId: string) {
    return this.client.delete(`/api/products/${productId}`)
  }

  async uploadImage(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return this.client.post('/api/uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }

  // Category endpoints
  async getCategories() {
    return this.client.get('/api/categories')
  }

  async getCategory(categoryId: string) {
    return this.client.get(`/api/categories/${categoryId}`)
  }

  async createCategory(categoryData: {
    name: string
    description?: string
    emoji?: string
    image_url?: string
  }) {
    return this.client.post('/api/categories', categoryData)
  }

  async updateCategory(categoryId: string, categoryData: any) {
    return this.client.put(`/api/categories/${categoryId}`, categoryData)
  }

  async deleteCategory(categoryId: string) {
    return this.client.delete(`/api/categories/${categoryId}`)
  }

  // Cart endpoints
  async getCart() {
    return this.client.get('/api/cart')
  }

  async addToCart(productId: string, quantity: number, variantId?: string) {
    return this.client.post('/api/cart/add', { product_id: productId, quantity, variant_id: variantId })
  }

  async updateCartItem(productId: string, quantity: number, variantId?: string) {
    return this.client.put(`/api/cart/items/${productId}`, { quantity }, {
      params: { variant_id: variantId }
    })
  }

  async removeFromCart(productId: string, variantId?: string) {
    return this.client.delete(`/api/cart/items/${productId}`, {
      params: { variant_id: variantId }
    })
  }

  async clearCart() {
    return this.client.delete('/api/cart')
  }

  // Order endpoints
  async checkout(checkoutData: {
    customer_name: string
  }) {
    return this.client.post('/api/orders/checkout', checkoutData)
  }

  async getOrder(orderId: string) {
    return this.client.get(`/api/orders/orders/${orderId}`)
  }

  async getMyOrders() {
    return this.client.get('/api/orders/my-orders')
  }

  async getAdminOrders() {
    return this.client.get('/api/orders/admin/all')
  }

  async acceptOrder(orderId: string) {
    return this.client.post(`/api/orders/admin/${orderId}/accept`)
  }

  async declineOrder(orderId: string) {
    return this.client.post(`/api/orders/admin/${orderId}/decline`)
  }

  async startPreparingOrder(orderId: string) {
    return this.client.post(`/api/orders/admin/${orderId}/preparing`)
  }

  async markOrderPacked(orderId: string) {
    return this.client.post(`/api/orders/admin/${orderId}/mark-packed`)
  }

  async markOrderDelivered(orderId: string) {
    return this.client.post(`/api/orders/admin/${orderId}/mark-delivered`)
  }

  async markOrderReady(orderId: string) {
    return this.client.post(`/api/orders/admin/${orderId}/mark-ready`)
  }

  getInvoiceUrl(orderId: string) {
    return `${API_URL}/api/orders/${orderId}/invoice`
  }
}

export const apiClient = new APIClient()
