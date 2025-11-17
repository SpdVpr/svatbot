import * as functions from 'firebase-functions'
import { sendContactFormNotification } from '../services/emailService'

/**
 * HTTPS Cloud Function to send contact form notification email
 * Sends email to info@svatbot.cz when someone submits the contact form
 */
export const sendContactFormEmail = functions
  .region('europe-west1')
  .https.onRequest(async (req, res) => {
    // Set CORS headers
    res.set('Access-Control-Allow-Origin', '*')
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.set('Access-Control-Allow-Headers', 'Content-Type')

    // Handle preflight request
    if (req.method === 'OPTIONS') {
      res.status(204).send('')
      return
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' })
      return
    }

    try {
      const { name, email, message, timestamp } = req.body

      // Validate required fields
      if (!name || !email || !message) {
        res.status(400).json({ 
          error: 'Missing required fields',
          required: ['name', 'email', 'message']
        })
        return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        res.status(400).json({ error: 'Invalid email format' })
        return
      }

      console.log('📧 Processing contact form submission:', { name, email })

      // Send notification email to info@svatbot.cz
      const success = await sendContactFormNotification(
        name,
        email,
        message,
        timestamp || new Date().toISOString()
      )

      if (success) {
        console.log('✅ Contact form notification email sent successfully')
        res.status(200).json({ 
          success: true,
          message: 'Contact form email sent successfully'
        })
      } else {
        console.error('❌ Failed to send contact form notification email')
        res.status(500).json({ 
          error: 'Failed to send email',
          message: 'Email service error'
        })
      }

    } catch (error) {
      console.error('❌ Error in sendContactFormEmail function:', error)
      res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

