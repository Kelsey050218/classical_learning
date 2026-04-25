import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { message } from 'antd'
import apiClient, { setTokens, clearTokens } from '../api/client'
import { useAuthStore } from '../stores/auth'

interface LoginData {
  username: string
  password: string
}

interface RegisterData {
  username: string
  password: string
  student_id: string
  real_name?: string
  class_name?: string
}

interface AuthResponse {
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

export const useAuth = () => {
  const navigate = useNavigate()
  const { setUser, logout: clearUser } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (data: LoginData) => {
    setLoading(true)
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', data)
      const { access_token, refresh_token, user } = response.data

      setTokens(access_token, refresh_token)
      setUser(user)
      message.success('登录成功！')
      navigate('/')
      return { success: true }
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || '登录失败，请检查用户名和密码'
      message.error(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }, [navigate, setUser])

  const register = useCallback(async (data: RegisterData) => {
    setLoading(true)
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data)
      const { access_token, refresh_token, user } = response.data

      setTokens(access_token, refresh_token)
      setUser(user)
      message.success('注册成功！')
      navigate('/')
      return { success: true }
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || '注册失败'
      message.error(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }, [navigate, setUser])

  const logout = useCallback(() => {
    clearTokens()
    clearUser()
    message.success('已退出登录')
    navigate('/login')
  }, [navigate, clearUser])

  const refreshToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        throw new Error('No refresh token')
      }

      const response = await apiClient.post('/auth/refresh', {
        refresh_token: refreshToken,
      })

      const { access_token, refresh_token } = response.data
      setTokens(access_token, refresh_token)
      return access_token
    } catch (error) {
      clearTokens()
      clearUser()
      navigate('/login')
      return null
    }
  }, [navigate, clearUser])

  return {
    login,
    register,
    logout,
    refreshToken,
    loading,
  }
}
