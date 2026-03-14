import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoginForm from '../../components/forms/LoginForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const LoginPage = () => {

  const { isAuthenticated, loading, role } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return role === "student"
      ? <Navigate to="/student/dashboard" replace />
      : <Navigate to="/staff/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex bg-slate-100">

      <div className="hidden lg:flex w-1/2 items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-teal-800 p-10 text-white">

        <div className="max-w-md">
          <p className="text-sm uppercase tracking-[0.2em] text-sky-100">Railway Concession</p>

          <h1 className="mb-6 mt-2 text-4xl font-black tracking-tight">
            Railway Concession System
          </h1>

          <p className="mb-6 text-lg text-sky-100">
            A digital platform for managing railway concession
            applications for students and staff.
          </p>

          <ul className="space-y-3 text-sm text-sky-100">
            <li>Online concession applications</li>
            <li>Real-time application tracking</li>
            <li>Secure OTP based student login</li>
            <li>Digital staff approval workflow</li>
          </ul>

        </div>

      </div>

      <div className="flex flex-1 items-center justify-center p-6">

        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

          <div className="mb-6 text-center">

            <h2 className="text-3xl font-black text-slate-900">
              Welcome Back
            </h2>

            <p className="mt-2 text-slate-600">
              Sign in to continue
            </p>

          </div>

          <LoginForm />

        </div>

      </div>

    </div>
  );
};

export default LoginPage;
