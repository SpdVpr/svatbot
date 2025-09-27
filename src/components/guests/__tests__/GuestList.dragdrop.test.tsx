import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import GuestList from '../GuestList'
import { Guest } from '@/types/guest'

// Mock useGuest hook
jest.mock('@/hooks/useGuest', () => ({
  useGuest: () => ({
    guests: mockGuests,
    loading: false,
    error: null,
    stats: {
      total: 3,
      attending: 2,
      declined: 1,
      pending: 0,
      maybe: 0
    },
    updateRSVP: jest.fn(),
    deleteGuest: jest.fn(),
    clearError: jest.fn()
  })
}))

const mockGuests: Guest[] = [
  {
    id: '1',
    weddingId: 'wedding-1',
    firstName: 'Jan',
    lastName: 'Novák',
    email: 'jan@example.com',
    category: 'family-groom',
    invitationType: 'ceremony-reception',
    rsvpStatus: 'attending',
    hasPlusOne: false,
    dietaryRestrictions: [],
    preferredContactMethod: 'email',
    language: 'cs',
    notes: '',
    tags: [],
    invitationSent: false,
    reminderSent: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user-1'
  },
  {
    id: '2',
    weddingId: 'wedding-1',
    firstName: 'Marie',
    lastName: 'Svobodová',
    email: 'marie@example.com',
    category: 'family-bride',
    invitationType: 'ceremony-reception',
    rsvpStatus: 'attending',
    hasPlusOne: true,
    plusOneName: 'Petr',
    dietaryRestrictions: ['vegetarian'],
    preferredContactMethod: 'email',
    language: 'cs',
    notes: '',
    tags: [],
    invitationSent: true,
    reminderSent: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user-1'
  },
  {
    id: '3',
    weddingId: 'wedding-1',
    firstName: 'Pavel',
    lastName: 'Dvořák',
    email: 'pavel@example.com',
    category: 'friends-groom',
    invitationType: 'ceremony-reception',
    rsvpStatus: 'declined',
    hasPlusOne: false,
    dietaryRestrictions: [],
    preferredContactMethod: 'phone',
    language: 'cs',
    notes: '',
    tags: [],
    invitationSent: true,
    reminderSent: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user-1'
  }
]

describe('GuestList Drag and Drop', () => {
  const mockOnGuestReorder = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows drag and drop hint in list view', () => {
    render(
      <GuestList
        viewMode="list"
        onGuestReorder={mockOnGuestReorder}
      />
    )

    // Should show drag and drop hint
    expect(screen.getByText('Klikněte a přetáhněte hosty pro změnu pořadí')).toBeInTheDocument()
  })

  it('does not show drag and drop hint in grid view', () => {
    render(
      <GuestList
        viewMode="grid"
        onGuestReorder={mockOnGuestReorder}
      />
    )

    // Should not show drag and drop hint
    expect(screen.queryByText('Klikněte a přetáhněte hosty pro změnu pořadí')).not.toBeInTheDocument()
  })

  it('makes items draggable in list view', () => {
    render(
      <GuestList
        viewMode="list"
        onGuestReorder={mockOnGuestReorder}
      />
    )

    // Should have draggable items with tooltips
    const guestItems = screen.getAllByTestId(/guest-item-/)
    expect(guestItems[0]).toHaveAttribute('draggable', 'true')
    expect(guestItems[0]).toHaveAttribute('title', 'Klikněte a přetáhněte pro změnu pořadí')
  })

  it('handles drag start event in list view', () => {
    render(
      <GuestList
        viewMode="list"
        onGuestReorder={mockOnGuestReorder}
      />
    )

    const guestItems = screen.getAllByTestId(/guest-item-/)
    const firstGuest = guestItems[0]

    // Simulate drag start
    fireEvent.dragStart(firstGuest, {
      dataTransfer: {
        setData: jest.fn(),
        effectAllowed: 'move'
      }
    })

    // Should add dragging class
    expect(firstGuest).toHaveClass('dragging')
  })

  it('does not allow drag in grid view', () => {
    render(
      <GuestList
        viewMode="grid"
        onGuestReorder={mockOnGuestReorder}
      />
    )

    const guestItems = screen.getAllByTestId(/guest-item-/)
    const firstGuest = guestItems[0]

    // Should not be draggable in grid view
    expect(firstGuest).toHaveAttribute('draggable', 'false')
    expect(firstGuest).not.toHaveClass('cursor-move')
  })

  it('handles touch events for mobile', () => {
    render(
      <GuestList
        viewMode="list"
        enableDragDrop={true}
        onGuestReorder={mockOnGuestReorder}
      />
    )

    const guestItems = screen.getAllByTestId(/guest-item-/)
    const firstGuest = guestItems[0]

    // Simulate touch start
    fireEvent.touchStart(firstGuest, {
      touches: [{ clientY: 100 }]
    })

    // Should handle touch start
    expect(firstGuest).toHaveClass('touch-drag-item')
  })
})
