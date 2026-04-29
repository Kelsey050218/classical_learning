import React, { useEffect, useState } from 'react'
import { Typography, Button, message, Spin, Card as AntCard, Calendar } from 'antd'
import { CalendarOutlined, FireOutlined } from '@ant-design/icons'
import Layout from '../../components/Layout'
import { checkIn, getCheckInStatus, CheckInStatus } from '../../api/checkin'

const { Title, Text } = Typography

const CheckInPage: React.FC = () => {
  const [status, setStatus] = useState<CheckInStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState(false)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    setLoading(true)
    try {
      const res = await getCheckInStatus()
      setStatus(res.data)
    } catch (err) {
      message.error('加载打卡数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async () => {
    setCheckingIn(true)
    try {
      await checkIn()
      message.success('打卡成功！')
      fetchStatus()
    } catch (err: any) {
      message.error(err.response?.data?.detail || '打卡失败')
    } finally {
      setCheckingIn(false)
    }
  }

  const dateCellRender = (value: any) => {
    const date = value.format('YYYY-MM-DD')
    const checkin = status?.checkins.find(c => c.date === date)
    if (checkin) {
      return (
        <div className="text-center">
          <FireOutlined className="text-zhusha" />
        </div>
      )
    }
    return null
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
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Title level={2} className="font-display !mb-2">
            每日打卡
          </Title>
          <Text className="text-danmo">
            坚持每日阅读打卡，积累连续天数，解锁打卡之星勋章
          </Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <AntCard className="text-center">
            <Text className="text-danmo text-sm block">今日打卡</Text>
            <div className="mt-2">
              {status?.is_checked_in_today ? (
                <Text className="text-zhuqing text-lg font-medium">
                  <FireOutlined /> 已打卡
                </Text>
              ) : (
                <Text className="text-danmo text-lg">未打卡</Text>
              )}
            </div>
          </AntCard>
          <AntCard className="text-center">
            <Text className="text-danmo text-sm block">当前连续</Text>
            <div className="mt-2">
              <Text className="text-zhusha text-2xl font-bold">
                {status?.current_consecutive_days || 0} 天
              </Text>
            </div>
          </AntCard>
          <AntCard className="text-center">
            <Text className="text-danmo text-sm block">累计打卡</Text>
            <div className="mt-2">
              <Text className="text-mohei text-2xl font-bold">
                {status?.total_checkins || 0} 天
              </Text>
            </div>
          </AntCard>
        </div>

        {!status?.is_checked_in_today && (
          <div className="text-center mb-6">
            <Button
              type="primary"
              size="large"
              icon={<FireOutlined />}
              onClick={handleCheckIn}
              loading={checkingIn}
              className="bg-zhusha hover:bg-zhusha-light px-8"
            >
              今日打卡
            </Button>
          </div>
        )}

        <AntCard title="打卡日历">
          <Calendar
            fullscreen={false}
            dateCellRender={dateCellRender}
          />
        </AntCard>
      </div>
    </Layout>
  )
}

export default CheckInPage
