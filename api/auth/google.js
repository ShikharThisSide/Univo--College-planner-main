export default function handler(req, res) {
  const clientId = String(process.env.GOOGLE_CLIENT_ID || '').trim()
  if (!clientId) return res.status(503).json({ error: 'Google sign-in is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.' })

  const origin = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${origin}/api/auth/google/callback`
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
    state: String(req.query?.path || 'student'),
  })
  return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
}
