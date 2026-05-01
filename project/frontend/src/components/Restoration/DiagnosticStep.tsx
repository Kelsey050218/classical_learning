import React, { useState, useEffect } from 'react'
import { Button, message, Radio, Input, Spin } from 'antd'
import { getDiagnostics, submitDiagnostic, Diagnostic } from '../../api/restoration'

interface DiagnosticStepProps {
  chapterId: number
  onComplete: () => void
}

const DiagnosticStep: React.FC<DiagnosticStepProps> = ({ chapterId, onComplete }) => {
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([])
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [currentIdx, setCurrentIdx] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [previousCorrectCount, setPreviousCorrectCount] = useState(0)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const res = await getDiagnostics(chapterId)
        setDiagnostics(res.data)
      } catch (err) {
        message.error('加载诊断题目失败')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [chapterId])

  const currentDiag = diagnostics[currentIdx]

  const handleAnswer = (value: string) => {
    if (!currentDiag) return
    setAnswers(prev => ({ ...prev, [currentDiag.id]: value }))
    setFeedback(null)
  }

  const handleSubmit = async () => {
    if (!currentDiag) return
    const answer = answers[currentDiag.id]
    if (!answer?.trim()) {
      message.warning('请先作答')
      return
    }

    setSubmitting(true)
    try {
      // Submit all answers accumulated so far
      const allAnswers = { ...answers, [currentDiag.id]: answer }
      const res = await submitDiagnostic(chapterId, allAnswers)

      if (res.data.correct_count > previousCorrectCount) {
        // Current answer is correct
        setPreviousCorrectCount(res.data.correct_count)
        message.success('回答正确！')
        if (currentIdx < diagnostics.length - 1) {
          setCurrentIdx(prev => prev + 1)
        } else {
          // All questions answered correctly
          if (res.data.correct_count === diagnostics.length) {
            message.success('诊断完成，获得修复权限！')
            onComplete()
          }
        }
      } else {
        // Current answer is wrong
        setFeedback(currentDiag.hint || '回答有误，请再试一次')
        message.info('回答有误，请参考提示')
      }
    } catch (err) {
      message.error('提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="text-center py-12"><Spin /></div>
  if (!currentDiag) return null

  return (
    <div className="space-y-6">
      {/* Progress dots */}
      <div className="flex items-center gap-2 mb-4">
        {diagnostics.map((_, idx) => (
          <div
            key={idx}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
              idx < currentIdx ? 'bg-zhuqing text-white' :
              idx === currentIdx ? 'bg-zhusha text-white' :
              'bg-danmo-light text-danmo'
            }`}
          >
            {idx + 1}
          </div>
        ))}
      </div>

      <div className="bg-white/60 rounded-xl p-6 border border-[#D4A574]/30">
        <h4 className="text-lg font-medium text-[#2F2F2F] mb-4">
          {currentIdx + 1}. {currentDiag.content}
        </h4>

        {currentDiag.question_type === 'choice' && currentDiag.options ? (
          <Radio.Group
            value={answers[currentDiag.id]}
            onChange={e => handleAnswer(e.target.value)}
            className="flex flex-col gap-3"
          >
            {currentDiag.options.map((opt, idx) => (
              <Radio key={idx} value={opt} className="text-mohei">
                {opt}
              </Radio>
            ))}
          </Radio.Group>
        ) : (
          <Input
            placeholder="请输入答案..."
            value={answers[currentDiag.id] || ''}
            onChange={e => handleAnswer(e.target.value)}
            className="max-w-md"
          />
        )}
      </div>

      {feedback && (
        <div className="bg-[#FAF8F3] border-l-4 border-[#A52A2A] p-4 rounded-r-lg">
          <p className="text-sm text-[#8B7355] italic">{feedback}</p>
        </div>
      )}

      <Button
        type="primary"
        onClick={handleSubmit}
        loading={submitting}
        disabled={!answers[currentDiag.id]?.trim()}
        className="bg-zhusha hover:bg-zhusha-light"
      >
        {currentIdx < diagnostics.length - 1 ? '下一题' : '完成诊断'}
      </Button>
    </div>
  )
}

export default DiagnosticStep
