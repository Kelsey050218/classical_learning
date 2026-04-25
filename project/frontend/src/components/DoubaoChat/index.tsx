import React, { useEffect, useRef, useState } from 'react'
import { Drawer, Input, Button, Typography, message } from 'antd'
import { RobotOutlined, SendOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons'
import { getAccessToken } from '../../api/client'

const { Text } = Typography

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const DoubaoChat: React.FC = () => {
  const [visible, setVisible] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        '你好！我是你的经典常谈学习助手。有什么关于《经典常谈》的问题，随时可以问我！',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: ChatMessage = { role: 'user', content: text }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)
    setStreamingContent('')

    const firstUserIdx = updatedMessages.findIndex((m) => m.role === 'user')
    const apiMessages = updatedMessages
      .filter((m, idx) => {
        if (firstUserIdx === -1) return false
        if (m.role === 'assistant' && idx < firstUserIdx) return false
        return true
      })
      .map((m) => ({ role: m.role, content: m.content }))

    const abortController = new AbortController()
    abortRef.current = abortController

    try {
      const token = getAccessToken()
      const res = await fetch('/api/ai/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ messages: apiMessages }),
        signal: abortController.signal,
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || `请求失败: ${res.status}`)
      }

      const reader = res.body?.getReader()
      if (!reader) {
        throw new Error('无法读取响应流')
      }

      const decoder = new TextDecoder()
      let buffer = ''
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data: ')) continue
          const dataStr = trimmed.slice(6)
          if (dataStr === '[DONE]') continue
          try {
            const data = JSON.parse(dataStr)
            if (data.error) {
              throw new Error(data.error)
            }
            if (data.done) {
              break
            }
            if (data.content) {
              fullContent += data.content
              setStreamingContent(fullContent)
            }
          } catch (e: any) {
            if (e.message && !e.message.includes('JSON')) {
              throw e
            }
          }
        }
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: fullContent || '抱歉，AI 暂时没有回复。' }])
      setStreamingContent('')
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User aborted, add whatever we have
        if (streamingContent) {
          setMessages((prev) => [...prev, { role: 'assistant', content: streamingContent }])
          setStreamingContent('')
        }
      } else {
        const errMsg = err?.message || 'AI 回复失败，请稍后重试'
        message.error(errMsg)
        console.error('AI chat error:', err)
      }
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setVisible(true)}
        className="fixed bottom-48 right-6 z-50 w-14 h-14 bg-shiqing hover:bg-shiqing-dark text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        title="AI 学习助手"
      >
        <RobotOutlined className="text-xl" />
      </button>

      {/* Chat Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <RobotOutlined className="text-shiqing" />
            <span className="font-display">AI 学习助手</span>
          </div>
        }
        placement="right"
        width={480}
        onClose={() => {
          if (abortRef.current) {
            abortRef.current.abort()
          }
          setVisible(false)
        }}
        open={visible}
        closable={false}
        extra={
          <button
            onClick={() => {
              if (abortRef.current) {
                abortRef.current.abort()
              }
              setVisible(false)
            }}
            className="p-2 rounded-lg hover:bg-xuanzhi-warm text-danmo transition-colors"
          >
            <CloseOutlined />
          </button>
        }
      >
        <div className="flex flex-col h-[calc(100vh-120px)]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user'
                      ? 'bg-zhusha text-white'
                      : 'bg-shiqing text-white'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <UserOutlined className="text-sm" />
                  ) : (
                    <RobotOutlined className="text-sm" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-lg p-3 text-sm ${
                    msg.role === 'user'
                      ? 'bg-zhusha-50 text-mohei'
                      : 'bg-xuanzhi-warm text-mohei'
                  }`}
                >
                  <Text className="!text-mohei whitespace-pre-wrap">{msg.content}</Text>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-shiqing text-white flex items-center justify-center flex-shrink-0">
                  <RobotOutlined className="text-sm" />
                </div>
                <div className="bg-xuanzhi-warm rounded-lg p-3 max-w-[80%]">
                  {streamingContent ? (
                    <Text className="!text-mohei whitespace-pre-wrap">{streamingContent}</Text>
                  ) : (
                    <Text className="text-danmo text-sm">AI 正在思考...</Text>
                  )}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="mt-4 pt-3 border-t border-danmo-light">
            <div className="flex gap-2">
              <Input.TextArea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入你的问题..."
                autoSize={{ minRows: 1, maxRows: 4 }}
                className="flex-1"
                disabled={loading}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSend}
                loading={loading && !streamingContent}
                disabled={loading}
                className="bg-shiqing hover:bg-shiqing-dark"
              />
            </div>
          </div>
        </div>
      </Drawer>
    </>
  )
}

export default DoubaoChat
