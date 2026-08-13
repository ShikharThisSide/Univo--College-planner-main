export function readSocial(key, fallback = []) {
  try { return JSON.parse(localStorage.getItem(`univoSocial:${key}`)) || fallback } catch { return fallback }
}

export function writeSocial(key, value) {
  localStorage.setItem(`univoSocial:${key}`, JSON.stringify(value))
  window.dispatchEvent(new Event('univo-social-updated'))
}

export function requestFriend(from, to) {
  const requests = readSocial(`requests:${to.email}`)
  if (requests.some((item) => item.fromEmail === from.email && item.status === 'pending')) return
  writeSocial(`requests:${to.email}`, [...requests, { id: `${from.email}-${Date.now()}`, fromEmail: from.email, fromName: from.name, fromAvatar: from.avatar, status: 'pending', createdAt: Date.now() }])
}

export function areFriends(a, b) {
  return readSocial(`friends:${a?.email}`).some((email) => email === b?.email)
}

export function addFriend(a, b) {
  if (!areFriends(a, b)) writeSocial(`friends:${a.email}`, [...readSocial(`friends:${a.email}`), b.email])
  if (!areFriends(b, a)) writeSocial(`friends:${b.email}`, [...readSocial(`friends:${b.email}`), a.email])
}

export function sendGroupInvite(group, fromUser, recipientEmail, recipientName) {
  const recipientRequestsKey = `groupRequests:${recipientEmail}`
  const existing = readSocial(recipientRequestsKey)
  if (existing.some((item) => item.groupId === group.id && item.status === 'pending')) return

  const newInvite = {
    id: `g-invite-${group.id}-${recipientEmail}-${Date.now()}`,
    groupId: group.id,
    groupName: group.name,
    groupDescription: group.description,
    fromEmail: fromUser.email,
    fromName: fromUser.name || fromUser.email.split('@')[0],
    recipientEmail,
    recipientName: recipientName || recipientEmail.split('@')[0],
    status: 'pending',
    createdAt: Date.now()
  }

  writeSocial(recipientRequestsKey, [...existing, newInvite])

  // Update group pending invites on creator's side
  const creatorKey = `groups:${fromUser.email}`
  const creatorGroups = readSocial(creatorKey)
  const updatedGroups = creatorGroups.map((g) => {
    if (g.id === group.id) {
      const pendingInvites = g.pendingInvites || []
      if (!pendingInvites.some((p) => (typeof p === 'string' ? p === recipientEmail : p.email === recipientEmail))) {
        return { ...g, pendingInvites: [...pendingInvites, { email: recipientEmail, name: recipientName || recipientEmail }] }
      }
    }
    return g
  })
  writeSocial(creatorKey, updatedGroups)
}

export function respondToGroupInvite(invite, accepted, currentUser) {
  const recipientEmail = currentUser?.email
  if (!recipientEmail) return

  const recipientRequestsKey = `groupRequests:${recipientEmail}`
  const requests = readSocial(recipientRequestsKey)
  const updatedRequests = requests.map((item) => item.id === invite.id ? { ...item, status: accepted ? 'accepted' : 'rejected' } : item)
  writeSocial(recipientRequestsKey, updatedRequests)

  if (accepted) {
    const creatorKey = `groups:${invite.fromEmail}`
    const creatorGroups = readSocial(creatorKey)
    const targetGroup = creatorGroups.find((g) => g.id === invite.groupId) || {
      id: invite.groupId,
      name: invite.groupName,
      description: invite.groupDescription || '',
      members: [invite.fromName || 'Creator'],
      createdAt: invite.createdAt
    }

    const memberName = currentUser.name || currentUser.email.split('@')[0]
    const updatedMembers = Array.from(new Set([...(targetGroup.members || []), memberName]))
    const updatedPending = (targetGroup.pendingInvites || []).filter((p) => (typeof p === 'string' ? p !== recipientEmail : p.email !== recipientEmail))

    const newGroupState = {
      ...targetGroup,
      members: updatedMembers,
      pendingInvites: updatedPending
    }

    // Sync to creator's groups
    const nextCreatorGroups = creatorGroups.map((g) => g.id === invite.groupId ? newGroupState : g)
    if (!creatorGroups.some((g) => g.id === invite.groupId)) {
      nextCreatorGroups.push(newGroupState)
    }
    writeSocial(creatorKey, nextCreatorGroups)

    // Sync to recipient's groups
    const recipientKey = `groups:${recipientEmail}`
    const recipientGroups = readSocial(recipientKey)
    if (!recipientGroups.some((g) => g.id === invite.groupId)) {
      writeSocial(recipientKey, [...recipientGroups, newGroupState])
    } else {
      writeSocial(recipientKey, recipientGroups.map((g) => g.id === invite.groupId ? newGroupState : g))
    }
  }
}

