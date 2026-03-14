import React, { useState, useEffect } from 'react';
import applicationService from '../../services/applicationService';
import ErrorMessage from '../../components/common/ErrorMessage';
import SuccessMessage from '../../components/common/SuccessMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const ReportsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [certificateRange, setCertificateRange] = useState({
    start: '',
    end: ''
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const appsData = await applicationService.getAllApplications();
      setApplications(appsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      let url;
      let queryParams = '';
      
      // Add certificate range filter if provided
      if (certificateRange.start || certificateRange.end) {
        const params = new URLSearchParams();
        if (certificateRange.start) params.append('certificateStart', certificateRange.start);
        if (certificateRange.end) params.append('certificateEnd', certificateRange.end);
        queryParams = `?${params.toString()}`;
        
        // Use the new filtered endpoint when certificate range is specified
        url = `/api/applications/reports/applications/csv-filtered${queryParams}`;
      } else {
        // Use the original endpoint when no filter is applied
        url = `/api/reports/applications/csv`;
      }
      
      window.open(url, '_blank');
      setSuccessMessage('Report generated successfully!');
    } catch (err) {
      setError('Failed to generate report: ' + err.message);
    }
  };

  const handleCertificateRangeChange = (e) => {
    setCertificateRange({
      ...certificateRange,
      [e.target.name]: e.target.value
    });
  };

  // Get applications within certificate range
  const getApplicationsInCertificateRange = () => {
    if (!certificateRange.start && !certificateRange.end) {
      return applications;
    }

    return applications.filter(app => {
      if (!app.currentCertificateNo) return false;
      
      const certNo = app.currentCertificateNo.toUpperCase();
      const startCert = certificateRange.start.toUpperCase();
      const endCert = certificateRange.end.toUpperCase();
      
      // If only start is provided, return certificates >= start
      if (certificateRange.start && !certificateRange.end) {
        return certNo >= startCert;
      }
      
      // If only end is provided, return certificates <= end
      if (!certificateRange.start && certificateRange.end) {
        return certNo <= endCert;
      }
      
      // If both are provided, return certificates in range
      return certNo >= startCert && certNo <= endCert;
    });
  };

  if (loading) return <LoadingSpinner text="Loading reports..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-gradient-to-r from-slate-950 via-blue-950 to-teal-800 p-6 text-white shadow-xl md:p-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/20 blur-2xl" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-sky-100">Staff Console</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">Reports & Analytics</h1>
            <p className="mt-2 max-w-2xl text-sm text-sky-100 md:text-base">
              Export concession reports and preview certificate ranges before download.
            </p>
          </div>
          <Button onClick={fetchReportData} variant="light" className="w-full px-5 py-2.5 md:w-auto">
            Refresh Data
          </Button>
        </div>
      </section>

      {successMessage && <SuccessMessage message={successMessage} onDismiss={() => setSuccessMessage('')} />}
      {error && <ErrorMessage message={error} onDismiss={() => setError('')} />}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Applications</p>
          <p className="mt-3 text-3xl font-black text-amber-500">{applications.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Approved</p>
          <p className="mt-3 text-3xl font-black text-emerald-600">{applications.filter(app => app.status === 'APPROVED').length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending</p>
          <p className="mt-3 text-3xl font-black text-amber-600">{applications.filter(app => app.status === 'PENDING').length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Certificates Issued</p>
          <p className="mt-3 text-3xl font-black text-cyan-700">{applications.filter(app => app.currentCertificateNo).length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Generate Reports" className="h-fit rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Certificate Number Range
              </label>
              <p className="mb-3 text-sm text-slate-500">
                Generate report for certificates within a specific range
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">From Certificate</label>
                  <input
                    type="text"
                    name="start"
                    value={certificateRange.start}
                    onChange={handleCertificateRangeChange}
                    placeholder="e.g., CERT2024001"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">To Certificate</label>
                  <input
                    type="text"
                    name="end"
                    value={certificateRange.end}
                    onChange={handleCertificateRangeChange}
                    placeholder="e.g., CERT2024050"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  />
                </div>
              </div>
              
              <p className="mt-2 text-xs text-slate-500">
                Leave blank for all certificates. Range is inclusive.
              </p>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={handleGenerateReport}
                className="w-full bg-slate-900 text-white hover:bg-slate-700"
              >
                Export Applications CSV
              </Button>
              
              <div className="text-center">
                <span className="text-sm text-slate-500">
                  {certificateRange.start || certificateRange.end ? 
                    `Will export ${getApplicationsInCertificateRange().length} applications` : 
                    'Will export all applications'
                  }
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Quick Summary" className="h-fit rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Total Applications</span>
              <span className="font-bold text-amber-500">{applications.length}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Approved Applications</span>
              <span className="font-bold text-emerald-700">
                {applications.filter(app => app.status === 'APPROVED').length}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Pending Applications</span>
              <span className="font-bold text-amber-700">
                {applications.filter(app => app.status === 'PENDING').length}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Certificates Issued</span>
              <span className="font-bold text-cyan-700">
                {applications.filter(app => app.currentCertificateNo).length}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {(certificateRange.start || certificateRange.end) && (
        <Card title="Certificate Range Preview" subtitle="Applications within selected certificate range" className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="border-b border-slate-200 px-3 py-3 text-xs uppercase tracking-wide text-slate-500">App ID</th>
                  <th className="border-b border-slate-200 px-3 py-3 text-xs uppercase tracking-wide text-slate-500">Student</th>
                  <th className="border-b border-slate-200 px-3 py-3 text-xs uppercase tracking-wide text-slate-500">Certificate No</th>
                  <th className="border-b border-slate-200 px-3 py-3 text-xs uppercase tracking-wide text-slate-500">Status</th>
                  <th className="border-b border-slate-200 px-3 py-3 text-xs uppercase tracking-wide text-slate-500">Route</th>
                </tr>
              </thead>
              <tbody>
                {getApplicationsInCertificateRange().slice(0, 10).map((app) => (
                  <tr key={app.appId} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-3 py-3 font-medium text-slate-800">#{app.appId}</td>
                    <td className="px-3 py-3 text-slate-700">{app.studentName}</td>
                    <td className="px-3 py-3 font-medium text-sky-700">
                      {app.currentCertificateNo || 'Not assigned'}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        app.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-700">{app.routeFrom} {'->'} {app.routeTo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {getApplicationsInCertificateRange().length > 10 && (
            <div className="mt-4 text-center text-sm text-slate-500">
              Showing 10 of {getApplicationsInCertificateRange().length} applications
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default ReportsPage;
