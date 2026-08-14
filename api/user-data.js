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
    const {
      email,
      account,
      tasks,
      timetable,
      attendance,
      expenses,
      scratchpad,
      gpa,
      notes,
      groups,
      friends,
      requests,
      joinRequests,
      notifications,
      dismissedNotifications,
      dmMessages,
      themeAccent,
      themeMode,
      classRoster,
      attendanceMeta,
      classRegister
    } = req.body || {}

    if (!email) return res.status(400).json({ error: 'Email parameter required' })

    const userEmail = email.toLowerCase()
    const existing = cloudUserDataStore.get(userEmail) || {}

    const payload = {
      email: userEmail,
      account: account || existing.account || null,
      tasks: tasks || existing.tasks || [],
      timetable: timetable || existing.timetable || [],
      attendance: attendance || existing.attendance || [],
      expenses: expenses || existing.expenses || [],
      scratchpad: scratchpad !== undefined ? scratchpad : existing.scratchpad || '',
      gpa: gpa || existing.gpa || null,
      notes: notes || existing.notes || [],
      groups: groups || existing.groups || [],
      friends: friends || existing.friends || [],
      requests: requests || existing.requests || [],
      joinRequests: joinRequests || existing.joinRequests || [],
      notifications: notifications || existing.notifications || [],
      dismissedNotifications: dismissedNotifications || existing.dismissedNotifications || [],
      dmMessages: dmMessages || existing.dmMessages || {},
      themeAccent: themeAccent || existing.themeAccent || 'emerald',
      themeMode: themeMode || existing.themeMode || 'dark',
      classRoster: classRoster || existing.classRoster || [],
      attendanceMeta: attendanceMeta || existing.attendanceMeta || null,
      classRegister: classRegister || existing.classRegister || [],
      lastSyncedAt: Date.now()
    }

    cloudUserDataStore.set(userEmail, payload)
    if (account) cloudAccountStore.set(userEmail, account)

    return res.status(200).json({ success: true, message: 'Comprehensive user data synced across devices', data: payload })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
