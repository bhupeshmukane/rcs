import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import applicationService from '../../services/applicationService';
import studentService from '../../services/studentService';
import ErrorMessage from '../../components/common/ErrorMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const StaffDashboard = () => {

  const [stats, setStats] = useState({});
  const [recentApplications, setRecentApplications] = useState([]);
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {

    try {

      setLoading(true);

      const [appsData, statsData, studentsData] =
        await Promise.all([
          applicationService.getAllApplications(),
          applicationService.getApplicationStats(),
          studentService.getAllStudents()
        ]);

      setRecentApplications(appsData.slice(0,5));

      setStats(statsData);

      setStudentCount(studentsData.length);

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }

  };

  const printForm = (id) => {
  window.open(`http://localhost:8080/api/print/${id}`, "_blank");
};

  const printBatch = (ids) => {
  fetch("http://localhost:8080/api/print/batch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(ids)
  })
  .then(res => res.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    window.open(url);
  });
};

  const getStatusBadge = (status) => {

    const statusClasses = {

      PENDING: 'bg-yellow-100 text-yellow-800',

      APPROVED: 'bg-green-100 text-green-800',

      ISSUED: 'bg-green-200 text-green-900',

      REJECTED: 'bg-red-100 text-red-800',

      EXPIRED: 'bg-gray-200 text-gray-600'

    };

    return (

      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status]}`}>

        {status}

      </span>

    );

  };

  if (loading)
    return <LoadingSpinner text="Loading dashboard..." />;

  if (error)
    return <ErrorMessage message={error} />;

  return (

    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-gradient-to-r from-slate-950 via-blue-950 to-teal-800 p-6 text-white shadow-xl md:p-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/20 blur-2xl" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-sky-100">Staff Console</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">Staff Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-sky-100 md:text-base">
              Review concession requests, monitor student records, and keep approvals moving.
            </p>
          </div>
          <div className="rounded-xl bg-white/15 px-4 py-3 text-sm backdrop-blur">
            Active Students: <span className="font-bold">{studentCount}</span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Applications</p>
          <p className="mt-3 text-3xl font-black text-amber-500">{stats.total || 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending</p>
          <p className="mt-3 text-3xl font-black text-amber-600">{stats.pending || 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Approved</p>
          <p className="mt-3 text-3xl font-black text-emerald-600">{stats.approved || 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Issued</p>
          <p className="mt-3 text-3xl font-black text-cyan-700">{stats.issued || 0}</p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Quick Actions" className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="space-y-3">
            <Link to="/staff/applications">
              <Button className="w-full bg-slate-900 text-white hover:bg-slate-700">
                Process Applications
              </Button>
            </Link>
            <Link to="/staff/students">
              <Button variant="outline" className="w-full border-slate-400 text-slate-700 hover:bg-slate-100">
                Manage Students
              </Button>
            </Link>
          </div>
        </Card>

        <Card title="Students Snapshot" className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="rounded-xl border border-sky-100 bg-sky-50 p-4">
              <p className="text-2xl font-black text-amber-500">{studentCount}</p>
              <p className="text-sm text-slate-600">Registered Students</p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-2xl font-black text-emerald-700">{stats.issued || 0}</p>
              <p className="text-sm text-slate-600">Concessions Issued</p>
            </div>
          </div>
        </Card>
      </section>

      <Card title="Recent Applications" className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-3">ID</th>
                <th className="px-3 py-3">Student</th>
                <th className="px-3 py-3">Route</th>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentApplications.map(app => (
                <tr key={app.appId} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-3 py-3 font-medium text-slate-800">#{app.appId}</td>
                  <td className="px-3 py-3">
                    <p className="font-medium text-slate-800">{app.student?.name}</p>
                    <p className="text-xs text-slate-500">{app.student?.id}</p>
                  </td>
                  <td className="px-3 py-3 text-slate-700">{app.routeFrom} {'->'} {app.routeTo}</td>
                  <td className="px-3 py-3 text-slate-700">{new Date(app.applicationDate).toLocaleDateString()}</td>
                  <td className="px-3 py-3">{getStatusBadge(app.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>

  );

};

export default StaffDashboard;
