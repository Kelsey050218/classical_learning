import React, { useEffect, useState } from 'react'
import { Typography, Input, Select, Button, message, Card as AntCard, List, Tag, Popconfirm } from 'antd'
import { VideoCameraOutlined, SaveOutlined, CloudUploadOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons'
import Layout from '../../components/Layout'
import { createWork, listMyWorks, deleteWork, publishWork, Work, WorkCreate } from '../../api/works'
import { listChapters, Chapter } from '../../api/chapters'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

const VideoEdit: React.FC = () => {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [myWorks, setMyWorks] = useState<Work[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChapters()
    fetchMyWorks()
  }, [])

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
      const res = await listMyWorks('video')
      setMyWorks(res.data)
    } catch (err) {
      message.error('加载作品失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (publish = false) => {
    if (!title.trim()) {
      message.warning('请输入作品标题')
      return
    }

    setSubmitting(true)
    try {
      const data: WorkCreate = {
        work_type: 'video',
        title: title.trim(),
        description: description || undefined,
        content: content || undefined,
        chapter_id: selectedChapter || undefined,
      }
      const res = await createWork(data)

      if (publish) {
        await publishWork(res.data.id)
        message.success('作品已发布到成果展厅')
      } else {
        message.success('作品已保存为草稿')
      }

      setTitle('')
      setDescription('')
      setContent('')
      setSelectedChapter(null)
      fetchMyWorks()
    } catch (err) {
      message.error('保存失败')
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

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-zhusha rounded-lg mb-4">
            <VideoCameraOutlined className="text-3xl text-white" />
          </div>
          <Title level={2} className="font-display !mb-2">
            典籍长视频剪辑
          </Title>
          <Text className="text-danmo">
            剪辑创作，用视频讲述经典故事
          </Text>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Form */}
          <AntCard title="创建视频作品" className="h-fit">
            <div className="space-y-4">
              <div>
                <Text className="block mb-2 font-medium">作品标题</Text>
                <Input
                  placeholder="例如：《经典常谈》导读视频"
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
                <Text className="block mb-2 font-medium">作品描述</Text>
                <TextArea
                  rows={2}
                  placeholder="简要描述你的视频作品..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <Text className="block mb-2 font-medium">视频脚本 / 解说词</Text>
                <TextArea
                  rows={6}
                  placeholder="粘贴视频解说词或脚本内容..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  icon={<SaveOutlined />}
                  onClick={() => handleSave(false)}
                  loading={submitting}
                  disabled={!title.trim()}
                  className="flex-1"
                >
                  保存草稿
                </Button>
                <Button
                  type="primary"
                  icon={<CloudUploadOutlined />}
                  onClick={() => handleSave(true)}
                  loading={submitting}
                  disabled={!title.trim()}
                  className="flex-1 bg-zhusha hover:bg-zhusha-light"
                >
                  发布作品
                </Button>
              </div>
            </div>
          </AntCard>

          {/* My Works List */}
          <AntCard title="我的视频作品" loading={loading}>
            {myWorks.length === 0 ? (
              <div className="text-center py-8 text-danmo">
                <VideoCameraOutlined className="text-3xl mb-2" />
                <Text className="block">暂无视频作品</Text>
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
                          <PlayCircleOutlined className="text-zhusha" />
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

export default VideoEdit
