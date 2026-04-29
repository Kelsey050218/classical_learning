import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Typography, message, Statistic, Divider, Spin } from 'antd'
import {
  BookOutlined,
  ReadOutlined,
  UserOutlined,
  TrophyOutlined,
  FireOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import Layout from '../components/Layout'
import Card from '../components/UI/Card'
import Progress from '../components/UI/Progress'
import Badge from '../components/UI/Badge'
import Carousel from '../components/Carousel'
import apiClient from '../api/client'
import { useAuthStore } from '../stores/auth'
import { getTodayStudyTime } from '../api/studyTime'
import { getCheckInStatus } from '../api/checkin'

const { Title, Text } = Typography

interface ProgressData {
  reading: number
  learning: number
  badges: number
}

interface Activity {
  id: number
  type: string
  title: string
  date: string
}

const Home: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [progress, setProgress] = useState<ProgressData>({
    reading: 0,
    learning: 0,
    badges: 0,
  })
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [streak, setStreak] = useState(0)
  const [studyTime, setStudyTime] = useState(0) // seconds

  useEffect(() => {
    console.log('Home: loading state changed to', loading)
  }, [loading])

  useEffect(() => {
    const fetchData = async () => {
      console.log('Home: starting fetchData')
      try {
        setLoading(true)
        let readingProgress = 0
        let learningProgress = 0

        // Fetch reading progress
        try {
          const readingRes = await apiClient.get('/reading/progress/')
          const completedChapters = readingRes.data?.filter((c: any) => c.is_completed).length || 0
          readingProgress = Math.round((completedChapters / 13) * 100)
        } catch (err: any) {
          console.error('Reading progress error:', err.response?.status, err.response?.data)
        }

        // Fetch learning progress
        try {
          const learningRes = await apiClient.get('/learning/progress')
          const completedTasks = learningRes.data?.filter((p: any) => p.status === 'completed').length || 0
          const totalTasks = learningRes.data?.length || 1
          learningProgress = Math.round((completedTasks / totalTasks) * 100)
        } catch (err: any) {
          console.error('Learning progress error:', err.response?.status, err.response?.data)
        }

        setProgress({
          reading: readingProgress,
          learning: learningProgress,
          badges: 3, // Mock data
        })

        // Fetch today study time
        try {
          const studyRes = await getTodayStudyTime()
          setStudyTime(studyRes.data.total_seconds)
        } catch (err: any) {
          console.error('Study time error:', err.response?.status, err.response?.data)
        }

        // Fetch checkin streak
        try {
          const checkinRes = await getCheckInStatus()
          setStreak(checkinRes.data.current_consecutive_days)
        } catch (err: any) {
          console.error('Checkin status error:', err.response?.status, err.response?.data)
        }

        // Mock recent activities
        setRecentActivities([
          { id: 1, type: 'reading', title: '完成《说文解字》章节阅读', date: '今天' },
          { id: 2, type: 'quiz', title: '完成阅读理解测验', date: '昨天' },
          { id: 3, type: 'task', title: '提交批注笔记 3 条', date: '2天前' },
        ])
      } catch (error: any) {
        console.error('Home data fetch error:', error)
        message.error('加载数据失败')
      } finally {
        console.log('Home: fetchData complete, setting loading to false')
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const quickLinks = [
    {
      key: 'reading',
      icon: <BookOutlined className="text-3xl" />,
      title: '名著阅读',
      desc: '阅读经典名著，完成章节任务',
      color: 'text-shiqing bg-shiqing-50',
      onClick: () => navigate('/reading'),
    },
    {
      key: 'learning',
      icon: <ReadOutlined className="text-3xl" />,
      title: '学习中心',
      desc: '查看学习记录和进度',
      color: 'text-zhusha bg-zhusha-50',
      onClick: () => navigate('/learning'),
    },
    {
      key: 'profile',
      icon: <UserOutlined className="text-3xl" />,
      title: '我的中心',
      desc: '查看成就和学习数据',
      color: 'text-tenghuang bg-tenghuang-50',
      onClick: () => navigate('/profile'),
    },
  ]

  console.log('Home: rendering, loading=', loading, 'user=', user)

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
          style={{ backgroundImage: 'url(/images/backgrounds/home.png)' }}
        />
        <div className="relative z-10 space-y-6 stagger-children">
        {/* Carousel */}
        <Carousel />

        {/* Welcome section */}
        <Card variant="paper" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-zhusha-100 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <FireOutlined className="text-tenghuang" />
              <Badge variant="tenghuang">连续打卡 {streak} 天</Badge>
            </div>
            <Title level={3} className="font-display !mb-2">
              欢迎回来，{user?.real_name || user?.username}
            </Title>
            <Text className="text-danmo">
              今天也是学习经典的好日子，继续你的阅读之旅吧！
            </Text>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <Statistic
                title="今日学习"
                value={`${Math.floor(studyTime / 3600)}h ${Math.floor((studyTime % 3600) / 60)}m`}
                prefix={<ClockCircleOutlined className="text-shiqing" />}
                valueStyle={{ fontSize: '18px', color: '#1A1A1A' }}
              />
              <Statistic
                title="阅读进度"
                value={progress.reading}
                suffix="%"
                prefix={<BookOutlined className="text-zhusha" />}
                valueStyle={{ fontSize: '18px', color: '#1A1A1A' }}
              />
              <Statistic
                title="学习进度"
                value={progress.learning}
                suffix="%"
                prefix={<ReadOutlined className="text-tenghuang" />}
                valueStyle={{ fontSize: '18px', color: '#1A1A1A' }}
              />
              <Statistic
                title="获得勋章"
                value={progress.badges}
                suffix="枚"
                prefix={<TrophyOutlined className="text-zhuqing" />}
                valueStyle={{ fontSize: '18px', color: '#1A1A1A' }}
              />
            </div>
          </div>
        </Card>

        {/* Quick links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickLinks.map((link) => (
            <Card
              key={link.key}
              onClick={link.onClick}
              className="group"
              hover
            >
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-lg ${link.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-normal`}>
                  {link.icon}
                </div>
                <div>
                  <Title level={5} className="!mb-1">{link.title}</Title>
                  <Text className="text-danmo text-sm">{link.desc}</Text>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Progress overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <Title level={5} className="!mb-0 flex items-center gap-2">
                <BookOutlined className="text-shiqing" />
                阅读专项进度
              </Title>
              <Badge variant="shiqing">进行中</Badge>
            </div>
            <Text className="text-danmo text-sm block mb-4">
              已完成 {Math.round(progress.reading / 100 * 13)} / 13 章节
            </Text>
            <Progress value={progress.reading} variant="gradient" size="md" />
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <Title level={5} className="!mb-0 flex items-center gap-2">
                <ReadOutlined className="text-zhusha" />
                学习中心进度
              </Title>
              <Badge variant="zhusha">进行中</Badge>
            </div>
            <Text className="text-danmo text-sm block mb-4">
              整体任务完成度
            </Text>
            <Progress value={progress.learning} variant="gradient" size="md" />
          </Card>
        </div>

        {/* Recent activity */}
        <Card>
          <Title level={5} className="!mb-4">最近动态</Title>
          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <Text className="text-danmo">暂无活动记录</Text>
            ) : (
              recentActivities.map((activity, index) => (
                <div key={activity.id}>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'reading' ? 'bg-shiqing' :
                        activity.type === 'quiz' ? 'bg-zhusha' : 'bg-tenghuang'
                      }`} />
                      <Text className="text-mohei">{activity.title}</Text>
                    </div>
                    <Text className="text-danmo text-sm">{activity.date}</Text>
                  </div>
                  {index < recentActivities.length - 1 && (
                    <Divider className="!my-2" />
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
        </div>
      </div>
    </Layout>
  )
}

export default Home
