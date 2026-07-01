/**
 * 触觉反馈 — 统一入口
 * 封装 navigator.vibrate，降级无感
 */
export function vibrate(pattern) {
  try { navigator.vibrate?.(pattern) } catch {}
}
