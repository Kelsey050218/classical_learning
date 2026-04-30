import React, { useState, useEffect } from 'react'
import { Button, message } from 'antd'
import { getFragments, submitFragments, Fragment } from '../../api/restoration'

const BINS = [
  { key: 'era', label: '时代脉络', color: '#8B6914' },
  { key: 'author', label: '作者编者', color: '#2E5C8A' },
  { key: 'content', label: '核心内容', color: '#556B2F' },
  { key: 'style', label: '文体特征', color: '#8B4513' },
  { key: 'impact', label: '历史影响', color: '#C73E3A' },
]

interface FragmentSortStepProps {
  chapterId: number
  onComplete: () => void
}

const FragmentSortStep: React.FC<FragmentSortStepProps> = ({ chapterId, onComplete }) => {
  const [fragments, setFragments] = useState<Fragment[]>([])
  const [placements, setPlacements] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ correct: number; total: number } | null>(null)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const res = await getFragments(chapterId)
        setFragments(res.data)
      } catch (err) {
        message.error('加载碎片失败')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [chapterId])

  const handleDragStart = (e: React.DragEvent, fragmentId: number) => {
    e.dataTransfer.setData('fragmentId', String(fragmentId))
  }

  const handleDrop = (e: React.DragEvent, binKey: string) => {
    e.preventDefault()
    const fragmentId = Number(e.dataTransfer.getData('fragmentId'))
    setPlacements(prev => ({ ...prev, [fragmentId]: binKey }))
    setResult(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleSubmit = async () => {
    if (Object.keys(placements).length < fragments.length) {
      message.warning('请将所有碎片归类')
      return
    }
    setSubmitting(true)
    try {
      const res = await submitFragments(chapterId, placements)
      setResult({ correct: res.data.correct_count, total: res.data.total })
      if (res.data.correct_count === res.data.total) {
        message.success('碎片归筐完成！')
        onComplete()
      } else {
        message.warning(`正确 ${res.data.correct_count}/${res.data.total}，请调整错误碎片`)
      }
    } catch (err) {
      message.error('提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  const unplacedFragments = fragments.filter(f => !placements[f.id])
  const placedFragments = (binKey: string) => fragments.filter(f => placements[f.id] === binKey)

  if (loading) return <div className="text-center py-12">加载中...</div>

  return (
    <div className="space-y-6">
      {/* Fragment pool */}
      <div className="bg-white/60 rounded-xl p-4 border border-[#D4A574]/30 min-h-[120px]">
        <p className="text-sm text-danmo mb-3">碎片池（拖拽到下方分类筐）</p>
        <div className="flex flex-wrap gap-2">
          {unplacedFragments.map(f => (
            <div
              key={f.id}
              draggable
              onDragStart={e => handleDragStart(e, f.id)}
              className="px-3 py-2 rounded-lg bg-[#FAF8F3] border border-[#D4A574]/50 text-sm text-[#2F2F2F] cursor-move hover:shadow-md transition-shadow"
            >
              {f.content}
            </div>
          ))}
          {unplacedFragments.length === 0 && (
            <p className="text-sm text-danmo">所有碎片已归类</p>
          )}
        </div>
      </div>

      {/* Bins */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {BINS.map(bin => {
          const items = placedFragments(bin.key)
          return (
            <div
              key={bin.key}
              onDrop={e => handleDrop(e, bin.key)}
              onDragOver={handleDragOver}
              className="rounded-xl border-2 border-dashed p-3 min-h-[160px] transition-colors"
              style={{ borderColor: bin.color + '40' }}
            >
              <div className="text-center mb-3">
                <span className="text-xs font-medium px-2 py-1 rounded" style={{
                  backgroundColor: bin.color + '15',
                  color: bin.color,
                }}>
                  {bin.label}
                </span>
              </div>
              <div className="space-y-2">
                {items.map(f => (
                  <div
                    key={f.id}
                    draggable
                    onDragStart={e => handleDragStart(e, f.id)}
                    className="px-2 py-1.5 rounded bg-white border text-xs cursor-move"
                    style={{ borderColor: bin.color + '30' }}
                  >
                    {f.content}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {result && (
        <div className={`text-center p-3 rounded-lg ${
          result.correct === result.total ? 'bg-zhuqing-50 text-zhuqing' : 'bg-zhusha-50 text-zhusha'
        }`}>
          正确 {result.correct}/{result.total}
        </div>
      )}

      <Button
        type="primary"
        onClick={handleSubmit}
        loading={submitting}
        className="bg-zhusha hover:bg-zhusha-light w-full md:w-auto"
      >
        碎片整理完毕
      </Button>
    </div>
  )
}

export default FragmentSortStep
