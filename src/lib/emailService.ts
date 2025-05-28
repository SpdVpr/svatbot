'use client'

// Email service for wedding notifications
export interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlContent: string
  textContent: string
  variables: string[]
}

export interface EmailData {
  to: string | string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  html?: string
  text?: string
  templateId?: string
  templateData?: Record<string, any>
  attachments?: {
    filename: string
    content: string
    encoding: 'base64' | 'utf8'
  }[]
}

export interface WeddingEmailContext {
  brideName: string
  groomName: string
  weddingDate: string
  venue?: string
  weddingUrl: string
  rsvpUrl: string
  contactEmail: string
}

class EmailService {
  private apiKey: string | null = null
  private baseUrl = '/api/email'

  constructor() {
    // Email service configuration will be handled on server side
  }

  // Send email using template
  async sendTemplateEmail(
    templateId: string,
    to: string | string[],
    templateData: Record<string, any>,
    options?: {
      cc?: string[]
      bcc?: string[]
      attachments?: EmailData['attachments']
    }
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/send-template`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId,
          to: Array.isArray(to) ? to : [to],
          templateData,
          ...options,
        }),
      })

      return response.ok
    } catch (error) {
      console.error('Send template email error:', error)
      return false
    }
  }

  // Send custom email
  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      })

      return response.ok
    } catch (error) {
      console.error('Send email error:', error)
      return false
    }
  }

  // Send RSVP confirmation
  async sendRSVPConfirmation(
    guestEmail: string,
    guestName: string,
    weddingContext: WeddingEmailContext,
    rsvpStatus: 'attending' | 'not-attending' | 'maybe'
  ): Promise<boolean> {
    const statusText = {
      'attending': 'potvrdili účast',
      'not-attending': 'odmítli účast',
      'maybe': 'zatím nerozhodli'
    }[rsvpStatus]

    return this.sendTemplateEmail('rsvp-confirmation', guestEmail, {
      guestName,
      statusText,
      ...weddingContext,
    })
  }

  // Send task reminder
  async sendTaskReminder(
    userEmail: string,
    taskTitle: string,
    dueDate: string,
    weddingContext: WeddingEmailContext
  ): Promise<boolean> {
    return this.sendTemplateEmail('task-reminder', userEmail, {
      taskTitle,
      dueDate,
      ...weddingContext,
    })
  }

  // Send vendor meeting reminder
  async sendVendorMeetingReminder(
    userEmail: string,
    vendorName: string,
    meetingDate: string,
    meetingLocation: string,
    weddingContext: WeddingEmailContext
  ): Promise<boolean> {
    return this.sendTemplateEmail('vendor-meeting-reminder', userEmail, {
      vendorName,
      meetingDate,
      meetingLocation,
      ...weddingContext,
    })
  }

  // Send wedding countdown
  async sendWeddingCountdown(
    userEmail: string,
    daysUntilWedding: number,
    weddingContext: WeddingEmailContext
  ): Promise<boolean> {
    return this.sendTemplateEmail('wedding-countdown', userEmail, {
      daysUntilWedding,
      ...weddingContext,
    })
  }

  // Send budget alert
  async sendBudgetAlert(
    userEmail: string,
    budgetStatus: 'over-budget' | 'near-limit',
    currentAmount: number,
    budgetLimit: number,
    weddingContext: WeddingEmailContext
  ): Promise<boolean> {
    const percentageUsed = Math.round((currentAmount / budgetLimit) * 100)

    return this.sendTemplateEmail('budget-alert', userEmail, {
      budgetStatus,
      currentAmount: currentAmount.toLocaleString(),
      budgetLimit: budgetLimit.toLocaleString(),
      percentageUsed,
      ...weddingContext,
    })
  }

  // Send guest invitation
  async sendGuestInvitation(
    guestEmail: string,
    guestName: string,
    weddingContext: WeddingEmailContext,
    personalMessage?: string
  ): Promise<boolean> {
    return this.sendTemplateEmail('guest-invitation', guestEmail, {
      guestName,
      personalMessage: personalMessage || '',
      ...weddingContext,
    })
  }

  // Send vendor inquiry
  async sendVendorInquiry(
    vendorEmail: string,
    vendorName: string,
    clientName: string,
    clientEmail: string,
    clientPhone: string,
    message: string,
    weddingContext: WeddingEmailContext
  ): Promise<boolean> {
    return this.sendTemplateEmail('vendor-inquiry', vendorEmail, {
      vendorName,
      clientName,
      clientEmail,
      clientPhone,
      message,
      ...weddingContext,
    })
  }

  // Send weekly progress report
  async sendWeeklyProgressReport(
    userEmail: string,
    progressData: {
      completedTasks: number
      totalTasks: number
      upcomingDeadlines: string[]
      budgetStatus: string
      guestResponses: number
      totalGuests: number
    },
    weddingContext: WeddingEmailContext
  ): Promise<boolean> {
    return this.sendTemplateEmail('weekly-progress', userEmail, {
      ...progressData,
      ...weddingContext,
    })
  }

  // Get available email templates
  async getTemplates(): Promise<EmailTemplate[]> {
    try {
      const response = await fetch(`${this.baseUrl}/templates`)
      if (response.ok) {
        return await response.json()
      }
      return []
    } catch (error) {
      console.error('Get templates error:', error)
      return []
    }
  }

  // Test email configuration
  async testEmailConfig(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/test`)
      return response.ok
    } catch (error) {
      console.error('Test email config error:', error)
      return false
    }
  }
}

// Email templates (will be stored in database/config)
export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'rsvp-confirmation',
    name: 'RSVP Potvrzení',
    subject: 'Potvrzení RSVP - Svatba {{brideName}} & {{groomName}}',
    htmlContent: `
      <h2>Děkujeme za odpověď!</h2>
      <p>Milý/á {{guestName}},</p>
      <p>Děkujeme, že jste {{statusText}} na naši svatbu {{weddingDate}}.</p>
      <p>Těšíme se na vás!</p>
      <p>S láskou,<br>{{brideName}} & {{groomName}}</p>
    `,
    textContent: 'Děkujeme za odpověď! {{guestName}}, {{statusText}} na naši svatbu {{weddingDate}}.',
    variables: ['guestName', 'statusText', 'brideName', 'groomName', 'weddingDate']
  },
  {
    id: 'task-reminder',
    name: 'Připomínka úkolu',
    subject: 'Připomínka: {{taskTitle}} - SvatBot.cz',
    htmlContent: `
      <h2>Připomínka úkolu</h2>
      <p>Nezapomeňte na úkol: <strong>{{taskTitle}}</strong></p>
      <p>Termín: {{dueDate}}</p>
      <p><a href="{{weddingUrl}}">Otevřít SvatBot.cz</a></p>
    `,
    textContent: 'Připomínka úkolu: {{taskTitle}}, termín: {{dueDate}}',
    variables: ['taskTitle', 'dueDate', 'weddingUrl']
  },
  {
    id: 'vendor-meeting-reminder',
    name: 'Připomínka schůzky s dodavatelem',
    subject: 'Schůzka s {{vendorName}} - {{meetingDate}}',
    htmlContent: `
      <h2>Připomínka schůzky</h2>
      <p>Máte naplánovanou schůzku s <strong>{{vendorName}}</strong></p>
      <p>Datum: {{meetingDate}}</p>
      <p>Místo: {{meetingLocation}}</p>
    `,
    textContent: 'Schůzka s {{vendorName}} - {{meetingDate}} v {{meetingLocation}}',
    variables: ['vendorName', 'meetingDate', 'meetingLocation']
  }
]

// Export singleton instance
export const emailService = new EmailService()
