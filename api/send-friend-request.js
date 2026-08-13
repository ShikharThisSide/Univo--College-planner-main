import { Resend } from 'resend'

const sender = () => process.env.RESEND_FROM_EMAIL || 'Univo <onboarding@resend.dev>'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { recipientEmail, recipientName, senderName } = req.body || {}
  if (!/^\S+@\S+\.\S+$/.test(String(recipientEmail || ''))) return res.status(400).json({ error: 'Invalid recipient email' })
  if (!process.env.RESEND_API_KEY) return res.status(503).json({ error: 'Email delivery is not configured' })
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const safeSender = String(senderName || 'Someone').replace(/[<>]/g, '')
    const safeRecipient = String(recipientName || 'there').replace(/[<>]/g, '')
    const { error } = await resend.emails.send({
      from: sender(), to: [recipientEmail], subject: `${safeSender} sent you a friend request on Univo`,
      text: `Hi ${safeRecipient}, ${safeSender} sent you a friend request on Univo. Open your Univo notifications to allow or reject it.`,
      html: `<div style="margin:0;background:#102a31;padding:40px 20px;font-family:Arial,sans-serif;color:#f5f7f2"><div style="max-width:560px;margin:auto;background:#173e44;border:1px solid #376b68;border-radius:24px;overflow:hidden"><div style="padding:28px 32px;background:linear-gradient(135deg,#173e44,#245e58)"><div style="color:#c4f04d;font-size:12px;font-weight:800;letter-spacing:3px">UNIVO</div><h1 style="margin:18px 0 0;font-size:30px;line-height:1.15">A new connection is waiting.</h1></div><div style="padding:30px 32px"><p style="font-size:16px">Hi ${safeRecipient},</p><p style="color:#c4d5d0;font-size:16px;line-height:1.6"><strong style="color:#c4f04d">${safeSender}</strong> sent you a friend request on Univo.</p><a href="${process.env.APP_URL || 'https://univo.shikharthisside.in'}/dashboard/me/messenger" style="display:inline-block;margin-top:12px;padding:13px 20px;border-radius:999px;background:#c4f04d;color:#102a31;text-decoration:none;font-weight:800">View request</a><p style="margin-top:28px;color:#91aaa5;font-size:12px">You can allow or reject this request from your Univo notifications.</p></div></div></div>`,
    })
    if (error) return res.status(502).json({ error: error.message || 'Unable to send friend request email' })
    return res.status(200).json({ ok: true })
  } catch (error) { return res.status(500).json({ error: error.message || 'Unable to send friend request email' }) }
}
