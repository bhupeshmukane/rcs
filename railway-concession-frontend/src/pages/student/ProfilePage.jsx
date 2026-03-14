import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import studentService from '../../services/studentService';
import ErrorMessage from '../../components/common/ErrorMessage';
import SuccessMessage from '../../components/common/SuccessMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const ProfilePage = () => {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await studentService.getStudentById(user.id);
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (updatedData) => {
    try {
      setUpdating(true);
      setError('');
      const response = await studentService.updateStudent(user.id, updatedData);
      setProfile(response);
      setSuccess('Profile updated successfully!');
      setIsEditModalOpen(false);
      
      // Update auth context with new data
      login(response, 'student');
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return <LoadingSpinner text="Loading profile..." />;
  if (error) return <ErrorMessage message={error} />;

  const totalApplications = profile?.applications?.length || 0;
  const approvedCount = profile?.applications?.filter(app => app.status === 'APPROVED').length || 0;
  const pendingCount = profile?.applications?.filter(app => app.status === 'PENDING').length || 0;
  const rejectedCount = profile?.applications?.filter(app => app.status === 'REJECTED').length || 0;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-gradient-to-r from-slate-900 via-blue-900 to-teal-700 p-6 text-white shadow-xl md:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-sky-100">Student Profile</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">My Profile</h1>
            <p className="mt-2 max-w-xl text-sm text-sky-100 md:text-base">
              Keep your details up to date and monitor your application activity from one page.
            </p>
          </div>
          <Button
            variant="light"
            className="w-full px-5 py-2.5 md:w-auto"
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit Profile
          </Button>
        </div>
      </section>

      {success && <SuccessMessage message={success} onDismiss={() => setSuccess('')} />}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Applications</p>
          <p className="mt-3 text-3xl font-black text-amber-500">{totalApplications}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Approved</p>
          <p className="mt-3 text-3xl font-black text-emerald-600">{approvedCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending</p>
          <p className="mt-3 text-3xl font-black text-amber-600">{pendingCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rejected</p>
          <p className="mt-3 text-3xl font-black text-rose-600">{rejectedCount}</p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Personal Information" className="h-fit rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Student ID</p>
                <p className="font-medium text-slate-900">{profile?.id}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-slate-500">Full Name</p>
              <p className="font-medium text-slate-900">{profile?.name}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Email Address</p>
              <p className="font-medium text-slate-900">{profile?.email}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Date of Birth</p>
              <p className="font-medium text-slate-900">{formatDate(profile?.dob)}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Category</p>
              <p className="font-medium text-slate-900">{profile?.category || 'Not specified'}</p>
            </div>
          </div>
        </Card>

        <Card title="Application Statistics" className="h-fit rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="rounded-xl border border-sky-100 bg-sky-50 p-4">
                <p className="text-2xl font-bold text-amber-500">{totalApplications}</p>
                <p className="text-sm text-slate-600">Total Applications</p>
              </div>
              
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-2xl font-bold text-emerald-700">{approvedCount}</p>
                <p className="text-sm text-slate-600">Approved</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
                <p className="text-sm text-slate-600">Pending</p>
              </div>
              
              <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">
                <p className="text-2xl font-bold text-rose-700">{rejectedCount}</p>
                <p className="text-sm text-slate-600">Rejected</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {profile?.applications && profile.applications.length > 0 && (
        <Card title="Recent Applications" className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="border-b border-slate-200 px-3 py-3 text-xs uppercase tracking-wide text-slate-500">ID</th>
                  <th className="border-b border-slate-200 px-3 py-3 text-xs uppercase tracking-wide text-slate-500">Route</th>
                  <th className="border-b border-slate-200 px-3 py-3 text-xs uppercase tracking-wide text-slate-500">Status</th>
                  <th className="border-b border-slate-200 px-3 py-3 text-xs uppercase tracking-wide text-slate-500">Applied Date</th>
                </tr>
              </thead>
              <tbody>
                {profile.applications.slice(0, 5).map((app) => (
                  <tr key={app.appId} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-3 py-3 font-medium text-slate-800">#{app.appId}</td>
                    <td className="px-3 py-3 text-slate-700">{app.routeFrom} {'->'} {app.routeTo}</td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        app.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-700">
                      {new Date(app.applicationDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {profile.applications.length > 5 && (
            <div className="mt-4 text-center">
              <Button variant="outline" className="border-slate-400 text-slate-700 hover:bg-slate-100" onClick={() => window.location.href = '/student/applications'}>
                View All Applications
              </Button>
            </div>
          )}
        </Card>
      )}

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
        size="md"
      >
        <EditProfileForm
          profile={profile}
          onUpdate={handleUpdateProfile}
          onCancel={() => setIsEditModalOpen(false)}
          loading={updating}
        />
      </Modal>
    </div>
  );
};

// Edit Profile Form Component
const EditProfileForm = ({ profile, onUpdate, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    category: profile?.category || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const categories = ['GENERAL', 'SC', 'ST', 'OBC', 'OTHER'];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="flex space-x-3 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Profile'}
        </Button>
      </div>
    </form>
  );
};

export default ProfilePage;
