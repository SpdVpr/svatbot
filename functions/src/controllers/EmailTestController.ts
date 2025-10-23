import { Request, Response } from 'express'
import { sendRegistrationEmail, sendPaymentSuccessEmail, sendTrialReminderEmail } from '../services/emailService'

export class EmailTestController {
  /**
   * Test registration email
   * POST /api/v1/admin/email-test/registration
   */
  static async testRegistrationEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email, firstName } = req.body

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email je povinný'
        })
        return
      }

      const testFirstName = firstName || email.split('@')[0] || 'Testovací uživatel'
      const testUserId = 'test-user-' + Date.now()

      console.log('🧪 Testing registration email:', { email, firstName: testFirstName })

      const success = await sendRegistrationEmail(email, testFirstName, testUserId)

      if (success) {
        res.status(200).json({
          success: true,
          message: `✅ Registrační email byl úspěšně odeslán na ${email}`,
          data: {
            email,
            firstName: testFirstName,
            userId: testUserId,
            type: 'registration'
          }
        })
      } else {
        res.status(500).json({
          success: false,
          message: '❌ Nepodařilo se odeslat registrační email. Zkontrolujte logy.'
        })
      }
    } catch (error: any) {
      console.error('❌ Error testing registration email:', error)
      res.status(500).json({
        success: false,
        message: 'Chyba při odesílání testovacího emailu',
        error: error.message
      })
    }
  }

  /**
   * Test payment success email
   * POST /api/v1/admin/email-test/payment
   */
  static async testPaymentEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email, firstName, plan } = req.body

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email je povinný'
        })
        return
      }

      const testFirstName = firstName || email.split('@')[0] || 'Testovací uživatel'
      const testPlan = plan || 'premium_yearly'
      const testAmount = testPlan === 'premium_monthly' ? 299 : 2990
      const testCurrency = 'CZK'
      const testUserId = 'test-user-' + Date.now()

      console.log('🧪 Testing payment email:', { email, firstName: testFirstName, plan: testPlan, amount: testAmount })

      const success = await sendPaymentSuccessEmail(email, testFirstName, testUserId, testPlan, testAmount, testCurrency)

      if (success) {
        res.status(200).json({
          success: true,
          message: `✅ Platební email byl úspěšně odeslán na ${email}`,
          data: {
            email,
            firstName: testFirstName,
            plan: testPlan,
            amount: testAmount,
            currency: testCurrency,
            userId: testUserId,
            type: 'payment_success'
          }
        })
      } else {
        res.status(500).json({
          success: false,
          message: '❌ Nepodařilo se odeslat platební email. Zkontrolujte logy.'
        })
      }
    } catch (error: any) {
      console.error('❌ Error testing payment email:', error)
      res.status(500).json({
        success: false,
        message: 'Chyba při odesílání testovacího emailu',
        error: error.message
      })
    }
  }

  /**
   * Test trial reminder email
   * POST /api/v1/admin/email-test/trial-reminder
   */
  static async testTrialReminderEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email, firstName, daysLeft } = req.body

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email je povinný'
        })
        return
      }

      const testFirstName = firstName || email.split('@')[0] || 'Testovací uživatel'
      const testDaysLeft = daysLeft || 2
      const testUserId = 'test-user-' + Date.now()

      console.log('🧪 Testing trial reminder email:', { email, firstName: testFirstName, daysLeft: testDaysLeft })

      const success = await sendTrialReminderEmail(email, testFirstName, testUserId, testDaysLeft)

      if (success) {
        res.status(200).json({
          success: true,
          message: `✅ Trial reminder email byl úspěšně odeslán na ${email}`,
          data: {
            email,
            firstName: testFirstName,
            daysLeft: testDaysLeft,
            userId: testUserId,
            type: 'trial_reminder'
          }
        })
      } else {
        res.status(500).json({
          success: false,
          message: '❌ Nepodařilo se odeslat trial reminder email. Zkontrolujte logy.'
        })
      }
    } catch (error: any) {
      console.error('❌ Error testing trial reminder email:', error)
      res.status(500).json({
        success: false,
        message: 'Chyba při odesílání testovacího emailu',
        error: error.message
      })
    }
  }

  /**
   * Get email service status
   * GET /api/v1/admin/email-test/status
   */
  static async getEmailServiceStatus(req: Request, res: Response): Promise<void> {
    try {
      const functions = require('firebase-functions')
      const emailConfig = functions.config().email || {}

      const status = {
        configured: !!(emailConfig.user && emailConfig.password),
        smtpHost: 'wes1-smtp.wedos.net',
        smtpPort: 587,
        fromEmail: emailConfig.from || 'SvatBot.cz <info@svatbot.cz>',
        user: emailConfig.user || 'Not configured',
        passwordSet: !!emailConfig.password
      }

      res.status(200).json({
        success: true,
        message: 'Email service status',
        data: status
      })
    } catch (error: any) {
      console.error('❌ Error getting email service status:', error)
      res.status(500).json({
        success: false,
        message: 'Chyba při získávání statusu emailové služby',
        error: error.message
      })
    }
  }
}

