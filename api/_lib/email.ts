export async function sendPasswordResetEmail(input: {
  email: string
  token: string
}) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.AUTH_EMAIL_FROM
  const appUrl = process.env.APP_URL || 'https://numericode.vercel.app'

  if (!apiKey || !from) {
    return false
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: input.email,
      subject: 'Reset your NumeriCode password',
      html: `
        <h1>Reset your NumeriCode password</h1>
        <p>Use this token to reset your password:</p>
        <p style="font-size: 24px; font-weight: 700; letter-spacing: 2px;">${input.token}</p>
        <p>Open ${appUrl}/#/auth and choose Reset. This token expires in 20 minutes.</p>
      `,
    }),
  })

  return response.ok
}
