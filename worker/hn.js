const BASE = 'https://hacker-news.firebaseio.com/v0'

function getDomain(url) {
  if (!url) return null
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

export async function fetchBestStories(count = 20) {
  const res = await fetch(`${BASE}/beststories.json`)
  const ids = await res.json()

  const stories = await Promise.all(
    ids.slice(0, count).map(async (id) => {
      const r = await fetch(`${BASE}/item/${id}.json`)
      return r.json()
    })
  )

  return stories
    .filter(Boolean)
    .map((s) => ({
      id: s.id,
      title: s.title,
      url: s.url,
      score: s.score,
      descendants: s.descendants || 0,
      by: s.by,
      domain: getDomain(s.url),
    }))
}
