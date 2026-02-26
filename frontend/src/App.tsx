import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import Landing from '@/pages/Landing';
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import VerifyEmail from '@/pages/auth/VerifyEmail';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StudentDashboard from '@/pages/dashboard/StudentDashboard';
import FacultyDashboard from '@/pages/dashboard/FacultyDashboard';
import AdminDashboard from '@/pages/dashboard/AdminDashboard';
import ChatPage from '@/pages/dashboard/ChatPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  if (!token) return <Navigate to="/auth/login" replace />;
  return <>{children}</>;
}

function DashboardHome() {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/auth/login" replace />;
  switch (user.role) {
    case 'admin': return <AdminDashboard />;
    case 'faculty': return <FacultyDashboard />;
    default: return <StudentDashboard />;
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="dark">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/verify-email" element={<VerifyEmail />} />

          {/* Protected Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="courses" element={<StudentDashboard />} />
            <Route path="documents" element={<FacultyDashboard />} />
            <Route path="upload" element={<FacultyDashboard />} />
            <Route path="users" element={<AdminDashboard />} />
            <Route path="audit" element={<AdminDashboard />} />
            <Route path="settings" element={<AdminDashboard />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
