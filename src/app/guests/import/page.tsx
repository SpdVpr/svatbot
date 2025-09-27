'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useGuest } from '@/hooks/useGuest'
import { GuestImportData } from '@/types/guest'
import {
  ArrowLeft,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  FileText,
  Users
} from 'lucide-react'
import Link from 'next/link'
import * as XLSX from 'xlsx'

interface ImportError {
  row: number
  field: string
  message: string
}

export default function GuestImportPage() {
  const router = useRouter()
  const { importGuests } = useGuest()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [file, setFile] = useState<File | null>(null)
  const [importData, setImportData] = useState<GuestImportData[]>([])
  const [errors, setErrors] = useState<ImportError[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [importSuccess, setImportSuccess] = useState(false)
  const [step, setStep] = useState<'upload' | 'preview' | 'complete'>('upload')

  // Template data for sample file
  const templateData = [
    {
      'Jméno': 'Jan',
      'Příjmení': 'Novák',
      'Email': 'jan.novak@email.cz',
      'Telefon': '+420 123 456 789',
      'Kategorie': 'Rodina nevěsty',
      'Poznámky': 'Bratr nevěsty'
    },
    {
      'Jméno': 'Marie',
      'Příjmení': 'Svobodová',
      'Email': 'marie.svobodova@email.cz',
      'Telefon': '+420 987 654 321',
      'Kategorie': 'Přátelé nevěsty',
      'Poznámky': 'Nejlepší kamarádka'
    },
    {
      'Jméno': 'Petr',
      'Příjmení': 'Dvořák',
      'Email': 'petr.dvorak@email.cz',
      'Telefon': '',
      'Kategorie': 'Kolegové ženicha',
      'Poznámky': ''
    }
  ]

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(templateData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Hosté')
    XLSX.writeFile(wb, 'vzor_hostů.xlsx')
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
      alert('Prosím vyberte Excel soubor (.xlsx nebo .xls)')
      return
    }

    setFile(selectedFile)
    processFile(selectedFile)
  }

  // Category mapping for display and processing
  const categoryMapping: { [key: string]: string } = {
    'Rodina nevěsty': 'family-bride',
    'Rodina ženicha': 'family-groom',
    'Přátelé nevěsty': 'friends-bride',
    'Přátelé ženicha': 'friends-groom',
    'Kolegové nevěsty': 'colleagues-bride',
    'Kolegové ženicha': 'colleagues-groom',
    'Ostatní': 'other',
    // Backward compatibility - simplified categories
    'Rodina': 'family-bride',
    'Přátelé': 'friends-bride',
    'Kolegové': 'colleagues-bride',
    // Also accept English versions for backward compatibility
    'family': 'family-bride',
    'friends': 'friends-bride',
    'colleagues': 'colleagues-bride',
    'other': 'other'
  }

  const categoryDisplayMapping: { [key: string]: string } = {
    'family-bride': 'Rodina nevěsty',
    'family-groom': 'Rodina ženicha',
    'friends-bride': 'Přátelé nevěsty',
    'friends-groom': 'Přátelé ženicha',
    'colleagues-bride': 'Kolegové nevěsty',
    'colleagues-groom': 'Kolegové ženicha',
    'other': 'Ostatní'
  }

  const processFile = async (file: File) => {
    setIsProcessing(true)
    setErrors([])

    try {
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      const processedData: GuestImportData[] = []
      const newErrors: ImportError[] = []

      jsonData.forEach((row: any, index: number) => {
        const rowNumber = index + 2 // Excel row number (header is row 1)
        
        // Required fields validation
        if (!row['Jméno'] || typeof row['Jméno'] !== 'string') {
          newErrors.push({
            row: rowNumber,
            field: 'Jméno',
            message: 'Jméno je povinné pole'
          })
        }

        if (!row['Příjmení'] || typeof row['Příjmení'] !== 'string') {
          newErrors.push({
            row: rowNumber,
            field: 'Příjmení',
            message: 'Příjmení je povinné pole'
          })
        }

        // Email validation (optional but if provided, must be valid)
        if (row['Email'] && typeof row['Email'] === 'string') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(row['Email'])) {
            newErrors.push({
              row: rowNumber,
              field: 'Email',
              message: 'Neplatný formát emailu'
            })
          }
        }

        // Category validation
        const validCzechCategories = ['Rodina nevěsty', 'Rodina ženicha', 'Přátelé nevěsty', 'Přátelé ženicha', 'Kolegové nevěsty', 'Kolegové ženicha', 'Ostatní']
        if (row['Kategorie'] && !categoryMapping[row['Kategorie']]) {
          newErrors.push({
            row: rowNumber,
            field: 'Kategorie',
            message: `Neplatná kategorie. Povolené: ${validCzechCategories.join(', ')}`
          })
        }

        // If no critical errors, add to processed data
        if (row['Jméno'] && row['Příjmení']) {
          processedData.push({
            firstName: String(row['Jméno']).trim(),
            lastName: String(row['Příjmení']).trim(),
            email: row['Email'] ? String(row['Email']).trim() : undefined,
            phone: row['Telefon'] ? String(row['Telefon']).trim() : undefined,
            category: row['Kategorie'] ? categoryMapping[row['Kategorie']] || 'other' : 'other',
            notes: row['Poznámky'] ? String(row['Poznámky']).trim() : undefined
          })
        }
      })

      setImportData(processedData)
      setErrors(newErrors)
      setStep('preview')
    } catch (error) {
      console.error('Error processing file:', error)
      alert('Chyba při zpracování souboru. Zkontrolujte, že je soubor ve správném formátu.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImport = async () => {
    if (errors.length > 0) {
      alert('Před importem opravte všechny chyby.')
      return
    }

    setIsProcessing(true)
    try {
      await importGuests(importData)
      setImportSuccess(true)
      setStep('complete')
    } catch (error) {
      console.error('Import error:', error)
      alert('Chyba při importu hostů. Zkuste to znovu.')
    } finally {
      setIsProcessing(false)
    }
  }

  const resetImport = () => {
    setFile(null)
    setImportData([])
    setErrors([])
    setImportSuccess(false)
    setStep('upload')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/guests"
                className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Import hostů</h1>
                <p className="text-gray-600">Importujte hosty ze souboru Excel</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 'upload' && (
          <div className="space-y-8">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <Info className="w-6 h-6 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Jak na import hostů</h3>
                  <div className="text-blue-800 space-y-2">
                    <p>1. Stáhněte si vzorovou tabulku a vyplňte údaje o hostech</p>
                    <p>2. Nahrajte vyplněný soubor pomocí tlačítka níže</p>
                    <p>3. Zkontrolujte náhled a potvrďte import</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Template download */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FileSpreadsheet className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Vzorová tabulka</h3>
                    <p className="text-gray-600">Stáhněte si vzor s ukázkovými daty</p>
                  </div>
                </div>
                <button
                  onClick={downloadTemplate}
                  className="btn-outline flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Stáhnout vzor</span>
                </button>
              </div>
            </div>

            {/* Required columns info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Požadované sloupce</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Jméno</span>
                    <span className="text-red-500">*</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Příjmení</span>
                    <span className="text-red-500">*</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    <span>Email</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    <span>Telefon</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    <span>Kategorie</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    <span>Poznámky</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="text-red-500">*</span> Povinné pole
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Kategorie:</strong> Rodina nevěsty, Rodina ženicha, Přátelé nevěsty, Přátelé ženicha, Kolegové nevěsty, Kolegové ženicha, Ostatní
                </p>
              </div>
            </div>

            {/* File upload */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Nahrajte soubor Excel</h3>
                <p className="text-gray-600 mb-6">Podporované formáty: .xlsx, .xls</p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="btn-primary flex items-center space-x-2 mx-auto"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isProcessing ? 'Zpracovávám...' : 'Vybrat soubor'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-6">
            {/* File info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-gray-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{file?.name}</h3>
                    <p className="text-gray-600">
                      {importData.length} hostů připraveno k importu
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetImport}
                  className="btn-outline flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Zrušit</span>
                </button>
              </div>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 mb-3">
                      Nalezeny chyby ({errors.length})
                    </h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {errors.map((error, index) => (
                        <div key={index} className="text-sm text-red-800">
                          <strong>Řádek {error.row}:</strong> {error.field} - {error.message}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preview table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Náhled dat</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jméno
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Příjmení
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Telefon
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kategorie
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {importData.slice(0, 10).map((guest, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {guest.firstName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {guest.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {guest.email || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {guest.phone || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {categoryDisplayMapping[guest.category] || guest.category}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {importData.length > 10 && (
                <div className="px-6 py-3 bg-gray-50 text-sm text-gray-600">
                  ... a dalších {importData.length - 10} hostů
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={resetImport}
                className="btn-outline"
              >
                Zpět
              </button>
              <button
                onClick={handleImport}
                disabled={errors.length > 0 || isProcessing}
                className="btn-primary flex items-center space-x-2"
              >
                <Users className="w-4 h-4" />
                <span>
                  {isProcessing ? 'Importuji...' : `Importovat ${importData.length} hostů`}
                </span>
              </button>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Import dokončen!</h2>
              <p className="text-gray-600">
                Úspěšně bylo importováno {importData.length} hostů.
              </p>
            </div>

            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={resetImport}
                className="btn-outline"
              >
                Importovat další
              </button>
              <Link
                href="/guests"
                className="btn-primary"
              >
                Zobrazit hosty
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
