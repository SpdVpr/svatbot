'use client'

// Microsoft Graph Calendar API integration
// Provides direct synchronization with Outlook Calendar

const GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0'
const SCOPES = ['https://graph.microsoft.com/calendars.readwrite']

export interface GraphCalendarEvent {
  id?: string
  subject: string
  body?: {
    contentType: 'HTML' | 'Text'
    content: string
  }
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  location?: {
    displayName: string
  }
  attendees?: {
    emailAddress: {
      address: string
      name?: string
    }
    type: 'required' | 'optional'
  }[]
  isReminderOn?: boolean
  reminderMinutesBeforeStart?: number
}

export interface WeddingGraphEvent {
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

class MicrosoftCalendarService {
  private accessToken: string | null = null
  private refreshToken: string | null = null

  constructor() {
    // Load tokens from localStorage if available
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('microsoft_calendar_access_token')
      this.refreshToken = localStorage.getItem('microsoft_calendar_refresh_token')
    }
  }

  // Initialize Microsoft Graph authentication
  async initAuth(): Promise<boolean> {
    try {
      const clientId = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID

      // Demo mode for testing
      if (!clientId || clientId === 'demo_microsoft_client_id') {
        console.log('Demo mode: Simulating Microsoft Calendar connection')
        this.accessToken = 'demo_access_token'
        localStorage.setItem('microsoft_calendar_access_token', 'demo_access_token')
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
      console.error('Microsoft Calendar auth error:', error)
      return false
    }
  }

  // Start OAuth 2.0 flow for Microsoft Graph
  private async startOAuthFlow(): Promise<boolean> {
    const clientId = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID
    if (!clientId) return false

    const redirectUri = `${window.location.origin}/api/auth/microsoft/callback`
    const scope = SCOPES.join(' ')
    const state = Math.random().toString(36).substring(2, 15)

    // Store state for validation
    localStorage.setItem('microsoft_oauth_state', state)

    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
      `client_id=${clientId}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `state=${state}&` +
      `response_mode=query`

    // Open popup window for authentication
    const popup = window.open(authUrl, 'microsoft-auth', 'width=500,height=600')
    
    return new Promise((resolve) => {
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed)
          // Check if we got tokens
          const token = localStorage.getItem('microsoft_calendar_access_token')
          resolve(!!token)
        }
      }, 1000)

      // Listen for message from popup
      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return
        
        if (event.data.type === 'MICROSOFT_AUTH_SUCCESS') {
          this.accessToken = event.data.accessToken
          this.refreshToken = event.data.refreshToken
          localStorage.setItem('microsoft_calendar_access_token', event.data.accessToken)
          if (event.data.refreshToken) {
            localStorage.setItem('microsoft_calendar_refresh_token', event.data.refreshToken)
          }
          popup?.close()
          window.removeEventListener('message', messageListener)
          resolve(true)
        } else if (event.data.type === 'MICROSOFT_AUTH_ERROR') {
          popup?.close()
          window.removeEventListener('message', messageListener)
          resolve(false)
        }
      }

      window.addEventListener('message', messageListener)
    })
  }

  // Validate access token
  private async validateToken(): Promise<boolean> {
    if (!this.accessToken) return false

    // Demo mode
    if (this.accessToken === 'demo_access_token') {
      return true
    }

    try {
      const response = await fetch(`${GRAPH_API_BASE}/me`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      })

      if (response.ok) {
        return true
      } else if (response.status === 401 && this.refreshToken) {
        // Try to refresh token
        return await this.refreshAccessToken()
      }

      return false
    } catch (error) {
      console.error('Token validation error:', error)
      return false
    }
  }

  // Refresh access token
  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false

    try {
      const response = await fetch('/api/auth/microsoft/refresh', {
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
        localStorage.setItem('microsoft_calendar_access_token', data.accessToken)
        return true
      }

      return false
    } catch (error) {
      console.error('Token refresh error:', error)
      return false
    }
  }

  // Create calendar event
  async createEvent(event: GraphCalendarEvent): Promise<string | null> {
    if (!this.accessToken) {
      const authSuccess = await this.initAuth()
      if (!authSuccess) return null
    }

    // Demo mode
    if (this.accessToken === 'demo_access_token') {
      console.log('Demo mode: Creating Microsoft Calendar event', event)
      return `demo_event_${Date.now()}`
    }

    try {
      const response = await fetch(`${GRAPH_API_BASE}/me/events`, {
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
  async updateEvent(eventId: string, event: Partial<GraphCalendarEvent>): Promise<boolean> {
    if (!this.accessToken) return false

    try {
      const response = await fetch(`${GRAPH_API_BASE}/me/events/${eventId}`, {
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
      const response = await fetch(`${GRAPH_API_BASE}/me/events/${eventId}`, {
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

  // Convert wedding event to Microsoft Graph format
  convertWeddingEventToGraph(weddingEvent: WeddingGraphEvent): GraphCalendarEvent {
    const startDate = new Date(weddingEvent.date)
    const endDate = weddingEvent.endDate ? new Date(weddingEvent.endDate) : new Date(startDate.getTime() + 60 * 60 * 1000)

    return {
      subject: weddingEvent.title,
      body: weddingEvent.description ? {
        contentType: 'Text',
        content: weddingEvent.description
      } : undefined,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: 'Europe/Prague',
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'Europe/Prague',
      },
      location: weddingEvent.location ? {
        displayName: weddingEvent.location
      } : undefined,
      attendees: weddingEvent.attendees?.map(email => ({
        emailAddress: {
          address: email
        },
        type: 'required' as const
      })),
      isReminderOn: true,
      reminderMinutesBeforeStart: 60 // 1 hour before
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.accessToken
  }

  // Disconnect Microsoft Calendar
  disconnect(): void {
    this.accessToken = null
    this.refreshToken = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('microsoft_calendar_access_token')
      localStorage.removeItem('microsoft_calendar_refresh_token')
    }
  }
}

// Export singleton instance
export const microsoftCalendarService = new MicrosoftCalendarService()
