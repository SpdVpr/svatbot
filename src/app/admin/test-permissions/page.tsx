'use client'

import { useState, useEffect } from 'react'
import { auth, db } from '@/config/firebase'
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function TestPermissionsPage() {
  const [user, setUser] = useState<any>(null)
  const [claims, setClaims] = useState<any>(null)
  const [testResults, setTestResults] = useState<any[]>([])
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        const tokenResult = await currentUser.getIdTokenResult()
        setClaims(tokenResult.claims)
      }
    })
    return () => unsubscribe()
  }, [])

  const runTests = async () => {
    setTesting(true)
    setTestResults([])
    const results: any[] = []

    // Test 1: Check if user is authenticated
    results.push({
      test: 'User Authentication',
      status: user ? 'success' : 'error',
      message: user ? `Authenticated as ${user.email}` : 'Not authenticated'
    })

    // Test 2: Check admin role
    const hasAdminRole = claims?.role === 'admin' || claims?.role === 'super_admin'
    results.push({
      test: 'Admin Role',
      status: hasAdminRole ? 'success' : 'error',
      message: hasAdminRole ? `Role: ${claims.role}` : 'No admin role found'
    })

    // Test 3: Try to create a test vendor
    try {
      const testVendor = {
        name: 'TEST VENDOR - DELETE ME',
        category: 'photographer',
        email: 'test@test.com',
        phone: '123456789',
        editToken: 'test-token-' + Date.now(),
        verified: false,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      const docRef = await addDoc(collection(db, 'marketplaceVendors'), testVendor)
      results.push({
        test: 'Create Test Vendor',
        status: 'success',
        message: `Created vendor with ID: ${docRef.id}`,
        vendorId: docRef.id
      })

      // Test 4: Try to delete the test vendor
      try {
        await deleteDoc(doc(db, 'marketplaceVendors', docRef.id))
        results.push({
          test: 'Delete Test Vendor',
          status: 'success',
          message: 'Successfully deleted test vendor'
        })
      } catch (deleteError: any) {
        results.push({
          test: 'Delete Test Vendor',
          status: 'error',
          message: `Failed to delete: ${deleteError.message}`,
          error: deleteError.code
        })
      }
    } catch (createError: any) {
      results.push({
        test: 'Create Test Vendor',
        status: 'error',
        message: `Failed to create: ${createError.message}`,
        error: createError.code
      })
    }

    setTestResults(results)
    setTesting(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Firebase Permissions Test</h1>

          {/* User Info */}
          {user && (
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <h2 className="font-semibold text-gray-900 mb-2">Current User</h2>
              <p className="text-sm text-gray-600">Email: {user.email}</p>
              <p className="text-sm text-gray-600">UID: {user.uid}</p>
              {claims && (
                <p className="text-sm text-gray-600">Role: {claims.role || 'none'}</p>
              )}
            </div>
          )}

          {/* Run Tests Button */}
          <button
            onClick={runTests}
            disabled={testing || !user}
            className="btn-primary mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? 'Testing...' : 'Run Permission Tests'}
          </button>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Results</h2>
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`rounded-lg p-4 border-2 ${
                    result.status === 'success'
                      ? 'bg-green-50 border-green-500'
                      : result.status === 'error'
                      ? 'bg-red-50 border-red-500'
                      : 'bg-yellow-50 border-yellow-500'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {result.status === 'success' ? (
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                    ) : result.status === 'error' ? (
                      <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-yellow-500 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{result.test}</h3>
                      <p className="text-sm text-gray-700 mt-1">{result.message}</p>
                      {result.error && (
                        <p className="text-xs text-red-600 mt-1 font-mono">Error code: {result.error}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 border-2 border-blue-500 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">What this test does:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
              <li>Checks if you're authenticated</li>
              <li>Checks if you have admin role in custom claims</li>
              <li>Tries to create a test vendor in marketplaceVendors collection</li>
              <li>Tries to delete the test vendor</li>
            </ol>
            <p className="mt-3 text-sm text-blue-700">
              If the delete test fails with "permission-denied", your admin role is not properly set in Firebase custom claims.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

