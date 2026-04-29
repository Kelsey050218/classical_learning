import React from 'react'
import { Carousel as AntCarousel } from 'antd'

const images = [
  { src: '/images/carousel/1_shuowenjiezi.webp', title: '说文解字' },
  { src: '/images/carousel/2_zhouyi.webp', title: '周易' },
  { src: '/images/carousel/3_shangshu.webp', title: '尚书' },
  { src: '/images/carousel/4_shijing.webp', title: '诗经' },
  { src: '/images/carousel/5_sanli.webp', title: '三礼' },
  { src: '/images/carousel/6_chunqiu_sanzhuan.webp', title: '春秋三传' },
  { src: '/images/carousel/7_sishu.webp', title: '四书' },
  { src: '/images/carousel/8_zhanguoce.webp', title: '战国策' },
  { src: '/images/carousel/9_shiji_hanshu.webp', title: '史记汉书' },
  { src: '/images/carousel/10_zhuzibaijia.webp', title: '诸子百家' },
  { src: '/images/carousel/11_cifu.webp', title: '辞赋' },
  { src: '/images/carousel/12_shige.webp', title: '诗歌' },
  { src: '/images/carousel/13_sanwen.webp', title: '散文' },
]

const Carousel: React.FC = () => {
  return (
    <div className="rounded-lg overflow-hidden shadow-card">
      <AntCarousel
        autoplay
        autoplaySpeed={4000}
        effect="fade"
        dots={{ className: 'custom-dots' }}
      >
        {images.map((item) => (
          <div key={item.src} className="relative">
            <div className="aspect-[16/7] md:aspect-[16/6] lg:aspect-[16/5] w-full">
              <img
                src={item.src}
                alt={item.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent py-8 px-6">
              <h3 className="text-white text-xl md:text-2xl font-display font-semibold">
                {item.title}
              </h3>
            </div>
          </div>
        ))}
      </AntCarousel>
    </div>
  )
}

export default Carousel
