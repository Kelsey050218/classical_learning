import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Typography, Spin, Empty, Tag, message, Modal } from 'antd'
import {
  BookOutlined,
  HistoryOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  EditOutlined,
} from '@ant-design/icons'
import Layout from '../../components/Layout'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import EvaluationForm from '../../components/EvaluationForm'
import { listTimelineNodes } from '../../api/timelineNodes'
import { completeSubProject } from '../../api/learning'

const { Title, Text } = Typography

interface TimelineNode {
  id: number
  era: string
  period: string
  title: string
  content: string
  key_points: string[]
  sort_order: number
}

const eraColors: Record<string, string> = {
  '先秦': 'bg-shiqing text-white border-shiqing-dark',
  '汉代': 'bg-zhusha text-white border-zhusha-light',
  '魏晋南北朝': 'bg-tenghuang text-white border-tenghuang-dark',
  '唐代': 'bg-zhuqing text-white border-zhuqing-dark',
  '宋代': 'bg-shiqing-dark text-white border-shiqing',
  '元代': 'bg-danmo text-white border-danmo-light',
}

const TimelinePage: React.FC = () => {
  const navigate = useNavigate()
  const [nodes, setNodes] = useState<TimelineNode[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNode, setSelectedNode] = useState<TimelineNode | null>(null)
  const [completed, setCompleted] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [evalVisible, setEvalVisible] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const res = await listTimelineNodes()
        setNodes(res.data)
      } catch (err) {
        console.error('Failed to load timeline nodes:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchNodes()
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -400 : 400
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' })
    }
  }

  const handleComplete = async () => {
    setCompleting(true)
    try {
      await completeSubProject(1)
      message.success('项目一已完成！')
      setCompleted(true)
      setEvalVisible(true)
    } catch (err: any) {
      if (err?.response?.status === 400) {
        message.info('该项目已完成')
        setCompleted(true)
        setEvalVisible(true)
      } else {
        message.error('操作失败')
      }
    } finally {
      setCompleting(false)
    }
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-shiqing rounded-lg mb-4">
            <HistoryOutlined className="text-3xl text-white" />
          </div>
          <Title level={2} className="font-display !mb-2">
            典籍时间轴
          </Title>
          <Text className="text-danmo">
            从先秦到元代，追溯中国古典诗歌的发展脉络
          </Text>
        </div>

        {nodes.length === 0 ? (
          <Empty description="暂无时间轴数据" />
        ) : (
          <>
            {/* Horizontal Timeline */}
            <div className="relative mb-8">
              {/* Scroll buttons */}
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 rounded-full shadow-md flex items-center justify-center hover:bg-white transition-colors"
              >
                <ArrowLeftOutlined className="text-mohei" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 rounded-full shadow-md flex items-center justify-center hover:bg-white transition-colors"
              >
                <ArrowRightOutlined className="text-mohei" />
              </button>

              <div
                ref={scrollRef}
                className="overflow-x-auto pb-8 px-12 hide-scrollbar"
                style={{ scrollbarWidth: 'none' }}
              >
                <div className="relative min-w-max">
                  {/* Central line */}
                  <div className="absolute left-0 right-0 top-1/2 h-1 bg-gradient-to-r from-danmo-light via-danmo to-danmo-light rounded-full transform -translate-y-1/2"
                        style={{ top: '50%' }} />

                  <div className="flex items-center gap-16 py-16">
                    {nodes.map((node, idx) => {
                      const isTop = idx % 2 === 0
                      const colorClass = eraColors[node.era] || 'bg-shiqing text-white border-shiqing-dark'
                      const isSelected = selectedNode?.id === node.id

                      return (
                        <div key={node.id} className="relative flex flex-col items-center">
                          {/* Node above or below line */}
                          <div className={`flex flex-col items-center ${isTop ? 'pb-8' : 'pt-8'}`}>
                            {isTop && (
                              <>
                                <div
                                  className={`mb-3 p-4 rounded-xl shadow-md border-2 transition-all cursor-pointer max-w-[220px] ${
                                    isSelected ? 'border-zhusha bg-zhusha-50 scale-105' : 'border-transparent bg-white hover:shadow-lg'
                                  }`}
                                  onClick={() => setSelectedNode(isSelected ? null : node)}
                                >
                                  <Text className="text-sm font-medium text-mohei block mb-1">{node.title}</Text>
                                  <Text className="text-xs text-danmo">{node.period}</Text>
                                </div>
                                <div className="w-px h-6 bg-danmo" />
                              </>
                            )}

                            {/* Circle stamp */}
                            <button
                              onClick={() => setSelectedNode(isSelected ? null : node)}
                              className={`w-14 h-14 rounded-full flex items-center justify-center text-xs font-bold border-2 shadow-lg transition-all hover:scale-110 ${colorClass} ${
                                isSelected ? 'ring-4 ring-zhusha/30 scale-110' : ''
                              }`}
                            >
                              {node.era.slice(0, 2)}
                            </button>

                            {!isTop && (
                              <>
                                <div className="w-px h-6 bg-danmo" />
                                <div
                                  className={`mt-3 p-4 rounded-xl shadow-md border-2 transition-all cursor-pointer max-w-[220px] ${
                                    isSelected ? 'border-zhusha bg-zhusha-50 scale-105' : 'border-transparent bg-white hover:shadow-lg'
                                  }`}
                                  onClick={() => setSelectedNode(isSelected ? null : node)}
                                >
                                  <Text className="text-sm font-medium text-mohei block mb-1">{node.title}</Text>
                                  <Text className="text-xs text-danmo">{node.period}</Text>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Detail Card */}
            {selectedNode && (
              <Card className="mb-8 animate-fadeIn">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Tag color="blue">{selectedNode.era}</Tag>
                    <Text className="text-danmo">{selectedNode.period}</Text>
                  </div>
                  <Title level={4} className="font-display !mb-1">
                    {selectedNode.title}
                  </Title>
                  <Text className="text-mohei leading-relaxed block">
                    {selectedNode.content}
                  </Text>
                  {selectedNode.key_points && selectedNode.key_points.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedNode.key_points.map((point, idx) => (
                        <Tag key={idx} icon={<BookOutlined />} color="processing">
                          {point}
                        </Tag>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Complete button */}
            <div className="text-center py-8 border-t border-danmo-light">
              {completed ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-zhuqing">
                    <CheckCircleOutlined />
                    <Text className="text-zhuqing font-medium">已完成典籍时间轴学习</Text>
                  </div>
                  <Button customVariant="ghost" customSize="sm" onClick={() => navigate('/learning')}>
                    返回学习中心
                  </Button>
                </div>
              ) : (
                <Button
                  customVariant="primary"
                  onClick={handleComplete}
                  loading={completing}
                >
                  <EditOutlined /> 完成典籍时间轴学习
                </Button>
              )}
            </div>
          </>
        )}
      </div>

      <Modal
        title="项目评价量表"
        open={evalVisible}
        onCancel={() => setEvalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <EvaluationForm
          projectId={1}
          onSaved={() => {
            setEvalVisible(false)
            navigate('/learning')
          }}
        />
      </Modal>
    </Layout>
  )
}

export default TimelinePage
