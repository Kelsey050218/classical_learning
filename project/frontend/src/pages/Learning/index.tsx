import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Typography, message, Spin, Empty, Progress as AntProgress, Tag, Modal } from 'antd'
import {
  BookOutlined,
  TrophyOutlined,
  VideoCameraOutlined,
  LockOutlined,
  UnlockOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  HistoryOutlined,
  TeamOutlined,
  FileTextOutlined,
  AudioOutlined,
  MessageOutlined,
} from '@ant-design/icons'
import Layout from '../../components/Layout'
import Card from '../../components/UI/Card'
import EvaluationForm from '../../components/EvaluationForm'
import { getLearningProjects, LearningProject } from '../../api/learning'

const { Title, Text } = Typography

const projectIcons: Record<string, React.ReactNode> = {
  book: <BookOutlined />,
  trophy: <TrophyOutlined />,
  video: <VideoCameraOutlined />,
  message: <MessageOutlined />,
}

const subProjectIcons: Record<string, React.ReactNode> = {
  timeline: <HistoryOutlined />,
  forum: <TeamOutlined />,
  ai_script: <FileTextOutlined />,
  audio: <AudioOutlined />,
  video: <VideoCameraOutlined />,
  capcut: <VideoCameraOutlined />,
}

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  completed: { color: 'text-zhuqing', icon: <CheckCircleOutlined />, label: '已完成' },
  in_progress: { color: 'text-zhusha', icon: <UnlockOutlined />, label: '进行中' },
  locked: { color: 'text-danmo', icon: <LockOutlined />, label: '未解锁' },
}

const Learning: React.FC = () => {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<LearningProject[]>([])
  const [loading, setLoading] = useState(true)
  const [evalModalVisible, setEvalModalVisible] = useState(false)
  const [evalProjectId, setEvalProjectId] = useState<number | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const res = await getLearningProjects()
      setProjects(res.data)
    } catch (error) {
      message.error('加载学习项目失败')
    } finally {
      setLoading(false)
    }
  }

  const handleNavigate = (path: string, status: string) => {
    if (status === 'locked') {
      message.warning('该项目尚未解锁，请先完成前置项目')
      return
    }
    if (path.startsWith('http')) {
      window.open(path, '_blank')
      return
    }
    navigate(path)
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
          style={{ backgroundImage: 'url(/images/backgrounds/learning.png)' }}
        />
        <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <Title level={2} className="font-display !mb-2">
            学习中心
          </Title>
          <Text className="text-danmo">
            三大项目，循序渐进，从阅读到创作，全面提升经典素养
          </Text>
        </div>

        {projects.length === 0 ? (
          <Empty description="暂无学习项目" />
        ) : (
          <div className="relative max-w-4xl mx-auto">
            {/* Timeline vertical line */}
            <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-danmo-light" />

            <div className="space-y-0">
              {projects.map((project, index) => {
                const status = statusConfig[project.status]
                const isLocked = project.status === 'locked'
                const isLast = index === projects.length - 1

                return (
                  <div key={project.id} className="relative flex gap-5 pb-10 last:pb-0">
                    {/* Timeline node */}
                    <div className="relative z-10 flex flex-col items-center flex-shrink-0 w-14">
                      <div className={`
                        rounded-full flex items-center justify-center transition-all
                        ${project.status === 'completed'
                          ? 'w-8 h-8 bg-zhuqing text-white shadow-lg shadow-zhuqing/30'
                          : project.status === 'in_progress'
                          ? 'w-9 h-9 bg-zhusha text-white shadow-lg shadow-zhusha/30 ring-4 ring-zhusha-100'
                          : 'w-8 h-8 border-2 border-danmo bg-xuanzhi text-danmo'
                        }
                      `}>
                        {project.status === 'completed' ? (
                          <CheckCircleOutlined className="text-sm" />
                        ) : project.status === 'in_progress' ? (
                          <UnlockOutlined className="text-sm" />
                        ) : (
                          <LockOutlined className="text-xs" />
                        )}
                      </div>
                      {!isLast && (
                        <div className={`w-0.5 flex-1 mt-2 ${
                          project.status === 'completed' ? 'bg-zhuqing' : 'bg-danmo-light'
                        }`} />
                      )}
                    </div>

                    {/* Project Card */}
                    <div className="flex-1 min-w-0 -mt-2">
                      <Card
                        variant={project.status === 'locked' ? 'locked' : project.status === 'completed' ? 'completed' : 'default'}
                        className={`${isLocked ? 'opacity-75' : ''}`}
                      >
                        {/* Header */}
                        <div className="flex items-start gap-3 mb-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                            isLocked
                              ? 'bg-gray-100 text-danmo'
                              : project.status === 'completed'
                              ? 'bg-zhuqing-50 text-zhuqing'
                              : 'bg-zhusha-50 text-zhusha'
                          }`}>
                            {projectIcons[project.icon] || <BookOutlined />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <Tag color={isLocked ? 'default' : project.status === 'completed' ? 'success' : 'error'}>
                                <span className="flex items-center gap-1">
                                  {status.icon}
                                  {status.label}
                                </span>
                              </Tag>
                              <Text className="text-danmo text-xs">项目 {index + 1}</Text>
                            </div>
                            <Title level={4} className="font-display !mb-0.5 !text-lg">
                              {project.name}
                            </Title>
                            <Text className="text-danmo text-sm block">
                              {project.description}
                            </Text>
                          </div>
                        </div>

                        {/* Progress */}
                        {!isLocked && (
                          <div className="mb-5">
                            <div className="flex items-center justify-between mb-1.5">
                              <Text className="text-xs text-danmo">完成进度</Text>
                              <Text className="text-xs font-medium text-mohei">
                                {project.completed_count}/{project.total_count}
                              </Text>
                            </div>
                            <AntProgress
                              percent={project.progress}
                              strokeColor={project.status === 'completed' ? '#5A9A6E' : '#C73E3A'}
                              trailColor="#F5F2EB"
                              size="small"
                              showInfo={false}
                            />
                          </div>
                        )}

                        {/* Unlock condition */}
                        {isLocked && project.unlock_condition && (
                          <div className="p-3 bg-xuanzhi-warm rounded-lg mb-4">
                            <Text className="text-sm text-danmo">
                              解锁条件：完成「{projects.find(p => p.id === project.unlock_condition?.project_id)?.name || '前置项目'}」
                            </Text>
                          </div>
                        )}

                        {/* Sub-projects */}
                        <div className="border-t border-danmo-light pt-4">
                          <Text className="text-xs text-danmo font-medium mb-3 block">
                            子项目
                          </Text>
                          <div className="flex flex-wrap gap-3">
                            {project.sub_projects.map((sp) => (
                              <button
                                key={sp.id}
                                onClick={() => handleNavigate(sp.path, sp.status)}
                                className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-lg border transition-all text-left ${
                                  sp.status === 'locked'
                                    ? 'border-danmo-light bg-xuanzhi-warm/50 text-danmo cursor-not-allowed opacity-60'
                                    : sp.status === 'completed'
                                    ? 'border-zhuqing bg-zhuqing-50 text-zhuqing hover:bg-zhuqing-100 hover:shadow-card'
                                    : 'border-danmo-light bg-white text-mohei hover:border-zhusha hover:bg-zhusha-50 hover:text-zhusha hover:shadow-card'
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${
                                  sp.status === 'locked'
                                    ? 'bg-gray-100 text-danmo'
                                    : sp.status === 'completed'
                                    ? 'bg-zhuqing-100 text-zhuqing'
                                    : 'bg-zhusha-50 text-zhusha group-hover:bg-zhusha group-hover:text-white transition-colors'
                                }`}>
                                  {subProjectIcons[sp.slug] || <ArrowRightOutlined className="text-xs" />}
                                </div>
                                <span className="text-sm font-medium whitespace-nowrap">{sp.name}</span>
                                {sp.status === 'completed' && (
                                  <CheckCircleOutlined className="text-zhuqing text-xs flex-shrink-0" />
                                )}
                                {sp.status === 'locked' && (
                                  <LockOutlined className="text-danmo text-xs flex-shrink-0" />
                                )}
                                {sp.status === 'in_progress' && (
                                  <ArrowRightOutlined className="text-zhusha text-xs flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
      </div>

      <Modal
        title="项目评价量表"
        open={evalModalVisible}
        onCancel={() => setEvalModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        {evalProjectId && (
          <EvaluationForm
            projectId={evalProjectId}
            onSaved={() => {
              setEvalModalVisible(false)
              setEvalProjectId(null)
              fetchProjects()
            }}
          />
        )}
      </Modal>
    </Layout>
  )
}

export default Learning
