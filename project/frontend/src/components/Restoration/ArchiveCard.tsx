import React from 'react'
import { CheckCircleOutlined } from '@ant-design/icons'
import { ArchiveData } from '../../api/restoration'

interface ArchiveCardProps {
  data: ArchiveData
}

const ArchiveCard: React.FC<ArchiveCardProps> = ({ data }) => {
  return (
    <div className="rounded-xl border border-[#D4A574]/50 bg-white/80 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#2F2F2F] font-display">{data.chapter.alias}</h2>
          <p className="text-sm text-[#8B7355]">{data.chapter.name}</p>
        </div>
        <div className="w-16 h-16 rounded-full bg-[#C73E3A]/10 flex items-center justify-center">
          <CheckCircleOutlined className="text-2xl text-[#C73E3A]" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-danmo mb-1">时代定位</p>
          <p className="text-sm text-[#2F2F2F]">{data.chapter.positioning}</p>
        </div>
        <div>
          <p className="text-xs text-danmo mb-1">核心内容</p>
          <p className="text-sm text-[#2F2F2F] leading-relaxed">{data.archive_summary}</p>
        </div>
      </div>

      <div className="border-t border-[#D4A574]/30 pt-4">
        <p className="text-xs text-danmo mb-1">历史影响</p>
        <p className="text-sm text-[#2F2F2F] leading-relaxed italic" style={{ fontFamily: 'serif' }}>
          {data.archive_impact}
        </p>
      </div>
    </div>
  )
}

export default ArchiveCard
