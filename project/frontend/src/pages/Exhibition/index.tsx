import React, { useEffect, useState } from 'react'
import { Typography, Spin, Empty, Tabs, Modal, Tag, message, Select, Switch, Input, Button, Avatar } from 'antd'
import {
  TrophyOutlined,
  PlayCircleOutlined,
  AudioOutlined,
  FileTextOutlined,
  EyeOutlined,
  // UserOutlined,
  CaretRightOutlined,
  ClockCircleOutlined,
  PushpinOutlined,
  DeleteOutlined,
  FireOutlined,
  LikeOutlined,
  LikeFilled,
  MessageOutlined,
  SendOutlined,
} from '@ant-design/icons'
import Layout from '../../components/Layout'
import {
  listWorks, getWork, pinWork, unlistWork, likeWork,
  voteWork, getVoteSettings, updateVoteSettings,
  getWorkComments, createWorkComment, deleteWorkComment,
  Work, WorkComment,
} from '../../api/works'
import { useAuthStore } from '../../stores/auth'

const { Title, Text } = Typography
const { TabPane } = Tabs

const typeIcons: Record<string, React.ReactNode> = {
  video: <PlayCircleOutlined />,
  audio: <AudioOutlined />,
  script: <FileTextOutlined />,
}

const typeLabels: Record<string, string> = {
  video: '视频作品',
  audio: '音频作品',
  script: '脚本作品',
}

const typeColors: Record<string, string> = {
  video: 'bg-zhusha text-white',
  audio: 'bg-shiqing text-white',
  script: 'bg-tenghuang text-white',
}

const typeTagColors: Record<string, string> = {
  video: '#C73E3A',
  audio: '#5B9A8B',
  script: '#E6A23C',
}

const Exhibition: React.FC = () => {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'

  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('latest')
  const [selectedWork, setSelectedWork] = useState<Work | null>(null)
  const [detailVisible, setDetailVisible] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [voteSettings, setVoteSettings] = useState({ is_voting_open: false })
  const [comments, setComments] = useState<WorkComment[]>([])
  const [commentInput, setCommentInput] = useState('')
  const [commentsLoading, setCommentsLoading] = useState(false)

  useEffect(() => {
    fetchWorks()
    fetchVoteSettings()
  }, [activeType, sortBy])

  const fetchWorks = async () => {
    setLoading(true)
    try {
      const typeParam = activeType === 'all' ? undefined : activeType
      const res = await listWorks(typeParam, sortBy)
      const published = res.data.filter((w: Work) => w.status === 'published')
      setWorks(published)
    } catch (err) {
      console.error('Failed to load works:', err)
      setWorks([])
    } finally {
      setLoading(false)
    }
  }

  const handlePin = async (e: React.MouseEvent, work: Work) => {
    e.stopPropagation()
    try {
      await pinWork(work.id)
      fetchWorks()
      message.success(work.is_pinned ? '已取消置顶' : '已置顶')
    } catch {
      message.error('操作失败')
    }
  }

  const handleUnlist = async (e: React.MouseEvent, work: Work) => {
    e.stopPropagation()
    try {
      await unlistWork(work.id)
      fetchWorks()
      message.success(work.is_unlisted ? '已重新上架' : '已下架')
    } catch {
      message.error('操作失败')
    }
  }

  const handleLike = async (e: React.MouseEvent, work: Work) => {
    e.stopPropagation()
    try {
      const res = await likeWork(work.id)
      setWorks(prev => prev.map(w =>
        w.id === work.id
          ? { ...w, like_count: res.data.like_count, user_liked: res.data.liked }
          : w
      ))
      if (selectedWork && selectedWork.id === work.id) {
        setSelectedWork({ ...selectedWork, like_count: res.data.like_count, user_liked: res.data.liked })
      }
    } catch {
      message.error('点赞失败')
    }
  }

  const fetchVoteSettings = async () => {
    try {
      const res = await getVoteSettings()
      setVoteSettings(res.data)
    } catch {
      // ignore
    }
  }

  const handleToggleVoting = async (checked: boolean) => {
    try {
      await updateVoteSettings(checked)
      setVoteSettings({ is_voting_open: checked })
      message.success(checked ? '投票已开启' : '投票已关闭')
    } catch {
      message.error('操作失败')
    }
  }

  const handleVote = async (awardType: string) => {
    if (!selectedWork) return
    try {
      await voteWork(selectedWork.id, awardType)
      const res = await getWork(selectedWork.id)
      setSelectedWork(res.data)
      message.success('投票成功')
    } catch (err: any) {
      message.error(err.response?.data?.detail || '投票失败')
    }
  }

  const fetchComments = async (workId: number) => {
    setCommentsLoading(true)
    try {
      const res = await getWorkComments(workId)
      setComments(res.data)
    } catch {
      setComments([])
    } finally {
      setCommentsLoading(false)
    }
  }

  const handleCommentSubmit = async () => {
    if (!selectedWork || !commentInput.trim()) return
    try {
      await createWorkComment(selectedWork.id, commentInput.trim())
      setCommentInput('')
      fetchComments(selectedWork.id)
      message.success('评论发表成功')
    } catch {
      message.error('评论发表失败')
    }
  }

  const handleCommentDelete = async (commentId: number) => {
    if (!selectedWork) return
    try {
      await deleteWorkComment(selectedWork.id, commentId)
      fetchComments(selectedWork.id)
      message.success('评论已删除')
    } catch {
      message.error('删除失败')
    }
  }

  const handleViewDetail = async (work: Work) => {
    setDetailLoading(true)
    try {
      const res = await getWork(work.id)
      setSelectedWork(res.data)
      setDetailVisible(true)
      fetchComments(work.id)
    } catch (err) {
      message.error('加载详情失败')
    } finally {
      setDetailLoading(false)
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
      <div className="relative -mx-4 -my-6 px-4 py-8 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 min-h-[calc(100vh-4rem)]">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.12] pointer-events-none"
          style={{ backgroundImage: 'url(https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/images/backgrounds/exhibition.png)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F5F2EB]/60 via-transparent to-[#F5F2EB]/80 pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-3">
              <TrophyOutlined className="text-2xl text-zhusha" />
              <Title level={2} className="font-display !mb-0">
                成果展厅
              </Title>
            </div>
            <Text className="text-danmo text-base block">
              展示同学们的创作成果，灵感碰撞的公共空间
            </Text>
            {isAdmin && (
              <div className="mt-4 flex items-center justify-center gap-3 bg-white/70 backdrop-blur-sm px-5 py-2 rounded-full border border-danmo-light shadow-sm inline-flex">
                <span className="text-sm text-mohei">投票评比</span>
                <Switch
                  checked={voteSettings.is_voting_open}
                  onChange={handleToggleVoting}
                  checkedChildren="开启"
                  unCheckedChildren="关闭"
                />
              </div>
            )}
          </div>

          {/* Stats Bar */}
          <div className="flex justify-center gap-8 mb-8">
            {[
              { icon: <PlayCircleOutlined />, label: '视频作品', count: works.filter(w => w.work_type === 'video').length, color: 'text-zhusha' },
              { icon: <AudioOutlined />, label: '音频作品', count: works.filter(w => w.work_type === 'audio').length, color: 'text-shiqing' },
              { icon: <FileTextOutlined />, label: '脚本作品', count: works.filter(w => w.work_type === 'script').length, color: 'text-tenghuang' },
            ].map((stat, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-5 py-2.5 rounded-full border border-danmo-light shadow-sm">
                <span className={`text-lg ${stat.color}`}>{stat.icon}</span>
                <span className="text-mohei font-medium">{stat.count}</span>
                <span className="text-danmo text-sm">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Sort + Tabs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <Tabs
              activeKey={activeType}
              onChange={setActiveType}
              centered
              size="large"
              className="flex-1"
            >
              <TabPane tab={<span className="px-2">全部作品</span>} key="all" />
              <TabPane tab={<span className="flex items-center gap-1.5 px-2"><PlayCircleOutlined /> 视频</span>} key="video" />
              <TabPane tab={<span className="flex items-center gap-1.5 px-2"><AudioOutlined /> 音频</span>} key="audio" />
              <TabPane tab={<span className="flex items-center gap-1.5 px-2"><FileTextOutlined /> 脚本</span>} key="script" />
            </Tabs>
            <Select
              value={sortBy}
              onChange={setSortBy}
              options={[
                { value: 'latest', label: '最新发布' },
                { value: 'hottest', label: <span className="flex items-center gap-1"><FireOutlined /> 最热</span> },
                { value: 'most_liked', label: <span className="flex items-center gap-1"><LikeOutlined /> 最多赞</span> },
              ]}
              className="w-36"
            />
          </div>

          {/* Works Grid */}
          {works.length === 0 ? (
            <Empty description="暂无作品，快来发布你的第一个创作吧！" className="py-16" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {works.map((work) => (
                <div
                  key={work.id}
                  className="group bg-white rounded-2xl border border-danmo-light/60 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  onClick={() => handleViewDetail(work)}
                >
                  {/* Cover */}
                  <div className="h-48 bg-gradient-to-br from-xuanzhi-warm to-[#F5F2EB] flex items-center justify-center relative overflow-hidden">
                    {work.cover_url ? (
                      <img
                        src={work.cover_url}
                        alt={work.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg ${typeColors[work.work_type] || 'bg-shiqing text-white'}`}>
                          {typeIcons[work.work_type]}
                        </div>
                      </div>
                    )}

                    {/* Play overlay for video */}
                    {work.work_type === 'video' && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                          <CaretRightOutlined className="text-xl text-zhusha ml-0.5" />
                        </div>
                      </div>
                    )}

                    {/* Pin badge */}
                    {work.is_pinned && (
                      <div className="absolute top-3 left-3">
                        <Tag color="#C73E3A" className="px-2 py-0.5 text-xs font-medium border-0 flex items-center gap-1">
                          <PushpinOutlined /> 置顶
                        </Tag>
                      </div>
                    )}

                    {/* Type Tag */}
                    <div className="absolute top-3 right-3">
                      <Tag color={typeTagColors[work.work_type]} className="px-2.5 py-0.5 text-xs font-medium border-0">
                        {typeLabels[work.work_type]}
                      </Tag>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <Title level={5} className="font-display !mb-2 line-clamp-1 group-hover:text-zhusha transition-colors">
                      {work.title}
                    </Title>
                    {work.description && (
                      <Text className="text-danmo text-sm block mb-4 line-clamp-2 leading-relaxed">
                        {work.description}
                      </Text>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3 text-danmo">
                        <span className="flex items-center gap-1">
                          <EyeOutlined /> {work.view_count}
                        </span>
                        <button
                          onClick={(e) => handleLike(e, work)}
                          className={`flex items-center gap-1 transition-colors ${work.user_liked ? 'text-zhusha' : 'hover:text-zhusha'}`}
                        >
                          {work.user_liked ? <LikeFilled /> : <LikeOutlined />}
                          {work.like_count}
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        {isAdmin && (
                          <>
                            <button
                              onClick={(e) => handlePin(e, work)}
                              className={`text-xs px-2 py-1 rounded-md transition-colors ${work.is_pinned ? 'bg-zhusha/10 text-zhusha' : 'bg-gray-100 text-danmo hover:bg-gray-200'}`}
                            >
                              <PushpinOutlined /> {work.is_pinned ? '取消置顶' : '置顶'}
                            </button>
                            <button
                              onClick={(e) => handleUnlist(e, work)}
                              className={`text-xs px-2 py-1 rounded-md transition-colors ${work.is_unlisted ? 'bg-shiqing/10 text-shiqing' : 'bg-gray-100 text-danmo hover:bg-gray-200'}`}
                            >
                              <DeleteOutlined /> {work.is_unlisted ? '上架' : '下架'}
                            </button>
                          </>
                        )}
                        <div className="flex items-center gap-1 text-zhusha font-medium">
                          <EyeOutlined />
                          <span>查看详情</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        title={null}
        open={detailVisible}
        onCancel={() => {
          setDetailVisible(false)
          setSelectedWork(null)
        }}
        footer={null}
        width={800}
        centered
        destroyOnClose
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spin size="large" />
          </div>
        ) : selectedWork ? (
          <div className="space-y-5 max-h-[80vh] overflow-y-auto pr-1">
            {/* Modal Header */}
            <div className="border-b border-danmo-light pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Tag color={typeTagColors[selectedWork.work_type]} className="px-2.5 py-0.5 text-xs font-medium border-0">
                  {typeLabels[selectedWork.work_type]}
                </Tag>
                <Text className="text-danmo text-sm flex items-center gap-1">
                  <ClockCircleOutlined />
                  {new Date(selectedWork.created_at).toLocaleDateString()}
                </Text>
              </div>
              <div className="flex items-center justify-between">
                <Title level={4} className="font-display !mb-0">
                  {selectedWork.title}
                </Title>
                <button
                  onClick={() => handleLike({ stopPropagation: () => {} } as any, selectedWork)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${selectedWork.user_liked ? 'bg-zhusha/10 text-zhusha' : 'bg-gray-100 text-danmo hover:bg-gray-200'}`}
                >
                  {selectedWork.user_liked ? <LikeFilled /> : <LikeOutlined />}
                  <span className="font-medium">{selectedWork.like_count}</span>
                </button>
              </div>
            </div>

            {/* Description */}
            {selectedWork.description && (
              <Text className="text-mohei text-base block leading-relaxed">
                {selectedWork.description}
              </Text>
            )}

            {/* Video / Audio Player */}
            {selectedWork.file_url && (
              <div className="rounded-xl overflow-hidden bg-black">
                {selectedWork.work_type === 'video' ? (
                  <video
                    src={selectedWork.file_url}
                    controls
                    className="w-full max-h-[420px]"
                    poster=""
                  />
                ) : selectedWork.work_type === 'audio' ? (
                  <div className="p-6 bg-gradient-to-r from-xuanzhi-warm to-white">
                    <audio
                      src={selectedWork.file_url}
                      controls
                      className="w-full"
                    />
                  </div>
                ) : null}
              </div>
            )}

            {/* Content */}
            {selectedWork.content && (
              <div className="bg-xuanzhi-warm/50 p-5 rounded-xl border border-danmo-light/40">
                <pre className="whitespace-pre-wrap font-sans text-mohei text-sm leading-relaxed">
                  {selectedWork.content}
                </pre>
              </div>
            )}

            {/* Voting Section */}
            {voteSettings.is_voting_open && (
              <div className="bg-white p-5 rounded-xl border border-danmo-light/40">
                <div className="flex items-center gap-2 mb-4">
                  <TrophyOutlined className="text-tenghuang" />
                  <Title level={5} className="!mb-0 font-display">投票评比</Title>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'best_video', label: '最佳视频奖', icon: <PlayCircleOutlined /> },
                    { key: 'best_audio', label: '最佳音频奖', icon: <AudioOutlined /> },
                    { key: 'best_script', label: '最佳脚本奖', icon: <FileTextOutlined /> },
                  ].map((award) => {
                    const typeMap: Record<string, string> = { best_video: 'video', best_audio: 'audio', best_script: 'script' }
                    const isMatch = selectedWork.work_type === typeMap[award.key]
                    const count = selectedWork.vote_counts?.[award.key] || 0
                    return (
                      <button
                        key={award.key}
                        onClick={() => isMatch && handleVote(award.key)}
                        disabled={!isMatch}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-colors ${
                          isMatch
                            ? 'border-tenghuang bg-tenghuang/5 hover:bg-tenghuang/10 cursor-pointer'
                            : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <span className="text-lg">{award.icon}</span>
                        <span className="text-sm font-medium">{award.label}</span>
                        <span className="text-xs text-danmo">{count} 票</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="bg-white p-5 rounded-xl border border-danmo-light/40">
              <div className="flex items-center gap-2 mb-4">
                <MessageOutlined className="text-shiqing" />
                <Title level={5} className="!mb-0 font-display">留言</Title>
                <span className="text-sm text-danmo">({comments.length})</span>
              </div>

              {/* Comment Input */}
              <div className="flex gap-2 mb-4">
                <Input.TextArea
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="写下你的留言..."
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  className="flex-1"
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleCommentSubmit}
                  disabled={!commentInput.trim()}
                >
                  发表
                </Button>
              </div>

              {/* Comment List */}
              {commentsLoading ? (
                <div className="flex justify-center py-4">
                  <Spin size="small" />
                </div>
              ) : comments.length === 0 ? (
                <Text className="text-danmo text-sm block text-center py-4">暂无留言，快来抢沙发吧！</Text>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 p-3 bg-xuanzhi-warm/30 rounded-lg">
                      <Avatar className="bg-shiqing text-white flex-shrink-0">
                        {comment.username?.[0] || 'U'}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-mohei">{comment.username}</span>
                          <span className="text-xs text-danmo flex-shrink-0">
                            {new Date(comment.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-mohei mt-1">{comment.content}</p>
                      </div>
                      {(isAdmin || comment.user_id === user?.id) && (
                        <button
                          onClick={() => handleCommentDelete(comment.id)}
                          className="text-xs text-danmo hover:text-zhusha transition-colors flex-shrink-0"
                        >
                          删除
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </Layout>
  )
}

export default Exhibition
