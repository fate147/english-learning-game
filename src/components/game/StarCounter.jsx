export default function StarCounter({ score, combo }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1">
        <span className="text-lg">⭐</span>
        <span className="font-bold text-lg text-gray-700">{score}</span>
      </div>
      {combo >= 2 && (
        <div className="flex items-center gap-1 combo-pop">
          <span className="text-orange-500 font-bold text-sm">🔥 ×{combo}</span>
        </div>
      )}
    </div>
  )
}
