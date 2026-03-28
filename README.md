# Hacker News Times

A beautiful, newspaper-style Hacker News reader built as a PWA. Includes a weekly email newsletter powered by Cloudflare Workers + Resend.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4
- **Backend**: Cloudflare Workers (API + static assets + cron)
- **Database**: Cloudflare KV
- **Email**: Resend
- **PWA**: vite-plugin-pwa + Workbox

## Project Structure

```
hackernews-newspaper/
  src/                    # React frontend
    components/           # UI components
    hooks/                # Custom React hooks
    api.js                # HN API client
    index.css             # Tailwind + theme
  worker/                 # Cloudflare Worker (newsletter API + cron)
    index.js              # Routes + cron handler
    kv.js                 # KV helpers
    hn.js                 # HN API fetcher
    email.js              # Resend wrapper
    template.js           # Newsletter HTML template
  public/                 # Static assets + PWA icons
  wrangler.toml           # Cloudflare Worker config (serves frontend + API)
  vite.config.js
  package.json
```

## Local Development

### Frontend only

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:5173` and is accessible on your local network via `--host`.

### Full stack (frontend + worker API)

```bash
npm run build
npm run dev:worker
```

This builds the frontend and starts wrangler, serving both the SPA and API routes at `http://localhost:8787`.

## Deployment

Everything deploys as a **single Cloudflare Worker** using [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/). The Worker serves the React SPA for all routes except `/api/*`, which are handled by the newsletter API.

### 1. Initial setup

**Create the KV namespace:**

```bash
npx wrangler kv namespace create NEWSLETTER_KV
```

Copy the output ID and update `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "NEWSLETTER_KV"
id = "<your-kv-namespace-id>"
```

**Set your environment variables** in `wrangler.toml`:

```toml
[vars]
FROM_EMAIL = "newsletter@yourdomain.com"
SITE_URL = "https://hackernews-newspaper.your-subdomain.workers.dev"
```

**Set the Resend API key:**

```bash
npx wrangler secret put RESEND_API_KEY
```

### 2. Deploy

**Option A: Via CLI**

```bash
npm run deploy
```

This runs `vite build && wrangler deploy` — builds the frontend, then deploys everything (static assets + worker + cron) in one shot.

**Option B: Via Cloudflare Dashboard (auto-deploy on push)**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages** > **Create**
2. Select **Import a repository** and connect your GitHub/GitLab repo
3. Configure the build:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Under **Settings > Variables and Secrets**, add:
   - `RESEND_API_KEY` (encrypted) — your Resend API key
5. Under **Settings > Bindings**, add:
   - **KV Namespace**: bind `NEWSLETTER_KV` to your KV namespace
6. Make sure the `wrangler.toml` in your repo has the correct `FROM_EMAIL` and `SITE_URL` vars

Once connected, Cloudflare will automatically build and deploy on every push to your main branch.

Your app will be available at `https://hackernews-newspaper.<your-subdomain>.workers.dev`.

### Environment Variables Summary

| Variable | Where | Description |
|----------|-------|-------------|
| `RESEND_API_KEY` | Secret (`wrangler secret put`) | Your Resend API key |
| `FROM_EMAIL` | `wrangler.toml` vars | Sender email (must be verified on Resend) |
| `SITE_URL` | `wrangler.toml` vars | Your deployed URL (for unsubscribe links) |

## Features

- Newspaper-style layout with hero, secondary, sidebar, and headline sections
- Dark mode with toggle switch
- PWA installable (works offline)
- Full article reader with iframe + comments side-by-side
- OG image thumbnails for stories
- Daily motivational quote
- Weekly newsletter with timezone-aware delivery
- 6 content sections: Front Page, Best, Latest, Ask HN, Show HN, Jobs

## Newsletter

The newsletter is sent every **Tuesday** at **10:00 AM local time** for each subscriber. The cron runs hourly on Tuesdays and checks each subscriber's timezone to deliver at the right time.

Subscriber timezones are detected automatically via the browser's `Intl` API.

## License

MIT
