import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI only if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null

const WEDDING_CONTEXT = `
Jsi expert na svatební plánování v České republice. Znáš:
- České svatební tradice a zvyky
- Průměrné ceny služeb v ČR (2024-2025)
- Sezónní faktory (květen-září hlavní sezóna)
- Regionální rozdíly (Praha dražší než venkov)
- Právní požadavky (matrika, církevní obřad)
- Časové plánování (12-18 měsíců dopředu)

Odpovídáš vždy v češtině, prakticky a s konkrétními čísly.

DŮLEŽITÉ: Máš přístup k REÁLNÝM datům uživatele o jeho svatbě. Když se uživatel ptá na konkrétní informace
(např. "Kdo má alergii na lepek?", "Kolik stojí fotograf?", "Jaké úkoly mám nesplněné?"),
VŽDY odpovídej na základě poskytnutých dat, ne obecně. Pokud data nejsou k dispozici, řekni to uživateli.
`

// Helper function to build detailed context string
function buildDetailedContext(context: any): string {
  if (!context) return ''

  let contextStr = '\n=== DETAILNÍ KONTEXT SVATBY ===\n\n'

  // Basic info
  contextStr += '📋 ZÁKLADNÍ INFORMACE:\n'
  contextStr += `- Datum svatby: ${context.weddingDate ? new Date(context.weddingDate).toLocaleDateString('cs-CZ') : 'neurčeno'}\n`
  contextStr += `- Lokace: ${context.location || 'neurčena'}\n`
  contextStr += `- Styl: ${context.style || 'neurčen'}\n`
  contextStr += `- Celkový rozpočet: ${context.budget ? `${context.budget.toLocaleString()} Kč` : 'neurčen'}\n`
  contextStr += `- Počet hostů: ${context.guestCount || 'neurčen'}\n\n`

  // Guest stats and details
  if (context.guestStats) {
    contextStr += '👥 STATISTIKY HOSTŮ:\n'
    contextStr += `- Celkem hostů: ${context.guestStats.total}\n`
    contextStr += `- Potvrzeno: ${context.guestStats.confirmed}\n`
    contextStr += `- Odmítnuto: ${context.guestStats.declined}\n`
    contextStr += `- Čeká na odpověď: ${context.guestStats.pending}\n`
    contextStr += `- S dietními omezeními: ${context.guestStats.withDietaryRestrictions}\n`
    contextStr += `- Potřebuje ubytování: ${context.guestStats.needingAccommodation}\n\n`
  }

  // Detailed guest info with dietary restrictions
  if (context.guests && context.guests.length > 0) {
    const guestsWithDietary = context.guests.filter((g: any) =>
      g.dietaryRestrictions && g.dietaryRestrictions.length > 0
    )

    if (guestsWithDietary.length > 0) {
      contextStr += '🍽️ HOSTÉ S DIETNÍMI OMEZENÍMI:\n'
      guestsWithDietary.forEach((guest: any) => {
        contextStr += `- ${guest.firstName} ${guest.lastName}: ${guest.dietaryRestrictions.join(', ')}`
        if (guest.dietaryNotes) {
          contextStr += ` (${guest.dietaryNotes})`
        }
        contextStr += '\n'
      })
      contextStr += '\n'
    }

    const guestsNeedingAccommodation = context.guests.filter((g: any) => g.accommodationNeeded)
    if (guestsNeedingAccommodation.length > 0) {
      contextStr += '🏨 HOSTÉ POTŘEBUJÍCÍ UBYTOVÁNÍ:\n'
      guestsNeedingAccommodation.forEach((guest: any) => {
        contextStr += `- ${guest.firstName} ${guest.lastName}\n`
      })
      contextStr += '\n'
    }
  }

  // Budget details
  if (context.budgetStats) {
    contextStr += '💰 ROZPOČET:\n'
    contextStr += `- Celkový rozpočet: ${context.budgetStats.totalBudget.toLocaleString()} Kč\n`
    contextStr += `- Celkem utraceno: ${context.budgetStats.totalSpent.toLocaleString()} Kč\n`
    contextStr += `- Zaplaceno: ${context.budgetStats.totalPaid.toLocaleString()} Kč\n`
    contextStr += `- Zbývá: ${context.budgetStats.remaining.toLocaleString()} Kč\n`
    contextStr += `- Procento utraceno: ${context.budgetStats.budgetUsed}%\n\n`
  }

  // Budget items
  if (context.budgetItems && context.budgetItems.length > 0) {
    contextStr += '📊 ROZPOČTOVÉ POLOŽKY:\n'
    context.budgetItems.forEach((item: any) => {
      contextStr += `- ${item.name} (${item.category}): `
      contextStr += `Plánováno ${item.budgetedAmount?.toLocaleString() || 0} Kč, `
      contextStr += `Skutečnost ${item.actualAmount?.toLocaleString() || 0} Kč, `
      contextStr += `Zaplaceno ${item.paidAmount?.toLocaleString() || 0} Kč`
      if (item.vendorName) {
        contextStr += ` - Dodavatel: ${item.vendorName}`
      }
      contextStr += '\n'
    })
    contextStr += '\n'
  }

  // Task stats
  if (context.taskStats) {
    contextStr += '✅ ÚKOLY:\n'
    contextStr += `- Celkem úkolů: ${context.taskStats.total}\n`
    contextStr += `- Dokončeno: ${context.taskStats.completed}\n`
    contextStr += `- Čeká: ${context.taskStats.pending}\n`
    contextStr += `- Po termínu: ${context.taskStats.overdue}\n\n`
  }

  // Task details
  if (context.currentTasks && context.currentTasks.length > 0) {
    const pendingTasks = context.currentTasks.filter((t: any) => t.status === 'pending')
    const overdueTasks = context.currentTasks.filter((t: any) => {
      if (!t.dueDate || t.status === 'completed') return false
      return new Date(t.dueDate) < new Date()
    })

    if (overdueTasks.length > 0) {
      contextStr += '⚠️ ÚKOLY PO TERMÍNU:\n'
      overdueTasks.forEach((task: any) => {
        contextStr += `- ${task.title} (termín: ${new Date(task.dueDate).toLocaleDateString('cs-CZ')})\n`
      })
      contextStr += '\n'
    }

    if (pendingTasks.length > 0) {
      contextStr += '📝 ČEKAJÍCÍ ÚKOLY:\n'
      pendingTasks.slice(0, 10).forEach((task: any) => {
        contextStr += `- ${task.title}`
        if (task.dueDate) {
          contextStr += ` (termín: ${new Date(task.dueDate).toLocaleDateString('cs-CZ')})`
        }
        contextStr += '\n'
      })
      if (pendingTasks.length > 10) {
        contextStr += `... a dalších ${pendingTasks.length - 10} úkolů\n`
      }
      contextStr += '\n'
    }
  }

  contextStr += '=== KONEC KONTEXTU ===\n'

  return contextStr
}

export async function POST(request: NextRequest) {
  try {
    const { question, context } = await request.json()

    if (!question) {
      return NextResponse.json(
        { error: 'Otázka je povinná' },
        { status: 400 }
      )
    }

    // Build detailed context string with all user data
    const contextInfo = buildDetailedContext(context)

    let content: string

    if (!openai) {
      // Mock response when OpenAI is not available
      content = "Omlouvám se, AI asistent momentálně není dostupný. Zkuste to prosím později."
    } else {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: WEDDING_CONTEXT
          },
          {
            role: "user",
            content: `${contextInfo}\n\nOtázka uživatele: ${question}`
          }
        ],
        max_tokens: 1000, // Increased for more detailed responses
        temperature: 0.7
      })

      content = response.choices[0]?.message?.content || 'Omlouvám se, nepodařilo se mi odpovědět na vaši otázku.'
    }

    return NextResponse.json({ response: content })
  } catch (error) {
    console.error('AI Chat error:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se získat odpověď od AI asistenta' },
      { status: 500 }
    )
  }
}
