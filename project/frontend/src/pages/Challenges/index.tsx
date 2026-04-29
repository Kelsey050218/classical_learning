import React, { useEffect, useState } from 'react'
import { Typography, Button, message, Spin, Empty, Card as AntCard, Tag, Radio, Input } from 'antd'
import { TrophyOutlined, CheckCircleOutlined, FireOutlined } from '@ant-design/icons'
import Layout from '../../components/Layout'
import { listQuizzes, getQuizQuestions, submitQuiz, Quiz, Question, QuizResult } from '../../api/quizzes'

const { Title, Text } = Typography

const Challenges: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [quizLoading, setQuizLoading] = useState(false)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    setLoading(true)
    try {
      const res = await listQuizzes()
      setQuizzes(res.data)
    } catch (err) {
      message.error('加载闯关数据失败')
    } finally {
      setLoading(false)
    }
  }

  const startQuiz = async (quiz: Quiz) => {
    if (quiz.is_passed) {
      message.info('该关卡已通过')
      return
    }
    setActiveQuiz(quiz)
    setResult(null)
    setAnswers({})
    setQuizLoading(true)
    try {
      const res = await getQuizQuestions(quiz.id)
      setQuestions(res.data)
    } catch (err) {
      message.error('加载题目失败')
    } finally {
      setQuizLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!activeQuiz) return
    setSubmitting(true)
    try {
      const res = await submitQuiz(activeQuiz.id, answers)
      setResult(res.data)
      if (res.data.is_passed) {
        message.success(`恭喜通过！得分：${res.data.score}/${res.data.max_score}`)
      } else {
        message.warning(`未通过，得分：${res.data.score}/${res.data.max_score}，及格线：${res.data.pass_score}`)
      }
      fetchQuizzes()
    } catch (err) {
      message.error('提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleBack = () => {
    setActiveQuiz(null)
    setQuestions([])
    setAnswers({})
    setResult(null)
  }

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
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Title level={2} className="font-display !mb-2">
            阅读闯关
          </Title>
          <Text className="text-danmo">
            挑战知识关卡，检验阅读成果，解锁学习勋章
          </Text>
        </div>

        {activeQuiz ? (
          <div className="space-y-4">
            <Button onClick={handleBack}>返回关卡列表</Button>
            <AntCard title={activeQuiz.title}>
              {quizLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Spin />
                </div>
              ) : result ? (
                <div className="space-y-4">
                  <div className="text-center py-6">
                    <div className={`text-4xl font-bold mb-2 ${result.is_passed ? 'text-zhuqing' : 'text-zhusha'}`}>
                      {result.score} / {result.max_score}
                    </div>
                    <Tag color={result.is_passed ? 'success' : 'error'}>
                      {result.is_passed ? '通过' : '未通过'}
                    </Tag>
                  </div>
                  {result.results.map((r, idx) => (
                    <div key={idx} className={`p-3 rounded-lg ${r.is_correct ? 'bg-zhuqing-50' : 'bg-zhusha-50'}`}>
                      <Text className={r.is_correct ? 'text-zhuqing' : 'text-zhusha'}>
                        {r.is_correct ? '正确' : '错误'} — 正确答案：{r.correct_answer || '见解析'}
                      </Text>
                      {r.explanation && (
                        <Text className="text-danmo text-sm block mt-1">{r.explanation}</Text>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="border-b border-danmo-light pb-4 last:border-0">
                      <Text className="font-medium block mb-3">
                        {idx + 1}. {q.content} ({q.score}分)
                      </Text>
                      {q.question_type === 'choice' && q.options ? (
                        <Radio.Group
                          value={answers[q.id]}
                          onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        >
                          {q.options.map((opt, optIdx) => (
                            <Radio key={optIdx} value={opt} className="block mb-2">
                              {opt}
                            </Radio>
                          ))}
                        </Radio.Group>
                      ) : (
                        <Input
                          placeholder="请输入答案..."
                          value={answers[q.id] || ''}
                          onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        />
                      )}
                    </div>
                  ))}
                  <Button
                    type="primary"
                    onClick={handleSubmit}
                    loading={submitting}
                    className="w-full bg-zhusha hover:bg-zhusha-light"
                  >
                    提交答案
                  </Button>
                </div>
              )}
            </AntCard>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.length === 0 ? (
              <Empty description="暂无闯关关卡" />
            ) : (
              quizzes.map((quiz, index) => (
                <AntCard
                  key={quiz.id}
                  hoverable
                  onClick={() => startQuiz(quiz)}
                  className={quiz.is_passed ? 'border-zhuqing' : ''}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      quiz.is_passed ? 'bg-zhuqing' : 'bg-zhusha'
                    }`}>
                      {quiz.is_passed ? <CheckCircleOutlined /> : <FireOutlined />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <Text className="font-medium">关卡 {index + 1}: {quiz.title}</Text>
                        {quiz.is_passed && <Tag color="success">已通过</Tag>}
                        {quiz.is_attempted && !quiz.is_passed && <Tag color="error">未通过</Tag>}
                      </div>
                      <Text className="text-danmo text-sm block mt-1">
                        {quiz.description || '通关打卡学以致用'}
                      </Text>
                      {quiz.best_score !== null && (
                        <Text className="text-sm text-tenghuang block mt-1">
                          最佳成绩: {quiz.best_score}分
                        </Text>
                      )}
                    </div>
                  </div>
                </AntCard>
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Challenges
