'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function TestConnectionPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testConnection = async () => {
    setIsLoading(true)
    setError(null)
    setResponse(null)

    try {
      console.log('Testing connection to backend...')
      
      const res = await fetch('http://localhost:8000/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('Response status:', res.status)
      console.log('Response headers:', Object.fromEntries(res.headers.entries()))

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()
      console.log('Response data:', data)
      setResponse(data)
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Connection Test</h1>
          <p className="text-muted-foreground">
            Simple test to verify frontend can connect to backend
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Backend Connection Test</CardTitle>
            <CardDescription>
              Test if the frontend can successfully connect to the backend API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testConnection} 
              disabled={isLoading}
              className="mb-4"
            >
              {isLoading ? 'Testing...' : 'Test Connection'}
            </Button>
            
            {response && (
              <div className="mt-4">
                <Badge variant="secondary" className="mb-2">Success! Response:</Badge>
                <pre className="bg-green-50 border border-green-200 p-4 rounded-md text-sm overflow-auto">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            )}

            {error && (
              <div className="mt-4">
                <Badge variant="destructive" className="mb-2">Error:</Badge>
                <pre className="bg-red-50 border border-red-200 p-4 rounded-md text-sm overflow-auto text-red-700">
                  {error}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Frontend URL:</strong> http://localhost:3000</p>
              <p><strong>Backend URL:</strong> http://localhost:8000</p>
              <p><strong>Test Endpoint:</strong> http://localhost:8000/test</p>
              <p><strong>Check Console:</strong> Open browser dev tools to see detailed logs</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 