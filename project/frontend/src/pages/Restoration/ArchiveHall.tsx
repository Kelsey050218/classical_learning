import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Typography, Spin, Empty, Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import Layout from '../../components/Layout'
import ArchiveCard from '../../components/Restoration/ArchiveCard'
import ConnectionNetwork from '../../components/Restoration/ConnectionNetwork'
import { listChapters, getArchive, ArchiveData } from '../../api/restoration'

const { Title, Text } = Typography

const ArchiveHall: React.FC = () => {
  const navigate = useNavigate()
  const [archives, setArchives] = useState<ArchiveData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const chRes = await listChapters()
        const archivePromises = chRes.data.map(ch => getArchive(ch.id))
        const results = await Promise.all(archivePromises)
        setArchives(results.map(r => r.data))
      } catch (err) {
        console.error('Failed to load archives:', err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Spin size="large" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/restoration')}
          className="mb-4"
        >
          返回复原室
        </Button>

        <div className="text-center mb-10">
          <Title level={2} className="font-display !mb-2">
            经典溯源档案馆
          </Title>
          <Text className="text-danmo">
            全部十三部经典已修复完成，探索典籍间的关联脉络
          </Text>
        </div>

        {archives.length === 0 ? (
          <Empty description="暂无档案" />
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {archives.map(archive => (
                <ArchiveCard key={archive.chapter.id} data={archive} />
              ))}
            </div>

            <ConnectionNetwork />
          </div>
        )}
      </div>
    </Layout>
  )
}

export default ArchiveHall
