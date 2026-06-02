import { supabase } from './supabase.js'

export async function getStars(userId, childId) {
  const { data, error } = await supabase
    .from('child_profiles')
    .select('total_earned_stars, available_stars')
    .eq('user_id', userId)
    .eq('child_id', childId)
    .single()
  return { data, error }
}

// 原子操作：add_stars RPC — 避免并发读写竞争
export async function addEarnedStars(userId, childId, totalAdd, availableAdd) {
  const { data, error } = await supabase.rpc('add_stars', {
    p_user_id: userId,
    p_child_id: childId,
    p_total_add: totalAdd,
    p_available_add: availableAdd,
  })
  return { data, error }
}

// 原子操作：spend_stars RPC — 内部用 SELECT FOR UPDATE 加锁
export async function spendStars(userId, childId, cost) {
  const { data, error } = await supabase.rpc('spend_stars', {
    p_user_id: userId,
    p_child_id: childId,
    p_cost: cost,
  })
  if (error) return { data: null, error }
  return { data, error: null }
}

export function calcLevel(totalEarnedStars) {
  return Math.floor(totalEarnedStars / 10) + 1
}
