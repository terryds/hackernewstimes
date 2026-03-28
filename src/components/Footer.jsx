import NewsletterSubscribe from './NewsletterSubscribe'

export default function Footer() {
  return (
    <footer className="mt-12">
      {/* Newsletter subscribe — full-width inverted banner */}
      <div className="bg-ink text-paper py-10 md:py-14 px-6">
        <div className="max-w-xl mx-auto text-center">
          <p className="font-garamond text-xs uppercase tracking-[0.25em] text-paper/50 mb-2">
            Don&rsquo;t miss a story
          </p>
          <h3 className="font-masthead text-3xl md:text-4xl text-paper mb-2">
            Weekly Newsletter
          </h3>
          <p className="font-garamond text-sm md:text-base text-paper/70 mb-6 leading-relaxed">
            The best of Hacker News, curated and delivered to your inbox every Tuesday morning.
          </p>
          <NewsletterSubscribe />
        </div>
      </div>

      <div className="mx-4 py-6 text-center font-garamond text-xs text-ink-muted space-y-1">
        <p className="font-masthead text-2xl text-ink mb-2">Hacker News Times</p>
        <p>
          Powered by the{' '}
          <a
            href="https://github.com/HackerNews/API"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-hover underline decoration-rule-light underline-offset-2"
          >
            Hacker News API
          </a>
        </p>
        <p className="italic">Hacker News, Beautifully Delivered</p>
        <div className="mt-4 pt-4 border-t border-rule-light text-ink-muted/70 space-y-1">
          <p>
            An unofficial, open-source Hacker News reader built by{' '}
            <a
              href="https://github.com/terryds"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-hover underline decoration-rule-light underline-offset-2"
            >
              @terryds
            </a>
          </p>
          <p>Not affiliated with or endorsed by Y Combinator or Hacker News.</p>
          <p>All content is sourced from the public Hacker News API.</p>
        </div>
      </div>
    </footer>
  )
}
