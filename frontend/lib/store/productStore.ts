// Product store using Zustand
import { create } from 'zustand'
import { Product } from '@/types'

interface ProductStore {
  products: Product[]
  categories: string[]
  selectedCategory: string | null
  searchQuery: string
  currentPage: number
  totalPages: number
  setProducts: (products: Product[]) => void
  setCategories: (categories: string[]) => void
  setSelectedCategory: (category: string | null) => void
  setSearchQuery: (query: string) => void
  setCurrentPage: (page: number) => void
  setTotalPages: (pages: number) => void
}

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  categories: [],
  selectedCategory: null,
  searchQuery: '',
  currentPage: 1,
  totalPages: 1,

  setProducts: (products) => set({ products }),
  setCategories: (categories) => set({ categories }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setTotalPages: (pages) => set({ totalPages: pages }),
}))
