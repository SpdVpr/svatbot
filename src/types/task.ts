// Task Management Types for SvatBot.cz

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled'

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export type TaskCategory =
  | 'foundation'    // Základy (místo, datum, rozpočet)
  | 'venue'         // Místo konání
  | 'guests'        // Hosté a pozvánky
  | 'budget'        // Rozpočet a platby
  | 'design'        // Design a dekorace
  | 'organization'  // Organizace a koordinace
  | 'final'         // Finální přípravy
  | 'custom'        // Vlastní úkoly
  | 'uncategorized' // Bez kategorie (pro úkoly ze checklistu)

export interface Task {
  id: string
  weddingId: string
  title: string
  description?: string
  category: TaskCategory
  status: TaskStatus
  priority?: TaskPriority
  dueDate?: Date
  completedAt?: Date
  assignedTo?: string // User ID or name
  notes?: string
  isTemplate: boolean // True for predefined tasks
  templateId?: string // Reference to template task
  checklistItemId?: string // Reference to checklist item if created from checklist
  order: number // For sorting within category
  createdAt: Date
  updatedAt: Date
}

export interface TaskTemplate {
  id: string
  title: string
  description: string
  category: TaskCategory
  priority: TaskPriority
  recommendedWeeksBefore: number // How many weeks before wedding
  isRequired: boolean
  dependsOn?: string[] // IDs of tasks that should be completed first
  applicableStyles?: string[] // Wedding styles this applies to
  estimatedHours?: number
  tips?: string[]
  order: number
}

export interface TaskProgress {
  category: TaskCategory
  total: number
  completed: number
  inProgress: number
  overdue: number
  percentage: number
}

export interface TaskFilters {
  status?: TaskStatus[]
  category?: TaskCategory[]
  priority?: (TaskPriority | 'none')[] // 'none' for filtering tasks without priority
  assignedTo?: string
  dueDateFrom?: Date
  dueDateTo?: Date
  search?: string
}

export interface TaskStats {
  total: number
  completed: number
  pending: number
  inProgress: number
  overdue: number
  upcoming: number
  completionRate: number
  progressByCategory: TaskProgress[]
}

// Quick actions for tasks
export interface TaskAction {
  id: string
  label: string
  icon: string
  action: (task: Task) => void
  condition?: (task: Task) => boolean
}

// Bulk operations
export interface BulkTaskOperation {
  taskIds: string[]
  operation: 'complete' | 'delete' | 'update-status' | 'update-category' | 'update-priority'
  data?: Partial<Task>
}

export interface TaskNotification {
  id: string
  taskId: string
  type: 'due-soon' | 'overdue' | 'completed' | 'assigned'
  message: string
  createdAt: Date
  read: boolean
}

// For task creation from templates
export interface CreateTaskFromTemplate {
  templateId: string
  weddingId: string
  customTitle?: string
  customDueDate?: Date
  assignedTo?: string
  notes?: string
}

// Task list view options
export interface TaskViewOptions {
  groupBy: 'category' | 'status' | 'priority' | 'due-date' | 'none'
  sortBy: 'due-date' | 'priority' | 'created' | 'title' | 'status'
  sortOrder: 'asc' | 'desc'
  showCompleted: boolean
  showTemplates: boolean
}

export interface TaskListProps {
  tasks: Task[]
  filters?: TaskFilters
  viewOptions?: TaskViewOptions
  onTaskUpdate: (task: Task) => void
  onTaskDelete: (taskId: string) => void
  onTaskCreate: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  onBulkOperation?: (operation: BulkTaskOperation) => void
  loading?: boolean
  error?: string
}

// Task form data
export interface TaskFormData {
  title: string
  description: string
  category: TaskCategory
  priority?: TaskPriority
  dueDate?: Date
  assignedTo?: string
  notes?: string
  checklistItemId?: string // Reference to checklist item if created from checklist
}

export interface TaskFormProps {
  task?: Task
  onSubmit: (data: TaskFormData) => void
  onCancel: () => void
  loading?: boolean
  error?: string
}
