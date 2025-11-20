'use client'

import { Task } from '@/types/task'
import { useTask } from '@/hooks/useTask'
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Calendar,
  CalendarPlus,
  Flag,
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react'
import { useState } from 'react'

interface TaskCardProps {
  task: Task
  compact?: boolean
  showCategory?: boolean
  onClick?: () => void
}

export default function TaskCard({ 
  task, 
  compact = false, 
  showCategory = true,
  onClick 
}: TaskCardProps) {
  const { toggleTaskStatus, deleteTask } = useTask()
  const [showActions, setShowActions] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Check if task is overdue
  const isOverdue = task.dueDate && task.dueDate < new Date() && task.status !== 'completed'

  // Get status icon and color
  const getStatusDisplay = () => {
    if (task.status === 'completed') {
      return {
        icon: CheckCircle2,
        color: 'text-green-500',
        bg: 'bg-green-50'
      }
    }
    if (task.status === 'overdue' || isOverdue) {
      return {
        icon: AlertTriangle,
        color: 'text-red-500',
        bg: 'bg-red-50'
      }
    }
    if (task.status === 'pending') {
      return {
        icon: Clock,
        color: 'text-blue-500',
        bg: 'bg-blue-50'
      }
    }
    return {
      icon: Circle,
      color: 'text-gray-400',
      bg: 'bg-gray-50'
    }
  }

  // Get priority display
  const getPriorityDisplay = () => {
    if (!task.priority) return null

    switch (task.priority) {
      case 'urgent':
        return { color: 'text-red-600', bg: 'bg-red-100', label: 'Urgentní' }
      case 'high':
        return { color: 'text-orange-600', bg: 'bg-orange-100', label: 'Vysoká' }
      case 'medium':
        return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Střední' }
      case 'low':
        return { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Nízká' }
      default:
        return null
    }
  }

  // Get category display
  const getCategoryDisplay = () => {
    const categories = {
      'from-checklist': { label: 'Z checklistu', color: 'bg-teal-100 text-teal-700' },
      uncategorized: { label: 'Bez kategorie', color: 'bg-gray-100 text-gray-600' },
      foundation: { label: 'Základy', color: 'bg-purple-100 text-purple-700' },
      venue: { label: 'Místo', color: 'bg-blue-100 text-blue-700' },
      guests: { label: 'Hosté', color: 'bg-green-100 text-green-700' },
      budget: { label: 'Rozpočet', color: 'bg-yellow-100 text-yellow-700' },
      design: { label: 'Vzhled', color: 'bg-pink-100 text-pink-700' },
      organization: { label: 'Organizace', color: 'bg-indigo-100 text-indigo-700' },
      final: { label: 'Finální', color: 'bg-red-100 text-red-700' },
      custom: { label: 'Osobní', color: 'bg-gray-100 text-gray-700' }
    }
    return categories[task.category as keyof typeof categories] || categories.custom
  }

  // Format date
  const formatDate = (date: Date) => {
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Dnes'
    if (diffDays === 1) return 'Zítra'
    if (diffDays === -1) return 'Včera'
    if (diffDays < -1) return `Před ${Math.abs(diffDays)} dny`
    if (diffDays <= 7) return `Za ${diffDays} dní`

    return new Intl.DateTimeFormat('cs-CZ', {
      day: 'numeric',
      month: 'short'
    }).format(date)
  }

  // Handle status toggle
  const handleStatusToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsUpdating(true)
    try {
      await toggleTaskStatus(task.id)
    } catch (error) {
      console.error('Error toggling task status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle delete
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm('Opravdu chcete smazat tento úkol?')) {
      try {
        await deleteTask(task.id)
      } catch (error) {
        console.error('Error deleting task:', error)
      }
    }
    setShowActions(false)
  }

  // Handle add to calendar
  const handleAddToCalendar = (e: React.MouseEvent) => {
    e.stopPropagation()

    // Format dates for iCalendar format (YYYYMMDDTHHMMSSZ)
    const formatICalDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const now = new Date()
    const dueDate = task.dueDate || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // Default: 7 days from now

    // Set event to be all-day if no specific time
    const startDate = new Date(dueDate)
    startDate.setHours(9, 0, 0, 0) // 9:00 AM
    const endDate = new Date(dueDate)
    endDate.setHours(10, 0, 0, 0) // 10:00 AM

    // Create iCalendar content
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//SvatBot.cz//Wedding Planner//CS',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:svatbot-task-${task.id}@svatbot.cz`,
      `DTSTAMP:${formatICalDate(now)}`,
      `DTSTART:${formatICalDate(startDate)}`,
      `DTEND:${formatICalDate(endDate)}`,
      `SUMMARY:${task.title}`,
      task.description ? `DESCRIPTION:${task.description.replace(/\n/g, '\\n')}` : '',
      `CATEGORIES:${categoryDisplay.label}`,
      task.priority ? `PRIORITY:${task.priority === 'urgent' ? '1' : task.priority === 'high' ? '3' : task.priority === 'medium' ? '5' : '7'}` : '',
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(line => line).join('\r\n')

    // Create blob and download
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `svatbot-ukol-${task.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setShowActions(false)
  }

  const statusDisplay = getStatusDisplay()
  const priorityDisplay = getPriorityDisplay()
  const categoryDisplay = getCategoryDisplay()

  return (
    <div
      className="wedding-card group p-4"
      style={{
        ...(task.status === 'completed' && { opacity: 0.75, background: 'rgba(249, 250, 251, 0.95)' }),
        ...(isOverdue && task.status !== 'completed' && { background: 'rgba(254, 242, 242, 0.95)' }),
        ...(compact && { padding: '0.75rem' })
      }}
      onClick={onClick}
    >
      {/* Actions menu */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowActions(!showActions)
            }}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </button>

          {showActions && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowActions(false)
                  // TODO: Open edit modal
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
              >
                <Edit className="w-3 h-3" />
                <span>Upravit</span>
              </button>
              <button
                onClick={handleAddToCalendar}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 text-blue-600"
              >
                <CalendarPlus className="w-3 h-3" />
                <span>Přidat do kalendáře</span>
              </button>
              <button
                onClick={handleDelete}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 text-red-600"
              >
                <Trash2 className="w-3 h-3" />
                <span>Smazat</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start space-x-3">
        {/* Status checkbox */}
        <button
          onClick={handleStatusToggle}
          disabled={isUpdating}
          className={`
            mt-1 hover:scale-110 transition-transform
            ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <statusDisplay.icon className={`w-5 h-5 ${statusDisplay.color}`} />
        </button>

        {/* Task content */}
        <div className="flex-1 min-w-0">
          {/* Title and priority */}
          <div className="flex items-start justify-between mb-1">
            <h4 className={`
              font-medium leading-tight
              ${task.status === 'completed' 
                ? 'text-gray-500 line-through' 
                : 'text-gray-900'
              }
              ${compact ? 'text-sm' : 'text-base'}
            `}>
              {task.title}
            </h4>

            {!compact && priorityDisplay && (
              <div className={`
                flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ml-2
                ${priorityDisplay.bg} ${priorityDisplay.color}
              `}>
                <Flag className="w-3 h-3" />
                <span>{priorityDisplay.label}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {!compact && task.description && (
            <p className="text-sm text-text-muted mb-2 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-xs text-text-muted">
              {/* Due date */}
              {task.dueDate && (
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                    {formatDate(task.dueDate)}
                  </span>
                </div>
              )}

              {/* Category */}
              {showCategory && (
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${categoryDisplay.color}
                `}>
                  {categoryDisplay.label}
                </span>
              )}

              {/* Add to Calendar button */}
              {!compact && (
                <button
                  onClick={handleAddToCalendar}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors"
                  title="Přidat do kalendáře"
                >
                  <CalendarPlus className="w-3 h-3" />
                  <span className="text-xs font-medium">Kalendář</span>
                </button>
              )}
            </div>

            {/* Complete/Uncomplete button or Priority for compact mode */}
            {compact && priorityDisplay ? (
              <div className={`
                flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
                ${priorityDisplay.bg} ${priorityDisplay.color}
              `}>
                <Flag className="w-3 h-3" />
              </div>
            ) : !compact && (
              <button
                onClick={handleStatusToggle}
                disabled={isUpdating}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1 ${
                  task.status === 'completed'
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm hover:shadow-md'
                } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={task.status === 'completed' ? 'Označit jako nedokončené' : 'Označit jako hotové'}
              >
                {task.status === 'completed' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Hotovo</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">Hotovo</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Progress indicator for pending tasks */}
          {task.status === 'pending' && !compact && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div className="bg-blue-500 h-1 rounded-full w-1/2"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overdue indicator */}
      {isOverdue && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
      )}
    </div>
  )
}
