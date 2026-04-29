import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Dropdown, Avatar, Badge, message, Popover, List, Empty, Button } from 'antd'
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
  CheckCircleOutlined,
  LikeOutlined,
  MessageOutlined,
  PushpinOutlined,
  DeleteOutlined,
  SoundOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '../../stores/auth'
import { clearTokens } from '../../api/client'
import {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  NotificationItem,
} from '../../api/notifications'

interface HeaderProps {
  onMenuClick?: () => void
}

const typeIcons: Record<string, React.ReactNode> = {
  like: <LikeOutlined className="text-zhusha" />,
  comment: <MessageOutlined className="text-shiqing" />,
  pinned: <PushpinOutlined className="text-tenghuang" />,
  unlisted: <DeleteOutlined className="text-danmo" />,
  vote_open: <SoundOutlined className="text-zhusha" />,
  vote_close: <SoundOutlined className="text-danmo" />,
  system: <SoundOutlined className="text-shiqing" />,
}

const Header: React.FC<HeaderProps> = ({ onMenuClick: _onMenuClick }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationOpen, setNotificationOpen] = useState(false)

  const fetchNotifications = async () => {
    try {
      const res = await listNotifications()
      setNotifications(res.data)
    } catch {
      // ignore
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadCount()
      setUnreadCount(res.data.count)
    } catch {
      setUnreadCount(0)
    }
  }

  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    clearTokens()
    logout()
    message.success('已退出登录')
    navigate('/login')
  }

  const handleMarkAsRead = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    try {
      await markAsRead(id)
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {
      message.error('操作失败')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
      message.success('全部已读')
    } catch {
      message.error('操作失败')
    }
  }

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.is_read) {
      markAsRead(item.id)
      setNotifications(prev =>
        prev.map(n => (n.id === item.id ? { ...n, is_read: true } : n))
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
    if (item.related_type === 'work' && item.related_id) {
      navigate(`/exhibition`)
    }
    setNotificationOpen(false)
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

  const notificationContent = (
    <div className="w-80">
      <div className="flex items-center justify-between px-4 py-3 border-b border-danmo-light">
        <span className="font-medium text-mohei">消息通知</span>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={handleMarkAllAsRead}>
            全部已读
          </Button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <Empty description="暂无通知" className="py-6" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <List
            dataSource={notifications.slice(0, 20)}
            renderItem={(item) => (
              <List.Item
                className={`cursor-pointer px-4 hover:bg-xuanzhi-warm transition-colors ${
                  item.is_read ? 'bg-white' : 'bg-xuanzhi-warm/50'
                }`}
                onClick={() => handleNotificationClick(item)}
              >
                <div className="flex gap-3 w-full py-1">
                  <div className="flex-shrink-0 mt-0.5">
                    {typeIcons[item.notification_type] || <SoundOutlined />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-mohei leading-snug">
                        {item.title}
                      </p>
                      {!item.is_read && (
                        <button
                          onClick={(e) => handleMarkAsRead(e, item.id)}
                          className="flex-shrink-0 text-xs text-danmo hover:text-shiqing"
                          title="标记已读"
                        >
                          <CheckCircleOutlined />
                        </button>
                      )}
                    </div>
                    {item.content && (
                      <p className="text-xs text-danmo mt-1 line-clamp-2">{item.content}</p>
                    )}
                    <span className="text-xs text-gray-400 mt-1 block">
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  )

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
              <img
                src="https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/logo-avatar.jpg"
                alt="经典常谈"
                className="w-10 h-10 rounded object-cover"
              />
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
            <Popover
              content={notificationContent}
              trigger="click"
              open={notificationOpen}
              onOpenChange={(open) => {
                setNotificationOpen(open)
                if (open) fetchNotifications()
              }}
              placement="bottomRight"
            >
              <Badge count={unreadCount} size="small" offset={[-4, 4]}>
                <button className="p-2 rounded-lg text-danmo hover:text-zhusha hover:bg-zhusha-50 transition-colors">
                  <BellOutlined className="text-lg" />
                </button>
              </Badge>
            </Popover>

            {/* User menu */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-xuanzhi-warm transition-colors">
                <Avatar
                  size="small"
                  src="https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/avatar-default.png"
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
