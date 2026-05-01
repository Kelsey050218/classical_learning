import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Typography, List, message, Spin, Drawer, Button as AntButton, Tooltip,
  Input, Tabs, Modal, Radio, Space, Badge as AntBadge, Empty, Tag
} from 'antd'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  MinusCircleOutlined,
  BookOutlined,
  EditOutlined,
  MenuFoldOutlined,
  PlusOutlined,
  SettingOutlined,
  MoonOutlined,
  SunOutlined,
  CheckOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  LockOutlined,
  ExpandOutlined,
  CompressOutlined,
  FileTextOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import Layout from '../../components/Layout'
import Card from '../../components/UI/Card'
import Badge from '../../components/UI/Badge'
import Progress from '../../components/UI/Progress'
import Button from '../../components/UI/Button'
import apiClient from '../../api/client'
import { useReadingSettings } from '../../hooks/useReadingSettings'
import { useAutoSave } from '../../hooks/useAutoSave'
import { logStudyTime } from '../../api/studyTime'
import { getCheckInStatus, CheckInStatus } from '../../api/checkin'
import { listQuizzes, getQuizQuestions, submitQuiz, Quiz, Question, QuizResult } from '../../api/quizzes'
import { getBookmarks, createBookmark, BookmarkItem } from '../../api/bookmarks'
import { getHighlights, HighlightItem } from '../../api/highlights'
import { createCard, listMyCards, deleteCard, ReadingCard } from '../../api/readingCards'

const { Title, Text } = Typography
const { TextArea } = Input

interface Chapter {
  id: number
  title: string
  sort_order: number
  is_completed?: boolean
  content?: string
}

interface AnnotationItem {
  id: number
  position_start: number
  position_end: number
  content: string
  annotation_type: string
  mark_symbol?: string
  created_at: string
}

interface ReadingProgressItem {
  chapter_id: number
  current_position: number
  is_completed: boolean
}

interface ParagraphInfo {
  text: string
  globalStart: number
  globalEnd: number
}

const ANNOTATION_TYPES = [
  { key: 'mark', label: '圈点勾画法', color: 'bg-[#8B6914] text-white', symbol: '○', desc: '用符号标记关键词、重点句和结构线，快速定位核心内容' },
  { key: 'question', label: '质疑问难法', color: 'bg-[#4A5568] text-white', symbol: '?', desc: '敢于质疑，记录疑问、原文观点、个人判断与求证过程' },
  { key: 'connection', label: '联想拓展法', color: 'bg-[#2B6CB0] text-white', symbol: '→', desc: '由文本触发联想，建立与自身、古今、他作或知识网络的联系' },
  { key: 'insight', label: '感悟评点法', color: 'bg-[#C73E3A] text-white', symbol: '★', desc: '记录情感反应、价值判断、审美品味和哲理升华' },
]

const SYMBOL_OPTIONS = [
  { key: 'circle', label: '○ 圈出', desc: '关键词、核心概念、专有名词、数字' },
  { key: 'dot', label: '· 点出', desc: '重点句、主旨句、过渡句、总结句' },
  { key: 'underline', label: '—— 勾出', desc: '结构线、层次关系、逻辑递进' },
  { key: 'box', label: '□ 画出', desc: '疑问框、存疑处、待查证' },
]

const CONNECTION_OPTIONS = [
  { key: 'self', label: '由人及己', desc: '文本与自身经历的对照' },
  { key: 'modern', label: '由古及今', desc: '古代现象在当代社会的遗存或转化' },
  { key: 'cross', label: '由此及彼', desc: '同一作者其他作品或不同作者同类主题' },
  { key: 'network', label: '由点到面', desc: '从具体知识点扩展到相关文化背景、学术脉络' },
]

const CARD_TEMPLATES = [
  { id: 1, name: '基础信息卡', fields: ['书名', '作者', '章节', '阅读日期'] },
  { id: 2, name: '好词积累卡', fields: ['好词', '释义', '原文出处'] },
  { id: 3, name: '名句摘录卡', fields: ['名句', '页码', '我的批注'] },
  { id: 4, name: '内容概括卡', fields: ['主要内容', '核心观点', '结构梳理'] },
  { id: 5, name: '人物档案卡', fields: ['人物', '身份', '主要事迹', '性格特点'] },
  { id: 6, name: '知识链接卡', fields: ['知识点', '关联内容', '拓展思考'] },
  { id: 7, name: '疑点记录卡', fields: ['疑问', '我的猜测', '查证结果'] },
  { id: 8, name: '比较阅读卡', fields: ['对比对象A', '对比对象B', '相同点', '不同点'] },
  { id: 9, name: '感悟心得卡', fields: ['触动点', '个人感悟', '联系生活'] },
  { id: 10, name: '写作借鉴卡', fields: ['写作手法', '例句', '我可以怎么用'] },
  { id: 11, name: '评价鉴赏卡', fields: ['评价角度', '优点', '不足', '总体评分'] },
  { id: 12, name: '总结反思卡', fields: ['本章收获', '仍需探究', '下一步计划'] },
]

const PARAGRAPHS_PER_PAGE = 2

function splitParagraphs(content: string): ParagraphInfo[] {
  const paragraphs: ParagraphInfo[] = []
  let offset = 0
  const parts = content.split('\n\n')
  for (const part of parts) {
    const text = part.trim()
    if (!text) continue
    paragraphs.push({ text, globalStart: offset, globalEnd: offset + text.length })
    offset += text.length + 2
  }
  return paragraphs
}

function paginateParagraphs(paragraphs: ParagraphInfo[]): ParagraphInfo[][] {
  const pages: ParagraphInfo[][] = []
  let currentPage: ParagraphInfo[] = []
  for (const p of paragraphs) {
    currentPage.push(p)
    if (currentPage.length >= PARAGRAPHS_PER_PAGE) {
      pages.push(currentPage)
      currentPage = []
    }
  }
  if (currentPage.length > 0) pages.push(currentPage)
  return pages
}

function parseAnnotationContent(content: string): any {
  try {
    const parsed = JSON.parse(content)
    // Only treat as structured annotation if it has expected fields
    if (
      parsed &&
      typeof parsed === 'object' &&
      (parsed.mark_symbol !== undefined ||
        parsed.note !== undefined ||
        parsed.question_text !== undefined ||
        parsed.my_view !== undefined ||
        parsed.connection_type !== undefined ||
        parsed.connection_content !== undefined ||
        parsed.feeling !== undefined ||
        parsed.insight_text !== undefined)
    ) {
      return parsed
    }
    // Numbers, booleans, plain strings that happen to parse as JSON
    return { text: content }
  } catch {
    return { text: content }
  }
}

function formatAnnotationTooltip(parsed: any): string {
  if (parsed.text) return parsed.text
  const parts: string[] = []

  const symbolMap: Record<string, string> = {
    circle: '○ 圈出',
    dot: '· 点出',
    underline: '—— 勾出',
    box: '□ 画出',
  }
  const connMap: Record<string, string> = {
    self: '由人及己',
    modern: '由古及今',
    cross: '由此及彼',
    network: '由点到面',
  }

  // mark
  if (parsed.mark_symbol) {
    parts.push(`符号：${symbolMap[parsed.mark_symbol] || parsed.mark_symbol}`)
  }
  if (parsed.mark_target) parts.push(`标记对象：${parsed.mark_target}`)
  if (parsed.note) parts.push(`备注：${parsed.note}`)

  // question
  if (parsed.question_text) parts.push(`疑问：${parsed.question_text}`)
  if (parsed.original_view) parts.push(`原文观点：${parsed.original_view}`)
  if (parsed.my_view) parts.push(`我的判断：${parsed.my_view}`)
  if (parsed.verification) parts.push(`求证过程：${parsed.verification}`)

  // connection
  if (parsed.connection_type) {
    parts.push(`联想类型：${connMap[parsed.connection_type] || parsed.connection_type}`)
  }
  if (parsed.trigger_text) parts.push(`触发点：${parsed.trigger_text}`)
  if (parsed.connection_content) parts.push(`联想内容：${parsed.connection_content}`)

  // insight
  if (parsed.feeling) parts.push(`【感】${parsed.feeling}`)
  if (parsed.evaluation) parts.push(`【评】${parsed.evaluation}`)
  if (parsed.appreciation) parts.push(`【赏】${parsed.appreciation}`)
  if (parsed.insight_text) parts.push(`【悟】${parsed.insight_text}`)

  return parts.join('\n') || JSON.stringify(parsed)
}

const Reading: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [currentChapterId, setCurrentChapterId] = useState<number>(1)
  const [chapterContent, setChapterContent] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [annotationDrawerVisible, setAnnotationDrawerVisible] = useState(false)
  const [annotations, setAnnotations] = useState<AnnotationItem[]>([])
  const [progressList, setProgressList] = useState<ReadingProgressItem[]>([])
  const [unlockStatus, setUnlockStatus] = useState<Record<number, boolean>>({})
  const unlockStatusRef = useRef<Record<number, boolean>>({})
  useEffect(() => {
    unlockStatusRef.current = unlockStatus
  }, [unlockStatus])
  const [selectedText, setSelectedText] = useState('')
  const [selectedRange, setSelectedRange] = useState<{ start: number; end: number } | null>(null)
  const [annotationType, setAnnotationType] = useState('mark')
  const [settingsVisible, setSettingsVisible] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [activeTab, setActiveTab] = useState('reading')
  const [checkinData, setCheckinData] = useState<CheckInStatus | null>(null)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null)
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([])
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({})
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null)
  const [quizLoading, setQuizLoading] = useState(false)
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
  const [highlights, setHighlights] = useState<HighlightItem[]>([])
  const [toolbarVisible, setToolbarVisible] = useState(false)
  const [toolbarPos, setToolbarPos] = useState({ x: 0, y: 0 })
  const [bookmarkNote, setBookmarkNote] = useState('')
  const [showBookmarkModal, setShowBookmarkModal] = useState(false)
  const [readingMode, setReadingMode] = useState(false)
  const [pageIndex, setPageIndex] = useState(0)

  // Structured annotation form state (four master methods)
  const [markForm, setMarkForm] = useState({
    mark_symbol: 'circle' as 'circle' | 'dot' | 'underline' | 'box',
    mark_target: '',
    note: '',
  })
  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    original_view: '',
    my_view: '',
    verification: '',
  })
  const [connectionForm, setConnectionForm] = useState({
    connection_type: 'cross' as 'self' | 'modern' | 'cross' | 'network',
    trigger_text: '',
    connection_content: '',
  })
  const [insightForm, setInsightForm] = useState({
    feeling: '',
    evaluation: '',
    appreciation: '',
    insight_text: '',
  })

  // Reading cards state
  const [cards, setCards] = useState<ReadingCard[]>([])
  const [selectedCardTemplate, setSelectedCardTemplate] = useState<number | null>(null)
  const [cardFieldValues, setCardFieldValues] = useState<Record<string, string>>({})
  const [cardSubmitting, setCardSubmitting] = useState(false)

  const contentRef = useRef<HTMLDivElement>(null)
  const toolbarTimerRef = useRef<number | null>(null)
  const studyTimerRef = useRef<{ startTime: number; accumulated: number }>({ startTime: 0, accumulated: 0 })

  const { settings, updateSettings, fontSizeClass, lineSpacingClass } = useReadingSettings()

  const currentChapter = chapters.find(c => c.id === currentChapterId) || chapters[0]
  const currentProgress = progressList.find(p => p.chapter_id === currentChapterId)
  const isCompleted = currentChapter?.is_completed || currentProgress?.is_completed || false
  const isUnlocked = unlockStatus[currentChapterId] !== false

  const allParagraphs = useMemo(() => splitParagraphs(chapterContent), [chapterContent])
  const pages = useMemo(() => paginateParagraphs(allParagraphs), [allParagraphs])

  // Fetch chapters list
  useEffect(() => {
    fetchChapters()
  }, [])

  // Handle chapter change from URL
  useEffect(() => {
    const chapterId = parseInt(searchParams.get('chapter') || '1')
    if (chapterId !== currentChapterId) {
      setCurrentChapterId(chapterId)
    }
  }, [searchParams])

  // Fetch chapter data when chapter changes
  useEffect(() => {
    if (currentChapterId) {
      fetchChapterData(currentChapterId)
      fetchAnnotations(currentChapterId)
      fetchBookmarks(currentChapterId)
      fetchHighlights(currentChapterId)
      fetchCards()
      setPageIndex(0)
    }
  }, [currentChapterId])

  // Fetch checkin and quiz data on mount
  useEffect(() => {
    fetchCheckinData()
    fetchQuizzes()
    fetchUnlockStatus()
  }, [])

  // Hide toolbar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.reading-text') && !target.closest('.annotation-toolbar')) {
        // Cancel pending text-selection timer to avoid race condition
        if (toolbarTimerRef.current) {
          window.clearTimeout(toolbarTimerRef.current)
          toolbarTimerRef.current = null
        }
        setToolbarVisible(false)
        window.getSelection()?.removeAllRanges()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Exit reading mode on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && readingMode) {
        setReadingMode(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [readingMode])

  // Study time tracking
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (studyTimerRef.current.startTime > 0) {
          studyTimerRef.current.accumulated += Date.now() - studyTimerRef.current.startTime
          studyTimerRef.current.startTime = 0
        }
      } else {
        studyTimerRef.current.startTime = Date.now()
      }
    }

    studyTimerRef.current.startTime = Date.now()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    const heartbeat = setInterval(() => {
      const now = Date.now()
      const sessionSeconds = Math.floor(
        (studyTimerRef.current.accumulated +
          (studyTimerRef.current.startTime > 0 ? now - studyTimerRef.current.startTime : 0)) / 1000
      )
      if (sessionSeconds >= 30) {
        logStudyTime(sessionSeconds, currentChapterId).catch(() => {})
        studyTimerRef.current.accumulated = 0
        studyTimerRef.current.startTime = now
      }
    }, 30000)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(heartbeat)
      const now = Date.now()
      const sessionSeconds = Math.floor(
        (studyTimerRef.current.accumulated +
          (studyTimerRef.current.startTime > 0 ? now - studyTimerRef.current.startTime : 0)) / 1000
      )
      if (sessionSeconds >= 5) {
        logStudyTime(sessionSeconds, currentChapterId).catch(() => {})
      }
    }
  }, [currentChapterId])

  const fetchChapters = async () => {
    try {
      const res = await apiClient.get<Chapter[]>('/chapters/')
      setChapters(res.data)
    } catch (err) {
      message.error('加载章节列表失败')
    }
  }

  const fetchUnlockStatus = async () => {
    try {
      const res = await apiClient.get<{ chapter_id: number; is_unlocked: boolean }[]>('/reading/chapters/unlock-status')
      const map: Record<number, boolean> = {}
      for (const item of res.data) {
        map[item.chapter_id] = item.is_unlocked
      }
      setUnlockStatus(map)
    } catch (err) {
      console.error('加载解锁状态失败', err)
    }
  }

  const fetchChapterData = async (chapterId: number) => {
    setLoading(true)
    try {
      const [chapterRes, progressRes] = await Promise.all([
        apiClient.get<Chapter>(`/chapters/${chapterId}`),
        apiClient.get<ReadingProgressItem[]>('/reading/progress/'),
      ])
      setChapterContent(chapterRes.data.content || '')
      setProgressList(progressRes.data)
      setChapters(prev =>
        prev.map(c => ({
          ...c,
          is_completed: progressRes.data.find(p => p.chapter_id === c.id)?.is_completed || false,
        }))
      )
    } catch (err) {
      message.error('加载章节内容失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchAnnotations = async (chapterId: number) => {
    try {
      const res = await apiClient.get<{ annotations: AnnotationItem[]; total: number }>(
        `/reading/annotations/${chapterId}`
      )
      setAnnotations(res.data.annotations)
    } catch (err) {
      console.error('加载批注失败', err)
    }
  }

  const fetchCheckinData = async () => {
    try {
      const res = await getCheckInStatus()
      setCheckinData(res.data)
    } catch (err) {
      console.error('加载打卡数据失败', err)
    }
  }

  const fetchQuizzes = async () => {
    try {
      const res = await listQuizzes()
      setQuizzes(res.data)
    } catch (err) {
      console.error('加载闯关数据失败', err)
    }
  }

  const fetchBookmarks = async (chapterId: number) => {
    try {
      const res = await getBookmarks(chapterId)
      setBookmarks(res.data)
    } catch (err) {
      console.error('加载书签失败', err)
    }
  }

  const fetchHighlights = async (chapterId: number) => {
    try {
      const res = await getHighlights(chapterId)
      setHighlights(res.data)
    } catch (err) {
      console.error('加载高亮失败', err)
    }
  }

  const fetchCards = async () => {
    try {
      const res = await listMyCards()
      setCards(res.data)
    } catch (err) {
      console.error('加载读书卡失败', err)
    }
  }

  const saveProgress = useCallback(
    async (position?: number, completed?: boolean) => {
      try {
        setSaveStatus('saving')
        await apiClient.put(`/reading/progress/${currentChapterId}`, {
          current_position: position ?? 0,
          is_completed: completed ?? isCompleted,
        })
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
        if (completed) {
          setChapters(prev =>
            prev.map(c => (c.id === currentChapterId ? { ...c, is_completed: true } : c))
          )
          setProgressList(prev =>
            prev.map(p =>
              p.chapter_id === currentChapterId ? { ...p, is_completed: true } : p
            )
          )
        }
      } catch (err) {
        setSaveStatus('idle')
        console.error('保存进度失败', err)
      }
    },
    [currentChapterId, isCompleted]
  )

  const { triggerSave } = useAutoSave({
    onSave: () => saveProgress(0, isCompleted),
    enabled: true,
    interval: 30000,
  })

  const handleChapterChange = (chapterId: number) => {
    if (!unlockStatusRef.current[chapterId] && chapterId !== currentChapterId) {
      const ch = chapters.find(c => c.id === chapterId)
      const prev = chapters.find(c => c.sort_order === (ch?.sort_order || 1) - 1)
      message.warning(`需先完成《${prev?.title || '上一章'}》阅读并通关，才能解锁本章`)
      return
    }
    triggerSave()
    setSearchParams({ chapter: chapterId.toString() })
  }

  const handleTextSelection = () => {
    if (toolbarTimerRef.current) {
      window.clearTimeout(toolbarTimerRef.current)
    }
    toolbarTimerRef.current = window.setTimeout(() => {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0 || selection.toString().trim().length === 0) {
        setSelectedText('')
        setSelectedRange(null)
        setToolbarVisible(false)
        return
      }

      const text = selection.toString()
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()

      if (contentRef.current) {
        const container = contentRef.current

        // Find which <p> paragraph the selection starts in
        let startNode: Node | null = range.startContainer
        while (startNode && startNode !== container) {
          if (startNode.nodeName === 'P') break
          startNode = startNode.parentNode
        }
        if (!startNode || startNode.nodeName !== 'P') {
          setToolbarVisible(false)
          return
        }

        const paraIndexAttr = (startNode as HTMLElement).getAttribute('data-paragraph-index')
        const paraIndex = paraIndexAttr !== null ? parseInt(paraIndexAttr, 10) : Array.from(container.querySelectorAll('p')).indexOf(startNode as HTMLParagraphElement)
        const paraInfo = allParagraphs[paraIndex]
        if (!paraInfo) {
          setToolbarVisible(false)
          return
        }

        // Calculate offset within the paragraph
        const paraRange = document.createRange()
        paraRange.selectNodeContents(startNode)
        paraRange.setEnd(range.startContainer, range.startOffset)
        const offsetInPara = paraRange.toString().length

        const globalStart = paraInfo.globalStart + offsetInPara
        const globalEnd = globalStart + text.length

        setSelectedText(text)
        setSelectedRange({ start: globalStart, end: globalEnd })

        // Position toolbar using viewport coordinates (fixed positioning)
        setToolbarPos({
          x: rect.left + rect.width / 2,
          y: rect.top - 48,
        })
        setToolbarVisible(true)
      }
    }, 200)
  }

  const buildAnnotationContent = (): string => {
    if (annotationType === 'mark') {
      return JSON.stringify({
        mark_symbol: markForm.mark_symbol,
        mark_target: markForm.mark_target || selectedText,
        note: markForm.note,
      })
    }
    if (annotationType === 'question') {
      return JSON.stringify({
        question_text: questionForm.question_text || selectedText,
        original_view: questionForm.original_view,
        my_view: questionForm.my_view,
        verification: questionForm.verification,
      })
    }
    if (annotationType === 'connection') {
      return JSON.stringify({
        connection_type: connectionForm.connection_type,
        trigger_text: connectionForm.trigger_text || selectedText,
        connection_content: connectionForm.connection_content,
      })
    }
    return JSON.stringify({
      feeling: insightForm.feeling,
      evaluation: insightForm.evaluation,
      appreciation: insightForm.appreciation,
      insight_text: insightForm.insight_text,
    })
  }

  const resetAnnotationForms = () => {
    setMarkForm({ mark_symbol: 'circle', mark_target: '', note: '' })
    setQuestionForm({ question_text: '', original_view: '', my_view: '', verification: '' })
    setConnectionForm({ connection_type: 'cross', trigger_text: '', connection_content: '' })
    setInsightForm({ feeling: '', evaluation: '', appreciation: '', insight_text: '' })
  }

  const handleAddAnnotation = async () => {
    if (!selectedRange) {
      message.warning('选中文本已失效，请重新选择后添加')
      return
    }
    const content = buildAnnotationContent()
    const payload: any = {
      position_start: selectedRange.start,
      position_end: selectedRange.end,
      content,
      annotation_type: annotationType,
    }
    if (annotationType === 'mark') {
      payload.mark_symbol = markForm.mark_symbol
    }
    try {
      const res = await apiClient.post<AnnotationItem>(`/reading/annotations/${currentChapterId}`, payload)
      setAnnotations(prev => [...prev, res.data])
      resetAnnotationForms()
      setSelectedText('')
      setSelectedRange(null)
      window.getSelection()?.removeAllRanges()
      setToolbarVisible(false)
      message.success('批注已保存')
    } catch (err: any) {
      message.error(err.response?.data?.detail || '保存批注失败')
    }
  }

  const handleAddBookmark = async () => {
    if (!selectedRange) {
      message.warning('选中文本已失效，请重新选择后添加')
      return
    }
    try {
      await createBookmark({
        chapter_id: currentChapterId,
        position_start: selectedRange.start,
        position_end: selectedRange.end,
        note: bookmarkNote || undefined,
      })
      message.success('书签已添加')
      setBookmarkNote('')
      setShowBookmarkModal(false)
      setToolbarVisible(false)
      setSelectedText('')
      setSelectedRange(null)
      window.getSelection()?.removeAllRanges()
      fetchBookmarks(currentChapterId)
    } catch (err: any) {
      message.error(err.response?.data?.detail || '添加书签失败')
    }
  }

  const handleMarkComplete = async () => {
    try {
      await saveProgress(0, true)
      message.success('本章已标记为读完')
      // Switch to quiz tab
      setActiveTab('quiz')
      const chapterQuiz = quizzes.find(q => q.chapter_id === currentChapterId)
      if (chapterQuiz) {
        handleStartQuiz(chapterQuiz)
      }
    } catch {
      message.error('标记失败')
    }
  }

  const handleStartQuiz = async (quiz: Quiz) => {
    setQuizLoading(true)
    setCurrentQuiz(quiz)
    setQuizResult(null)
    setQuizAnswers({})
    try {
      const res = await getQuizQuestions(quiz.id)
      setQuizQuestions(res.data)
    } catch (err) {
      message.error('加载题目失败')
    } finally {
      setQuizLoading(false)
    }
  }

  const handleSubmitQuiz = async () => {
    if (!currentQuiz) return
    setQuizLoading(true)
    try {
      const res = await submitQuiz(currentQuiz.id, quizAnswers)
      setQuizResult(res.data)
      message.success('答题完成，即将进入下一章')
      await fetchUnlockStatus()
      if (res.data.next_chapter_id) {
        setTimeout(() => {
          handleChapterChange(res.data.next_chapter_id!)
          setActiveTab('reading')
        }, 1500)
      }
    } catch (err) {
      message.error('提交失败')
    } finally {
      setQuizLoading(false)
    }
  }

  const handleSaveCard = async () => {
    if (!selectedCardTemplate) {
      message.warning('请选择卡片模板')
      return
    }
    setCardSubmitting(true)
    try {
      await createCard({
        card_template: selectedCardTemplate,
        fields: cardFieldValues,
        chapter_id: currentChapterId,
      })
      message.success('读书卡已保存')
      setSelectedCardTemplate(null)
      setCardFieldValues({})
      fetchCards()
    } catch (err) {
      message.error('保存失败')
    } finally {
      setCardSubmitting(false)
    }
  }

  const getStatusIcon = (chapter: Chapter) => {
    if (!unlockStatus[chapter.id] && chapter.id !== currentChapterId) {
      return <LockOutlined className="text-danmo" />
    }
    if (chapter.is_completed) return <CheckCircleOutlined className="text-tenghuang" />
    if (chapter.id === currentChapterId) return <ClockCircleOutlined className="text-zhusha" />
    return <MinusCircleOutlined className="text-danmo" />
  }

  const getStatusBadge = (chapter: Chapter) => {
    if (chapter.is_completed) return <Badge variant="tenghuang">已完成</Badge>
    if (chapter.id === currentChapterId) return <Badge variant="zhusha">阅读中</Badge>
    return <Badge variant="default">未开始</Badge>
  }

  const completedCount = chapters.filter(c => c.is_completed).length
  const progressPercent = chapters.length > 0 ? Math.round((completedCount / chapters.length) * 100) : 0

  const SettingsPanel = () => (
    <div className="space-y-4 p-2">
      <div>
        <Text className="text-sm text-danmo block mb-2">字体大小</Text>
        <Space>
          {(['base', 'lg', 'xl'] as const).map(size => (
            <Button
              key={size}
              customVariant={settings.fontSize === size ? 'primary' : 'ghost'}
              customSize="sm"
              onClick={() => updateSettings({ fontSize: size })}
            >
              {size === 'base' ? '标准' : size === 'lg' ? '大' : '超大'}
            </Button>
          ))}
        </Space>
      </div>
      <div>
        <Text className="text-sm text-danmo block mb-2">行间距</Text>
        <Space>
          {(['normal', 'relaxed', 'loose'] as const).map(spacing => (
            <Button
              key={spacing}
              customVariant={settings.lineSpacing === spacing ? 'primary' : 'ghost'}
              customSize="sm"
              onClick={() => updateSettings({ lineSpacing: spacing })}
            >
              {spacing === 'normal' ? '紧凑' : spacing === 'relaxed' ? '舒适' : '宽松'}
            </Button>
          ))}
        </Space>
      </div>
      <div>
        <Text className="text-sm text-danmo block mb-2">阅读模式</Text>
        <Button
          customVariant="ghost"
          customSize="sm"
          onClick={() => updateSettings({ nightMode: !settings.nightMode })}
          className="flex items-center gap-2"
        >
          {settings.nightMode ? <MoonOutlined /> : <SunOutlined />}
          {settings.nightMode ? '夜间模式' : '日间模式'}
        </Button>
      </div>
    </div>
  )

  const AnnotationForm = () => (
    <div className="space-y-3">
      {selectedText && (
        <div className="p-3 bg-zhusha-50 rounded-lg">
          <Text className="text-xs text-danmo block mb-1">选中文本：</Text>
          <Text className="text-sm text-mohei line-clamp-2 italic">"{selectedText}"</Text>
        </div>
      )}
      <div>
        <Text className="text-xs text-danmo block mb-2">批注方式（四种名家批注法）</Text>
        <Radio.Group
          value={annotationType}
          onChange={e => setAnnotationType(e.target.value)}
          className="flex flex-wrap gap-2"
        >
          {ANNOTATION_TYPES.map(t => (
            <Radio.Button key={t.key} value={t.key} className="!rounded-lg">
              <span className="mr-1">{t.symbol}</span>
              {t.label}
            </Radio.Button>
          ))}
        </Radio.Group>
        <Text className="text-xs text-danmo mt-2 block">
          {ANNOTATION_TYPES.find(t => t.key === annotationType)?.desc}
        </Text>
      </div>

      {annotationType === 'mark' && (
        <div className="space-y-3">
          <div>
            <Text className="text-xs text-danmo block mb-1">批注符号</Text>
            <Radio.Group
              value={markForm.mark_symbol}
              onChange={e => setMarkForm(prev => ({ ...prev, mark_symbol: e.target.value }))}
              className="flex flex-wrap gap-2"
            >
              {SYMBOL_OPTIONS.map(s => (
                <Radio.Button key={s.key} value={s.key} className="!rounded-lg text-xs">
                  <Tooltip title={s.desc}>
                    <span>{s.label}</span>
                  </Tooltip>
                </Radio.Button>
              ))}
            </Radio.Group>
          </div>
          <Input
            placeholder="标记对象：如关键词、重点句、结构线等"
            value={markForm.mark_target || selectedText}
            onChange={e => setMarkForm(prev => ({ ...prev, mark_target: e.target.value }))}
          />
          <TextArea
            placeholder="备注说明（可选）：补充解释或存疑内容"
            value={markForm.note}
            onChange={e => setMarkForm(prev => ({ ...prev, note: e.target.value }))}
            rows={2}
          />
        </div>
      )}

      {annotationType === 'question' && (
        <div className="space-y-3">
          <TextArea
            placeholder="【疑问】提出你的问题（为什么？真的吗？何以见得？）"
            value={questionForm.question_text || selectedText}
            onChange={e => setQuestionForm(prev => ({ ...prev, question_text: e.target.value }))}
            rows={2}
          />
          <TextArea
            placeholder="【原文观点】作者原文观点是什么？"
            value={questionForm.original_view}
            onChange={e => setQuestionForm(prev => ({ ...prev, original_view: e.target.value }))}
            rows={2}
          />
          <TextArea
            placeholder="【我的判断】基于证据形成自己的初步判断"
            value={questionForm.my_view}
            onChange={e => setQuestionForm(prev => ({ ...prev, my_view: e.target.value }))}
            rows={2}
          />
          <TextArea
            placeholder="【求证过程】查阅资料、回读文本、请教他人的过程"
            value={questionForm.verification}
            onChange={e => setQuestionForm(prev => ({ ...prev, verification: e.target.value }))}
            rows={2}
          />
        </div>
      )}

      {annotationType === 'connection' && (
        <div className="space-y-3">
          <div>
            <Text className="text-xs text-danmo block mb-1">联想类型</Text>
            <Radio.Group
              value={connectionForm.connection_type}
              onChange={e => setConnectionForm(prev => ({ ...prev, connection_type: e.target.value }))}
              className="flex flex-wrap gap-2"
            >
              {CONNECTION_OPTIONS.map(c => (
                <Radio.Button key={c.key} value={c.key} className="!rounded-lg text-xs">
                  <Tooltip title={c.desc}>
                    <span>{c.label}</span>
                  </Tooltip>
                </Radio.Button>
              ))}
            </Radio.Group>
          </div>
          <Input
            placeholder="触发点：引起联想的文本内容"
            value={connectionForm.trigger_text || selectedText}
            onChange={e => setConnectionForm(prev => ({ ...prev, trigger_text: e.target.value }))}
          />
          <TextArea
            placeholder="联想内容：由此及彼建立的知识联系"
            value={connectionForm.connection_content}
            onChange={e => setConnectionForm(prev => ({ ...prev, connection_content: e.target.value }))}
            rows={3}
          />
        </div>
      )}

      {annotationType === 'insight' && (
        <div className="space-y-3">
          <TextArea
            placeholder="【感】情感反应——喜欢、感动、愤怒、困惑"
            value={insightForm.feeling}
            onChange={e => setInsightForm(prev => ({ ...prev, feeling: e.target.value }))}
            rows={2}
          />
          <TextArea
            placeholder="【评】价值判断——赞同、反对、补充"
            value={insightForm.evaluation}
            onChange={e => setInsightForm(prev => ({ ...prev, evaluation: e.target.value }))}
            rows={2}
          />
          <TextArea
            placeholder="【赏】审美品味——修辞、节奏、意象、氛围"
            value={insightForm.appreciation}
            onChange={e => setInsightForm(prev => ({ ...prev, appreciation: e.target.value }))}
            rows={2}
          />
          <TextArea
            placeholder="【悟】哲理升华——文本对自己生活态度的启发"
            value={insightForm.insight_text}
            onChange={e => setInsightForm(prev => ({ ...prev, insight_text: e.target.value }))}
            rows={2}
          />
        </div>
      )}

      <Button
        customVariant="primary"
        customSize="sm"
        className="w-full"
        onClick={handleAddAnnotation}
        disabled={!selectedRange}
      >
        <PlusOutlined /> 添加批注
      </Button>
      {!selectedRange && (
        <Text className="text-xs text-danmo text-center block">请先选中正文文本再添加批注</Text>
      )}
    </div>
  )

  // Inline mark rendering
  interface TextMark {
    start: number
    end: number
    type: 'annotation' | 'highlight' | 'bookmark'
    color?: string
    content?: string
  }

  const getMarksForParagraph = (p: ParagraphInfo): TextMark[] => {
    const marks: TextMark[] = []
    for (const anno of annotations) {
      if (anno.position_end > p.globalStart && anno.position_start < p.globalEnd) {
        marks.push({
          start: Math.max(anno.position_start, p.globalStart),
          end: Math.min(anno.position_end, p.globalEnd),
          type: 'annotation',
          content: anno.content,
        })
      }
    }
    for (const hl of highlights) {
      if (hl.position_end > p.globalStart && hl.position_start < p.globalEnd) {
        marks.push({
          start: Math.max(hl.position_start, p.globalStart),
          end: Math.min(hl.position_end, p.globalEnd),
          type: 'highlight',
          color: hl.color,
        })
      }
    }
    for (const bm of bookmarks) {
      if (bm.position_end > p.globalStart && bm.position_start < p.globalEnd) {
        marks.push({
          start: Math.max(bm.position_start, p.globalStart),
          end: Math.min(bm.position_end, p.globalEnd),
          type: 'bookmark',
          content: bm.note || '书签',
        })
      }
    }
    return marks.sort((a, b) => a.start - b.start)
  }

  const renderParagraphWithMarks = (p: ParagraphInfo, paraIndex?: number) => {
    const marks = getMarksForParagraph(p)
    const paraProps = paraIndex !== undefined ? { 'data-paragraph-index': paraIndex } : {}
    if (marks.length === 0) {
      return <p className="mb-6" {...paraProps}>{p.text}</p>
    }

    const spans: React.ReactNode[] = []
    let lastEnd = p.globalStart

    for (let i = 0; i < marks.length; i++) {
      const m = marks[i]
      const mStartInPara = Math.max(m.start, p.globalStart) - p.globalStart
      const mEndInPara = Math.min(m.end, p.globalEnd) - p.globalStart

      if (m.start > lastEnd) {
        spans.push(
          <span key={`plain-${i}`}>{p.text.slice(lastEnd - p.globalStart, mStartInPara)}</span>
        )
      }

      const markText = p.text.slice(mStartInPara, mEndInPara)
      if (m.type === 'highlight') {
        const bg =
          m.color === 'green'
            ? '#D1FAE5'
            : m.color === 'blue'
            ? '#DBEAFE'
            : m.color === 'pink'
            ? '#FCE7F3'
            : '#FEF3C7'
        spans.push(
          <mark key={`hl-${i}`} className="rounded px-0.5" style={{ backgroundColor: bg }}>
            {markText}
          </mark>
        )
      } else if (m.type === 'annotation') {
        const parsed = parseAnnotationContent(m.content || '')
        const title = formatAnnotationTooltip(parsed)
        spans.push(
          <Tooltip key={`anno-${i}`} title={title} placement="top">
            <span className="border-b-2 border-dashed border-zhusha cursor-help bg-zhusha/5 px-0.5 transition-colors hover:bg-tenghuang/20 hover:outline hover:outline-dashed hover:outline-zhusha hover:outline-1 hover:rounded-sm">
              {markText}
            </span>
          </Tooltip>
        )
      } else {
        spans.push(
          <Tooltip key={`bm-${i}`} title={m.content || '书签'} placement="top">
            <span className="border-b-2 border-shiqing cursor-help bg-shiqing/5 px-0.5 transition-colors hover:bg-shiqing/20 hover:outline hover:outline-dashed hover:outline-shiqing hover:outline-1 hover:rounded-sm">
              {markText}
            </span>
          </Tooltip>
        )
      }
      lastEnd = Math.max(lastEnd, m.end)
    }

    if (lastEnd < p.globalEnd) {
      spans.push(<span key="plain-end">{p.text.slice(lastEnd - p.globalStart)}</span>)
    }

    return <p className="mb-6" {...paraProps}>{spans}</p>
  }

  const chapterListContent = (
    <div>
      <Progress value={progressPercent} size="sm" className="mb-4" />
      <List
        dataSource={chapters}
        renderItem={(chapter) => (
          <List.Item
            className={`cursor-pointer px-3 py-2 rounded-lg transition-colors ${
              chapter.id === currentChapterId
                ? 'bg-zhusha-50 border-l-4 border-zhusha'
                : 'hover:bg-xuanzhi-warm'
            }`}
            onClick={() => handleChapterChange(chapter.id)}
          >
            <div className="flex items-center gap-3 w-full">
              {getStatusIcon(chapter)}
              <div className="flex-1">
                <Text
                  className={`${
                    chapter.id === currentChapterId ? 'text-zhusha font-medium' : 'text-mohei'
                  }`}
                >
                  {chapter.title}
                </Text>
              </div>
              {chapter.is_completed && <CheckCircleOutlined className="text-tenghuang" />}
            </div>
          </List.Item>
        )}
      />
    </div>
  )

  const annotationSidebarContent = (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <EditOutlined className="text-zhusha" />
          <Title level={5} className="!mb-0">添加批注</Title>
        </div>
        <AnnotationForm />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <EditOutlined className="text-zhusha" />
          <Title level={5} className="!mb-0 !text-base">我的批注</Title>
        </div>
        <div className="space-y-3 max-h-[35vh] overflow-y-auto">
          {annotations.length === 0 ? (
            <Text className="text-danmo text-center block py-4 text-sm">暂无批注</Text>
          ) : (
            annotations.map(anno => {
              const typeInfo = ANNOTATION_TYPES.find(t => t.key === anno.annotation_type)
              const parsed = parseAnnotationContent(anno.content)
              const displayText = formatAnnotationTooltip(parsed)
              return (
                <div key={anno.id} className="p-3 bg-xuanzhi-warm rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded text-white ${typeInfo?.color || 'bg-danmo'}`}>
                      {typeInfo?.label || anno.annotation_type}
                    </span>
                  </div>
                  <Text className="text-mohei block text-sm line-clamp-3">{displayText}</Text>
                  <Text className="text-xs text-danmo mt-1 block">
                    {new Date(anno.created_at).toLocaleDateString()}
                  </Text>
                </div>
              )
            })
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <BookOutlined className="text-shiqing" />
          <Title level={5} className="!mb-0 !text-base">我的书签</Title>
        </div>
        <div className="space-y-2 max-h-[15vh] overflow-y-auto">
          {bookmarks.length === 0 ? (
            <Text className="text-danmo text-center block py-2 text-sm">暂无书签</Text>
          ) : (
            bookmarks.map(bm => (
              <div key={bm.id} className="p-2 bg-xuanzhi-warm rounded-lg text-sm">
                <Text className="text-mohei block line-clamp-1">位置 {bm.position_start}-{bm.position_end}</Text>
                {bm.note && <Text className="text-danmo text-xs block mt-1">{bm.note}</Text>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )

  // Reading mode overlay
  const ReadingModeOverlay = () => {
    if (!readingMode) return null
    const currentPageParagraphs = pages[pageIndex] || []
    return (
      <div
        className={`fixed inset-0 z-40 flex flex-col ${
          settings.nightMode ? 'bg-mohei text-xuanzhi' : 'bg-xuanzhi text-mohei'
        }`}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-danmo-light">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setReadingMode(false)}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${
                settings.nightMode
                  ? 'bg-danmo-light/20 text-xuanzhi hover:bg-danmo-light/30'
                  : 'bg-zhusha text-white hover:bg-zhusha-dark'
              }`}
            >
              <CompressOutlined />
              <span className="hidden sm:inline">退出阅读</span>
            </button>
            <Text className={`${settings.nightMode ? 'text-xuanzhi' : 'text-mohei'}`}>
              {currentChapter?.title}
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <Text className="text-sm text-danmo">
              {pageIndex + 1} / {Math.max(pages.length, 1)}
            </Text>
            <button
              onClick={() => updateSettings({ nightMode: !settings.nightMode })}
              className="p-2 rounded-lg hover:bg-danmo-light/20"
            >
              {settings.nightMode ? <MoonOutlined /> : <SunOutlined />}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div
            ref={contentRef}
            className={`reading-text max-w-3xl mx-auto ${fontSizeClass} ${lineSpacingClass}`}
            onMouseUp={handleTextSelection}
          >
            {currentPageParagraphs.map((p, idx) => (
              <React.Fragment key={idx}>{renderParagraphWithMarks(p, pageIndex * PARAGRAPHS_PER_PAGE + idx)}</React.Fragment>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-danmo-light">
          <button
            className="p-2 rounded-lg hover:bg-danmo-light/20 disabled:opacity-30"
            disabled={pageIndex <= 0}
            onClick={() => setPageIndex(prev => prev - 1)}
          >
            <ArrowLeftOutlined /> 上一页
          </button>
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarVisible(true)} className="p-2 rounded-lg hover:bg-danmo-light/20">
              <MenuFoldOutlined /> 篇目
            </button>
            <button
              onClick={() => setAnnotationDrawerVisible(true)}
              className="p-2 rounded-lg hover:bg-danmo-light/20"
            >
              <EditOutlined /> 批注
            </button>
            <button
              onClick={() => setReadingMode(false)}
              className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                settings.nightMode
                  ? 'bg-danmo-light/20 text-xuanzhi hover:bg-danmo-light/30'
                  : 'bg-zhusha text-white hover:bg-zhusha-dark'
              }`}
            >
              <CompressOutlined /> 退出
            </button>
          </div>
          <button
            className="p-2 rounded-lg hover:bg-danmo-light/20 disabled:opacity-30"
            disabled={pageIndex >= pages.length - 1}
            onClick={() => setPageIndex(prev => prev + 1)}
          >
            下一页 <ArrowRightOutlined />
          </button>
        </div>

        {/* Toolbar in reading mode */}
        {toolbarVisible && selectedRange && (
          <div
            className="annotation-toolbar fixed z-50 flex items-center gap-1 bg-mohei text-white rounded-lg shadow-lg px-2 py-1.5"
            style={{
              left: `${toolbarPos.x}px`,
              top: `${toolbarPos.y}px`,
              transform: 'translateX(-50%)',
            }}
          >
            <Tooltip title="添加书签">
              <AntButton
                type="text"
                size="small"
                icon={<BookOutlined className="text-white" />}
                onClick={() => setShowBookmarkModal(true)}
              />
            </Tooltip>
            <div className="w-px h-4 bg-danmo mx-1" />
            <Tooltip title="添加批注">
              <AntButton
                type="text"
                size="small"
                icon={<EditOutlined className="text-white" />}
                onClick={() => {
                  setToolbarVisible(false)
                  setAnnotationDrawerVisible(true)
                }}
              />
            </Tooltip>
          </div>
        )}
      </div>
    )
  }

  return (
    <Layout>
      <div className="relative -mx-4 -my-6 px-4 py-6 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 min-h-[calc(100vh-4rem)]">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-screen h-full bg-cover bg-center opacity-[0.30] pointer-events-none"
          style={{ backgroundImage: 'url(https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/images/backgrounds/reading.png)' }}
        />
        <div className="relative z-10 flex gap-6">
        {/* Main Reading Area */}
        <main className="flex-1 min-w-0">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'reading',
                label: '正文阅读',
                children: (
                  <>
                    {/* Top Toolbar */}
                    <div className="flex items-center justify-between mb-4 px-2">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 rounded-lg hover:bg-xuanzhi-warm border border-danmo-light"
                          onClick={() => setSidebarVisible(true)}
                          title="篇目列表"
                        >
                          <MenuFoldOutlined /> <span className="text-sm hidden sm:inline">篇目列表</span>
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Text className="text-danmo text-sm hidden sm:block">
                          第 {currentChapter?.sort_order || currentChapterId} 篇 · {currentChapter?.title}
                        </Text>
                        <button
                          className="p-2 rounded-lg hover:bg-xuanzhi-warm border border-danmo-light"
                          onClick={() => setReadingMode(true)}
                          title="阅读模式"
                        >
                          <ExpandOutlined /> <span className="text-sm hidden sm:inline">阅读模式</span>
                        </button>
                        <Tooltip title="阅读设置">
                          <AntButton icon={<SettingOutlined />} onClick={() => setSettingsVisible(true)} />
                        </Tooltip>
                        <button
                          className="p-2 rounded-lg hover:bg-xuanzhi-warm border border-danmo-light"
                          onClick={() => setAnnotationDrawerVisible(true)}
                          title="我的批注"
                        >
                          <EditOutlined /> <span className="text-sm hidden sm:inline">我的批注</span>
                        </button>
                      </div>
                    </div>

                    {loading ? (
                      <div className="flex items-center justify-center py-20">
                        <Spin size="large" />
                      </div>
                    ) : !isUnlocked ? (
                      <Card>
                        <Empty description="本章尚未解锁，请先完成上一章阅读并通关" />
                      </Card>
                    ) : (
                      <Card className={`relative ${settings.nightMode ? 'dark bg-mohei text-xuanzhi' : ''}`}>
                        {/* Chapter Header */}
                        <div className="flex items-center justify-between mb-6 border-b border-danmo-light pb-4">
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Text className="text-danmo text-sm">
                                  第 {currentChapter?.sort_order || currentChapterId} 篇
                                </Text>
                                {currentChapter && getStatusBadge(currentChapter)}
                                {saveStatus === 'saved' && (
                                  <AntBadge
                                    count={<SaveOutlined className="text-xs text-shiqing" />}
                                    style={{ backgroundColor: 'transparent', color: '#5A9A6E' }}
                                  />
                                )}
                              </div>
                              <Title level={3} className="font-display !mb-0">
                                {currentChapter?.title || ''}
                              </Title>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              customVariant={isCompleted ? 'ghost' : 'primary'}
                              customSize="sm"
                              onClick={handleMarkComplete}
                              disabled={isCompleted}
                            >
                              {isCompleted ? <><CheckOutlined /> 已读完</> : '标记读完'}
                            </Button>
                          </div>
                        </div>

                        {/* Floating Toolbar (fixed viewport positioning) */}
                        {toolbarVisible && selectedRange && (
                          <div
                            className="annotation-toolbar fixed z-50 flex items-center gap-1 bg-mohei text-white rounded-lg shadow-lg px-2 py-1.5"
                            style={{
                              left: `${toolbarPos.x}px`,
                              top: `${toolbarPos.y}px`,
                              transform: 'translateX(-50%)',
                            }}
                          >
                            <Tooltip title="添加书签">
                              <AntButton
                                type="text"
                                size="small"
                                icon={<BookOutlined className="text-white" />}
                                onClick={() => setShowBookmarkModal(true)}
                              />
                            </Tooltip>
                            <div className="w-px h-4 bg-danmo mx-1" />
                            <Tooltip title="添加批注">
                              <AntButton
                                type="text"
                                size="small"
                                icon={<EditOutlined className="text-white" />}
                                onClick={() => {
                                  setToolbarVisible(false)
                                  setAnnotationDrawerVisible(true)
                                }}
                              />
                            </Tooltip>
                          </div>
                        )}

                        {/* Reading Content */}
                        <div
                          ref={contentRef}
                          className={`reading-text py-4 relative ${fontSizeClass} ${lineSpacingClass} ${
                            settings.nightMode ? 'text-xuanzhi' : 'text-mohei'
                          }`}
                          onMouseUp={handleTextSelection}
                        >
                          {(pages[pageIndex] || []).map((p, idx) => (
                            <React.Fragment key={idx}>
                              {renderParagraphWithMarks(p, pageIndex * PARAGRAPHS_PER_PAGE + idx)}
                            </React.Fragment>
                          ))}
                        </div>

                        {/* Pagination (normal mode) */}
                        {pages.length > 1 && (
                          <div className="mt-4 flex items-center justify-center gap-4">
                            <AntButton
                              disabled={pageIndex <= 0}
                              onClick={() => setPageIndex(prev => prev - 1)}
                            >
                              <ArrowLeftOutlined /> 上一页
                            </AntButton>
                            <Text className="text-danmo text-sm">
                              {pageIndex + 1} / {pages.length}
                            </Text>
                            <AntButton
                              disabled={pageIndex >= pages.length - 1}
                              onClick={() => setPageIndex(prev => prev + 1)}
                            >
                              下一页 <ArrowRightOutlined />
                            </AntButton>
                          </div>
                        )}

                        {/* Navigation */}
                        <div className="mt-8 pt-4 border-t border-danmo-light">
                          <div className="flex items-center justify-between">
                            <Button
                              customVariant="ghost"
                              disabled={!chapters.find(c => c.sort_order === (currentChapter?.sort_order || 1) - 1)}
                              onClick={() => {
                                const prev = chapters.find(c => c.sort_order === (currentChapter?.sort_order || 1) - 1)
                                if (prev) handleChapterChange(prev.id)
                              }}
                            >
                              <ArrowLeftOutlined /> 上一篇
                            </Button>
                            <Button
                              customVariant="primary"
                              disabled={!chapters.find(c => c.sort_order === (currentChapter?.sort_order || 1) + 1)}
                              onClick={() => {
                                const next = chapters.find(c => c.sort_order === (currentChapter?.sort_order || 1) + 1)
                                if (next) handleChapterChange(next.id)
                              }}
                            >
                              下一篇 <ArrowRightOutlined />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )}
                  </>
                ),
              },
              {
                key: 'quiz',
                label: '闯关答题',
                children: (
                  <>
                    <Card>
                      {!isCompleted ? (
                      <Empty description="请先读完本章，解锁闯关答题" />
                    ) : quizResult ? (
                      <div className="space-y-6 animate-fade-in-up">
                        <div className="text-center py-6">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zhuqing-50 mb-4 animate-stamp-drop">
                            <CheckCircleOutlined className="text-3xl text-zhuqing" />
                          </div>
                          <Title level={4} className="!mb-2">闯关完成</Title>
                          <Text className="text-danmo block">下一章已解锁，今日打卡已完成</Text>
                        </div>
                        <Button
                          customVariant="primary"
                          className="w-full"
                          onClick={() => {
                            const next = chapters.find(c => c.sort_order === (currentChapter?.sort_order ?? 0) + 1)
                            if (next) {
                              handleChapterChange(next.id)
                            }
                            setQuizResult(null)
                            setCurrentQuiz(null)
                            setActiveTab('reading')
                          }}
                        >
                          继续下一章阅读
                        </Button>
                      </div>
                    ) : currentQuiz ? (
                      <div className="space-y-5">
                        <div className="flex items-center justify-between">
                          <Title level={5} className="!mb-0">{currentQuiz.title}</Title>
                          <Text className="text-xs text-danmo">
                            已答 {Object.keys(quizAnswers).length} / {quizQuestions.length} 题
                          </Text>
                        </div>
                        <div className="w-full h-1.5 bg-xuanzhi-dark rounded-full overflow-hidden">
                          <div
                            className="h-full bg-shiqing rounded-full transition-all duration-500"
                            style={{ width: `${(Object.keys(quizAnswers).length / quizQuestions.length) * 100}%` }}
                          />
                        </div>
                        {quizQuestions.map((q, idx) => {
                          const typeLabel =
                            q.question_type === 'choice'
                              ? { text: '选择题', color: 'shiqing' }
                              : q.question_type === 'fill'
                                ? { text: '填空题', color: 'tenghuang' }
                                : { text: '简答题', color: 'zhuqing' }
                          return (
                            <div
                              key={q.id}
                              className="p-5 bg-white rounded-xl border border-danmo-light shadow-paper transition-shadow hover:shadow-card-hover"
                            >
                              <div className="flex items-center gap-2 mb-3">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-mohei text-white text-xs font-bold">
                                  {idx + 1}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded text-xs font-medium border bg-${typeLabel.color}-50 text-${typeLabel.color} border-${typeLabel.color}`}
                                >
                                  {typeLabel.text}
                                </span>
                              </div>
                              <Text className="font-medium text-mohei block mb-4 leading-relaxed">{q.content}</Text>
                              {q.question_type === 'choice' && q.options ? (
                                <div className="flex flex-col gap-2">
                                  {q.options.map((opt: string) => {
                                    const selected = quizAnswers[q.id] === opt
                                    return (
                                      <div
                                        key={opt}
                                        onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                          selected
                                            ? 'border-shiqing bg-shiqing-50'
                                            : 'border-danmo-light hover:border-shiqing hover:bg-shiqing-50'
                                        }`}
                                      >
                                        <Text className={selected ? 'text-shiqing font-medium' : 'text-mohei'}>
                                          {opt}
                                        </Text>
                                      </div>
                                    )
                                  })}
                                </div>
                              ) : (
                                <TextArea
                                  placeholder={q.question_type === 'fill' ? '请填写答案...' : '请简述你的回答...'}
                                  rows={q.question_type === 'fill' ? 2 : 4}
                                  value={quizAnswers[q.id] || ''}
                                  onChange={e => setQuizAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                  className="!bg-xuanzhi !border-danmo-light focus:!border-shiqing hover:!border-shiqing"
                                />
                              )}
                            </div>
                          )
                        })}
                        <Button
                          customVariant="primary"
                          className="w-full"
                          onClick={handleSubmitQuiz}
                          loading={quizLoading}
                          disabled={quizQuestions.some(q => !quizAnswers[q.id])}
                        >
                          提交答案
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Text className="text-danmo block">本章闯关</Text>
                        {quizzes.filter(q => q.chapter_id === currentChapterId).length === 0 ? (
                          <Empty description="本章暂无闯关题目" />
                        ) : (
                          quizzes
                            .filter(q => q.chapter_id === currentChapterId)
                            .map(quiz => (
                              <div
                                key={quiz.id}
                                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-danmo-light shadow-paper"
                              >
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-shiqing-50 flex items-center justify-center">
                                  <EditOutlined className="text-xl text-shiqing" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <Text className="font-medium text-mohei block truncate">{quiz.title}</Text>
                                  <div className="mt-1">
                                    {quiz.is_attempted ? (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zhuqing-50 text-zhuqing border border-zhuqing">
                                        <CheckCircleOutlined className="mr-1" />
                                        已完成
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-tenghuang-50 text-tenghuang border border-tenghuang">
                                        未开始
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  customVariant={quiz.is_attempted ? 'ghost' : 'primary'}
                                  customSize="sm"
                                  onClick={() => {
                                    if (quiz.is_attempted) {
                                      const next = chapters.find(c => c.sort_order === (currentChapter?.sort_order ?? 0) + 1)
                                      if (next) handleChapterChange(next.id)
                                    } else {
                                      handleStartQuiz(quiz)
                                    }
                                  }}
                                >
                                  {quiz.is_attempted ? '继续下一章阅读' : '开始闯关'}
                                </Button>
                              </div>
                            ))
                        )}
                      </div>
                    )}
                  </Card>
                    <div className="mt-6">
                      <video
                        controls
                        className="w-full rounded-lg"
                        poster="https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/video/%E6%94%BE%E5%9C%A8%E9%A1%B9%E7%9B%AE%E5%8C%96%E5%AD%A6%E4%B9%A0%E7%9A%84%E7%9F%A5%E8%AF%86%E9%97%AF%E5%85%B3%E7%9A%84%E6%A0%8F%E7%9B%AE.mp4?x-oss-process=video/snapshot,t_0,f_jpg"
                      >
                        <source
                          src="https://kelsey-webdemo.oss-cn-hangzhou.aliyuncs.com/jingdianchangtan/video/%E6%94%BE%E5%9C%A8%E9%A1%B9%E7%9B%AE%E5%8C%96%E5%AD%A6%E4%B9%A0%E7%9A%84%E7%9F%A5%E8%AF%86%E9%97%AF%E5%85%B3%E7%9A%84%E6%A0%8F%E7%9B%AE.mp4"
                          type="video/mp4"
                        />
                      </video>
                    </div>
                  </>
                ),
              },
              {
                key: 'checkin',
                label: '阅读打卡',
                children: (
                  <Card className="text-center">
                    <div className="py-6">
                      <ClockCircleOutlined className="text-4xl text-zhusha mb-4" />
                      <Title level={4} className="!mb-2">每日阅读打卡</Title>
                      {checkinData ? (
                        <>
                          <Text className="text-danmo block mb-4">
                            当前连续打卡 <span className="text-zhusha font-bold text-lg">{checkinData.current_consecutive_days}</span> 天
                          </Text>
                          {checkinData.is_checked_in_today ? (
                            <div className="space-y-2">
                              <AntBadge count="已打卡" style={{ backgroundColor: '#5A9A6E' }} />
                              <Text className="text-danmo block text-sm">今日已完成打卡，明天再来！</Text>
                            </div>
                          ) : (
                            <Text className="text-danmo block text-sm mb-4">
                              完成本章闯关即可自动打卡
                            </Text>
                          )}
                        </>
                      ) : (
                        <Spin />
                      )}
                    </div>
                  </Card>
                ),
              },
              {
                key: 'cards',
                label: '读书卡',
                children: (
                  <Card>
                    <div className="space-y-4">
                      <div>
                        <Text className="text-sm text-danmo block mb-2">选择模板</Text>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {CARD_TEMPLATES.map(t => (
                            <button
                              key={t.id}
                              onClick={() => {
                                setSelectedCardTemplate(t.id)
                                setCardFieldValues({})
                              }}
                              className={`p-2 rounded-lg border text-xs text-center transition-colors ${
                                selectedCardTemplate === t.id
                                  ? 'border-zhusha bg-zhusha-50 text-zhusha'
                                  : 'border-danmo-light hover:bg-xuanzhi-warm'
                              }`}
                            >
                              <FileTextOutlined className="block mb-1 text-lg" />
                              {t.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      {selectedCardTemplate && (
                        <div className="p-4 bg-xuanzhi-warm rounded-lg space-y-3">
                          <Text className="font-medium block">
                            {CARD_TEMPLATES.find(t => t.id === selectedCardTemplate)?.name}
                          </Text>
                          {CARD_TEMPLATES.find(t => t.id === selectedCardTemplate)?.fields.map(field => (
                            <Input
                              key={field}
                              placeholder={field}
                              value={cardFieldValues[field] || ''}
                              onChange={e =>
                                setCardFieldValues(prev => ({ ...prev, [field]: e.target.value }))
                              }
                            />
                          ))}
                          <Button
                            customVariant="primary"
                            customSize="sm"
                            onClick={handleSaveCard}
                            loading={cardSubmitting}
                          >
                            <SaveOutlined /> 保存读书卡
                          </Button>
                          <Button
                            customVariant="ghost"
                            customSize="sm"
                            onClick={() => {
                              setSelectedCardTemplate(null)
                              setCardFieldValues({})
                            }}
                          >
                            取消
                          </Button>
                        </div>
                      )}
                      <div>
                        <Text className="text-sm text-danmo block mb-2">已创建的读书卡</Text>
                        {cards.filter(c => c.chapter_id === currentChapterId).length === 0 ? (
                          <Empty description="本章暂无读书卡" />
                        ) : (
                          <div className="space-y-2">
                            {cards
                              .filter(c => c.chapter_id === currentChapterId)
                              .map(card => {
                                const tmpl = CARD_TEMPLATES.find(t => t.id === card.card_template)
                                return (
                                  <div key={card.id} className="p-3 border border-danmo-light rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                      <Tag>{tmpl?.name || `模板${card.card_template}`}</Tag>
                                      <AntButton
                                        type="link"
                                        danger
                                        size="small"
                                        icon={<DeleteOutlined />}
                                        onClick={() => {
                                          deleteCard(card.id).then(() => {
                                            message.success('已删除')
                                            fetchCards()
                                          })
                                        }}
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      {Object.entries(card.fields).map(([k, v]) => (
                                        <div key={k} className="text-sm">
                                          <Text className="text-danmo text-xs">{k}：</Text>
                                          <Text className="text-mohei">{v}</Text>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )
                              })}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ),
              },
            ]}
          />
        </main>

        {/* Chapter List Drawer */}
        <Drawer
          title={
            <div className="flex items-center gap-2">
              <BookOutlined className="text-shiqing" />
              <span className="font-display">篇目列表</span>
            </div>
          }
          placement="left"
          open={sidebarVisible}
          onClose={() => setSidebarVisible(false)}
          width={320}
        >
          {chapterListContent}
        </Drawer>

        {/* Annotation Drawer */}
        <Drawer
          title={
            <div className="flex items-center gap-2">
              <EditOutlined className="text-zhusha" />
              <span className="font-display">我的批注</span>
            </div>
          }
          placement="right"
          open={annotationDrawerVisible}
          onClose={() => setAnnotationDrawerVisible(false)}
          width={380}
        >
          {annotationSidebarContent}
        </Drawer>

        {/* Settings Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <SettingOutlined />
              <span>阅读设置</span>
            </div>
          }
          open={settingsVisible}
          onCancel={() => setSettingsVisible(false)}
          footer={null}
          width={360}
        >
          <SettingsPanel />
        </Modal>

        {/* Bookmark Modal */}
        <Modal
          title="添加书签"
          open={showBookmarkModal}
          onCancel={() => setShowBookmarkModal(false)}
          onOk={handleAddBookmark}
          okText="添加"
          cancelText="取消"
        >
          <div className="space-y-3">
            <Text className="text-danmo text-sm">选中文本：{selectedText.slice(0, 50)}{selectedText.length > 50 ? '...' : ''}</Text>
            <TextArea
              placeholder="书签备注（可选）..."
              value={bookmarkNote}
              onChange={e => setBookmarkNote(e.target.value)}
              rows={3}
            />
          </div>
        </Modal>

        {/* Reading Mode Overlay */}
        <ReadingModeOverlay />
      </div>
      </div>
    </Layout>
  )
}

export default Reading
