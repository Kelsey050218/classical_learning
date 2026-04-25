import React, { useEffect, useState } from 'react'
import { Typography, Select, Input, Button, Card as AntCard, message, Spin, Table } from 'antd'
import { FileTextOutlined, RocketOutlined, SaveOutlined, CheckCircleOutlined } from '@ant-design/icons'
import Layout from '../../components/Layout'
import { generateScript, ScriptGenerateResponse } from '../../api/aiScript'
import { createWork } from '../../api/works'
import { listChapters, Chapter } from '../../api/chapters'
import { completeSubProject } from '../../api/learning'

const { Title, Text } = Typography
const { Option } = Select

const styleOptions = [
  { value: 'classical', label: '古典雅致' },
  { value: 'modern', label: '现代简约' },
  { value: 'humorous', label: '幽默风趣' },
]

const AIScript: React.FC = () => {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null)
  const [scene, setScene] = useState('')
  const [style, setStyle] = useState('classical')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<ScriptGenerateResponse | null>(null)
  const [editedScript, setEditedScript] = useState('')
  const [loadingChapters, setLoadingChapters] = useState(true)

  useEffect(() => {
    fetchChapters()
  }, [])

  const fetchChapters = async () => {
    try {
      const res = await listChapters()
      setChapters(res.data)
    } catch (err) {
      message.error('加载章节失败')
    } finally {
      setLoadingChapters(false)
    }
  }

  const handleGenerate = async () => {
    if (!selectedChapter) {
      message.warning('请先选择章节')
      return
    }

    setGenerating(true)
    setResult(null)
    setEditedScript('')
    try {
      const res = await generateScript({
        chapter_id: selectedChapter,
        scene: scene || undefined,
        style,
      })
      setResult(res.data)
      setEditedScript(res.data.script_text)
      message.success('脚本生成成功！')
    } catch (err) {
      message.error('生成失败，请重试')
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!result) return

    setSaving(true)
    try {
      await createWork({
        work_type: 'script',
        title: result.title,
        content: editedScript,
        chapter_id: selectedChapter || undefined,
      })
      message.success('脚本已保存到个人作品')
    } catch (err) {
      message.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      title: '镜头号',
      dataIndex: 'shot_number',
      key: 'shot_number',
      width: 80,
    },
    {
      title: '场景',
      dataIndex: 'scene',
      key: 'scene',
    },
    {
      title: '画面内容',
      dataIndex: 'shot_content',
      key: 'shot_content',
    },
    {
      title: '景别与运动',
      dataIndex: 'camera_movement',
      key: 'camera_movement',
    },
    {
      title: '色调与光影',
      dataIndex: 'lighting_tone',
      key: 'lighting_tone',
    },
    {
      title: '声音设计',
      dataIndex: 'sound_design',
      key: 'sound_design',
    },
  ]

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-shiqing rounded-lg mb-4">
            <FileTextOutlined className="text-3xl text-white" />
          </div>
          <Title level={2} className="font-display !mb-2">
            AI 短视频脚本
          </Title>
          <Text className="text-danmo">
            选择章节，AI 助你生成专业的分镜头脚本
          </Text>
        </div>

        {/* Input Form */}
        <AntCard className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Text className="block mb-2 font-medium">选择章节</Text>
              <Select
                placeholder="请选择章节"
                className="w-full"
                loading={loadingChapters}
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
              <Text className="block mb-2 font-medium">风格</Text>
              <Select
                className="w-full"
                value={style}
                onChange={setStyle}
              >
                {styleOptions.map((s) => (
                  <Option key={s.value} value={s.value}>
                    {s.label}
                  </Option>
                ))}
              </Select>
            </div>
            <div>
              <Text className="block mb-2 font-medium">场景描述（可选）</Text>
              <Input
                placeholder="例如：古代书院、宫廷大殿..."
                value={scene}
                onChange={(e) => setScene(e.target.value)}
              />
            </div>
          </div>
          <Button
            type="primary"
            icon={<RocketOutlined />}
            onClick={handleGenerate}
            loading={generating}
            disabled={!selectedChapter}
            className="bg-shiqing hover:bg-shiqing-light"
          >
            生成脚本
          </Button>
        </AntCard>

        {/* Result */}
        {generating && (
          <div className="flex items-center justify-center py-12">
            <Spin size="large" tip="AI 正在创作脚本..." />
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <AntCard
              title={<span className="font-display text-lg">{result.title}</span>}
              extra={
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  loading={saving}
                  className="bg-zhusha hover:bg-zhusha-light"
                >
                  保存脚本
                </Button>
              }
            >
              {/* Script Text */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <Text className="text-danmo text-sm">完整脚本</Text>
                  <Text className="text-xs text-danmo">可直接编辑修改</Text>
                </div>
                <Input.TextArea
                  value={editedScript}
                  onChange={(e) => setEditedScript(e.target.value)}
                  autoSize={{ minRows: 8, maxRows: 20 }}
                  className="font-sans text-sm leading-relaxed"
                />
              </div>

              {/* Scenes Table */}
              <div>
                <Text className="text-danmo text-sm block mb-2">分镜头详情</Text>
                <Table
                  dataSource={result.scenes}
                  columns={columns}
                  rowKey="shot_number"
                  pagination={false}
                  size="small"
                  scroll={{ x: 'max-content' }}
                />
              </div>
            </AntCard>

            {/* Complete Sub-project */}
            <div className="flex justify-center pt-4">
              <Button
                type="primary"
                size="large"
                icon={<CheckCircleOutlined />}
                onClick={async () => {
                  try {
                    await completeSubProject(5)
                    message.success('AI 短视频脚本学习已完成！')
                  } catch (err: any) {
                    message.error(err.response?.data?.detail || '操作失败')
                  }
                }}
                className="bg-shiqing hover:bg-shiqing-light"
              >
                完成 AI 短视频脚本学习
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default AIScript
