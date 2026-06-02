import { supabase } from './supabase.js'

// SHA-256 hash，避免密码明文存储
async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function getChildren(userId) {
  const { data, error } = await supabase
    .from('child_profiles')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('created_at', { ascending: true })
  return { data, error }
}

export async function getChild(userId, childId) {
  const { data, error } = await supabase
    .from('child_profiles')
    .select('*')
    .eq('user_id', userId)
    .eq('child_id', childId)
    .single()
  return { data, error }
}

export async function createChild(userId, childId, name, avatar, password) {
  const insertData = {
    user_id: userId,
    child_id: childId,
    name,
    avatar: avatar || null,
    total_earned_stars: 0,
    available_stars: 0,
  }
  if (password) {
    insertData.parent_password = await hashPassword(password)
  }
  const { data, error } = await supabase
    .from('child_profiles')
    .insert([insertData])
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

export async function archiveChild(userId, childId) {
  return updateChild(userId, childId, { is_archived: true })
}

export async function setParentPassword(userId, childId, password) {
  const hashed = await hashPassword(password)
  return updateChild(userId, childId, { parent_password: hashed })
}

export async function verifyParentPassword(userId, childId, password) {
  const { data, error } = await supabase
    .from('child_profiles')
    .select('parent_password')
    .eq('user_id', userId)
    .eq('child_id', childId)
    .single()

  if (error) return { data: null, error }
  if (!data.parent_password) return { data: null, error: new Error('未设置家长密码') }

  // 先比 hash（新版），再比明文（旧数据兼容）
  const hashed = await hashPassword(password)
  if (data.parent_password === hashed) {
    return { data: true, error: null }
  }
  if (data.parent_password === password) {
    // 旧版明文密码：验证通过后自动升级为 hash
    await setParentPassword(userId, childId, password)
    return { data: true, error: null }
  }
  return { data: false, error: null }
}
