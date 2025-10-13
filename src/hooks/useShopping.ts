'use client'

import { useState, useEffect, useMemo } from 'react'
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from './useAuth'
import { useWedding } from './useWedding'
import { ShoppingItem, ShoppingStats, ShoppingFormData, ShoppingCategory } from '@/types/shopping'

export function useShopping() {
  const { user } = useAuth()
  const { wedding } = useWedding()
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

    const totalValue = items.reduce((sum, item) => sum + (item.price || 0), 0)
    const purchasedValue = items
      .filter(item => item.isPurchased)
      .reduce((sum, item) => sum + (item.price || 0), 0)
    const pendingValue = items
      .filter(item => !item.isPurchased)
      .reduce((sum, item) => sum + (item.price || 0), 0)

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

  // Add new shopping item
  const addItem = async (data: ShoppingFormData): Promise<string> => {
    if (!user || !wedding?.id) {
      throw new Error('User or wedding not found')
    }

    const newItem = {
      weddingId: wedding.id,
      userId: user.id,
      name: data.name,
      url: data.url || null,
      imageUrl: data.imageUrl || null,
      price: data.price || null,
      currency: data.currency || 'CZK',
      description: data.description || null,
      category: data.category || null,
      priority: data.priority || null,
      status: data.status,
      isPurchased: data.status === 'purchased',
      purchaseDate: data.status === 'purchased' ? Timestamp.now() : null,
      notes: data.notes || null,
      tags: data.tags || [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }

    const docRef = await addDoc(collection(db, 'shopping'), newItem)
    return docRef.id
  }

  // Update shopping item
  const updateItem = async (id: string, data: Partial<ShoppingFormData>): Promise<void> => {
    const itemRef = doc(db, 'shopping', id)
    
    const updateData: any = {
      ...data,
      updatedAt: Timestamp.now()
    }

    // Update isPurchased based on status
    if (data.status) {
      updateData.isPurchased = data.status === 'purchased'
      updateData.purchaseDate = data.status === 'purchased' ? Timestamp.now() : null
    }

    await updateDoc(itemRef, updateData)
  }

  // Delete shopping item
  const deleteItem = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'shopping', id))
  }

  // Toggle purchased status
  const togglePurchased = async (id: string): Promise<void> => {
    const item = items.find(i => i.id === id)
    if (!item) return

    const newStatus = item.isPurchased ? 'to-buy' : 'purchased'
    await updateItem(id, { status: newStatus })
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

