import { supabase } from './supabase.js'
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

function hashPassword(password) {
  return bcrypt.hashSync(password, SALT_ROUNDS)
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
    insertData.parent_password = hashPassword(password)
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

export async function deleteChild(userId, childId) {
  const { error } = await supabase
    .from('child_profiles')
    .delete()
    .eq('user_id', userId)
    .eq('child_id', childId)
  return { error }
}

export async function setParentPassword(userId, childId, password) {
  return updateChild(userId, childId, { parent_password: hashPassword(password) })
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

  const ok = bcrypt.compareSync(password, data.parent_password)
  return { data: ok, error: null }
}
