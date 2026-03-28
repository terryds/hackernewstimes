import { useState, useEffect } from 'react'

function getCachedQuote() {
  try {
    const cached = JSON.parse(localStorage.getItem('daily-quote'))
    if (cached && cached.date === new Date().toDateString()) {
      return cached
    }
  } catch { /* ignore */ }
  return null
}

export default function DailyQuote() {
  const [quote, setQuote] = useState(getCachedQuote)

  useEffect(() => {
    if (quote) return

    fetch('https://dummyjson.com/quotes/random')
      .then((r) => r.json())
      .then((data) => {
        if (data?.quote) {
          const q = {
            text: data.quote,
            author: data.author,
            date: new Date().toDateString(),
          }
          setQuote(q)
          localStorage.setItem('daily-quote', JSON.stringify(q))
        }
      })
      .catch(() => {})
  }, [quote])

  if (!quote) return null

  return (
    <div className="relative border-t-2 border-b-2 border-rule py-6 my-6">
      {/* Large decorative quotation mark */}
      <div className="absolute -top-4 left-4 bg-paper px-2">
        <span className="font-masthead text-4xl text-ink-muted/30 select-none leading-none">&ldquo;</span>
      </div>

      <blockquote className="px-2">
        <p className="font-garamond text-base md:text-lg italic leading-relaxed text-ink text-center">
          {quote.text}
        </p>
        <footer className="mt-3 text-center">
          <span className="font-garamond text-xs uppercase tracking-widest text-ink-muted">
            &mdash; {quote.author}
          </span>
        </footer>
      </blockquote>

      {/* Bottom decorative mark */}
      <div className="absolute -bottom-4 right-4 bg-paper px-2">
        <span className="font-masthead text-4xl text-ink-muted/30 select-none leading-none">&rdquo;</span>
      </div>
    </div>
  )
}
