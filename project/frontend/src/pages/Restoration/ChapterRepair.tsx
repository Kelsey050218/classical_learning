import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Typography, Spin, Button, message } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import Layout from '../../components/Layout'
import RepairStepper from '../../components/Restoration/RepairStepper'
import DiagnosticStep from '../../components/Restoration/DiagnosticStep'
import FragmentSortStep from '../../components/Restoration/FragmentSortStep'
import NodeSequenceStep from '../../components/Restoration/NodeSequenceStep'
import ArchiveCardStep from '../../components/Restoration/ArchiveCardStep'
import { getChapter, getProgress, RestorationChapter, Progress } from '../../api/restoration'

const { Title, Text } = Typography

const STEP_COMPONENTS: Record<string, React.FC<{ chapterId: number; onComplete: () => void }>> = {
  diagnostic: DiagnosticStep,
  sorting: FragmentSortStep,
  sequencing: NodeSequenceStep,
  archive: ArchiveCardStep,
}

const ChapterRepair: React.FC = () => {
  const { chapterId } = useParams()
  const navigate = useNavigate()
  const [chapter, setChapter] = useState<RestorationChapter | null>(null)
  const [progress, setProgress] = useState<Progress | null>(null)
  const [loading, setLoading] = useState(true)

  const id = Number(chapterId)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const [chRes, prRes] = await Promise.all([getChapter(id), getProgress()])
        setChapter(chRes.data)
        const p = prRes.data.find(p => p.chapter_id === id)
        setProgress(p || null)
      } catch (err) {
        message.error('加载数据失败')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const currentStep = progress?.current_step === 'completed'
    ? 'archive'
    : (progress?.current_step || 'diagnostic')

  const handleStepComplete = () => {
    // Refresh progress after step completion
    getProgress().then(res => {
      const p = res.data.find(p => p.chapter_id === id)
      setProgress(p || null)
    })
  }

  const StepComponent = STEP_COMPONENTS[currentStep] || DiagnosticStep

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Spin size="large" />
        </div>
      </Layout>
    )
  }

  if (!chapter) {
    return (
      <Layout>
        <div className="text-center py-12">典籍不存在</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/restoration')}
          className="mb-4"
        >
          返回复原室
        </Button>

        <div className="mb-6">
          <Title level={3} className="font-display !mb-1">
            {chapter.alias}
          </Title>
          <Text className="text-danmo">{chapter.description}</Text>
        </div>

        <RepairStepper currentStep={currentStep} />

        {progress?.current_step === 'completed' ? (
          <div className="text-center py-12">
            <p className="text-zhuqing text-lg font-medium mb-4">该典籍已修复完成！</p>
            <Button onClick={() => navigate('/restoration')}>
              返回复原室
            </Button>
          </div>
        ) : (
          <StepComponent chapterId={id} onComplete={handleStepComplete} />
        )}
      </div>
    </Layout>
  )
}

export default ChapterRepair
