/**
 * Invoice Numbering System
 * 
 * Ensures chronological, sequential invoice numbering without gaps
 * Format: YYYYMM-NNN (e.g., 202511-001, 202511-002, etc.)
 * 
 * This system is compliant with Czech accounting legislation which requires:
 * - Chronological order
 * - Ascending sequence
 * - No gaps in numbering
 */

import { getAdminDb } from '@/config/firebase-admin'
import { Timestamp, FieldValue } from 'firebase-admin/firestore'

/**
 * Get next invoice number for the current month
 * Uses Firestore transaction to ensure no duplicate numbers
 * 
 * @param date - Date for which to generate invoice number (defaults to now)
 * @returns Promise<string> - Invoice number in format YYYYMM-NNN
 */
export async function getNextInvoiceNumber(date: Date = new Date()): Promise<string> {
  const adminDb = getAdminDb()
  
  // Format: YYYYMM
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const period = `${year}${month}`
  
  // Use transaction to ensure atomic increment
  const counterRef = adminDb.collection('invoiceCounters').doc(period)
  
  try {
    const result = await adminDb.runTransaction(async (transaction) => {
      const counterDoc = await transaction.get(counterRef)
      
      let nextNumber: number
      
      if (!counterDoc.exists) {
        // First invoice of this month
        nextNumber = 1
        transaction.set(counterRef, {
          period,
          lastNumber: 1,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        })
      } else {
        // Increment counter
        const currentNumber = counterDoc.data()?.lastNumber || 0
        nextNumber = currentNumber + 1
        transaction.update(counterRef, {
          lastNumber: nextNumber,
          updatedAt: Timestamp.now()
        })
      }
      
      // Format: YYYYMM-NNN (e.g., 202511-001)
      const invoiceNumber = `${period}-${String(nextNumber).padStart(3, '0')}`
      return invoiceNumber
    })
    
    console.log(`✅ Generated invoice number: ${result}`)
    return result
    
  } catch (error) {
    console.error('❌ Error generating invoice number:', error)
    throw new Error('Failed to generate invoice number')
  }
}

/**
 * Get current counter value for a period (for debugging/admin purposes)
 */
export async function getCurrentCounter(year: number, month: number): Promise<number> {
  const adminDb = getAdminDb()
  const period = `${year}${String(month).padStart(2, '0')}`
  
  const counterDoc = await adminDb.collection('invoiceCounters').doc(period).get()
  
  if (!counterDoc.exists) {
    return 0
  }
  
  return counterDoc.data()?.lastNumber || 0
}

/**
 * Validate invoice number format
 */
export function validateInvoiceNumber(invoiceNumber: string): boolean {
  // Format: YYYYMM-NNN
  const regex = /^\d{6}-\d{3}$/
  return regex.test(invoiceNumber)
}

/**
 * Parse invoice number to get period and sequence
 */
export function parseInvoiceNumber(invoiceNumber: string): { period: string; sequence: number } | null {
  if (!validateInvoiceNumber(invoiceNumber)) {
    return null
  }
  
  const [period, sequenceStr] = invoiceNumber.split('-')
  return {
    period,
    sequence: parseInt(sequenceStr, 10)
  }
}

/**
 * Generate variable symbol from invoice number
 * Variable symbol is used for payment identification in Czech banking
 */
export function generateVariableSymbol(invoiceNumber: string): string {
  // Remove dashes and use the full number
  // Format: YYYYMMNNN (e.g., 202511001)
  return invoiceNumber.replace(/-/g, '')
}

