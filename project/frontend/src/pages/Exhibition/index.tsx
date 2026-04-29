import React, { useEffect, useState } from 'react'
import { Typography, Spin, Empty, Tabs, Modal, Tag, message } from 'antd'
import {
  TrophyOutlined,
  PlayCircleOutlined,
  AudioOutlined,
  FileTextOutlined,
  EyeOutlined,
  UserOutlined,
} from '@ant-design/icons'
import Layout from '../../components/Layout'
import { listWorks, getWork, Work } from '../../api/works'

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

const MOCK_WORKS: Work[] = [
  {
    id: 1,
    user_id: 8,
    title: '《诗经》之美——从风雅颂看先秦生活',
    description: '通过视频剪辑，展现《诗经》中风雅颂三种体裁的不同风貌，配以古风音乐和字幕解读。',
    content: '本作品选取了《诗经》中的经典篇目进行解读，从"关关雎鸠"到"蒹葭苍苍"，带领观众穿越三千年，感受先民的情感与智慧。',
    work_type: 'video',
    status: 'published',
    cover_url: '',
    file_url: '',
    created_at: '2025-03-15T10:30:00Z',
    updated_at: '2025-03-15T10:30:00Z',
  },
  {
    id: 2,
    user_id: 12,
    title: '《史记》列传音频演绎——项羽本纪',
    description: '用声音演绎《史记·项羽本纪》中的经典片段，感受西楚霸王的豪情与悲壮。',
    content: '力拔山兮气盖世，时不利兮骓不逝。骓不逝兮可奈何，虞兮虞兮奈若何！',
    work_type: 'audio',
    status: 'published',
    cover_url: '',
    file_url: '',
    created_at: '2025-03-18T14:20:00Z',
    updated_at: '2025-03-18T14:20:00Z',
  },
  {
    id: 3,
    user_id: 5,
    title: 'AI短视频脚本：如果孔子穿越到现代',
    description: '以"古今勾连"为创意核心，创作孔子穿越到现代校园的短视频脚本，引发对经典当代价值的思考。',
    content: '场景一：孔子步入现代中学课堂\n孔子：（环顾四周）此为何物？众人皆伏首于方寸之屏？\n学生甲：（抬头）老爷子，这是平板电脑，上课用的。\n孔子：（抚须微笑）吾尝言"学而不思则罔"，今之学子，可思否？',
    work_type: 'script',
    status: 'published',
    cover_url: '',
    file_url: '',
    created_at: '2025-03-20T09:15:00Z',
    updated_at: '2025-03-20T09:15:00Z',
  },
  {
    id: 4,
    user_id: 21,
    title: '《经典常谈》读书卡——说文解字篇',
    description: '精心制作的读书卡，记录阅读《说文解字》篇的知识要点和心得感悟。',
    content: '核心概念：六书（象形、指事、会意、形声、转注、假借）\n关键史实：许慎编撰《说文解字》，收字9353个\n核心观点：文字是文化传承的基石',
    work_type: 'script',
    status: 'published',
    cover_url: '',
    file_url: '',
    created_at: '2025-03-22T16:45:00Z',
    updated_at: '2025-03-22T16:45:00Z',
  },
  {
    id: 5,
    user_id: 15,
    title: '《战国策》经典声演——邹忌讽齐王纳谏',
    description: '分角色演绎《邹忌讽齐王纳谏》，通过声音塑造不同人物形象。',
    content: '邹忌修八尺有余，而形貌昳丽。朝服衣冠，窥镜，谓其妻曰："我孰与城北徐公美？"',
    work_type: 'audio',
    status: 'published',
    cover_url: '',
    file_url: '',
    created_at: '2025-03-25T11:00:00Z',
    updated_at: '2025-03-25T11:00:00Z',
  },
  {
    id: 6,
    user_id: 33,
    title: '诸子百家辩论短视频',
    description: '用现代辩论赛的形式再现诸子百家思想碰撞，让经典思想活起来。',
    content: '本期主题：人性本善还是本恶？\n正方：孟子——"恻隐之心，人皆有之"\n反方：荀子——"人之性恶，其善者伪也"',
    work_type: 'video',
    status: 'published',
    cover_url: '',
    file_url: '',
    created_at: '2025-03-28T08:30:00Z',
    updated_at: '2025-03-28T08:30:00Z',
  },
  {
    id: 7,
    user_id: 1,
    title: '汉字的演变——动画',
    description: '以动画形式生动展现汉字从甲骨文到楷书的演变历程，让文字活起来。',
    content: '本视频通过精美的动画，展现了汉字从甲骨文、金文、小篆、隶书到楷书的演变过程，让观众直观感受汉字之美。',
    work_type: 'video',
    status: 'published',
    cover_url: '',
    file_url: 'https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/video/%E6%B1%89%E5%AD%97%E7%9A%84%E6%BC%94%E5%8F%98-%E5%8A%A8%E7%94%BB.mp4',
    created_at: '2025-04-29T10:00:00Z',
    updated_at: '2025-04-29T10:00:00Z',
  },
  {
    id: 8,
    user_id: 1,
    title: '汉字的演变——科普',
    description: '科普讲解汉字的起源与演变，深入浅出地介绍汉字文化。',
    content: '本视频以科普视角讲解汉字的起源，从仓颉造字的传说到甲骨文的发现，再到现代汉字的规范化，系统梳理汉字发展的历史脉络。',
    work_type: 'video',
    status: 'published',
    cover_url: '',
    file_url: 'https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/video/%E6%B1%89%E5%AD%97%E7%9A%84%E6%BC%94%E5%8F%98-%E7%A7%91%E6%99%AE.mp4',
    created_at: '2025-04-29T10:00:00Z',
    updated_at: '2025-04-29T10:00:00Z',
  },
  {
    id: 9,
    user_id: 1,
    title: '《诗经》导读',
    description: '走进中国第一部诗歌总集，感受三千年前的先民情怀。',
    content: '本视频带领观众走进《诗经》的世界，从"关关雎鸠"到"蒹葭苍苍"，感受先秦时期的风雅颂，体会先民的情感与智慧。',
    work_type: 'video',
    status: 'published',
    cover_url: '',
    file_url: 'https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/video/%E8%AF%97%E7%BB%8F.mp4',
    created_at: '2025-04-29T10:00:00Z',
    updated_at: '2025-04-29T10:00:00Z',
  },
]

const Exhibition: React.FC = () => {
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState<string>('all')
  const [selectedWork, setSelectedWork] = useState<Work | null>(null)
  const [detailVisible, setDetailVisible] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    fetchWorks()
  }, [activeType])

  const fetchWorks = async () => {
    setLoading(true)
    try {
      const typeParam = activeType === 'all' ? undefined : activeType
      const res = await listWorks(typeParam)
      // Filter to only show published works in exhibition
      const published = res.data.filter((w: Work) => w.status === 'published')
      if (published.length === 0) {
        // Fallback to mock data when no real data exists
        const filtered = activeType === 'all'
          ? MOCK_WORKS
          : MOCK_WORKS.filter(w => w.work_type === activeType)
        setWorks(filtered)
      } else {
        setWorks(published)
      }
    } catch (err) {
      console.error('Failed to load works:', err)
      // Fallback to mock data on API error
      const filtered = activeType === 'all'
        ? MOCK_WORKS
        : MOCK_WORKS.filter(w => w.work_type === activeType)
      setWorks(filtered)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = async (work: Work) => {
    setDetailLoading(true)
    try {
      const res = await getWork(work.id)
      setSelectedWork(res.data)
      setDetailVisible(true)
    } catch (err) {
      message.error('加载详情失败')
    } finally {
      setDetailLoading(false)
    }
  }

  const filteredWorks = works

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
          style={{ backgroundImage: 'url(https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/images/backgrounds/exhibition.png)' }}
        />
        <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Title level={2} className="font-display !mb-2">
            成果展厅
          </Title>
          <Text className="text-danmo">
            展示同学们的创作成果，灵感碰撞的公共空间
          </Text>
        </div>

        {/* Tabs */}
        <Tabs
          activeKey={activeType}
          onChange={setActiveType}
          className="mb-6"
        >
          <TabPane tab="全部作品" key="all" />
          <TabPane tab={<span><PlayCircleOutlined /> 视频</span>} key="video" />
          <TabPane tab={<span><AudioOutlined /> 音频</span>} key="audio" />
          <TabPane tab={<span><FileTextOutlined /> 脚本</span>} key="script" />
        </Tabs>

        {/* Works Grid */}
        {filteredWorks.length === 0 ? (
          <Empty description="暂无作品，快来发布你的第一个创作吧！" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorks.map((work) => (
              <div
                key={work.id}
                className="bg-white rounded-xl border border-danmo-light overflow-hidden hover:shadow-card-hover transition-shadow cursor-pointer"
                onClick={() => handleViewDetail(work)}
              >
                {/* Cover / Placeholder */}
                <div className="h-40 bg-xuanzhi-warm flex items-center justify-center relative">
                  {work.cover_url ? (
                    <img
                      src={work.cover_url}
                      alt={work.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${typeColors[work.work_type] || 'bg-shiqing text-white'}`}>
                      {typeIcons[work.work_type]}
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Tag color={work.work_type === 'video' ? '#C73E3A' : work.work_type === 'audio' ? '#5B9A8B' : '#E6A23C'}>
                      {typeLabels[work.work_type]}
                    </Tag>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <Title level={5} className="font-display !mb-2 truncate">
                    {work.title}
                  </Title>
                  {work.description && (
                    <Text className="text-danmo text-sm block mb-3 line-clamp-2">
                      {work.description}
                    </Text>
                  )}
                  <div className="flex items-center justify-between text-sm text-danmo">
                    <div className="flex items-center gap-1">
                      <UserOutlined />
                      <span>用户 {work.user_id}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <EyeOutlined />
                      <span>查看详情</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        <Modal
          title={selectedWork?.title}
          open={detailVisible}
          onCancel={() => setDetailVisible(false)}
          footer={null}
          width={720}
        >
          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spin />
            </div>
          ) : selectedWork ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Tag color={selectedWork.work_type === 'video' ? '#C73E3A' : selectedWork.work_type === 'audio' ? '#5B9A8B' : '#E6A23C'}>
                  {typeLabels[selectedWork.work_type]}
                </Tag>
                <Text className="text-danmo text-sm">
                  创建时间: {new Date(selectedWork.created_at).toLocaleDateString()}
                </Text>
              </div>

              {selectedWork.description && (
                <Text className="text-mohei block">
                  {selectedWork.description}
                </Text>
              )}

              {selectedWork.content && (
                <div className="bg-xuanzhi-warm p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap font-sans text-mohei text-sm leading-relaxed">
                    {selectedWork.content}
                  </pre>
                </div>
              )}

              {selectedWork.file_url && (
                <div className="mt-4">
                  {selectedWork.work_type === 'video' ? (
                    <video
                      src={selectedWork.file_url}
                      controls
                      className="w-full rounded-lg"
                    />
                  ) : selectedWork.work_type === 'audio' ? (
                    <audio
                      src={selectedWork.file_url}
                      controls
                      className="w-full"
                    />
                  ) : null}
                </div>
              )}
            </div>
          ) : null}
        </Modal>
      </div>
      </div>
    </Layout>
  )
}

export default Exhibition
