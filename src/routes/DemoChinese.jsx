import { useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useChild } from '../hooks/useChild.js'
import PageShell from '../components/ui/PageShell.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import ChineseReadingChoice from '../components/question/ChineseReadingChoice.jsx'
import { SAMPLE_QUESTIONS } from '../lib/chinese/sample.js'
import { useStars } from '../hooks/useStars.js'

const TOTAL = SAMPLE_QUESTIONS.length

export default function DemoChinese() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const grade = parseInt(searchParams.get('grade')) || 3
  const { activeChild } = useChild()
  const { addStars } = useStars()
  const [current, setCurrent] = useState(0)
  const [results, setResults] = useState([])
  const [phase, setPhase] = useState('playing') // playing | done
  const [score, setScore] = useState(0)

  const question = SAMPLE_QUESTIONS[current]

  const handleAnswer = useCallback((isCorrect) => {
    const newResults = [...results, { questionId: question.id, correct: isCorrect }]
    setResults(newResults)
    if (isCorrect) setScore(s => s + 1)

    if (current + 1 >= TOTAL) {
      setTimeout(() => {
        setPhase('done')
        if (isCorrect) {
          addStars(1, 1)
        }
      }, 500)
    } else {
      setTimeout(() => {
        setCurrent(c => c + 1)
      }, 500)
    }
  }, [current, question, results, addStars])

  // 返回首页
  if (!activeChild) {
    navigate('/select-child', { replace: true })
    return null
  }

  // 结算页
  if (phase === 'done') {
    return (
      <PageShell className="bg-chinese">
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-sm w-full text-center py-8 page-enter">
            <div className="text-6xl mb-4 character-celebrate">📖</div>
            <h2 className="text-2xl font-bold text-white mb-2">故事小侦探</h2>
            <p className="text-gray-400 mb-6">完成！</p>
            <Card className="mb-6">
              <div className="text-4xl font-bold text-emerald-500">{score}/{TOTAL}</div>
              <div className="text-sm text-gray-500 mt-1">阅读理解</div>
            </Card>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => navigate('/home')} className="flex-1">返回首页</Button>
              <Button onClick={() => { setCurrent(0); setResults([]); setScore(0); setPhase('playing') }} className="flex-1">
                再来一局
              </Button>
            </div>
          </Card>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell className="bg-chinese min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-6 page-enter">
        {/* 进度条 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${((current + 1) / TOTAL) * 100}%` }}
            />
          </div>
          <span className="text-white/70 text-sm font-bold shrink-0">
            {current + 1}/{TOTAL}
          </span>
        </div>

        {/* 题目 */}
        {question && (
          <ChineseReadingChoice
            key={question.id}
            question={question}
            onAnswer={handleAnswer}
          />
        )}
      </div>
    </PageShell>
  )
}
