import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Header from './components/layout/Header';
import LoginPage from './pages/auth/LoginPage';
import StudentDashboard from './pages/student/StudentDashboard';
import ApplicationHistory from './pages/student/ApplicationHistory';
import ProfilePage from './pages/student/ProfilePage';
import StaffDashboard from './pages/staff/StaffDashboard';
import ApplicationsPage from './pages/staff/ApplicationsPage';
import StudentsPage from './pages/staff/StudentsPage';
import ReportsPage from './pages/staff/ReportsPage';
import NotFound from './pages/shared/NotFound';
import Unauthorized from './pages/shared/Unauthorized';
import VerifyOtp from './components/auth/VerifyOtp';
import './styles/global.css';

// Layout wrapper for student routes
const StudentLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="p-4">
        {children}
      </main>
    </div>
  );
};

<Route path="/verify-otp" element={<VerifyOtp />} />

// Layout wrapper for staff routes
const StaffLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="p-6">
        {children}
      </main>
    </div>
  );
};

// Route component to redirect based on role
const RoleBasedRedirect = () => {
  const { isStudent, isStaff } = useAuth();
  
  if (isStudent) return <Navigate to="/student/dashboard" replace />;
  if (isStaff) return <Navigate to="/staff/dashboard" replace />;
  
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Student routes */}
            <Route path="/student/dashboard" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentLayout>
                  <StudentDashboard />
                </StudentLayout>
              </ProtectedRoute>
            } />
            <Route path="/student/applications" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentLayout>
                  <ApplicationHistory />
                </StudentLayout>
              </ProtectedRoute>
            } />
            <Route path="/student/profile" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentLayout>
                  <ProfilePage />
                </StudentLayout>
              </ProtectedRoute>
            } />
            
            {/* Staff routes */}
            <Route path="/staff/dashboard" element={
              <ProtectedRoute allowedRoles={['staff']}>
                <StaffLayout>
                  <StaffDashboard />
                </StaffLayout>
              </ProtectedRoute>
            } />
            <Route path="/staff/applications" element={
              <ProtectedRoute allowedRoles={['staff']}>
                <StaffLayout>
                  <ApplicationsPage />
                </StaffLayout>
              </ProtectedRoute>
            } />
            <Route path="/staff/students" element={
              <ProtectedRoute allowedRoles={['staff']}>
                <StaffLayout>
                  <StudentsPage />
                </StaffLayout>
              </ProtectedRoute>
            } />
            <Route path="/staff/reports" element={
              <ProtectedRoute allowedRoles={['staff']}>
                <StaffLayout>
                  <ReportsPage />
                </StaffLayout>
              </ProtectedRoute>
            } />
            
            {/* Default redirect */}
            <Route path="/" element={<RoleBasedRedirect />} />
            
            {/* Catch all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;