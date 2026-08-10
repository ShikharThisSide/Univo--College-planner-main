export default async function handler(req, res) {
  const { code, state = 'student' } = req.query || {}
  if (!code) return res.status(400).send('Google sign-in was cancelled or did not return a code.')

  const origin = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${origin}/api/auth/google/callback`
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: String(code),
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })
  if (!tokenResponse.ok) return res.status(502).send('Google token exchange failed.')
  const tokens = await tokenResponse.json()
  const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  if (!profileResponse.ok) return res.status(502).send('Unable to read Google account details.')
  const profile = await profileResponse.json()
  const params = new URLSearchParams({ google_email: profile.email, google_name: profile.name || '', path: String(state) })
  return res.redirect(`/login?${params}`)
}
