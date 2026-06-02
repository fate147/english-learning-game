import Button from '../ui/Button.jsx'
import Card from '../ui/Card.jsx'
import PageShell from '../ui/PageShell.jsx'
import { STRINGS } from '../../config/strings.js'
import { calcScore } from '../../engines/scoring.js'

export default function ResultScreen({ results, onPlayAgain, onGoHome }) {
  if (!results) return null

  const { totalQuestions, correctCount, wrongCount, maxCombo, isPerfect } = results
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0

  return (
    <PageShell>
      <div className="flex flex-col items-center gap-6 py-4 page-enter">
        {/* 表情 */}
        <div className={`text-7xl ${isPerfect ? 'character-celebrate' : 'character-jump'}`}>
          {isPerfect ? '🎉' : correctCount > wrongCount ? '👏' : '💪'}
        </div>

        <h2 className="text-2xl font-bold text-white">
          {isPerfect ? STRINGS.game.perfect : STRINGS.game.finished}
        </h2>

        {/* 成绩卡片 */}
        <Card className="w-full max-w-xs text-center">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-500">{correctCount}</div>
              <div className="text-xs text-gray-500">{STRINGS.game.correct}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-500">{wrongCount}</div>
              <div className="text-xs text-gray-500">{STRINGS.game.wrong}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--theme-color-dark)]">{accuracy}%</div>
              <div className="text-xs text-gray-500">{STRINGS.game.accuracy}</div>
            </div>
          </div>

          {maxCombo >= 3 && (
            <div className="mt-4 text-center text-orange-500 font-bold">
              🔥 最高连击 {maxCombo}
            </div>
          )}
        </Card>

        {/* 星星获得 */}
        {(() => {
          const { totalAdd, bonuses } = calcScore(correctCount, maxCombo, isPerfect, false, false)
          return (
            <div className="text-center">
              <div className="text-sm text-white/70 mb-1">{STRINGS.game.starsEarned}</div>
              <div className="text-3xl font-bold text-yellow-400">
                ⭐ +{totalAdd}
                {bonuses.filter(b => b.reason === 'perfect').map(b => (
                  <span key="perfect" className="text-lg text-green-300 ml-1">+{b.extra}</span>
                ))}
                {bonuses.filter(b => b.reason === 'combo').map(b => (
                  <span key="combo" className="text-lg text-orange-300 ml-1">+{b.extra}</span>
                ))}
              </div>
            </div>
          )
        })()}

        <div className="flex gap-3 w-full max-w-xs">
          <Button variant="secondary" onClick={onGoHome} className="flex-1">
            {STRINGS.game.goHome}
          </Button>
          <Button onClick={onPlayAgain} className="flex-1">
            {STRINGS.game.playAgain}
          </Button>
        </div>
      </div>
    </PageShell>
  )
}
