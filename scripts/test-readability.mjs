// Test script: fetch a URL and extract article content using Readability
// Usage: node scripts/test-readability.mjs <url>

import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom'

const url = process.argv[2]
if (!url) {
  console.error('Usage: node scripts/test-readability.mjs <url>')
  process.exit(1)
}

console.log(`\nFetching: ${url}\n`)

try {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; HackerNewsTimes/1.0)',
    },
  })

  console.log(`Status: ${res.status}`)
  console.log(`Content-Type: ${res.headers.get('content-type')}`)

  if (!res.ok) {
    console.error(`\nFailed to fetch: HTTP ${res.status}`)
    process.exit(1)
  }

  const html = await res.text()
  console.log(`HTML size: ${(html.length / 1024).toFixed(1)} KB\n`)

  const dom = new JSDOM(html, { url })
  const article = new Readability(dom.window.document).parse()

  if (!article) {
    console.error('Readability could not extract article content.')
    process.exit(1)
  }

  console.log('--- EXTRACTED ARTICLE ---')
  console.log(`Title: ${article.title}`)
  console.log(`Author: ${article.byline || '(none)'}`)
  console.log(`Length: ${article.textContent.length} chars`)
  console.log(`Excerpt: ${article.excerpt || '(none)'}`)
  console.log(`\n--- First 500 chars of text ---`)
  console.log(article.textContent.trim().slice(0, 500))
  console.log(`\n--- First 500 chars of HTML ---`)
  console.log(article.content.slice(0, 500))
} catch (err) {
  console.error(`\nError: ${err.message}`)
  process.exit(1)
}
