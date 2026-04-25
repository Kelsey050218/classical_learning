import React, { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import QuickReference from '../QuickReference'
import DoubaoChat from '../DoubaoChat'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarVisible, setSidebarVisible] = useState(false)

  return (
    <div className="min-h-screen bg-xuanzhi">
      {/* Header */}
      <Header onMenuClick={() => setSidebarVisible(true)} />

      {/* Mobile Sidebar */}
      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-danmo-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-danmo">
            © 2024 经典常谈 - 中学生名著导读与阅读任务系统
          </p>
        </div>
      </footer>

      {/* Quick Reference Floating Button */}
      <QuickReference />

      {/* Doubao AI Chat */}
      <DoubaoChat />
    </div>
  )
}

export default Layout
