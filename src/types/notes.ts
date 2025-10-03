export interface Note {
  id: string
  title: string
  content: string
  weddingId: string
  userId: string
  createdAt: Date
  updatedAt: Date
  tags?: string[]
  color?: 'yellow' | 'blue' | 'green' | 'pink' | 'purple' | 'orange'
  isPinned?: boolean
}

export interface NoteFormData {
  title: string
  content: string
  tags?: string[]
  color?: 'yellow' | 'blue' | 'green' | 'pink' | 'purple' | 'orange'
  isPinned?: boolean
}

export interface NotesFilters {
  search?: string
  tags?: string[]
  color?: string
  isPinned?: boolean
}
