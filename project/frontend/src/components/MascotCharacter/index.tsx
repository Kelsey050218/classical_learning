import React, { useEffect, useRef, useState } from 'react'
import { Drawer, Input, Button, Typography, message, Tooltip } from 'antd'
import {
  SendOutlined,
  CloseOutlined,
  UserOutlined,
  AudioOutlined,
  AudioMutedOutlined,
} from '@ant-design/icons'
import { getAccessToken } from '../../api/client'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'
import { useDrag } from './useDrag'
import './style.css'

const { Text } = Typography

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const MascotCharacter: React.FC = () => {
  const [chatVisible, setChatVisible] = useState(false)
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

  const {
    supported: voiceSupported,
    isListening,
    isProcessing: voiceProcessing,
    interim,
    toggle: toggleVoice,
    stop: stopVoice,
  } = useSpeechRecognition({
    onError: (msg) => message.error(msg),
    onFinalResult: (text) => {
      setInput((prev) => (prev ? `${prev}${text}` : text))
    },
  })

  const { position, isDragging, wasDragged, handlers } = useDrag({
    x: 0,
    y: window.innerHeight - 340,
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    if (isListening) {
      stopVoice()
    }

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

  const handleClick = () => {
    if (!wasDragged()) {
      setChatVisible(true)
    }
  }

  const handleClose = () => {
    if (abortRef.current) {
      abortRef.current.abort()
    }
    if (isListening) {
      stopVoice()
    }
    setChatVisible(false)
  }

  return (
    <>
      {/* Mascot Floating Character */}
      <div
        className={`mascot-character ${isDragging ? 'dragging' : ''}`}
        style={{
          left: position.x,
          top: position.y,
        }}
        onMouseDown={handlers.onMouseDown}
        onTouchStart={handlers.onTouchStart}
        onClick={handleClick}
        title="AI 学习助手"
      >
        <div className={`mascot-sprite ${isDragging ? 'dragging' : 'idle'}`}>
          <img
            src="/images/mascot_character.png"
            alt="AI 学习助手"
            draggable={false}
          />
        </div>
      </div>

      {/* Chat Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <img
              src="/images/mascot_character.png"
              alt="AI 学习助手"
              className="w-6 h-6 rounded-full flex-shrink-0 object-cover"
            />
            <span className="font-display">AI 学习助手</span>
          </div>
        }
        placement="right"
        width={480}
        onClose={handleClose}
        open={chatVisible}
        closable={false}
        extra={
          <button
            onClick={handleClose}
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
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${
                    msg.role === 'user'
                      ? 'bg-zhusha text-white'
                      : ''
                  }`}
                >
                  {msg.role === 'user' ? (
                    <UserOutlined className="text-sm" />
                  ) : (
                    <img
                      src="/images/mascot_character.png"
                      alt="AI"
                      className="w-full h-full object-cover"
                    />
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
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src="/images/mascot_character.png"
                    alt="AI"
                    className="w-full h-full object-cover"
                  />
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
            {(isListening || voiceProcessing) && (
              <div className="mb-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-zhusha-50 border border-zhusha-100">
                <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-zhusha opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-zhusha" />
                </span>
                <Text className="text-xs text-zhusha flex-1 truncate">
                  {interim || (voiceProcessing ? '正在识别...' : '正在录音...')}
                </Text>
              </div>
            )}
            <div className="flex gap-2">
              <Input.TextArea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isListening
                    ? '正在录音，再次点击麦克风结束'
                    : voiceProcessing
                    ? '正在识别...'
                    : '输入你的问题，或点击麦克风语音输入'
                }
                autoSize={{ minRows: 1, maxRows: 4 }}
                className="flex-1"
                disabled={loading}
              />
              {voiceSupported && (
                <Tooltip title={isListening ? '点击停止录音' : '点击开始语音输入'}>
                  <Button
                    icon={isListening ? <AudioMutedOutlined /> : <AudioOutlined />}
                    onClick={toggleVoice}
                    disabled={loading || voiceProcessing}
                    loading={voiceProcessing}
                    className={
                      isListening
                        ? '!bg-zhusha !text-white !border-zhusha hover:!bg-zhusha-dark'
                        : ''
                    }
                  />
                </Tooltip>
              )}
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

export default MascotCharacter
