import { useState, useEffect } from 'react'
import { fetchComments, getDomain, timeAgo } from '../api'

function Comment({ comment, depth = 0 }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={`overflow-hidden ${depth > 0 ? 'ml-3 md:ml-5 pl-3 border-l border-rule-light' : ''}`}>
      <div className="py-3">
        <div className="flex items-center gap-2 font-garamond text-xs text-ink-muted mb-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-ink-muted hover:text-ink transition-colors cursor-pointer font-mono"
          >
            [{collapsed ? '+' : '−'}]
          </button>
          <span className="font-semibold text-ink-light">{comment.by}</span>
          <span>{timeAgo(comment.time)}</span>
        </div>
        {!collapsed && (
          <>
            <div
              className="max-w-prose font-body text-sm leading-relaxed text-ink-light prose-a:text-accent prose-a:underline prose-a:decoration-rule-light prose-a:underline-offset-2 overflow-hidden break-words [overflow-wrap:anywhere]"
              dangerouslySetInnerHTML={{ __html: comment.text || '' }}
            />
            {comment.children?.map(child => (
              <Comment key={child.id} comment={child} depth={depth + 1} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}

export default function StoryModal({ story, onClose }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(story.url ? 'article' : 'comments')
  const [iframeStatus, setIframeStatus] = useState('loading') // 'loading' | 'loaded' | 'error'
  const [iframeTipDismissed, setIframeTipDismissed] = useState(() => localStorage.getItem('iframe-tip-dismissed') === 'true')
  const domain = getDomain(story.url)
  const storyUrl = story.url || `https://news.ycombinator.com/item?id=${story.id}`
  const hnUrl = `https://news.ycombinator.com/item?id=${story.id}`

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    if (story.kids?.length) {
      fetchComments(story.kids)
        .then(setComments)
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
    return () => { document.body.style.overflow = '' }
  }, [story])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const commentsContent = (
    <div className="p-4 md:p-6 overflow-hidden">
      {/* Story text (for Ask HN, Show HN) */}
      {story.text && (
        <div
          className="max-w-prose mb-6 font-body text-sm leading-relaxed text-ink-light border-b border-rule-light pb-4 prose-a:text-accent prose-a:underline"
          dangerouslySetInnerHTML={{ __html: story.text }}
        />
      )}

      <h3 className="font-headline text-base font-bold text-ink mb-3 border-b border-rule-light pb-2">
        Discussion ({story.descendants || 0})
      </h3>

      <a
        href={hnUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full mb-4 px-4 py-2.5 font-garamond text-sm font-semibold text-[#ff6600] border border-[#ff6600]/30 rounded hover:bg-[#ff6600]/10 transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M0 0h16v16H0z" fill="#ff6600"/>
          <path d="M3.2 2.4L7.5 9.5v4.1h1V9.5l4.3-7.1H11L8 7.3 5 2.4z" fill="white"/>
        </svg>
        Join the discussion on Hacker News
      </a>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="skeleton h-3 w-32 rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-3/4 rounded" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="font-garamond text-sm text-ink-muted italic">No comments yet.</p>
      ) : (
        <div className="divide-y divide-rule-light">
          {comments.map(comment => (
            <Comment key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-paper">
      {/* Top bar */}
      <div className="shrink-0 border-b-2 border-rule bg-paper">
        {/* Primary nav row */}
        <div className="flex items-center gap-3 px-3 py-2.5 md:px-5">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-ink-muted hover:text-ink transition-colors cursor-pointer shrink-0"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span className="font-garamond text-sm hidden sm:inline">Back</span>
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="font-headline text-sm md:text-base font-bold text-ink truncate leading-tight">
              {story.title}
            </h1>
            <div className="flex items-center gap-2 font-garamond text-xs text-ink-muted mt-0.5">
              <span className="font-semibold text-ink-light">{story.by}</span>
              <span className="text-accent font-semibold">{story.score} pts</span>
              <span>{timeAgo(story.time)}</span>
            </div>
          </div>

          <a
            href={hnUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 font-garamond text-xs font-semibold text-[#ff6600] border border-[#ff6600]/30 rounded hover:bg-[#ff6600]/10 transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M0 0h16v16H0z" fill="#ff6600"/>
              <path d="M3.2 2.4L7.5 9.5v4.1h1V9.5l4.3-7.1H11L8 7.3 5 2.4z" fill="white"/>
            </svg>
            <span className="hidden sm:inline">View on HN</span>
          </a>
        </div>

        {/* Tab row - mobile: toggle between article & comments, desktop: hidden (side by side) */}
        {story.url && (
          <div className="flex lg:hidden border-t border-rule-light">
            <button
              onClick={() => setActiveTab('article')}
              className={`flex-1 py-2 font-garamond text-xs font-semibold text-center uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'article'
                  ? 'text-ink border-b-2 border-ink bg-paper'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Article {domain && `(${domain})`}
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex-1 py-2 font-garamond text-xs font-semibold text-center uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'comments'
                  ? 'text-ink border-b-2 border-ink bg-paper'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Comments ({story.descendants || 0})
            </button>
          </div>
        )}
      </div>

      {/* Content area */}
      {story.url ? (
        <div className="flex-1 flex min-h-0 min-w-0 w-full overflow-hidden">
          {/* Article iframe - desktop: left side, mobile: shown when active */}
          <div className={`${
            activeTab === 'article' ? 'flex' : 'hidden'
          } lg:flex flex-col flex-1 min-w-0 lg:border-r border-rule-light`}>
            {/* Always-visible toolbar */}
            <div className="shrink-0 flex items-center justify-center gap-2 px-3 py-1.5 bg-paper border-b border-rule-light">
              <span className="font-garamond text-xs text-ink-muted truncate">
                {domain}
              </span>
              <span className="text-rule-light">·</span>
              <a
                href={storyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1 font-garamond text-xs font-semibold text-accent hover:text-accent-hover transition-colors"
                title="Page not loading? Some sites block embedding — click to open directly"
              >
                Open in new tab
                <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
              </a>
            </div>
            {!iframeTipDismissed && (
              <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 bg-highlight border-b border-rule-light">
                <svg className="w-3.5 h-3.5 shrink-0 text-ink-muted" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="flex-1 font-garamond text-[11px] text-ink-muted">
                  Some sites may not load here due to their security policy. Use &ldquo;Open in new tab&rdquo; if the page appears blank.
                </p>
                <button
                  onClick={() => {
                    setIframeTipDismissed(true)
                    localStorage.setItem('iframe-tip-dismissed', 'true')
                  }}
                  className="shrink-0 p-0.5 text-ink-muted/60 hover:text-ink cursor-pointer transition-colors"
                  aria-label="Dismiss"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
            {iframeStatus !== 'error' ? (
              <iframe
                src={storyUrl}
                className="flex-1 w-full bg-white"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                onLoad={() => setIframeStatus('loaded')}
                onError={() => setIframeStatus('error')}
                title={story.title}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <p className="font-garamond text-base text-ink-muted mb-1">
                  This site can&rsquo;t be embedded
                </p>
                <p className="font-garamond text-xs text-ink-muted/60 mb-4">
                  Some sites block being displayed inside other pages for security reasons.
                </p>
                <a
                  href={storyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 font-garamond text-sm font-semibold text-paper bg-ink hover:bg-ink-light transition-colors rounded"
                >
                  Read on {domain}
                  <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                </a>
              </div>
            )}
          </div>

          {/* Comments panel - desktop: right side, mobile: shown when active */}
          <div className={`${
            activeTab === 'comments' ? 'flex' : 'hidden'
          } lg:flex flex-col w-full lg:w-[420px] xl:w-[480px] min-w-0 lg:shrink-0 min-h-0`}>
            <div className="flex-1 overflow-y-auto">
              {commentsContent}
            </div>
          </div>
        </div>
      ) : (
        /* No URL - just show comments full width */
        <div className="flex-1 overflow-y-auto">
          {commentsContent}
        </div>
      )}
    </div>
  )
}
