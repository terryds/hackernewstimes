const BASE = 'https://hacker-news.firebaseio.com/v0'

const cache = new Map()

async function fetchJSON(url) {
  if (cache.has(url)) {
    const { data, ts } = cache.get(url)
    if (Date.now() - ts < 60_000) return data
  }
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  cache.set(url, { data, ts: Date.now() })
  return data
}

export async function fetchStoryIds(type = 'top') {
  const endpoint = {
    top: 'topstories',
    new: 'newstories',
    best: 'beststories',
    ask: 'askstories',
    show: 'showstories',
    job: 'jobstories',
  }[type] || 'topstories'
  return fetchJSON(`${BASE}/${endpoint}.json`)
}

export async function fetchItem(id) {
  return fetchJSON(`${BASE}/item/${id}.json`)
}

export async function fetchStories(type = 'top', page = 0, pageSize = 30) {
  const ids = await fetchStoryIds(type)
  const start = page * pageSize
  const slice = ids.slice(start, start + pageSize)
  const stories = await Promise.all(slice.map(fetchItem))
  return {
    stories: stories.filter(Boolean),
    hasMore: start + pageSize < ids.length,
    total: ids.length,
  }
}

export async function fetchComments(ids = [], depth = 0, maxDepth = 3) {
  if (!ids.length || depth > maxDepth) return []
  const items = await Promise.all(ids.slice(0, 20).map(fetchItem))
  const comments = await Promise.all(
    items.filter(Boolean).filter(c => !c.deleted && !c.dead).map(async (comment) => ({
      ...comment,
      children: comment.kids ? await fetchComments(comment.kids, depth + 1, maxDepth) : [],
    }))
  )
  return comments
}

export function getDomain(url) {
  if (!url) return null
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return null
  }
}

export function timeAgo(ts) {
  const seconds = Math.floor(Date.now() / 1000) - ts
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}
