import { Resend } from 'resend'
import crypto from 'node:crypto'
import { pendingOtps } from './_otpStore.js'

const resend = new Resend(process.env.RESEND_API_KEY)
const otpSecret = () => process.env.OTP_SECRET || process.env.RESEND_API_KEY || 'univo-development-secret'
const createVerificationToken = (email, code, expiresAt) => {
  const payload = Buffer.from(JSON.stringify({ email, code, expiresAt })).toString('base64url')
  const signature = crypto.createHmac('sha256', otpSecret()).update(payload).digest('base64url')
  return `${payload}.${signature}`
}
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
    if (!process.env.RESEND_API_KEY) return res.status(503).json({ error: 'Email verification is not configured yet.' })
    const email = String(req.body?.email || '').trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' })

    const code = String(Math.floor(100000 + Math.random() * 900000))
    pendingOtps.set(email, { code, expiresAt: Date.now() + 10 * 60 * 1000 })
    setTimeout(() => pendingOtps.delete(email), 10 * 60 * 1000)

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Univo <onboarding@resend.dev>',
      to: [email],
      subject: 'Your Univo verification code',
      text: `Your Univo verification code is ${code}. It expires in 10 minutes.`,
      html: `<div style="font-family:Arial,sans-serif"><h2>Verify your Univo account</h2><p>Your verification code is:</p><p style="font-size:32px;font-weight:700;letter-spacing:8px">${code}</p><p>This code expires in 10 minutes.</p></div>`,
    })
    if (error) return res.status(502).json({ error: 'Unable to send the verification email.' })
    return res.status(200).json({ ok: true, verificationToken: createVerificationToken(email, code, Date.now() + 10 * 60 * 1000) })
  } catch (error) {
    console.error('send-otp failed:', error)
    return res.status(500).json({ error: 'Unable to send the verification email.' })
  }
}
