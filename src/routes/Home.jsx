import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChild } from '../hooks/useChild.js'
import { useStars } from '../hooks/useStars.js'
import { useTheme } from '../context/ThemeContext.jsx'
import PageShell from '../components/ui/PageShell.jsx'
import { getSubjectList, DEFAULT_GRADE, getGradeList } from '../config/subjects.js'
import { AVATARS } from '../config/avatars.js'

const MODE_ROUTE = { game: '/game', memory: '/memory', dialogue: '/dialogue' }

const MODE_CONFIG = {
  game:    { icon: '🎮', label: '闯关', desc: '答题挑战' },
  memory:  { icon: '📖', label: '记忆', desc: '背单词' },
  dialogue:{ icon: '💬', label: '对话', desc: '情景练习' },
}

const SUBJECT_STYLE = {
  english: { gradient: 'from-pink-500/30 to-purple-500/20', accent: 'border-pink-300/40' },
  chinese: { gradient: 'from-emerald-500/30 to-teal-500/20', accent: 'border-emerald-300/40' },
  math:    { gradient: 'from-amber-500/30 to-orange-500/20', accent: 'border-amber-300/40' },
}

const GRADE_LABEL = {
  1: '一年级', 2: '二年级', 3: '三年级',
  4: '四年级', 5: '五年级', 6: '六年级',
}

export default function Home() {
  const navigate = useNavigate()
  const { activeChild } = useChild()
  const { totalEarned, level } = useStars()
  const { theme, toggleTheme } = useTheme()
  const subjects = getSubjectList()
  const [selectedGrade, setSelectedGrade] = useState(DEFAULT_GRADE)

  if (!activeChild) {
    navigate('/select-child', { replace: true })
    return null
  }

  const handleModeSelect = (subjectId, mode) => {
    const params = new URLSearchParams({
      subject: subjectId,
      grade: String(selectedGrade),
    })
    if (mode === 'dialogue') params.set('char', 'dragon')
    navigate(MODE_ROUTE[mode] + '?' + params.toString())
  }

  return (
    <PageShell>
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] p-4 sm:p-6">
        <div className="w-full max-w-lg page-enter">

          {/* 孩子信息条 */}
          <div className="flex items-center gap-4 mb-6 glass-card !p-4">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/25 bg-white/10 flex items-center justify-center text-3xl shrink-0">
              {activeChild.avatar != null ? AVATARS[parseInt(activeChild.avatar)] || '🐱' : '🐱'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-white truncate">{activeChild.name}</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-white/70 border border-white/15 shrink-0">
                  Lv.{level}
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5">⭐ {totalEarned} 颗星</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleTheme}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-white/50 hover:text-white/80 hover:bg-white/10 transition-all"
                aria-label={theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              <button
                onClick={() => navigate('/select-child')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white/50 hover:text-white/80 hover:bg-white/10 transition-all"
              >
                切换
              </button>
            </div>
          </div>

          {/* 年级选择 — 药丸样式 */}
          <div className="flex justify-center gap-1.5 mb-6">
            {getGradeList('chinese').map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGrade(g)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 btn-ripple
                  ${selectedGrade === g
                    ? 'bg-white/22 text-white shadow-md border border-white/25'
                    : 'text-white/45 hover:text-white/70 hover:bg-white/8'
                  }`}
              >
                {GRADE_LABEL[g]}
              </button>
            ))}
          </div>

          {/* 科目卡片 — 每科独立展示所有模式 */}
          <div className="space-y-4">
            {subjects.map((subject, idx) => {
              const style = SUBJECT_STYLE[subject.id] || SUBJECT_STYLE.english
              return (
                <div
                  key={subject.id}
                  className={`glass-card !p-0 overflow-hidden border ${style.accent} fade-slide-enter`}
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  {/* 科目头部 */}
                  <div className={`flex items-center gap-3 px-5 py-4 bg-gradient-to-r ${style.gradient}`}>
                    <span className="text-4xl">{subject.icon}</span>
                    <div>
                      <h2 className="text-lg font-black text-white">{subject.name}</h2>
                      <p className="text-xs text-white/50">
                        {subject.modes.length > 1 ? `${subject.modes.length} 种玩法` : '答题挑战'}
                      </p>
                    </div>
                  </div>

                  {/* 模式按钮组 */}
                  <div className="grid grid-cols-3 gap-0 divide-x divide-white/10">
                    {subject.modes.map((mode) => {
                      const m = MODE_CONFIG[mode]
                      return (
                        <button
                          key={mode}
                          onClick={() => handleModeSelect(subject.id, mode)}
                          className="flex flex-col items-center gap-1.5 py-4 px-2
                                     text-white/70 hover:text-white hover:bg-white/8
                                     active:scale-95 transition-all duration-150 btn-ripple"
                        >
                          <span className="text-2xl">{m.icon}</span>
                          <span className="text-sm font-bold">{m.label}</span>
                          <span className="text-[10px] text-white/40">{m.desc}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </PageShell>
  )
}
