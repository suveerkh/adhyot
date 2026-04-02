import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import AdminDashboard from './pages/AdminDashboard'
import CourseBuilder from './pages/CourseBuilder'
import CourseCatalogue from './pages/CourseCatalogue'
import CourseDetail from './pages/CourseDetail'
import CoursePage from './pages/CoursePage'
import StudentDashboard from './pages/StudentDashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/courses" element={<CourseCatalogue />} />
        <Route path="/courses/:courseId" element={<CourseDetail />} />
        <Route path="/learn/:courseId" element={
          <ProtectedRoute>
            <CoursePage />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/course/:courseId" element={
          <ProtectedRoute requiredRole="admin">
            <CourseBuilder />
          </ProtectedRoute>
        } />
        <Route path="/admin/preview/:courseId" element={
          <ProtectedRoute requiredRole="admin">
            <CoursePage />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App