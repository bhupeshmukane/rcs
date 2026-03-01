import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoginForm from '../../components/forms/LoginForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const LoginPage = () => {
  const { isAuthenticated, loading } = useAuth();

  // Redirect if already authenticated
  if (loading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
  return role === 'student'
    ? <Navigate to="/student/dashboard" replace />
    : <Navigate to="/staff/dashboard" replace />;
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Railway Concession System
          </h1>
          <p className="text-lg text-gray-600">
            Sign in to access your account
          </p>
        </div>

        {/* Login Form */}
        <LoginForm />

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            For student login: Use your college ID and date of birth
          </p>
          <p className="text-sm text-gray-500 mt-1">
            For staff login: Use your registered email and password
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;