import React, { useState } from 'react'
import { Typography, Radio, Input, Button, message } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import { createEvaluation } from '../../api/evaluations'

const { Text, Title } = Typography
const { TextArea } = Input

interface EvaluationFormProps {
  projectId: number
  onSaved?: () => void
}

const GRADES = [
  { value: 'A', label: 'A（优秀）' },
  { value: 'B', label: 'B（良好）' },
  { value: 'C', label: 'C（合格）' },
  { value: 'D', label: 'D（待改进）' },
]

// 项目一：个人阅读评价量表
const PROJECT1_RUBRIC = [
  {
    category: '阅读详情',
    criteria: [
      '按照项目计划，按时阅读，完成阅读量',
      '阅读中每章节做阅读笔记，圈点勾画重点，并完成每章节思维导图',
      '能阐明文章的观点，对《经典常谈》内容有自己的感悟和理解',
    ],
  },
  {
    category: '交流互动情况',
    criteria: [
      '遇到问题积极向他人询问，共同探讨交流',
      '能清晰流畅地发表看法和观点，能倾听他人的发言',
      '分享自己的阅读心得、阅读成果',
    ],
  },
  {
    category: '学习参与情况',
    criteria: [
      '遵守小组的规则、制度，认真执行小组的任务',
      '建议积极参与合作学习，配合小组完成学习任务',
    ],
  },
]

// 项目二：阅读闯关 + 论坛辩论
const PROJECT2_RUBRIC = [
  {
    section: '阅读闯关·勋章打卡计划',
    maxScore: 100,
    items: [
      { name: '打卡完成', maxScore: 40, standard: '100%完成阅读打卡' },
      { name: '闯关质量', maxScore: 40, standard: '集齐全部勋章，测试正确率高' },
      { name: '素材积累', maxScore: 20, standard: '主动整理知识点，形成素材库' },
    ],
  },
  {
    section: '经典思想论坛·辩论思辨',
    maxScore: 100,
    items: [
      { name: '立场论据', maxScore: 35, standard: '立场明确，论据贴合原文、充分' },
      { name: '逻辑思辨', maxScore: 35, standard: '论证严谨、思辨有深度' },
      { name: '表达流畅', maxScore: 20, standard: '表达清晰、有感染力' },
      { name: '协作参与', maxScore: 10, standard: '积极参与小组准备与辩论' },
    ],
  },
]

// 项目三：UP主创作计划
const PROJECT3_RUBRIC = [
  {
    section: '视频制作评价',
    items: [
      { name: '封面制作', standard: '封面要素齐全，有一定独特性和新颖性，能体现文本内容，富有美感' },
      { name: '内容要点', standard: '内容简洁明了，重点突出，能直接反映文本的核心观点和主要意思' },
      { name: '图片搭配', standard: '图案绘制生动形象、大小合适，能反映文本核心观点，彰显文本中心意思' },
      { name: '讲解效果', standard: '讲解效果符合《经典常谈》主题，吸引力强，视觉效果好' },
      { name: '汇报效果', standard: '时间把控合适，环节衔接自然；语言流畅，仪态大方，能调动参与者情绪' },
      { name: '支撑材料', standard: 'PPT制作精美简洁，汇报形式新颖' },
    ],
  },
  {
    section: '配乐朗诵评价',
    items: [
      { name: '文本还原', standard: '文本还原准确，无错字、漏读、添字，完整呈现《诗经》或唐诗意境' },
      { name: '诵读节奏', standard: '节奏停顿合理，重音处理恰当，符合文本韵律与情感逻辑，重点突出，流畅自然' },
      { name: '声情表达', standard: '情感饱满真挚，能贴合文本意境传递情感，富有感染力，符合相关典籍主题' },
      { name: '作品呈现', standard: '音视频作品的配乐、字幕、封面/片头设计贴合主题，有独特性和新颖性，整体呈现整洁美观' },
      { name: '展示表现', standard: '展示过程仪态大方，表达自然流畅，时间把控合适，环节衔接自然，能调动参与者情绪' },
      { name: '辅助支撑', standard: '配套诵读背景材料制作简洁清晰，形式新颖，辅助呈现效果好' },
    ],
  },
]

const Project1Form: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
  const [scores, setScores] = useState<Record<string, string>>({})
  const [comment, setComment] = useState('')

  const handleSave = () => {
    onSubmit({ scores, self_comment: comment })
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <Title level={4}>《经典常谈》个人阅读评价量表</Title>
        <Text className="text-danmo">项目一：个人阅读</Text>
      </div>

      {PROJECT1_RUBRIC.map((section) => (
        <div key={section.category} className="border border-danmo-light rounded-lg overflow-hidden">
          <div className="bg-xuanzhi px-4 py-2 font-medium text-mohei">{section.category}</div>
          {section.criteria.map((criteria, idx) => (
            <div key={idx} className="p-4 border-t border-danmo-light">
              <Text className="block mb-3">{criteria}</Text>
              <div className="flex gap-4 flex-wrap">
                {GRADES.map((g) => (
                  <Radio
                    key={g.value}
                    checked={scores[`${section.category}_${idx}`] === g.value}
                    onChange={() =>
                      setScores((prev) => ({ ...prev, [`${section.category}_${idx}`]: g.value }))
                    }
                  >
                    {g.label}
                  </Radio>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}

      <div>
        <Text className="block mb-2 font-medium">自我评语</Text>
        <TextArea
          rows={3}
          placeholder="请输入自我评价..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} className="bg-zhusha hover:bg-zhusha-light">
        保存评价
      </Button>
    </div>
  )
}

const Project2Form: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
  const [scores, setScores] = useState<Record<string, number | ''>>({})
  const [comment, setComment] = useState('')

  const handleSave = () => {
    onSubmit({ scores, self_comment: comment })
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <Title level={4}>阅读闯关·勋章打卡 / 论坛辩论 评价量表</Title>
        <Text className="text-danmo">项目二：阅读闯关与勋章打卡</Text>
      </div>

      {PROJECT2_RUBRIC.map((section) => (
        <div key={section.section} className="border border-danmo-light rounded-lg overflow-hidden">
          <div className="bg-xuanzhi px-4 py-2 font-medium text-mohei flex justify-between">
            <span>{section.section}</span>
            <span>满分：{section.maxScore}分</span>
          </div>
          {section.items.map((item, idx) => (
            <div key={idx} className="p-4 border-t border-danmo-light">
              <div className="flex items-center justify-between mb-2">
                <Text className="font-medium">{item.name}（{item.maxScore}分）</Text>
                <Input
                  type="number"
                  className="w-20"
                  placeholder="得分"
                  value={scores[`${section.section}_${idx}`]}
                  onChange={(e) =>
                    setScores((prev) => ({
                      ...prev,
                      [`${section.section}_${idx}`]: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <Text className="text-danmo text-sm">评价标准：{item.standard}</Text>
            </div>
          ))}
        </div>
      ))}

      <div>
        <Text className="block mb-2 font-medium">自我评语</Text>
        <TextArea
          rows={3}
          placeholder="请输入自我评价..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} className="bg-tenghuang hover:bg-tenghuang-dark">
        保存评价
      </Button>
    </div>
  )
}

const Project3Form: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
  const [scores, setScores] = useState<Record<string, string>>({})
  const [comment, setComment] = useState('')

  const handleSave = () => {
    onSubmit({ scores, self_comment: comment })
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <Title level={4}>《经典常谈》UP主创作计划评价量表</Title>
        <Text className="text-danmo">项目三：UP主创作计划</Text>
      </div>

      {PROJECT3_RUBRIC.map((section) => (
        <div key={section.section} className="border border-danmo-light rounded-lg overflow-hidden">
          <div className="bg-xuanzhi px-4 py-2 font-medium text-mohei">{section.section}</div>
          {section.items.map((item, idx) => (
            <div key={idx} className="p-4 border-t border-danmo-light">
              <Text className="font-medium block mb-2">{item.name}</Text>
              <Text className="text-danmo text-sm block mb-3">{item.standard}</Text>
              <div className="flex gap-4 flex-wrap">
                {GRADES.map((g) => (
                  <Radio
                    key={g.value}
                    checked={scores[`${section.section}_${idx}`] === g.value}
                    onChange={() =>
                      setScores((prev) => ({ ...prev, [`${section.section}_${idx}`]: g.value }))
                    }
                  >
                    {g.label}
                  </Radio>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}

      <div>
        <Text className="block mb-2 font-medium">自我评语</Text>
        <TextArea
          rows={3}
          placeholder="请输入自我评价..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} className="bg-shiqing hover:bg-shiqing-light">
        保存评价
      </Button>
    </div>
  )
}

const EvaluationForm: React.FC<EvaluationFormProps> = ({ projectId, onSaved }) => {
  const handleSubmit = async (data: any) => {
    try {
      await createEvaluation({
        project_id: projectId,
        form_type: `project${projectId}`,
        scores: data.scores,
        self_comment: data.self_comment,
      })
      message.success('评价已保存')
      onSaved?.()
    } catch (err) {
      message.error('保存失败')
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {projectId === 1 && <Project1Form onSubmit={handleSubmit} />}
      {projectId === 2 && <Project2Form onSubmit={handleSubmit} />}
      {projectId === 3 && <Project3Form onSubmit={handleSubmit} />}
    </div>
  )
}

export default EvaluationForm
