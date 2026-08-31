// Centralized Multi-Device Sync Engine
// Syncs ALL user accounts, tasks, timetable, attendance, class representative roster, expenses, scratchpad, GPA, notes, groups, friends, messages, notifications, dismissed notifications, and theme preferences across devices & browsers

export async function fetchGlobalRegisteredUsers() {
  try {
    const res = await fetch('/api/all-users')
    if (!res.ok) return {}
    const json = await res.json()
    const cloudAccounts = json?.accounts || {}

    if (Object.keys(cloudAccounts).length > 0) {
      const localAccounts = JSON.parse(localStorage.getItem('univoAccounts') || '{}') || {}
      const merged = { ...cloudAccounts, ...localAccounts }
      localStorage.setItem('univoAccounts', JSON.stringify(merged))
      window.dispatchEvent(new Event('univo-social-updated'))
      return merged
    }
  } catch (err) {
    console.warn('[CloudSync] Global users fetch warning:', err)
  }
  return {}
}

export async function fetchCloudUserData(email) {
  if (!email) return null
  try {
    const res = await fetch(`/api/user-data?email=${encodeURIComponent(email)}`)
    if (!res.ok) return null
    const json = await res.json()
    return json?.data || null
  } catch (err) {
    console.warn('[CloudSync] Sync fetch warning:', err)
    return null
  }
}

export function restoreUserDataToDevice(cloudData) {
  if (!cloudData || !cloudData.email) return

  const email = cloudData.email.toLowerCase()

  // 1. Account Profile
  if (cloudData.account) {
    try {
      const accounts = JSON.parse(localStorage.getItem('univoAccounts') || '{}') || {}
      accounts[email] = { ...(accounts[email] || {}), ...cloudData.account }
      localStorage.setItem('univoAccounts', JSON.stringify(accounts))

      const currentStored = JSON.parse(localStorage.getItem('univoUser') || '{}') || {}
      if (currentStored.email?.toLowerCase() === email) {
        const updatedUser = { ...currentStored, ...cloudData.account }
        localStorage.setItem('univoUser', JSON.stringify(updatedUser))
      }
    } catch {}
  }

  // 2. Tasks & Assignments
  if (Array.isArray(cloudData.tasks) && cloudData.tasks.length > 0) {
    try {
      const existingKey = `univoAssignments:${email}`
      const existing = JSON.parse(localStorage.getItem(existingKey) || '[]') || []
      const mergedMap = new Map()
      existing.forEach((t) => mergedMap.set(t.id, t))
      cloudData.tasks.forEach((t) => mergedMap.set(t.id, t))
      localStorage.setItem(existingKey, JSON.stringify(Array.from(mergedMap.values())))
    } catch {}
  }

  // 3. Timetable & Schedule
  if (Array.isArray(cloudData.timetable) && cloudData.timetable.length > 0) {
    try {
      localStorage.setItem(`univoTimetable:${email}`, JSON.stringify(cloudData.timetable))
    } catch {}
  }

  // 4. Attendance Log
  if (Array.isArray(cloudData.attendance) && cloudData.attendance.length > 0) {
    try {
      localStorage.setItem(`univoAttendance:${email}`, JSON.stringify(cloudData.attendance))
    } catch {}
  }

  // 5. Class Representative Roster & Attendance Meta
  if (Array.isArray(cloudData.classRoster) && cloudData.classRoster.length > 0) {
    try {
      localStorage.setItem(`univoClassRoster:${email}`, JSON.stringify(cloudData.classRoster))
    } catch {}
  }
  if (cloudData.attendanceMeta) {
    try {
      localStorage.setItem(`univoAttendanceMeta:${email}`, JSON.stringify(cloudData.attendanceMeta))
    } catch {}
  }
  if (Array.isArray(cloudData.classRegister) && cloudData.classRegister.length > 0) {
    try {
      localStorage.setItem(`univoClassRegister:${email}`, JSON.stringify(cloudData.classRegister))
    } catch {}
  }

  // 6. Expenses & Budget
  if (Array.isArray(cloudData.expenses) && cloudData.expenses.length > 0) {
    try {
      localStorage.setItem(`univoExpenses:${email}`, JSON.stringify(cloudData.expenses))
    } catch {}
  }

  // 7. Scratchpad Notes
  if (cloudData.scratchpad !== undefined && cloudData.scratchpad !== null) {
    try {
      localStorage.setItem(`univoScratchpad:${email}`, cloudData.scratchpad)
    } catch {}
  }

  // 8. GPA & Marks
  if (cloudData.gpa) {
    try {
      localStorage.setItem(`univoGpa:${email}`, JSON.stringify(cloudData.gpa))
    } catch {}
  }

  // 9. Notes Vault
  if (Array.isArray(cloudData.notes) && cloudData.notes.length > 0) {
    try {
      localStorage.setItem(`univoNotes:${email}`, JSON.stringify(cloudData.notes))
    } catch {}
  }

  // 10. Friends & Requests
  if (Array.isArray(cloudData.friends)) {
    try {
      const existing = JSON.parse(localStorage.getItem(`univoSocial:friends:${email}`) || '[]') || []
      const merged = Array.from(new Set([...existing, ...cloudData.friends]))
      localStorage.setItem(`univoSocial:friends:${email}`, JSON.stringify(merged))
    } catch {}
  }

  if (Array.isArray(cloudData.requests)) {
    try {
      const existing = JSON.parse(localStorage.getItem(`univoSocial:requests:${email}`) || '[]') || []
      const mergedMap = new Map()
      existing.forEach((r) => mergedMap.set(r.id, r))
      cloudData.requests.forEach((r) => mergedMap.set(r.id, r))
      localStorage.setItem(`univoSocial:requests:${email}`, JSON.stringify(Array.from(mergedMap.values())))
    } catch {}
  }

  if (Array.isArray(cloudData.joinRequests)) {
    try {
      const existing = JSON.parse(localStorage.getItem(`univoSocial:joinRequests:${email}`) || '[]') || []
      const mergedMap = new Map()
      existing.forEach((r) => mergedMap.set(r.id, r))
      cloudData.joinRequests.forEach((r) => mergedMap.set(r.id, r))
      localStorage.setItem(`univoSocial:joinRequests:${email}`, JSON.stringify(Array.from(mergedMap.values())))
    } catch {}
  }

  // 11. Dismissed Notifications
  if (Array.isArray(cloudData.dismissedNotifications) && cloudData.dismissedNotifications.length > 0) {
    try {
      const existing = JSON.parse(localStorage.getItem(`univoSocial:dismissed-notifications:${email}`) || '[]') || []
      const merged = Array.from(new Set([...existing, ...cloudData.dismissedNotifications]))
      localStorage.setItem(`univoSocial:dismissed-notifications:${email}`, JSON.stringify(merged))
    } catch {}
  }

  // 12. Campus Groups
  if (Array.isArray(cloudData.groups) && cloudData.groups.length > 0) {
    try {
      const existing = JSON.parse(localStorage.getItem('univoSocial:all_groups') || '[]') || []
      const mergedMap = new Map()
      existing.forEach((g) => mergedMap.set(g.id, g))
      cloudData.groups.forEach((g) => mergedMap.set(g.id, g))
      localStorage.setItem('univoSocial:all_groups', JSON.stringify(Array.from(mergedMap.values())))
    } catch {}
  }

  // 13. DM Message History
  if (cloudData.dmMessages && typeof cloudData.dmMessages === 'object') {
    try {
      Object.entries(cloudData.dmMessages).forEach(([key, msgs]) => {
        if (Array.isArray(msgs)) {
          localStorage.setItem(`univoSocial:dmMsgs:${key}`, JSON.stringify(msgs))
        }
      })
    } catch {}
  }

  // 14. Theme & Preferences
  if (cloudData.themeAccent) {
    localStorage.setItem(`univoPreference:${email}:accent`, cloudData.themeAccent)
  }
  if (cloudData.themeMode) {
    localStorage.setItem(`univoPreference:${email}:mode`, cloudData.themeMode)
  }

  // 15. Trigger Real-Time Window Refresh Events
  window.dispatchEvent(new Event('univo-social-updated'))
  window.dispatchEvent(new Event('univo-tasks-updated'))
  window.dispatchEvent(new Event('univo-timetable-updated'))
  window.dispatchEvent(new Event('univo-expenses-updated'))
  window.dispatchEvent(new Event('univo-cr-updated'))
}

export async function pushUserDataToCloud(email) {
  if (!email) return null
  const userEmail = email.toLowerCase()

  try {
    let account = null
    try {
      const accounts = JSON.parse(localStorage.getItem('univoAccounts') || '{}') || {}
      account = accounts[userEmail] || null
    } catch {}

    let tasks = []
    try { tasks = JSON.parse(localStorage.getItem(`univoAssignments:${userEmail}`) || '[]') || [] } catch {}

    let timetable = []
    try { timetable = JSON.parse(localStorage.getItem(`univoTimetable:${userEmail}`) || '[]') || [] } catch {}

    let attendance = []
    try { attendance = JSON.parse(localStorage.getItem(`univoAttendance:${userEmail}`) || '[]') || [] } catch {}

    let classRoster = []
    try { classRoster = JSON.parse(localStorage.getItem(`univoClassRoster:${userEmail}`) || '[]') || [] } catch {}

    let attendanceMeta = null
    try { attendanceMeta = JSON.parse(localStorage.getItem(`univoAttendanceMeta:${userEmail}`) || 'null') } catch {}

    let classRegister = []
    try { classRegister = JSON.parse(localStorage.getItem(`univoClassRegister:${userEmail}`) || '[]') || [] } catch {}

    let expenses = []
    try { expenses = JSON.parse(localStorage.getItem(`univoExpenses:${userEmail}`) || '[]') || [] } catch {}

    let scratchpad = ''
    try { scratchpad = localStorage.getItem(`univoScratchpad:${userEmail}`) || '' } catch {}

    let gpa = null
    try { gpa = JSON.parse(localStorage.getItem(`univoGpa:${userEmail}`) || 'null') } catch {}

    let notes = []
    try { notes = JSON.parse(localStorage.getItem(`univoNotes:${userEmail}`) || '[]') || [] } catch {}

    let friends = []
    try { friends = JSON.parse(localStorage.getItem(`univoSocial:friends:${userEmail}`) || '[]') || [] } catch {}

    let requests = []
    try { requests = JSON.parse(localStorage.getItem(`univoSocial:requests:${userEmail}`) || '[]') || [] } catch {}

    let joinRequests = []
    try { joinRequests = JSON.parse(localStorage.getItem(`univoSocial:joinRequests:${userEmail}`) || '[]') || [] } catch {}

    let dismissedNotifications = []
    try { dismissedNotifications = JSON.parse(localStorage.getItem(`univoSocial:dismissed-notifications:${userEmail}`) || '[]') || [] } catch {}

    let groups = []
    try { groups = JSON.parse(localStorage.getItem('univoSocial:all_groups') || '[]') || [] } catch {}

    const dmMessages = {}
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('univoSocial:dmMsgs:') && key.includes(userEmail)) {
          const pairKey = key.replace('univoSocial:dmMsgs:', '')
          dmMessages[pairKey] = JSON.parse(localStorage.getItem(key) || '[]')
        }
      }
    } catch {}

    const themeAccent = localStorage.getItem(`univoPreference:${userEmail}:accent`) || 'deep-teal'
    const themeMode = localStorage.getItem(`univoPreference:${userEmail}:mode`) || 'light'

    const payload = {
      email: userEmail,
      account,
      tasks,
      timetable,
      attendance,
      classRoster,
      attendanceMeta,
      classRegister,
      expenses,
      scratchpad,
      gpa,
      notes,
      friends,
      requests,
      joinRequests,
      dismissedNotifications,
      groups,
      dmMessages,
      themeAccent,
      themeMode
    }

    const res = await fetch('/api/user-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!res.ok) return null
    const json = await res.json()
    return json?.data || null
  } catch (err) {
    console.warn('[CloudSync] Push sync warning:', err)
    return null
  }
}
