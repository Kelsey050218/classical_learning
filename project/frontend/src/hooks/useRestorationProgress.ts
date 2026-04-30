import { useState, useEffect, useCallback } from 'react'
import { getProgress, Progress } from '../api/restoration'

export function useRestorationProgress() {
  const [progress, setProgress] = useState<Progress[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getProgress()
      setProgress(res.data)
    } catch (err) {
      console.error('Failed to load progress:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const progressMap = Object.fromEntries(progress.map(p => [p.chapter_id, p]))

  return { progress, progressMap, loading, refresh: fetch }
}
