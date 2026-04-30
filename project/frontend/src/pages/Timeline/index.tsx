import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Typography, Spin, Empty, message, Modal } from 'antd'
import {
  BookOutlined,
  SoundOutlined,
  FileTextOutlined,
  TeamOutlined,
  StarOutlined,
  ReadOutlined,
  FireOutlined,
  RiseOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  EditOutlined,
} from '@ant-design/icons'
import Layout from '../../components/Layout'
import Button from '../../components/UI/Button'
import EvaluationForm from '../../components/EvaluationForm'
import { completeSubProject } from '../../api/learning'
import { TIMELINE_ERAS } from '../../data/timelineEras'
import { getConnectionsForEra } from '../../data/timelineEras'
import useTimelineMarks from '../../hooks/useTimelineMarks'
import EraCard from '../../components/Timeline/EraCard'
import EraDetailPanel from '../../components/Timeline/EraDetailPanel'
import StreamToggle from '../../components/Timeline/StreamToggle'
import StreamLayer from '../../components/Timeline/StreamLayer'
import TransitionMarker from '../../components/Timeline/TransitionMarker'

const { Title, Text } = Typography

const eraIcons: Record<string, React.ReactNode> = {
  '先秦': <SoundOutlined />,
  '汉代': <FileTextOutlined />,
  '魏晋南北朝': <TeamOutlined />,
  '唐代': <StarOutlined />,
  '宋代': <ReadOutlined />,
  '元代': <FireOutlined />,
  '明清': <RiseOutlined />,
}

const eraGradients: Record<string, string> = {
  '先秦': 'from-[#8B6914]/20 to-[#D4A843]/10',
  '汉代': 'from-[#8B4513]/20 to-[#CD853F]/10',
  '魏晋南北朝': 'from-[#556B2F]/20 to-[#8FBC8F]/10',
  '唐代': 'from-[#8B0000]/20 to-[#CD5C5C]/10',
  '宋代': 'from-[#2F4F4F]/20 to-[#5F9EA0]/10',
  '元代': 'from-[#483D8B]/20 to-[#9370DB]/10',
  '明清': 'from-[#800080]/20 to-[#DA70D6]/10',
}

const eraBorderColors: Record<string, string> = {
  '先秦': 'border-[#8B6914]/30',
  '汉代': 'border-[#8B4513]/30',
  '魏晋南北朝': 'border-[#556B2F]/30',
  '唐代': 'border-[#8B0000]/30',
  '宋代': 'border-[#2F4F4F]/30',
  '元代': 'border-[#483D8B]/30',
  '明清': 'border-[#800080]/30',
}

const TimelinePage: React.FC = () => {
  const navigate = useNavigate()
  const [loading] = useState(false)
  const [selectedEraId, setSelectedEraId] = useState<string | null>(null)
  const [showStreamLayer, setShowStreamLayer] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [evalVisible, setEvalVisible] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const detailRef = useRef<HTMLDivElement>(null)
  const eraCardRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const { marks, updateMark, isMarked } = useTimelineMarks()

  const eras = TIMELINE_ERAS
  const topRow = eras.slice(0, Math.ceil(eras.length / 2))
  const bottomRow = eras.slice(Math.ceil(eras.length / 2)).reverse()

  const selectedEra = eras.find(e => e.id === selectedEraId) || null
  const prevEra = selectedEraId
    ? eras[eras.findIndex(e => e.id === selectedEraId) - 1]
    : undefined

  useEffect(() => {
    if (selectedEra && detailRef.current) {
      setTimeout(() => {
        detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [selectedEra])

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

  const handleEraClick = (eraId: string) => {
    setSelectedEraId(prev => (prev === eraId ? null : eraId))
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
      <div className="relative -mx-4 -my-6 px-4 py-6 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 min-h-[calc(100vh-4rem)]">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-screen h-full bg-cover bg-center opacity-[0.30] pointer-events-none"
          style={{ backgroundImage: 'url(https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/images/backgrounds/learning.png)' }}
        />
        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Title level={2} className="font-display !mb-2" style={{ color: '#2F2F2F' }}>
              经典常谈 · 典籍时间轴
            </Title>
            <Text className="text-[#8B7355]">
              从先秦到明清，跟随朱自清探索中华十三部经典
            </Text>
          </div>

          {eras.length === 0 ? (
            <Empty description="暂无时间轴数据" />
          ) : (
            <>
              {/* Stream toggle */}
              <StreamToggle checked={showStreamLayer} onChange={setShowStreamLayer} />

              {/* Timeline container with optional StreamLayer */}
              <div className="relative mb-8">
                {/* StreamLayer SVG overlay */}
                {showStreamLayer && (
                  <StreamLayer
                    eraRefs={eraCardRefs.current}
                    connections={eras.flatMap(e => getConnectionsForEra(e.id))}
                    highlightedEraId={selectedEraId}
                  />
                )}

                {/* Classic Timeline */}
                <div
                  className="relative mb-8 rounded-2xl p-8 overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #F5F2EB 0%, #EDE9E0 50%, #E8E4DC 100%)',
                    boxShadow: 'inset 0 0 60px rgba(139, 69, 19, 0.05)',
                  }}
                >
                  {/* Decorative background elements */}
                  <div
                    className="absolute top-0 left-0 w-32 h-32 opacity-10 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #8B6914 0%, transparent 70%)' }}
                  />
                  <div
                    className="absolute bottom-0 right-0 w-40 h-40 opacity-10 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #8B4513 0%, transparent 70%)' }}
                  />

                  {/* Scroll buttons */}
                  <button
                    onClick={() => scroll('left')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:bg-white transition-colors border border-[#D4A574]/50"
                  >
                    <ArrowLeftOutlined className="text-[#2F2F2F]" />
                  </button>
                  <button
                    onClick={() => scroll('right')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:bg-white transition-colors border border-[#D4A574]/50"
                  >
                    <ArrowRightOutlined className="text-[#2F2F2F]" />
                  </button>

                  <div
                    ref={scrollRef}
                    className="overflow-x-auto hide-scrollbar px-10"
                    style={{ scrollbarWidth: 'none' }}
                  >
                    <div className="relative min-w-max py-4">
                      {/* Top Row */}
                      <div className="flex items-end justify-center gap-6 mb-0 pb-6 relative" style={{ paddingRight: '40px' }}>
                        {topRow.map((era, idx) => {
                          const isSelected = selectedEraId === era.id
                          const icon = eraIcons[era.name] || <BookOutlined />
                          const gradient = eraGradients[era.name] || 'from-[#2F2F2F]/20 to-[#2F2F2F]/10'
                          const borderColor = eraBorderColors[era.name] || 'border-[#2F2F2F]/30'
                          const isLastTop = idx === topRow.length - 1

                          return (
                            <React.Fragment key={era.id}>
                              <div ref={el => { eraCardRefs.current[era.id] = el }}>
                                <EraCard
                                  era={era}
                                  isSelected={isSelected}
                                  isMarked={isMarked(era.id)}
                                  icon={icon}
                                  gradient={gradient}
                                  borderColor={borderColor}
                                  onClick={() => handleEraClick(era.id)}
                                />
                              </div>
                              {/* Transition marker between cards (except last) */}
                              {!isLastTop && era.transitionToNext && (
                                <TransitionMarker text={era.transitionToNext} />
                              )}
                            </React.Fragment>
                          )
                        })}
                      </div>

                      {/* Main Axis Line */}
                      <div className="relative h-1 mx-4" style={{ marginRight: '44px' }}>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#C73E3A] via-[#E8A0A0] to-[#C73E3A] rounded-full" />
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1">
                          <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                            <path d="M0 8H18M18 8L11 1M18 8L11 15" stroke="#C73E3A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>

                      {/* Bottom Row */}
                      {bottomRow.length > 0 && (
                        <div className="flex items-start justify-center gap-6 mt-0 pt-6 relative" style={{ paddingRight: '40px' }}>
                          {bottomRow.map((era, idx) => {
                            const isSelected = selectedEraId === era.id
                            const icon = eraIcons[era.name] || <BookOutlined />
                            const gradient = eraGradients[era.name] || 'from-[#2F2F2F]/20 to-[#2F2F2F]/10'
                            const borderColor = eraBorderColors[era.name] || 'border-[#2F2F2F]/30'
                            const isLastBottom = idx === bottomRow.length - 1

                            return (
                              <React.Fragment key={era.id}>
                                <div ref={el => { eraCardRefs.current[era.id] = el }}>
                                  <EraCard
                                    era={era}
                                    isSelected={isSelected}
                                    isMarked={isMarked(era.id)}
                                    icon={icon}
                                    gradient={gradient}
                                    borderColor={borderColor}
                                    onClick={() => handleEraClick(era.id)}
                                  />
                                </div>
                                {!isLastBottom && era.transitionToNext && (
                                  <TransitionMarker text={era.transitionToNext} />
                                )}
                              </React.Fragment>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail Panel */}
              {selectedEra && (
                <div ref={detailRef} className="mb-8">
                  <EraDetailPanel
                    era={selectedEra}
                    prevEra={prevEra}
                    mark={marks[selectedEra.id]}
                    onMarkChange={updateMark}
                  />
                </div>
              )}

              {/* Complete button */}
              <div className="text-center py-8 border-t border-[#D4A574]/30">
                {completed ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-[#2F4F4F]">
                      <CheckCircleOutlined />
                      <Text className="text-[#2F4F4F] font-medium">已完成典籍时间轴学习</Text>
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
          subProjectId={1}
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
