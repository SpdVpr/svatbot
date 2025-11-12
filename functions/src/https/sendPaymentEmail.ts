import * as functions from 'firebase-functions'
import { sendPaymentSuccessEmail } from '../services/emailService'

/**
 * HTTPS Callable Function to send payment success email
 * Used for recurring payments where the trigger doesn't fire
 */
export const sendPaymentEmail = functions
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

    // Only allow POST
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' })
      return
    }

    try {
      const {
        email,
        firstName,
        userId,
        plan,
        amount,
        currency,
        isRecurring
      } = req.body

      // Validate required fields
      if (!email || !firstName || !userId || !plan || amount === undefined || !currency) {
        res.status(400).json({ error: 'Missing required fields' })
        return
      }

      console.log('📧 Sending payment success email...')
      console.log('User:', firstName, email)
      console.log('Plan:', plan, 'Amount:', amount, currency)
      console.log('Is recurring:', isRecurring)

      // Send payment success email
      const emailSent = await sendPaymentSuccessEmail(
        email,
        firstName,
        userId,
        plan,
        amount,
        currency
      )

      if (emailSent) {
        console.log('✅ Payment email sent successfully')
        res.status(200).json({ 
          success: true,
          message: 'Payment email sent successfully' 
        })
      } else {
        console.warn('⚠️ Failed to send payment email')
        res.status(500).json({ 
          success: false,
          message: 'Failed to send payment email'
        })
      }
    } catch (error) {
      console.error('❌ Error sending payment email:', error)
      res.status(500).json({ 
        error: 'Failed to send payment email',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

