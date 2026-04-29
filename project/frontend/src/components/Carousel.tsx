import React from 'react'
import { Carousel as AntCarousel } from 'antd'

const images = [
  { src: 'https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/images/carousel/1_shuowenjiezi.jpg', title: '说文解字' },
  { src: 'https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/images/carousel/2_zhouyi.jpg', title: '周易' },
  { src: 'https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/images/carousel/3_shangshu.jpg', title: '尚书' },
  { src: 'https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/images/carousel/4_shijing.jpg', title: '诗经' },
  { src: 'https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/images/carousel/5_sanli.jpg', title: '三礼' },
  { src: 'https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/images/carousel/6_chunqiu_sanzhuan.jpg', title: '春秋三传' },
  { src: 'https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/images/carousel/7_sishu.jpg', title: '四书' },
  { src: 'https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/images/carousel/8_zhanguoce.jpg', title: '战国策' },
  { src: 'https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/images/carousel/9_shiji_hanshu.jpg', title: '史记汉书' },
  { src: 'https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/images/carousel/10_zhuzibaijia.jpg', title: '诸子百家' },
  { src: 'https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/images/carousel/11_cifu.jpg', title: '辞赋' },
  { src: 'https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/images/carousel/12_shige.jpg', title: '诗歌' },
  { src: 'https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/images/carousel/13_sanwen.jpg', title: '散文' },
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
