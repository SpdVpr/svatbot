'use client'

import { Guest } from '@/types/guest'
import { useGuest } from '@/hooks/useGuest'
import { useAccommodation } from '@/hooks/useAccommodation'
import AccommodationSelector from './AccommodationSelector'
import {
  CheckCircle2,
  X,
  Clock,
  AlertTriangle,
  Mail,
  Phone,
  Users,
  MoreHorizontal,
  Edit,
  Trash2,
  Send,
  UserPlus,
  Building2,
  Bed
} from 'lucide-react'
import { useState } from 'react'
import {
  getInvitationTypeLabel,
  getInvitationTypeColor,
  getInvitationTypeIcon,
  getDietaryRestrictionLabel
} from '@/utils/guestCategories'

interface GuestCardProps {
  guest: Guest
  compact?: boolean
  showContactInfo?: boolean
  onEdit?: (guest: Guest) => void
  onClick?: () => void
  updateGuest?: (guestId: string, updates: Partial<Guest>) => Promise<void>
  getAccommodationById?: (id: string) => any
}

export default function GuestCard({
  guest,
  compact = false,
  showContactInfo = true,
  onEdit,
  onClick,
  updateGuest: propUpdateGuest,
  getAccommodationById: propGetAccommodationById
}: GuestCardProps) {
  const { updateRSVP, deleteGuest, updateGuest: hookUpdateGuest } = useGuest()
  const updateGuest = propUpdateGuest || hookUpdateGuest
  const { getAccommodationById: hookGetAccommodationById } = useAccommodation()
  const getAccommodationById = propGetAccommodationById || hookGetAccommodationById
  const [showActions, setShowActions] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showAccommodationSelector, setShowAccommodationSelector] = useState(false)

  // Debug log
  console.log('👤 GuestCard:', guest.firstName, {
    notes: guest.notes,
    accommodationPayment: guest.accommodationPayment,
    hasNotes: !!guest.notes?.trim(),
    hasPayment: !!guest.accommodationPayment
  })

  // Get RSVP status display
  const getRSVPDisplay = () => {
    switch (guest.rsvpStatus) {
      case 'attending':
        return {
          icon: CheckCircle2,
          color: 'text-green-500',
          bg: 'bg-green-50',
          label: 'Přijde'
        }
      case 'declined':
        return {
          icon: X,
          color: 'text-red-500',
          bg: 'bg-red-50',
          label: 'Nepřijde'
        }
      case 'maybe':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-500',
          bg: 'bg-yellow-50',
          label: 'Možná'
        }
      case 'pending':
        return {
          icon: Clock,
          color: 'text-gray-500',
          bg: 'bg-gray-50',
          label: 'Čeká'
        }
      default:
        return {
          icon: Clock,
          color: 'text-gray-500',
          bg: 'bg-gray-50',
          label: 'Čeká'
        }
    }
  }

  // Get category display
  const getCategoryDisplay = () => {
    const categories = {
      'family-bride': { label: 'Rodina nevěsty', color: 'bg-pink-100 text-pink-700', icon: '👰' },
      'family-groom': { label: 'Rodina ženicha', color: 'bg-blue-100 text-blue-700', icon: '🤵' },
      'friends-bride': { label: 'Přátelé nevěsty', color: 'bg-purple-100 text-purple-700', icon: '👭' },
      'friends-groom': { label: 'Přátelé ženicha', color: 'bg-indigo-100 text-indigo-700', icon: '👬' },
      'colleagues-bride': { label: 'Kolegové nevěsty', color: 'bg-green-100 text-green-700', icon: '💼' },
      'colleagues-groom': { label: 'Kolegové ženicha', color: 'bg-teal-100 text-teal-700', icon: '💼' },
      'other': { label: 'Ostatní', color: 'bg-gray-100 text-gray-700', icon: '👥' }
    }
    return categories[guest.category as keyof typeof categories] || categories.other
  }

  // Handle RSVP status change
  const handleRSVPChange = async (status: Guest['rsvpStatus']) => {
    setIsUpdating(true)
    try {
      await updateRSVP(guest.id, status)
    } catch (error) {
      console.error('Error updating RSVP:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle delete
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm(`Opravdu chcete smazat hosta ${guest.firstName} ${guest.lastName}?`)) {
      try {
        await deleteGuest(guest.id)
      } catch (error) {
        console.error('Error deleting guest:', error)
      }
    }
    setShowActions(false)
  }

  const rsvpDisplay = getRSVPDisplay()
  const categoryDisplay = getCategoryDisplay()

  return (
    <div
      className={`
        relative group border rounded-lg transition-all duration-200 cursor-pointer
        border-gray-200 bg-white hover:border-primary-300 hover:shadow-sm
        ${compact ? 'p-3' : 'p-4'}
      `}
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
            <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowActions(false)
                  onEdit?.(guest)
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
              >
                <Edit className="w-3 h-3" />
                <span>Upravit</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowActions(false)
                  // TODO: Send invitation
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
              >
                <Send className="w-3 h-3" />
                <span>Poslat pozvánku</span>
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

      <div className="space-y-3">
        {/* Guest name and status */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-900 truncate">
                {guest.firstName} {guest.lastName}
              </h4>
              {guest.accommodationId && guest.roomId && (
                (() => {
                  const accommodation = getAccommodationById(guest.accommodationId)
                  const room = accommodation?.rooms.find((r: any) => r.id === guest.roomId)
                  return room ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex items-center space-x-1 flex-shrink-0">
                      <Bed className="w-3 h-3" />
                      <span>{room.name}</span>
                    </span>
                  ) : null
                })()
              )}
            </div>
            {guest.hasPlusOne && (
              <p className="text-sm text-gray-600 flex items-center space-x-1">
                <UserPlus className="w-3 h-3" />
                <span>+1 {guest.plusOneName && `(${guest.plusOneName})`}</span>
              </p>
            )}
          </div>

          {/* RSVP Status */}
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${rsvpDisplay.bg}`}>
            <rsvpDisplay.icon className={`w-3 h-3 ${rsvpDisplay.color}`} />
            <span className={`text-xs font-medium ${rsvpDisplay.color}`}>
              {rsvpDisplay.label}
            </span>
          </div>
        </div>

        {/* Category and Invitation Type */}
        <div className="flex items-center space-x-2 flex-wrap gap-1">
          <span className={`
            inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
            ${categoryDisplay.color}
          `}>
            <span>{categoryDisplay.icon}</span>
            <span>{categoryDisplay.label}</span>
          </span>

          {/* Invitation type indicator */}
          {guest.invitationType && guest.invitationType !== 'ceremony-reception' && (
            <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getInvitationTypeColor(guest.invitationType)}`}>
              <span>{getInvitationTypeIcon(guest.invitationType)}</span>
              <span>{getInvitationTypeLabel(guest.invitationType)}</span>
            </span>
          )}
        </div>

        {/* Contact info */}
        {showContactInfo && (guest.email || guest.phone) && (
          <div className="space-y-1">
            {guest.email && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="w-3 h-3" />
                <span className="truncate">{guest.email}</span>
              </div>
            )}
            {guest.phone && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="w-3 h-3" />
                <span>{guest.phone}</span>
              </div>
            )}
          </div>
        )}

        {/* Dietary restrictions */}
        {guest.dietaryRestrictions.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {guest.dietaryRestrictions.slice(0, 3).map((restriction) => (
              <span
                key={restriction}
                className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full"
              >
                {getDietaryRestrictionLabel(restriction)}
              </span>
            ))}
            {guest.dietaryRestrictions.length > 3 && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                +{guest.dietaryRestrictions.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Tags section - Notes and Accommodation Payment */}
        {(guest.notes?.trim() || guest.accommodationPayment) && (
          <div className="flex flex-wrap gap-1 mb-2">
            {/* Notes tag */}
            {guest.notes && guest.notes.trim() && (
              <span
                className="text-xs bg-lime-100 text-lime-700 px-2 py-1 rounded-full flex items-center gap-1"
                title={guest.notes}
              >
                📝 {guest.notes.length > 30 ? guest.notes.substring(0, 30) + '...' : guest.notes}
              </span>
            )}

            {/* Accommodation payment tag */}
            {guest.accommodationPayment && (
              <span
                className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                  guest.accommodationPayment === 'paid_by_couple'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                💰 {guest.accommodationPayment === 'paid_by_couple' ? 'Platíme my' : 'Platí host'}
              </span>
            )}
          </div>
        )}

        {/* Invitation status */}
        <div className="flex flex-wrap gap-1">
          {guest.invitationSent && (
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                guest.invitationMethod === 'sent'
                  ? 'bg-cyan-100 text-cyan-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {guest.invitationMethod === 'sent' ? 'Pozvánka odeslána' : 'Pozvánka předána'}
            </span>
          )}
          {guest.accommodationInterest === 'interested' && (
            <>
              {guest.accommodationId && guest.roomId ? (
                (() => {
                  const accommodation = getAccommodationById(guest.accommodationId)
                  const room = accommodation?.rooms.find((r: any) => r.id === guest.roomId)
                  return (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 flex items-center space-x-1">
                      <Building2 className="w-3 h-3" />
                      <span>{accommodation?.name}</span>
                      <Bed className="w-3 h-3" />
                      <span>{room?.name}</span>
                    </span>
                  )
                })()
              ) : guest.accommodationType ? (
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 flex items-center space-x-1">
                  <Building2 className="w-3 h-3" />
                  <span>{guest.accommodationType}</span>
                </span>
              ) : (
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 flex items-center space-x-1">
                  <Building2 className="w-3 h-3" />
                  <span>Má zájem o ubytování</span>
                </span>
              )}
            </>
          )}
        </div>



        {/* RSVP Quick Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleRSVPChange('attending')
              }}
              disabled={isUpdating}
              className={`p-1 rounded transition-colors ${
                guest.rsvpStatus === 'attending' 
                  ? 'bg-green-100 text-green-600' 
                  : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
              }`}
              title="Označit jako přijde"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleRSVPChange('declined')
              }}
              disabled={isUpdating}
              className={`p-1 rounded transition-colors ${
                guest.rsvpStatus === 'declined' 
                  ? 'bg-red-100 text-red-600' 
                  : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
              }`}
              title="Označit jako nepřijde"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleRSVPChange('maybe')
              }}
              disabled={isUpdating}
              className={`p-1 rounded transition-colors ${
                guest.rsvpStatus === 'maybe'
                  ? 'bg-yellow-100 text-yellow-600'
                  : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
              }`}
              title="Označit jako možná"
            >
              <AlertTriangle className="w-4 h-4" />
            </button>

            {/* Accommodation quick action */}
            {guest.accommodationInterest === 'interested' && !guest.accommodationId && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowAccommodationSelector(true)
                }}
                disabled={isUpdating}
                className="p-1 rounded transition-colors text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                title="Přiřadit ubytování"
              >
                <Building2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Invitation status */}
          <div className="text-xs text-gray-500">
            {guest.invitationSent ? (
              <span className="text-green-600">✓ Pozván</span>
            ) : (
              <span>Nepozván</span>
            )}
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="w-4 h-4 loading-spinner" />
        </div>
      )}

      {/* Accommodation Selector Modal */}
      {showAccommodationSelector && (
        <AccommodationSelector
          guest={guest}
          onUpdate={updateGuest}
          onClose={() => setShowAccommodationSelector(false)}
        />
      )}
    </div>
  )
}
