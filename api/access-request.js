import { Resend } from 'resend'
import crypto from 'node:crypto'

const approvalEmail = 'inform.shikhar@gmail.com'
const secret = () => process.env.OTP_SECRET || process.env.RESEND_API_KEY || 'univo-development-secret'
const appUrl = () => process.env.APP_URL || 'https://univo.shikharthisside.in'
const sign = (value) => crypto.createHmac('sha256', secret()).update(value).digest('base64url')
const tokenFor = (email, role) => `${Buffer.from(JSON.stringify({ email, role })).toString('base64url')}.${sign(`${email}:${role}`)}`
const decode = (token) => {
  const [payload, signature] = String(token || '').split('.')
  const data = JSON.parse(Buffer.from(payload, 'base64url').toString())
  if (signature !== sign(`${data.email}:${data.role}`)) throw new Error('Invalid approval token')
  return data
}
const supabase = () => ({ url: process.env.SUPABASE_URL, key: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY })

async function saveRequest(request) {
  const { url, key } = supabase()
  if (!url || !key) throw new Error('Supabase is not configured')
  const response = await fetch(`${url}/rest/v1/univo_access_requests?on_conflict=email`, {
    method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(request)
  })
  if (!response.ok) throw new Error('Unable to save access request')
}
async function readRequest(email) {
  const { url, key } = supabase()
  if (!url || !key) throw new Error('Supabase is not configured')
  const response = await fetch(`${url}/rest/v1/univo_access_requests?email=eq.${encodeURIComponent(email)}&select=email,requested_role,status&limit=1`, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
  if (!response.ok) throw new Error('Unable to check access request')
  return (await response.json())[0] || null
}
export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { decision, token } = req.query || {}
      if (decision) {
        const data = decode(token)
        await saveRequest({ email: data.email, requested_role: data.role, status: decision === 'approve' ? 'approved' : 'rejected', reviewed_at: new Date().toISOString() })
        return res.status(200).send(`<html><body style="font-family:Arial;padding:40px"><h2>Univo access ${decision === 'approve' ? 'approved' : 'rejected'}</h2><p>${data.email} was ${decision === 'approve' ? 'approved' : 'rejected'} for ${data.role} access.</p></body></html>`)
      }
      const email = String(req.query?.email || '').trim().toLowerCase()
      if (!email) return res.status(400).json({ error: 'Email required' })
      return res.status(200).json(await readRequest(email))
    }
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
    const email = String(req.body?.email || '').trim().toLowerCase()
    const role = String(req.body?.role || '').trim()
    if (!/^\S+@\S+\.\S+$/.test(email) || !['student_institutional', 'teacher', 'admin'].includes(role)) return res.status(400).json({ error: 'Valid email and university role are required.' })
    const token = tokenFor(email, role)
    await saveRequest({ email, requested_role: role, status: 'pending', requested_at: new Date().toISOString() })
    const resend = new Resend(process.env.RESEND_API_KEY)
    const from = process.env.RESEND_FROM_EMAIL || 'Univo <onboarding@resend.dev>'
    const approve = `${appUrl()}/api/access-request?decision=approve&token=${encodeURIComponent(token)}`
    const reject = `${appUrl()}/api/access-request?decision=reject&token=${encodeURIComponent(token)}`
    const { error } = await resend.emails.send({ from, to: [approvalEmail], subject: `Univo access request: ${email}`, html: `<div style="font-family:Arial"><h2>Univo access request</h2><p><strong>${email}</strong> requested <strong>${role}</strong> access.</p><p><a href="${approve}">Approve access</a></p><p><a href="${reject}">Reject access</a></p></div>` })
    if (error) return res.status(502).json({ error: error.message || 'Unable to send approval email' })
    return res.status(200).json({ ok: true })
  } catch (error) { return res.status(500).json({ error: error.message || 'Access request failed' }) }
}
