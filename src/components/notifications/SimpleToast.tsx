'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
}

const toastColors = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800'
}

let toastCounter = 0
const toastListeners: ((toasts: Toast[]) => void)[] = []
let currentToasts: Toast[] = []

export const showSimpleToast = (
  type: 'success' | 'error' | 'warning' | 'info',
  title: string,
  message: string,
  duration = 5000
) => {
  const id = `toast-${++toastCounter}`
  const toast: Toast = { id, type, title, message, duration }
  
  currentToasts = [...currentToasts, toast]
  toastListeners.forEach(listener => listener(currentToasts))
  
  // Auto remove
  setTimeout(() => {
    removeToast(id)
  }, duration)
}

const removeToast = (id: string) => {
  currentToasts = currentToasts.filter(t => t.id !== id)
  toastListeners.forEach(listener => listener(currentToasts))
}

export default function SimpleToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setToasts(newToasts)
    }
    
    toastListeners.push(listener)
    
    return () => {
      const index = toastListeners.indexOf(listener)
      if (index > -1) {
        toastListeners.splice(index, 1)
      }
    }
  }, [])

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => {
        const Icon = toastIcons[toast.type]
        
        return (
          <div
            key={toast.id}
            className={`max-w-sm w-full bg-white shadow-lg rounded-lg border-l-4 p-4 ${toastColors[toast.type]} animate-in slide-in-from-right duration-300`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">{toast.title}</p>
                <p className="text-sm mt-1 opacity-90">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
