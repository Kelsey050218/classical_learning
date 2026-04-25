import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Drawer, List, Typography, Spin, message } from 'antd'
import { BookOutlined, CloseOutlined, CheckCircleFilled, ArrowRightOutlined } from '@ant-design/icons'
import { listChapters } from '../../api/chapters'

const { Text } = Typography

interface Chapter {
  id: number
  title: string
  sort_order: number
  is_completed?: boolean
}

const QuickReference: React.FC = () => {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(false)

  const fetchChapters = useCallback(async () => {
    setLoading(true)
    try {
      const res = await listChapters()
      setChapters(res.data)
    } catch (err) {
      message.error('加载原文失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (visible && chapters.length === 0) {
      fetchChapters()
    }
  }, [visible, chapters.length, fetchChapters])

  const handleChapterNavigate = (chapterId: number) => {
    setVisible(false)
    navigate(`/reading?chapter=${chapterId}`)
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setVisible(true)}
        className="fixed bottom-28 right-6 z-50 w-14 h-14 bg-zhusha hover:bg-zhusha-light text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        title="原文速查"
      >
        <BookOutlined className="text-xl" />
      </button>

      {/* Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <BookOutlined className="text-zhusha" />
            <span className="font-display">原文速查</span>
          </div>
        }
        placement="right"
        width={320}
        onClose={() => setVisible(false)}
        open={visible}
        closable={false}
        extra={
          <button
            onClick={() => setVisible(false)}
            className="p-2 rounded-lg hover:bg-xuanzhi-warm text-danmo transition-colors"
          >
            <CloseOutlined />
          </button>
        }
      >
        <div className="h-[calc(100vh-120px)]">
          <Text className="text-xs text-danmo mb-2 font-medium block">篇目导航</Text>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Spin size="small" />
            </div>
          ) : (
            <List
              dataSource={chapters}
              renderItem={(chapter) => (
                <List.Item
                  className="!px-2 !py-1.5 rounded-lg cursor-pointer transition-colors hover:bg-xuanzhi-warm text-mohei"
                  onClick={() => handleChapterNavigate(chapter.id)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-xs font-medium w-5 text-center text-danmo">
                      {chapter.sort_order}
                    </span>
                    <span className="text-sm flex-1 truncate">{chapter.title}</span>
                    {chapter.is_completed && (
                      <CheckCircleFilled className="text-zhuqing text-xs" />
                    )}
                    <ArrowRightOutlined className="text-xs text-danmo" />
                  </div>
                </List.Item>
              )}
            />
          )}
        </div>
      </Drawer>
    </>
  )
}

export default QuickReference
