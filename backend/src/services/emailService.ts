import nodemailer from 'nodemailer'
import { logger } from '@/config/logger'

export class EmailService {
  private static transporter: nodemailer.Transporter

  // Initialize email transporter
  static initialize(): void {
    EmailService.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    })

    // Verify connection
    EmailService.transporter.verify((error, success) => {
      if (error) {
        logger.error('Email service initialization failed:', error)
      } else {
        logger.info('Email service initialized successfully')
      }
    })
  }

  // Send verification email
  static async sendVerificationEmail(email: string, token: string): Promise<void> {
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'SvatBot <noreply@svatbot.cz>',
        to: email,
        subject: 'Ověřte svůj email - SvatBot',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Ověření emailu - SvatBot</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>💍 SvatBot</h1>
                <h2>Ověření emailové adresy</h2>
              </div>
              <div class="content">
                <p>Vítejte v SvatBot!</p>
                <p>Pro dokončení registrace prosím ověřte svou emailovou adresu kliknutím na tlačítko níže:</p>
                <p style="text-align: center;">
                  <a href="${verificationUrl}" class="button">Ověřit email</a>
                </p>
                <p>Nebo zkopírujte a vložte tento odkaz do prohlížeče:</p>
                <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">
                  ${verificationUrl}
                </p>
                <p><strong>Tento odkaz vyprší za 24 hodin.</strong></p>
                <p>Pokud jste se neregistrovali na SvatBot, můžete tento email ignorovat.</p>
              </div>
              <div class="footer">
                <p>© 2024 SvatBot.cz - Váš průvodce svatebním plánováním</p>
              </div>
            </div>
          </body>
          </html>
        `
      }

      await EmailService.transporter.sendMail(mailOptions)
      logger.info('Verification email sent successfully:', { email })
    } catch (error) {
      logger.error('Failed to send verification email:', error)
      throw new Error('Failed to send verification email')
    }
  }

  // Send password reset email
  static async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'SvatBot <noreply@svatbot.cz>',
        to: email,
        subject: 'Obnovení hesla - SvatBot',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Obnovení hesla - SvatBot</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
              .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>💍 SvatBot</h1>
                <h2>Obnovení hesla</h2>
              </div>
              <div class="content">
                <p>Obdrželi jsme žádost o obnovení hesla pro váš účet.</p>
                <p>Pro vytvoření nového hesla klikněte na tlačítko níže:</p>
                <p style="text-align: center;">
                  <a href="${resetUrl}" class="button">Obnovit heslo</a>
                </p>
                <p>Nebo zkopírujte a vložte tento odkaz do prohlížeče:</p>
                <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">
                  ${resetUrl}
                </p>
                <div class="warning">
                  <strong>⚠️ Důležité:</strong>
                  <ul>
                    <li>Tento odkaz vyprší za 1 hodinu</li>
                    <li>Odkaz lze použít pouze jednou</li>
                    <li>Po použití budou všechny vaše aktivní relace ukončeny</li>
                  </ul>
                </div>
                <p>Pokud jste o obnovení hesla nežádali, můžete tento email ignorovat. Vaše heslo zůstane nezměněno.</p>
              </div>
              <div class="footer">
                <p>© 2024 SvatBot.cz - Váš průvodce svatebním plánováním</p>
              </div>
            </div>
          </body>
          </html>
        `
      }

      await EmailService.transporter.sendMail(mailOptions)
      logger.info('Password reset email sent successfully:', { email })
    } catch (error) {
      logger.error('Failed to send password reset email:', error)
      throw new Error('Failed to send password reset email')
    }
  }

  // Send inquiry notification to vendor
  static async sendInquiryNotification(
    vendorEmail: string,
    vendorName: string,
    inquiry: {
      name: string
      email: string
      phone?: string
      weddingDate?: Date
      message: string
    }
  ): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'SvatBot <noreply@svatbot.cz>',
        to: vendorEmail,
        subject: `Nová poptávka přes SvatBot - ${inquiry.name}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Nová poptávka - SvatBot</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .info-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>💍 SvatBot</h1>
                <h2>Nová poptávka</h2>
              </div>
              <div class="content">
                <p>Dobrý den ${vendorName},</p>
                <p>obdrželi jste novou poptávku přes SvatBot marketplace:</p>
                
                <div class="info-box">
                  <h3>📋 Detaily poptávky</h3>
                  <p><strong>Jméno:</strong> ${inquiry.name}</p>
                  <p><strong>Email:</strong> <a href="mailto:${inquiry.email}">${inquiry.email}</a></p>
                  ${inquiry.phone ? `<p><strong>Telefon:</strong> <a href="tel:${inquiry.phone}">${inquiry.phone}</a></p>` : ''}
                  ${inquiry.weddingDate ? `<p><strong>Datum svatby:</strong> ${inquiry.weddingDate.toLocaleDateString('cs-CZ')}</p>` : ''}
                </div>

                <div class="info-box">
                  <h3>💬 Zpráva</h3>
                  <p>${inquiry.message.replace(/\n/g, '<br>')}</p>
                </div>

                <p><strong>Doporučujeme odpovědět co nejdříve</strong> - rychlá odezva zvyšuje šanci na získání zakázky!</p>
                
                <p>Můžete odpovědět přímo na tento email nebo kontaktovat zákazníka na uvedených kontaktech.</p>
              </div>
              <div class="footer">
                <p>© 2024 SvatBot.cz - Váš průvodce svatebním plánováním</p>
              </div>
            </div>
          </body>
          </html>
        `
      }

      await EmailService.transporter.sendMail(mailOptions)
      logger.info('Inquiry notification sent successfully:', { vendorEmail, inquiryFrom: inquiry.email })
    } catch (error) {
      logger.error('Failed to send inquiry notification:', error)
      throw new Error('Failed to send inquiry notification')
    }
  }

  // Send welcome email to new vendors
  static async sendVendorWelcomeEmail(
    email: string,
    vendorName: string,
    isApproved: boolean = false
  ): Promise<void> {
    try {
      const subject = isApproved ? 
        `Vítejte v SvatBot marketplace - ${vendorName}` : 
        `Děkujeme za registraci - ${vendorName}`

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'SvatBot <noreply@svatbot.cz>',
        to: email,
        subject,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject}</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
              .tips { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>💍 SvatBot</h1>
                <h2>${isApproved ? 'Vítejte v marketplace!' : 'Děkujeme za registraci!'}</h2>
              </div>
              <div class="content">
                <p>Dobrý den,</p>
                
                ${isApproved ? `
                  <p>Gratulujeme! Váš profil <strong>${vendorName}</strong> byl schválen a je nyní aktivní v SvatBot marketplace.</p>
                  <p style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL}/vendor/dashboard" class="button">Přejít do dashboardu</a>
                  </p>
                ` : `
                  <p>Děkujeme za registraci profilu <strong>${vendorName}</strong> v SvatBot marketplace.</p>
                  <p>Váš profil je nyní v procesu schvalování. Budeme vás informovat emailem, jakmile bude schválen.</p>
                `}

                <div class="tips">
                  <h3>💡 Tipy pro úspěch</h3>
                  <ul>
                    <li><strong>Kompletní profil:</strong> Vyplňte všechny informace a přidejte kvalitní fotografie</li>
                    <li><strong>Rychlá odezva:</strong> Odpovídejte na poptávky do 24 hodin</li>
                    <li><strong>Profesionální komunikace:</strong> Buďte vstřícní a profesionální</li>
                    <li><strong>Aktuální informace:</strong> Udržujte své služby a ceny aktuální</li>
                  </ul>
                </div>

                <p>Pokud máte jakékoli otázky, neváhejte nás kontaktovat na <a href="mailto:${process.env.ADMIN_EMAIL}">${process.env.ADMIN_EMAIL}</a>.</p>
              </div>
              <div class="footer">
                <p>© 2024 SvatBot.cz - Váš průvodce svatebním plánováním</p>
              </div>
            </div>
          </body>
          </html>
        `
      }

      await EmailService.transporter.sendMail(mailOptions)
      logger.info('Vendor welcome email sent successfully:', { email, vendorName, isApproved })
    } catch (error) {
      logger.error('Failed to send vendor welcome email:', error)
      throw new Error('Failed to send vendor welcome email')
    }
  }

  // Test email configuration
  static async testConnection(): Promise<boolean> {
    try {
      await EmailService.transporter.verify()
      return true
    } catch (error) {
      logger.error('Email connection test failed:', error)
      return false
    }
  }
}
