export async function addSubscriber(kv, email, timezone) {
  const key = `sub:${email.toLowerCase()}`
  const existing = await kv.get(key)
  if (existing) return { alreadyExists: true }

  await kv.put(key, JSON.stringify({
    email: email.toLowerCase(),
    timezone: timezone || 'UTC',
    subscribedAt: Date.now(),
  }))
  return { alreadyExists: false }
}

export async function removeSubscriber(kv, email) {
  await kv.delete(`sub:${email.toLowerCase()}`)
}

export async function listSubscribers(kv) {
  const subscribers = []
  let cursor = null

  do {
    const result = await kv.list({ prefix: 'sub:', cursor, limit: 1000 })
    for (const key of result.keys) {
      const data = await kv.get(key.name, 'json')
      if (data) subscribers.push(data)
    }
    cursor = result.list_complete ? null : result.cursor
  } while (cursor)

  return subscribers
}

export async function saveSnapshot(kv, weekKey, stories) {
  await kv.put(`snapshot:${weekKey}`, JSON.stringify({
    stories,
    sentAt: Date.now(),
  }), { expirationTtl: 60 * 60 * 24 * 90 }) // 90 days
}

export async function getSnapshot(kv, weekKey) {
  return kv.get(`snapshot:${weekKey}`, 'json')
}
