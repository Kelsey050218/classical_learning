import React, { useState } from 'react'
import { Typography, Radio, Input, Button, message } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import { createEvaluation } from '../../api/evaluations'

const { Text, Title } = Typography
const { TextArea } = Input

interface EvaluationFormProps {
  projectId?: number
  subProjectId?: number
  onSaved?: () => void
}

const SCORE_LEVELS = [
  { value: 5, label: '5分（优秀）' },
  { value: 4, label: '4分（良好）' },
  { value: 3, label: '3分（合格）' },
  { value: 2, label: '2分（待改进）' },
  { value: 1, label: '1分（需努力）' },
]

interface RubricItem {
  text: string
  standard: string
}

interface RubricDimension {
  name: string
  items: RubricItem[]
}

interface Rubric {
  title: string
  subtitle: string
  description: string
  dimensions: RubricDimension[]
}

// 量表一：典籍时间轴·历史阅读法实践（子项目1：timeline）
const RUBRIC_1: Rubric = {
  title: '典籍时间轴·历史阅读法实践',
  subtitle: '项目一·子项目1 | 核心素养：理解性阅读能力、创造性阅读能力、阅读知识',
  description: '本量表评价学生在历史时间轴阅读法实践中，对典籍历史脉络的梳理能力、信息整合能力和可视化创作能力。',
  dimensions: [
    {
      name: '阅读知识',
      items: [
        { text: '能准确识别典籍的成书时代、历史背景和关键人物（二阶3梯）', standard: '5.2基础性阅读知识' },
        { text: '能运用"历史时间阅读法"梳理典籍与对应朝代的关联（二阶4梯）', standard: '5.2基础性阅读知识' },
        { text: '能借助AI工具补充和验证典籍背景资料（二阶4梯）', standard: '5.3策略性阅读知识' },
      ],
    },
    {
      name: '理解能力',
      items: [
        { text: '能准确提取时间轴所需的关键时间节点和事件信息（二阶4梯）', standard: '6.2理解性阅读能力' },
        { text: '能概括典籍的核心内容及其历史影响（二阶5梯）', standard: '6.2理解性阅读能力' },
      ],
    },
    {
      name: '创新能力',
      items: [
        { text: '能创造性地设计时间轴的视觉呈现方式（二阶5梯）', standard: '6.4创造性阅读能力' },
        { text: '能将多本典籍的历史脉络进行整合对比（二阶6梯）', standard: '6.4创造性阅读能力' },
      ],
    },
    {
      name: '阅读态度',
      items: [
        { text: '以严谨认真的态度完成资料搜集和时间轴绘制（二阶4梯）', standard: '7.2情感性阅读价值' },
        { text: '主动投入时间轴创作，愿意反复修改完善（二阶5梯）', standard: '7.2情感性阅读价值' },
      ],
    },
  ],
}

// 量表二：动态《诗第十二》诗歌发展时间轴（项目一·子项目2）
const RUBRIC_2: Rubric = {
  title: '动态《诗第十二》诗歌发展时间轴',
  subtitle: '项目一·子项目2 | 核心素养：理解性阅读能力、评鉴性阅读能力、创造性阅读能力',
  description: '本量表评价学生在诗歌发展动态时间轴制作中，对诗歌发展脉络的理解、数据整理能力和数字化创作能力。',
  dimensions: [
    {
      name: '阅读知识',
      items: [
        { text: '能准确梳理从先秦到唐宋的诗歌发展关键节点（二阶4梯）', standard: '5.2基础性阅读知识' },
        { text: '能区分不同诗体的体裁特点和代表性诗人（二阶5梯）', standard: '5.2基础性阅读知识' },
      ],
    },
    {
      name: '理解能力',
      items: [
        { text: '能准确提取《诗第十二》中各时期诗歌的核心特征（二阶4梯）', standard: '6.2理解性阅读能力' },
        { text: '能概括诗歌发展的总体趋势和演变逻辑（二阶5梯）', standard: '6.2理解性阅读能力' },
      ],
    },
    {
      name: '鉴赏能力',
      items: [
        { text: '能对代表性诗作进行简要的审美评价（二阶5梯）', standard: '6.3评鉴性阅读能力' },
      ],
    },
    {
      name: '创新能力',
      items: [
        { text: '能运用网站工具生成可交互的动态时间轴（二阶5梯）', standard: '6.4创造性阅读能力' },
        { text: '能为时间轴添加诗人简介、作品摘录等丰富内容（二阶6梯）', standard: '6.4创造性阅读能力' },
      ],
    },
    {
      name: '阅读反思',
      items: [
        { text: '能反思诗歌发展与时代背景的深层关联（二阶5梯）', standard: '7.3践行性阅读价值' },
        { text: '能在时间轴制作中发现新的探究问题（二阶6梯）', standard: '7.3践行性阅读价值' },
      ],
    },
  ],
}

// 量表三：批注式阅读·AI辅助读书卡（项目一·子项目3）
const RUBRIC_3: Rubric = {
  title: '批注式阅读·AI辅助读书卡',
  subtitle: '项目一·子项目3 | 核心素养：策略性阅读知识、理解性阅读能力、评鉴性阅读能力',
  description: '本量表评价学生在批注式阅读和读书卡制作过程中，对阅读策略的掌握、文本理解深度和知识转化能力。',
  dimensions: [
    {
      name: '阅读知识',
      items: [
        { text: '能准确运用圈点勾画、批注等阅读方法（二阶4梯）', standard: '5.3策略性阅读知识' },
        { text: '能借助AI助手理解疑难字词和文化背景（二阶4梯）', standard: '5.3策略性阅读知识' },
      ],
    },
    {
      name: '理解能力',
      items: [
        { text: '能准确概括典籍核心观点和重要史实（二阶4梯）', standard: '6.2理解性阅读能力' },
        { text: '能用自己的语言阐释典籍中的关键概念（二阶5梯）', standard: '6.2理解性阅读能力' },
      ],
    },
    {
      name: '鉴赏能力',
      items: [
        { text: '能对典籍的语言特色和叙事手法进行简要评析（二阶5梯）', standard: '6.3评鉴性阅读能力' },
      ],
    },
    {
      name: '创新能力',
      items: [
        { text: '能将批注要点转化为规范的读书卡片（二阶4梯）', standard: '6.4创造性阅读能力' },
        { text: '读书卡片内容完整、有个人思考和感悟（二阶5梯）', standard: '6.4创造性阅读能力' },
      ],
    },
    {
      name: '阅读习惯',
      items: [
        { text: '能坚持完成每日阅读批注任务（二阶4梯）', standard: '7.3践行性阅读价值' },
        { text: '能主动运用批注方法于其他文本阅读（二阶6梯）', standard: '7.3践行性阅读价值' },
      ],
    },
  ],
}

// 量表四：阅读闯关·勋章打卡计划（项目二·子项目1）
const RUBRIC_4: Rubric = {
  title: '阅读闯关·勋章打卡计划',
  subtitle: '项目二·子项目1 | 核心素养：阅读知识、理解性阅读能力、阅读价值',
  description: '本量表评价学生在游戏化阅读闯关中的知识掌握程度、阅读坚持度和成就获得感。',
  dimensions: [
    {
      name: '阅读知识',
      items: [
        { text: '能准确回答典籍基础知识检测题（二阶3梯）', standard: '5.2基础性阅读知识' },
        { text: '能区分不同典籍的文体特点和内容范畴（二阶4梯）', standard: '5.2基础性阅读知识' },
      ],
    },
    {
      name: '理解能力',
      items: [
        { text: '能准确概括每章核心内容（二阶4梯）', standard: '6.2理解性阅读能力' },
        { text: '能通过知识点小测检验理解准确性（二阶4梯）', standard: '6.2理解性阅读能力' },
      ],
    },
    {
      name: '阅读兴趣',
      items: [
        { text: '对不同典籍篇目均保持阅读兴趣（二阶3梯）', standard: '7.2情感性阅读价值' },
        { text: '愿意为完成打卡任务投入额外时间（二阶4梯）', standard: '7.2情感性阅读价值' },
      ],
    },
    {
      name: '阅读态度',
      items: [
        { text: '主动完成每日阅读打卡，按计划推进（二阶4梯）', standard: '7.2情感性阅读价值' },
        { text: '以专注认真的态度完成阅读任务（二阶5梯）', standard: '7.2情感性阅读价值' },
      ],
    },
    {
      name: '阅读习惯',
      items: [
        { text: '能坚持完成全部阅读闯关任务（二阶4梯）', standard: '7.3践行性阅读价值' },
        { text: '能集齐勋章并形成持续阅读的动力（二阶5梯）', standard: '7.3践行性阅读价值' },
      ],
    },
  ],
}

// 量表五：经典思想论坛·议题辩论交锋（项目二·子项目2 / sub_project_id=4 forum）
const RUBRIC_5: Rubric = {
  title: '经典思想论坛·议题辩论交锋',
  subtitle: '项目二·子项目2 | 核心素养：评鉴性阅读能力、创造性阅读能力、阅读价值',
  description: '本量表评价学生在思想辩论中的批判性思维、论证能力和经典思想的现实转化能力。',
  dimensions: [
    {
      name: '评价能力',
      items: [
        { text: '能准确提炼经典中的核心观点作为论据（二阶4梯）', standard: '6.3评鉴性阅读能力' },
        { text: '能对不同思想观点进行比较和辨析（二阶5梯）', standard: '6.3评鉴性阅读能力' },
        { text: '能形成自己的立场并进行有理有据的论证（二阶6梯）', standard: '6.3评鉴性阅读能力' },
      ],
    },
    {
      name: '创新能力',
      items: [
        { text: '能提出具有探究价值的辩论议题（二阶5梯）', standard: '6.4创造性阅读能力' },
        { text: '能将经典思想与现实问题创造性结合（二阶6梯）', standard: '6.4创造性阅读能力' },
        { text: '能撰写逻辑清晰的思辨类视频脚本（二阶5梯）', standard: '6.4创造性阅读能力' },
      ],
    },
    {
      name: '阅读反思',
      items: [
        { text: '能反思自己原有观点与经典思想的差异（二阶5梯）', standard: '7.3践行性阅读价值' },
      ],
    },
    {
      name: '阅读信念',
      items: [
        { text: '相信经典思想对当代社会仍有指导意义（二阶4梯）', standard: '7.4观念性阅读价值' },
        { text: '愿意将经典智慧融入个人价值观（二阶5梯）', standard: '7.4观念性阅读价值' },
      ],
    },
  ],
}

// 量表六：经典声演·经典声韵流芳（项目三·子项目1 / sub_project_id=8 audio）
const RUBRIC_6: Rubric = {
  title: '经典声演·经典声韵流芳',
  subtitle: '项目三·子项目1 | 核心素养：评鉴性阅读能力、创造性阅读能力、阅读价值',
  description: '本量表评价学生在经典声演活动中对文本情感的理解、诵读表现力和创作完成度。',
  dimensions: [
    {
      name: '阅读知识',
      items: [
        { text: '能准确理解所选片段的字词含义和语音特点（二阶4梯）', standard: '5.2基础性阅读知识' },
        { text: '能借助诵读体会经典文本的节奏和韵律（二阶5梯）', standard: '5.3策略性阅读知识' },
      ],
    },
    {
      name: '鉴赏能力',
      items: [
        { text: '能把握所选片段的情感基调和意境氛围（二阶5梯）', standard: '6.3评鉴性阅读能力' },
        { text: '能通过诵读展现对文本审美特质的理解（二阶5梯）', standard: '6.3评鉴性阅读能力' },
      ],
    },
    {
      name: '创新能力',
      items: [
        { text: '能完成音频或视频录制并适当配乐（二阶4梯）', standard: '6.4创造性阅读能力' },
        { text: '作品呈现完整，有个人对文本的独特诠释（二阶5梯）', standard: '6.4创造性阅读能力' },
      ],
    },
    {
      name: '阅读兴趣',
      items: [
        { text: '对经典诵读活动保持积极兴趣（二阶3梯）', standard: '7.2情感性阅读价值' },
      ],
    },
    {
      name: '阅读态度',
      items: [
        { text: '认真练习诵读，反复打磨作品质量（二阶5梯）', standard: '7.2情感性阅读价值' },
      ],
    },
    {
      name: '阅读认同',
      items: [
        { text: '在声演中感受到经典的语言魅力（二阶4梯）', standard: '7.4观念性阅读价值' },
      ],
    },
  ],
}

// 量表七：典籍短片创作·复刻《典籍里的中国》（项目三·子项目2 / sub_project_id=9 video）
const RUBRIC_7: Rubric = {
  title: '典籍短片创作·复刻《典籍里的中国》',
  subtitle: '项目三·子项目2 | 核心素养：评鉴性阅读能力、创造性阅读能力、阅读价值',
  description: '本量表评价学生在典籍短片创作中的综合素养，包括脚本创作、视频制作和经典传播能力。',
  dimensions: [
    {
      name: '评价能力',
      items: [
        { text: '能准确评价和筛选前期积累的核心素材（二阶5梯）', standard: '6.3评鉴性阅读能力' },
        { text: '能对脚本逻辑和叙事效果进行自我评估（二阶5梯）', standard: '6.3评鉴性阅读能力' },
      ],
    },
    {
      name: '创新能力',
      items: [
        { text: '能将经典内容转化为适合视频传播的脚本（二阶5梯）', standard: '6.4创造性阅读能力' },
        { text: '能运用剪辑技巧完成具有一定观赏性的短片（二阶6梯）', standard: '6.4创造性阅读能力' },
        { text: '作品有个人解读视角，展现独特创意（二阶6梯）', standard: '6.4创造性阅读能力' },
      ],
    },
    {
      name: '理解能力',
      items: [
        { text: '能准确传达典籍的核心思想和文化内涵（二阶5梯）', standard: '6.2理解性阅读能力' },
      ],
    },
    {
      name: '阅读认同',
      items: [
        { text: '认可经典阅读赋予个人成长的价值（二阶4梯）', standard: '7.4观念性阅读价值' },
        { text: '愿意以视频创作方式传播经典文化（二阶5梯）', standard: '7.4观念性阅读价值' },
      ],
    },
    {
      name: '阅读信念',
      items: [
        { text: '相信经典阅读能增长见识、丰富知识（二阶4梯）', standard: '7.4观念性阅读价值' },
        { text: '愿意长期坚持经典阅读与文化传播（二阶5梯）', standard: '7.4观念性阅读价值' },
      ],
    },
  ],
}

const SUB_PROJECT_RUBRICS: Record<number, Rubric> = {
  1: RUBRIC_1,   // timeline
  2: RUBRIC_2,   // 动态诗歌时间轴（预留）
  3: RUBRIC_3,   // 批注式阅读（预留）
  4: RUBRIC_5,   // forum
  5: RUBRIC_5,   // ai_script 复用论坛量表
  6: RUBRIC_4,   // 阅读闯关（预留）
  7: RUBRIC_4,   // 阅读闯关（预留）
  8: RUBRIC_6,   // audio
  9: RUBRIC_7,   // video
  10: RUBRIC_7,  // capcut 复用视频创作量表
}

// 项目级量表：当完成大项目时使用，包含该项目下所有子项目的量表
const PROJECT_RUBRICS: Record<number, Rubric[]> = {
  1: [RUBRIC_1],
  2: [RUBRIC_5],
  3: [RUBRIC_6, RUBRIC_7],
}

const RubricForm: React.FC<{ rubric: Rubric; onSubmit: (data: any) => void }> = ({ rubric, onSubmit }) => {
  const [scores, setScores] = useState<Record<string, number>>({})
  const [comment, setComment] = useState('')

  const handleSave = () => {
    onSubmit({ scores, self_comment: comment })
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <Title level={4}>{rubric.title}</Title>
        <Text className="text-danmo block">{rubric.subtitle}</Text>
        <Text className="text-xs text-danmo mt-2 block max-w-2xl mx-auto">{rubric.description}</Text>
      </div>

      {rubric.dimensions.map((dimension) => (
        <div key={dimension.name} className="border border-danmo-light rounded-lg overflow-hidden">
          <div className="bg-xuanzhi px-4 py-2 font-medium text-mohei">{dimension.name}</div>
          {dimension.items.map((item, idx) => (
            <div key={idx} className="p-4 border-t border-danmo-light">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                <Text className="flex-1">{item.text}</Text>
                <Text className="text-xs text-danmo shrink-0 md:text-right">{item.standard}</Text>
              </div>
              <div className="flex gap-3 flex-wrap">
                {SCORE_LEVELS.map((g) => (
                  <Radio
                    key={g.value}
                    checked={scores[`${dimension.name}_${idx}`] === g.value}
                    onChange={() =>
                      setScores((prev) => ({ ...prev, [`${dimension.name}_${idx}`]: g.value }))
                    }
                  >
                    <span className="text-sm">{g.label}</span>
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

const MultiRubricForm: React.FC<{ rubrics: Rubric[]; onSubmit: (data: any) => void }> = ({ rubrics, onSubmit }) => {
  const [allScores, setAllScores] = useState<Record<string, number>>({})
  const [comment, setComment] = useState('')

  const handleSave = () => {
    onSubmit({ scores: allScores, self_comment: comment })
  }

  return (
    <div className="space-y-8">
      {rubrics.map((rubric, rIdx) => (
        <div key={rIdx} className="space-y-6">
          <div className="text-center mb-4 border-b border-danmo-light pb-4">
            <Title level={4}>{rubric.title}</Title>
            <Text className="text-danmo block">{rubric.subtitle}</Text>
            <Text className="text-xs text-danmo mt-2 block max-w-2xl mx-auto">{rubric.description}</Text>
          </div>

          {rubric.dimensions.map((dimension) => (
            <div key={`${rIdx}_${dimension.name}`} className="border border-danmo-light rounded-lg overflow-hidden">
              <div className="bg-xuanzhi px-4 py-2 font-medium text-mohei">{dimension.name}</div>
              {dimension.items.map((item, idx) => (
                <div key={idx} className="p-4 border-t border-danmo-light">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                    <Text className="flex-1">{item.text}</Text>
                    <Text className="text-xs text-danmo shrink-0 md:text-right">{item.standard}</Text>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {SCORE_LEVELS.map((g) => (
                      <Radio
                        key={g.value}
                        checked={allScores[`${rIdx}_${dimension.name}_${idx}`] === g.value}
                        onChange={() =>
                          setAllScores((prev) => ({ ...prev, [`${rIdx}_${dimension.name}_${idx}`]: g.value }))
                        }
                      >
                        <span className="text-sm">{g.label}</span>
                      </Radio>
                    ))}
                  </div>
                </div>
              ))}
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

const EvaluationForm: React.FC<EvaluationFormProps> = ({ projectId, subProjectId, onSaved }) => {
  const handleSubmit = async (data: any) => {
    try {
      const targetId = subProjectId || projectId || 1
      await createEvaluation({
        project_id: projectId || 0,
        form_type: subProjectId ? `sub_project_${subProjectId}` : `project_${projectId}`,
        scores: data.scores,
        self_comment: data.self_comment,
      })
      message.success('评价已保存')
      onSaved?.()
    } catch (err) {
      message.error('保存失败')
    }
  }

  let content: React.ReactNode = null

  if (subProjectId && SUB_PROJECT_RUBRICS[subProjectId]) {
    content = <RubricForm rubric={SUB_PROJECT_RUBRICS[subProjectId]} onSubmit={handleSubmit} />
  } else if (projectId && PROJECT_RUBRICS[projectId]) {
    const rubrics = PROJECT_RUBRICS[projectId]
    if (rubrics.length === 1) {
      content = <RubricForm rubric={rubrics[0]} onSubmit={handleSubmit} />
    } else {
      content = <MultiRubricForm rubrics={rubrics} onSubmit={handleSubmit} />
    }
  } else {
    content = <div className="text-center text-danmo py-8">暂无评价量表</div>
  }

  return <div className="max-w-3xl mx-auto">{content}</div>
}

export default EvaluationForm
