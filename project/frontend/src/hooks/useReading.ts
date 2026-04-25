import { useState, useCallback } from 'react'
import { message } from 'antd'
import apiClient from '../api/client'

interface Annotation {
  id: number
  chapter_id: number
  quote?: string
  content: string
  created_at: string
}

interface Highlight {
  id: number
  chapter_id: number
  quote: string
  color: string
  created_at: string
}

interface UseReadingReturn {
  annotations: Annotation[]
  highlights: Highlight[]
  loading: boolean
  fetchAnnotations: (chapterId: number) => Promise<void>
  fetchHighlights: (chapterId: number) => Promise<void>
  createAnnotation: (chapterId: number, content: string, quote?: string) => Promise<void>
  createHighlight: (chapterId: number, quote: string, color?: string) => Promise<void>
  deleteAnnotation: (annotationId: number) => Promise<void>
  deleteHighlight: (highlightId: number) => Promise<void>
}

export const useReading = (): UseReadingReturn => {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [loading, setLoading] = useState(false)

  const fetchAnnotations = useCallback(async (chapterId: number) => {
    setLoading(true)
    try {
      const response = await apiClient.get(`/reading/chapters/${chapterId}/annotations`)
      setAnnotations(response.data)
    } catch (error) {
      message.error('加载批注失败')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchHighlights = useCallback(async (chapterId: number) => {
    setLoading(true)
    try {
      const response = await apiClient.get(`/reading/chapters/${chapterId}/highlights`)
      setHighlights(response.data)
    } catch (error) {
      message.error('加载高亮失败')
    } finally {
      setLoading(false)
    }
  }, [])

  const createAnnotation = useCallback(async (chapterId: number, content: string, quote?: string) => {
    setLoading(true)
    try {
      const response = await apiClient.post(`/reading/chapters/${chapterId}/annotations`, {
        content,
        quote,
      })
      setAnnotations(prev => [response.data, ...prev])
      message.success('批注已添加')
    } catch (error) {
      message.error('添加批注失败')
    } finally {
      setLoading(false)
    }
  }, [])

  const createHighlight = useCallback(async (chapterId: number, quote: string, color = 'yellow') => {
    setLoading(true)
    try {
      const response = await apiClient.post(`/reading/chapters/${chapterId}/highlights`, {
        quote,
        color,
      })
      setHighlights(prev => [response.data, ...prev])
      message.success('金句已收藏')
    } catch (error) {
      message.error('收藏失败')
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteAnnotation = useCallback(async (annotationId: number) => {
    setLoading(true)
    try {
      await apiClient.delete(`/reading/annotations/${annotationId}`)
      setAnnotations(prev => prev.filter(a => a.id !== annotationId))
      message.success('批注已删除')
    } catch (error) {
      message.error('删除批注失败')
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteHighlight = useCallback(async (highlightId: number) => {
    setLoading(true)
    try {
      await apiClient.delete(`/reading/highlights/${highlightId}`)
      setHighlights(prev => prev.filter(h => h.id !== highlightId))
      message.success('收藏已取消')
    } catch (error) {
      message.error('取消收藏失败')
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    annotations,
    highlights,
    loading,
    fetchAnnotations,
    fetchHighlights,
    createAnnotation,
    createHighlight,
    deleteAnnotation,
    deleteHighlight,
  }
}
