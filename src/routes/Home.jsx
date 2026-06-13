import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChild } from '../hooks/useChild.js'
import PageShell from '../components/ui/PageShell.jsx'
import { getSubjectList, DEFAULT_GRADE, getGradeList } from '../config/subjects.js'

// 模式对应的图标和路由
const MODE_ROUTE = {
  game: '/game',
  memory: '/memory',
  dialogue: '/dialogue',
}

const MODE_ICON = {
  game: '🎮',
  memory: '📖',
  dialogue: '💬',
}

const MODE_LABEL = {
  game: '闯关',
  memory: '记忆',
  dialogue: '对话',
}

const GRADE_LABEL = {
  1: '一年级', 2: '二年级', 3: '三年级',
  4: '四年级', 5: '五年级', 6: '六年级',
}

export default function Home() {
  const navigate = useNavigate()
  const { activeChild } = useChild()
  const subjects = getSubjectList()
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [selectedGrade, setSelectedGrade] = useState(DEFAULT_GRADE)

  if (!activeChild) {
    navigate('/select-child', { replace: true })
    return null
  }

  const handleModeSelect = (subjectId, mode) => {
    const route = MODE_ROUTE[mode]
    const params = new URLSearchParams({
      subject: subjectId,
      grade: String(selectedGrade),
    })
    if (mode === 'dialogue') {
      params.set('char', 'dragon')
    }
    navigate(route + '?' + params.toString())
  }

  return (
    <PageShell title={`${activeChild.name} 的学习屋`}>
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] p-6">
        <div className="w-full max-w-2xl page-enter">

          {/* 年级选择行 */}
          <div className="flex justify-center gap-2 mb-8">
            {getGradeList('chinese').map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGrade(g)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all
                  ${selectedGrade === g
                    ? 'bg-white/30 text-white shadow-md'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/10'
                  }`}
              >
                {GRADE_LABEL[g]}
              </button>
            ))}
          </div>

          {/* 科目卡片 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            {subjects.map((subject) => {
              const isSelected = selectedSubject === subject.id
              return (
                <div key={subject.id} className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => setSelectedSubject(isSelected ? null : subject.id)}
                    className={`glass-card flex flex-col items-center gap-2 p-4 w-full ${
                      isSelected ? 'active' : ''
                    }`}
                  >
                    <div className="w-full aspect-square rounded-xl overflow-hidden bg-white/10 flex items-center justify-center">
                      <span className="text-6xl sm:text-7xl">{subject.icon}</span>
                    </div>
                    <span className="text-base font-extrabold text-white/90">
                      {subject.name}
                    </span>
                  </button>

                  {isSelected && (
                    <div className="w-full grid grid-cols-3 gap-2 mt-1 page-enter">
                      {subject.modes.map((mode) => (
                        <button
                          key={mode}
                          onClick={() => handleModeSelect(subject.id, mode)}
                          className="py-2.5 rounded-xl bg-white/20 backdrop-blur-sm
                                     text-white font-bold text-xs
                                     hover:bg-white/30 active:scale-95 transition-all"
                        >
                          <div className="text-base mb-0.5">{MODE_ICON[mode]}</div>
                          <div>{MODE_LABEL[mode]}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* 返回选择孩子 */}
          <button
            onClick={() => navigate('/select-child')}
            className="w-full py-4 mt-8 text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            ← 切换孩子
          </button>
        </div>
      </div>
    </PageShell>
  )
}
