export const individualStudentData = {
  greeting: 'Good morning',
  name: 'Aarav',
  bunkableClasses: 2,
  attendance: [
    { subject: 'Data Structures', percent: 78, color: '#8b5cf6' },
    { subject: 'Operating Systems', percent: 92, color: '#f97316' },
    { subject: 'DBMS', percent: 65, color: '#14b8a6' },
    { subject: 'Math IV', percent: 88, color: '#3b82f6' },
  ],
  todaySchedule: [
    { time: '09:00', subject: 'Data Structures', room: 'Lab 204', status: 'upcoming' },
    { time: '11:00', subject: 'Operating Systems', room: 'Room 112', status: 'current' },
    { time: '14:00', subject: 'DBMS Tutorial', room: 'Room 305', status: 'later' },
    { time: '16:00', subject: 'Math IV', room: 'Room 108', status: 'later' },
  ],
  assignments: [
    { id: 1, title: 'Binary Search Tree Implementation', subject: 'Data Structures', due: 'Tomorrow', status: 'pending', priority: 'high' },
    { id: 2, title: 'Process Scheduling Report', subject: 'Operating Systems', due: 'In 3 days', status: 'in_progress', priority: 'medium' },
    { id: 3, title: 'ER Diagram — Library System', subject: 'DBMS', due: 'Next week', status: 'pending', priority: 'low' },
  ],
  notes: [
    { id: 1, title: 'OS — Deadlock Notes', author: 'You', updated: '2h ago', tags: ['OS', 'Midterm'] },
    { id: 2, title: 'DS Cheat Sheet', author: 'Community', updated: 'Yesterday', tags: ['DS', 'Quick ref'] },
  ],
  forumActivity: [
    { id: 1, title: 'How to approach graph problems?', replies: 12, unread: 3 },
    { id: 2, title: 'Best resources for OS prep', replies: 8, unread: 0 },
  ],
  streak: 14,
  completionRate: 72,
}

export const institutionalStudentData = {
  greeting: 'Good afternoon',
  name: 'Priya',
  university: 'XYZ University',
  department: 'Computer Science',
  semester: 4,
  bunkableClasses: 1,
  attendance: [
    { subject: 'Machine Learning', percent: 85 },
    { subject: 'Computer Networks', percent: 91 },
    { subject: 'Software Engineering', percent: 76 },
  ],
  todaySchedule: [
    { time: '10:00', subject: 'Machine Learning', room: 'AI Lab', teacher: 'Dr. Singh' },
    { time: '13:00', subject: 'Computer Networks', room: 'Room 401', teacher: 'Prof. Nair' },
  ],
  pendingAssignments: 4,
  gradedAssignments: 12,
}

export const teacherData = {
  greeting: 'Good morning',
  name: 'Dr. Raj Kumar',
  department: 'Computer Science',
  gradingQueue: [
    { id: 1, student: 'Ananya R.', assignment: 'BST Implementation', submitted: '2h ago', urgent: true },
    { id: 2, student: 'Rohan K.', assignment: 'BST Implementation', submitted: '5h ago', urgent: false },
    { id: 3, student: 'Sneha P.', assignment: 'Graph Algorithms', submitted: 'Yesterday', urgent: false },
    { id: 4, student: 'Vikram S.', assignment: 'Graph Algorithms', submitted: 'Yesterday', urgent: false },
  ],
  classesToday: [
    { time: '09:00', subject: 'Data Structures', section: 'CSE-A', room: 'Lab 204' },
    { time: '14:00', subject: 'Advanced Algorithms', section: 'CSE-B', room: 'Room 112' },
  ],
  openDoubts: 7,
  pendingUploads: 2,
  stats: { students: 156, avgGrade: 78, attendance: 84 },
}

export const adminData = {
  greeting: 'Good evening',
  name: 'Neha Kapoor',
  university: 'XYZ University',
  stats: {
    totalStudents: 2847,
    totalTeachers: 142,
    departments: 12,
    activeToday: 1923,
    engagement: 78,
    pendingApprovals: 23,
  },
  departmentStats: [
    { name: 'Computer Science', students: 420, teachers: 18, engagement: 92 },
    { name: 'Electronics', students: 380, teachers: 15, engagement: 78 },
    { name: 'Mechanical', students: 510, teachers: 22, engagement: 71 },
    { name: 'Business', students: 340, teachers: 14, engagement: 85 },
  ],
  recentNotices: [
    { id: 1, title: 'Mid-semester exam schedule released', date: 'Today', views: 1240 },
    { id: 2, title: 'Library extended hours during exams', date: 'Yesterday', views: 890 },
  ],
  moderationQueue: 5,
}

export const notifications = [
  { id: 1, title: 'New reply on your doubt', body: 'How to approach graph problems?', time: '5m ago', unread: true },
  { id: 2, title: 'Assignment reminder', body: 'BST Implementation due tomorrow', time: '1h ago', unread: true },
  { id: 3, title: 'Note shared with you', body: 'OS — Deadlock Notes', time: '3h ago', unread: false },
  { id: 4, title: 'Marketplace listing sold', body: 'Your DBMS notes found a buyer!', time: 'Yesterday', unread: false },
]

export const commandPaletteItems = [
  { id: 'home', label: 'Go to Dashboard', path: '/dashboard/me', category: 'Navigation' },
  { id: 'notes', label: 'Notes Hub', path: '/dashboard/me/notes', category: 'Navigation' },
  { id: 'forum', label: 'Forum', path: '/dashboard/me/forum', category: 'Navigation' },
  { id: 'messenger', label: 'Messenger', path: '/dashboard/me/messenger', category: 'Navigation' },
  { id: 'assignments', label: 'Assignments', path: '/dashboard/me/assignments', category: 'Navigation' },
  { id: 'attendance', label: 'Attendance', path: '/dashboard/me/attendance', category: 'Navigation' },
  { id: 'marketplace', label: 'Marketplace', path: '/dashboard/me/marketplace', category: 'Navigation' },
  { id: 'settings', label: 'Theme Settings', action: 'theme', category: 'Settings' },
  { id: 'profile', label: 'Edit Profile', action: 'profile', category: 'Settings' },
]

export const messengerPreview = [
  { id: 1, name: 'Siddharth', message: 'Did you finish the OS assignment?', time: '2m', unread: 2 },
  { id: 2, name: 'Study Group — CSE', message: 'Meeting at 6 PM in library', time: '15m', unread: 5 },
  { id: 3, name: 'Ananya', message: 'Thanks for the notes!', time: '1h', unread: 0 },
]
