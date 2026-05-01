import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Typography, Spin, Empty, Button } from 'antd'
import { BookOutlined, ArrowLeftOutlined } from '@ant-design/icons'
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
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/learning')}
          className="mb-4"
        >
          返回学习中心
        </Button>

        {/* Header */}
        <div className="text-center mb-10">
          <Title level={2} className="font-display !mb-2">
            断简残编·经典复原室
          </Title>
          <Text className="text-danmo">
            跟着朱自清，修复中华经典
          </Text>
        </div>

        {chapters.length === 0 ? (
          <Empty description="暂无典籍数据" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {chapters.map(ch => {
              const progress = progressMap[ch.id]
              const rawStatus = progress?.current_step
              const status = rawStatus && rawStatus !== 'locked'
                ? rawStatus
                : (ch.sort_order === minSortOrder ? 'diagnostic' : 'locked')
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
