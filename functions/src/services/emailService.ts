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
  type: 'registration' | 'payment_success' | 'trial_reminder' | 'trial_expired' | 'vendor_registration' | 'vendor_approved' | 'other'
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
    // Map plan to display name
    let planName = 'Premium'
    if (plan === 'premium_monthly') {
      planName = 'Premium Měsíční'
    } else if (plan === 'premium_yearly') {
      planName = 'Premium Roční'
    } else if (plan === 'test_daily') {
      planName = 'Test Denní'
    }

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

/**
 * Send vendor registration confirmation email with edit link
 */
export async function sendVendorRegistrationEmail(
  email: string,
  vendorName: string,
  editToken: string
): Promise<boolean> {
  try {
    const editUrl = `https://svatbot.cz/marketplace/edit/${editToken}`

    const mailOptions = {
      from: emailConfig.from || '"SvatBot.cz" <info@svatbot.cz>',
      to: email,
      subject: '✅ Registrace přijata - SvatBot Marketplace',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Registrace přijata</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">✅ Registrace přijata!</h1>
          </div>

          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              Dobrý den,
            </p>

            <p style="font-size: 16px; margin-bottom: 20px;">
              Děkujeme za registraci <strong>${vendorName}</strong> na SvatBot Marketplace!
            </p>

            <p style="font-size: 16px; margin-bottom: 20px;">
              Váš inzerát byl úspěšně přijat a nyní čeká na schválení naším týmem. Proces schválení obvykle trvá 24-48 hodin.
            </p>

            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0; font-weight: bold; color: #92400e; font-size: 16px;">
                🔑 Důležité: Uložte si tento editační odkaz!
              </p>
              <p style="margin: 10px 0 0 0; color: #92400e; font-size: 14px;">
                Pomocí tohoto odkazu budete moci kdykoliv upravit svůj inzerát:
              </p>
            </div>

            <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <p style="margin: 0 0 15px 0; font-size: 14px; color: #666;">
                Váš editační odkaz:
              </p>
              <a href="${editUrl}" style="display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Upravit můj inzerát
              </a>
              <p style="margin: 15px 0 0 0; font-size: 12px; color: #999; word-break: break-all;">
                ${editUrl}
              </p>
            </div>

            <div style="background: #e0e7ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0; font-weight: bold; color: #3730a3;">
                Co můžete upravit:
              </p>
              <ul style="margin: 0; padding-left: 20px; color: #3730a3;">
                <li>Název a popis služeb</li>
                <li>Kontaktní údaje</li>
                <li>Ceny a balíčky</li>
                <li>Fotografie a portfolio</li>
                <li>Dostupnost a pracovní dobu</li>
              </ul>
            </div>

            <p style="font-size: 16px; margin-bottom: 20px;">
              <strong>Co bude dál?</strong>
            </p>
            <ol style="font-size: 14px; color: #666; padding-left: 20px;">
              <li>Náš tým zkontroluje váš inzerát do 24-48 hodin</li>
              <li>Po schválení vám pošleme další email s potvrzením</li>
              <li>Váš inzerát bude viditelný pro stovky párů plánujících svatbu</li>
            </ol>

            <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              Máte otázky? Kontaktujte nás na <a href="mailto:info@svatbot.cz" style="color: #667eea;">info@svatbot.cz</a>
            </p>

            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              S pozdravem,<br>
              <strong>Tým SvatBot.cz</strong>
            </p>
          </div>

          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>© 2024 SvatBot.cz - Váš průvodce svatebním plánováním</p>
          </div>
        </body>
        </html>
      `
    }

    await transporter.sendMail(mailOptions)

    await logEmail({
      userId: 'vendor',
      email,
      type: 'vendor_registration',
      subject: '✅ Registrace přijata - SvatBot Marketplace',
      status: 'sent',
      metadata: {
        vendorName,
        editToken
      }
    })

    console.log('Vendor registration email sent to:', email)
    return true
  } catch (error) {
    console.error('Error sending vendor registration email:', error)

    await logEmail({
      userId: 'vendor',
      email,
      type: 'vendor_registration',
      subject: '✅ Registrace přijata - SvatBot Marketplace',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return false
  }
}

/**
 * Send vendor approval notification email
 */
export async function sendVendorApprovalEmail(
  email: string,
  vendorName: string,
  editToken: string
): Promise<boolean> {
  try {
    const editUrl = `https://svatbot.cz/marketplace/edit/${editToken}`
    const marketplaceUrl = 'https://svatbot.cz/marketplace'

    const mailOptions = {
      from: emailConfig.from || '"SvatBot.cz" <info@svatbot.cz>',
      to: email,
      subject: '🎉 Váš inzerát byl schválen - SvatBot Marketplace',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Inzerát schválen</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Gratulujeme!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Váš inzerát byl schválen</p>
          </div>

          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              Dobrý den,
            </p>

            <p style="font-size: 16px; margin-bottom: 20px;">
              Skvělá zpráva! Váš inzerát <strong>${vendorName}</strong> byl schválen a je nyní viditelný na SvatBot Marketplace.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${marketplaceUrl}" style="display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin-bottom: 10px;">
                Zobrazit na Marketplace
              </a>
            </div>

            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0; font-weight: bold; color: #92400e; font-size: 16px;">
                🔑 Připomínka: Odkaz pro úpravy
              </p>
              <p style="margin: 10px 0 0 0; color: #92400e; font-size: 14px;">
                Kdykoliv můžete upravit svůj inzerát pomocí tohoto odkazu:
              </p>
            </div>

            <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <a href="${editUrl}" style="display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Upravit inzerát
              </a>
              <p style="margin: 15px 0 0 0; font-size: 12px; color: #999; word-break: break-all;">
                ${editUrl}
              </p>
            </div>

            <div style="background: #e0e7ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0; font-weight: bold; color: #3730a3;">
                💡 Tipy pro úspěch:
              </p>
              <ul style="margin: 0; padding-left: 20px; color: #3730a3; font-size: 14px;">
                <li>Udržujte své portfolio aktuální s nejnovějšími fotografiemi</li>
                <li>Odpovídejte na poptávky rychle (ideálně do 24 hodin)</li>
                <li>Aktualizujte dostupnost a ceny podle sezóny</li>
                <li>Sbírejte recenze od spokojených klientů</li>
              </ul>
            </div>

            <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              Máte otázky nebo potřebujete pomoc? Kontaktujte nás na <a href="mailto:info@svatbot.cz" style="color: #667eea;">info@svatbot.cz</a>
            </p>

            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              Přejeme hodně úspěchů!<br>
              <strong>Tým SvatBot.cz</strong>
            </p>
          </div>

          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>© 2024 SvatBot.cz - Váš průvodce svatebním plánováním</p>
          </div>
        </body>
        </html>
      `
    }

    await transporter.sendMail(mailOptions)

    await logEmail({
      userId: 'vendor',
      email,
      type: 'vendor_approved',
      subject: '🎉 Váš inzerát byl schválen - SvatBot Marketplace',
      status: 'sent',
      metadata: {
        vendorName,
        editToken
      }
    })

    console.log('Vendor approval email sent to:', email)
    return true
  } catch (error) {
    console.error('Error sending vendor approval email:', error)

    await logEmail({
      userId: 'vendor',
      email,
      type: 'vendor_approved',
      subject: '🎉 Váš inzerát byl schválen - SvatBot Marketplace',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return false
  }
}

/**
 * Send vendor contact inquiry email to vendor
 */
export async function sendVendorContactEmail(
  vendorEmail: string,
  vendorName: string,
  inquiry: {
    customerName: string
    customerEmail: string
    customerPhone: string
    weddingDate: string
    message: string
  }
): Promise<boolean> {
  try {

    const mailOptions = {
      from: `"SvatBot.cz" <${EMAIL_CONFIG.auth.user}>`,
      to: vendorEmail,
      subject: `Nová poptávka od ${inquiry.customerName} - SvatBot.cz`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .info-row { margin: 10px 0; }
            .label { font-weight: bold; color: #667eea; }
            .message-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 Nová poptávka</h1>
              <p>Máte novou poptávku od zákazníka přes SvatBot.cz</p>
            </div>

            <div class="content">
              <p>Dobrý den,</p>
              <p>Obdrželi jste novou poptávku od zákazníka, který má zájem o vaše služby pro svou svatbu.</p>

              <div class="info-box">
                <h3 style="margin-top: 0; color: #667eea;">📋 Informace o zákazníkovi</h3>
                <div class="info-row">
                  <span class="label">Jméno:</span> ${inquiry.customerName}
                </div>
                <div class="info-row">
                  <span class="label">Email:</span> <a href="mailto:${inquiry.customerEmail}">${inquiry.customerEmail}</a>
                </div>
                <div class="info-row">
                  <span class="label">Telefon:</span> <a href="tel:${inquiry.customerPhone}">${inquiry.customerPhone}</a>
                </div>
                <div class="info-row">
                  <span class="label">Datum svatby:</span> ${inquiry.weddingDate}
                </div>
              </div>

              <div class="message-box">
                <h3 style="margin-top: 0; color: #667eea;">💬 Zpráva od zákazníka</h3>
                <p style="white-space: pre-wrap;">${inquiry.message}</p>
              </div>

              <p><strong>Doporučujeme odpovědět co nejdříve!</strong> Zákazníci obvykle kontaktují více dodavatelů a rychlá odpověď zvyšuje šanci na získání zakázky.</p>

              <div style="text-align: center;">
                <a href="mailto:${inquiry.customerEmail}" class="button">Odpovědět zákazníkovi</a>
              </div>

              <div class="footer">
                <p>Tato poptávka byla odeslána přes <strong>SvatBot.cz</strong></p>
                <p>Marketplace pro svatební dodavatele</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    }

    await transporter.sendMail(mailOptions)
    console.log('✅ Vendor contact email sent to:', vendorEmail)
    return true
  } catch (error) {
    console.error('❌ Error sending vendor contact email:', error)
    return false
  }
}

/**
 * Send contact confirmation email to customer
 */
export async function sendCustomerContactConfirmationEmail(
  customerEmail: string,
  customerName: string,
  vendorName: string,
  vendorEmail: string
): Promise<boolean> {
  try {

    const mailOptions = {
      from: `"SvatBot.cz" <${EMAIL_CONFIG.auth.user}>`,
      to: customerEmail,
      subject: `Potvrzení odeslání poptávky - ${vendorName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-box { background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
            .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Poptávka odeslána</h1>
              <p>Vaše poptávka byla úspěšně doručena dodavateli</p>
            </div>

            <div class="content">
              <p>Dobrý den ${customerName},</p>

              <div class="success-box">
                <p style="margin: 0;"><strong>✓ Vaše poptávka byla úspěšně odeslána dodavateli ${vendorName}</strong></p>
              </div>

              <p>Dodavatel obdržel vaše kontaktní údaje a zprávu. Měl by vás kontaktovat v nejbližší době.</p>

              <div class="info-box">
                <h3 style="margin-top: 0; color: #667eea;">📞 Co dál?</h3>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Dodavatel vás bude kontaktovat na uvedený email nebo telefon</li>
                  <li>Obvykle odpovídají do 24-48 hodin</li>
                  <li>Pokud neobdržíte odpověď, můžete dodavatele kontaktovat přímo na: <a href="mailto:${vendorEmail}">${vendorEmail}</a></li>
                </ul>
              </div>

              <p><strong>💡 Tip:</strong> Doporučujeme kontaktovat více dodavatelů a porovnat jejich nabídky.</p>

              <div style="text-align: center;">
                <a href="https://svatbot.cz/marketplace" class="button">Procházet další dodavatele</a>
              </div>

              <div class="footer">
                <p>Děkujeme, že používáte <strong>SvatBot.cz</strong></p>
                <p>Váš pomocník při plánování svatby</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    }

    await transporter.sendMail(mailOptions)
    console.log('✅ Customer confirmation email sent to:', customerEmail)
    return true
  } catch (error) {
    console.error('❌ Error sending customer confirmation email:', error)
    return false
  }
}

/**
 * Send contact form notification to info@svatbot.cz
 */
export async function sendContactFormNotification(
  name: string,
  email: string,
  message: string,
  timestamp: string
): Promise<boolean> {
  try {
    const mailOptions = {
      from: '"SvatBot.cz" <info@svatbot.cz>',
      to: 'info@svatbot.cz',
      replyTo: email,
      subject: `📧 Nová zpráva z kontaktního formuláře - ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nová zpráva z kontaktního formuláře</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">📧 Nová zpráva z webu</h1>
          </div>

          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="margin-top: 0; color: #ec4899;">Kontaktní údaje</h2>
              <p style="margin: 10px 0;"><strong>Jméno:</strong> ${name}</p>
              <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #ec4899;">${email}</a></p>
              <p style="margin: 10px 0;"><strong>Čas odeslání:</strong> ${new Date(timestamp).toLocaleString('cs-CZ')}</p>
            </div>

            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #ec4899;">
              <h2 style="margin-top: 0; color: #ec4899;">Zpráva</h2>
              <p style="white-space: pre-wrap; line-height: 1.8;">${message}</p>
            </div>

            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #f59e0b;">
              <p style="margin: 0;"><strong>💡 Tip:</strong> Můžete odpovědět přímo kliknutím na "Odpovědět" - email bude odeslán na ${email}</p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">Tato zpráva byla odeslána z kontaktního formuláře na <strong>svatbot.cz</strong></p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Nová zpráva z kontaktního formuláře SvatBot.cz
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Od: ${name}
Email: ${email}
Čas: ${new Date(timestamp).toLocaleString('cs-CZ')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ZPRÁVA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Odpovězte přímo na tento email pro kontaktování odesílatele.
`
    }

    await transporter.sendMail(mailOptions)
    console.log('✅ Contact form notification sent to info@svatbot.cz')
    return true
  } catch (error) {
    console.error('❌ Error sending contact form notification:', error)
    return false
  }
}

