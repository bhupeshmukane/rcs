import React, { useState, useEffect } from 'react';
import applicationService from '../../services/applicationService';
import ApplicationsManagement from '../../components/staff/ApplicationsManagement';
import ErrorMessage from '../../components/common/ErrorMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const ApplicationsPage = () => {

  const [stats, setStats] = useState({});
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {

    try {

      setLoading(true);

      const data =
        await applicationService.getApplicationStats();

      setStats(data);

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }

  };

  const getFilterButtonClass = (filterName) => {

    return filter === filterName
      ? 'bg-slate-900 text-white'
      : 'bg-slate-100 text-slate-700 hover:bg-slate-200';

  };

  if (loading)
    return <LoadingSpinner text="Loading applications..." />;

  if (error)
    return <ErrorMessage message={error} />;

  return (

    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-gradient-to-r from-slate-950 via-blue-950 to-teal-800 p-6 text-white shadow-xl md:p-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/20 blur-2xl" />
        <div className="relative z-10">
          <p className="text-sm uppercase tracking-[0.2em] text-sky-100">Staff Console</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">Applications Management</h1>
          <p className="mt-2 max-w-2xl text-sm text-sky-100 md:text-base">
            Review, approve, reject, and issue concessions with fast filtering and search.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total</p>
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

      <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <input
            type="text"
            placeholder="Search by student ID or name..."
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 md:w-80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="flex flex-wrap gap-2">

            <Button
              size="sm"
              className={getFilterButtonClass('ALL')}
              onClick={() => setFilter('ALL')}
            >
              All
            </Button>

            <Button
              size="sm"
              className={getFilterButtonClass('PENDING')}
              onClick={() => setFilter('PENDING')}
            >
              Pending
            </Button>

            <Button
              size="sm"
              className={getFilterButtonClass('APPROVED')}
              onClick={() => setFilter('APPROVED')}
            >
              Approved
            </Button>

            <Button
              size="sm"
              className={getFilterButtonClass('ISSUED')}
              onClick={() => setFilter('ISSUED')}
            >
              Issued
            </Button>

            <Button
              size="sm"
              className={getFilterButtonClass('REJECTED')}
              onClick={() => setFilter('REJECTED')}
            >
              Rejected
            </Button>
          </div>
        </div>

        <ApplicationsManagement
          filter={filter}
          searchTerm={searchTerm}
        />
      </Card>
    </div>

  );

};

export default ApplicationsPage;
