import React, { useEffect, useState } from 'react'
import { Typography, Select, Input, Button, Card as AntCard, message, Spin, Table, Collapse } from 'antd'
import { FileTextOutlined, RocketOutlined, SaveOutlined, CheckCircleOutlined, BulbOutlined, VideoCameraOutlined, AudioOutlined, EyeOutlined, SkinOutlined, HeartOutlined } from '@ant-design/icons'
import Layout from '../../components/Layout'
import { generateScript, ScriptGenerateResponse } from '../../api/aiScript'
import { createWork } from '../../api/works'
import { listChapters, Chapter } from '../../api/chapters'
import { completeSubProject } from '../../api/learning'

const { Panel } = Collapse

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
      <div className="relative -mx-4 -my-6 px-4 py-6 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 min-h-[calc(100vh-4rem)]">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-screen h-full bg-cover bg-center opacity-[0.30] pointer-events-none"
          style={{ backgroundImage: 'url(/images/backgrounds/learning.webp)' }}
        />
        <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Title level={2} className="font-display !mb-2">
            AI 短视频脚本
          </Title>
          <Text className="text-danmo">
            选择章节，AI 助你生成专业的分镜头脚本
          </Text>
        </div>

        {/* Script Writing Template */}
        <AntCard className="mb-6 bg-gradient-to-br from-xuanzhi-warm to-white border-danmo-light">
          <Collapse
            bordered={false}
            expandIconPosition="end"
            className="bg-transparent"
          >
            <Panel
              header={
                <div className="flex items-center gap-2">
                  <BulbOutlined className="text-tenghuang" />
                  <Text className="font-medium text-mohei">分镜头脚本写作模板</Text>
                  <Text className="text-xs text-danmo ml-2">（点击展开参考）</Text>
                </div>
              }
              key="1"
            >
              <div className="space-y-4 pt-2">
                <div className="bg-white rounded-lg p-4 border border-danmo-light">
                  <Text className="font-medium text-mohei block mb-3">
                    《经典常谈》之《诗》《史记》《汉书》《诸子》《诗十二》
                  </Text>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <VideoCameraOutlined className="text-shiqing mt-1" />
                        <div>
                          <Text className="text-sm font-medium text-mohei block">场景</Text>
                          <Text className="text-xs text-danmo">例如：古代书院、宫廷大殿、春日田野</Text>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <EyeOutlined className="text-shiqing mt-1" />
                        <div>
                          <Text className="text-sm font-medium text-mohei block">画面内容</Text>
                          <Text className="text-xs text-danmo">用文字描绘你要拍的画面，如：展现《诗经》中民间劳作场景，背景是春日原野与茅草屋</Text>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <FileTextOutlined className="text-shiqing mt-1" />
                        <div>
                          <Text className="text-sm font-medium text-mohei block">景别与运动</Text>
                          <Text className="text-xs text-danmo">如：《史记》纪传体叙事风格的全景跟拍镜头</Text>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <SkinOutlined className="text-shiqing mt-1" />
                        <div>
                          <Text className="text-sm font-medium text-mohei block">色调与光影</Text>
                          <Text className="text-xs text-danmo">如：《汉书》厚重沉稳的棕褐色调，柔和的顶光</Text>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <AudioOutlined className="text-shiqing mt-1" />
                        <div>
                          <Text className="text-sm font-medium text-mohei block">声音设计</Text>
                          <Text className="text-xs text-danmo">如：《诸子》百家争鸣氛围下的竹简翻阅声与辩论声</Text>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <HeartOutlined className="text-shiqing mt-1" />
                        <div>
                          <Text className="text-sm font-medium text-mohei block">我们想传达的"感觉"</Text>
                          <Text className="text-xs text-danmo">如：穿越千年的文化厚重感与诗意栖居之美</Text>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-tenghuang-50 rounded-lg p-4 border border-tenghuang-light/30">
                  <Text className="font-medium text-mohei block mb-2 flex items-center gap-2">
                    <BulbOutlined className="text-tenghuang" />
                    温馨小建议
                  </Text>
                  <ul className="space-y-2 text-sm text-mohei">
                    <li className="flex items-start gap-2">
                      <span className="text-tenghuang mt-1">•</span>
                      <span><strong>内容：</strong>结合《经典常谈》章节主题，关联《诗经》《史记》等典籍场景</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-tenghuang mt-1">•</span>
                      <span><strong>风格：</strong>体现古典韵味和学苑元素（竹简、古籍、墨香、笔墨）的视觉呈现</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-tenghuang mt-1">•</span>
                      <span><strong>节奏：</strong>契合适经典解读的舒缓节奏</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Panel>
          </Collapse>
        </AntCard>

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
    </div>
    </Layout>
  )
}

export default AIScript
