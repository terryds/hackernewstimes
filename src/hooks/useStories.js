import { useState, useEffect, useCallback } from 'react'
import { fetchStories } from '../api'

export function useStories(type = 'top') {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    setStories([])
    setPage(0)
    setHasMore(true)
    setLoading(true)
    setError(null)

    fetchStories(type, 0)
      .then(({ stories, hasMore }) => {
        setStories(stories)
        setHasMore(hasMore)
      })
      .catch(setError)
      .finally(() => setLoading(false))
  }, [type])

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    const nextPage = page + 1
    fetchStories(type, nextPage)
      .then(({ stories: more, hasMore: more2 }) => {
        setStories(prev => [...prev, ...more])
        setHasMore(more2)
        setPage(nextPage)
      })
      .catch(setError)
      .finally(() => setLoadingMore(false))
  }, [type, page, loadingMore, hasMore])

  return { stories, loading, loadingMore, error, hasMore, loadMore }
}
