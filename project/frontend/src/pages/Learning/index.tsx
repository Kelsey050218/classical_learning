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
  EditOutlined,
} from '@ant-design/icons'
import Layout from '../../components/Layout'
import Card from '../../components/UI/Card'
import EvaluationForm from '../../components/EvaluationForm'
import { getLearningProjects, completeProject, LearningProject } from '../../api/learning'

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
  const [completingProject, setCompletingProject] = useState<number | null>(null)

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

  const handleCompleteProject = async (projectId: number) => {
    setCompletingProject(projectId)
    try {
      await completeProject(projectId)
      message.success('项目已完成！')
      setEvalProjectId(projectId)
      setEvalModalVisible(true)
    } catch (error) {
      message.error('操作失败')
    } finally {
      setCompletingProject(null)
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
      <div className="max-w-5xl mx-auto">
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
          <div className="space-y-8">
            {projects.map((project, index) => {
              const status = statusConfig[project.status]
              const isLocked = project.status === 'locked'

              return (
                <Card
                  key={project.id}
                  variant={project.status === 'locked' ? 'locked' : project.status === 'completed' ? 'completed' : 'default'}
                  className={`overflow-hidden ${isLocked ? 'opacity-75' : ''}`}
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Left: Project Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                          isLocked
                            ? 'bg-gray-100 text-danmo'
                            : project.status === 'completed'
                            ? 'bg-zhuqing-50 text-zhuqing'
                            : 'bg-zhusha-50 text-zhusha'
                        }`}>
                          {projectIcons[project.icon] || <BookOutlined />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Tag color={isLocked ? 'default' : project.status === 'completed' ? 'success' : 'error'}>
                              <span className="flex items-center gap-1">
                                {status.icon}
                                {status.label}
                              </span>
                            </Tag>
                            <Text className="text-danmo text-xs">
                              项目 {index + 1}
                            </Text>
                          </div>
                          <Title level={4} className="font-display !mb-1">
                            {project.name}
                          </Title>
                          <Text className="text-danmo text-sm block">
                            {project.description}
                          </Text>
                        </div>
                      </div>

                      {/* Progress */}
                      {!isLocked && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1">
                            <Text className="text-sm text-danmo">完成进度</Text>
                            <Text className="text-sm font-medium text-mohei">
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
                          {project.completed_count === project.total_count && (
                            <button
                              onClick={() => handleCompleteProject(project.id)}
                              disabled={completingProject === project.id}
                              className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-zhusha hover:bg-zhusha-light text-white rounded-lg transition-colors text-sm font-medium"
                            >
                              <EditOutlined />
                              {completingProject === project.id ? '处理中...' : '完成项目并填写量表'}
                            </button>
                          )}
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
                    </div>

                    {/* Right: Sub-projects */}
                    <div className="md:w-72 flex-shrink-0">
                      <Text className="text-xs text-danmo font-medium mb-3 block">
                        包含子项目
                      </Text>
                      <div className="space-y-2">
                        {project.sub_projects.map((sp) => (
                          <button
                            key={sp.id}
                            onClick={() => handleNavigate(sp.path, sp.status)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                              sp.status === 'locked'
                                ? 'bg-gray-50 text-danmo cursor-not-allowed'
                                : sp.status === 'completed'
                                ? 'bg-zhuqing-50 text-zhuqing hover:bg-zhuqing-100'
                                : 'bg-xuanzhi-warm text-mohei hover:bg-zhusha-50 hover:text-zhusha'
                            }`}
                          >
                            <span className="text-lg">
                              {subProjectIcons[sp.slug] || <ArrowRightOutlined />}
                            </span>
                            <span className="text-sm flex-1">{sp.name}</span>
                            {sp.status === 'completed' && (
                              <CheckCircleOutlined className="text-zhuqing" />
                            )}
                            {sp.status === 'locked' && (
                              <LockOutlined className="text-danmo text-xs" />
                            )}
                            {sp.status === 'in_progress' && (
                              <ArrowRightOutlined className="text-zhusha text-xs" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
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
