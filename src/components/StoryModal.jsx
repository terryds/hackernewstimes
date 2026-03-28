import { useState, useEffect, useRef, useCallback } from 'react'
import { Readability } from '@mozilla/readability'
import { fetchComments, getDomain, timeAgo } from '../api'

// Auto-link plain URLs that aren't already inside an <a> tag
function autoLinkUrls(html) {
  return html.replace(
    /(?<![">])(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  )
}

// Domains known to block iframes — these go straight to reader mode
const IFRAME_BLOCKLIST = [
  'substack.com',
  'medium.com',
  'nytimes.com',
  'washingtonpost.com',
  'wsj.com',
  'bbc.com',
  'bbc.co.uk',
  'theguardian.com',
  'reuters.com',
  'bloomberg.com',
  'ft.com',
  'economist.com',
  'newyorker.com',
  'wired.com',
  'arstechnica.com',
  'theatlantic.com',
  'github.com',
  'twitter.com',
  'x.com',
  'facebook.com',
  'linkedin.com',
  'reddit.com',
  'stackoverflow.com',
  'arxiv.org',
  'nature.com',
  'science.org',
  'derekthompson.org',
]

function isDomainBlocked(domain) {
  if (!domain) return false
  return IFRAME_BLOCKLIST.some(
    (blocked) => domain === blocked || domain.endsWith('.' + blocked)
  )
}

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

function ReaderView({ url, domain }) {
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    fetch(`/api/extract?url=${encodeURIComponent(url)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)

        // Parse with Readability in the browser using DOMParser
        const parser = new DOMParser()
        const doc = parser.parseFromString(data.html, 'text/html')

        // Fix relative URLs to absolute
        const base = doc.createElement('base')
        base.href = data.url
        doc.head.prepend(base)

        const parsed = new Readability(doc).parse()
        if (!parsed) throw new Error('Could not extract article')

        setArticle(parsed)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [url])

  if (loading) {
    return (
      <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-4">
        <div className="skeleton h-8 w-3/4 rounded" />
        <div className="skeleton h-4 w-48 rounded" />
        <div className="space-y-3 mt-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton h-4 w-full rounded" />
          ))}
          <div className="skeleton h-4 w-2/3 rounded" />
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <p className="font-garamond text-base text-ink-muted mb-1">
          Could not extract article
        </p>
        <p className="font-garamond text-xs text-ink-muted/60 mb-4">
          {error || 'The article content could not be parsed.'}
        </p>
        <a
          href={url}
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
    )
  }

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto overflow-hidden">
      <h2 className="font-headline text-2xl md:text-3xl font-bold leading-tight text-ink">
        {article.title}
      </h2>
      {article.byline && (
        <p className="font-garamond text-sm text-ink-muted mt-2">{article.byline}</p>
      )}
      <div className="flex items-center gap-2 mt-2 mb-6">
        <span className="font-garamond text-xs text-ink-muted italic">{domain}</span>
        <span className="text-rule-light">·</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-garamond text-xs text-accent hover:text-accent-hover"
        >
          View original
        </a>
      </div>
      <div className="border-t-2 border-rule pt-6" />
      <div
        className="font-body text-base leading-relaxed text-ink-light prose-a:text-accent prose-a:underline prose-a:decoration-rule-light prose-a:underline-offset-2 break-words [overflow-wrap:anywhere] [&_img]:max-w-full [&_img]:h-auto [&_img]:my-4 [&_img]:rounded [&_h1]:font-headline [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:font-headline [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:font-headline [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:mb-4 [&_blockquote]:border-l-2 [&_blockquote]:border-rule-light [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-ink-muted [&_pre]:bg-paper-dark [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre]:text-sm [&_code]:bg-paper-dark [&_code]:px-1 [&_code]:rounded [&_code]:text-sm [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-1"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </div>
  )
}

export default function StoryModal({ story, onClose }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const domain = getDomain(story.url)
  const storyUrl = story.url || `https://news.ycombinator.com/item?id=${story.id}`
  const hnUrl = `https://news.ycombinator.com/item?id=${story.id}`
  const blocked = isDomainBlocked(domain)

  const [activeTab, setActiveTab] = useState(
    !story.url ? 'comments' : blocked ? 'reader' : 'article'
  )

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
    <div className="p-4 md:p-8 lg:p-12 overflow-hidden max-w-4xl mx-auto">
      {story.text && (
        <div className="mb-8 pb-8 border-b-2 border-rule">
          <div
            className="max-w-2xl font-body text-base md:text-lg leading-relaxed text-ink prose-a:text-accent prose-a:underline prose-a:underline-offset-2 prose-a:break-all [&_p]:mb-4"
            dangerouslySetInnerHTML={{ __html: autoLinkUrls(story.text) }}
          />
        </div>
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

  const [readerTipDismissed, setReaderTipDismissed] = useState(() => localStorage.getItem('reader-tip-dismissed') === 'true')
  const [headerVisible, setHeaderVisible] = useState(true)
  const lastScrollY = useRef(0)

  const handleContentScroll = useCallback((e) => {
    const y = e.target.scrollTop
    const delta = y - lastScrollY.current
    if (delta > 10 && y > 80) {
      setHeaderVisible(false)
    } else if (delta < -5) {
      setHeaderVisible(true)
    }
    lastScrollY.current = y
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-paper">
      {/* Top bar — nav/info row hides on scroll, tab row stays */}
      <div className={`shrink-0 bg-paper border-b border-rule-light transition-all duration-300 overflow-hidden ${headerVisible ? 'max-h-40' : 'max-h-0'}`}>
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
      </div>

      {/* Tab row - always visible */}
      {story.url && (
        <div className="shrink-0 flex lg:hidden border-b border-rule bg-paper">
          <button
            onClick={() => setActiveTab(blocked ? 'reader' : 'article')}
            className={`flex-1 py-2 font-garamond text-xs font-semibold text-center uppercase tracking-wider transition-colors cursor-pointer ${
              activeTab === 'article' || activeTab === 'reader'
                ? 'text-ink border-b-2 border-ink bg-paper'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            {blocked ? 'Reader' : `Article (${domain})`}
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

      {/* Content area */}
      {story.url ? (
        <div className="flex-1 flex min-h-0 min-w-0 w-full overflow-hidden">
          {/* Article panel (iframe or reader) — desktop: left side, mobile: shown when active */}
          <div className={`${
            activeTab === 'article' || activeTab === 'reader' ? 'flex' : 'hidden'
          } lg:flex flex-col flex-1 min-w-0 lg:border-r border-rule-light`}>

            {/* Toolbar — hides with header */}
            <div className={`shrink-0 flex items-center justify-center gap-2 px-3 py-1.5 bg-paper border-b border-rule-light transition-all duration-300 ${headerVisible ? '' : 'max-h-0 overflow-hidden border-b-0 py-0'}`}>
              <span className="font-garamond text-xs text-ink-muted truncate">
                {domain}
              </span>
              <span className="text-rule-light">·</span>
              <a
                href={storyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-1 font-garamond text-xs font-semibold text-accent hover:text-accent-hover transition-colors"
              >
                Open in new tab
                <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
              </a>
            </div>

            {/* Reader mode warning banner for blocked sites */}
            {blocked && !readerTipDismissed && (
              <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 bg-highlight border-b border-rule-light">
                <svg className="w-3.5 h-3.5 shrink-0 text-ink-muted" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="flex-1 font-garamond text-[11px] text-ink-muted">
                  This site blocks embedding, so we&rsquo;re showing an extracted version. Use &ldquo;Open in new tab&rdquo; for the original page.
                </p>
                <button
                  onClick={() => {
                    setReaderTipDismissed(true)
                    localStorage.setItem('reader-tip-dismissed', 'true')
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

            {/* Content: iframe for normal sites, reader for blocked */}
            {blocked ? (
              <div className="flex-1 overflow-y-auto" onScroll={handleContentScroll}>
                <ReaderView url={storyUrl} domain={domain} />
              </div>
            ) : (
              <iframe
                src={storyUrl}
                className="flex-1 w-full bg-white"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                title={story.title}
              />
            )}
          </div>

          {/* Comments panel */}
          <div className={`${
            activeTab === 'comments' ? 'flex' : 'hidden'
          } lg:flex flex-col w-full lg:w-[420px] xl:w-[480px] min-w-0 lg:shrink-0 min-h-0`}>
            <div className="flex-1 overflow-y-auto" onScroll={handleContentScroll}>
              {commentsContent}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto" onScroll={handleContentScroll}>
          {commentsContent}
        </div>
      )}
    </div>
  )
}
