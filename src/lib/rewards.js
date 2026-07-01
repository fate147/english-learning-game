import { supabase } from './supabase.js'
import { spendStars } from './stars.js'
import { DEFAULT_REWARD_TEMPLATES } from '../config/rewards.js'

export async function getRewardTemplates(userId, childId) {
  try {
    const { data, error } = await supabase
      .from('reward_templates')
      .select('*')
      .eq('user_id', userId)
      .eq('child_id', childId)
      .order('created_at', { ascending: true })
    return { data, error }
  } catch (e) {
    return { data: null, error: { message: e.message || '网络连接失败' } }
  }
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

/**
 * 初始化默认奖励模板（首次使用时创建）
 * @param {string} userId
 * @param {string} childId
 * @returns {Promise<Array>} templates
 */
export async function initDefaultTemplates(userId, childId) {
  const { data: existing } = await getRewardTemplates(userId, childId)
  const templates = existing || []
  if (templates.length === 0) {
    for (const d of DEFAULT_REWARD_TEMPLATES) {
      const { data } = await createRewardTemplate(userId, childId, d)
      if (data) templates.push(data)
    }
  }
  return templates
}

/**
 * 兑换奖励：扣星星 + 记记录
 * @param {string} userId
 * @param {string} childId
 * @param {{ id: string, name: string, cost: number }} template
 * @returns {Promise<{ error: object|null }>}
 */
export async function redeemReward(userId, childId, template) {
  const { error: spendError } = await spendStars(userId, childId, template.cost)
  if (spendError) return { error: spendError }

  const { error: recordError } = await addRewardRecord(userId, childId, template.id, template.name, template.cost)
  if (recordError) return { error: recordError }

  return { error: null }
}
