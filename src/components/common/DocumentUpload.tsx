'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { storage } from '@/config/firebase'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { DocumentType, Document } from '@/types/budget'
import {
  Upload,
  File,
  FileText,
  Image as ImageIcon,
  X,
  Download,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'

export type { DocumentType }
export type DocumentItem = Document

interface DocumentUploadProps {
  documents: DocumentItem[]
  onDocumentsChange: (documents: DocumentItem[]) => void
  maxFiles?: number
  maxFileSize?: number // in bytes
  acceptedTypes?: string[]
  folder?: string
  disabled?: boolean
}

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  'invoice': 'Faktura',
  'receipt': 'Účtenka',
  'contract': 'Smlouva',
  'quote': 'Nabídka',
  'delivery-note': 'Dodací list',
  'payment-proof': 'Doklad o platbě',
  'insurance': 'Pojištění',
  'license': 'Licence',
  'portfolio': 'Portfolio',
  'other': 'Ostatní'
}

const DEFAULT_ACCEPTED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]

export default function DocumentUpload({
  documents,
  onDocumentsChange,
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  folder = 'documents',
  disabled = false
}: DocumentUploadProps) {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  // Get file icon
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-5 h-5" />
    if (mimeType === 'application/pdf') return <FileText className="w-5 h-5" />
    return <File className="w-5 h-5" />
  }

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Check max files limit
    if (documents.length + files.length > maxFiles) {
      setError(`Můžete nahrát maximálně ${maxFiles} souborů`)
      return
    }

    setError(null)
    setUploading(true)
    setUploadProgress(0)

    try {
      const uploadedDocs: DocumentItem[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Validate file type
        if (!acceptedTypes.includes(file.type)) {
          throw new Error(`Nepodporovaný typ souboru: ${file.name}`)
        }

        // Validate file size
        if (file.size > maxFileSize) {
          throw new Error(`Soubor ${file.name} je příliš velký (max ${formatFileSize(maxFileSize)})`)
        }

        // Upload to Firebase Storage
        const timestamp = Date.now()
        const filename = `${folder}/${user?.id}/${timestamp}_${file.name.replace(/\s+/g, '_')}`
        const storageRef = ref(storage, filename)

        await uploadBytes(storageRef, file)
        const downloadURL = await getDownloadURL(storageRef)

        uploadedDocs.push({
          id: `doc-${timestamp}-${i}`,
          name: file.name,
          type: 'other', // Default type, user can change later
          url: downloadURL,
          size: file.size,
          mimeType: file.type,
          uploadedAt: new Date(),
          uploadedBy: user?.id || 'unknown',
          notes: ''
        })

        setUploadProgress(((i + 1) / files.length) * 100)
      }

      onDocumentsChange([...documents, ...uploadedDocs])
    } catch (err: any) {
      console.error('Error uploading documents:', err)
      setError(err.message || 'Chyba při nahrávání dokumentů')
    } finally {
      setUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Handle document delete
  const handleDelete = async (doc: DocumentItem) => {
    if (!window.confirm(`Opravdu chcete smazat dokument "${doc.name}"?`)) return

    try {
      // Delete from Firebase Storage
      const storageRef = ref(storage, doc.url)
      await deleteObject(storageRef)

      // Remove from list
      onDocumentsChange(documents.filter(d => d.id !== doc.id))
    } catch (err: any) {
      console.error('Error deleting document:', err)
      setError('Chyba při mazání dokumentu')
    }
  }

  // Handle document type change
  const handleTypeChange = (docId: string, newType: DocumentType) => {
    onDocumentsChange(
      documents.map(doc =>
        doc.id === docId ? { ...doc, type: newType } : doc
      )
    )
  }

  // Handle notes change
  const handleNotesChange = (docId: string, notes: string) => {
    onDocumentsChange(
      documents.map(doc =>
        doc.id === docId ? { ...doc, notes } : doc
      )
    )
  }

  return (
    <div className="space-y-4">
      {/* Upload button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploading}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading || documents.length >= maxFiles}
          className="btn-outline flex items-center space-x-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Nahrávání... {Math.round(uploadProgress)}%</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Nahrát dokumenty</span>
            </>
          )}
        </button>
        <p className="text-xs text-gray-500 mt-1">
          Maximálně {maxFiles} souborů, každý do {formatFileSize(maxFileSize)}
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Documents list */}
      {documents.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Nahrané dokumenty ({documents.length})
          </h4>
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="border border-gray-200 rounded-lg p-4 space-y-3"
            >
              {/* Document header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div className="text-gray-400 flex-shrink-0 mt-1">
                    {getFileIcon(doc.mimeType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {doc.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(doc.size)} • {new Date(doc.uploadedAt).toLocaleDateString('cs-CZ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary-600 transition-colors"
                    title="Stáhnout"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(doc)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Smazat"
                    disabled={disabled}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Document type selector */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Typ dokumentu
                </label>
                <select
                  value={doc.type}
                  onChange={(e) => handleTypeChange(doc.id, e.target.value as DocumentType)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={disabled}
                >
                  {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Poznámka (volitelné)
                </label>
                <input
                  type="text"
                  value={doc.notes || ''}
                  onChange={(e) => handleNotesChange(doc.id, e.target.value)}
                  placeholder="Např. Záloha 50%, Finální faktura..."
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={disabled}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {documents.length === 0 && !uploading && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">
            Zatím nebyly nahrány žádné dokumenty
          </p>
          <p className="text-xs text-gray-500">
            Klikněte na tlačítko výše pro nahrání
          </p>
        </div>
      )}
    </div>
  )
}

