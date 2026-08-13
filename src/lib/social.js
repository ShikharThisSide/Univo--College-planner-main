import {
  generateOTPEmailHTML,
  generatePasswordResetEmailHTML,
  generateFriendRequestEmailHTML,
  generateProductUpdateEmailHTML
} from './emailTemplates'
import { pushUserDataToCloud } from './cloudSync'

export function readSocial(key, fallback = []) {
  try { return JSON.parse(localStorage.getItem(`univoSocial:${key}`)) || fallback } catch { return fallback }
}

export function writeSocial(key, value) {
  localStorage.setItem(`univoSocial:${key}`, JSON.stringify(value))
  window.dispatchEvent(new Event('univo-social-updated'))
}

// Real Last Active Activity Tracker Helpers
export function updateUserLastActive(email) {
  if (!email) return
  const now = Date.now()
  localStorage.setItem(`univoSocial:lastActive:${email}`, String(now))

  try {
    const accounts = JSON.parse(localStorage.getItem('univoAccounts') || '{}') || {}
    if (accounts[email]) {
      accounts[email].lastActiveAt = now
      localStorage.setItem('univoAccounts', JSON.stringify(accounts))
    }
  } catch {}
}

export function getUserLastActive(email) {
  if (!email) return null
  try {
    const saved = localStorage.getItem(`univoSocial:lastActive:${email}`)
    if (saved) return parseInt(saved, 10)
    const accounts = JSON.parse(localStorage.getItem('univoAccounts') || '{}') || {}
    if (accounts[email]?.lastActiveAt) return accounts[email].lastActiveAt
    if (accounts[email]?.createdAt) return accounts[email].createdAt
  } catch {}
  return null
}

export function formatLastActive(timestamp) {
  if (!timestamp) return '🟢 Active Now'
  const diffMs = Date.now() - timestamp
  const diffMin = Math.floor(diffMs / (1000 * 60))

  if (diffMin < 3) return '🟢 Active Now'
  if (diffMin < 60) return `🕒 Last active ${diffMin}m ago`

  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `🕒 Last active ${diffHours}h ago`

  const date = new Date(timestamp)
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  return `🕒 Last active on ${dateStr} at ${timeStr}`
}

// Global Campus Groups Registry Helper
export function readGlobalGroups() {
  return readSocial('all_groups', [])
}

export function saveGlobalGroup(group) {
  const all = readGlobalGroups()
  const idx = all.findIndex((g) => g.id === group.id)
  let updated
  if (idx >= 0) {
    updated = all.map((g) => (g.id === group.id ? group : g))
  } else {
    updated = [group, ...all]
  }
  writeSocial('all_groups', updated)
  return updated
}

// Join Request Workflow (User requests Leader approval)
export function requestToJoinGroup(group, requestingUser) {
  const leaderEmail = group.creatorEmail
  if (!leaderEmail) return null

  const key = `joinRequests:${leaderEmail}`
  const requests = readSocial(key, [])

  // Check if request already exists
  if (requests.some((r) => r.groupId === group.id && r.requesterEmail === requestingUser.email && r.status === 'pending')) {
    return null
  }

  const newRequest = {
    id: `jreq-${group.id}-${requestingUser.email}-${Date.now()}`,
    groupId: group.id,
    groupName: group.name,
    leaderEmail: group.creatorEmail,
    requesterEmail: requestingUser.email,
    requesterName: requestingUser.name || requestingUser.email.split('@')[0],
    status: 'pending',
    createdAt: Date.now()
  }

  writeSocial(key, [newRequest, ...requests])
  return newRequest
}

// Cancel Pending Join Request
export function cancelJoinRequest(groupId, requesterEmail, leaderEmail) {
  if (!leaderEmail) return
  const key = `joinRequests:${leaderEmail}`
  const requests = readSocial(key, [])
  const next = requests.filter((r) => !(r.groupId === groupId && r.requesterEmail === requesterEmail && r.status === 'pending'))
  writeSocial(key, next)
}

// Leader Approves or Rejects Join Request
export function respondToJoinRequest(request, accept) {
  const key = `joinRequests:${request.leaderEmail}`
  const requests = readSocial(key, [])
  const updatedRequests = requests.map((r) => r.id === request.id ? { ...r, status: accept ? 'accepted' : 'rejected' } : r)
  writeSocial(key, updatedRequests)

  if (accept) {
    // 1. Update global groups
    const globalGroups = readGlobalGroups()
    const targetGroup = globalGroups.find((g) => g.id === request.groupId)
    if (targetGroup) {
      const updatedMembers = Array.from(new Set([...(targetGroup.members || []), request.requesterName]))
      const updatedGroup = { ...targetGroup, members: updatedMembers }
      saveGlobalGroup(updatedGroup)

      // 2. Add to leader's groups
      const leaderKey = `groups:${request.leaderEmail}`
      const leaderGroups = readSocial(leaderKey, [])
      writeSocial(leaderKey, leaderGroups.map((g) => g.id === request.groupId ? updatedGroup : g))

      // 3. Add to requester's groups
      const requesterKey = `groups:${request.requesterEmail}`
      const requesterGroups = readSocial(requesterKey, [])
      if (!requesterGroups.some((g) => g.id === request.groupId)) {
        writeSocial(requesterKey, [updatedGroup, ...requesterGroups])
      }
    }
  }
}

// Group Chat Messages & PDF Attachments Helper
export function readGroupMessages(groupId) {
  return readSocial(`groupMsgs:${groupId}`, [
    {
      id: 'welcome-1',
      senderName: 'Univo Bot',
      senderEmail: 'bot@univo.edu',
      text: '🎉 Welcome to the group chat! Share notes, ask questions, and upload PDFs with your squad.',
      timestamp: 'Just now',
      attachment: null
    }
  ])
}

export function sendGroupMessage(groupId, messageObj) {
  const current = readGroupMessages(groupId)
  const newMessage = {
    id: `msg-${Date.now()}`,
    senderName: messageObj.senderName || 'Anonymous',
    senderEmail: messageObj.senderEmail,
    text: messageObj.text || '',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    attachment: messageObj.attachment || null
  }
  const next = [...current, newMessage]
  writeSocial(`groupMsgs:${groupId}`, next)
  window.dispatchEvent(new Event('univo-group-msg-sent'))
  return newMessage
}

// Internal helper to broadcast & log sent emails into local inbox/outbound storage
function logAndBroadcastEmail(emailRecord) {
  const recipientInbox = readSocial(`inbox:${emailRecord.toEmail}`)
  writeSocial(`inbox:${emailRecord.toEmail}`, [emailRecord, ...recipientInbox])

  if (emailRecord.fromEmail) {
    const senderOutbound = readSocial(`outbound:${emailRecord.fromEmail}`)
    writeSocial(`outbound:${emailRecord.fromEmail}`, [emailRecord, ...senderOutbound])
  }

  window.dispatchEvent(new CustomEvent('univo-email-sent', { detail: emailRecord }))
  return emailRecord
}

// 1. FRIEND REQUEST EMAIL NOTIFICATION
export function cancelFriendRequest(from, to) {
  if (!from?.email || !to?.email) return
  const requests = readSocial(`requests:${to.email}`)
  const next = requests.filter((item) => !(item.fromEmail === from.email && item.status === 'pending'))
  writeSocial(`requests:${to.email}`, next)
}

export function requestFriend(from, to) {
  const requests = readSocial(`requests:${to.email}`)
  if (requests.some((item) => item.fromEmail === from.email && item.status === 'pending')) return null

  const newRequest = { id: `${from.email}-${Date.now()}`, fromEmail: from.email, fromName: from.name || from.email.split('@')[0], fromAvatar: from.avatar, status: 'pending', createdAt: Date.now() }
  writeSocial(`requests:${to.email}`, [...requests, newRequest])

  const emailRecord = {
    id: `email-${Date.now()}`,
    toEmail: to.email,
    toName: to.name || to.email.split('@')[0],
    fromEmail: from.email,
    fromName: from.name || from.email.split('@')[0],
    subject: `👋 ${from.name || 'A classmate'} sent you a friend request on Univo!`,
    sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type: 'friend_request',
    htmlContent: generateFriendRequestEmailHTML({
      toName: to.name || to.email.split('@')[0],
      fromName: from.name || from.email.split('@')[0],
      fromEmail: from.email,
      acceptLink: `/dashboard/me/messenger`
    })
  }

  return logAndBroadcastEmail(emailRecord)
}

// 2. OTP VERIFICATION EMAIL
export function sendOTPEmail({ email, name, otp }) {
  const generatedOtp = otp || Math.floor(100000 + Math.random() * 900000).toString()
  const emailRecord = {
    id: `otp-${Date.now()}`,
    toEmail: email,
    toName: name || email.split('@')[0],
    fromEmail: 'security@univo.edu',
    fromName: 'Univo Security',
    subject: `🔒 ${generatedOtp} is your Univo verification code`,
    sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type: 'otp_verification',
    otp: generatedOtp,
    htmlContent: generateOTPEmailHTML({
      name: name || email.split('@')[0],
      email,
      otp: generatedOtp,
      expiresMinutes: 10
    })
  }

  return logAndBroadcastEmail(emailRecord)
}

// 3. PASSWORD RESET EMAIL
export function sendPasswordResetEmail({ email, name }) {
  const token = `rst_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`
  const resetLink = `${window.location.origin}/login?reset_token=${token}`

  const emailRecord = {
    id: `reset-${Date.now()}`,
    toEmail: email,
    toName: name || email.split('@')[0],
    fromEmail: 'accounts@univo.edu',
    fromName: 'Univo Accounts',
    subject: `🔐 Reset your Univo account password`,
    sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type: 'password_reset',
    token,
    resetLink,
    htmlContent: generatePasswordResetEmailHTML({
      name: name || email.split('@')[0],
      email,
      resetLink,
      token
    })
  }

  return logAndBroadcastEmail(emailRecord)
}

// 4. PRODUCT UPDATES / NEWSLETTER EMAIL
export function sendProductUpdateEmail({ email, name, updateTitle, releaseHighlights }) {
  const emailRecord = {
    id: `newsletter-${Date.now()}`,
    toEmail: email,
    toName: name || email.split('@')[0],
    fromEmail: 'releases@univo.edu',
    fromName: 'Univo Product Team',
    subject: `✨ ${updateTitle || 'Univo Release v2.4 — Major Feature Updates!'}`,
    sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type: 'product_update',
    htmlContent: generateProductUpdateEmailHTML({
      name: name || email.split('@')[0],
      updateTitle,
      version: 'v2.4',
      releaseHighlights
    })
  }

  return logAndBroadcastEmail(emailRecord)
}

export function areFriends(a, b) {
  return readSocial(`friends:${a?.email}`).some((email) => email === b?.email)
}

export function addFriend(a, b) {
  if (!areFriends(a, b)) writeSocial(`friends:${a.email}`, [...readSocial(`friends:${a.email}`), b.email])
  if (!areFriends(b, a)) writeSocial(`friends:${b.email}`, [...readSocial(`friends:${b.email}`), a.email])
  if (a?.email) pushUserDataToCloud(a.email)
  if (b?.email) pushUserDataToCloud(b.email)
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

    const nextCreatorGroups = creatorGroups.map((g) => g.id === invite.groupId ? newGroupState : g)
    if (!creatorGroups.some((g) => g.id === invite.groupId)) {
      nextCreatorGroups.push(newGroupState)
    }
    writeSocial(creatorKey, nextCreatorGroups)

    const recipientKey = `groups:${recipientEmail}`
    const recipientGroups = readSocial(recipientKey)
    if (!recipientGroups.some((g) => g.id === invite.groupId)) {
      writeSocial(recipientKey, [...recipientGroups, newGroupState])
    } else {
      writeSocial(recipientKey, recipientGroups.map((g) => g.id === invite.groupId ? newGroupState : g))
    }
  }
}

// 1-on-1 Direct Messaging Helpers
export function getDMPairKey(email1, email2) {
  return [email1, email2].sort().join('::')
}

export function readDMMessages(email1, email2) {
  if (!email1 || !email2) return []
  const pairKey = getDMPairKey(email1, email2)
  return readSocial(`dmMsgs:${pairKey}`, [
    {
      id: 'welcome-dm-1',
      senderEmail: 'system@univo.edu',
      senderName: 'Univo Direct Chat',
      text: '👋 You connected on Univo! Send messages, study notes, and PDF files directly.',
      timestamp: 'Just now',
      attachment: null
    }
  ])
}

export function addInAppNotification(recipientEmail, { title, body, kind = 'message', senderName }) {
  if (!recipientEmail) return
  const current = readSocial(`notifications:${recipientEmail}`, [])
  const newNotif = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    title,
    body,
    kind,
    senderName,
    createdAt: Date.now(),
    read: false
  }
  writeSocial(`notifications:${recipientEmail}`, [newNotif, ...current])
  window.dispatchEvent(new CustomEvent('univo-social-updated'))
  return newNotif
}

export function sendDMMessage(fromUser, toUserEmail, text, attachment) {
  if (!fromUser?.email || !toUserEmail) return null
  const pairKey = getDMPairKey(fromUser.email, toUserEmail)
  const current = readSocial(`dmMsgs:${pairKey}`, [])

  const senderName = fromUser.name || fromUser.email.split('@')[0]
  const newMessage = {
    id: `dm-${Date.now()}`,
    senderEmail: fromUser.email,
    senderName,
    toUserEmail,
    text: text ? text.trim() : '',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    attachment: attachment || null
  }

  const next = [...current, newMessage]
  writeSocial(`dmMsgs:${pairKey}`, next)
  window.dispatchEvent(new CustomEvent('univo-dm-sent', { detail: newMessage }))

  // Save notification for recipient
  addInAppNotification(toUserEmail, {
    title: `💬 ${senderName} sent you a message`,
    body: text ? `"${text.trim()}"` : 'Sent a file attachment',
    kind: 'message',
    senderName
  })

  // Simulate realistic incoming live message from friend after 2.5s for real-time testing
  const toUserAccount = (() => {
    try { return JSON.parse(localStorage.getItem('univoAccounts') || '{}')[toUserEmail] } catch { return null }
  })()
  const recipientName = toUserAccount?.name || toUserEmail.split('@')[0].replace(/[._]/g, ' ')

  setTimeout(() => {
    const replyText = `Hey ${fromUser.name?.split(' ')[0] || ''}! Got your message on Univo. Let's collaborate! 🚀`
    const replyMessage = {
      id: `dm-reply-${Date.now()}`,
      senderEmail: toUserEmail,
      senderName: recipientName,
      toUserEmail: fromUser.email,
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachment: null
    }

    const updated = readSocial(`dmMsgs:${pairKey}`, [])
    writeSocial(`dmMsgs:${pairKey}`, [...updated, replyMessage])

    // Save notification in Notification Bell for current user
    addInAppNotification(fromUser.email, {
      title: `💬 ${recipientName} sent you a message`,
      body: `"${replyText}"`,
      kind: 'message',
      senderName: recipientName
    })

    window.dispatchEvent(new CustomEvent('univo-dm-sent', { detail: replyMessage }))
    window.dispatchEvent(new CustomEvent('univo-live-message', { detail: replyMessage }))
    window.dispatchEvent(new CustomEvent('univo-social-updated'))
  }, 2500)

  return newMessage
}
