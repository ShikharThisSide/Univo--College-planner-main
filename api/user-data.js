import { cloudAccountStore, cloudUserDataStore } from './_cloudStore.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    const { email } = req.query
    if (!email) return res.status(400).json({ error: 'Email parameter required' })
    const data = cloudUserDataStore.get(email.toLowerCase()) || null
    return res.status(200).json({ success: true, data })
  }

  if (req.method === 'POST') {
    const { email, account, tasks, groups, friends, requests, notifications, dmMessages } = req.body || {}
    if (!email) return res.status(400).json({ error: 'Email parameter required' })

    const userEmail = email.toLowerCase()
    const existing = cloudUserDataStore.get(userEmail) || {}

    const payload = {
      email: userEmail,
      account: account || existing.account || null,
      tasks: tasks || existing.tasks || [],
      groups: groups || existing.groups || [],
      friends: friends || existing.friends || [],
      requests: requests || existing.requests || [],
      notifications: notifications || existing.notifications || [],
      dmMessages: dmMessages || existing.dmMessages || {},
      lastSyncedAt: Date.now()
    }

    cloudUserDataStore.set(userEmail, payload)
    if (account) cloudAccountStore.set(userEmail, account)

    return res.status(200).json({ success: true, message: 'User data synced successfully across devices', data: payload })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
