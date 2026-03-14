import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import applicationService from '../../services/applicationService';
import ErrorMessage from '../../components/common/ErrorMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/ui/Button';


const StudentDashboard = () => {

  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeConcession, setActiveConcession] = useState(null);
  const [remainingDays, setRemainingDays] = useState(null);
  const [eligibilityMessage, setEligibilityMessage] = useState('');

  useEffect(() => {
    fetchStudentData();
  }, []);

  useEffect(() => {
    if (remainingDays !== null && remainingDays <= 3 && remainingDays >= 0) {
      alert(`Warning: Your concession expires in ${remainingDays} days`);
    }
  }, [remainingDays]);

  const fetchStudentData = async () => {

    try {

      setLoading(true);

      const apps =
        await applicationService.getApplicationsByStudentId(user.id);

      setApplications(apps);

      evaluateEligibility(apps);

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }

  };

  const evaluateEligibility = (apps) => {

    const pending = apps.find(app => app.status === 'PENDING');

    if (pending) {

      setEligibilityMessage(
        'You already have a pending application under review.'
      );

      return;

    }

    const active = apps.find(app =>
      (app.status === 'ISSUED' || app.status === 'APPROVED') &&
      app.validUntil
    );

    if (active) {

      const today = new Date();
      const validUntil = new Date(active.validUntil);

      const diffTime = validUntil - today;

      const diffDays =
        Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {

        setActiveConcession(active);

        setRemainingDays(diffDays);

        setEligibilityMessage(
          `Concession valid until ${validUntil.toLocaleDateString()}`
        );

        return;

      }

    }

    setEligibilityMessage('');

  };

  const canApply = !eligibilityMessage;

  const getStatusBadge = (status) => {

    const styles = {

      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      ISSUED: 'bg-green-200 text-green-900',
      REJECTED: 'bg-red-100 text-red-800',
      EXPIRED: 'bg-gray-200 text-gray-600'

    };

    return (

      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}
      >

        {status}

      </span>

    );

  };

  const resolveDisplayStatus = (application) => {
    if (application.currentCertificateNo && application.status !== 'REJECTED') {
      return 'ISSUED';
    }

    return application.status;
  };

  const getCountdownColor = (days) => {

    if (days <= 2)
      return "text-red-600";

    if (days <= 7)
      return "text-yellow-600";

    return "text-green-600";

  };

  if (loading)
    return <LoadingSpinner text="Loading dashboard..." />;

  if (error)
    return <ErrorMessage message={error} />;

  return (
    <div className="space-y-8">
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-gradient-to-r from-slate-900 via-blue-900 to-teal-700 p-6 text-white shadow-xl md:p-8">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
          <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-sky-100">Student Portal</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
                Welcome back, {user.name}
              </h1>
              <p className="mt-2 max-w-xl text-sm text-sky-100 md:text-base">
                Track your concession status, remaining validity, and application history in one place.
              </p>
            </div>
            <Link to="/student/applications" className="inline-flex">
              <Button variant="light" className="w-full px-5 py-2.5 md:w-auto">
                Open Applications
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Applications</p>
            <p className="mt-3 text-3xl font-black text-amber-500">{applications.length}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Active Concession</p>
            <p className="mt-3 text-3xl font-black text-emerald-600">{activeConcession ? 'Yes' : 'No'}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Remaining Days</p>
            <p className={`mt-3 text-3xl font-black ${remainingDays !== null ? getCountdownColor(remainingDays) : 'text-slate-700'}`}>
              {remainingDays ?? '-'}
            </p>
          </div>
        </section>

        {eligibilityMessage && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800 shadow-sm">
            {eligibilityMessage}
          </div>
        )}

        {activeConcession && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Active Concession</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-700 md:grid-cols-3">
              <p><span className="font-semibold text-slate-900">Route:</span> {activeConcession.routeFrom} {'->'} {activeConcession.routeTo}</p>
              <p><span className="font-semibold text-slate-900">Valid Until:</span> {new Date(activeConcession.validUntil).toLocaleDateString()}</p>
              <p><span className="font-semibold text-slate-900">Certificate No:</span> {activeConcession.currentCertificateNo || 'Will be assigned by office'}</p>
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">New Application</h3>
            <p className="mt-2 text-sm text-slate-600">
              Apply for a new railway concession with updated route and category details.
            </p>
            <div className="mt-5">
              {canApply ? (
                <Link to="/student/applications?new=true">
                  <Button className="w-full bg-slate-900 text-white hover:bg-slate-700">Apply Now</Button>
                </Link>
              ) : (
                <Button disabled className="w-full cursor-not-allowed bg-slate-300 text-slate-600">
                  Not Eligible to Apply
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">My Applications</h3>
            <p className="mt-2 text-sm text-slate-600">
              Review current and previous submissions, including status and validity.
            </p>
            <div className="mt-5">
              <Link to="/student/applications">
                <Button variant="outline" className="w-full border-slate-400 text-slate-700 hover:bg-slate-100">
                  View Applications
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Recent Applications</h3>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
              Last 5 records
            </span>
          </div>

          {applications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-3">ID</th>
                    <th className="px-3 py-3">Route</th>
                    <th className="px-3 py-3">Type</th>
                    <th className="px-3 py-3">Date</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Valid Until</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.slice(0, 5).map((app) => (
                    <tr key={app.appId} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-3 py-3 font-medium text-slate-800">#{app.appId}</td>
                      <td className="px-3 py-3 text-slate-700">{app.routeFrom} {'->'} {app.routeTo}</td>
                      <td className="px-3 py-3 text-slate-700">{app.concessionType}</td>
                      <td className="px-3 py-3 text-slate-700">{new Date(app.applicationDate).toLocaleDateString()}</td>
                      <td className="px-3 py-3">{getStatusBadge(resolveDisplayStatus(app))}</td>
                      <td className="px-3 py-3 text-slate-700">
                        {app.validUntil ? new Date(app.validUntil).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500">
              No applications submitted yet.
            </div>
          )}
        </section>
      </div>

  );

};

export default StudentDashboard;
