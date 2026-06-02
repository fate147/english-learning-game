// Supabase 常见错误 → 中文提示映射
const ERROR_MAP = {
  // Auth
  'invalid login credentials': '邮箱或密码错误',
  'invalid email': '邮箱格式不正确',
  'email not confirmed': '邮箱未确认，请检查收件箱',
  'user already registered': '该邮箱已注册',
  'password should be at least 6 characters': '密码至少需要 6 位',
  'email address not found': '该邮箱未注册',
  'signup requires a valid password': '请设置密码',
  'too many requests': '操作过于频繁，请稍后再试',
  'email rate limit exceeded': '发送太频繁，请稍后再试',
  'new password should not be same as the old password': '新密码不能与旧密码相同',

  // Generic
  'network error': '网络连接失败，请检查网络',
  'invalid jwt': '登录已过期，请重新登录',
  'jwt expired': '登录已过期，请重新登录',
  'permission denied': '没有权限执行此操作',
  'relation does not exist': '数据表不存在，请确认数据库已初始化',
  'duplicate key': '数据重复，请刷新后重试',
  'row-level security policy': '数据库权限未配置，请在 Supabase SQL Editor 中执行 fix_rls_policies.sql',
}

/**
 * 将 Supabase 英文错误转为中文提示
 * @param {Error|string} err
 * @returns {string}
 */
export function translateError(err) {
  if (!err) return '未知错误'

  const message = typeof err === 'string' ? err : err.message || String(err)
  const lower = message.toLowerCase()

  for (const [key, chinese] of Object.entries(ERROR_MAP)) {
    if (lower.includes(key)) return chinese
  }

  // 未知错误仍然显示原始消息，但加个前缀
  return `操作失败: ${message}`
}
