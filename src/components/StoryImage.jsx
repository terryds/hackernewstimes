import { useState } from 'react'
import { useOgImage } from '../hooks/useOgImage'

export default function StoryImage({ url, alt, variant = 'hero' }) {
  const { imageUrl, loading } = useOgImage(url)
  const [error, setError] = useState(false)

  if (!url || error || (!loading && !imageUrl)) return null

  const sizeClasses = variant === 'hero'
    ? 'w-full h-48 md:h-64 lg:h-72'
    : 'w-full h-32 md:h-40'

  if (loading) {
    return (
      <div className={`${sizeClasses} skeleton rounded-sm mb-3`} />
    )
  }

  return (
    <div className={`${sizeClasses} overflow-hidden rounded-sm mb-3 bg-paper-dark`}>
      <img
        src={imageUrl}
        alt={alt || ''}
        loading="lazy"
        onError={() => setError(true)}
        className="w-full h-full object-cover grayscale-[40%] sepia-[20%] contrast-[1.1] hover:grayscale-0 hover:sepia-0 transition-[filter] duration-500"
      />
    </div>
  )
}
