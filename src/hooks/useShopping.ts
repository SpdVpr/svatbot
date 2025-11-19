'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from './useAuth'
import { useWedding } from './useWedding'
import { useDemoLock } from './useDemoLock'
import { ShoppingItem, ShoppingStats, ShoppingFormData, ShoppingCategory } from '@/types/shopping'
import { BudgetFormData } from '@/types/budget'

export function useShopping() {
  const { user } = useAuth()
  const { wedding } = useWedding()
  const { withDemoCheck } = useDemoLock()
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [loading, setLoading] = useState(true)

  // Real-time listener for shopping items
  useEffect(() => {
    if (!user || !wedding?.id) {
      setItems([])
      setLoading(false)
      return
    }

    const q = query(
      collection(db, 'shopping'),
      where('weddingId', '==', wedding.id)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const shoppingItems: ShoppingItem[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        shoppingItems.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          purchaseDate: data.purchaseDate?.toDate() || undefined
        } as ShoppingItem)
      })
      setItems(shoppingItems)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user, wedding?.id])

  // Calculate statistics
  const stats: ShoppingStats = useMemo(() => {
    const totalItems = items.length
    const purchasedItems = items.filter(item => item.isPurchased).length
    const pendingItems = items.filter(item => !item.isPurchased).length

    const totalValue = items.reduce((sum, item) => {
      const itemPrice = item.price || 0
      const itemQuantity = item.quantity || 1
      return sum + (itemPrice * itemQuantity)
    }, 0)
    const purchasedValue = items
      .filter(item => item.isPurchased)
      .reduce((sum, item) => {
        const itemPrice = item.price || 0
        const itemQuantity = item.quantity || 1
        return sum + (itemPrice * itemQuantity)
      }, 0)
    const pendingValue = items
      .filter(item => !item.isPurchased)
      .reduce((sum, item) => {
        const itemPrice = item.price || 0
        const itemQuantity = item.quantity || 1
        return sum + (itemPrice * itemQuantity)
      }, 0)

    const byCategory: Record<ShoppingCategory, number> = {
      decoration: 0,
      clothing: 0,
      accessories: 0,
      gifts: 0,
      stationery: 0,
      flowers: 0,
      'food-drinks': 0,
      tech: 0,
      other: 0
    }

    const byStatus: Record<string, number> = {
      wishlist: 0,
      'to-buy': 0,
      ordered: 0,
      purchased: 0,
      cancelled: 0
    }

    items.forEach(item => {
      if (item.category) {
        byCategory[item.category]++
      }
      byStatus[item.status]++
    })

    return {
      totalItems,
      totalValue,
      purchasedItems,
      purchasedValue,
      pendingItems,
      pendingValue,
      byCategory,
      byStatus
    }
  }, [items])

  // Helper function to remove undefined values
  const removeUndefined = (obj: any): any => {
    const cleaned: any = {}
    Object.keys(obj).forEach(key => {
      if (obj[key] !== undefined) {
        cleaned[key] = obj[key]
      }
    })
    return cleaned
  }

  // Helper function to create budget item from shopping item
  const createBudgetItemFromShopping = useCallback(async (shoppingItem: ShoppingItem): Promise<void> => {
    if (!user || !wedding?.id) return
    if (!shoppingItem.price) return // Skip items without price

    try {
      const totalAmount = (shoppingItem.price || 0) * (shoppingItem.quantity || 1)

      // Try to extract vendor name from URL
      let vendorName: string | null = null
      if (shoppingItem.url) {
        try {
          vendorName = new URL(shoppingItem.url).hostname
        } catch {
          // Invalid URL, ignore
        }
      }

      // Create a payment record for the shopping item
      const paymentRecord = {
        id: `payment_${Date.now()}`,
        amount: totalAmount,
        currency: shoppingItem.currency || 'CZK',
        date: Timestamp.now(),
        description: `Platba z nákupního seznamu`,
        status: 'completed',
        createdAt: Timestamp.now()
      }

      const budgetData: any = {
        weddingId: wedding.id,
        name: shoppingItem.name,
        description: shoppingItem.description || `Zakoupeno z nákupního seznamu${shoppingItem.url ? ` - ${shoppingItem.url}` : ''}`,
        category: 'shopping',
        budgetedAmount: totalAmount,
        actualAmount: totalAmount,
        paidAmount: totalAmount,
        currency: shoppingItem.currency || 'CZK',
        paymentStatus: 'paid',
        paidDate: Timestamp.fromDate(new Date()),
        priority: 'low',
        tags: [...(shoppingItem.tags || []), 'nákupní-seznam'],
        isEstimate: false,
        isRecurring: false,
        payments: [paymentRecord], // Add the payment record
        documents: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: user.id
      }

      // Add optional fields only if they have values (not null/undefined)
      if (vendorName) {
        budgetData.vendorName = vendorName
      }
      if (shoppingItem.notes) {
        budgetData.notes = shoppingItem.notes
      }

      await addDoc(collection(db, 'budgetItems'), budgetData)
      console.log('✅ Budget item created from shopping item:', shoppingItem.name)
    } catch (error) {
      console.error('Error creating budget item from shopping item:', error)
      // Don't throw - we don't want to block the shopping item update
    }
  }, [user, wedding?.id])

  // Add new shopping item
  const addItem = useCallback(async (data: ShoppingFormData): Promise<string> => {
    return withDemoCheck(async () => {
      if (!user || !wedding?.id) {
        throw new Error('User or wedding not found')
      }

      const isPurchased = data.status === 'purchased'
      const newItem = {
        weddingId: wedding.id,
        userId: user.id,
        name: data.name,
        url: data.url || null,
        imageUrl: data.imageUrl || null,
        price: data.price || null,
        quantity: data.quantity || null,
        currency: data.currency || 'CZK',
        description: data.description || null,
        category: data.category || null,
        priority: data.priority || null,
        status: data.status,
        isPurchased,
        purchaseDate: isPurchased ? Timestamp.now() : null,
        notes: data.notes || null,
        tags: data.tags || [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }

      const docRef = await addDoc(collection(db, 'shopping'), newItem)

      // If item is added as purchased, create budget entry
      if (isPurchased) {
        const shoppingItem: ShoppingItem = {
          id: docRef.id,
          ...newItem,
          createdAt: new Date(),
          updatedAt: new Date(),
          purchaseDate: new Date()
        } as ShoppingItem
        await createBudgetItemFromShopping(shoppingItem)
      }

      return docRef.id
    }) as Promise<string>
  }, [user, wedding?.id, withDemoCheck, createBudgetItemFromShopping])

  // Update shopping item
  const updateItem = async (id: string, data: Partial<ShoppingFormData>): Promise<void> => {
    const itemRef = doc(db, 'shopping', id)

    const updateData: any = {
      ...data,
      updatedAt: Timestamp.now()
    }

    // Update isPurchased based on status
    const wasPurchased = data.status === 'purchased'
    if (data.status) {
      updateData.isPurchased = wasPurchased

      // Add purchase date when marking as purchased
      if (wasPurchased && !updateData.purchaseDate) {
        updateData.purchaseDate = Timestamp.now()
      }
    }

    // Remove undefined values before saving to Firestore
    const cleanedData = removeUndefined(updateData)

    await updateDoc(itemRef, cleanedData)

    // If item was just marked as purchased, create budget entry
    if (wasPurchased) {
      const item = items.find(i => i.id === id)
      if (item && !item.isPurchased) {
        // Item was just marked as purchased (wasn't purchased before)
        const updatedItem = { ...item, ...data, isPurchased: true, purchaseDate: new Date() }
        await createBudgetItemFromShopping(updatedItem as ShoppingItem)
      }
    }
  }

  // Delete shopping item
  const deleteItem = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'shopping', id))
  }

  // Toggle purchased status
  const togglePurchased = async (id: string): Promise<void> => {
    return withDemoCheck(async () => {
      const item = items.find(i => i.id === id)
      if (!item) return

      const newStatus = item.isPurchased ? 'to-buy' : 'purchased'
      await updateItem(id, { status: newStatus })
    }) as Promise<void>
  }

  return {
    items,
    stats,
    loading,
    addItem,
    updateItem,
    deleteItem,
    togglePurchased
  }
}

