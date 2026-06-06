/**
 * useAnalysis Hook
 * Integration with BookCraft AI analysis API
 */

import { useState } from 'react'
import api from '@/utils/api'

export const useAnalysis = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  const analyzeText = async (text: string, authorId?: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.post('/analysis/analyze', { text, authorId })
      setResult(response.data.data)
      return response.data.data
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to analyze text'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const processText = async (text: string, style?: string, authorId?: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.post('/analysis/process', { text, style, authorId })
      setResult(response.data.data)
      return response.data.data
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to process text'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const detectChapters = async (text: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.post('/analysis/detect-chapters', { text })
      setResult(response.data.data)
      return response.data.data
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to detect chapters'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const detectStyle = async (text: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.post('/analysis/detect-style', { text })
      setResult(response.data.data)
      return response.data.data
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to detect style'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    result,
    analyzeText,
    processText,
    detectChapters,
    detectStyle
  }
}
