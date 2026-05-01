import { useCallback, useEffect, useRef, useState } from 'react'
import { getAccessToken } from '../api/client'

interface UseSpeechRecognitionOptions {
  onError?: (error: string) => void
  onFinalResult?: (transcript: string) => void
  endpoint?: string
  maxDurationMs?: number
}

interface SpeechRecognitionState {
  supported: boolean
  isListening: boolean
  isProcessing: boolean
  interim: string
  start: () => void
  stop: () => void
  toggle: () => void
}

const TARGET_SAMPLE_RATE = 16000
const DEFAULT_MAX_DURATION_MS = 60_000

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {},
): SpeechRecognitionState {
  const {
    onError,
    onFinalResult,
    endpoint = '/api/ai/asr',
    maxDurationMs = DEFAULT_MAX_DURATION_MS,
  } = options

  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [interim, setInterim] = useState('')

  const audioCtxRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Float32Array[]>([])
  const stopTimerRef = useRef<number | null>(null)
  const cancelledRef = useRef(false)

  const supported =
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    !!(window.AudioContext || (window as any).webkitAudioContext)

  const cleanupAudio = useCallback(() => {
    if (stopTimerRef.current !== null) {
      window.clearTimeout(stopTimerRef.current)
      stopTimerRef.current = null
    }
    try {
      processorRef.current?.disconnect()
    } catch {
      // ignore
    }
    try {
      sourceRef.current?.disconnect()
    } catch {
      // ignore
    }
    streamRef.current?.getTracks().forEach((t) => t.stop())
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => undefined)
    }
    processorRef.current = null
    sourceRef.current = null
    streamRef.current = null
    audioCtxRef.current = null
  }, [])

  const uploadAudio = useCallback(
    async (wavBlob: Blob) => {
      try {
        const token = getAccessToken()
        const formData = new FormData()
        formData.append('audio', wavBlob, 'speech.wav')
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        })
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.detail || `识别请求失败: ${res.status}`)
        }
        const data = await res.json()
        const text = (data.text || '').trim()
        if (!text) {
          onError?.('没有识别到内容，请再试一次')
          return
        }
        onFinalResult?.(text)
      } catch (err: any) {
        onError?.(err?.message || '语音识别失败')
      } finally {
        setIsProcessing(false)
        setInterim('')
      }
    },
    [endpoint, onError, onFinalResult],
  )

  const stop = useCallback(() => {
    if (!isListening) return
    setIsListening(false)
    setInterim('正在识别...')

    const chunks = chunksRef.current
    const ctx = audioCtxRef.current
    const sampleRate = ctx?.sampleRate ?? TARGET_SAMPLE_RATE
    cleanupAudio()
    chunksRef.current = []

    if (cancelledRef.current) {
      cancelledRef.current = false
      setInterim('')
      return
    }

    if (chunks.length === 0) {
      setInterim('')
      onError?.('没有录到声音，请检查麦克风')
      return
    }

    const merged = mergeFloat32(chunks)
    const resampled =
      sampleRate === TARGET_SAMPLE_RATE
        ? merged
        : downsample(merged, sampleRate, TARGET_SAMPLE_RATE)

    if (resampled.length < TARGET_SAMPLE_RATE * 0.3) {
      setInterim('')
      onError?.('录音太短，请再试一次')
      return
    }

    const wavBlob = encodeWav(resampled, TARGET_SAMPLE_RATE)
    setIsProcessing(true)
    void uploadAudio(wavBlob)
  }, [cleanupAudio, isListening, onError, uploadAudio])

  const start = useCallback(async () => {
    if (isListening || isProcessing) return
    if (!supported) {
      onError?.('当前浏览器不支持麦克风录音')
      return
    }

    chunksRef.current = []
    cancelledRef.current = false

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: TARGET_SAMPLE_RATE,
          echoCancellation: true,
          noiseSuppression: true,
        },
      })
    } catch (err: any) {
      const name = err?.name || ''
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        onError?.('麦克风权限被拒绝，请在浏览器设置中允许')
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        onError?.('未检测到麦克风设备')
      } else {
        onError?.(err?.message || '无法访问麦克风')
      }
      return
    }

    const Ctor = window.AudioContext || (window as any).webkitAudioContext
    let audioCtx: AudioContext
    try {
      audioCtx = new Ctor({ sampleRate: TARGET_SAMPLE_RATE })
    } catch {
      // Some browsers throw if requested rate is unsupported.
      audioCtx = new Ctor()
    }

    const source = audioCtx.createMediaStreamSource(stream)
    const bufferSize = 4096
    const processor = audioCtx.createScriptProcessor(bufferSize, 1, 1)

    processor.onaudioprocess = (event) => {
      const input = event.inputBuffer.getChannelData(0)
      chunksRef.current.push(new Float32Array(input))
    }

    source.connect(processor)
    processor.connect(audioCtx.destination)

    streamRef.current = stream
    audioCtxRef.current = audioCtx
    sourceRef.current = source
    processorRef.current = processor

    stopTimerRef.current = window.setTimeout(() => {
      stop()
    }, maxDurationMs)

    setIsListening(true)
    setInterim('正在录音...')
  }, [isListening, isProcessing, maxDurationMs, onError, stop, supported])

  const toggle = useCallback(() => {
    if (isListening) {
      stop()
    } else {
      void start()
    }
  }, [isListening, start, stop])

  useEffect(() => {
    return () => {
      cancelledRef.current = true
      cleanupAudio()
    }
  }, [cleanupAudio])

  return { supported, isListening, isProcessing, interim, start, stop, toggle }
}

function mergeFloat32(chunks: Float32Array[]): Float32Array {
  let total = 0
  for (const c of chunks) total += c.length
  const out = new Float32Array(total)
  let offset = 0
  for (const c of chunks) {
    out.set(c, offset)
    offset += c.length
  }
  return out
}

function downsample(
  samples: Float32Array,
  srcRate: number,
  dstRate: number,
): Float32Array {
  if (srcRate === dstRate) return samples
  if (srcRate < dstRate) return samples
  const ratio = srcRate / dstRate
  const newLen = Math.floor(samples.length / ratio)
  const out = new Float32Array(newLen)
  for (let i = 0; i < newLen; i++) {
    const srcIdx = i * ratio
    const idx0 = Math.floor(srcIdx)
    const idx1 = Math.min(idx0 + 1, samples.length - 1)
    const frac = srcIdx - idx0
    out[i] = samples[idx0] * (1 - frac) + samples[idx1] * frac
  }
  return out
}

function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  const view = new DataView(buffer)
  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + samples.length * 2, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeString(view, 36, 'data')
  view.setUint32(40, samples.length * 2, true)

  let offset = 44
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
    offset += 2
  }

  return new Blob([buffer], { type: 'audio/wav' })
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i))
  }
}
