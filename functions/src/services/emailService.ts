import * as nodemailer from 'nodemailer'
import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'

const db = admin.firestore()

// Get email configuration from Firebase Functions config
const emailConfig = functions.config().email || {}

// Email configuration for Wedos SMTP
const EMAIL_CONFIG = {
  host: 'wes1-smtp.wedos.net',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: emailConfig.user || process.env.EMAIL_USER || 'info@svatbot.cz',
    pass: emailConfig.password || process.env.EMAIL_PASSWORD || ''
  }
}

// Create reusable transporter
const transporter = nodemailer.createTransport(EMAIL_CONFIG)

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Email service error:', error)
  } else {
    console.log('Email service ready:', success)
  }
})

export interface EmailLog {
  id?: string
  userId: string
  email: string
  type: 'registration' | 'payment_success' | 'trial_reminder' | 'trial_expired' | 'other'
  subject: string
  status: 'sent' | 'failed' | 'pending'
  error?: string
  sentAt: admin.firestore.Timestamp
  metadata?: Record<string, any>
}

/**
 * Log email to Firestore for tracking
 */
async function logEmail(emailLog: Omit<EmailLog, 'id' | 'sentAt'>): Promise<void> {
  try {
    await db.collection('emailLogs').add({
      ...emailLog,
      sentAt: admin.firestore.Timestamp.now()
    })
  } catch (error) {
    console.error('Error logging email:', error)
  }
}

/**
 * Send registration welcome email
 */
export async function sendRegistrationEmail(
  email: string,
  firstName: string,
  userId: string
): Promise<boolean> {
  try {
    const mailOptions = {
      from: emailConfig.from || '"SvatBot.cz" <info@svatbot.cz>',
      to: email,
      subject: '🎉 Vítejte v SvatBot.cz - Váš svatební plánovač',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Vítejte v SvatBot.cz</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Vítejte v SvatBot.cz!</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px;">Ahoj <strong>${firstName}</strong>,</p>
            
            <p>Děkujeme za registraci! Jsme rádi, že jste se rozhodli plánovat svou svatbu s námi.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h2 style="margin-top: 0; color: #667eea;">🎁 Váš 30denní zkušební přístup</h2>
              <p>Máte nyní <strong>30 dní zdarma</strong> pro vyzkoušení všech Premium funkcí:</p>
              <ul style="line-height: 2;">
                <li>✅ Neomezený počet hostů</li>
                <li>✅ Svatební web s RSVP</li>
                <li>✅ AI asistent pro plánování</li>
                <li>✅ Rozpočet a úkoly</li>
                <li>✅ Usazovací plán</li>
                <li>✅ Marketplace dodavatelů</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://svatbot.cz" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Začít plánovat svatbu
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Potřebujete pomoc? Napište nám na <a href="mailto:info@svatbot.cz" style="color: #667eea;">info@svatbot.cz</a>
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>© 2025 SvatBot.cz - Váš svatební plánovač</p>
            <p>
              <a href="https://svatbot.cz/ochrana-soukromi" style="color: #999; text-decoration: none;">Ochrana soukromí</a> | 
              <a href="https://svatbot.cz/obchodni-podminky" style="color: #999; text-decoration: none;">Obchodní podmínky</a>
            </p>
          </div>
        </body>
        </html>
      `
    }

    await transporter.sendMail(mailOptions)
    
    await logEmail({
      userId,
      email,
      type: 'registration',
      subject: mailOptions.subject,
      status: 'sent'
    })

    console.log('Registration email sent to:', email)
    return true
  } catch (error) {
    console.error('Error sending registration email:', error)
    
    await logEmail({
      userId,
      email,
      type: 'registration',
      subject: '🎉 Vítejte v SvatBot.cz',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    return false
  }
}

/**
 * Send payment success email
 */
export async function sendPaymentSuccessEmail(
  email: string,
  firstName: string,
  userId: string,
  plan: string,
  amount: number,
  currency: string,
  invoiceUrl?: string
): Promise<boolean> {
  try {
    const planName = plan === 'premium_monthly' ? 'Premium Měsíční' : 'Premium Roční'
    const formattedAmount = new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: currency
    }).format(amount / 100)

    const mailOptions = {
      from: emailConfig.from || '"SvatBot.cz" <info@svatbot.cz>',
      to: email,
      subject: '✅ Platba úspěšně přijata - SvatBot.cz',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Platba přijata</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">✅ Platba úspěšně přijata!</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px;">Ahoj <strong>${firstName}</strong>,</p>
            
            <p>Děkujeme za vaši platbu! Váš Premium přístup byl aktivován.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h2 style="margin-top: 0; color: #10b981;">📋 Detaily platby</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Plán:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${planName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Částka:</strong></td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${formattedAmount}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Datum:</strong></td>
                  <td style="padding: 8px 0; text-align: right;">${new Date().toLocaleDateString('cs-CZ')}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #0369a1;">
                <strong>💡 Tip:</strong> Nyní máte přístup ke všem Premium funkcím včetně AI asistenta, neomezeného počtu hostů a pokročilé analytiky.
              </p>
            </div>

            ${invoiceUrl ? `
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0 0 10px 0; color: #92400e;">
                <strong>📄 Faktura</strong>
              </p>
              <p style="margin: 0; color: #92400e;">
                Fakturu si můžete stáhnout ve svém profilu v sekci "Platby a Historie plateb" nebo přímo zde:
              </p>
              <div style="text-align: center; margin-top: 15px;">
                <a href="${invoiceUrl}" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
                  📥 Stáhnout fakturu
                </a>
              </div>
            </div>
            ` : ''}

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://svatbot.cz" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Pokračovat v plánování
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Máte dotazy? Napište nám na <a href="mailto:info@svatbot.cz" style="color: #10b981;">info@svatbot.cz</a>
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>© 2025 SvatBot.cz - Váš svatební plánovač</p>
          </div>
        </body>
        </html>
      `
    }

    await transporter.sendMail(mailOptions)
    
    await logEmail({
      userId,
      email,
      type: 'payment_success',
      subject: mailOptions.subject,
      status: 'sent',
      metadata: { plan, amount, currency }
    })

    console.log('Payment success email sent to:', email)
    return true
  } catch (error) {
    console.error('Error sending payment email:', error)
    
    await logEmail({
      userId,
      email,
      type: 'payment_success',
      subject: '✅ Platba úspěšně přijata',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    return false
  }
}

/**
 * Send trial reminder email (2 days before expiry)
 */
export async function sendTrialReminderEmail(
  email: string,
  firstName: string,
  userId: string,
  trialEndDate: Date
): Promise<boolean> {
  try {
    const formattedDate = trialEndDate.toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    const mailOptions = {
      from: emailConfig.from || '"SvatBot.cz" <info@svatbot.cz>',
      to: email,
      subject: '⏰ Vaše zkušební období brzy končí - SvatBot.cz',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Zkušební období končí</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">⏰ Zkušební období brzy končí</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px;">Ahoj <strong>${firstName}</strong>,</p>

            <p style="font-size: 16px; line-height: 1.8;">
              Vaše 30denní zkušební období končí <strong style="color: #d97706;">${formattedDate}</strong>.
              Už jste začali plánovat svou vysněnou svatbu a bylo by škoda o vše přijít!
            </p>

            <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #dc2626;">
              <p style="margin: 0; color: #991b1b; font-size: 15px; line-height: 1.8;">
                <strong>⚠️ Důležité upozornění:</strong><br>
                Po skončení zkušebního období <strong>ztratíte přístup do aplikace</strong> a ke všem svým datům.
                Všechny vaše hosty, úkoly, rozpočet a další informace zůstanou uložené, ale nebudete se k nim moci dostat,
                dokud nepřejdete na Premium plán.
              </p>
            </div>

            <div style="background: white; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10b981;">
              <h2 style="margin-top: 0; color: #10b981; font-size: 20px;">💎 Co získáte s Premium plánem</h2>
              <ul style="line-height: 2.2; padding-left: 20px; margin: 15px 0;">
                <li style="margin-bottom: 8px;">✅ <strong>Neomezený přístup</strong> ke všem funkcím a vašim datům</li>
                <li style="margin-bottom: 8px;">✅ <strong>AI asistent</strong> pro inteligentní plánování svatby</li>
                <li style="margin-bottom: 8px;">✅ <strong>Svatební web s RSVP</strong> systémem pro hosty</li>
                <li style="margin-bottom: 8px;">✅ <strong>Neomezený počet hostů</strong> a dodavatelů</li>
                <li style="margin-bottom: 8px;">✅ <strong>Pokročilá analytika</strong> a reporty</li>
                <li style="margin-bottom: 8px;">✅ <strong>Prioritní podpora</strong> 7 dní v týdnu</li>
                <li style="margin-bottom: 8px;">✅ <strong>Pravidelné aktualizace</strong> a nové funkce</li>
              </ul>
            </div>

            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 12px; margin: 25px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h3 style="margin: 0 0 20px 0; color: #92400e; font-size: 22px; text-align: center;">💰 Naše ceny</h3>

              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <div style="margin-bottom: 10px;">
                  <strong style="color: #92400e; font-size: 16px;">Měsíční plán</strong>
                </div>
                <div style="font-size: 32px; font-weight: bold; color: #d97706; margin: 10px 0;">
                  299 Kč
                </div>
                <div style="color: #78716c; font-size: 14px;">
                  za měsíc
                </div>
                <div style="text-align: center; margin-top: 15px;">
                  <a href="https://svatbot.cz/pricing?plan=monthly" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px;">
                    Vybrat měsíční plán
                  </a>
                </div>
              </div>

              <div style="background: white; padding: 20px; border-radius: 8px; border: 3px solid #10b981; position: relative; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                <div style="position: absolute; top: -12px; right: 20px; background: #10b981; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold;">
                  NEJLEPŠÍ VOLBA
                </div>
                <div style="margin-bottom: 10px;">
                  <strong style="color: #92400e; font-size: 16px;">Roční plán</strong>
                </div>
                <div style="font-size: 32px; font-weight: bold; color: #10b981; margin: 10px 0;">
                  2 999 Kč
                </div>
                <div style="color: #78716c; font-size: 14px; margin-bottom: 8px;">
                  za rok (249 Kč/měsíc)
                </div>
                <div style="background: #d1fae5; color: #065f46; padding: 8px 12px; border-radius: 6px; font-size: 14px; font-weight: bold; display: inline-block;">
                  🎉 Ušetříte 589 Kč
                </div>
                <div style="text-align: center; margin-top: 15px;">
                  <a href="https://svatbot.cz/pricing?plan=yearly" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px;">
                    Vybrat roční plán
                  </a>
                </div>
              </div>
            </div>

            <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
              <p style="margin: 0; color: #0369a1; font-size: 15px; line-height: 1.8;">
                <strong>💡 Tip:</strong> S ročním plánem ušetříte téměř 600 Kč a máte jistotu,
                že budete mít přístup k aplikaci po celou dobu plánování svatby!
              </p>
            </div>

            <p style="color: #666; font-size: 14px; margin-top: 30px; text-align: center;">
              Máte dotazy? Napište nám na <a href="mailto:info@svatbot.cz" style="color: #f59e0b; text-decoration: none; font-weight: bold;">info@svatbot.cz</a>
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>© 2025 SvatBot.cz - Váš svatební plánovač</p>
          </div>
        </body>
        </html>
      `
    }

    await transporter.sendMail(mailOptions)
    
    await logEmail({
      userId,
      email,
      type: 'trial_reminder',
      subject: mailOptions.subject,
      status: 'sent',
      metadata: { trialEndDate: trialEndDate.toISOString() }
    })

    console.log('Trial reminder email sent to:', email)
    return true
  } catch (error) {
    console.error('Error sending trial reminder email:', error)
    
    await logEmail({
      userId,
      email,
      type: 'trial_reminder',
      subject: '⏰ Vaše zkušební období brzy končí',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    return false
  }
}

