import { getDomain, timeAgo } from '../api'
import StoryImage from './StoryImage'

function PointsBadge({ score }) {
  if (!score) return null
  return (
    <span className="inline-flex items-center gap-0.5 font-garamond text-xs md:text-xs text-accent font-semibold">
      <svg className="w-3.5 h-3.5 md:w-3 md:h-3" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 2l2.5 5.5L18 8.5l-4 4 1 5.5L10 15.5 4.5 18l1-5.5-4-4 5.5-1z" />
      </svg>
      {score}
    </span>
  )
}

function CommentCount({ count }) {
  if (count == null) return null
  return (
    <span className="inline-flex items-center gap-0.5 font-garamond text-xs md:text-xs text-ink-muted">
      <svg className="w-3.5 h-3.5 md:w-3 md:h-3" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zm-5 0H8v2h2V9z" clipRule="evenodd" />
      </svg>
      {count}
    </span>
  )
}

export default function StoryCard({ story, variant = 'default', index = 0, onClick }) {
  const domain = getDomain(story.url)
  const storyUrl = story.url || `https://news.ycombinator.com/item?id=${story.id}`

  if (variant === 'hero') {
    return (
      <article
        className="animate-fade-in cursor-pointer group"
        style={{ animationDelay: `${index * 50}ms` }}
        onClick={() => onClick?.(story)}
      >
        <StoryImage url={story.url} alt={story.title} variant="hero" />
        <h2 className="font-headline text-3xl md:text-4xl lg:text-5xl font-black leading-tight text-ink group-hover:text-accent transition-colors">
          {story.title}
        </h2>
        <div className="mt-3 flex flex-wrap items-center gap-3 font-garamond text-base md:text-sm text-ink-muted">
          <span className="font-semibold text-ink-light">By {story.by}</span>
          {domain && (
            <a
              href={storyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="italic underline decoration-rule-light underline-offset-2 hover:text-accent transition-colors"
              onClick={e => e.stopPropagation()}
            >
              {domain}
            </a>
          )}
          <PointsBadge score={story.score} />
          <CommentCount count={story.descendants} />
          <span>{timeAgo(story.time)}</span>
        </div>
        {story.text && (
          <p className="mt-4 font-body text-base leading-relaxed text-ink-light drop-cap line-clamp-4" dangerouslySetInnerHTML={{ __html: story.text }} />
        )}
      </article>
    )
  }

  if (variant === 'secondary') {
    return (
      <article
        className="animate-fade-in cursor-pointer group pb-2"
        style={{ animationDelay: `${index * 50}ms` }}
        onClick={() => onClick?.(story)}
      >
        <StoryImage url={story.url} alt={story.title} variant="secondary" />
        <h3 className="font-headline text-xl md:text-2xl font-bold leading-snug text-ink group-hover:text-accent transition-colors">
          {story.title}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-2 font-garamond text-sm md:text-xs text-ink-muted">
          <span className="font-semibold text-ink-light">{story.by}</span>
          {domain && (
            <a
              href={storyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="italic underline decoration-rule-light underline-offset-2 hover:text-accent transition-colors"
              onClick={e => e.stopPropagation()}
            >
              {domain}
            </a>
          )}
          <PointsBadge score={story.score} />
          <CommentCount count={story.descendants} />
        </div>
      </article>
    )
  }

  if (variant === 'sidebar') {
    return (
      <article
        className="animate-fade-in cursor-pointer group flex gap-3 items-start py-2"
        style={{ animationDelay: `${index * 50}ms` }}
        onClick={() => onClick?.(story)}
      >
        <span className="font-headline text-3xl font-black text-ink-muted/40 leading-none shrink-0 mt-0.5 select-none">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="min-w-0">
          <h4 className="font-headline text-sm font-bold leading-tight text-ink group-hover:text-accent transition-colors">
            {story.title}
          </h4>
          <div className="mt-1 flex items-center gap-2 font-garamond text-xs text-ink-muted">
            <PointsBadge score={story.score} />
            <CommentCount count={story.descendants} />
            <span>{timeAgo(story.time)}</span>
          </div>
        </div>
      </article>
    )
  }

  if (variant === 'headline') {
    return (
      <article
        className="animate-fade-in cursor-pointer group"
        style={{ animationDelay: `${index * 30}ms` }}
        onClick={() => onClick?.(story)}
      >
        <div className="flex items-start gap-3 py-4 md:py-3 border-b border-rule-light last:border-0">
          <span className="font-garamond text-xs text-ink-muted whitespace-nowrap mt-1 shrink-0">
            {timeAgo(story.time)}
          </span>
          <div className="min-w-0 flex-1">
            <h4 className="font-headline text-base font-semibold leading-snug text-ink group-hover:text-accent transition-colors">
              {story.title}
            </h4>
            <div className="mt-1 flex items-center gap-2 font-garamond text-xs text-ink-muted">
              <span>{story.by}</span>
              {domain && <span className="italic">{domain}</span>}
              <PointsBadge score={story.score} />
              <CommentCount count={story.descendants} />
            </div>
          </div>
        </div>
      </article>
    )
  }

  // default compact list
  return (
    <article
      className="animate-fade-in cursor-pointer group py-2 border-b border-rule-light last:border-0"
      style={{ animationDelay: `${index * 20}ms` }}
      onClick={() => onClick?.(story)}
    >
      <h4 className="font-body text-sm leading-snug text-ink group-hover:text-accent transition-colors">
        {story.title}
        {domain && <span className="font-garamond text-xs text-ink-muted ml-1">({domain})</span>}
      </h4>
      <div className="mt-0.5 flex items-center gap-2 font-garamond text-xs text-ink-muted">
        <span>{story.by}</span>
        <PointsBadge score={story.score} />
        <CommentCount count={story.descendants} />
        <span>{timeAgo(story.time)}</span>
      </div>
    </article>
  )
}
