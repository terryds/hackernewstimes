import { useState, useCallback, useEffect } from 'react'
import Masthead from './components/Masthead'
import StoryCard from './components/StoryCard'
import StoryModal from './components/StoryModal'
import Footer from './components/Footer'
import DailyQuote from './components/DailyQuote'
import { HeroSkeleton, SecondarySkeleton, SidebarSkeleton, HeadlineSkeleton } from './components/Skeleton'
import { useStories } from './hooks/useStories'
import { useInstallPrompt } from './hooks/useInstallPrompt'
import { fetchItem } from './api'

const SECTION_ROUTES = {
  '/': 'top',
  '/top': 'top',
  '/best': 'best',
  '/new': 'new',
  '/ask': 'ask',
  '/show': 'show',
  '/jobs': 'job',
}

const SECTION_PATHS = {
  top: '/',
  best: '/best',
  new: '/new',
  ask: '/ask',
  show: '/show',
  job: '/jobs',
}

function getInitialRoute() {
  const path = window.location.pathname
  const storyMatch = path.match(/^\/story\/(\d+)$/)
  if (storyMatch) return { section: 'top', storyId: storyMatch[1] }
  return { section: SECTION_ROUTES[path] || 'top', storyId: null }
}


function InstallBanner({ onInstall, onDismiss, isIOSSafari }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-ink text-paper px-4 py-3 flex items-center gap-3 shadow-[0_-2px_10px_rgba(0,0,0,0.2)]">
      <div className="flex-1 min-w-0">
        <p className="font-headline text-sm font-bold">Get the App</p>
        <p className="font-garamond text-xs text-paper/70 mt-0.5">
          {isIOSSafari
            ? <>Tap <svg className="inline w-3.5 h-3.5 -mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a1 1 0 01-1 1h-1.586l-1.707 1.707a1 1 0 01-1.414 0L7.586 9H6a1 1 0 110-2h2a1 1 0 01.707.293L10 8.586l1.293-1.293A1 1 0 0112 7h2a1 1 0 011 1z"/><path d="M10 2a1 1 0 011 1v5.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L9 8.586V3a1 1 0 011-1z"/><path d="M3 14a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/></svg> then &ldquo;Add to Home Screen&rdquo;</>
            : 'Install Hacker News Times for a faster, app-like experience'
          }
        </p>
      </div>
      {!isIOSSafari && (
        <button
          onClick={onInstall}
          className="shrink-0 px-3 py-1.5 text-xs font-garamond font-semibold bg-paper text-ink rounded cursor-pointer hover:bg-paper-dark transition-colors"
        >
          Install
        </button>
      )}
      <button
        onClick={onDismiss}
        className="shrink-0 p-1 text-paper/50 hover:text-paper cursor-pointer transition-colors"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  )
}

function EditionBanner({ section, total }) {
  const sectionNames = {
    top: 'Front Page',
    best: 'Best Stories',
    new: 'Latest Stories',
    ask: 'Ask HN',
    show: 'Show HN',
    job: 'Job Board',
  }
  return (
    <div className="flex items-center justify-between px-4 py-2 font-garamond text-xs text-ink-muted border-b border-rule-light">
      <span className="uppercase tracking-widest font-semibold text-ink-light">
        {sectionNames[section] || 'Front Page'}
      </span>
      {total > 0 && <span>{total} stories</span>}
    </div>
  )
}

export default function App() {
  const initialRoute = getInitialRoute()
  const [section, setSection] = useState(initialRoute.section)
  const [selectedStory, setSelectedStory] = useState(null)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark')
  const { stories, loading, loadingMore, hasMore, loadMore } = useStories(section)
  const { isInstallable, isIOSSafari, install } = useInstallPrompt()
  const [bannerDismissed, setBannerDismissed] = useState(() => localStorage.getItem('install-banner-dismissed') === 'true')
  const showInstallBanner = isInstallable && !bannerDismissed

  const dismissBanner = useCallback(() => {
    setBannerDismissed(true)
    localStorage.setItem('install-banner-dismissed', 'true')
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  // Load story from URL on initial mount (e.g. /story/12345)
  useEffect(() => {
    if (initialRoute.storyId) {
      fetchItem(initialRoute.storyId).then((story) => {
        if (story) setSelectedStory(story)
      })
    }
  }, [])

  // Update URL when section changes
  const handleSectionChange = useCallback((newSection) => {
    setSection(newSection)
    history.pushState(null, '', SECTION_PATHS[newSection] || '/')
  }, [])

  // Update URL when story opens/closes
  const handleStoryClick = useCallback((story) => {
    setSelectedStory(story)
    history.pushState({ storyId: story.id }, '', `/story/${story.id}`)
  }, [])

  const handleStoryClose = useCallback(() => {
    setSelectedStory(null)
    history.pushState(null, '', SECTION_PATHS[section] || '/')
  }, [section])

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname
      const storyMatch = path.match(/^\/story\/(\d+)$/)
      if (storyMatch) {
        fetchItem(storyMatch[1]).then((story) => {
          if (story) setSelectedStory(story)
        })
      } else {
        setSelectedStory(null)
        const newSection = SECTION_ROUTES[path] || 'top'
        setSection(newSection)
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Split stories into layout groups
  const hero = stories[0]
  const secondary = stories.slice(1, 4)
  const sidebar = stories.slice(4, 12)
  const headlines = stories.slice(12)

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-7xl mx-auto">
        <Masthead
          section={section}
          onSectionChange={handleSectionChange}
          onInstall={install}
          isInstallable={isInstallable}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(prev => !prev)}
        />

        <EditionBanner section={section} total={stories.length} />

        <main className="px-4 py-6">
          {loading ? (
            <div className="space-y-8">
              {/* Hero skeleton */}
              <div className="border-b-2 border-rule pb-6">
                <HeroSkeleton />
              </div>
              {/* Secondary skeletons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => <SecondarySkeleton key={i} />)}
              </div>
              {/* Sidebar skeletons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => <SidebarSkeleton key={i} />)}
              </div>
            </div>
          ) : (
            <>
              {/* Hero Story */}
              {hero && (
                <section className="border-b-2 border-rule pb-6 mb-6">
                  <StoryCard story={hero} variant="hero" index={0} onClick={handleStoryClick} />
                </section>
              )}

              {/* Secondary Stories + Sidebar */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 mb-8">
                {/* Secondary stories - left column */}
                <div className="lg:col-span-8 lg:border-r border-rule-light lg:pr-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {secondary.map((story, i) => (
                      <div key={story.id} className={`${i < 2 ? 'md:border-r border-rule-light md:pr-6' : ''}`}>
                        <StoryCard story={story} variant="secondary" index={i + 1} onClick={handleStoryClick} />
                      </div>
                    ))}
                  </div>

                  {/* Horizontal rule with ornament */}
                  <div className="relative my-6">
                    <div className="border-b border-rule-light" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-paper px-3">
                      <span className="font-headline text-ink-muted/40 text-lg select-none">&diams;</span>
                    </div>
                  </div>

                  {/* Headlines section */}
                  {headlines.length > 0 && (
                    <div>
                      <h3 className="font-headline text-sm font-bold uppercase tracking-widest text-ink-muted border-b-2 border-rule pb-1 mb-2">
                        More Headlines
                      </h3>
                      <div className="newspaper-columns md:columns-2">
                        {headlines.map((story, i) => (
                          <div key={story.id} className="break-inside-avoid">
                            <StoryCard story={story} variant="headline" index={i + 12} onClick={handleStoryClick} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Load more */}
                  {hasMore && (
                    <div className="text-center py-6 no-print">
                      <button
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="px-6 py-2 font-garamond text-sm tracking-wide border-2 border-rule text-ink hover:bg-ink hover:text-paper transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {loadingMore ? 'Loading...' : 'Continue Reading \u2193'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Sidebar - right column */}
                <div className="lg:col-span-4 lg:pl-6 mt-6 lg:mt-0">
                  {/* Daily Quote */}
                  <DailyQuote />

                  <h3 className="font-headline text-sm font-bold uppercase tracking-widest text-ink-muted border-b-2 border-rule pb-1 mb-4">
                    Trending
                  </h3>
                  <div className="space-y-4">
                    {sidebar.map((story, i) => (
                      <StoryCard key={story.id} story={story} variant="sidebar" index={i} onClick={handleStoryClick} />
                    ))}
                  </div>

                  {/* Classifieds-style box */}
                  <div className="mt-6 border-2 border-rule p-4">
                    <h4 className="font-headline text-xs font-bold uppercase tracking-widest text-center text-ink-muted mb-2">
                      About This Publication
                    </h4>
                    <p className="font-garamond text-xs text-ink-muted text-center leading-relaxed">
                      Hacker News Times brings you the finest stories from the technology frontier,
                      curated by the Hacker News community. Install this app for the best reading experience.
                    </p>
                  </div>
                </div>
              </div>

            </>
          )}
        </main>

        <Footer />
      </div>

      {/* Story Modal */}
      {selectedStory && (
        <StoryModal story={selectedStory} onClose={handleStoryClose} />
      )}

      {/* Install banner - bottom sticky */}
      {showInstallBanner && (
        <InstallBanner onInstall={install} onDismiss={dismissBanner} isIOSSafari={isIOSSafari} />
      )}
    </div>
  )
}
