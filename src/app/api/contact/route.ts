import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, message } = body

    // Validate input
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Všechna pole jsou povinná' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Neplatný formát emailu' },
        { status: 400 }
      )
    }

    // Get Firebase Function URL from environment
    const functionUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTION_URL || 
                       'https://europe-west1-svatbot-app.cloudfunctions.net'

    try {
      // Send email via Firebase Function
      const emailPayload = {
        name,
        email,
        message,
        timestamp: new Date().toISOString()
      }

      console.log('📤 Sending contact form email:', { name, email })

      const response = await fetch(`${functionUrl}/sendContactFormEmail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload)
      })

      console.log('📬 Email function response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Failed to send email via Firebase Function:', errorText)
        
        return NextResponse.json(
          { error: 'Nepodařilo se odeslat zprávu. Zkuste to prosím znovu nebo nás kontaktujte přímo na info@svatbot.cz' },
          { status: 500 }
        )
      }

      const result = await response.json()
      console.log('✅ Contact form email sent successfully:', result)

      return NextResponse.json({ 
        success: true,
        message: 'Zpráva byla úspěšně odeslána. Brzy se vám ozveme!' 
      })

    } catch (emailError) {
      console.error('❌ Error calling Firebase Function for contact email:', emailError)
      
      return NextResponse.json(
        { error: 'Nepodařilo se odeslat zprávu. Zkuste to prosím znovu nebo nás kontaktujte přímo na info@svatbot.cz' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error processing contact form:', error)
    return NextResponse.json(
      { error: 'Chyba při zpracování formuláře' },
      { status: 500 }
    )
  }
}

