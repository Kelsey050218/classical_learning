import React from 'react'
import { Typography } from 'antd'
import { LockOutlined, CheckCircleOutlined } from '@ant-design/icons'

const { Text } = Typography

export interface BadgeItem {
  type: string
  name: string
  description: string
  icon: string
  is_unlocked: boolean
  awarded_at?: string
  reason?: string
}

interface BadgeWallProps {
  badges: BadgeItem[]
}

const BadgeWall: React.FC<BadgeWallProps> = ({ badges }) => {
  const unlockedCount = badges.filter(b => b.is_unlocked).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Text className="text-mohei font-medium block">我的勋章</Text>
          <Text className="text-danmo text-sm">
            已解锁 {unlockedCount} / {badges.length} 枚勋章
          </Text>
        </div>
        <div className="w-32">
          <div className="h-2 bg-danmo-light rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-zhusha to-tenghuang rounded-full transition-all"
              style={{ width: `${(unlockedCount / badges.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {badges.map((badge) => (
          <div
            key={badge.type}
            className={`relative p-4 rounded-lg border-2 transition-all duration-normal ${
              badge.is_unlocked
                ? 'bg-white border-tenghuang hover:shadow-card-hover'
                : 'bg-xuanzhi border-danmo-light opacity-60'
            }`}
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 relative">
                {badge.is_unlocked ? (
                  <img
                    src={badge.icon}
                    alt={badge.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-danmo-light flex items-center justify-center">
                    <LockOutlined className="text-2xl text-danmo" />
                  </div>
                )}
              </div>
              <Text className={`font-medium block ${badge.is_unlocked ? 'text-mohei' : 'text-danmo'}`}>
                {badge.name}
              </Text>
              <Text className="text-xs text-danmo block mt-1">
                {badge.description}
              </Text>
              {badge.is_unlocked && badge.awarded_at && (
                <div className="mt-2 inline-flex items-center gap-1 bg-tenghuang-100 text-tenghuang-dark text-xs px-2 py-0.5 rounded-full">
                  <CheckCircleOutlined /> {new Date(badge.awarded_at).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BadgeWall
