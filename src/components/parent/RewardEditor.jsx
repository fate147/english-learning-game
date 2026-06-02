import { useState } from 'react'
import Button from '../ui/Button.jsx'

export default function RewardEditor({ onAdd }) {
  const [name, setName] = useState('')
  const [cost, setCost] = useState(10)
  const [icon, setIcon] = useState('🎁')

  const handleAdd = async () => {
    if (!name.trim()) return
    await onAdd({ name: name.trim(), cost, icon })
    setName('')
    setCost(10)
    setIcon('🎁')
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-3 space-y-2">
      <h4 className="font-medium text-slate-300 text-sm">添加自定义奖励</h4>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)}
        placeholder="奖励名称" maxLength={20}
        className="w-full px-3 py-2 border border-slate-600 rounded-lg text-sm bg-slate-700 text-slate-100 placeholder-slate-400 focus:border-[var(--theme-color)] focus:outline-none" />
      <div className="flex gap-2">
        <input type="number" value={cost} onChange={(e) => setCost(Math.max(1, parseInt(e.target.value) || 1))} min={1} max={999}
          className="w-20 px-3 py-2 border border-slate-600 rounded-lg text-sm bg-slate-700 text-slate-100 focus:border-[var(--theme-color)] focus:outline-none" />
        <input type="text" value={icon} onChange={(e) => setIcon(e.target.value)} maxLength={2}
          className="w-14 px-3 py-2 border border-slate-600 rounded-lg text-sm text-center bg-slate-700 text-slate-100 focus:border-[var(--theme-color)] focus:outline-none" />
        <Button onClick={handleAdd} size="sm" disabled={!name.trim()}>添加</Button>
      </div>
    </div>
  )
}
