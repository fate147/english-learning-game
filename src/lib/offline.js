// localStorage 键名
const CACHE_PREFIX = 'app_'
const CACHE_KEY = CACHE_PREFIX + 'data'
const QUEUE_KEY = CACHE_PREFIX + 'queue'
const DIRTY_KEY = CACHE_PREFIX + 'dirty'

export function isOnline() {
  return navigator.onLine
}

// ---- 缓存读写 ----

export function setCachedData(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('缓存写入失败:', e)
  }
}


// ---- 离线队列 ----

function getQueue() {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function enqueue(payload) {
  const queue = getQueue()
  queue.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    payload,
    createdAt: new Date().toISOString(),
    retries: 0,
  })
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
    localStorage.setItem(DIRTY_KEY, 'true')
  } catch (e) {
    console.warn('离线队列写入失败:', e)
  }
}

function dequeue(id) {
  const queue = getQueue().filter((item) => item.id !== id)
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
    if (queue.length === 0) {
      localStorage.removeItem(DIRTY_KEY)
    }
  } catch {}
}

function incrementRetry(id) {
  const queue = getQueue().map((item) =>
    item.id === id ? { ...item, retries: item.retries + 1 } : item
  )
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
  } catch {}
}



// ---- 30s 轮询重传 ----
let syncInterval = null

export function startSync(saveFn) {
  if (syncInterval) return
  syncInterval = setInterval(async () => {
    if (!isOnline()) return
    const queue = getQueue()
    if (queue.length === 0) return

    for (const item of queue) {
      if (item.retries >= 5) {
        console.warn(`离线队列项 ${item.id} 已达最大重试次数，跳过`)
        continue
      }
      try {
        const { error } = await saveFn(item.payload)
        if (!error) {
          dequeue(item.id)
        } else {
          incrementRetry(item.id)
        }
      } catch {
        incrementRetry(item.id)
      }
    }
  }, 30000)
}

