export async function sendEmail(apiKey, { from, to, subject, html }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Resend error: ${res.status} ${error}`)
  }

  return res.json()
}

export function welcomeEmail(fromEmail) {
  return {
    subject: 'Welcome to Hacker News Times Weekly',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#f5f0e8;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0e8;">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <tr><td style="text-align:center;padding-bottom:24px;border-bottom:2px solid #1a1a1a;">
          <h1 style="margin:0;font-size:28px;color:#1a1a1a;">Hacker News Times</h1>
          <p style="margin:4px 0 0;font-size:13px;color:#6b6b5e;font-style:italic;">Weekly Newsletter</p>
        </td></tr>
        <tr><td style="padding:32px 0;font-size:16px;line-height:1.6;color:#1a1a1a;">
          <p style="margin:0 0 16px;">You're now subscribed to the <strong>Hacker News Times Weekly Newsletter</strong>.</p>
          <p style="margin:0 0 16px;">Every Tuesday, we'll send you the best stories from the Hacker News front page — the ones that sparked the most discussion and earned the highest scores during the week.</p>
          <p style="margin:0;color:#6b6b5e;">See you next Tuesday.</p>
        </td></tr>
        <tr><td style="padding-top:24px;border-top:1px solid #c5bfb3;text-align:center;font-size:11px;color:#8a8a7a;">
          <p style="margin:0;">Hacker News Times &mdash; An unofficial HN reader</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }
}
