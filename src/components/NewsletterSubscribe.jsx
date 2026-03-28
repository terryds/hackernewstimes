import { useState } from 'react'

export default function NewsletterSubscribe() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(() =>
    localStorage.getItem('newsletter-subscribed') === 'true' ? 'subscribed' : 'idle'
  )
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    setError('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      setStatus('subscribed')
      localStorage.setItem('newsletter-subscribed', 'true')
    } catch (err) {
      setError(err.message)
      setStatus('idle')
    }
  }

  if (status === 'subscribed') {
    return (
      <div className="text-center">
        <p className="font-garamond text-base text-paper font-semibold">You're subscribed!</p>
        <p className="font-garamond text-sm text-paper/60 mt-1">Check your inbox every Tuesday.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        className="flex-1 px-4 py-2.5 font-garamond text-sm bg-white/10 border border-paper/20 rounded text-paper placeholder:text-paper/40 focus:outline-none focus:border-paper/50 focus:bg-white/15"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="px-5 py-2.5 font-garamond text-sm font-semibold bg-paper text-ink rounded hover:bg-paper-dark transition-colors disabled:opacity-50 cursor-pointer shrink-0"
      >
        {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
      </button>
      {error && (
        <p className="font-garamond text-xs text-accent">{error}</p>
      )}
    </form>
  )
}
