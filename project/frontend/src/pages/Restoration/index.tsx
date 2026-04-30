import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Typography, Spin, Empty, Progress } from 'antd'
import { BookOutlined } from '@ant-design/icons'
import Layout from '../../components/Layout'
import { listChapters, getProgress, RestorationChapter, Progress as RestorationProgress } from '../../api/restoration'
import { useRepairLevel } from '../../hooks/useRepairLevel'

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
  const completedCount = progressList.filter(p => p.current_step === 'completed').length
  const { name: levelName, color: levelColor } = useRepairLevel(completedCount)

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
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <Title level={2} className="font-display !mb-2">
            断简残编·经典复原室
          </Title>
          <Text className="text-danmo">
            跟着朱自清，修复十三部中华经典
          </Text>
        </div>

        {/* Stats bar */}
        <div className="flex items-center justify-between mb-8 p-4 rounded-xl bg-white/60 border border-[#D4A574]/30">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <Text className="text-danmo text-xs block">已完成</Text>
              <Text className="text-2xl font-bold text-[#2F2F2F]">{completedCount}/13</Text>
            </div>
            <div className="w-px h-10 bg-[#D4A574]/30" />
            <div className="text-center">
              <Text className="text-danmo text-xs block">修复师等级</Text>
              <Text className="text-lg font-bold" style={{ color: levelColor }}>{levelName}</Text>
            </div>
          </div>
          <Progress
            percent={Math.round((completedCount / 13) * 100)}
            strokeColor={levelColor}
            trailColor="#F5F2EB"
            size="small"
            className="w-40"
          />
        </div>

        {chapters.length === 0 ? (
          <Empty description="暂无典籍数据" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {chapters.map(ch => {
              const progress = progressMap[ch.id]
              const status = progress?.current_step || 'locked'
              const isCompleted = status === 'completed'
              const isLocked = status === 'locked'

              return (
                <button
                  key={ch.id}
                  onClick={() => !isLocked && navigate(`/restoration/${ch.id}`)}
                  disabled={isLocked}
                  className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                    isLocked
                      ? 'border-danmo-light bg-xuanzhi-warm/50 opacity-60 cursor-not-allowed'
                      : isCompleted
                      ? 'border-zhuqing bg-zhuqing-50 hover:shadow-card-hover'
                      : 'border-[#D4A574]/50 bg-white/80 hover:border-zhusha hover:shadow-card-hover'
                  }`}
                >
                  {isCompleted && (
                    <div className="absolute top-2 right-2 text-zhuqing">
                      <BookOutlined />
                    </div>
                  )}
                  <div className="text-xs px-2 py-0.5 rounded inline-block mb-2" style={{
                    backgroundColor: difficultyColors[ch.difficulty] + '20',
                    color: difficultyColors[ch.difficulty],
                  }}>
                    {difficultyLabels[ch.difficulty]}
                  </div>
                  <h3 className="font-medium text-[#2F2F2F] text-sm mb-1">{ch.name}</h3>
                  <p className="text-xs text-[#8B7355]">{ch.alias}</p>
                  {isLocked && (
                    <p className="text-xs text-danmo mt-2">待修复</p>
                  )}
                  {isCompleted && (
                    <p className="text-xs text-zhuqing mt-2">已复原</p>
                  )}
                  {!isLocked && !isCompleted && (
                    <p className="text-xs text-zhusha mt-2">修复中</p>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default RestorationHall
