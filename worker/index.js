import { addSubscriber, removeSubscriber, listSubscribers, saveSnapshot, getSnapshot } from './kv.js'
import { sendEmail, welcomeEmail } from './email.js'
import { fetchBestStories } from './hn.js'
import { buildNewsletterHtml } from './template.js'

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function handleSubscribe(request, env) {
  const { email, timezone } = await request.json()

  if (!email || !EMAIL_RE.test(email)) {
    return json({ error: 'Invalid email address' }, 400)
  }

  const { alreadyExists } = await addSubscriber(env.NEWSLETTER_KV, email, timezone)

  if (alreadyExists) {
    return json({ message: 'Already subscribed' })
  }

  // Send welcome email to subscriber
  try {
    const welcome = welcomeEmail(env.FROM_EMAIL)
    await sendEmail(env.RESEND_API_KEY, {
      from: `Hacker News Times <${env.FROM_EMAIL}>`,
      to: email,
      subject: welcome.subject,
      html: welcome.html,
    })
  } catch (err) {
    console.error('Welcome email failed:', err.message)
  }

  // Notify owner of new subscriber
  if (env.NOTIFY_EMAIL) {
    try {
      await sendEmail(env.RESEND_API_KEY, {
        from: `Hacker News Times <${env.FROM_EMAIL}>`,
        to: env.NOTIFY_EMAIL,
        subject: `New subscriber: ${email}`,
        html: `<p style="font-family:Georgia,serif;font-size:14px;color:#1a1a1a;">New newsletter signup: <strong>${email}</strong></p><p style="font-family:Georgia,serif;font-size:12px;color:#6b6b5e;">Timezone: ${timezone || 'Unknown'}<br>Time: ${new Date().toISOString()}</p>`,
      })
    } catch (err) {
      console.error('Notify email failed:', err.message)
    }
  }

  return json({ message: 'Subscribed successfully' })
}

async function handleUnsubscribe(request, env) {
  const url = new URL(request.url)
  let email

  if (request.method === 'GET') {
    email = url.searchParams.get('email')
  } else {
    const body = await request.json()
    email = body.email
  }

  if (!email) {
    return json({ error: 'Email required' }, 400)
  }

  await removeSubscriber(env.NEWSLETTER_KV, email)

  if (request.method === 'GET') {
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>Unsubscribed</title></head>
      <body style="font-family:Georgia,serif;text-align:center;padding:60px 20px;background:#f5f0e8;color:#1a1a1a;">
        <h1 style="font-size:24px;">Unsubscribed</h1>
        <p style="color:#6b6b5e;">You've been removed from the Hacker News Times weekly newsletter.</p>
      </body>
      </html>
    `, { status: 200, headers: { 'Content-Type': 'text/html' } })
  }

  return json({ message: 'Unsubscribed successfully' })
}

function getISOWeek() {
  const now = new Date()
  const year = now.getFullYear()
  const start = new Date(year, 0, 1)
  const diff = now - start
  const oneWeek = 7 * 24 * 60 * 60 * 1000
  const week = Math.ceil(((diff / oneWeek) + start.getDay() + 1) / 1)
  return `${year}-W${String(week).padStart(2, '0')}`
}

function getLocalHour(timezone) {
  try {
    const now = new Date()
    const str = now.toLocaleString('en-US', { timeZone: timezone, hour: 'numeric', hour12: false })
    return parseInt(str, 10)
  } catch {
    return -1
  }
}

async function sendWeeklyNewsletter(env) {
  const weekKey = getISOWeek()

  const subscribers = await listSubscribers(env.NEWSLETTER_KV)
  if (!subscribers.length) {
    console.log('No subscribers, skipping')
    return
  }

  const eligibleSubs = subscribers.filter((sub) => {
    const localHour = getLocalHour(sub.timezone || 'UTC')
    return localHour === 10
  })

  if (!eligibleSubs.length) {
    console.log('No subscribers at 10 AM local time this hour, skipping')
    return
  }

  const toSend = []
  for (const sub of eligibleSubs) {
    const alreadySent = await env.NEWSLETTER_KV.get(`sent:${weekKey}:${sub.email}`)
    if (!alreadySent) toSend.push(sub)
  }

  if (!toSend.length) {
    console.log(`All eligible subscribers already sent for ${weekKey}`)
    return
  }

  let snapshot = await getSnapshot(env.NEWSLETTER_KV, weekKey)
  let stories
  if (snapshot) {
    stories = snapshot.stories
  } else {
    stories = await fetchBestStories(20)
    if (!stories.length) {
      console.error('No stories fetched, skipping')
      return
    }
    await saveSnapshot(env.NEWSLETTER_KV, weekKey, stories)
  }

  console.log(`Sending newsletter for ${weekKey} to ${toSend.length} subscribers`)

  const weekLabel = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  let sent = 0
  let failed = 0

  for (const sub of toSend) {
    const unsubscribeUrl = `${env.SITE_URL}/api/unsubscribe?email=${encodeURIComponent(sub.email)}`
    const html = buildNewsletterHtml(stories, weekLabel, unsubscribeUrl)

    try {
      await sendEmail(env.RESEND_API_KEY, {
        from: `Hacker News Times <${env.FROM_EMAIL}>`,
        to: sub.email,
        subject: `Hacker News Times — Week of ${weekLabel}`,
        html,
      })
      await env.NEWSLETTER_KV.put(`sent:${weekKey}:${sub.email}`, '1', {
        expirationTtl: 60 * 60 * 24 * 8,
      })
      sent++
    } catch (err) {
      console.error(`Failed to send to ${sub.email}:`, err.message)
      failed++
    }
  }

  console.log(`Newsletter: ${sent} sent, ${failed} failed`)
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname === '/api/subscribe' && request.method === 'POST') {
      return handleSubscribe(request, env)
    }
    if (url.pathname === '/api/unsubscribe') {
      return handleUnsubscribe(request, env)
    }

    return new Response('Not found', { status: 404 })
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(sendWeeklyNewsletter(env))
  },
}
