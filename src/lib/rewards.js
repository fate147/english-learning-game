import { supabase } from './supabase.js'

export async function getRewardTemplates(userId, childId) {
  const { data, error } = await supabase
    .from('reward_templates')
    .select('*')
    .eq('user_id', userId)
    .eq('child_id', childId)
    .order('created_at', { ascending: true })
  return { data, error }
}

export async function createRewardTemplate(userId, childId, template) {
  const { data, error } = await supabase
    .from('reward_templates')
    .insert([
      {
        user_id: userId,
        child_id: childId,
        name: template.name,
        cost: template.cost,
        icon: template.icon || '🎁',
      },
    ])
    .select()
    .single()
  return { data, error }
}

export async function deleteRewardTemplate(userId, childId, templateId) {
  const { error } = await supabase
    .from('reward_templates')
    .delete()
    .eq('user_id', userId)
    .eq('child_id', childId)
    .eq('id', templateId)
  return { error }
}

export async function addRewardRecord(userId, childId, templateId, name, cost) {
  const { data, error } = await supabase
    .from('reward_records')
    .insert([
      {
        user_id: userId,
        child_id: childId,
        template_id: templateId,
        name,
        cost,
      },
    ])
    .select()
    .single()
  return { data, error }
}

export async function getRewardRecords(userId, childId, limit = 50) {
  const { data, error } = await supabase
    .from('reward_records')
    .select('*')
    .eq('user_id', userId)
    .eq('child_id', childId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return { data, error }
}
