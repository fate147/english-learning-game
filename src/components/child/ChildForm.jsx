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

      <div className="input-group">
        <label htmlFor="child-name" className="input-label">孩子名字</label>
        <input
          id="child-name"
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setError('') }}
          placeholder="输入名字"
          maxLength={20}
          className="input text-center text-lg"
          autoFocus
        />
      </div>

      {error && <div className="alert alert-danger text-center">{error}</div>}

      <div className="flex gap-2.5">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
            取消
          </Button>
        )}
        <Button type="submit" disabled={loading || !name.trim()} className="flex-1">
          {loading ? '创建中...' : '添加孩子'}
        </Button>
      </div>
    </form>
  )
}
