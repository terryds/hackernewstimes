export function buildNewsletterHtml(stories, weekLabel, unsubscribeUrl) {
  const storyRows = stories.map((s) => {
    const url = s.url || `https://news.ycombinator.com/item?id=${s.id}`
    const hnLink = `https://news.ycombinator.com/item?id=${s.id}`
    const meta = [
      s.domain && `<span>${s.domain}</span>`,
      `<span>${s.score} pts</span>`,
      `<span><a href="${hnLink}" style="color:#6b6b5e;text-decoration:underline;">${s.descendants} comments</a></span>`,
      `<span>by ${s.by}</span>`,
    ].filter(Boolean).join(' &middot; ')

    return `
        <tr><td style="padding:14px 0;border-bottom:1px solid #c5bfb3;">
          <a href="${url}" style="font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#1a1a1a;text-decoration:none;font-weight:bold;line-height:1.4;">
            ${s.title}
          </a>
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#6b6b5e;margin-top:4px;">
            ${meta}
          </div>
        </td></tr>`
  }).join('')

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f5f0e8;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0e8;">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Masthead -->
        <tr><td style="text-align:center;padding-bottom:20px;border-bottom:2px solid #1a1a1a;">
          <h1 style="margin:0;font-size:28px;color:#1a1a1a;">Hacker News Times</h1>
          <p style="margin:4px 0 0;font-size:13px;color:#6b6b5e;font-style:italic;">Weekly Newsletter &mdash; ${weekLabel}</p>
        </td></tr>

        <!-- Intro -->
        <tr><td style="padding:20px 0 12px;font-size:14px;color:#4a4a4a;line-height:1.5;">
          Here are the top stories from Hacker News this week, ranked by community score.
        </td></tr>

        <!-- Stories -->
        ${storyRows}

        <!-- Footer -->
        <tr><td style="padding:24px 0 0;text-align:center;font-size:11px;color:#8a8a7a;">
          <p style="margin:0 0 8px;">Hacker News Times &mdash; An unofficial, open-source HN reader</p>
          <p style="margin:0;">
            <a href="${unsubscribeUrl}" style="color:#8a8a7a;text-decoration:underline;">Unsubscribe</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
