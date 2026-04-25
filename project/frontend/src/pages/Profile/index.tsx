import React, { useEffect, useState } from 'react'
import { Typography, Tabs, Avatar, Statistic, Empty, Spin, Button, Tag, Card as AntCard } from 'antd'
import {
  UserOutlined,
  TrophyOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  BookOutlined,
  StarOutlined,
  FireOutlined,
  EditOutlined,
  PlusOutlined,
  SoundOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons'
import Layout from '../../components/Layout'
import Card from '../../components/UI/Card'
import Badge from '../../components/UI/Badge'
import BadgeWall from '../../components/BadgeWall'
import EvaluationForm from '../../components/EvaluationForm'
import { useAuthStore } from '../../stores/auth'
import { getMaterials, Materials } from '../../api/materials'
import { getAllBadges, Badge as BadgeItem } from '../../api/badges'
import { listMyEvaluations, Evaluation } from '../../api/evaluations'
import { getReadingProgressList, ReadingProgressResponse } from '../../api/reading'
import { getCheckInStatus, CheckInStatus } from '../../api/checkin'

const { Title, Text } = Typography
const { TabPane } = Tabs

interface Stats {
  total_reading_time: number
  chapters_completed: number
  annotations_count: number
  quizzes_completed: number
  streak_days: number
}

const CARD_TEMPLATE_NAMES: Record<number, string> = {
  1: '基础信息卡',
  2: '好词积累卡',
  3: '名句摘录卡',
  4: '内容概括卡',
  5: '人物档案卡',
  6: '知识链接卡',
  7: '疑点记录卡',
  8: '比较阅读卡',
  9: '感悟心得卡',
  10: '写作借鉴卡',
  11: '评价鉴赏卡',
  12: '总结反思卡',
}

const Profile: React.FC = () => {
  const { user } = useAuthStore()
  const [badges, setBadges] = useState<BadgeItem[]>([])
  const [materials, setMaterials] = useState<Materials | null>(null)
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [progressList, setProgressList] = useState<ReadingProgressResponse[]>([])
  const [checkinStatus, setCheckinStatus] = useState<CheckInStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEvalForm, setShowEvalForm] = useState<number | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [badgesRes, materialsRes, evalsRes, progressRes, checkinRes] = await Promise.all([
        getAllBadges(),
        getMaterials(),
        listMyEvaluations(),
        getReadingProgressList(),
        getCheckInStatus(),
      ])
      setBadges(badgesRes.data)
      setMaterials(materialsRes.data)
      setEvaluations(evalsRes.data)
      setProgressList(progressRes.data)
      setCheckinStatus(checkinRes.data)
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false)
    }
  }

  const stats: Stats = {
    total_reading_time: progressList.length * 15,
    chapters_completed: progressList.filter((p) => p.is_completed).length,
    annotations_count: materials?.annotations?.length || 0,
    quizzes_completed: 0,
    streak_days: checkinStatus?.current_consecutive_days || 0,
  }

  const getWorkIcon = (type: string) => {
    switch (type) {
      case 'audio':
        return <SoundOutlined className="text-shiqing" />
      case 'video':
        return <VideoCameraOutlined className="text-zhusha" />
      default:
        return <FileTextOutlined className="text-tenghuang" />
    }
  }

  const getWorkTypeName = (type: string) => {
    switch (type) {
      case 'audio':
        return '音频'
      case 'video':
        return '视频'
      default:
        return '脚本'
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
      {/* User Info Card */}
      <Card className="mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-shiqing-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-30 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-zhusha-100 rounded-full translate-y-1/2 -translate-x-1/2 opacity-30 blur-3xl" />

        <div className="relative flex items-center gap-6">
          <Avatar size={80} src="/avatar-default.png" icon={<UserOutlined />} className="bg-shiqing text-3xl" />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Title level={3} className="font-display !mb-0">
                {user?.real_name || user?.username}
              </Title>
              <Badge variant={user?.role === 'admin' ? 'zhusha' : 'shiqing'}>
                {user?.role === 'admin' ? '管理员' : '学生'}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-danmo">
              <span>
                <BookOutlined /> {user?.class_name || '未设置班级'}
              </span>
              <span>
                <UserOutlined /> 学号：{user?.student_id || '未设置'}
              </span>
              <span>
                <TrophyOutlined /> 获得勋章 {badges.filter((b) => b.is_unlocked).length} 枚
              </span>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center gap-2 bg-tenghuang-50 px-4 py-2 rounded-lg">
              <FireOutlined className="text-tenghuang text-xl" />
              <div>
                <Text className="text-tenghuang font-bold text-lg block leading-tight">
                  {stats.streak_days}
                </Text>
                <Text className="text-tenghuang-dark text-xs">连续学习天数</Text>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultActiveKey="materials" className="profile-tabs">
        {/* Materials Tab */}
        <TabPane tab={<span><FileTextOutlined /> 学习素材</span>} key="materials">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stats Cards */}
            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card variant="paper" className="text-center">
                <ClockCircleOutlined className="text-shiqing text-2xl mb-2" />
                <Statistic
                  title="总阅读时长"
                  value={`${Math.floor(stats.total_reading_time / 60)}h`}
                  valueStyle={{ color: '#1A1A1A', fontSize: '24px' }}
                />
              </Card>
              <Card variant="paper" className="text-center">
                <BookOutlined className="text-zhusha text-2xl mb-2" />
                <Statistic
                  title="完成章节"
                  value={stats.chapters_completed}
                  suffix="/ 13"
                  valueStyle={{ color: '#1A1A1A', fontSize: '24px' }}
                />
              </Card>
              <Card variant="paper" className="text-center">
                <EditOutlined className="text-tenghuang text-2xl mb-2" />
                <Statistic
                  title="批注数量"
                  value={stats.annotations_count}
                  valueStyle={{ color: '#1A1A1A', fontSize: '24px' }}
                />
              </Card>
              <Card variant="paper" className="text-center">
                <TrophyOutlined className="text-zhuqing text-2xl mb-2" />
                <Statistic
                  title="读书卡数"
                  value={materials?.reading_cards?.length || 0}
                  valueStyle={{ color: '#1A1A1A', fontSize: '24px' }}
                />
              </Card>
            </div>

            {/* Annotations */}
            <AntCard title="我的批注" className="lg:col-span-2">
              {materials?.annotations?.length === 0 ? (
                <Empty description="暂无批注" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {materials?.annotations?.map((a) => (
                    <Card key={a.id} variant="paper">
                      <div className="flex items-start gap-3">
                        <StarOutlined className="text-tenghuang text-lg mt-0.5" />
                        <div className="flex-1">
                          <Tag color="blue">{a.annotation_type}</Tag>
                          <Text className="text-sm text-mohei block mt-1 line-clamp-2">{a.content}</Text>
                          <Text className="text-xs text-danmo mt-1 block">
                            {new Date(a.created_at).toLocaleDateString()}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </AntCard>

            {/* Reading Cards */}
            <AntCard title="我的读书卡">
              {materials?.reading_cards?.length === 0 ? (
                <Empty description="暂无读书卡" />
              ) : (
                <div className="space-y-3">
                  {materials?.reading_cards?.map((card) => (
                    <Card key={card.id} variant="paper" className="p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Tag color="purple">{CARD_TEMPLATE_NAMES[card.card_template] || `模板${card.card_template}`}</Tag>
                        <Text className="text-xs text-danmo">{new Date(card.created_at).toLocaleDateString()}</Text>
                      </div>
                      <Text className="text-sm text-mohei line-clamp-2">
                        {Object.entries(card.fields)
                          .slice(0, 2)
                          .map(([k, v]) => `${k}: ${String(v).slice(0, 20)}`)
                          .join(' | ')}
                      </Text>
                    </Card>
                  ))}
                </div>
              )}
            </AntCard>

            {/* Works */}
            <AntCard title="我的作品">
              {materials?.works?.length === 0 ? (
                <Empty description="暂无作品" />
              ) : (
                <div className="space-y-3">
                  {materials?.works?.map((work) => (
                    <Card key={work.id} variant="paper" className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-xuanzhi-warm flex items-center justify-center text-lg">
                          {getWorkIcon(work.work_type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Text className="font-medium text-mohei">{work.title}</Text>
                            <Badge variant={work.status === 'published' ? 'zhuqing' : 'default'} size="sm">
                              {work.status === 'published' ? '已发布' : '草稿'}
                            </Badge>
                          </div>
                          <Text className="text-xs text-danmo block">
                            {getWorkTypeName(work.work_type)} · {new Date(work.created_at).toLocaleDateString()}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </AntCard>
          </div>
        </TabPane>

        {/* Badges Tab */}
        <TabPane tab={<span><TrophyOutlined /> 勋章墙</span>} key="badges">
          <Card>
            <BadgeWall badges={badges} />
          </Card>
        </TabPane>

        {/* Evaluations Tab */}
        <TabPane tab={<span><EditOutlined /> 评价档案</span>} key="evaluations">
          <div className="space-y-6">
            {showEvalForm && (
              <AntCard
                title={`填写项目${showEvalForm}评价`}
                extra={
                  <Button type="link" onClick={() => setShowEvalForm(null)}>
                    取消
                  </Button>
                }
              >
                <EvaluationForm projectId={showEvalForm} onSaved={() => { setShowEvalForm(null); fetchData() }} />
              </AntCard>
            )}

            <div className="flex gap-3">
              {[1, 2, 3].map((pid) => (
                <Button key={pid} icon={<PlusOutlined />} onClick={() => setShowEvalForm(pid)}>
                  填写项目{pid}评价
                </Button>
              ))}
            </div>

            {evaluations.length === 0 ? (
              <Empty description="暂无评价记录" />
            ) : (
              <div className="space-y-4">
                {evaluations.map((e) => (
                  <AntCard
                    key={e.id}
                    title={`项目${e.project_id}评价 · ${e.form_type}`}
                    extra={<Text className="text-danmo">{new Date(e.created_at).toLocaleDateString()}</Text>}
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      {Object.entries(e.scores).map(([k, v]) => (
                        <div key={k} className="bg-xuanzhi-warm rounded-lg p-2 text-center">
                          <Text className="text-xs text-danmo block truncate">{k}</Text>
                          <Text className="font-bold text-mohei">{String(v)}</Text>
                        </div>
                      ))}
                    </div>
                    {e.self_comment && (
                      <div className="bg-xuanzhi rounded-lg p-3">
                        <Text className="text-xs text-danmo block mb-1">自我评语</Text>
                        <Text className="text-sm text-mohei">{e.self_comment}</Text>
                      </div>
                    )}
                    {e.evaluator_comment && (
                      <div className="bg-zhusha-50 rounded-lg p-3 mt-2">
                        <Text className="text-xs text-zhusha block mb-1">教师评语</Text>
                        <Text className="text-sm text-mohei">{e.evaluator_comment}</Text>
                      </div>
                    )}
                  </AntCard>
                ))}
              </div>
            )}
          </div>
        </TabPane>

        {/* Stats Tab */}
        <TabPane tab={<span><ClockCircleOutlined /> 学习数据</span>} key="stats">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <Title level={5} className="!mb-4 flex items-center gap-2">
                <BookOutlined className="text-shiqing" />
                阅读统计
              </Title>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-xuanzhi-warm rounded-lg">
                  <Text>总阅读章节</Text>
                  <Text className="font-bold text-mohei">
                    {stats.chapters_completed} / 13
                  </Text>
                </div>
                <div className="flex items-center justify-between p-3 bg-xuanzhi-warm rounded-lg">
                  <Text>总阅读时长</Text>
                  <Text className="font-bold text-mohei">
                    {Math.floor(stats.total_reading_time / 60)} 小时
                  </Text>
                </div>
                <div className="flex items-center justify-between p-3 bg-xuanzhi-warm rounded-lg">
                  <Text>平均阅读速度</Text>
                  <Text className="font-bold text-mohei">15 分钟/章</Text>
                </div>
              </div>
            </Card>

            <Card>
              <Title level={5} className="!mb-4 flex items-center gap-2">
                <EditOutlined className="text-zhusha" />
                互动统计
              </Title>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-xuanzhi-warm rounded-lg">
                  <Text>批注笔记</Text>
                  <Text className="font-bold text-mohei">{stats.annotations_count} 条</Text>
                </div>
                <div className="flex items-center justify-between p-3 bg-xuanzhi-warm rounded-lg">
                  <Text>读书卡</Text>
                  <Text className="font-bold text-mohei">
                    {materials?.reading_cards?.length || 0} 张
                  </Text>
                </div>
                <div className="flex items-center justify-between p-3 bg-xuanzhi-warm rounded-lg">
                  <Text>作品发布</Text>
                  <Text className="font-bold text-mohei">
                    {materials?.works?.filter((w) => w.status === 'published').length || 0} 件
                  </Text>
                </div>
              </div>
            </Card>

            <Card className="md:col-span-2">
              <Title level={5} className="!mb-4 flex items-center gap-2">
                <FireOutlined className="text-tenghuang" />
                连续打卡
              </Title>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-tenghuang-100 flex items-center justify-center mb-2">
                    <Text className="text-2xl font-bold text-tenghuang">{stats.streak_days}</Text>
                  </div>
                  <Text className="text-sm text-danmo">当前连续</Text>
                </div>
                <div className="flex-1">
                  <div className="flex gap-2">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-12 rounded-lg flex items-center justify-center ${
                          i < stats.streak_days ? 'bg-tenghuang' : 'bg-danmo-light'
                        }`}
                      >
                        {i < stats.streak_days ? (
                          <FireOutlined className="text-white" />
                        ) : null}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-danmo">
                    <span>周一</span>
                    <span>周二</span>
                    <span>周三</span>
                    <span>周四</span>
                    <span>周五</span>
                    <span>周六</span>
                    <span>周日</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabPane>
      </Tabs>
    </Layout>
  )
}

export default Profile
