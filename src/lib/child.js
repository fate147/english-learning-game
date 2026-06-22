import { supabase } from './supabase.js'

export async function getChildren(userId) {
  const { data, error } = await supabase
    .from('child_profiles')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('created_at', { ascending: true })
  return { data, error }
}

export async function createChild(userId, childId, name, avatar) {
  const { data, error } = await supabase
    .from('child_profiles')
    .insert([{
      user_id: userId,
      child_id: childId,
      name,
      avatar: avatar || null,
      total_earned_stars: 0,
      available_stars: 0,
    }])
    .select()
    .single()
  return { data, error }
}

export async function updateChild(userId, childId, updates) {
  const { data, error } = await supabase
    .from('child_profiles')
    .update(updates)
    .eq('user_id', userId)
    .eq('child_id', childId)
    .select()
    .single()
  return { data, error }
}

export async function deleteChild(userId, childId) {
  const { error } = await supabase
    .from('child_profiles')
    .delete()
    .eq('user_id', userId)
    .eq('child_id', childId)
  return { error }
}
