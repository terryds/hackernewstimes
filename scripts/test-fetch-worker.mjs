// Test whether a URL can be fetched from Cloudflare Workers
// Deploy this temporarily by adding a /api/test-fetch route to your worker
//
// Usage: node scripts/test-fetch-worker.mjs <url>
// This calls your deployed worker's /api/test-fetch endpoint

const WORKER_URL = process.argv[3] || 'http://localhost:8787'
const url = process.argv[2]

if (!url) {
  console.error('Usage: node scripts/test-fetch-worker.mjs <url> [worker-url]')
  process.exit(1)
}

console.log(`\nTesting fetch from Cloudflare Worker...`)
console.log(`Worker: ${WORKER_URL}`)
console.log(`URL: ${url}\n`)

try {
  const res = await fetch(`${WORKER_URL}/api/test-fetch?url=${encodeURIComponent(url)}`)
  const data = await res.json()

  console.log(`Status: ${data.status}`)
  console.log(`Content-Type: ${data.contentType}`)
  console.log(`HTML size: ${data.htmlSize}`)
  console.log(`Readable: ${data.readable}`)
  if (data.title) console.log(`Title: ${data.title}`)
  if (data.author) console.log(`Author: ${data.author}`)
  if (data.excerpt) console.log(`Excerpt: ${data.excerpt}`)
  if (data.textLength) console.log(`Text length: ${data.textLength} chars`)
  if (data.error) console.log(`Error: ${data.error}`)
} catch (err) {
  console.error(`Failed: ${err.message}`)
}
