// Calendar Export Utilities for SvatBot.cz

import { CalendarEvent, ICalEvent, ExportOptions } from '@/types/calendar'
import { format } from 'date-fns'

/**
 * Generate iCal format string from events
 */
export function generateICalendar(events: CalendarEvent[], options?: ExportOptions): string {
  const lines: string[] = []
  
  // iCal header
  lines.push('BEGIN:VCALENDAR')
  lines.push('VERSION:2.0')
  lines.push('PRODID:-//SvatBot.cz//Wedding Calendar//CS')
  lines.push('CALSCALE:GREGORIAN')
  lines.push('METHOD:PUBLISH')
  lines.push('X-WR-CALNAME:Svatební Kalendář')
  lines.push('X-WR-TIMEZONE:Europe/Prague')
  lines.push('X-WR-CALDESC:Kalendář svatebních událostí ze SvatBot.cz')

  // Filter events if needed
  let filteredEvents = events
  if (options?.includeCompleted === false) {
    filteredEvents = events.filter(e => !e.isCompleted)
  }
  if (options?.dateRange) {
    filteredEvents = filteredEvents.filter(e => 
      e.startDate >= options.dateRange!.start && 
      e.startDate <= options.dateRange!.end
    )
  }

  // Add events
  filteredEvents.forEach(event => {
    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${event.id}@svatbot.cz`)
    lines.push(`DTSTAMP:${formatICalDate(new Date())}`)
    lines.push(`DTSTART${event.isAllDay ? ';VALUE=DATE' : ''}:${formatICalDate(event.startDate, event.isAllDay)}`)
    
    if (event.endDate) {
      lines.push(`DTEND${event.isAllDay ? ';VALUE=DATE' : ''}:${formatICalDate(event.endDate, event.isAllDay)}`)
    }
    
    lines.push(`SUMMARY:${escapeICalText(event.title)}`)
    
    if (event.description) {
      lines.push(`DESCRIPTION:${escapeICalText(event.description)}`)
    }
    
    if (event.location) {
      lines.push(`LOCATION:${escapeICalText(event.location)}`)
    }
    
    if (event.locationUrl) {
      lines.push(`URL:${event.locationUrl}`)
    }
    
    // Priority
    const priorityMap = { low: 9, medium: 5, high: 3, critical: 1 }
    lines.push(`PRIORITY:${priorityMap[event.priority]}`)
    
    // Status
    const statusMap = { upcoming: 'TENTATIVE', 'in-progress': 'CONFIRMED', completed: 'CONFIRMED', cancelled: 'CANCELLED' }
    lines.push(`STATUS:${statusMap[event.status]}`)
    
    // Reminders/Alarms
    if (options?.includeReminders !== false && event.reminders.length > 0) {
      event.reminders.forEach(reminder => {
        lines.push('BEGIN:VALARM')
        lines.push('ACTION:DISPLAY')
        lines.push(`DESCRIPTION:${escapeICalText(event.title)}`)
        lines.push(`TRIGGER:-PT${reminder.minutesBefore}M`)
        lines.push('END:VALARM')
      })
    }
    
    // Categories/Tags
    if (event.tags && event.tags.length > 0) {
      lines.push(`CATEGORIES:${event.tags.join(',')}`)
    }
    
    lines.push('END:VEVENT')
  })

  lines.push('END:VCALENDAR')
  
  return lines.join('\r\n')
}

/**
 * Format date for iCal format
 */
function formatICalDate(date: Date, isAllDay: boolean = false): string {
  if (isAllDay) {
    return format(date, 'yyyyMMdd')
  }
  return format(date, "yyyyMMdd'T'HHmmss")
}

/**
 * Escape special characters for iCal text fields
 */
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

/**
 * Download iCal file
 */
export function downloadICalFile(icalContent: string, filename: string = 'svatba-kalendar.ics'): void {
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Generate CSV format from events
 */
export function generateCSV(events: CalendarEvent[], options?: ExportOptions): string {
  const lines: string[] = []
  
  // CSV header
  lines.push('Název,Popis,Typ,Datum začátku,Čas začátku,Datum konce,Čas konce,Celý den,Místo,Priorita,Status,Zdroj')
  
  // Filter events
  let filteredEvents = events
  if (options?.includeCompleted === false) {
    filteredEvents = events.filter(e => !e.isCompleted)
  }
  if (options?.dateRange) {
    filteredEvents = filteredEvents.filter(e => 
      e.startDate >= options.dateRange!.start && 
      e.startDate <= options.dateRange!.end
    )
  }
  
  // Add events
  filteredEvents.forEach(event => {
    const row = [
      escapeCSV(event.title),
      escapeCSV(event.description || ''),
      escapeCSV(getEventTypeLabel(event.type)),
      format(event.startDate, 'dd.MM.yyyy'),
      event.startTime || '',
      event.endDate ? format(event.endDate, 'dd.MM.yyyy') : '',
      event.endTime || '',
      event.isAllDay ? 'Ano' : 'Ne',
      escapeCSV(event.location || ''),
      getPriorityLabel(event.priority),
      getStatusLabel(event.status),
      getSourceLabel(event.source)
    ]
    lines.push(row.join(','))
  })
  
  return lines.join('\n')
}

/**
 * Escape CSV field
 */
function escapeCSV(text: string): string {
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

/**
 * Download CSV file
 */
export function downloadCSVFile(csvContent: string, filename: string = 'svatba-kalendar.csv'): void {
  // Add BOM for Excel UTF-8 support
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Generate Google Calendar URL
 */
export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams()
  
  params.append('action', 'TEMPLATE')
  params.append('text', event.title)
  
  if (event.description) {
    params.append('details', event.description)
  }
  
  if (event.location) {
    params.append('location', event.location)
  }
  
  // Format dates
  const startDate = format(event.startDate, "yyyyMMdd'T'HHmmss")
  const endDate = event.endDate 
    ? format(event.endDate, "yyyyMMdd'T'HHmmss")
    : format(new Date(event.startDate.getTime() + 60 * 60 * 1000), "yyyyMMdd'T'HHmmss")
  
  params.append('dates', `${startDate}/${endDate}`)
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * Open Google Calendar with event
 */
export function openInGoogleCalendar(event: CalendarEvent): void {
  const url = generateGoogleCalendarUrl(event)
  window.open(url, '_blank')
}

// Helper functions for labels
function getEventTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    task: 'Úkol',
    appointment: 'Schůzka',
    deadline: 'Deadline',
    'wedding-day': 'Svatební den',
    'vendor-meeting': 'Schůzka s dodavatelem',
    'venue-visit': 'Návštěva místa',
    tasting: 'Ochutnávka',
    fitting: 'Zkouška oblečení',
    rehearsal: 'Zkouška obřadu',
    custom: 'Vlastní',
    other: 'Jiné'
  }
  return labels[type] || type
}

function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    low: 'Nízká',
    medium: 'Střední',
    high: 'Vysoká',
    critical: 'Kritická'
  }
  return labels[priority] || priority
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    upcoming: 'Nadcházející',
    'in-progress': 'Probíhá',
    completed: 'Dokončeno',
    cancelled: 'Zrušeno'
  }
  return labels[status] || status
}

function getSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    tasks: 'Úkoly',
    vendors: 'Dodavatelé',
    budget: 'Rozpočet',
    'wedding-day': 'Svatební den',
    custom: 'Vlastní',
    imported: 'Importováno'
  }
  return labels[source] || source
}

