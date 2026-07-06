import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChild } from '../hooks/useChild.js'
import { useGameTheme } from '../context/GameThemeContext.jsx'

import EmptyState from '../components/ui/EmptyState.jsx'
import ParentLayout from '../components/parent/ParentLayout.jsx'
import StatsPanel from '../components/parent/StatsPanel.jsx'
import UnlockPanel from '../components/parent/UnlockPanel.jsx'
import ErrorBookPanel from '../components/parent/ErrorBookPanel.jsx'
import RewardsPanel from '../components/parent/RewardsPanel.jsx'

export default function ParentDashboard() {
  const { childrenList, fetchChildren } = useChild()
  const { setGameTheme } = useGameTheme()
  const navigate = useNavigate()
  const fetchedRef = useRef(false)

  const [selectedChildId, setSelectedChildId] = useState(null)
  const [nav, setNav] = useState('stats')

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true
      fetchChildren()
    }
  }, [])

  const childList = childrenList || []
  const currentChildId = selectedChildId || (childList.length > 0 ? childList[0].child_id : null)

  const handleBack = () => navigate('/select-child')

  const renderPanel = () => {
    switch (nav) {
      case 'stats':
        return <StatsPanel key={currentChildId} childId={currentChildId} />
      case 'unlock':
        return <UnlockPanel key={currentChildId} childId={currentChildId} />
      case 'errors':
        return <ErrorBookPanel key={currentChildId} childId={currentChildId} />
      case 'rewards':
        return <RewardsPanel key={currentChildId} childId={currentChildId} />
      default:
        return <StatsPanel key={currentChildId} childId={currentChildId} />
    }
  }

  return (
    <ParentLayout
      childList={childList}
      currentChildId={currentChildId}
      onSelectChild={setSelectedChildId}
      activeNav={nav}
      onNavChange={setNav}
      onBack={handleBack}
      onThemeChange={setGameTheme}
    >
      {currentChildId ? (
        renderPanel()
      ) : (
        <EmptyState variant="child" text="暂无孩子，请先添加" subtext="添加孩子后即可查看学习数据" />
      )}
    </ParentLayout>
  )
}
