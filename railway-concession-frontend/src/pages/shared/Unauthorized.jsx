import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';

const Unauthorized = () => {
  const { logout, role } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm md:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl font-bold text-amber-700">403</div>

        <h2 className="mt-5 text-3xl font-black text-slate-900">Access Denied</h2>

        <p className="mt-3 text-slate-600">
          Sorry, you don't have permission to access this page. 
          {role && ` Your current role is: ${role.toUpperCase()}`}
        </p>

        <div className="mb-6 mt-8 space-y-3">
          <Button onClick={handleGoBack} variant="outline" className="w-full border-slate-400 text-slate-700 hover:bg-slate-100">
            Go Back
          </Button>

          <Link to={role === 'student' ? '/student/dashboard' : '/staff/dashboard'}>
            <Button className="w-full bg-slate-900 text-white hover:bg-slate-700">
              Go to {role === 'student' ? 'Student' : 'Staff'} Dashboard
            </Button>
          </Link>

          <Button onClick={handleLogout} variant="danger" className="w-full">
            Sign Out
          </Button>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="mb-2 text-sm font-medium text-amber-800">Role Information</h3>
          <p className="text-xs text-amber-700">
            {role === 'student' 
              ? 'Students can only access their own dashboard, applications, and profile.'
              : 'Staff members have access to manage all applications, students, and generate reports.'
            }
          </p>
        </div>

        <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50 p-3">
          <p className="text-xs text-slate-600">
            If you believe this is an error, please contact{' '}
            <a href="mailto:admin@railway-concession.com" className="text-sky-700 hover:underline">
              system administration
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;