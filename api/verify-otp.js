import crypto from 'node:crypto'
import { pendingOtps } from './_otpStore.js'

const otpSecret = () => process.env.OTP_SECRET || process.env.RESEND_API_KEY || 'univo-development-secret'

export default function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
    const email = String(req.body?.email || '').trim().toLowerCase()
    const code = String(req.body?.code || '').trim()
    const token = String(req.body?.verificationToken || '')
    const [payload, signature] = token.split('.')
    let tokenData
    try {
      const expected = crypto.createHmac('sha256', otpSecret()).update(payload || '').digest('base64url')
      const received = Buffer.from(signature || '')
      const expectedBuffer = Buffer.from(expected)
      if (!payload || !signature || received.length !== expectedBuffer.length || !crypto.timingSafeEqual(received, expectedBuffer)) throw new Error('Invalid signature')
      tokenData = JSON.parse(Buffer.from(payload, 'base64url').toString())
    } catch {
      return res.status(400).json({ error: 'Invalid or expired verification code.' })
    }
    if (tokenData.email !== email || tokenData.expiresAt < Date.now() || tokenData.code !== code) return res.status(400).json({ error: 'Invalid or expired verification code.' })
    pendingOtps.delete(email)
    return res.status(200).json({ verified: true })
  } catch (error) {
    console.error('verify-otp failed:', error)
    return res.status(500).json({ error: 'Unable to verify the code. Please try again.' })
  }
}
