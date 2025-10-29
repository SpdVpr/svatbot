export interface ShoppingItem {
  id: string
  weddingId: string
  userId: string
  
  // Product info
  name: string
  url?: string
  imageUrl?: string
  price?: number
  quantity?: number
  currency: string
  
  // Metadata
  description?: string
  category?: ShoppingCategory
  priority?: 'low' | 'medium' | 'high'
  
  // Status
  status: 'wishlist' | 'to-buy' | 'ordered' | 'purchased' | 'cancelled'
  isPurchased: boolean
  purchaseDate?: Date
  
  // Notes
  notes?: string
  tags: string[]
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

export type ShoppingCategory = 
  | 'decoration'      // Dekorace
  | 'clothing'        // Oblečení
  | 'accessories'     // Doplňky
  | 'gifts'           // Dárky
  | 'stationery'      // Papírenské zboží
  | 'flowers'         // Květiny
  | 'food-drinks'     // Jídlo a pití
  | 'tech'            // Technika
  | 'other'           // Ostatní

export const SHOPPING_CATEGORIES: { value: ShoppingCategory; label: string; icon: string }[] = [
  { value: 'decoration', label: 'Dekorace', icon: '🎨' },
  { value: 'clothing', label: 'Oblečení', icon: '👗' },
  { value: 'accessories', label: 'Doplňky', icon: '💍' },
  { value: 'gifts', label: 'Dárky', icon: '🎁' },
  { value: 'stationery', label: 'Papírenské zboží', icon: '📝' },
  { value: 'flowers', label: 'Květiny', icon: '💐' },
  { value: 'food-drinks', label: 'Jídlo a pití', icon: '🍰' },
  { value: 'tech', label: 'Technika', icon: '📷' },
  { value: 'other', label: 'Ostatní', icon: '📦' }
]

export interface ShoppingStats {
  totalItems: number
  totalValue: number
  purchasedItems: number
  purchasedValue: number
  pendingItems: number
  pendingValue: number
  byCategory: Record<ShoppingCategory, number>
  byStatus: Record<string, number>
}

export interface ShoppingFormData {
  name: string
  url?: string
  imageUrl?: string
  price?: number
  quantity?: number
  currency: string
  description?: string
  category?: ShoppingCategory
  priority?: 'low' | 'medium' | 'high'
  status: 'wishlist' | 'to-buy' | 'ordered' | 'purchased' | 'cancelled'
  notes?: string
  tags: string[]
}

