import { useState, useEffect } from 'react'

const cache = new Map()

export function useOgImage(url) {
  const [imageUrl, setImageUrl] = useState(() => cache.get(url) ?? null)
  const [loading, setLoading] = useState(!cache.has(url) && !!url)

  useEffect(() => {
    if (!url) {
      setLoading(false)
      return
    }

    if (cache.has(url)) {
      setImageUrl(cache.get(url))
      setLoading(false)
      return
    }

    let cancelled = false
    const controller = new AbortController()

    async function fetchOg() {
      try {
        const res = await fetch(
          `https://api.microlink.io/?url=${encodeURIComponent(url)}`,
          { signal: controller.signal }
        )
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const img = data?.data?.image?.url || data?.data?.logo?.url || null
        cache.set(url, img)
        if (!cancelled) {
          setImageUrl(img)
          setLoading(false)
        }
      } catch {
        cache.set(url, null)
        if (!cancelled) {
          setImageUrl(null)
          setLoading(false)
        }
      }
    }

    fetchOg()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [url])

  return { imageUrl, loading }
}
