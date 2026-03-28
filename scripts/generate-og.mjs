import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load a font for satori (using system font as fallback)
async function loadFont() {
  // Try to fetch DM Serif Display from Google Fonts
  const res = await fetch('https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap')
  const css = await res.text()
  const fontUrl = css.match(/src:\s*url\(([^)]+)\)/)?.[1]
  if (fontUrl) {
    const fontRes = await fetch(fontUrl)
    return Buffer.from(await fontRes.arrayBuffer())
  }
  throw new Error('Could not load font')
}

async function generateOgImage() {
  const fontData = await loadFont()

  // Also load a sans-serif font for the subtitle
  const sansRes = await fetch('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap')
  const sansCss = await sansRes.text()
  const sansFontUrl = sansCss.match(/src:\s*url\(([^)]+)\)/)?.[1]
  const sansFontData = sansFontUrl ? Buffer.from(await (await fetch(sansFontUrl)).arrayBuffer()) : fontData

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f0e8',
          padding: '60px',
        },
        children: [
          // Top decorative rule
          {
            type: 'div',
            props: {
              style: {
                width: '80%',
                height: '3px',
                backgroundColor: '#1a1a1a',
                marginBottom: '8px',
              },
            },
          },
          {
            type: 'div',
            props: {
              style: {
                width: '80%',
                height: '1px',
                backgroundColor: '#c5bfb3',
                marginBottom: '40px',
              },
            },
          },
          // Title
          {
            type: 'div',
            props: {
              style: {
                fontFamily: 'DM Serif Display',
                fontSize: '72px',
                color: '#1a1a1a',
                letterSpacing: '-1px',
                lineHeight: '1',
              },
              children: 'Hacker News Times',
            },
          },
          // Tagline
          {
            type: 'div',
            props: {
              style: {
                fontFamily: 'Inter',
                fontSize: '24px',
                color: '#6b6b5e',
                marginTop: '16px',
                fontStyle: 'italic',
              },
              children: 'Hacker News, Beautifully Delivered',
            },
          },
          // Bottom decorative rule
          {
            type: 'div',
            props: {
              style: {
                width: '80%',
                height: '1px',
                backgroundColor: '#c5bfb3',
                marginTop: '40px',
                marginBottom: '8px',
              },
            },
          },
          {
            type: 'div',
            props: {
              style: {
                width: '80%',
                height: '3px',
                backgroundColor: '#1a1a1a',
                marginBottom: '32px',
              },
            },
          },
          // Feature pills
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                gap: '16px',
                marginTop: '8px',
              },
              children: ['Top Stories', 'Ask HN', 'Show HN', 'Weekly Newsletter'].map(
                (label) => ({
                  type: 'div',
                  props: {
                    style: {
                      fontFamily: 'Inter',
                      fontSize: '14px',
                      color: '#6b6b5e',
                      border: '1px solid #c5bfb3',
                      padding: '6px 16px',
                      borderRadius: '4px',
                    },
                    children: label,
                  },
                })
              ),
            },
          },
          // URL
          {
            type: 'div',
            props: {
              style: {
                fontFamily: 'Inter',
                fontSize: '16px',
                color: '#8a8a7a',
                marginTop: '32px',
              },
              children: 'hackernewstimes.com',
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'DM Serif Display',
          data: fontData,
          weight: 400,
          style: 'normal',
        },
        {
          name: 'Inter',
          data: sansFontData,
          weight: 400,
          style: 'normal',
        },
      ],
    }
  )

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
  })
  const pngData = resvg.render()
  const pngBuffer = pngData.asPng()

  const outputPath = join(__dirname, '..', 'public', 'og-image.png')
  writeFileSync(outputPath, pngBuffer)
  console.log(`Generated OG image: ${outputPath} (${(pngBuffer.length / 1024).toFixed(1)} KB)`)
}

generateOgImage().catch(console.error)
