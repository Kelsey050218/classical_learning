import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Dropdown, Avatar, Badge, message } from 'antd'
import type { MenuProps } from 'antd'
import {
  BookOutlined,
  ReadOutlined,
  UserOutlined,
  HomeOutlined,
  LogoutOutlined,
  DownOutlined,
  BellOutlined,
  TrophyOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '../../stores/auth'
import { clearTokens } from '../../api/client'

interface HeaderProps {
  onMenuClick?: () => void
}

const Header: React.FC<HeaderProps> = ({ onMenuClick: _onMenuClick }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [unreadCount] = useState(2)

  const handleLogout = () => {
    clearTokens()
    logout()
    message.success('已退出登录')
    navigate('/login')
  }

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const navItems = [
    { key: '/', icon: <HomeOutlined />, label: '首页' },
    { key: '/reading', icon: <BookOutlined />, label: '名著阅读' },
    { key: '/learning', icon: <ReadOutlined />, label: '学习中心' },
    { key: '/exhibition', icon: <TrophyOutlined />, label: '成果展厅' },
    { key: '/profile', icon: <UserOutlined />, label: '我的中心' },
  ]

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
      onClick: () => navigate('/profile'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ]

  return (
    <header className="sticky top-0 z-50 bg-xuanzhi border-b border-danmo-light shadow-paper">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="w-10 h-10 bg-zhusha rounded flex items-center justify-center">
                <span className="text-white font-display text-xl font-bold">经</span>
              </div>
              <span className="font-display text-xl font-semibold text-mohei">
                经典常谈
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 ml-8">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => navigate(item.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-fast ease-out ${
                    isActive(item.key)
                      ? 'text-zhusha bg-zhusha-50'
                      : 'text-danmo hover:text-shiqing hover:bg-shiqing-50'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Badge count={unreadCount} size="small" offset={[-4, 4]}>
              <button className="p-2 rounded-lg text-danmo hover:text-zhusha hover:bg-zhusha-50 transition-colors">
                <BellOutlined className="text-lg" />
              </button>
            </Badge>

            {/* User menu */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-xuanzhi-warm transition-colors">
                <Avatar
                  size="small"
                  src="/avatar-default.png"
                  icon={<UserOutlined />}
                  className="bg-shiqing"
                />
                <span className="hidden sm:block text-mohei font-medium">
                  {user?.real_name || user?.username}
                </span>
                <DownOutlined className="text-xs text-danmo" />
              </button>
            </Dropdown>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
