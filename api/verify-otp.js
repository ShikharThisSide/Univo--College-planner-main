import { pendingOtps } from './_otpStore.js'

export default function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
    const email = String(req.body?.email || '').trim().toLowerCase()
    const code = String(req.body?.code || '').trim()
    const entry = pendingOtps.get(email)
    if (!entry || entry.expiresAt < Date.now() || entry.code !== code) return res.status(400).json({ error: 'Invalid or expired verification code.' })
    pendingOtps.delete(email)
    return res.status(200).json({ verified: true })
  } catch (error) {
    console.error('verify-otp failed:', error)
    return res.status(500).json({ error: 'Unable to verify the code. Please try again.' })
  }
}
