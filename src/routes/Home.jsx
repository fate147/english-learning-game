import { useNavigate, Navigate } from 'react-router-dom'
import { useChild } from '../hooks/useChild.js'
import { useStars } from '../hooks/useStars.js'
import { useGameTheme } from '../context/GameThemeContext.jsx'
import PageShell from '../components/ui/PageShell.jsx'
import Button from '../components/ui/Button.jsx'
import StarRain from '../components/ui/StarRain.jsx'
import ModeSelector from '../components/ui/ModeSelector.jsx'
import { getSubjectList, DEFAULT_GRADE } from '../config/subjects.js'
import { AVATARS } from '../config/avatars.js'

const MODE_ROUTE = { game: '/game', memory: '/memory', dialogue: '/dialogue' }


export default function Home() {
  const navigate = useNavigate()
  const { activeChild } = useChild()
  const { totalEarned, level } = useStars()
  const { gameTheme } = useGameTheme()
  const subjects = getSubjectList()

  if (!activeChild) return <Navigate to="/select-child" replace />

  const handleModeSelect = (subjectId, mode) => {
    const params = new URLSearchParams({
      subject: subjectId,
      grade: String(DEFAULT_GRADE),
    })
    if (mode === 'dialogue') params.set('char', 'dragon')
    navigate(MODE_ROUTE[mode] + '?' + params.toString())
  }

  return (
    <PageShell className={gameTheme.pattern}>
      <StarRain count={15} />
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-3.5rem)] p-4 sm:p-6">
        <div className="w-full max-w-lg page-enter">

          {/* 孩子信息条 */}
          <div className="flex items-center gap-4 mb-6 glass-card p-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-white/20 flex items-center justify-center text-2xl shrink-0">
              {activeChild.avatar != null ? (AVATARS[parseInt(activeChild.avatar)] || <span className="text-2xl font-bold text-white/75">?</span>) : <span className="text-2xl font-bold text-white/75">?</span>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-white truncate">{activeChild.name}</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-800 text-white">
                  Lv.{level}
                </span>
              </div>
              <p className="text-xs mt-0.5"><span className="text-yellow-400">★ {totalEarned} 颗星</span></p>
            </div>
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="sm" onClick={() => navigate('/select-child')} className="text-white/80 hover:text-white">
                切换
              </Button>
            </div>
          </div>

          {/* 科目卡片 */}
          <div className="space-y-4">
            {subjects.map((subject, idx) => {
              return (
                <div
                  key={subject.id}
                  className="glass-card overflow-hidden fade-slide-enter"
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  {/* 科目头部 */}
                  <div className="text-center px-5 py-4">
                      <h2 className="text-lg font-black text-white">{subject.name}</h2>
                      <p className="text-xs text-white/75">
                        {subject.modes.length > 1 ? `${subject.modes.length} 种玩法` : '答题挑战'}
                      </p>
                  </div>

                  {/* 模式按钮组 */}
                  <ModeSelector
                    modes={subject.modes}
                    onSelect={(mode) => handleModeSelect(subject.id, mode)}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </PageShell>
  )
}
