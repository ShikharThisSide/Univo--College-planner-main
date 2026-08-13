import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import RoleGuard from './components/guards/RoleGuard'
import DashboardLayout from './components/layout/DashboardLayout'
import LandingPage, { PricingSection } from './pages/landing/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import IndividualStudentDashboard from './pages/dashboard/IndividualStudentDashboard'
import InstitutionalStudentDashboard from './pages/dashboard/InstitutionalStudentDashboard'
import TeacherDashboard from './pages/dashboard/TeacherDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import ModulePlaceholder from './pages/modules/ModulePlaceholder'
import ClassRepresentativePage from './pages/modules/ClassRepresentativePage'
import NotesHubPage from './pages/modules/NotesHubPage'
import FeaturesPage from './pages/features/FeaturesPage'
import StudentPlanPage from './pages/students/StudentPlanPage'
import MessengerPage from './pages/modules/MessengerPage'
import ChapterScrubber from './components/ui/ChapterScrubber'
import { ROLES } from './lib/constants'
import './app.css'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/pricing" element={<PricingSection />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/students" element={<StudentPlanPage />} />
            <Route path="/universities" element={<StudentPlanPage variant="university" />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Individual student routes */}
            <Route
              path="/dashboard/me"
              element={
                <RoleGuard allowedRoles={[ROLES.STUDENT_INDIVIDUAL]}>
                  <DashboardLayout />
                </RoleGuard>
              }
            >
              <Route index element={<IndividualStudentDashboard />} />
              <Route path="attendance" element={<ClassRepresentativePage />} />
              <Route path="assignments" element={<ModulePlaceholder />} />
              <Route path="notes" element={<NotesHubPage />} />
              <Route path="marketplace" element={<ModulePlaceholder />} />
              <Route path="forum" element={<ModulePlaceholder />} />
              <Route path="confessions" element={<ModulePlaceholder />} />
              <Route path="messenger" element={<MessengerPage />} />
            </Route>

            {/* Institutional student routes */}
            <Route
              path="/dashboard/student"
              element={
                <RoleGuard allowedRoles={[ROLES.STUDENT_INSTITUTIONAL]}>
                  <DashboardLayout />
                </RoleGuard>
              }
            >
              <Route index element={<InstitutionalStudentDashboard />} />
              <Route path="timetable" element={<ModulePlaceholder />} />
              <Route path="assignments" element={<ModulePlaceholder />} />
              <Route path="attendance" element={<ClassRepresentativePage />} />
              <Route path="notes" element={<NotesHubPage />} />
              <Route path="forum" element={<ModulePlaceholder />} />
              <Route path="messenger" element={<MessengerPage />} />
            </Route>

            {/* Teacher routes */}
            <Route
              path="/dashboard/teacher"
              element={
                <RoleGuard allowedRoles={[ROLES.TEACHER]}>
                  <DashboardLayout />
                </RoleGuard>
              }
            >
              <Route index element={<TeacherDashboard />} />
              <Route path="grading" element={<ModulePlaceholder />} />
              <Route path="assignments" element={<ModulePlaceholder />} />
              <Route path="attendance" element={<ModulePlaceholder />} />
              <Route path="notes" element={<ModulePlaceholder />} />
              <Route path="forum" element={<ModulePlaceholder />} />
            </Route>

            {/* Admin routes */}
            <Route
              path="/dashboard/admin"
              element={
                <RoleGuard allowedRoles={[ROLES.ADMIN]}>
                  <DashboardLayout />
                </RoleGuard>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="departments" element={<ModulePlaceholder />} />
              <Route path="teachers" element={<ModulePlaceholder />} />
              <Route path="students" element={<ModulePlaceholder />} />
              <Route path="notices" element={<ModulePlaceholder />} />
              <Route path="analytics" element={<ModulePlaceholder />} />
              <Route path="moderation" element={<ModulePlaceholder />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ChapterScrubber />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
