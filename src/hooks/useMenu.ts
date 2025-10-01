'use client'

import { useState, useEffect } from 'react'
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuth } from './useAuth'
import { useWedding } from './useWedding'
import {
  MenuItem,
  DrinkItem,
  MenuFormData,
  DrinkFormData,
  MenuStats,
  MenuFilters,
  FoodCategory,
  DrinkCategory
} from '@/types/menu'

// LocalStorage keys
const MENU_ITEMS_KEY = 'svatbot_menu_items'
const DRINK_ITEMS_KEY = 'svatbot_drink_items'

interface UseMenuReturn {
  menuItems: MenuItem[]
  drinkItems: DrinkItem[]
  loading: boolean
  error: string | null
  stats: MenuStats
  createMenuItem: (data: MenuFormData) => Promise<MenuItem>
  updateMenuItem: (itemId: string, updates: Partial<MenuItem>) => Promise<void>
  deleteMenuItem: (itemId: string) => Promise<void>
  createDrinkItem: (data: DrinkFormData) => Promise<DrinkItem>
  updateDrinkItem: (itemId: string, updates: Partial<DrinkItem>) => Promise<void>
  deleteDrinkItem: (itemId: string) => Promise<void>
  getFilteredMenuItems: (filters: MenuFilters) => MenuItem[]
  getFilteredDrinkItems: (filters: MenuFilters) => DrinkItem[]
  getTotalEstimatedCost: () => number
  getTotalActualCost: () => number
  clearError: () => void
}

export function useMenu(): UseMenuReturn {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [drinkItems, setDrinkItems] = useState<DrinkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { wedding } = useWedding()

  // Calculate stats
  const stats: MenuStats = {
    totalMenuItems: menuItems.length,
    totalDrinkItems: drinkItems.length,
    totalEstimatedCost: menuItems.reduce((sum, item) => sum + (item.totalCost || 0), 0) +
                        drinkItems.reduce((sum, item) => sum + (item.totalCost || 0), 0),
    totalActualCost: menuItems.reduce((sum, item) => 
      sum + ((item.actualQuantity || 0) * (item.pricePerServing || 0)), 0) +
      drinkItems.reduce((sum, item) => 
        sum + ((item.actualQuantity || 0) * (item.pricePerUnit || 0)), 0),
    
    vegetarianOptions: menuItems.filter(item => item.isVegetarian).length,
    veganOptions: menuItems.filter(item => item.isVegan).length,
    glutenFreeOptions: menuItems.filter(item => item.isGlutenFree).length,
    
    alcoholicDrinks: drinkItems.filter(item => item.isAlcoholic).length,
    nonAlcoholicDrinks: drinkItems.filter(item => !item.isAlcoholic).length,
    
    plannedItems: [...menuItems, ...drinkItems].filter(item => item.status === 'planned').length,
    confirmedItems: [...menuItems, ...drinkItems].filter(item => item.status === 'confirmed').length,
    orderedItems: [...menuItems, ...drinkItems].filter(item => item.status === 'ordered').length,
    
    itemsByCategory: {} as Record<FoodCategory | DrinkCategory, number>
  }

  // Create menu item
  const createMenuItem = async (data: MenuFormData): Promise<MenuItem> => {
    if (!wedding?.id) throw new Error('Není vybrána svatba')

    try {
      const totalCost = (data.pricePerServing || 0) * data.estimatedQuantity
      const now = new Date()

      const newItem: MenuItem = {
        id: `menu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        weddingId: wedding.id,
        ...data,
        totalCost,
        actualQuantity: undefined,
        currency: 'CZK',
        createdAt: now,
        updatedAt: now
      }

      // Demo mode - use localStorage
      const isDemoUser = user?.id === 'demo-user-id' || user?.email === 'demo@svatbot.cz' || wedding.id === 'demo-wedding'
      if (isDemoUser) {
        console.log('🎭 Demo mode - saving menu item to localStorage')
        const stored = localStorage.getItem(MENU_ITEMS_KEY)
        const items = stored ? JSON.parse(stored) : []
        items.push(newItem)
        localStorage.setItem(MENU_ITEMS_KEY, JSON.stringify(items))
        setMenuItems(items)
        return newItem
      }

      // Real user - use Firestore
      const menuItemData = {
        weddingId: wedding.id,
        ...data,
        totalCost,
        actualQuantity: null,
        currency: 'CZK',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }

      const docRef = await addDoc(collection(db, 'menuItems'), menuItemData)

      return {
        id: docRef.id,
        ...menuItemData,
        createdAt: now,
        updatedAt: now
      } as MenuItem
    } catch (err: any) {
      console.error('Error creating menu item:', err)
      throw new Error('Chyba při vytváření položky menu')
    }
  }

  // Update menu item
  const updateMenuItem = async (itemId: string, updates: Partial<MenuItem>): Promise<void> => {
    try {
      // Recalculate total cost if relevant fields changed
      if (updates.pricePerServing !== undefined || updates.estimatedQuantity !== undefined) {
        const item = menuItems.find(i => i.id === itemId)
        if (item) {
          const pricePerServing = updates.pricePerServing ?? item.pricePerServing ?? 0
          const estimatedQuantity = updates.estimatedQuantity ?? item.estimatedQuantity
          updates.totalCost = pricePerServing * estimatedQuantity
        }
      }

      // Demo mode - use localStorage
      const isDemoUser = user?.id === 'demo-user-id' || user?.email === 'demo@svatbot.cz' || wedding?.id === 'demo-wedding'
      if (isDemoUser) {
        console.log('🎭 Demo mode - updating menu item in localStorage')
        const stored = localStorage.getItem(MENU_ITEMS_KEY)
        const items = stored ? JSON.parse(stored) : []
        const index = items.findIndex((i: MenuItem) => i.id === itemId)
        if (index !== -1) {
          items[index] = { ...items[index], ...updates, updatedAt: new Date() }
          localStorage.setItem(MENU_ITEMS_KEY, JSON.stringify(items))
          setMenuItems(items)
        }
        return
      }

      // Real user - use Firestore
      const itemRef = doc(db, 'menuItems', itemId)
      await updateDoc(itemRef, {
        ...updates,
        updatedAt: Timestamp.now()
      })
    } catch (err: any) {
      console.error('Error updating menu item:', err)
      throw new Error('Chyba při aktualizaci položky menu')
    }
  }

  // Delete menu item
  const deleteMenuItem = async (itemId: string): Promise<void> => {
    try {
      // Demo mode - use localStorage
      const isDemoUser = user?.id === 'demo-user-id' || user?.email === 'demo@svatbot.cz' || wedding?.id === 'demo-wedding'
      if (isDemoUser) {
        console.log('🎭 Demo mode - deleting menu item from localStorage')
        const stored = localStorage.getItem(MENU_ITEMS_KEY)
        const items = stored ? JSON.parse(stored) : []
        const filtered = items.filter((i: MenuItem) => i.id !== itemId)
        localStorage.setItem(MENU_ITEMS_KEY, JSON.stringify(filtered))
        setMenuItems(filtered)
        return
      }

      // Real user - use Firestore
      await deleteDoc(doc(db, 'menuItems', itemId))
    } catch (err: any) {
      console.error('Error deleting menu item:', err)
      throw new Error('Chyba při mazání položky menu')
    }
  }

  // Create drink item
  const createDrinkItem = async (data: DrinkFormData): Promise<DrinkItem> => {
    if (!wedding?.id) throw new Error('Není vybrána svatba')

    try {
      const totalCost = (data.pricePerUnit || 0) * data.estimatedQuantity
      const now = new Date()

      const newItem: DrinkItem = {
        id: `drink_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        weddingId: wedding.id,
        ...data,
        totalCost,
        actualQuantity: undefined,
        currency: 'CZK',
        createdAt: now,
        updatedAt: now
      }

      // Demo mode - use localStorage
      const isDemoUser = user?.id === 'demo-user-id' || user?.email === 'demo@svatbot.cz' || wedding.id === 'demo-wedding'
      if (isDemoUser) {
        console.log('🎭 Demo mode - saving drink item to localStorage')
        const stored = localStorage.getItem(DRINK_ITEMS_KEY)
        const items = stored ? JSON.parse(stored) : []
        items.push(newItem)
        localStorage.setItem(DRINK_ITEMS_KEY, JSON.stringify(items))
        setDrinkItems(items)
        return newItem
      }

      // Real user - use Firestore
      const drinkItemData = {
        weddingId: wedding.id,
        ...data,
        totalCost,
        actualQuantity: null,
        currency: 'CZK',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }

      const docRef = await addDoc(collection(db, 'drinkItems'), drinkItemData)

      return {
        id: docRef.id,
        ...drinkItemData,
        createdAt: now,
        updatedAt: now
      } as DrinkItem
    } catch (err: any) {
      console.error('Error creating drink item:', err)
      throw new Error('Chyba při vytváření nápoje')
    }
  }

  // Update drink item
  const updateDrinkItem = async (itemId: string, updates: Partial<DrinkItem>): Promise<void> => {
    try {
      // Recalculate total cost if relevant fields changed
      if (updates.pricePerUnit !== undefined || updates.estimatedQuantity !== undefined) {
        const item = drinkItems.find(i => i.id === itemId)
        if (item) {
          const pricePerUnit = updates.pricePerUnit ?? item.pricePerUnit ?? 0
          const estimatedQuantity = updates.estimatedQuantity ?? item.estimatedQuantity
          updates.totalCost = pricePerUnit * estimatedQuantity
        }
      }

      // Demo mode - use localStorage
      const isDemoUser = user?.id === 'demo-user-id' || user?.email === 'demo@svatbot.cz' || wedding?.id === 'demo-wedding'
      if (isDemoUser) {
        console.log('🎭 Demo mode - updating drink item in localStorage')
        const stored = localStorage.getItem(DRINK_ITEMS_KEY)
        const items = stored ? JSON.parse(stored) : []
        const index = items.findIndex((i: DrinkItem) => i.id === itemId)
        if (index !== -1) {
          items[index] = { ...items[index], ...updates, updatedAt: new Date() }
          localStorage.setItem(DRINK_ITEMS_KEY, JSON.stringify(items))
          setDrinkItems(items)
        }
        return
      }

      // Real user - use Firestore
      const itemRef = doc(db, 'drinkItems', itemId)
      await updateDoc(itemRef, {
        ...updates,
        updatedAt: Timestamp.now()
      })
    } catch (err: any) {
      console.error('Error updating drink item:', err)
      throw new Error('Chyba při aktualizaci nápoje')
    }
  }

  // Delete drink item
  const deleteDrinkItem = async (itemId: string): Promise<void> => {
    try {
      // Demo mode - use localStorage
      const isDemoUser = user?.id === 'demo-user-id' || user?.email === 'demo@svatbot.cz' || wedding?.id === 'demo-wedding'
      if (isDemoUser) {
        console.log('🎭 Demo mode - deleting drink item from localStorage')
        const stored = localStorage.getItem(DRINK_ITEMS_KEY)
        const items = stored ? JSON.parse(stored) : []
        const filtered = items.filter((i: DrinkItem) => i.id !== itemId)
        localStorage.setItem(DRINK_ITEMS_KEY, JSON.stringify(filtered))
        setDrinkItems(filtered)
        return
      }

      // Real user - use Firestore
      await deleteDoc(doc(db, 'drinkItems', itemId))
    } catch (err: any) {
      console.error('Error deleting drink item:', err)
      throw new Error('Chyba při mazání nápoje')
    }
  }

  // Filter menu items
  const getFilteredMenuItems = (filters: MenuFilters): MenuItem[] => {
    return menuItems.filter(item => {
      if (filters.category && item.category !== filters.category) return false
      if (filters.status && item.status !== filters.status) return false
      if (filters.isVegetarian !== undefined && item.isVegetarian !== filters.isVegetarian) return false
      if (filters.isVegan !== undefined && item.isVegan !== filters.isVegan) return false
      if (filters.isGlutenFree !== undefined && item.isGlutenFree !== filters.isGlutenFree) return false
      if (filters.vendorId && item.vendorId !== filters.vendorId) return false
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        return item.name.toLowerCase().includes(query) ||
               item.description?.toLowerCase().includes(query)
      }
      return true
    })
  }

  // Filter drink items
  const getFilteredDrinkItems = (filters: MenuFilters): DrinkItem[] => {
    return drinkItems.filter(item => {
      if (filters.category && item.category !== filters.category) return false
      if (filters.status && item.status !== filters.status) return false
      if (filters.isAlcoholic !== undefined && item.isAlcoholic !== filters.isAlcoholic) return false
      if (filters.vendorId && item.vendorId !== filters.vendorId) return false
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        return item.name.toLowerCase().includes(query) ||
               item.description?.toLowerCase().includes(query) ||
               item.brand?.toLowerCase().includes(query)
      }
      return true
    })
  }

  // Get total estimated cost
  const getTotalEstimatedCost = (): number => {
    return stats.totalEstimatedCost
  }

  // Get total actual cost
  const getTotalActualCost = (): number => {
    return stats.totalActualCost
  }

  // Load menu items from Firestore or localStorage
  useEffect(() => {
    if (!wedding?.id) {
      setMenuItems([])
      setDrinkItems([])
      setLoading(false)
      return
    }

    const loadMenuData = async () => {
      try {
        setLoading(true)

        // Demo mode - use localStorage
        const isDemoUser = user?.id === 'demo-user-id' || user?.email === 'demo@svatbot.cz' || wedding.id === 'demo-wedding'

        if (isDemoUser) {
          console.log('🎭 Demo mode - loading menu from localStorage')

          const storedMenu = localStorage.getItem(MENU_ITEMS_KEY)
          const storedDrinks = localStorage.getItem(DRINK_ITEMS_KEY)

          const menuItems = storedMenu ? JSON.parse(storedMenu).map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt)
          })) : []

          const drinkItems = storedDrinks ? JSON.parse(storedDrinks).map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt)
          })) : []

          setMenuItems(menuItems)
          setDrinkItems(drinkItems)
          setLoading(false)
          return
        }

        console.log('✅ Real user - loading menu from Firestore for wedding:', wedding.id)

        // Real user - use Firestore
        try {
          // Subscribe to menu items
          const menuQuery = query(
            collection(db, 'menuItems'),
            where('weddingId', '==', wedding.id),
            orderBy('createdAt', 'desc')
          )

          const unsubscribeMenu = onSnapshot(menuQuery, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date(),
              updatedAt: doc.data().updatedAt?.toDate() || new Date()
            })) as MenuItem[]
            setMenuItems(items)
          })

          // Subscribe to drink items
          const drinkQuery = query(
            collection(db, 'drinkItems'),
            where('weddingId', '==', wedding.id),
            orderBy('createdAt', 'desc')
          )

          const unsubscribeDrinks = onSnapshot(drinkQuery, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date(),
              updatedAt: doc.data().updatedAt?.toDate() || new Date()
            })) as DrinkItem[]
            setDrinkItems(items)
          })

          setLoading(false)

          return () => {
            unsubscribeMenu()
            unsubscribeDrinks()
          }
        } catch (firestoreError) {
          console.warn('⚠️ Firestore not available, using localStorage only:', firestoreError)
          // Fallback to localStorage if Firestore fails
          const storedMenu = localStorage.getItem(MENU_ITEMS_KEY)
          const storedDrinks = localStorage.getItem(DRINK_ITEMS_KEY)

          setMenuItems(storedMenu ? JSON.parse(storedMenu) : [])
          setDrinkItems(storedDrinks ? JSON.parse(storedDrinks) : [])
          setLoading(false)
        }
      } catch (err: any) {
        console.error('Error loading menu data:', err)
        setError('Chyba při načítání menu')
        setLoading(false)
      }
    }

    loadMenuData()
  }, [wedding?.id, user?.uid, user?.email])

  const clearError = () => setError(null)

  return {
    menuItems,
    drinkItems,
    loading,
    error,
    stats,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    createDrinkItem,
    updateDrinkItem,
    deleteDrinkItem,
    getFilteredMenuItems,
    getFilteredDrinkItems,
    getTotalEstimatedCost,
    getTotalActualCost,
    clearError
  }
}

