import { cloudAccountStore, cloudUserDataStore } from './_cloudStore.js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

async function readPersistent(email) {
  if (!supabaseUrl || !supabaseKey) return cloudUserDataStore.get(email) || null
  const response = await fetch(`${supabaseUrl}/rest/v1/univo_user_data?email=eq.${encodeURIComponent(email)}&select=payload&limit=1`, {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }
  })
  if (!response.ok) throw new Error(`Supabase read failed: ${response.status}`)
  const rows = await response.json()
  return rows[0]?.payload || null
}

async function writePersistent(email, payload) {
  if (!supabaseUrl || !supabaseKey) {
    cloudUserDataStore.set(email, payload)
    cloudAccountStore.set(email, payload.account)
    return
  }
  const response = await fetch(`${supabaseUrl}/rest/v1/univo_user_data?on_conflict=email`, {
    method: 'POST',
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ email, payload })
  })
  if (!response.ok) throw new Error(`Supabase write failed: ${response.status}`)
}

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
    const data = await readPersistent(email.toLowerCase())
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
    const existing = await readPersistent(userEmail) || {}

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

    await writePersistent(userEmail, payload)

    return res.status(200).json({ success: true, message: 'Comprehensive user data synced across devices', data: payload })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
