import React, { useState } from 'react'
import { Form, Input, Typography, message, Spin } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import apiClient, { setTokens } from '../api/client'
import { useAuthStore } from '../stores/auth'
import Button from '../components/UI/Button'

const { Title } = Typography

interface LoginForm {
  username: string
  password: string
}

interface LoginResponse {
  access_token: string
  refresh_token: string
  user: {
    id: number
    username: string
    student_id: string
    real_name?: string
    class_name?: string
    role: 'student' | 'admin'
  }
}

const VIDEO_URL = 'https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/video/%E5%8A%A8%E6%80%81%E7%BF%BB%E9%A1%B5%E8%A7%86%E9%A2%91.mp4'

const Login: React.FC = () => {
  const { setUser } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: LoginForm) => {
    setLoading(true)
    try {
      console.log('Attempting login with:', values)
      const response = await apiClient.post<LoginResponse>('/auth/login', values)
      console.log('Login response:', response.data)
      const { access_token, refresh_token, user } = response.data

      setTokens(access_token, refresh_token)
      setUser(user)
      message.success('登录成功！')

      // Use window.location for a full page navigation
      window.location.href = '/'
    } catch (error: any) {
      console.error('Login error:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      const errorMsg = error.response?.data?.detail || error.message || '登录失败，请检查用户名和密码'
      message.error(String(errorMsg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-xuanzhi via-xuanzhi-warm to-xuanzhi-dark relative overflow-hidden">
      {/* Video background */}
      <video
        src={VIDEO_URL}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
      />

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-zhusha-100 rounded-full opacity-50 blur-3xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-shiqing-100 rounded-full opacity-50 blur-3xl" />
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-tenghuang-100 rounded-full opacity-30 blur-2xl" />

      {/* Login card */}
      <div className="w-full max-w-md px-4 animate-fade-in-up">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-card p-8 border border-danmo-light">
          {/* Header */}
          <div className="text-center mb-8">
            <Title level={2} className="font-display !mb-2 !text-mohei">
              经典常谈
            </Title>
            <p className="text-danmo text-sm">
              中学生名著导读与阅读任务系统
            </p>
          </div>

          {/* Form */}
          <Form
            name="login"
            onFinish={onFinish}
            size="large"
            className="space-y-4"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined className="text-danmo" />}
                placeholder="用户名"
                autoComplete="username"
                className="border-0 border-b-2 border-danmo-light rounded-none px-0 py-2 hover:border-zhusha focus:border-zhusha transition-colors"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-danmo" />}
                placeholder="密码"
                autoComplete="current-password"
                className="border-0 border-b-2 border-danmo-light rounded-none px-0 py-2 hover:border-zhusha focus:border-zhusha transition-colors"
              />
            </Form.Item>

            <Form.Item className="!mt-8">
              <Button
                customVariant="primary"
                customSize="lg"
                htmlType="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? <Spin size="small" className="!text-white" /> : '登 录'}
              </Button>
            </Form.Item>
          </Form>

          {/* Links */}
          <div className="mt-6 text-center text-sm text-danmo">
            <span>还没有账号？</span>
            <button
              onClick={() => message.info('请联系老师注册账号')}
              className="ml-1 text-zhusha hover:text-zhusha-light transition-colors"
            >
              联系管理员
            </button>
          </div>

          {/* Footer text */}
          <div className="mt-8 pt-6 border-t border-danmo-light">
            <p className="text-xs text-center text-danmo">
              经典常谈 - 朱自清
            </p>
            <p className="text-xs text-center text-danmo mt-1">
              &quot;在中等以上的教育里，经典训练应该是一个必要的项目&quot;
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
