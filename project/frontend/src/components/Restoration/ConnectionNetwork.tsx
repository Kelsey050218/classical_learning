import React from 'react'

interface Connection {
  from: string
  to: string
  label: string
  quote: string
}

const CONNECTIONS: Connection[] = [
  { from: '文字之源', to: '上古之书', label: '文字→记言', quote: '《尚书》是中国最古的记言的历史。' },
  { from: '诗之源头', to: '楚辞汉赋', label: '诗歌→辞赋', quote: '屈原因遭谗言，被楚怀王放逐。他心中忧愤，写下了《离骚》。' },
  { from: '楚辞汉赋', to: '诗之江河', label: '辞赋→诗歌', quote: '汉武帝立乐府，采集代、赵、秦、楚的歌谣和乐谱。' },
  { from: '诗之江河', to: '文之脉络', label: '诗歌→散文', quote: '诗、词、曲，一脉相承，构成了中国古典诗歌的灿烂长河。' },
  { from: '礼乐之典', to: '圣贤之书', label: '礼乐→儒学', quote: '《大学》原是《礼记》中的一篇。朱熹把它抽出来，列为四书之首。' },
  { from: '史家双璧', to: '百家争鸣', label: '史学→诸子', quote: '司马迁不仅记录了历史事件，还描写了许多栩栩如生的人物。' },
  { from: '春秋笔法', to: '史家双璧', label: '编年→纪传', quote: '《春秋》只是鲁国史官的旧文，孔子不曾掺进手去。' },
  { from: '纵横之策', to: '史家双璧', label: '策士→史学', quote: '记载这些策士言行的书，便是《战国策》。' },
]

const NODES = [
  '文字之源', '阴阳之书', '上古之书', '诗之源头', '礼乐之典',
  '春秋笔法', '圣贤之书', '纵横之策', '史家双璧', '百家争鸣',
  '楚辞汉赋', '诗之江河', '文之脉络',
]

const ConnectionNetwork: React.FC = () => {
  return (
    <div className="relative min-h-[400px] p-6 bg-white/60 rounded-xl border border-[#D4A574]/30">
      <p className="text-center text-sm text-danmo mb-4">经典关联网络</p>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {NODES.map(node => (
          <div
            key={node}
            className="px-3 py-2 rounded-lg bg-[#FAF8F3] border border-[#D4A574]/30 text-center text-xs text-[#2F2F2F]"
          >
            {node}
          </div>
        ))}
      </div>
      <div className="mt-6 space-y-2">
        {CONNECTIONS.map((conn, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <span className="text-[#2F2F2F]">{conn.from}</span>
            <span className="text-[#8B7355]">→</span>
            <span className="text-[#2F2F2F]">{conn.to}</span>
            <span className="text-danmo">({conn.label})</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ConnectionNetwork
