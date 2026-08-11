export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT_INSTITUTIONAL: 'student_institutional',
  STUDENT_INDIVIDUAL: 'student_individual',
}

export const ACCENT_PALETTES = [
  { id: 'forest-lime', label: 'Forest Lime', from: '#c4f04d', to: '#8ab729' },
  { id: 'nova-purple', label: 'Nova Purple', from: '#9657e8', to: '#f47b3a' },
  { id: 'coral-ember', label: 'Coral Ember', from: '#f97316', to: '#ef4444' },
  { id: 'deep-teal', label: 'Deep Teal', from: '#14b8a6', to: '#06b6d4' },
  { id: 'electric-blue', label: 'Electric Blue', from: '#3b82f6', to: '#8b5cf6' },
]

export const ROLE_DASHBOARD_PATHS = {
  [ROLES.ADMIN]: '/dashboard/admin',
  [ROLES.TEACHER]: '/dashboard/teacher',
  [ROLES.STUDENT_INSTITUTIONAL]: '/dashboard/student',
  [ROLES.STUDENT_INDIVIDUAL]: '/dashboard/me',
}

export const NAV_BY_ROLE = {
  [ROLES.STUDENT_INDIVIDUAL]: [
    { id: 'home', label: 'Home', path: '/dashboard/me', icon: 'Home' },
    { id: 'attendance', label: 'Class Representative', path: '/dashboard/me/attendance', icon: 'CalendarCheck' },
    { id: 'assignments', label: 'Assignments', path: '/dashboard/me/assignments', icon: 'ClipboardList' },
    { id: 'notes', label: 'Notes Hub', path: '/dashboard/me/notes', icon: 'BookOpen' },
    { id: 'marketplace', label: 'Marketplace', path: '/dashboard/me/marketplace', icon: 'Store' },
    { id: 'forum', label: 'Forum', path: '/dashboard/me/forum', icon: 'MessagesSquare' },
    { id: 'confessions', label: 'Confessions', path: '/dashboard/me/confessions', icon: 'Ghost' },
    { id: 'messenger', label: 'Messenger', path: '/dashboard/me/messenger', icon: 'MessageCircle' },
  ],
  [ROLES.STUDENT_INSTITUTIONAL]: [
    { id: 'home', label: 'Home', path: '/dashboard/student', icon: 'Home' },
    { id: 'timetable', label: 'Timetable', path: '/dashboard/student/timetable', icon: 'Calendar' },
    { id: 'assignments', label: 'Assignments', path: '/dashboard/student/assignments', icon: 'ClipboardList' },
    { id: 'attendance', label: 'Class Representative', path: '/dashboard/student/attendance', icon: 'CalendarCheck' },
    { id: 'notes', label: 'Notes Hub', path: '/dashboard/student/notes', icon: 'BookOpen' },
    { id: 'forum', label: 'Forum', path: '/dashboard/student/forum', icon: 'MessagesSquare' },
    { id: 'messenger', label: 'Messenger', path: '/dashboard/student/messenger', icon: 'MessageCircle' },
  ],
  [ROLES.TEACHER]: [
    { id: 'home', label: 'Home', path: '/dashboard/teacher', icon: 'Home' },
    { id: 'grading', label: 'Grading Queue', path: '/dashboard/teacher/grading', icon: 'Inbox' },
    { id: 'assignments', label: 'Assignments', path: '/dashboard/teacher/assignments', icon: 'ClipboardList' },
    { id: 'attendance', label: 'Attendance', path: '/dashboard/teacher/attendance', icon: 'CalendarCheck' },
    { id: 'notes', label: 'Upload Notes', path: '/dashboard/teacher/notes', icon: 'Upload' },
    { id: 'forum', label: 'Doubts', path: '/dashboard/teacher/forum', icon: 'MessagesSquare' },
  ],
  [ROLES.ADMIN]: [
    { id: 'home', label: 'Command Center', path: '/dashboard/admin', icon: 'LayoutDashboard' },
    { id: 'departments', label: 'Departments', path: '/dashboard/admin/departments', icon: 'Building2' },
    { id: 'teachers', label: 'Teachers', path: '/dashboard/admin/teachers', icon: 'GraduationCap' },
    { id: 'students', label: 'Students', path: '/dashboard/admin/students', icon: 'Users' },
    { id: 'notices', label: 'Notices', path: '/dashboard/admin/notices', icon: 'Megaphone' },
    { id: 'analytics', label: 'Analytics', path: '/dashboard/admin/analytics', icon: 'BarChart3' },
    { id: 'moderation', label: 'Moderation', path: '/dashboard/admin/moderation', icon: 'Shield' },
  ],
}

export const DEMO_USERS = {
  individual: {
    email: 'aarav@personal.com',
    name: 'Aarav Sharma',
    role: ROLES.STUDENT_INDIVIDUAL,
    universityId: null,
  },
  institutional: {
    email: 'priya@xyzuniversity.edu',
    name: 'Priya Mehta',
    role: ROLES.STUDENT_INSTITUTIONAL,
    universityId: 'xyz-univ',
    department: 'Computer Science',
  },
  teacher: {
    email: 'prof.kumar@xyzuniversity.edu',
    name: 'Dr. Raj Kumar',
    role: ROLES.TEACHER,
    universityId: 'xyz-univ',
    department: 'Computer Science',
  },
  admin: {
    email: 'admin@xyzuniversity.edu',
    name: 'Neha Kapoor',
    role: ROLES.ADMIN,
    universityId: 'xyz-univ',
  },
}
