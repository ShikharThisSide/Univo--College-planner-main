import { cloudAccountStore, cloudUserDataStore } from './_cloudStore.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    const allAccounts = {}

    // 1. Gather all accounts from cloudAccountStore
    for (const [email, acc] of cloudAccountStore.entries()) {
      if (email && acc) {
        allAccounts[email] = {
          email: acc.email || email,
          name: acc.name || email.split('@')[0],
          role: acc.role || 'student_individual',
          username: acc.username,
          avatar: acc.avatar,
          avatarImage: acc.avatarImage,
          lastActiveAt: acc.lastActiveAt || Date.now()
        }
      }
    }

    // 2. Gather from cloudUserDataStore as fallback
    for (const [email, payload] of cloudUserDataStore.entries()) {
      if (email && payload?.account && !allAccounts[email]) {
        const acc = payload.account
        allAccounts[email] = {
          email: acc.email || email,
          name: acc.name || email.split('@')[0],
          role: acc.role || 'student_individual',
          username: acc.username,
          avatar: acc.avatar,
          avatarImage: acc.avatarImage,
          lastActiveAt: acc.lastActiveAt || payload.lastSyncedAt || Date.now()
        }
      }
    }

    return res.status(200).json({ success: true, accounts: allAccounts })
  }

  if (req.method === 'POST') {
    const { email, name, role, username, avatar, avatarImage } = req.body || {}
    if (!email) return res.status(400).json({ error: 'Email parameter required' })

    const userEmail = email.toLowerCase()
    const accountObj = {
      email: userEmail,
      name: name || userEmail.split('@')[0],
      role: role || 'student_individual',
      username,
      avatar,
      avatarImage,
      lastActiveAt: Date.now()
    }

    cloudAccountStore.set(userEmail, accountObj)
    return res.status(200).json({ success: true, account: accountObj })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
