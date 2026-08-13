// Centralized Multi-Device Sync Engine
// Syncs user accounts, tasks, groups, friends, and settings across devices & browsers

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

  // 1. Restore Account Profile
  if (cloudData.account) {
    try {
      const accounts = JSON.parse(localStorage.getItem('univoAccounts') || '{}') || {}
      accounts[email] = { ...(accounts[email] || {}), ...cloudData.account }
      localStorage.setItem('univoAccounts', JSON.stringify(accounts))
    } catch {}
  }

  // 2. Restore Tasks
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

  // 3. Restore Friends & Requests
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

  // 4. Restore Groups
  if (Array.isArray(cloudData.groups) && cloudData.groups.length > 0) {
    try {
      const existing = JSON.parse(localStorage.getItem('univoSocial:all_groups') || '[]') || []
      const mergedMap = new Map()
      existing.forEach((g) => mergedMap.set(g.id, g))
      cloudData.groups.forEach((g) => mergedMap.set(g.id, g))
      localStorage.setItem('univoSocial:all_groups', JSON.stringify(Array.from(mergedMap.values())))
    } catch {}
  }

  // 5. Trigger Real-Time Window Updates
  window.dispatchEvent(new Event('univo-social-updated'))
  window.dispatchEvent(new Event('univo-tasks-updated'))
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
    try {
      tasks = JSON.parse(localStorage.getItem(`univoAssignments:${userEmail}`) || '[]') || []
    } catch {}

    let friends = []
    try {
      friends = JSON.parse(localStorage.getItem(`univoSocial:friends:${userEmail}`) || '[]') || []
    } catch {}

    let requests = []
    try {
      requests = JSON.parse(localStorage.getItem(`univoSocial:requests:${userEmail}`) || '[]') || []
    } catch {}

    let groups = []
    try {
      groups = JSON.parse(localStorage.getItem('univoSocial:all_groups') || '[]') || []
    } catch {}

    const payload = {
      email: userEmail,
      account,
      tasks,
      friends,
      requests,
      groups
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
