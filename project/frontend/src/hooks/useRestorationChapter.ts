import { useState, useEffect } from 'react'
import { getChapter, RestorationChapter } from '../api/restoration'

export function useRestorationChapter(chapterId: number) {
  const [chapter, setChapter] = useState<RestorationChapter | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const res = await getChapter(chapterId)
        setChapter(res.data)
      } catch (err) {
        console.error('Failed to load chapter:', err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [chapterId])

  return { chapter, loading }
}
