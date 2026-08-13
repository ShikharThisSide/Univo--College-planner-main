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
  return readSocial(`friends:${a.email}`).some((email) => email === b.email)
}

export function addFriend(a, b) {
  if (!areFriends(a, b)) writeSocial(`friends:${a.email}`, [...readSocial(`friends:${a.email}`), b.email])
  if (!areFriends(b, a)) writeSocial(`friends:${b.email}`, [...readSocial(`friends:${b.email}`), a.email])
}
