import React, { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import QuickReference from '../QuickReference'
import MascotCharacter from '../MascotCharacter'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarVisible, setSidebarVisible] = useState(false)

  return (
    <div className="min-h-screen bg-xuanzhi flex flex-col">
      {/* Header */}
      <Header onMenuClick={() => setSidebarVisible(true)} />

      {/* Mobile Sidebar */}
      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-danmo-light bg-xuanzhi">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-danmo">
            © 2026 经典常谈 - 中学生名著导读与阅读任务系统
          </p>
        </div>
      </footer>

      {/* Quick Reference Floating Button */}
      <QuickReference />

      {/* Doubao AI Chat */}
      <MascotCharacter />
    </div>
  )
}

export default Layout
