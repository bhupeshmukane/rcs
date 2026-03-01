import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import applicationService from '../../services/applicationService';
import ErrorMessage from '../../components/common/ErrorMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const StudentDashboard = () => {
  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [hasPending, setHasPending] = useState(false);
  const [activeConcession, setActiveConcession] = useState(null);
  const [remainingDays, setRemainingDays] = useState(null);
  const [eligibilityMessage, setEligibilityMessage] = useState('');

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);

      const apps =
        await applicationService.getApplicationsByStudentId(user.id);

      setApplications(apps);

      // 🔹 Check Pending
      const pending = apps.find(app => app.status === 'PENDING');
      if (pending) {
        setHasPending(true);
        setEligibilityMessage('You already have a pending application.');
      }

      // 🔹 Check Active Approved
      const approved = apps.find(app => app.status === 'APPROVED');

      if (approved && approved.validUntil) {

        const today = new Date();
        const validUntil = new Date(approved.validUntil);

        const diffTime = validUntil - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
          setActiveConcession(approved);
          setRemainingDays(diffDays);
          setEligibilityMessage(
            `Concession active until ${validUntil.toLocaleDateString()}`
          );
        }
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const canApply = !hasPending && !activeConcession;

  const getStatusBadge = (status) => {
    const statusClasses = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status]}`}>
        {status}
      </span>
    );
  };

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">

      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user.name}!
        </h1>
        <p className="text-blue-100">
          Manage your railway concession here.
        </p>
      </div>

      {/* Eligibility Message */}
      {eligibilityMessage && (
        <div className="bg-red-100 text-red-800 p-4 rounded-md text-sm font-medium">
          {eligibilityMessage}
        </div>
      )}

      {/* Active Concession */}
      {activeConcession && (
        <Card title="Active Concession" subtitle="Currently valid concession">
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <strong>Type:</strong> {activeConcession.concessionType}
            </p>
            <p>
              <strong>Route:</strong> {activeConcession.routeFrom} → {activeConcession.routeTo}
            </p>
            <p>
              <strong>Valid Until:</strong> {new Date(activeConcession.validUntil).toLocaleDateString()}
            </p>
            <p className="text-green-600 font-medium">
              Remaining Days: {remainingDays}
            </p>
            <p>
              <strong>Certificate No:</strong> {activeConcession.currentCertificateNo || 'Not assigned'}
            </p>
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <Card title="New Application" subtitle="Apply for railway concession">
          <p className="text-gray-600 mb-4">
            Create a new concession application for your travel needs.
          </p>

          {canApply ? (
            <Link to="/student/applications?new=true">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Apply Now
              </Button>
            </Link>
          ) : (
            <Button disabled className="w-full bg-gray-400 cursor-not-allowed">
              Not Eligible to Apply
            </Button>
          )}
        </Card>

        <Card title="My Applications" subtitle="View your application status">
          <p className="text-gray-600 mb-4">
            Check your previous concession records.
          </p>
          <Link to="/student/applications">
            <Button variant="outline" className="w-full">
              View Applications
            </Button>
          </Link>
        </Card>
      </div>

      {/* Applications Table */}
      <Card title="Recent Applications" subtitle="Your recent applications">
        {applications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Route</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Valid Until</th>
                  <th className="px-4 py-2">Rejection Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {applications.slice(0, 5).map((app) => (
                  <tr key={app.appId}>
                    <td className="px-4 py-2">#{app.appId}</td>
                    <td className="px-4 py-2">
                      {app.routeFrom} → {app.routeTo}
                    </td>
                    <td className="px-4 py-2">
                      {app.concessionType || 'MONTHLY'}
                    </td>
                    <td className="px-4 py-2">
                      {new Date(app.applicationDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      {getStatusBadge(app.status)}
                    </td>
                    <td className="px-4 py-2">
                      {app.validUntil
                        ? new Date(app.validUntil).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-4 py-2 text-red-600">
                      {app.status === 'REJECTED'
                        ? app.rejectionReason || 'No reason provided'
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            No applications yet.
          </div>
        )}
      </Card>

    </div>
  );
};

export default StudentDashboard;