import {
  generateOTPEmailHTML,
  generatePasswordResetEmailHTML,
  generateFriendRequestEmailHTML,
  generateProductUpdateEmailHTML
} from './emailTemplates'

export function readSocial(key, fallback = []) {
  try { return JSON.parse(localStorage.getItem(`univoSocial:${key}`)) || fallback } catch { return fallback }
}

export function writeSocial(key, value) {
  localStorage.setItem(`univoSocial:${key}`, JSON.stringify(value))
  window.dispatchEvent(new Event('univo-social-updated'))
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
