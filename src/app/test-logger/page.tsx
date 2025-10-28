'use client'

import { useEffect } from 'react'
import logger from '@/lib/logger'

export default function TestLoggerPage() {
  useEffect(() => {
    // Test all logger methods
    logger.log('🔍 TEST: This is a log message (should be hidden in production)')
    logger.info('ℹ️ TEST: This is an info message (should be hidden in production)')
    logger.warn('⚠️ TEST: This is a warning message (should be hidden in production)')
    logger.error('❌ TEST: This is an error message (should ALWAYS be visible)')
    logger.debug('🐛 TEST: This is a debug message (should be hidden in production)')
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🔍 Logger Test Page
          </h1>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <h2 className="font-semibold text-blue-900 mb-2">Environment</h2>
              <p className="text-blue-800">
                <strong>NODE_ENV:</strong> {process.env.NODE_ENV}
              </p>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <h2 className="font-semibold text-green-900 mb-2">✅ Expected Behavior</h2>
              <ul className="list-disc list-inside text-green-800 space-y-1">
                <li><strong>Development:</strong> All logs visible in console</li>
                <li><strong>Production:</strong> Only error logs visible</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
              <h2 className="font-semibold text-yellow-900 mb-2">📋 Test Results</h2>
              <p className="text-yellow-800 mb-2">
                Open your browser console to see the test results:
              </p>
              <ul className="list-disc list-inside text-yellow-800 space-y-1">
                <li>🔍 Log message</li>
                <li>ℹ️ Info message</li>
                <li>⚠️ Warning message</li>
                <li>❌ Error message (always visible)</li>
                <li>🐛 Debug message</li>
              </ul>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
              <h2 className="font-semibold text-purple-900 mb-2">🧪 How to Test</h2>
              <div className="text-purple-800 space-y-2">
                <p><strong>1. Development Mode:</strong></p>
                <code className="block bg-purple-100 p-2 rounded text-sm">
                  npm run dev
                </code>
                <p className="text-sm">→ All 5 messages should appear in console</p>

                <p className="mt-4"><strong>2. Production Mode:</strong></p>
                <code className="block bg-purple-100 p-2 rounded text-sm">
                  npm run build && npm start
                </code>
                <p className="text-sm">→ Only the error message should appear</p>
              </div>
            </div>

            <div className="bg-gray-50 border-l-4 border-gray-500 p-4 rounded">
              <h2 className="font-semibold text-gray-900 mb-2">📊 Current Status</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Environment:</p>
                  <p className="font-mono font-bold text-gray-900">
                    {process.env.NODE_ENV}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Logger Mode:</p>
                  <p className="font-mono font-bold text-gray-900">
                    {process.env.NODE_ENV === 'production' ? 'Silent' : 'Verbose'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button
              onClick={() => {
                logger.log('🔍 Manual log test')
                logger.warn('⚠️ Manual warning test')
                logger.error('❌ Manual error test')
              }}
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-pink-500 text-white rounded-lg hover:from-primary-600 hover:to-pink-600 transition-all shadow-lg"
            >
              🧪 Run Manual Test
            </button>

            <a
              href="/"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

