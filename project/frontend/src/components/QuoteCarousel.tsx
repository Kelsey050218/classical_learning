import React, { useState, useEffect } from 'react'

const quotes = [
  {
    text: '如果读者能把它当作一只船，航到经典的海里去，编撰者将自己庆幸，在经典训练上，尽了他做尖兵的一份儿。',
    source: '朱自清《经典常谈》· 序言',
  },
  {
    text: '在中等以上的教育里，经典训练应该是一个必要的项目。经典训练的价值不在实用，而在文化。',
    source: '朱自清《经典常谈》· 序言',
  },
  {
    text: '诗可以陶冶性情，便是这个意思，所谓温柔敦厚的诗教，也只该是这个意思。',
    source: '朱自清《经典常谈》· 《诗经》第四',
  },
  {
    text: '"离骚"是"别愁"或"遭忧"的意思。他是个富于感情的人，那一腔抑制不住的悲愤，随着他的笔奔迸出来。',
    source: '朱自清《经典常谈》· 《辞赋》第十一',
  },
  {
    text: '天地代表生命的本源，亲是祖先的意思，祖先是家族的本源，君师是政教的本源。',
    source: '朱自清《经典常谈》· 《三礼》第五',
  },
]

const QuoteCarousel: React.FC = () => {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % quotes.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="mb-10">
      <div className="relative overflow-hidden rounded-lg border border-danmo-light/60 bg-xuanzhi-warm/70">
        {/* Left vertical line */}
        <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-zhusha rounded-full" />

        {/* Large quote mark decoration */}
        <div className="absolute top-1 left-4 text-zhusha/10 text-6xl font-display leading-none select-none pointer-events-none">
          &ldquo;
        </div>

        <div className="relative h-40">
          {quotes.map((q, i) => (
            <div
              key={i}
              className="absolute inset-0 flex flex-col justify-center px-6 md:px-10 transition-all duration-700 ease-in-out"
              style={{
                transform: `translateY(${(i - index) * 100}%)`,
                opacity: i === index ? 1 : 0,
              }}
            >
              <p className="font-display text-mohei text-base md:text-lg leading-relaxed pr-2">
                {q.text}
              </p>
              <p className="text-right text-zhusha/70 text-sm mt-3 font-display">
                ——{q.source}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Indicators */}
      <div className="flex justify-center gap-2 mt-3">
        {quotes.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1 rounded-full transition-all ${
              i === index ? 'bg-zhusha w-5' : 'bg-danmo-light w-1'
            }`}
            aria-label={`切换到第${i + 1}条名言`}
          />
        ))}
      </div>
    </div>
  )
}

export default QuoteCarousel
