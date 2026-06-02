export default function ChildCard({ child, isActive, onSelect }) {
  const avatars = ['🐱', '🐶', '🐰', '🐼', '🦊', '🐸', '🐵', '🦁']

  return (
    <button
      onClick={() => onSelect(child)}
      className={`
        relative flex flex-col items-center p-6 rounded-2xl transition-all duration-200
        ${isActive
          ? 'bg-green-500 text-white shadow-lg scale-105'
          : 'bg-white text-gray-700 border-2 border-gray-100 hover:border-green-400 hover:shadow-md'
        }
      `}
    >
      <div className="text-5xl mb-3">
        {child.avatar ? avatars[parseInt(child.avatar)] || '🐱' : '🐱'}
      </div>
      <div className="text-lg font-bold">{child.name}</div>
      <div className={`text-sm mt-1 ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
        ⭐ {child.available_stars || 0}
      </div>
    </button>
  )
}
