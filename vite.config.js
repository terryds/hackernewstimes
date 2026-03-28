import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'og-image.png'],
      manifest: {
        name: 'Hacker News Times',
        short_name: 'HN Times',
        description: 'Hacker News, Beautifully Delivered — a newspaper-style reader with weekly newsletter',
        theme_color: '#1a1a1a',
        background_color: '#f5f0e8',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/hacker-news\.firebaseio\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'hn-api-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 5,
              },
            },
          },
          {
            urlPattern: /^https:\/\/api\.microlink\.io\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'og-metadata-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24,
              },
            },
          },
        ],
      },
    }),
  ],
})
