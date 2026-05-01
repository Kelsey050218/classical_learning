import React from 'react'

const VIDEO_URL = 'https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/video/%E5%8A%A8%E6%80%81%E7%BF%BB%E9%A1%B5%E8%A7%86%E9%A2%91.mp4'

const VideoBanner: React.FC = () => {
  return (
    <div className="rounded-lg overflow-hidden shadow-card relative bg-black">
      <div className="aspect-[16/7] md:aspect-[16/6] lg:aspect-[16/5] w-full">
        <video
          src={VIDEO_URL}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-100"
          style={{ opacity: 1 }}
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent py-8 px-6">
        <h3 className="text-white text-xl md:text-2xl font-display font-semibold">
          动态翻页效果展示
        </h3>
      </div>
    </div>
  )
}

export default VideoBanner
