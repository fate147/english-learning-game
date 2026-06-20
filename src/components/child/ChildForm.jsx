import { useState } from 'react'
import Button from '../ui/Button.jsx'
import AvatarPicker from './AvatarPicker.jsx'
import { translateError } from '../../lib/errors.js'

export default function ChildForm({ onSubmit, onCancel }) {
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('请输入孩子名字')
      return
    }

    setLoading(true)
    setError('')
    const childId = `child_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    const { error: err } = await onSubmit(childId, name.trim(), avatar)
    setLoading(false)

    if (err) {
      setError(translateError(err))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AvatarPicker selected={avatar} onSelect={setAvatar} />

      <div>
        <label htmlFor="child-name" className="block text-sm font-medium text-white/60 mb-1.5">孩子名字</label>
        <input
          id="child-name"
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setError('') }}
          placeholder="输入名字"
          maxLength={20}
          className="w-full px-4 py-3 bg-white/12 border-2 border-white/20 rounded-xl text-center text-lg text-white placeholder-white/30
                     focus:border-[var(--theme-color)] focus:bg-white/18 focus:outline-none transition-all"
          autoFocus
        />
      </div>

      {error && <p className="text-red-300 text-sm text-center">{error}</p>}

      <div className="flex gap-3">
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="flex-1 py-3 rounded-xl font-bold bg-white/12 border-2 border-white/20 text-white/70 hover:bg-white/18 transition-all btn-ripple">
            取消
          </button>
        )}
        <button type="submit" disabled={loading || !name.trim()}
          className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-[var(--theme-color)] to-[var(--theme-color-light)] text-white hover:brightness-110 shadow-lg transition-all btn-ripple disabled:opacity-50">
          {loading ? '创建中...' : '添加孩子'}
        </button>
      </div>
    </form>
  )
}
