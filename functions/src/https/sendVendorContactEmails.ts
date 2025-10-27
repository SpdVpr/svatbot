import * as functions from 'firebase-functions'
import { sendVendorContactEmail, sendCustomerContactConfirmationEmail } from '../services/emailService'

/**
 * HTTPS Callable Function to send vendor contact emails
 * Sends email to vendor with inquiry details and confirmation to customer
 */
export const sendVendorContactEmails = functions
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
        vendorEmail,
        vendorName,
        customerName,
        customerEmail,
        customerPhone,
        weddingDate,
        message
      } = req.body

      // Validate required fields
      if (!vendorEmail || !vendorName || !customerName || !customerEmail || !message) {
        res.status(400).json({ error: 'Missing required fields' })
        return
      }

      console.log('📧 Sending vendor contact emails...')
      console.log('Vendor:', vendorName, vendorEmail)
      console.log('Customer:', customerName, customerEmail)

      // Send email to vendor
      const vendorEmailSent = await sendVendorContactEmail(
        vendorEmail,
        vendorName,
        {
          customerName,
          customerEmail,
          customerPhone: customerPhone || '',
          weddingDate: weddingDate || '',
          message
        }
      )

      // Send confirmation email to customer
      const customerEmailSent = await sendCustomerContactConfirmationEmail(
        customerEmail,
        customerName,
        vendorName,
        vendorEmail
      )

      if (vendorEmailSent && customerEmailSent) {
        console.log('✅ Both emails sent successfully')
        res.status(200).json({ 
          success: true,
          message: 'Emails sent successfully' 
        })
      } else {
        console.warn('⚠️ Some emails failed to send')
        res.status(200).json({ 
          success: true,
          message: 'Request processed but some emails may have failed',
          vendorEmailSent,
          customerEmailSent
        })
      }
    } catch (error) {
      console.error('❌ Error sending vendor contact emails:', error)
      res.status(500).json({ 
        error: 'Failed to send emails',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  })

