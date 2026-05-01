import React, { useState, useEffect } from 'react'
import { Button, message } from 'antd'
import { getNodes, submitNodes, Node } from '../../api/restoration'

interface NodeSequenceStepProps {
  chapterId: number
  onComplete: () => void
}

const NodeSequenceStep: React.FC<NodeSequenceStepProps> = ({ chapterId, onComplete }) => {
  const [nodes, setNodes] = useState<Node[]>([])
  const [order, setOrder] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [wrongPositions, setWrongPositions] = useState<number[]>([])

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const res = await getNodes(chapterId)
        setNodes(res.data)
        setOrder(res.data.map(n => n.id))
      } catch (err) {
        message.error('加载节点失败')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [chapterId])

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('fromIndex', String(index))
  }

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault()
    const fromIndex = Number(e.dataTransfer.getData('fromIndex'))
    if (fromIndex === toIndex) return
    const newOrder = [...order]
    const [moved] = newOrder.splice(fromIndex, 1)
    newOrder.splice(toIndex, 0, moved)
    setOrder(newOrder)
    setWrongPositions([])
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await submitNodes(chapterId, order)
      if (res.data.is_correct) {
        message.success('脉络排序正确！')
        onComplete()
      } else {
        setWrongPositions(res.data.wrong_positions)
        message.warning(`有 ${res.data.wrong_positions.length} 个节点位置错误，请调整`)
      }
    } catch (err) {
      message.error('提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setOrder(nodes.map(n => n.id))
    setWrongPositions([])
  }

  if (loading) return <div className="text-center py-12">加载中...</div>

  return (
    <div className="space-y-6">
      <p className="text-sm text-danmo">将节点按正确的时间/逻辑顺序排列</p>

      {/* Timeline line */}
      <div className="relative py-4">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#D4A574]/30 -translate-y-1/2" />
        <div className="relative flex items-center justify-between gap-2">
          {order.map((nodeId, idx) => {
            const node = nodes.find(n => n.id === nodeId)
            if (!node) return null
            const isWrong = wrongPositions.includes(idx)
            return (
              <div
                key={nodeId}
                draggable
                onDragStart={e => handleDragStart(e, idx)}
                onDrop={e => handleDrop(e, idx)}
                onDragOver={handleDragOver}
                className={`relative z-10 flex-1 min-w-0 px-3 py-4 rounded-lg border-2 text-center cursor-move transition-all ${
                  isWrong
                    ? 'border-[#C73E3A] bg-[#FDF2F2]'
                    : 'border-[#D4A574]/50 bg-white hover:border-[#A52A2A]'
                }`}
              >
                <p className="text-xs text-[#2F2F2F] leading-relaxed">{node.content}</p>
                {isWrong && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#C73E3A] text-white text-xs flex items-center justify-center">
                    ✕
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={submitting}
          className="bg-zhusha hover:bg-zhusha-light"
        >
          确认排序
        </Button>
        <Button onClick={handleReset}>重置</Button>
      </div>
    </div>
  )
}

export default NodeSequenceStep
