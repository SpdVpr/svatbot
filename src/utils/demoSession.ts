/**
 * Demo Session Management Utilities
 * 
 * Provides isolated demo environments for each user session.
 * Each demo user gets their own copy of mock data that they can modify,
 * but changes are not persisted between sessions.
 */

export interface DemoSessionConfig {
  weddingId: string
  userId: string
  collectionName: string
}

/**
 * Check if user is in demo mode
 */
export function isDemoUser(userId?: string, userEmail?: string, weddingId?: string): boolean {
  return userEmail === 'demo@svatbot.cz'
}

export function isReadOnlyUser(userEmail?: string): boolean {
  return userEmail === 'demo@svatbot.cz'
}

/**
 * Get session storage key for demo data
 */
export function getDemoSessionKey(config: DemoSessionConfig): string {
  return `demo_${config.collectionName}_${config.weddingId}_${config.userId}`
}

/**
 * Load demo data from session storage or create fresh mock data
 */
export function loadDemoData<T>(
  config: DemoSessionConfig,
  mockDataFactory: () => T[],
  dateConverter?: (item: any) => T
): T[] {
  const sessionKey = getDemoSessionKey(config)
  const existingData = sessionStorage.getItem(sessionKey)

  if (existingData) {
    console.log(`📦 Loading existing demo session data for ${config.collectionName}`)
    const parsedData = JSON.parse(existingData)

    // Apply date converter if provided
    if (dateConverter) {
      return parsedData.map(dateConverter)
    }

    return parsedData
  } else {
    console.log(`🎭 Creating fresh demo ${config.collectionName} data`)
    const freshData = mockDataFactory()
    sessionStorage.setItem(sessionKey, JSON.stringify(freshData))
    return freshData
  }
}

/**
 * Save demo data to session storage
 */
export function saveDemoData<T>(config: DemoSessionConfig, data: T[]): void {
  const sessionKey = getDemoSessionKey(config)
  sessionStorage.setItem(sessionKey, JSON.stringify(data))
  console.log(`💾 Saved demo ${config.collectionName} data to session`)
}

/**
 * Add item to demo data
 */
export function addDemoItem<T extends { id: string }>(
  config: DemoSessionConfig,
  newItem: T,
  sortFn?: (a: T, b: T) => number,
  dateConverter?: (item: any) => T
): T[] {
  const existingData = loadDemoData(config, () => [], dateConverter)
  const updatedData = [...existingData, newItem]

  if (sortFn) {
    updatedData.sort(sortFn)
  }

  saveDemoData(config, updatedData)
  return updatedData
}

/**
 * Update item in demo data
 */
export function updateDemoItem<T extends { id: string }>(
  config: DemoSessionConfig,
  itemId: string,
  updates: Partial<T>,
  sortFn?: (a: T, b: T) => number,
  dateConverter?: (item: any) => T
): T[] {
  const existingData = loadDemoData(config, () => [], dateConverter)
  const updatedData = existingData.map(item =>
    item.id === itemId ? { ...item, ...updates } : item
  )

  if (sortFn) {
    updatedData.sort(sortFn)
  }

  saveDemoData(config, updatedData)
  return updatedData
}

/**
 * Delete item from demo data
 */
export function deleteDemoItem<T extends { id: string }>(
  config: DemoSessionConfig,
  itemId: string,
  dateConverter?: (item: any) => T
): T[] {
  const existingData = loadDemoData(config, () => [], dateConverter)
  const updatedData = existingData.filter(item => item.id !== itemId)

  saveDemoData(config, updatedData)
  return updatedData
}

/**
 * Clear all demo data for a wedding
 */
export function clearDemoData(weddingId: string, userId: string): void {
  const collections = ['milestones', 'guests', 'tasks', 'budgetItems', 'vendors']
  
  collections.forEach(collection => {
    const sessionKey = getDemoSessionKey({
      weddingId,
      userId,
      collectionName: collection
    })
    sessionStorage.removeItem(sessionKey)
  })
  
  console.log('🧹 Cleared all demo data for wedding:', weddingId)
}

/**
 * Generate demo ID
 */
export function generateDemoId(prefix: string = 'demo'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
