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
    { id: 'timetable', label: 'College Timetable', path: '/dashboard/me/timetable', icon: 'Clock' },
    { id: 'attendance-tracker', label: 'Attendance Tracker', path: '/dashboard/me/attendance-tracker', icon: 'Percent' },
    { id: 'attendance', label: 'Class Representative', path: '/dashboard/me/attendance', icon: 'CalendarCheck' },
    { id: 'assignments', label: 'Tasks', path: '/dashboard/me/assignments', icon: 'ClipboardList' },
    { id: 'expenses', label: 'Expense Tracker', path: '/dashboard/me/expenses', icon: 'Wallet' },
    { id: 'notes', label: 'Notes Hub', path: '/dashboard/me/notes', icon: 'BookOpen' },
    { id: 'journal', label: 'Journal', path: '/dashboard/me/journal', icon: 'BookHeart' },
    { id: 'groups', label: 'Groups', path: '/dashboard/me/groups', icon: 'UsersRound' },
    { id: 'messenger', label: 'Messenger', path: '/dashboard/me/messenger', icon: 'MessageCircle' },
  ],
  [ROLES.STUDENT_INSTITUTIONAL]: [
    { id: 'home', label: 'Home', path: '/dashboard/student', icon: 'Home' },
    { id: 'timetable', label: 'College Timetable', path: '/dashboard/student/timetable', icon: 'Clock' },
    { id: 'attendance-tracker', label: 'Attendance Tracker', path: '/dashboard/student/attendance-tracker', icon: 'Percent' },
    { id: 'assignments', label: 'Tasks', path: '/dashboard/student/assignments', icon: 'ClipboardList' },
    { id: 'expenses', label: 'Expense Tracker', path: '/dashboard/student/expenses', icon: 'Wallet' },
    { id: 'notes', label: 'Notes Hub', path: '/dashboard/student/notes', icon: 'BookOpen' },
    { id: 'groups', label: 'Groups', path: '/dashboard/student/groups', icon: 'UsersRound' },
    { id: 'attendance', label: 'Class Representative', path: '/dashboard/student/attendance', icon: 'CalendarCheck' },
    { id: 'messenger', label: 'Messenger', path: '/dashboard/student/messenger', icon: 'MessageCircle' },
    { id: 'forum', label: 'Forum', path: '/dashboard/student/forum', icon: 'MessagesSquare' },
  ],
  [ROLES.TEACHER]: [
    { id: 'home', label: 'Home', path: '/dashboard/teacher', icon: 'Home' },
    { id: 'classes', label: 'My Classes', path: '/dashboard/teacher/classes', icon: 'UsersRound' },
    { id: 'assignments', label: 'Assignments', path: '/dashboard/teacher/assignments', icon: 'ClipboardList' },
    { id: 'broadcast', label: 'Broadcast', path: '/dashboard/teacher/broadcast', icon: 'Megaphone' },
    { id: 'resources', label: 'Resources / PDFs', path: '/dashboard/teacher/resources', icon: 'FileText' },
    { id: 'groups', label: 'Groups', path: '/dashboard/teacher/groups', icon: 'UsersRound' },
    { id: 'messenger', label: 'Messenger', path: '/dashboard/teacher/messenger', icon: 'MessageCircle' },
  ],
  [ROLES.ADMIN]: [
    { id: 'home', label: 'Overview', path: '/dashboard/admin', icon: 'LayoutDashboard' },
    { id: 'teachers', label: 'Teachers', path: '/dashboard/admin/teachers', icon: 'GraduationCap' },
    { id: 'students', label: 'Students', path: '/dashboard/admin/students', icon: 'Users' },
    { id: 'classes', label: 'Classes & Courses', path: '/dashboard/admin/classes', icon: 'Building2' },
    { id: 'credentials', label: 'Credentials', path: '/dashboard/admin/credentials', icon: 'KeyRound' },
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
