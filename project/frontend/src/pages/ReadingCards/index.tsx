import React, { useEffect, useState } from 'react'
import { Typography, Select, Input, Button, message, Card as AntCard, List, Popconfirm, Tag } from 'antd'
import { FileTextOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons'
import Layout from '../../components/Layout'
import { listChapters, Chapter } from '../../api/chapters'
import { createCard, listMyCards, deleteCard, ReadingCard } from '../../api/readingCards'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

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

const ReadingCards: React.FC = () => {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [myCards, setMyCards] = useState<ReadingCard[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null)
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChapters()
    fetchMyCards()
  }, [])

  const fetchChapters = async () => {
    try {
      const res = await listChapters()
      setChapters(res.data)
    } catch (err) {
      message.error('加载章节失败')
    }
  }

  const fetchMyCards = async () => {
    setLoading(true)
    try {
      const res = await listMyCards()
      setMyCards(res.data)
    } catch (err) {
      message.error('加载读书卡失败')
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateSelect = (templateId: number) => {
    setSelectedTemplate(templateId)
    setFieldValues({})
  }

  const handleSave = async () => {
    if (!selectedTemplate) {
      message.warning('请选择卡片模板')
      return
    }

    setSubmitting(true)
    try {
      await createCard({
        card_template: selectedTemplate,
        fields: fieldValues,
        chapter_id: selectedChapter || undefined,
      })
      message.success('读书卡已保存')
      setSelectedTemplate(null)
      setFieldValues({})
      setSelectedChapter(null)
      fetchMyCards()
    } catch (err) {
      message.error('保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteCard(id)
      message.success('已删除')
      fetchMyCards()
    } catch (err) {
      message.error('删除失败')
    }
  }

  const currentTemplate = CARD_TEMPLATES.find(t => t.id === selectedTemplate)

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <Title level={2} className="font-display !mb-2">
            读书卡制作
          </Title>
          <Text className="text-danmo">
            选择模板，记录阅读心得，积累经典智慧
          </Text>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Form */}
          <div className="space-y-4">
            <AntCard title="选择模板" className="h-fit">
              <div className="grid grid-cols-3 gap-2">
                {CARD_TEMPLATES.map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    className={`p-3 rounded-lg border text-sm transition-all ${
                      selectedTemplate === template.id
                        ? 'border-zhusha bg-zhusha-50 text-zhusha'
                        : 'border-danmo-light hover:border-shiqing hover:bg-shiqing-50'
                    }`}
                  >
                    <div className="font-medium truncate">{template.name}</div>
                    <div className="text-xs text-danmo mt-1">{template.fields.length}项</div>
                  </button>
                ))}
              </div>
            </AntCard>

            {currentTemplate && (
              <AntCard title={`填写：${currentTemplate.name}`}>
                <div className="space-y-3">
                  <div>
                    <Text className="block mb-2 font-medium">关联章节（可选）</Text>
                    <Select
                      className="w-full"
                      allowClear
                      placeholder="选择章节"
                      value={selectedChapter}
                      onChange={setSelectedChapter}
                    >
                      {chapters.map(ch => (
                        <Option key={ch.id} value={ch.id}>{ch.title}</Option>
                      ))}
                    </Select>
                  </div>

                  {currentTemplate.fields.map(field => (
                    <div key={field}>
                      <Text className="block mb-2 font-medium">{field}</Text>
                      {field.length > 20 ? (
                        <TextArea
                          rows={3}
                          placeholder={`请输入${field}...`}
                          value={fieldValues[field] || ''}
                          onChange={e => setFieldValues(prev => ({ ...prev, [field]: e.target.value }))}
                        />
                      ) : (
                        <Input
                          placeholder={`请输入${field}...`}
                          value={fieldValues[field] || ''}
                          onChange={e => setFieldValues(prev => ({ ...prev, [field]: e.target.value }))}
                        />
                      )}
                    </div>
                  ))}

                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    loading={submitting}
                    className="w-full bg-shiqing hover:bg-shiqing-light"
                  >
                    保存读书卡
                  </Button>
                </div>
              </AntCard>
            )}
          </div>

          {/* My Cards */}
          <AntCard title="我的读书卡" loading={loading}>
            {myCards.length === 0 ? (
              <div className="text-center py-8 text-danmo">
                <FileTextOutlined className="text-3xl mb-2" />
                <Text className="block">暂无读书卡</Text>
              </div>
            ) : (
              <List
                dataSource={myCards}
                renderItem={(card) => {
                  const template = CARD_TEMPLATES.find(t => t.id === card.card_template)
                  return (
                    <List.Item
                      actions={[
                        <Popconfirm
                          key="del"
                          title="确认删除？"
                          onConfirm={() => handleDelete(card.id)}
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
                            <Tag color="blue">{template?.name || `模板${card.card_template}`}</Tag>
                            <span className="text-xs text-danmo">
                              {new Date(card.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        }
                        description={
                          <div className="text-sm text-mohei line-clamp-2">
                            {Object.entries(card.fields).slice(0, 2).map(([k, v]) => (
                              <span key={k} className="mr-3">{k}: {String(v).slice(0, 20)}</span>
                            ))}
                          </div>
                        }
                      />
                    </List.Item>
                  )
                }}
              />
            )}
          </AntCard>
        </div>
      </div>
    </Layout>
  )
}

export default ReadingCards
