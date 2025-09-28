'use client'

// Apple Calendar (iCal) integration using .ics file format
// This provides compatibility with Apple Calendar, Outlook, and other calendar apps

export interface ICalEvent {
  id: string
  title: string
  description?: string
  startDate: Date
  endDate: Date
  location?: string
  attendees?: string[]
  reminder?: number // minutes before event
}

export interface WeddingICalEvent {
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

class AppleCalendarService {
  // Generate iCal (.ics) content for a single event
  generateICalEvent(event: ICalEvent): string {
    const formatDate = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const escapeText = (text: string): string => {
      return text
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\n/g, '\\n')
    }

    let icalContent = 'BEGIN:VCALENDAR\n'
    icalContent += 'VERSION:2.0\n'
    icalContent += 'PRODID:-//Svatbot//Wedding Planner//CS\n'
    icalContent += 'CALSCALE:GREGORIAN\n'
    icalContent += 'METHOD:PUBLISH\n'
    icalContent += 'BEGIN:VEVENT\n'
    icalContent += `UID:${event.id}@svatbot.cz\n`
    icalContent += `DTSTART:${formatDate(event.startDate)}\n`
    icalContent += `DTEND:${formatDate(event.endDate)}\n`
    icalContent += `SUMMARY:${escapeText(event.title)}\n`
    
    if (event.description) {
      icalContent += `DESCRIPTION:${escapeText(event.description)}\n`
    }
    
    if (event.location) {
      icalContent += `LOCATION:${escapeText(event.location)}\n`
    }

    if (event.attendees && event.attendees.length > 0) {
      event.attendees.forEach(email => {
        icalContent += `ATTENDEE:MAILTO:${email}\n`
      })
    }

    if (event.reminder) {
      icalContent += 'BEGIN:VALARM\n'
      icalContent += 'ACTION:DISPLAY\n'
      icalContent += `TRIGGER:-PT${event.reminder}M\n`
      icalContent += `DESCRIPTION:${escapeText(event.title)}\n`
      icalContent += 'END:VALARM\n'
    }

    icalContent += `DTSTAMP:${formatDate(new Date())}\n`
    icalContent += 'STATUS:CONFIRMED\n'
    icalContent += 'TRANSP:OPAQUE\n'
    icalContent += 'END:VEVENT\n'
    icalContent += 'END:VCALENDAR'

    return icalContent
  }

  // Generate iCal content for multiple events
  generateICalCalendar(events: ICalEvent[], calendarName: string = 'Svatební plánování'): string {
    const formatDate = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const escapeText = (text: string): string => {
      return text
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\n/g, '\\n')
    }

    let icalContent = 'BEGIN:VCALENDAR\n'
    icalContent += 'VERSION:2.0\n'
    icalContent += 'PRODID:-//Svatbot//Wedding Planner//CS\n'
    icalContent += 'CALSCALE:GREGORIAN\n'
    icalContent += 'METHOD:PUBLISH\n'
    icalContent += `X-WR-CALNAME:${escapeText(calendarName)}\n`
    icalContent += 'X-WR-TIMEZONE:Europe/Prague\n'
    icalContent += 'X-WR-CALDESC:Svatební události a milníky ze Svatbot aplikace\n'

    events.forEach(event => {
      icalContent += 'BEGIN:VEVENT\n'
      icalContent += `UID:${event.id}@svatbot.cz\n`
      icalContent += `DTSTART:${formatDate(event.startDate)}\n`
      icalContent += `DTEND:${formatDate(event.endDate)}\n`
      icalContent += `SUMMARY:${escapeText(event.title)}\n`
      
      if (event.description) {
        icalContent += `DESCRIPTION:${escapeText(event.description)}\n`
      }
      
      if (event.location) {
        icalContent += `LOCATION:${escapeText(event.location)}\n`
      }

      if (event.attendees && event.attendees.length > 0) {
        event.attendees.forEach(email => {
          icalContent += `ATTENDEE:MAILTO:${email}\n`
        })
      }

      if (event.reminder) {
        icalContent += 'BEGIN:VALARM\n'
        icalContent += 'ACTION:DISPLAY\n'
        icalContent += `TRIGGER:-PT${event.reminder}M\n`
        icalContent += `DESCRIPTION:${escapeText(event.title)}\n`
        icalContent += 'END:VALARM\n'
      }

      icalContent += `DTSTAMP:${formatDate(new Date())}\n`
      icalContent += 'STATUS:CONFIRMED\n'
      icalContent += 'TRANSP:OPAQUE\n'
      icalContent += 'END:VEVENT\n'
    })

    icalContent += 'END:VCALENDAR'
    return icalContent
  }

  // Convert wedding event to iCal format
  convertWeddingEventToICal(weddingEvent: WeddingICalEvent): ICalEvent {
    const startDate = new Date(weddingEvent.date)
    const endDate = weddingEvent.endDate ? new Date(weddingEvent.endDate) : new Date(startDate.getTime() + 60 * 60 * 1000)

    return {
      id: weddingEvent.id,
      title: weddingEvent.title,
      description: weddingEvent.description,
      startDate,
      endDate,
      location: weddingEvent.location,
      attendees: weddingEvent.attendees,
      reminder: 60 // 1 hour before by default
    }
  }

  // Download single event as .ics file
  downloadEvent(event: ICalEvent, filename?: string): void {
    const icalContent = this.generateICalEvent(event)
    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename || `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  // Download multiple events as .ics calendar file
  downloadCalendar(events: ICalEvent[], calendarName?: string, filename?: string): void {
    const icalContent = this.generateICalCalendar(events, calendarName)
    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename || 'svatebni_kalendar.ics'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  // Generate calendar URL for subscription (webcal://)
  generateSubscriptionUrl(events: ICalEvent[], calendarName?: string): string {
    // This would typically be served from your backend
    // For now, we'll return a data URL (not suitable for subscription)
    const icalContent = this.generateICalCalendar(events, calendarName)
    return `data:text/calendar;charset=utf-8,${encodeURIComponent(icalContent)}`
  }

  // Check if device supports Apple Calendar
  isAppleDevice(): boolean {
    const userAgent = navigator.userAgent.toLowerCase()
    return /iphone|ipad|ipod|macintosh/.test(userAgent)
  }

  // Get appropriate calendar app name for the device
  getCalendarAppName(): string {
    if (this.isAppleDevice()) {
      return 'Apple Calendar'
    } else if (navigator.userAgent.includes('Windows')) {
      return 'Outlook Calendar'
    } else {
      return 'Kalendář'
    }
  }
}

// Export singleton instance
export const appleCalendarService = new AppleCalendarService()
