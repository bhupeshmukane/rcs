import React, { useState, useEffect } from 'react';
import studentService from '../../services/studentService';
import authService from '../../services/authService';
import ErrorMessage from '../common/ErrorMessage';
import SuccessMessage from '../common/SuccessMessage';
import Button from '../ui/Button';
import LoadingSpinner from '../common/LoadingSpinner';

const StudentForm = ({ onSuccess, editData, isRegistration = false }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    dob: '',
    category: ''
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        id: editData.id || '',
        name: editData.name || '',
        email: editData.email || '',
        dob: editData.dob ? new Date(editData.dob).toISOString().split('T')[0] : '',
        category: editData.category || ''
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let response;
      
      if (isRegistration) {
        // For registration
        response = await authService.studentRegister(formData);
      } else if (editData) {
        // For updating existing student
        response = await studentService.updateStudent(formData.id, formData);
      }

      setSuccess(isRegistration ? 'Registration successful!' : 'Student updated successfully!');
      
      if (onSuccess) {
        onSuccess(response);
      }

      // Clear form if it's registration
      if (isRegistration) {
        setFormData({
          id: '',
          name: '',
          email: '',
          dob: '',
          category: ''
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['GENERAL', 'SC', 'ST', 'OBC', 'OTHER'];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-2xl font-black text-slate-900">
          {isRegistration ? 'Student Registration' : editData ? 'Edit Student' : 'Add New Student'}
        </h2>

        {error && (
          <ErrorMessage message={error} className="mb-4" />
        )}
        {success && (
          <SuccessMessage message={success} className="mb-4" />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student ID */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Student ID *
            </label>
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleChange}
              placeholder="e.g., TU4F2222016"
              required
              disabled={!!editData} // Disable editing ID for existing students
              className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:bg-slate-100 disabled:text-slate-600"
            />
          </div>

          {/* Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Date of Birth *
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3"
          >
            {loading ? (
              <LoadingSpinner size="sm" text={isRegistration ? 'Registering...' : 'Saving...'} />
            ) : (
              isRegistration ? 'Register' : 'Save Changes'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;