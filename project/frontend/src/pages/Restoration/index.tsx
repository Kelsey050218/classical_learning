import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Typography, Spin, Empty, Button, Progress } from 'antd'
import { BookOutlined, ArrowLeftOutlined, LockOutlined, ToolOutlined, CheckCircleOutlined } from '@ant-design/icons'
import Layout from '../../components/Layout'
import { listChapters, getProgress, RestorationChapter, Progress as RestorationProgress } from '../../api/restoration'

const { Title, Text } = Typography

const difficultyLabels: Record<string, string> = {
  easy: '基础',
  medium: '中等',
  hard: '较难',
}

const difficultyColors: Record<string, string> = {
  easy: '#5A9A6E',
  medium: '#F4A442',
  hard: '#C73E3A',
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode; bg: string; border: string }> = {
  locked: { label: '待修复', color: '#8C8C8C', icon: <LockOutlined />, bg: 'bg-gray-50', border: 'border-gray-200' },
  diagnostic: { label: '修复中', color: '#C73E3A', icon: <ToolOutlined />, bg: 'bg-white', border: 'border-[#D4A574]' },
  completed: { label: '已复原', color: '#5A9A6E', icon: <CheckCircleOutlined />, bg: 'bg-[#f0f9f4]', border: 'border-[#5A9A6E]' },
}

const RestorationHall: React.FC = () => {
  const navigate = useNavigate()
  const [chapters, setChapters] = useState<RestorationChapter[]>([])
  const [progressList, setProgressList] = useState<RestorationProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [chRes, prRes] = await Promise.all([listChapters(), getProgress()])
        setChapters(chRes.data)
        setProgressList(prRes.data)
      } catch (err) {
        console.error('Failed to load restoration hall:', err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const progressMap = Object.fromEntries(progressList.map(p => [p.chapter_id, p]))
  const minSortOrder = chapters.length > 0 ? Math.min(...chapters.map(c => c.sort_order)) : 0
  const completedSortOrders = chapters
    .filter(c => progressMap[c.id]?.current_step === 'completed')
    .map(c => c.sort_order)
  const maxCompletedSortOrder = completedSortOrders.length > 0 ? Math.max(...completedSortOrders) : -Infinity

  const getStepProgress = (step: string) => {
    const steps = ['locked', 'diagnostic', 'fragment', 'reorder', 'network', 'annotation', 'completed']
    const idx = steps.indexOf(step)
    return idx >= 0 ? Math.round((idx / (steps.length - 1)) * 100) : 0
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Spin size="large" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8 relative min-h-[calc(100vh-160px)]">
        {/* Background - same as Learning center */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-screen h-full bg-cover bg-center opacity-[0.30] pointer-events-none"
          style={{ backgroundImage: 'url(https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/images/backgrounds/learning.png)' }}
        />

        <div className="relative z-10">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/learning')}
          className="mb-6 hover:text-zhusha transition-colors"
        >
          返回学习中心
        </Button>

        {/* Header */}
        <div className="text-center mb-12 relative">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#D4A574]" />
            <BookOutlined className="text-2xl text-[#D4A574]" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#D4A574]" />
          </div>
          <Title level={2} className="font-display !mb-3 !text-[#2F2F2F]">
            断简残编·经典复原室
          </Title>
          <Text className="text-danmo text-base">
            跟着朱自清，修复中华经典
          </Text>
          <div className="mt-4 flex justify-center gap-6 text-sm text-danmo">
            <span className="flex items-center gap-1"><LockOutlined /> 待修复</span>
            <span className="flex items-center gap-1"><ToolOutlined className="text-zhusha" /> 修复中</span>
            <span className="flex items-center gap-1"><CheckCircleOutlined className="text-zhuqing" /> 已复原</span>
          </div>
        </div>

        {chapters.length === 0 ? (
          <Empty description="暂无典籍数据" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {chapters.map(ch => {
              const progress = progressMap[ch.id]
              const rawStatus = progress?.current_step
              const isUnlockedBySequence =
                ch.sort_order === minSortOrder || ch.sort_order <= maxCompletedSortOrder + 1
              const status = rawStatus && rawStatus !== 'locked'
                ? rawStatus
                : (isUnlockedBySequence ? 'diagnostic' : 'locked')
              const isCompleted = status === 'completed'
              const isLocked = status === 'locked'
              const cfg = statusConfig[status] || statusConfig.locked
              const stepProgress = getStepProgress(status)

              return (
                <div
                  key={ch.id}
                  onClick={() => !isLocked && navigate(`/restoration/${ch.id}`)}
                  className={`group relative rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                    isLocked
                      ? 'cursor-not-allowed'
                      : 'cursor-pointer hover:-translate-y-1 hover:shadow-xl'
                  } ${cfg.bg} ${cfg.border}`}
                  style={{ borderColor: isLocked ? undefined : cfg.border.replace('border-[', '').replace(']', '') }}
                >
                  {/* Image */}
                  <div className="relative h-40 bg-gradient-to-br from-[#f5f0e8] to-[#e8dfd0] overflow-hidden">
                    {ch.image_url ? (
                      <img
                        src={ch.image_url}
                        alt={ch.name}
                        className={`w-full h-full object-cover transition-transform duration-500 ${
                          isLocked ? 'grayscale' : 'group-hover:scale-105'
                        }`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOutlined className="text-5xl text-[#D4A574]/40" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium shadow-sm" style={{
                        backgroundColor: difficultyColors[ch.difficulty] + '25',
                        color: difficultyColors[ch.difficulty],
                        backdropFilter: 'blur(4px)',
                      }}>
                        {difficultyLabels[ch.difficulty]}
                      </span>
                    </div>
                    {isCompleted && (
                      <div className="absolute inset-0 bg-[#5A9A6E]/10 flex items-center justify-center">
                        <div className="bg-white/90 rounded-full p-2 shadow-md">
                          <CheckCircleOutlined className="text-2xl text-[#5A9A6E]" />
                        </div>
                      </div>
                    )}
                    {isLocked && (
                      <div className="absolute inset-0 bg-[#2F2F2F]/35 flex items-center justify-center">
                        <div className="bg-white/90 rounded-full p-3 shadow-md">
                          <LockOutlined className="text-2xl text-[#8C8C8C]" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-display font-semibold text-lg text-[#2F2F2F] mb-1">{ch.name}</h3>
                    <p className="text-sm text-[#8B7355] mb-3">{ch.alias}</p>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: cfg.color }}>
                          {cfg.icon} {cfg.label}
                        </span>
                        <span className="text-xs text-danmo">{stepProgress}%</span>
                      </div>
                      <Progress
                        percent={stepProgress}
                        size="small"
                        showInfo={false}
                        strokeColor={cfg.color}
                        trailColor={isLocked ? '#e8e4dc' : '#f0ebe3'}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        </div>
      </div>
    </Layout>
  )
}

export default RestorationHall
