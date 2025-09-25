'use client'

import { GoogleAuth } from 'google-auth-library'

// Google Calendar API configuration
const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3'
const SCOPES = ['https://www.googleapis.com/auth/calendar']

export interface CalendarEvent {
  id?: string
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  location?: string
  attendees?: {
    email: string
    displayName?: string
  }[]
  reminders?: {
    useDefault: boolean
    overrides?: {
      method: 'email' | 'popup'
      minutes: number
    }[]
  }
}

export interface WeddingCalendarEvent {
  id: string
  type: 'wedding' | 'task' | 'meeting' | 'milestone'
  title: string
  description?: string
  date: Date
  endDate?: Date
  location?: string
  attendees?: string[]
  taskId?: string
  vendorId?: string
  milestoneId?: string
}

class GoogleCalendarService {
  private accessToken: string | null = null
  private refreshToken: string | null = null

  constructor() {
    // Load tokens from localStorage if available
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('google_calendar_access_token')
      this.refreshToken = localStorage.getItem('google_calendar_refresh_token')
    }
  }

  // Initialize Google Calendar authentication
  async initAuth(): Promise<boolean> {
    try {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

      // Demo mode for testing
      if (!clientId || clientId === 'demo_google_client_id') {
        console.log('Demo mode: Simulating Google Calendar connection')
        this.accessToken = 'demo_access_token'
        localStorage.setItem('google_calendar_access_token', 'demo_access_token')
        return true
      }

      // Check if we have valid tokens
      if (this.accessToken) {
        const isValid = await this.validateToken()
        if (isValid) return true
      }

      // If no valid token, start OAuth flow
      return await this.startOAuthFlow()
    } catch (error) {
      console.error('Google Calendar auth error:', error)
      return false
    }
  }

  // Start OAuth flow for Google Calendar
  private async startOAuthFlow(): Promise<boolean> {
    try {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      if (!clientId) {
        throw new Error('Google Client ID not configured')
      }

      const redirectUri = `${window.location.origin}/auth/google/callback`
      const scope = SCOPES.join(' ')
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent`

      // Open popup for OAuth
      const popup = window.open(authUrl, 'google-auth', 'width=500,height=600')
      
      return new Promise((resolve) => {
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed)
            // Check if tokens were saved
            this.accessToken = localStorage.getItem('google_calendar_access_token')
            resolve(!!this.accessToken)
          }
        }, 1000)
      })
    } catch (error) {
      console.error('OAuth flow error:', error)
      return false
    }
  }

  // Validate access token
  private async validateToken(): Promise<boolean> {
    if (!this.accessToken) return false

    try {
      const response = await fetch(`${CALENDAR_API_BASE}/calendars/primary`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      })

      if (response.status === 401) {
        // Token expired, try to refresh
        return await this.refreshAccessToken()
      }

      return response.ok
    } catch (error) {
      console.error('Token validation error:', error)
      return false
    }
  }

  // Refresh access token
  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false

    try {
      const response = await fetch('/api/auth/google/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: this.refreshToken,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        this.accessToken = data.accessToken
        localStorage.setItem('google_calendar_access_token', data.accessToken)
        return true
      }

      return false
    } catch (error) {
      console.error('Token refresh error:', error)
      return false
    }
  }

  // Create calendar event
  async createEvent(event: CalendarEvent): Promise<string | null> {
    if (!this.accessToken) {
      const authSuccess = await this.initAuth()
      if (!authSuccess) return null
    }

    // Demo mode
    if (this.accessToken === 'demo_access_token') {
      console.log('Demo mode: Creating calendar event', event)
      return `demo_event_${Date.now()}`
    }

    try {
      const response = await fetch(`${CALENDAR_API_BASE}/calendars/primary/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      })

      if (response.ok) {
        const data = await response.json()
        return data.id
      }

      return null
    } catch (error) {
      console.error('Create event error:', error)
      return null
    }
  }

  // Update calendar event
  async updateEvent(eventId: string, event: Partial<CalendarEvent>): Promise<boolean> {
    if (!this.accessToken) return false

    try {
      const response = await fetch(`${CALENDAR_API_BASE}/calendars/primary/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      })

      return response.ok
    } catch (error) {
      console.error('Update event error:', error)
      return false
    }
  }

  // Delete calendar event
  async deleteEvent(eventId: string): Promise<boolean> {
    if (!this.accessToken) return false

    try {
      const response = await fetch(`${CALENDAR_API_BASE}/calendars/primary/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      })

      return response.ok
    } catch (error) {
      console.error('Delete event error:', error)
      return false
    }
  }

  // Convert wedding event to Google Calendar format
  convertWeddingEventToCalendar(weddingEvent: WeddingCalendarEvent): CalendarEvent {
    const startDate = new Date(weddingEvent.date)
    const endDate = weddingEvent.endDate ? new Date(weddingEvent.endDate) : new Date(startDate.getTime() + 60 * 60 * 1000) // 1 hour default

    return {
      summary: weddingEvent.title,
      description: weddingEvent.description,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: 'Europe/Prague',
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'Europe/Prague',
      },
      location: weddingEvent.location,
      attendees: weddingEvent.attendees?.map(email => ({ email })),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 60 }, // 1 hour before
        ],
      },
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.accessToken
  }

  // Disconnect Google Calendar
  disconnect(): void {
    this.accessToken = null
    this.refreshToken = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('google_calendar_access_token')
      localStorage.removeItem('google_calendar_refresh_token')
    }
  }
}

// Export singleton instance
export const googleCalendarService = new GoogleCalendarService()
