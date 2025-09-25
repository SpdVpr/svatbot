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
  BudgetItem,
  BudgetFormData,
  BudgetFilters,
  BudgetStats,
  Vendor,
  VendorFormData,
  Payment,
  BudgetAlert,
  BUDGET_CATEGORIES
} from '@/types/budget'

interface UseBudgetReturn {
  budgetItems: BudgetItem[]
  vendors: Vendor[]
  payments: Payment[]
  loading: boolean
  error: string | null
  stats: BudgetStats
  alerts: BudgetAlert[]
  createBudgetItem: (data: BudgetFormData) => Promise<BudgetItem>
  updateBudgetItem: (itemId: string, updates: Partial<BudgetItem>) => Promise<void>
  deleteBudgetItem: (itemId: string) => Promise<void>
  createVendor: (data: VendorFormData) => Promise<Vendor>
  updateVendor: (vendorId: string, updates: Partial<Vendor>) => Promise<void>
  deleteVendor: (vendorId: string) => Promise<void>
  recordPayment: (budgetItemId: string, amount: number, method: string) => Promise<void>

  getFilteredItems: (filters: BudgetFilters) => BudgetItem[]
  getTotalBudget: () => number
  getTotalSpent: () => number
  getBudgetByCategory: (category: string) => { budgeted: number; actual: number; paid: number }
  clearError: () => void
}

export function useBudget(): UseBudgetReturn {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Convert Firestore data to BudgetItem
  const convertFirestoreBudgetItem = (id: string, data: any): BudgetItem => {
    return {
      id,
      weddingId: data.weddingId,
      name: data.name,
      description: data.description,
      category: data.category,
      budgetedAmount: data.budgetedAmount || 0,
      actualAmount: data.actualAmount || 0,
      paidAmount: data.paidAmount || 0,
      currency: data.currency || 'CZK',
      vendorId: data.vendorId,
      vendorName: data.vendorName,
      paymentStatus: data.paymentStatus || 'pending',
      paymentMethod: data.paymentMethod,
      dueDate: data.dueDate?.toDate(),
      paidDate: data.paidDate?.toDate(),
      priority: data.priority || 'medium',
      notes: data.notes,
      tags: data.tags || [],
      isEstimate: data.isEstimate || false,
      isRecurring: data.isRecurring || false,
      recurringFrequency: data.recurringFrequency,
      payments: data.payments || [],
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      createdBy: data.createdBy
    }
  }

  // Convert BudgetItem to Firestore data
  const convertToFirestoreData = (item: Partial<BudgetItem>): any => {
    const result: any = {}

    if (item.weddingId !== undefined) result.weddingId = item.weddingId
    if (item.name !== undefined) result.name = item.name
    if (item.description !== undefined) result.description = item.description || null
    if (item.category !== undefined) result.category = item.category
    if (item.budgetedAmount !== undefined) result.budgetedAmount = item.budgetedAmount
    if (item.actualAmount !== undefined) result.actualAmount = item.actualAmount
    if (item.paidAmount !== undefined) result.paidAmount = item.paidAmount
    if (item.currency !== undefined) result.currency = item.currency
    if (item.vendorId !== undefined) result.vendorId = item.vendorId || null
    if (item.vendorName !== undefined) result.vendorName = item.vendorName || null
    if (item.paymentStatus !== undefined) result.paymentStatus = item.paymentStatus
    if (item.paymentMethod !== undefined) result.paymentMethod = item.paymentMethod || null
    if (item.dueDate !== undefined) result.dueDate = item.dueDate ? Timestamp.fromDate(item.dueDate) : null
    if (item.paidDate !== undefined) result.paidDate = item.paidDate ? Timestamp.fromDate(item.paidDate) : null
    if (item.priority !== undefined) result.priority = item.priority
    if (item.notes !== undefined) result.notes = item.notes || null
    if (item.tags !== undefined) result.tags = item.tags
    if (item.isEstimate !== undefined) result.isEstimate = item.isEstimate
    if (item.isRecurring !== undefined) result.isRecurring = item.isRecurring
    if (item.recurringFrequency !== undefined) result.recurringFrequency = item.recurringFrequency || null
    if (item.payments !== undefined) result.payments = item.payments || []
    if (item.createdAt !== undefined) result.createdAt = Timestamp.fromDate(item.createdAt)
    if (item.updatedAt !== undefined) result.updatedAt = Timestamp.fromDate(item.updatedAt)
    if (item.createdBy !== undefined) result.createdBy = item.createdBy

    return result
  }

  // Create new budget item
  const createBudgetItem = async (data: BudgetFormData): Promise<BudgetItem> => {
    if (!wedding || !user) {
      throw new Error('Žádná svatba nebo uživatel není vybrán')
    }

    try {
      setError(null)
      setLoading(true)

      const itemData: Omit<BudgetItem, 'id'> = {
        weddingId: wedding.id,
        name: data.name,
        description: data.description,
        category: data.category,
        budgetedAmount: data.budgetedAmount,
        actualAmount: data.actualAmount,
        paidAmount: data.paidAmount,
        currency: data.currency,
        vendorName: data.vendorName,
        paymentStatus: data.paymentStatus,
        paymentMethod: data.paymentMethod,
        dueDate: data.dueDate,
        paidDate: data.paidDate,
        priority: data.priority,
        notes: data.notes,
        tags: data.tags,
        isEstimate: data.isEstimate,
        isRecurring: false,
        payments: data.payments || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user.id
      }

      try {
        // Try to save to Firestore
        const docRef = await addDoc(collection(db, 'budgetItems'), convertToFirestoreData(itemData))
        const newItem: BudgetItem = { id: docRef.id, ...itemData }

        console.log('✅ Budget item created in Firestore:', newItem)

        // Don't update state here - let Firestore listener handle it

        return newItem
      } catch (firestoreError) {
        console.warn('⚠️ Firestore not available, using localStorage fallback')
        // Create item with local ID
        const localId = `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const newItem: BudgetItem = { id: localId, ...itemData }

        // Save to localStorage
        const savedItems = localStorage.getItem(`budgetItems_${wedding.id}`) || '[]'
        const existingItems = JSON.parse(savedItems)
        existingItems.push(newItem)
        localStorage.setItem(`budgetItems_${wedding.id}`, JSON.stringify(existingItems))
        console.log('💾 Budget item saved to localStorage (fallback)')

        // Update local state immediately for localStorage fallback
        setBudgetItems(prev => {
          const updated = [...prev, newItem]
          console.log('💰 Updated local budget items state (localStorage):', updated.length, updated)
          return updated
        })

        return newItem
      }
    } catch (error: any) {
      console.error('Error creating budget item:', error)
      setError('Chyba při vytváření rozpočtové položky')
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Update budget item
  const updateBudgetItem = async (itemId: string, updates: Partial<BudgetItem>): Promise<void> => {
    try {
      setError(null)

      const updatedData = {
        ...updates,
        updatedAt: new Date()
      }

      try {
        // Try to update in Firestore
        if (user && wedding?.id) {
          const itemRef = doc(db, 'budgetItems', itemId)
          await updateDoc(itemRef, convertToFirestoreData(updatedData as any))
        } else {
          throw new Error('User not authenticated or wedding not found')
        }
      } catch (firestoreError) {
        console.warn('⚠️ Firestore not available, updating localStorage fallback', firestoreError)
        if (wedding) {
          const savedItems = localStorage.getItem(`budgetItems_${wedding.id}`) || '[]'
          const existingItems = JSON.parse(savedItems)
          const itemIndex = existingItems.findIndex((item: BudgetItem) => item.id === itemId)
          if (itemIndex !== -1) {
            existingItems[itemIndex] = { ...existingItems[itemIndex], ...updatedData }
            localStorage.setItem(`budgetItems_${wedding.id}`, JSON.stringify(existingItems))
          }
        }
      }

      // Update local state
      setBudgetItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, ...updatedData } : item
      ))
    } catch (error: any) {
      console.error('Error updating budget item:', error)
      setError('Chyba při aktualizaci rozpočtové položky')
      throw error
    }
  }

  // Delete budget item
  const deleteBudgetItem = async (itemId: string): Promise<void> => {
    try {
      setError(null)

      try {
        // Try to delete from Firestore
        await deleteDoc(doc(db, 'budgetItems', itemId))
      } catch (firestoreError) {
        console.warn('⚠️ Firestore not available, deleting from localStorage fallback')
        if (wedding) {
          const savedItems = localStorage.getItem(`budgetItems_${wedding.id}`) || '[]'
          const existingItems = JSON.parse(savedItems)
          const filteredItems = existingItems.filter((item: BudgetItem) => item.id !== itemId)
          localStorage.setItem(`budgetItems_${wedding.id}`, JSON.stringify(filteredItems))
        }
      }

      // Update local state
      setBudgetItems(prev => prev.filter(item => item.id !== itemId))
    } catch (error: any) {
      console.error('Error deleting budget item:', error)
      setError('Chyba při mazání rozpočtové položky')
      throw error
    }
  }

  // Create vendor (placeholder)
  const createVendor = async (data: VendorFormData): Promise<Vendor> => {
    // TODO: Implement vendor creation
    throw new Error('Vendor creation not implemented yet')
  }

  // Update vendor (placeholder)
  const updateVendor = async (vendorId: string, updates: Partial<Vendor>): Promise<void> => {
    // TODO: Implement vendor update
    throw new Error('Vendor update not implemented yet')
  }

  // Delete vendor (placeholder)
  const deleteVendor = async (vendorId: string): Promise<void> => {
    // TODO: Implement vendor deletion
    throw new Error('Vendor deletion not implemented yet')
  }

  // Record payment
  const recordPayment = async (budgetItemId: string, amount: number, method: string): Promise<void> => {
    const item = budgetItems.find(item => item.id === budgetItemId)
    if (!item) return

    const newPaidAmount = item.paidAmount + amount
    const newStatus = newPaidAmount >= item.actualAmount ? 'paid' : 'partial'

    await updateBudgetItem(budgetItemId, {
      paidAmount: newPaidAmount,
      paymentStatus: newStatus,
      paidDate: newStatus === 'paid' ? new Date() : item.paidDate
    })
  }



  // Filter budget items
  const getFilteredItems = (filters: BudgetFilters): BudgetItem[] => {
    return budgetItems.filter(item => {
      if (filters.search && !item.name.toLowerCase().includes(filters.search.toLowerCase())) return false
      if (filters.category && !filters.category.includes(item.category)) return false
      if (filters.paymentStatus && !filters.paymentStatus.includes(item.paymentStatus)) return false
      if (filters.priority && !filters.priority.includes(item.priority)) return false
      return true
    })
  }

  // Get total budget
  const getTotalBudget = (): number => {
    // Use wedding budget as the main budget, fallback to sum of budget items
    return wedding?.budget || budgetItems.reduce((total, item) => total + item.budgetedAmount, 0)
  }

  // Get total spent
  const getTotalSpent = (): number => {
    return budgetItems.reduce((total, item) => total + item.actualAmount, 0)
  }

  // Get budget by category
  const getBudgetByCategory = (category: string) => {
    const categoryItems = budgetItems.filter(item => item.category === category)
    return {
      budgeted: categoryItems.reduce((total, item) => total + item.budgetedAmount, 0),
      actual: categoryItems.reduce((total, item) => total + item.actualAmount, 0),
      paid: categoryItems.reduce((total, item) => total + item.paidAmount, 0)
    }
  }

  // Calculate budget statistics
  const stats: BudgetStats = {
    totalBudget: getTotalBudget(),
    totalActual: getTotalSpent(),
    totalPaid: budgetItems.reduce((total, item) => total + item.paidAmount, 0),
    totalRemaining: getTotalBudget() - getTotalSpent(),
    budgetUsed: getTotalBudget() > 0 ? Math.round((getTotalSpent() / getTotalBudget()) * 100) : 0,
    paidPercentage: getTotalSpent() > 0 ? Math.round((budgetItems.reduce((total, item) => total + item.paidAmount, 0) / getTotalSpent()) * 100) : 0,
    remainingPercentage: getTotalBudget() > 0 ? Math.round(((getTotalBudget() - getTotalSpent()) / getTotalBudget()) * 100) : 100,
    itemsPending: budgetItems.filter(item => item.paymentStatus === 'pending').length,
    itemsPaid: budgetItems.filter(item => item.paymentStatus === 'paid').length,
    itemsOverdue: budgetItems.filter(item => item.paymentStatus === 'overdue').length,
    byCategory: {} as any, // Will be calculated separately
    vendorsTotal: vendors.length,
    vendorsBooked: vendors.filter(v => v.status === 'booked').length,
    vendorsConfirmed: vendors.filter(v => v.status === 'confirmed').length,
    upcomingPayments: [], // TODO: Calculate from payments
    overduePayments: [], // TODO: Calculate from payments
    overBudgetCategories: [], // TODO: Calculate
    criticalPayments: [] // TODO: Calculate
  }

  // Load budget items when wedding changes
  useEffect(() => {
    if (!wedding) {
      setBudgetItems([])
      return
    }

    const loadBudgetItems = async () => {
      try {
        setLoading(true)
        setError(null)

        // Check if this is a demo user
        const isDemoUser = user?.id === 'demo-user-id' || user?.email === 'demo@svatbot.cz' || wedding.id === 'demo-wedding'

        if (isDemoUser) {
          // Load demo budget items
          const demoBudgetItems: BudgetItem[] = [
            {
              id: 'demo-budget-1',
              weddingId: wedding.id,
              name: 'Místo konání',
              category: 'venue',
              budgetedAmount: 150000,
              actualAmount: 145000,
              paidAmount: 145000,
              currency: 'CZK',
              paymentStatus: 'paid',
              priority: 'critical',
              dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              paidDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
              vendorName: 'Château Mcely',
              notes: 'Záloha zaplacena, zbytek při akci',
              tags: [],
              isEstimate: false,
              isRecurring: false,
              createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
              createdBy: user?.id || 'demo-user-id'
            },
            {
              id: 'demo-budget-2',
              weddingId: wedding.id,
              name: 'Svatební fotograf',
              category: 'photography',
              budgetedAmount: 35000,
              actualAmount: 32000,
              paidAmount: 16000,
              currency: 'CZK',
              paymentStatus: 'partial',
              priority: 'high',
              dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
              vendorName: 'Photo Nejedlí',
              notes: 'Záloha zaplacena, zbytek po svatbě',
              tags: [],
              isEstimate: false,
              isRecurring: false,
              createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
              createdBy: user?.id || 'demo-user-id'
            },
            {
              id: 'demo-budget-3',
              weddingId: wedding.id,
              name: 'Svatební šaty',
              category: 'dress',
              budgetedAmount: 25000,
              actualAmount: 0,
              paidAmount: 0,
              currency: 'CZK',
              paymentStatus: 'pending',
              priority: 'medium',
              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              notes: 'Ještě nevybráno',
              tags: [],
              isEstimate: true,
              isRecurring: false,
              createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              createdBy: user?.id || 'demo-user-id'
            },
            {
              id: 'demo-budget-4',
              weddingId: wedding.id,
              name: 'Catering',
              category: 'catering',
              budgetedAmount: 120000,
              actualAmount: 115000,
              paidAmount: 0,
              currency: 'CZK',
              paymentStatus: 'pending',
              priority: 'critical',
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              vendorName: 'Gourmet Catering',
              notes: 'Menu potvrzeno, platba při akci',
              tags: [],
              isEstimate: false,
              isRecurring: false,
              createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
              createdBy: user?.id || 'demo-user-id'
            },
            {
              id: 'demo-budget-5',
              weddingId: wedding.id,
              name: 'Květinová výzdoba',
              category: 'flowers',
              budgetedAmount: 18000,
              actualAmount: 0,
              paidAmount: 0,
              currency: 'CZK',
              paymentStatus: 'pending',
              priority: 'medium',
              dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
              notes: 'Konzultace naplánována',
              tags: [],
              isEstimate: true,
              isRecurring: false,
              createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
              createdBy: user?.id || 'demo-user-id'
            }
          ]

          console.log('🎭 Loaded demo budget items:', demoBudgetItems.length, demoBudgetItems)
          setBudgetItems(demoBudgetItems)
          return
        }

        try {
          // Try to load from Firestore
          const itemsQuery = query(
            collection(db, 'budgetItems'),
            where('weddingId', '==', wedding.id)
          )

          const unsubscribe = onSnapshot(itemsQuery, (snapshot) => {
            const loadedItems = snapshot.docs.map(doc =>
              convertFirestoreBudgetItem(doc.id, doc.data())
            )
            console.log('💰 Loaded budget items from Firestore:', loadedItems.length, loadedItems)
            setBudgetItems(loadedItems)
          }, (error) => {
            console.warn('Firestore snapshot error, using localStorage fallback:', error)
            // Load from localStorage fallback
            const savedItems = localStorage.getItem(`budgetItems_${wedding.id}`)
            if (savedItems) {
              const parsedItems = JSON.parse(savedItems).map((item: any) => ({
                ...item,
                dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
                paidDate: item.paidDate ? new Date(item.paidDate) : undefined,
                createdAt: new Date(item.createdAt),
                updatedAt: new Date(item.updatedAt)
              }))
              console.log('📦 Loaded budget items from localStorage:', parsedItems.length, parsedItems)
              setBudgetItems(parsedItems)
            } else {
              console.log('📦 No budget items in localStorage for wedding:', wedding.id)
              setBudgetItems([])
            }
          })

          return unsubscribe
        } catch (firestoreError) {
          console.warn('⚠️ Firestore not available, loading from localStorage')
          const savedItems = localStorage.getItem(`budgetItems_${wedding.id}`)
          if (savedItems) {
            const parsedItems = JSON.parse(savedItems).map((item: any) => ({
              ...item,
              dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
              paidDate: item.paidDate ? new Date(item.paidDate) : undefined,
              createdAt: new Date(item.createdAt),
              updatedAt: new Date(item.updatedAt)
            }))
            console.log('📦 Loaded budget items from localStorage (catch):', parsedItems.length, parsedItems)
            setBudgetItems(parsedItems)
          } else {
            console.log('📦 No budget items in localStorage (catch) for wedding:', wedding.id)
            setBudgetItems([])
          }
        }
      } catch (error: any) {
        console.error('Error loading budget items:', error)
        setError('Chyba při načítání rozpočtu')
      } finally {
        setLoading(false)
      }
    }

    loadBudgetItems()
  }, [wedding?.id])

  // Clear error
  const clearError = () => setError(null)

  return {
    budgetItems,
    vendors,
    payments,
    loading,
    error,
    stats,
    alerts: [], // TODO: Implement alerts
    createBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    createVendor,
    updateVendor,
    deleteVendor,
    recordPayment,
    getFilteredItems,
    getTotalBudget,
    getTotalSpent,
    getBudgetByCategory,
    clearError
  }
}
