import React, { useState, useEffect } from 'react'
import { Button, message, Input } from 'antd'
import { getArchive, saveNote, ArchiveData } from '../../api/restoration'
import ArchiveCard from './ArchiveCard'

interface ArchiveCardStepProps {
  chapterId: number
  onComplete: () => void
}

const ArchiveCardStep: React.FC<ArchiveCardStepProps> = ({ chapterId, onComplete }) => {
  const [data, setData] = useState<ArchiveData | null>(null)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const res = await getArchive(chapterId)
        setData(res.data)
        setNote(res.data.note || '')
      } catch (err) {
        message.error('加载档案卡失败')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [chapterId])

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveNote(chapterId, note)
      message.success('档案已收入档案馆！')
      onComplete()
    } catch (err) {
      message.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !data) return <div className="text-center py-12">加载中...</div>

  return (
    <div className="space-y-6">
      <ArchiveCard data={data} />

      <div className="bg-white/60 rounded-xl p-4 border border-[#D4A574]/30">
        <p className="text-sm font-medium text-[#2F2F2F] mb-2">我的修复笔记</p>
        <Input.TextArea
          value={note}
          onChange={e => setNote(e.target.value)}
          maxLength={200}
          rows={4}
          placeholder="写下你对这部经典的理解..."
          className="mb-2"
        />
        <div className="flex justify-between items-center">
          <span className="text-xs text-[#8B7355]">{note.length}/200</span>
          <Button
            type="primary"
            onClick={handleSave}
            loading={saving}
            className="bg-zhusha hover:bg-zhusha-light"
          >
            收入档案馆
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ArchiveCardStep
