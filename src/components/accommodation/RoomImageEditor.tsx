'use client'

import { useState } from 'react'
import { Edit, Save, X } from 'lucide-react'
import RoomImageUpload from './RoomImageUpload'

interface RoomImageEditorProps {
  roomId: string
  roomName: string
  initialImages: string[]
  onSave: (images: string[]) => Promise<void>
  disabled?: boolean
}

export default function RoomImageEditor({
  roomId,
  roomName,
  initialImages,
  onSave,
  disabled = false
}: RoomImageEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [images, setImages] = useState<string[]>(initialImages)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    try {
      setSaving(true)
      await onSave(images)
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving room images:', error)
      alert('Chyba při ukládání fotek pokoje')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setImages(initialImages)
    setIsEditing(false)
  }

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Fotky pokoje</h3>
          {!disabled && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Upravit
            </button>
          )}
        </div>

        {initialImages.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {initialImages.map((image, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={image}
                  alt={`${roomName} - fotka ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Žádné fotky pokoje</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Upravit fotky pokoje</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCancel}
            disabled={saving}
            className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            Zrušit
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <div className="loading-spinner w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Uložit
          </button>
        </div>
      </div>

      <RoomImageUpload
        images={images}
        onImagesChange={setImages}
        maxImages={10}
        disabled={saving}
      />
    </div>
  )
}
