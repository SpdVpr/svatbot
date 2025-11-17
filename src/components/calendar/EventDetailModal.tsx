'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { cs } from 'date-fns/locale'
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  Tag,
  AlertCircle,
  CheckCircle,
  Trash2,
  Edit2,
  ExternalLink
} from 'lucide-react'
import { AggregatedEvent } from '@/types/calendar'
import { useCalendar } from '@/hooks/useCalendar'

interface EventDetailModalProps {
  event: AggregatedEvent
  onClose: () => void
}

export default function EventDetailModal({ event, onClose }: EventDetailModalProps) {
  const { deleteEvent, updateEvent } = useCalendar()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editData, setEditData] = useState({
    title: event.event.title,
    description: event.event.description || '',
    location: event.event.location || '',
    startTime: event.event.startTime || '',
    endTime: event.event.endTime || '',
    isAllDay: event.event.isAllDay
  })

  const handleDelete = async () => {
    if (!confirm('Opravdu chcete smazat tuto událost z kalendáře?')) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteEvent(event.event.id)
      onClose()
    } catch (error) {
      console.error('Error deleting event:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSave = async () => {
    if (!editData.title.trim()) {
      return
    }

    setIsSaving(true)
    try {
      const updateData: any = {
        title: editData.title,
        description: editData.description,
        isAllDay: editData.isAllDay
      }

      // Only add optional fields if they have values
      if (editData.location) {
        updateData.location = editData.location
      }
      if (!editData.isAllDay && editData.startTime) {
        updateData.startTime = editData.startTime
      }
      if (!editData.isAllDay && editData.endTime) {
        updateData.endTime = editData.endTime
      }

      await updateEvent(event.event.id, updateData)
      setIsEditing(false)
      onClose()
    } catch (error) {
      console.error('Error updating event:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const eventTypeLabels: Record<string, string> = {
    task: 'Úkol',
    meeting: 'Schůzka',
    deadline: 'Termín',
    ceremony: 'Obřad',
    reception: 'Hostina',
    other: 'Ostatní'
  }

  const priorityColors: Record<string, string> = {
    critical: 'bg-red-100 text-red-800 border-red-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    low: 'bg-gray-100 text-gray-800 border-gray-300'
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6 rounded-t-xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                  {eventTypeLabels[event.event.type] || event.event.type}
                </span>
                {event.event.isCompleted && (
                  <span className="px-3 py-1 bg-green-500/30 rounded-full text-sm font-medium flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>Dokončeno</span>
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold">{event.event.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isEditing ? (
            /* Edit Mode */
            <>
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Název události *
                </label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Název události"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Popis
                </label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Popis události"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Místo
                </label>
                <input
                  type="text"
                  value={editData.location}
                  onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Místo konání"
                />
              </div>

              {/* All Day Toggle */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isAllDay"
                  checked={editData.isAllDay}
                  onChange={(e) => setEditData(prev => ({ ...prev, isAllDay: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="isAllDay" className="text-sm font-medium text-gray-700">
                  Celodenní událost
                </label>
              </div>

              {/* Time fields - only if not all day */}
              {!editData.isAllDay && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Začátek
                    </label>
                    <input
                      type="time"
                      value={editData.startTime}
                      onChange={(e) => setEditData(prev => ({ ...prev, startTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Konec
                    </label>
                    <input
                      type="time"
                      value={editData.endTime}
                      onChange={(e) => setEditData(prev => ({ ...prev, endTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            /* View Mode */
            <>
              {/* Date and Time */}
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {format(event.event.startDate, 'd. MMMM yyyy', { locale: cs })}
                    </p>
                    {event.event.endDate && (
                      <p className="text-sm text-gray-500">
                        do {format(event.event.endDate, 'd. MMMM yyyy', { locale: cs })}
                      </p>
                )}
              </div>
            </div>

            {(event.event.startTime || event.event.endTime) && (
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">
                    {event.event.startTime}
                    {event.event.endTime && ` - ${event.event.endTime}`}
                  </p>
                  {event.event.isAllDay && (
                    <p className="text-sm text-gray-500">Celodenní událost</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Location */}
          {event.event.location && (
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{event.event.location}</p>
                {event.event.locationUrl && (
                  <a
                    href={event.event.locationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1 mt-1"
                  >
                    <span>Otevřít v mapách</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {event.event.description && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Popis</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{event.event.description}</p>
            </div>
          )}

          {/* Notes */}
          {event.event.notes && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Poznámky</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{event.event.notes}</p>
            </div>
          )}

          {/* Priority */}
          {event.event.priority && (
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-gray-400" />
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${priorityColors[event.event.priority] || priorityColors.low}`}>
                Priorita: {event.event.priority}
              </span>
            </div>
          )}

          {/* Tags */}
          {event.event.tags && event.event.tags.length > 0 && (
            <div className="flex items-start space-x-3">
              <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex flex-wrap gap-2">
                {event.event.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Attendees */}
          {event.event.attendees && event.event.attendees.length > 0 && (
            <div className="flex items-start space-x-3">
              <Users className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Účastníci</h3>
                <div className="space-y-1">
                  {event.event.attendees.map((attendee, index) => (
                    <p key={index} className="text-gray-700">{attendee}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Source info */}
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-500">
              Zdroj: <span className="font-medium">{event.event.source === 'custom' ? 'Vlastní událost' : event.event.source}</span>
            </p>
          </div>
            </>
          )}
        </div>

        {/* Footer with actions */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-xl border-t border-gray-200 flex items-center justify-between">
          {isEditing ? (
            /* Edit mode buttons */
            <>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditData({
                    title: event.event.title,
                    description: event.event.description || '',
                    location: event.event.location || '',
                    startTime: event.event.startTime || '',
                    endTime: event.event.endTime || '',
                    isAllDay: event.event.isAllDay
                  })
                }}
                disabled={isSaving}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Zrušit
              </button>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{isSaving ? 'Ukládání...' : 'Uložit změny'}</span>
              </button>
            </>
          ) : (
            /* View mode buttons */
            <>
              <div className="flex items-center space-x-2">
                {event.canDelete && (
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{isDeleting ? 'Mazání...' : 'Smazat'}</span>
                  </button>
                )}

                {event.canEdit && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Upravit</span>
                  </button>
                )}
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Zavřít
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

