/**
 * 统一结果网格组件 — 显示答对/答错/正确率或星星数
 *
 * @param {number} correct - 答对数
 * @param {number} wrong - 答错数
 * @param {number} total - 总题数（用于计算正确率）
 * @param {string} [thirdLabel] - 第三列标签（默认 "正确率"）
 * @param {number} [thirdValue] - 第三列值（默认自动计算百分比）
 */
export default function ResultGrid({ correct, wrong, total, thirdLabel, thirdValue }) {
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
  const displayThird = thirdValue !== undefined ? thirdValue : accuracy
  const labelThird = thirdLabel || '📊 正确率'
  const suffix = thirdLabel ? '' : '%'

  return (
    <div className="result-grid max-w-xs fade-slide-enter">
      <div className="result-item">
        <div className="num green">{correct}</div>
        <div className="label">✅ 答对</div>
      </div>
      <div className="result-item">
        <div className="num red">{wrong}</div>
        <div className="label">❌ 答错</div>
      </div>
      <div className="result-item">
        <div className="num amber">{displayThird}{suffix}</div>
        <div className="label">{labelThird}</div>
      </div>
    </div>
  )
}
