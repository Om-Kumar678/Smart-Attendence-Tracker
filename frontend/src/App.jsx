import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import { LoadingSpinner } from './components/UI.jsx';

const LoginPage = lazy(() => import('./pages/auth/LoginPage.jsx'));
const UnauthorizedPage = lazy(() => import('./pages/UnauthorizedPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const ManagementPage = lazy(() => import('./pages/admin/ManagementPage.jsx'));
const ReportsPage = lazy(() => import('./pages/admin/ReportsPage.jsx'));
const TeacherDashboard = lazy(() => import('./pages/teacher/TeacherDashboard.jsx'));
const TakeAttendancePage = lazy(() => import('./pages/teacher/TakeAttendancePage.jsx'));
const TeacherHistoryPage = lazy(() => import('./pages/teacher/TeacherHistoryPage.jsx'));
const StudentPerformancePage = lazy(() => import('./pages/teacher/StudentPerformancePage.jsx'));
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard.jsx'));
const StudentAttendancePage = lazy(() => import('./pages/student/StudentAttendancePage.jsx'));
const StudentProfilePage = lazy(() => import('./pages/student/StudentProfilePage.jsx'));

const adminRoutes = [
  ['/admin/dashboard', <AdminDashboard />],
  ['/admin/students', <ManagementPage kind="students" />],
  ['/admin/teachers', <ManagementPage kind="teachers" />],
  ['/admin/classes', <ManagementPage kind="classes" />],
  ['/admin/subjects', <ManagementPage kind="subjects" />],
  ['/admin/reports', <ReportsPage />],
];
const teacherRoutes = [
  ['/teacher/dashboard', <TeacherDashboard />],
  ['/teacher/classes', <ManagementPage kind="classes" audience="teacher" />],
  ['/teacher/attendance/take', <TakeAttendancePage />],
  ['/teacher/attendance/history', <TeacherHistoryPage />],
  ['/teacher/students', <StudentPerformancePage />],
];
const studentRoutes = [
  ['/student/dashboard', <StudentDashboard />],
  ['/student/attendance', <StudentAttendancePage />],
  ['/student/profile', <StudentProfilePage />],
];

function guardedRoutes(entries, role) {
  return entries.map(([path, element]) => (
    <Route key={path} path={path} element={<ProtectedRoute roles={[role]}><DashboardLayout>{element}</DashboardLayout></ProtectedRoute>} />
  ));
}

export default function App() {
  return (
    <Suspense fallback={<div className="route-loading"><LoadingSpinner /></div>}><Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      {guardedRoutes(adminRoutes, 'admin')}
      {guardedRoutes(teacherRoutes, 'teacher')}
      {guardedRoutes(studentRoutes, 'student')}
      <Route path="*" element={<NotFoundPage />} />
    </Routes></Suspense>
  );
}
