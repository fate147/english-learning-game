import { STRINGS } from '../../config/strings.js'
import { calcScore } from '../../engines/scoring.js'

export default function ResultScreen({ results, onPlayAgain, onGoHome }) {
  if (!results) return null

  const { totalQuestions, correctCount, wrongCount, maxCombo, isPerfect } = results
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0

  const { totalAdd } = calcScore(correctCount, maxCombo, isPerfect, false, false)

  const confettiColors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6b6b', '#ffd93d']
  const confettiPositions = [10, 25, 40, 55, 70, 85]

  return (
    <div className="game-page-bg min-h-screen flex flex-col relative overflow-hidden">
      {/* 彩纸区域 */}
      <div className="confetti-container">
        {confettiPositions.map((pos, i) => (
          <div
            key={i}
            className="confetti-piece"
            style={{
              left: `${pos}%`,
              background: confettiColors[i],
              animationDuration: `${2.5 + i * 0.2}s`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* 装饰云朵 */}
      <div className="deco-cloud float-cloud" style={{width:'100px',height:'32px',top:'6%',left:'8%'}} />
      <div className="deco-cloud float-cloud" style={{width:'70px',height:'24px',top:'14%',right:'12%',animationDelay:'1s'}} />

      {/* 主内容 */}
      <main className="flex-1 flex flex-col items-center justify-center gap-5 px-4 relative z-10">
        {/* 表情 */}
        <div className="result-bounce text-6xl">
          {isPerfect ? '🎉' : correctCount > wrongCount ? '👏' : '💪'}
        </div>

        {/* 标题 */}
        <h2 className="text-2xl font-black text-white drop-shadow-sm">
          {isPerfect ? STRINGS.game.perfect : STRINGS.game.finished}
        </h2>

        {/* 结果网格 */}
        <div className="result-grid max-w-xs">
          <div className="result-item">
            <div className="num green">{correctCount}</div>
            <div className="label">✅ {STRINGS.game.correct}</div>
          </div>
          <div className="result-item">
            <div className="num red">{wrongCount}</div>
            <div className="label">❌ {STRINGS.game.wrong}</div>
          </div>
          <div className="result-item">
            <div className="num amber">{accuracy}%</div>
            <div className="label">📊 {STRINGS.game.accuracy}</div>
          </div>
        </div>

        {/* 星星获得 */}
        <div className="stars-earned-box">
          <div className="label">{STRINGS.game.starsEarned}</div>
          <div className="amount">⭐ +{totalAdd}</div>
        </div>

        {/* 连击显示 */}
        {maxCombo >= 3 && (
          <div className="text-orange-300 font-bold text-sm">🔥 {STRINGS.game.maxCombo} {maxCombo}</div>
        )}

        {/* 按钮 */}
        <div className="flex gap-3 w-full max-w-xs">
          <button onClick={onGoHome} className="btn-game-secondary">
            🏠 {STRINGS.game.goHome}
          </button>
          <button onClick={onPlayAgain} className="btn-game-primary">
            🔄 {STRINGS.game.playAgain}
          </button>
        </div>
      </main>
    </div>
  )
}
