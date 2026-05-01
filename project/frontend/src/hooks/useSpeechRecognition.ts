import { useCallback, useEffect, useRef, useState } from 'react'

interface SpeechRecognitionEventLike {
  resultIndex: number
  results: ArrayLike<{
    isFinal: boolean
    0: { transcript: string }
  }>
}

interface SpeechRecognitionLike {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((e: SpeechRecognitionEventLike) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

interface UseSpeechRecognitionOptions {
  lang?: string
  onError?: (error: string) => void
  onFinalResult?: (transcript: string) => void
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const { lang = 'zh-CN', onError, onFinalResult } = options
  const [isListening, setIsListening] = useState(false)
  const [interim, setInterim] = useState('')
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const finalBufferRef = useRef('')

  const supported = !!getSpeechRecognitionCtor()

  const stop = useCallback(() => {
    const rec = recognitionRef.current
    if (rec) {
      try {
        rec.stop()
      } catch {
        // ignore
      }
    }
  }, [])

  const start = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) {
      onError?.('当前浏览器不支持语音识别，请使用 Chrome / Edge / Safari')
      return
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch {
        // ignore
      }
    }

    const rec = new Ctor()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = lang
    finalBufferRef.current = ''
    setInterim('')

    rec.onresult = (event) => {
      let interimText = ''
      let finalText = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i]
        if (r.isFinal) {
          finalText += r[0].transcript
        } else {
          interimText += r[0].transcript
        }
      }
      if (finalText) {
        finalBufferRef.current += finalText
      }
      setInterim(interimText)
    }

    rec.onerror = (e) => {
      const msg = mapError(e.error)
      if (msg) onError?.(msg)
      setIsListening(false)
    }

    rec.onend = () => {
      setIsListening(false)
      setInterim('')
      const final = finalBufferRef.current.trim()
      if (final) {
        onFinalResult?.(final)
      }
      finalBufferRef.current = ''
      recognitionRef.current = null
    }

    recognitionRef.current = rec
    try {
      rec.start()
      setIsListening(true)
    } catch (e) {
      setIsListening(false)
      onError?.('无法启动语音识别，请检查麦克风权限')
    }
  }, [lang, onError, onFinalResult])

  const toggle = useCallback(() => {
    if (isListening) {
      stop()
    } else {
      start()
    }
  }, [isListening, start, stop])

  useEffect(() => {
    return () => {
      const rec = recognitionRef.current
      if (rec) {
        try {
          rec.abort()
        } catch {
          // ignore
        }
        recognitionRef.current = null
      }
    }
  }, [])

  return { supported, isListening, interim, start, stop, toggle }
}

function mapError(code: string): string | null {
  switch (code) {
    case 'no-speech':
      return '没有检测到语音，请再试一次'
    case 'audio-capture':
      return '无法访问麦克风，请检查设备'
    case 'not-allowed':
    case 'service-not-allowed':
      return '麦克风权限被拒绝，请在浏览器设置中允许'
    case 'network':
      return '语音识别需要联网，请检查网络'
    case 'aborted':
      return null
    default:
      return `语音识别错误：${code}`
  }
}
