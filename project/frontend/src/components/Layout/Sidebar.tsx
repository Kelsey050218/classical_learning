import React from 'react'
import { Drawer, Menu } from 'antd'
import {
  HomeOutlined,
  BookOutlined,
  ReadOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'

interface SidebarProps {
  visible: boolean
  onClose: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ visible, onClose }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: '首页' },
    { key: '/reading', icon: <BookOutlined />, label: '名著阅读' },
    { key: '/learning', icon: <ReadOutlined />, label: '学习中心' },
    { key: '/profile', icon: <UserOutlined />, label: '我的中心' },
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
    onClose()
  }

  return (
    <Drawer
      title={
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zhusha rounded flex items-center justify-center">
            <span className="text-white font-display font-bold">经</span>
          </div>
          <span className="font-display text-lg font-semibold">经典常谈</span>
        </div>
      }
      placement="left"
      onClose={onClose}
      open={visible}
      width={280}
      className="mobile-sidebar"
      styles={{
        body: { padding: 0, background: '#F8F6F1' },
        header: { background: '#F8F6F1', borderBottom: '1px solid #E8E4DC' },
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ background: 'transparent', border: 'none' }}
        className="mt-4"
      />

      {/* Footer info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-danmo-light">
        <p className="text-xs text-danmo text-center">
          中学生名著导读与阅读任务系统
        </p>
      </div>
    </Drawer>
  )
}

export default Sidebar
