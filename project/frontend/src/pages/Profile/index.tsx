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

const RUBRIC_NAMES: Record<string, { title: string; project: string }> = {
  'sub_project_1': { title: '典籍时间轴·历史阅读法实践', project: '项目一' },
  'sub_project_4': { title: '经典思想论坛·议题辩论交锋', project: '项目二' },
  'sub_project_5': { title: 'AI短视频脚本创作', project: '项目二' },
  'sub_project_8': { title: '经典声演·配乐朗诵创作', project: '项目三' },
  'sub_project_9': { title: '典籍长视频剪辑·影像创作', project: '项目三' },
  'project_1': { title: '典籍时间轴·历史阅读法实践', project: '项目一' },
  'project_2': { title: '经典思想论坛·议题辩论交锋', project: '项目二' },
  'project_3': { title: '经典声演与视频创作', project: '项目三' },
  'project1': { title: '项目一评价（旧版）', project: '项目一' },
  'project2': { title: '项目二评价（旧版）', project: '项目二' },
  'project3': { title: '项目三评价（旧版）', project: '项目三' },
}

const getRubricName = (formType: string, projectId: number) => {
  if (RUBRIC_NAMES[formType]) return RUBRIC_NAMES[formType]
  if (formType.startsWith('sub_project_')) {
    return { title: `子项目评价 · ${formType}`, project: '' }
  }
  if (formType.startsWith('project_')) {
    const pid = formType.split('_')[1]
    return { title: `项目${pid}评价`, project: `项目${pid}` }
  }
  return { title: `项目${projectId}评价 · ${formType}`, project: `项目${projectId}` }
}

const friendlyScoreKey = (key: string) => {
  if (key.includes('_')) {
    const [prefix, idx] = key.split('_')
    return `${prefix} · 条目${Number(idx) + 1}`
  }
  return key
}

const groupScoresByDimension = (scores: Record<string, any>) => {
  const groups: Record<string, { key: string; score: number }[]> = {}
  Object.entries(scores).forEach(([key, value]) => {
    const num = typeof value === 'number' ? value : Number(value)
    if (isNaN(num)) {
      if (!groups['评分项']) groups['评分项'] = []
      groups['评分项'].push({ key, score: 0 })
      return
    }
    const match = key.match(/^(.+)_(\d+)$/)
    if (match) {
      const dim = match[1]
      if (!groups[dim]) groups[dim] = []
      groups[dim].push({ key: `${dim}·条目${Number(match[2]) + 1}`, score: num })
    } else {
      if (!groups['其他']) groups['其他'] = []
      groups['其他'].push({ key, score: num })
    }
  })
  return groups
}

const isNumericScores = (scores: Record<string, any>) => {
  return Object.values(scores).some(v => typeof v === 'number' && !isNaN(v))
}

const EvaluationRecordCard: React.FC<{ evaluation: Evaluation }> = ({ evaluation: e }) => {
  const meta = getRubricName(e.form_type, e.project_id)
  const numeric = isNumericScores(e.scores)

  return (
    <AntCard
      title={
        <div className="flex items-center gap-2">
          <span className="font-medium">{meta.title}</span>
          {meta.project && <Tag color="blue" className="text-xs">{meta.project}</Tag>}
        </div>
      }
      extra={<Text className="text-danmo">{new Date(e.created_at).toLocaleDateString()}</Text>}
    >
      {numeric ? (
        <div className="space-y-3 mb-4">
          {Object.entries(groupScoresByDimension(e.scores)).map(([dim, items]) => (
            <div key={dim} className="border border-danmo-light rounded-lg overflow-hidden">
              <div className="bg-xuanzhi px-3 py-2 font-medium text-sm text-mohei">{dim}</div>
              <div className="p-3 space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Text className="text-xs text-danmo flex-1 truncate">{item.key}</Text>
                    <div className="w-20 h-2 bg-danmo-light rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(item.score / 5) * 100}%`,
                          backgroundColor: item.score >= 4 ? '#52c41a' : item.score >= 3 ? '#faad14' : '#C73E3A'
                        }}
                      />
                    </div>
                    <Text className="text-sm font-bold text-mohei w-10 text-right">{item.score}分</Text>
                  </div>
                ))}
                <div className="pt-1 border-t border-danmo-light flex items-center justify-between">
                  <Text className="text-xs text-danmo">维度均分</Text>
                  <Text className="text-sm font-bold text-shiqing">
                    {(items.reduce((s, i) => s + i.score, 0) / items.length).toFixed(1)}分
                  </Text>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          {Object.entries(e.scores).map(([k, v]) => (
            <div key={k} className="bg-xuanzhi-warm rounded-lg p-2 text-center">
              <Text className="text-xs text-danmo block truncate">{friendlyScoreKey(k)}</Text>
              <Text className="font-bold text-mohei text-lg">{String(v)}</Text>
            </div>
          ))}
        </div>
      )}
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
  )
}

const Profile: React.FC = () => {
  const { user } = useAuthStore()
  const [badges, setBadges] = useState<BadgeItem[]>([])
  const [materials, setMaterials] = useState<Materials | null>(null)
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [progressList, setProgressList] = useState<ReadingProgressResponse[]>([])
  const [checkinStatus, setCheckinStatus] = useState<CheckInStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [evalFormTarget, setEvalFormTarget] = useState<{ type: 'project' | 'sub'; id: number } | null>(null)

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
      <div className="relative -mx-4 -my-6 px-4 py-6 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 min-h-[calc(100vh-4rem)]">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-screen h-full bg-cover bg-center opacity-[0.30] pointer-events-none"
          style={{ backgroundImage: 'url(/images/backgrounds/profile.webp)' }}
        />
        <div className="relative z-10">
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
            {evalFormTarget && (
              <AntCard
                title={
                  evalFormTarget.type === 'sub'
                    ? `填写${RUBRIC_NAMES[`sub_project_${evalFormTarget.id}`]?.title || '子项目'}评价`
                    : `填写项目${evalFormTarget.id}评价`
                }
                extra={
                  <Button type="link" onClick={() => setEvalFormTarget(null)}>
                    取消
                  </Button>
                }
              >
                <EvaluationForm
                  projectId={evalFormTarget.type === 'project' ? evalFormTarget.id : undefined}
                  subProjectId={evalFormTarget.type === 'sub' ? evalFormTarget.id : undefined}
                  onSaved={() => { setEvalFormTarget(null); fetchData() }}
                />
              </AntCard>
            )}

            <div className="flex gap-3 flex-wrap">
              <Button icon={<PlusOutlined />} onClick={() => setEvalFormTarget({ type: 'sub', id: 1 })}>
                填写典籍时间轴评价
              </Button>
              <Button icon={<PlusOutlined />} onClick={() => setEvalFormTarget({ type: 'sub', id: 4 })}>
                填写经典思想论坛评价
              </Button>
              <Button icon={<PlusOutlined />} onClick={() => setEvalFormTarget({ type: 'sub', id: 8 })}>
                填写经典声演评价
              </Button>
              <Button icon={<PlusOutlined />} onClick={() => setEvalFormTarget({ type: 'sub', id: 9 })}>
                填写典籍长视频剪辑评价
              </Button>
            </div>

            {(() => {
              const visibleEvaluations = evaluations.filter(e => !['project1', 'project2', 'project3'].includes(e.form_type))
              if (visibleEvaluations.length === 0) {
                return <Empty description="暂无评价记录" />
              }
              return (
                <div className="space-y-4">
                  {visibleEvaluations.map((e) => (
                    <EvaluationRecordCard key={e.id} evaluation={e} />
                  ))}
                </div>
              )
            })()}
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
      </div>
      </div>
    </Layout>
  )
}

export default Profile
