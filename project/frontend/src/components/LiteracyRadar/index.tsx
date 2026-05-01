import React, { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { LiteracyRadarPayload } from '../../api/profile'

interface Props {
  data: LiteracyRadarPayload
}

const LiteracyRadar: React.FC<Props> = ({ data }) => {
  const option = useMemo(() => {
    const indicators = data.dimensions.map(d => ({
      name: d.label,
      max: 100,
    }))
    // null 维度按 0 渲染以保持八边形完整
    const values = data.dimensions.map(d => (d.score ?? 0))

    return {
      tooltip: {
        trigger: 'item',
      },
      radar: {
        indicator: indicators,
        radius: '65%',
        center: ['50%', '55%'],
        axisName: {
          color: '#1A1A1A',
          fontSize: 12,
          formatter: (name: string) => {
            // 名字过长（超过 5 个汉字）自动换行
            if (name.length > 5) {
              return name.slice(0, 4) + '\n' + name.slice(4)
            }
            return name
          },
        },
        splitArea: {
          areaStyle: {
            color: ['rgba(199, 62, 58, 0.04)', 'rgba(199, 62, 58, 0.08)'],
          },
        },
        splitLine: {
          lineStyle: { color: '#E2D6CC' },
        },
        axisLine: {
          lineStyle: { color: '#E2D6CC' },
        },
      },
      series: [
        {
          name: '阅读素养',
          type: 'radar',
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: '#C73E3A' },
          lineStyle: { color: '#C73E3A', width: 2 },
          areaStyle: { color: 'rgba(199, 62, 58, 0.25)' },
          data: [
            {
              value: values,
              name: '当前得分',
            },
          ],
        },
      ],
    }
  }, [data])

  return (
    <ReactECharts
      option={option}
      style={{ width: '100%', height: 360 }}
      opts={{ renderer: 'svg' }}
    />
  )
}

export default LiteracyRadar
