// Category store
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Category {
  id: string
  name: string
  description?: string
  emoji?: string
  product_count?: number
}

interface CategoryStore {
  categories: Category[]
  selectedCategoryId: string | null
  loading: boolean
  error: string | null
  setCategories: (categories: Category[]) => void
  setSelectedCategory: (categoryId: string | null) => void
  addCategory: (category: Category) => void
  updateCategory: (categoryId: string, category: Partial<Category>) => void
  removeCategory: (categoryId: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set) => ({
      categories: [],
      selectedCategoryId: null,
      loading: false,
      error: null,
      
      setCategories: (categories) => set({ categories }),
      
      setSelectedCategory: (categoryId) => set({ selectedCategoryId: categoryId }),
      
      addCategory: (category) =>
        set((state) => ({
          categories: [...state.categories, category],
        })),
      
      updateCategory: (categoryId, updatedData) =>
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === categoryId ? { ...cat, ...updatedData } : cat
          ),
        })),
      
      removeCategory: (categoryId) =>
        set((state) => ({
          categories: state.categories.filter((cat) => cat.id !== categoryId),
        })),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
    }),
    {
      name: 'category-store',
    }
  )
)
