import React, { useEffect, useState } from 'react';
import auditService from '../../services/auditService';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const AuditLogsPage = () => {

  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, actionFilter, entityFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await auditService.getAllLogs();
      setLogs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {

    let filtered = logs;

    if (actionFilter) {
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(actionFilter.toLowerCase())
      );
    }

    if (entityFilter) {
      filtered = filtered.filter(log =>
        log.entityType.toLowerCase().includes(entityFilter.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  };

  if (loading) return <LoadingSpinner text="Loading audit logs..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-gradient-to-r from-slate-950 via-blue-950 to-teal-800 p-6 text-white shadow-xl md:p-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/20 blur-2xl" />
        <div className="relative z-10">
          <p className="text-sm uppercase tracking-[0.2em] text-sky-100">Staff Console</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">Audit Logs</h1>
          <p className="mt-2 max-w-2xl text-sm text-sky-100 md:text-base">
            Track key actions performed on student and application records across the system.
          </p>
        </div>
      </section>

      <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          <input
            type="text"
            placeholder="Filter by action..."
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />

          <input
            type="text"
            placeholder="Filter by entity (STUDENT / APPLICATION)..."
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />

        </div>
      </Card>

      <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr>
                <th className="border-b border-slate-200 px-3 py-3 text-xs uppercase tracking-wide text-slate-500">Time</th>
                <th className="border-b border-slate-200 px-3 py-3 text-xs uppercase tracking-wide text-slate-500">Action</th>
                <th className="border-b border-slate-200 px-3 py-3 text-xs uppercase tracking-wide text-slate-500">Entity</th>
                <th className="border-b border-slate-200 px-3 py-3 text-xs uppercase tracking-wide text-slate-500">Entity ID</th>
                <th className="border-b border-slate-200 px-3 py-3 text-xs uppercase tracking-wide text-slate-500">Performed By</th>
                <th className="border-b border-slate-200 px-3 py-3 text-xs uppercase tracking-wide text-slate-500">Details</th>
              </tr>
            </thead>

            <tbody>

              {filteredLogs.map(log => (
                <tr key={log.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">

                  <td className="px-3 py-3 text-slate-700">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>

                  <td className="px-3 py-3 font-medium text-sky-700">
                    {log.action}
                  </td>

                  <td className="px-3 py-3 text-slate-700">
                    {log.entityType}
                  </td>

                  <td className="px-3 py-3 text-slate-700">
                    {log.entityId}
                  </td>

                  <td className="px-3 py-3 text-slate-700">
                    {log.performedBy}
                  </td>

                  <td className="px-3 py-3 text-slate-600">
                    {log.details}
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

          {filteredLogs.length === 0 && (
            <div className="py-10 text-center text-sm text-slate-500">
              No audit records found.
            </div>
          )}

        </div>

      </Card>

    </div>
  );
};

export default AuditLogsPage;
