import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import ErrorMessage from '../common/ErrorMessage';
import SuccessMessage from '../common/SuccessMessage';
import Button from '../ui/Button';

const LoginForm = () => {
  const [activeTab, setActiveTab] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login } = useAuth();

  // Student form state
  const [studentForm, setStudentForm] = useState({
    studentId: '',
    dob: ''
  });

  // Staff form state
  const [staffForm, setStaffForm] = useState({
    email: '',
    password: ''
  });

  const handleStudentChange = (e) => {
    setStudentForm({
      ...studentForm,
      [e.target.name]: e.target.value
    });
  };

  const handleStaffChange = (e) => {
    setStaffForm({
      ...staffForm,
      [e.target.name]: e.target.value
    });
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authService.requestStudentOtp(studentForm.studentId, studentForm.dob);
      
      setSuccess('Otp Sent to your registered email...');
      setTimeout(() => {
        window.location.href = `/verify-otp?studentId=${studentForm.studentId}`;
}, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authService.staffLogin(staffForm.email, staffForm.password);
      login(response.staff, 'staff');
      setSuccess('Login successful! Redirecting...');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex border-b mb-4">
        <button
          type="button"
          className={`flex-1 py-2 px-4 font-medium text-center ${
            activeTab === 'student'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('student')}
        >
          Student Login
        </button>
        <button
          type="button"
          className={`flex-1 py-2 px-4 font-medium text-center ${
            activeTab === 'staff'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('staff')}
        >
          Staff Login
        </button>
      </div>

      {error && <ErrorMessage message={error} />}
      {success && <SuccessMessage message={success} />}

      {activeTab === 'student' ? (
        <form onSubmit={handleStudentSubmit} className="space-y-4">
          <div>
            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
              Student ID
            </label>
            <input
              type="text"
              id="studentId"
              name="studentId"
              value={studentForm.studentId}
              onChange={handleStudentChange}
              placeholder="e.g., TU4F2222016"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              id="dob"
              name="dob"
              value={studentForm.dob}
              onChange={handleStudentChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In as Student'}
          </Button>

          <p className="text-sm text-gray-600 text-center mt-4">
            Use your college ID and date of birth to login
          </p>
        </form>
      ) : (
        <form onSubmit={handleStaffSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={staffForm.email}
              onChange={handleStaffChange}
              placeholder="Enter your email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={staffForm.password}
              onChange={handleStaffChange}
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In as Staff'}
          </Button>
        </form>
      )}
    </div>
  );
};

export default LoginForm;