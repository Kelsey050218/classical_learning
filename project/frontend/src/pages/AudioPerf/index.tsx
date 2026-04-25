import React, { useEffect, useRef, useState } from 'react'
import { Typography, Input, Select, Button, message, Card as AntCard, List, Tag, Popconfirm } from 'antd'
import { AudioOutlined, SaveOutlined, CloudUploadOutlined, DeleteOutlined, PlayCircleOutlined, ReloadOutlined, StopOutlined } from '@ant-design/icons'
import Layout from '../../components/Layout'
import { createWork, listMyWorks, deleteWork, publishWork, Work, WorkCreate } from '../../api/works'
import { listChapters, Chapter } from '../../api/chapters'
import { getOssSignature, uploadToOss } from '../../api/oss'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

const BGM_FILES = [
  { name: '故宫的记忆 (二胡曲)', file: '/audio/bgms/刘连国 - 故宫的记忆 (二胡曲).ogg' },
  { name: '橄榄树 (二胡曲)', file: '/audio/bgms/刘连国 - 橄榄树 (二胡曲).ogg' },
  { name: '春江花月夜 (古筝)', file: '/audio/bgms/木木仔 - 春江花月夜 (古筝独奏版).ogg' },
  { name: '云水禅心 (古琴)', file: '/audio/bgms/王先宏 - 云水禅心 (古琴纯音乐).ogg' },
  { name: '渔舟唱晚 (古筝)', file: '/audio/bgms/邱宛心 - 渔舟唱晚 (古筝独奏).ogg' },
  { name: '平湖秋月', file: '/audio/bgms/中央民族乐团 - 平湖秋月.ogg' },
  { name: '高山流水', file: '/audio/bgms/中央民族乐团 - 高山流水.ogg' },
  { name: '英雄的黎明', file: '/audio/bgms/横山菁児 - 英雄的黎明.ogg' },
  { name: '西厢词', file: '/audio/bgms/饶宁新 - 西厢词.ogg' },
  { name: '酒狂', file: '/audio/bgms/龚一 - 酒狂.ogg' },
]

const AudioPerf: React.FC = () => {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [myWorks, setMyWorks] = useState<Work[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null)
  const [selectedBgm, setSelectedBgm] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  // Recording states
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordDuration, setRecordDuration] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    fetchChapters()
    fetchMyWorks()
  }, [])

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  const fetchChapters = async () => {
    try {
      const res = await listChapters()
      setChapters(res.data)
    } catch (err) {
      message.error('加载章节失败')
    }
  }

  const fetchMyWorks = async () => {
    setLoading(true)
    try {
      const res = await listMyWorks('audio')
      setMyWorks(res.data)
    } catch (err) {
      message.error('加载作品失败')
    } finally {
      setLoading(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setRecordedBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        stream.getTracks().forEach(t => t.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordDuration(0)

      timerRef.current = setInterval(() => {
        setRecordDuration(prev => prev + 1)
      }, 1000)
    } catch (err) {
      message.error('无法访问麦克风，请检查权限设置')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const handleSave = async (publish = false) => {
    if (!title.trim()) {
      message.warning('请输入作品标题')
      return
    }

    if (!recordedBlob) {
      message.warning('请先完成录音')
      return
    }

    setSubmitting(true)
    try {
      // 1. Get OSS signature
      const ext = recordedBlob.type.includes('webm') ? 'webm' : 'mp3'
      const filename = `rec_${Date.now()}.${ext}`
      const sigRes = await getOssSignature(filename)

      // 2. Upload to OSS
      const fileUrl = await uploadToOss(recordedBlob, sigRes.data)

      // 3. Save work record
      const data: WorkCreate = {
        work_type: 'audio',
        title: title.trim(),
        description: description || undefined,
        file_url: fileUrl,
        chapter_id: selectedChapter || undefined,
      }
      const res = await createWork(data)

      // 4. Publish if requested
      if (publish) {
        await publishWork(res.data.id)
        message.success('作品已发布到成果展厅')
      } else {
        message.success('作品已保存为草稿')
      }

      // Reset
      setTitle('')
      setDescription('')
      setSelectedChapter(null)
      setSelectedBgm(null)
      setRecordedBlob(null)
      setAudioUrl(null)
      setRecordDuration(0)
      fetchMyWorks()
    } catch (err: any) {
      message.error(err.message || '保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteWork(id)
      message.success('已删除')
      fetchMyWorks()
    } catch (err) {
      message.error('删除失败')
    }
  }

  const handlePublish = async (id: number) => {
    try {
      await publishWork(id)
      message.success('已发布到成果展厅')
      fetchMyWorks()
    } catch (err) {
      message.error('发布失败')
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-zhuqing rounded-lg mb-4">
            <AudioOutlined className="text-3xl text-white" />
          </div>
          <Title level={2} className="font-display !mb-2">
            经典声演
          </Title>
          <Text className="text-danmo">
            配乐朗诵，用声音演绎经典之美
          </Text>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Form */}
          <div className="space-y-4">
            <AntCard title="录制音频作品">
              <div className="space-y-4">
                <div>
                  <Text className="block mb-2 font-medium">作品标题</Text>
                  <Input
                    placeholder="例如：《诗经》朗诵"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <Text className="block mb-2 font-medium">关联章节</Text>
                  <Select
                    placeholder="选择关联章节（可选）"
                    className="w-full"
                    allowClear
                    value={selectedChapter}
                    onChange={setSelectedChapter}
                  >
                    {chapters.map((ch) => (
                      <Option key={ch.id} value={ch.id}>
                        {ch.title}
                      </Option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Text className="block mb-2 font-medium">选择配乐</Text>
                  <Select
                    placeholder="选择背景音乐（可选）"
                    className="w-full"
                    allowClear
                    value={selectedBgm}
                    onChange={setSelectedBgm}
                  >
                    {BGM_FILES.map((bgm) => (
                      <Option key={bgm.file} value={bgm.file}>
                        {bgm.name}
                      </Option>
                    ))}
                  </Select>
                  {selectedBgm && (
                    <audio
                      ref={audioPlayerRef}
                      src={selectedBgm}
                      loop
                      className="w-full mt-2"
                      controls
                    />
                  )}
                </div>

                <div>
                  <Text className="block mb-2 font-medium">作品描述</Text>
                  <TextArea
                    rows={2}
                    placeholder="简要描述你的音频作品..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Recording Controls */}
                <div className="p-4 bg-xuanzhi-warm rounded-lg text-center">
                  {isRecording ? (
                    <div className="space-y-3">
                      <div className="text-zhusha text-2xl font-mono font-bold">
                        {formatTime(recordDuration)}
                      </div>
                      <Button
                        danger
                        icon={<StopOutlined />}
                        onClick={stopRecording}
                        className="bg-zhusha hover:bg-zhusha-dark text-white"
                      >
                        停止录音
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {audioUrl ? (
                        <>
                          <audio src={audioUrl} controls className="w-full" />
                          <Text className="text-danmo text-sm block">
                            录音时长: {formatTime(recordDuration)}
                          </Text>
                          <Button
                            icon={<ReloadOutlined />}
                            onClick={() => {
                              setRecordedBlob(null)
                              setAudioUrl(null)
                              setRecordDuration(0)
                            }}
                          >
                            重新录制
                          </Button>
                        </>
                      ) : (
                        <Button
                          type="primary"
                          icon={<AudioOutlined />}
                          onClick={startRecording}
                          className="bg-zhuqing hover:bg-zhuqing-dark"
                        >
                          开始录音
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    icon={<SaveOutlined />}
                    onClick={() => handleSave(false)}
                    loading={submitting}
                    disabled={!title.trim() || !recordedBlob}
                    className="flex-1"
                  >
                    保存草稿
                  </Button>
                  <Button
                    type="primary"
                    icon={<CloudUploadOutlined />}
                    onClick={() => handleSave(true)}
                    loading={submitting}
                    disabled={!title.trim() || !recordedBlob}
                    className="flex-1 bg-zhusha hover:bg-zhusha-light"
                  >
                    发布作品
                  </Button>
                </div>
              </div>
            </AntCard>
          </div>

          {/* My Works List */}
          <AntCard title="我的音频作品" loading={loading}>
            {myWorks.length === 0 ? (
              <div className="text-center py-8 text-danmo">
                <AudioOutlined className="text-3xl mb-2" />
                <Text className="block">暂无音频作品</Text>
              </div>
            ) : (
              <List
                dataSource={myWorks}
                renderItem={(work) => (
                  <List.Item
                    actions={[
                      work.status === 'draft' ? (
                        <Button
                          key="pub"
                          type="link"
                          size="small"
                          onClick={() => handlePublish(work.id)}
                        >
                          发布
                        </Button>
                      ) : (
                        <Tag key="pub" color="success">已发布</Tag>
                      ),
                      <Popconfirm
                        key="del"
                        title="确认删除？"
                        onConfirm={() => handleDelete(work.id)}
                      >
                        <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                          删除
                        </Button>
                      </Popconfirm>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <div className="flex items-center gap-2">
                          <PlayCircleOutlined className="text-zhuqing" />
                          <span className="font-medium">{work.title}</span>
                        </div>
                      }
                      description={
                        <div className="text-xs text-danmo">
                          {work.description || '无描述'}
                          <span className="mx-2">·</span>
                          {new Date(work.created_at).toLocaleDateString()}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </AntCard>
        </div>
      </div>
    </Layout>
  )
}

export default AudioPerf
