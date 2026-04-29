import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Typography, Spin, Empty, Card as AntCard, Button, Input, Radio, message, Badge, Modal } from 'antd'
import { MessageOutlined, LikeOutlined, DislikeOutlined, FireOutlined, CheckCircleOutlined } from '@ant-design/icons'
import Layout from '../../components/Layout'
import EvaluationForm from '../../components/EvaluationForm'
import { listTopics, listPosts, createPost, votePost } from '../../api/forum'
import { completeSubProject } from '../../api/learning'

const { Title, Text } = Typography
const { TextArea } = Input

interface Topic {
  id: number
  title: string
  description?: string
  post_count: number
  created_at: string
}

interface Post {
  id: number
  username: string
  content: string
  stance?: string
  upvotes: number
  downvotes: number
  score: number
  user_vote?: string
  created_at: string
}

const stanceColors: Record<string, string> = {
  support: 'text-zhuqing',
  oppose: 'text-zhusha',
  neutral: 'text-danmo',
}

const stanceLabels: Record<string, string> = {
  support: '支持',
  oppose: '反对',
  neutral: '中立',
}

const Forum: React.FC = () => {
  const navigate = useNavigate()
  const { topicId } = useParams()
  const [topics, setTopics] = useState<Topic[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [newPostContent, setNewPostContent] = useState('')
  const [newPostStance, setNewPostStance] = useState('neutral')
  const [submitting, setSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [evalVisible, setEvalVisible] = useState(false)

  const handleComplete = async () => {
    setCompleting(true)
    try {
      await completeSubProject(4)
      message.success('经典思想论坛学习已完成！')
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

  useEffect(() => {
    fetchTopics()
  }, [])

  useEffect(() => {
    if (topicId) {
      const topic = topics.find(t => t.id === Number(topicId))
      if (topic) {
        setSelectedTopic(topic)
        fetchPosts(Number(topicId))
      }
    } else if (topics.length > 0) {
      navigate(`/forum/${topics[0].id}`)
    }
  }, [topicId, topics])

  const fetchTopics = async () => {
    try {
      const res = await listTopics()
      setTopics(res.data)
    } catch (err) {
      console.error('Failed to load topics:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPosts = async (id: number) => {
    try {
      const res = await listPosts(id)
      setPosts(res.data)
    } catch (err) {
      console.error('Failed to load posts:', err)
    }
  }

  const handleSubmitPost = async () => {
    if (!newPostContent.trim() || !selectedTopic) return

    setSubmitting(true)
    try {
      await createPost(selectedTopic.id, {
        content: newPostContent,
        stance: newPostStance,
      })
      message.success('发帖成功！')
      setNewPostContent('')
      fetchPosts(selectedTopic.id)
    } catch (err) {
      message.error('发帖失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVote = async (postId: number, voteType: string) => {
    try {
      await votePost(postId, voteType)
      if (selectedTopic) {
        fetchPosts(selectedTopic.id)
      }
    } catch (err) {
      message.error('投票失败')
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
      <div className="relative -mx-4 -my-6 px-4 py-6 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 min-h-[calc(100vh-4rem)]">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-screen h-full bg-cover bg-center opacity-[0.30] pointer-events-none"
          style={{ backgroundImage: 'url(https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/images/backgrounds/learning.png)' }}
        />
        <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Title level={2} className="font-display !mb-2">
            经典思想论坛
          </Title>
          <Text className="text-danmo">
            辩古论今，思辨经典，分享你的独到见解
          </Text>
        </div>

        {topics.length === 0 ? (
          <Empty description="暂无讨论话题" />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Topic List */}
            <div className="lg:col-span-1 space-y-4">
              <Title level={5} className="font-display">讨论话题</Title>
              {topics.map(topic => (
                <AntCard
                  key={topic.id}
                  hoverable
                  className={`cursor-pointer transition-all ${
                    selectedTopic?.id === topic.id ? 'border-zhusha border-2' : ''
                  }`}
                  onClick={() => navigate(`/forum/${topic.id}`)}
                >
                  <div className="flex items-start gap-3">
                    <MessageOutlined className="text-zhusha text-lg mt-1" />
                    <div className="flex-1 min-w-0">
                      <Text className="font-medium text-mohei block truncate">
                        {topic.title}
                      </Text>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge count={topic.post_count} showZero color="#C73E3A" />
                        <Text className="text-danmo text-xs">回复</Text>
                      </div>
                    </div>
                  </div>
                </AntCard>
              ))}
            </div>

            {/* Post Area */}
            <div className="lg:col-span-2">
              {selectedTopic ? (
                <div className="space-y-6">
                  {/* Topic Header */}
                  <AntCard className="bg-xuanzhi-warm">
                    <Title level={4} className="font-display !mb-2">
                      {selectedTopic.title}
                    </Title>
                    <Text className="text-danmo block">
                      {selectedTopic.description}
                    </Text>
                  </AntCard>

                  {/* New Post Form */}
                  <AntCard>
                    <Title level={5} className="!mb-4">发表观点</Title>
                    <div className="space-y-4">
                      <Radio.Group
                        value={newPostStance}
                        onChange={e => setNewPostStance(e.target.value)}
                        className="flex gap-4"
                      >
                        <Radio.Button value="support" className="text-zhuqing">支持</Radio.Button>
                        <Radio.Button value="oppose" className="text-zhusha">反对</Radio.Button>
                        <Radio.Button value="neutral" className="text-danmo">中立</Radio.Button>
                      </Radio.Group>
                      <TextArea
                        rows={4}
                        placeholder="分享你的观点和见解..."
                        value={newPostContent}
                        onChange={e => setNewPostContent(e.target.value)}
                      />
                      <Button
                        type="primary"
                        onClick={handleSubmitPost}
                        loading={submitting}
                        disabled={!newPostContent.trim()}
                        className="bg-zhusha hover:bg-zhusha-light"
                      >
                        发布观点
                      </Button>
                    </div>
                  </AntCard>

                  {/* Posts List */}
                  <div className="space-y-4">
                    <Title level={5} className="!mb-4">
                      全部观点 ({posts.length})
                    </Title>
                    {posts.length === 0 ? (
                      <Empty description="暂无观点，来发表第一个吧！" />
                    ) : (
                      posts.map(post => (
                        <AntCard key={post.id} className="hover:shadow-card-hover transition-shadow">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-shiqing flex items-center justify-center text-white font-bold shrink-0">
                              {post.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Text className="font-medium">{post.username}</Text>
                                {post.stance && (
                                  <span className={`text-sm font-medium ${stanceColors[post.stance]}`}>
                                    [{stanceLabels[post.stance]}]
                                  </span>
                                )}
                              </div>
                              <Text className="text-mohei block mb-3 leading-relaxed">
                                {post.content}
                              </Text>
                              <div className="flex items-center gap-4">
                                <button
                                  onClick={() => handleVote(post.id, 'up')}
                                  className={`flex items-center gap-1 text-sm transition-colors ${
                                    post.user_vote === 'up' ? 'text-zhusha' : 'text-danmo hover:text-zhusha'
                                  }`}
                                >
                                  <LikeOutlined />
                                  <span>{post.upvotes}</span>
                                </button>
                                <button
                                  onClick={() => handleVote(post.id, 'down')}
                                  className={`flex items-center gap-1 text-sm transition-colors ${
                                    post.user_vote === 'down' ? 'text-zhusha' : 'text-danmo hover:text-zhusha'
                                  }`}
                                >
                                  <DislikeOutlined />
                                  <span>{post.downvotes}</span>
                                </button>
                                <Text className="text-danmo text-xs">
                                  得分: {post.score}
                                </Text>
                              </div>
                            </div>
                          </div>
                        </AntCard>
                      ))
                    )}
                  </div>

                  {/* Complete Sub-project */}
                  <div className="flex justify-center pt-6 border-t border-danmo-light">
                    {completed ? (
                      <div className="space-y-3 text-center">
                        <div className="flex items-center justify-center gap-2 text-zhuqing">
                          <CheckCircleOutlined />
                          <Text className="text-zhuqing font-medium">已完成经典思想论坛学习</Text>
                        </div>
                        <Button type="default" onClick={() => navigate('/learning')}>
                          返回学习中心
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="primary"
                        size="large"
                        icon={<CheckCircleOutlined />}
                        onClick={handleComplete}
                        loading={completing}
                        className="bg-zhusha hover:bg-zhusha-light"
                      >
                        完成经典思想论坛学习
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <Empty description="请选择左侧话题开始讨论" />
              )}
            </div>
          </div>
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
          subProjectId={4}
          onSaved={() => {
            setEvalVisible(false)
            navigate('/learning')
          }}
        />
      </Modal>
    </Layout>
  )
}

export default Forum
