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
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      createdBy: data.createdBy
    }
  }

  // Convert BudgetItem to Firestore data
  const convertToFirestoreData = (item: Omit<BudgetItem, 'id'>): any => {
    return {
      weddingId: item.weddingId,
      name: item.name,
      description: item.description || null,
      category: item.category,
      budgetedAmount: item.budgetedAmount,
      actualAmount: item.actualAmount,
      paidAmount: item.paidAmount,
      currency: item.currency,
      vendorId: item.vendorId || null,
      vendorName: item.vendorName || null,
      paymentStatus: item.paymentStatus,
      paymentMethod: item.paymentMethod || null,
      dueDate: item.dueDate ? Timestamp.fromDate(item.dueDate) : null,
      paidDate: item.paidDate ? Timestamp.fromDate(item.paidDate) : null,
      priority: item.priority,
      notes: item.notes || null,
      tags: item.tags,
      isEstimate: item.isEstimate,
      isRecurring: item.isRecurring,
      recurringFrequency: item.recurringFrequency || null,
      createdAt: Timestamp.fromDate(item.createdAt),
      updatedAt: Timestamp.fromDate(item.updatedAt),
      createdBy: item.createdBy
    }
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
        paidAmount: 0,
        currency: data.currency,
        vendorName: data.vendorName,
        paymentStatus: data.paymentStatus,
        paymentMethod: data.paymentMethod,
        dueDate: data.dueDate,
        priority: data.priority,
        notes: data.notes,
        tags: data.tags,
        isEstimate: data.isEstimate,
        isRecurring: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user.id
      }

      try {
        // Try to save to Firestore
        const docRef = await addDoc(collection(db, 'budgetItems'), convertToFirestoreData(itemData))
        const newItem: BudgetItem = { id: docRef.id, ...itemData }

        console.log('✅ Budget item created in Firestore:', newItem)

        // Update local state immediately
        setBudgetItems(prev => {
          const updated = [...prev, newItem]
          console.log('💰 Updated local budget items state:', updated.length, updated)
          return updated
        })

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

        // Update local state
        setBudgetItems(prev => [...prev, newItem])

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
        const itemRef = doc(db, 'budgetItems', itemId)
        await updateDoc(itemRef, convertToFirestoreData(updatedData as any))
      } catch (firestoreError) {
        console.warn('⚠️ Firestore not available, updating localStorage fallback')
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
