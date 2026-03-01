import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import ErrorMessage from '../../components/common/ErrorMessage';
import SuccessMessage from '../../components/common/SuccessMessage';
import Button from '../../components/ui/Button';

const VerifyOtp = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const studentId = searchParams.get('studentId');

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authService.verifyStudentOtp(studentId, otp);

      // Backend should return student + role
      login(response.student, 'student');

      setSuccess('Login successful! Redirecting...');
      setTimeout(() => navigate('/student/dashboard'), 1000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!studentId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Invalid access. Please login again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">

        <h2 className="text-2xl font-bold text-center mb-6">
          Verify OTP
        </h2>

        <p className="text-sm text-gray-600 text-center mb-4">
          Enter the OTP sent to your registered email
        </p>

        {error && <ErrorMessage message={error} />}
        {success && <SuccessMessage message={success} />}

        <form onSubmit={handleVerify} className="space-y-4">

          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit OTP"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            required
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </Button>

        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;