import { ROLES, ROLE_DASHBOARD_PATHS } from './constants'

export function getDashboardPath(role) {
  return ROLE_DASHBOARD_PATHS[role] || '/'
}

export function canAccessRoute(role, allowedRoles) {
  if (!allowedRoles?.length) return true
  return allowedRoles.includes(role)
}

export function inferRoleFromEmail(email, signupPath = 'student') {
  const normalized = email.trim().toLowerCase()

  if (normalized.startsWith('admin@')) return ROLES.ADMIN
  if (normalized.startsWith('teacher@') || normalized.startsWith('prof.')) return ROLES.TEACHER

  if (normalized.endsWith('@xyzuniversity.edu')) {
    return signupPath === 'university' ? ROLES.ADMIN : ROLES.STUDENT_INSTITUTIONAL
  }

  return ROLES.STUDENT_INDIVIDUAL
}

export function getRoleLabel(role) {
  const labels = {
    [ROLES.ADMIN]: 'University Admin',
    [ROLES.TEACHER]: 'Teacher',
    [ROLES.STUDENT_INSTITUTIONAL]: 'Institutional Student',
    [ROLES.STUDENT_INDIVIDUAL]: 'Individual Student',
  }
  return labels[role] || 'User'
}
