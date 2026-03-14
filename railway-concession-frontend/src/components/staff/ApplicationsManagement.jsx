import React, { useState, useEffect, useCallback } from 'react';
import applicationService from '../../services/applicationService';
import ErrorMessage from '../common/ErrorMessage';
import SuccessMessage from '../common/SuccessMessage';
import LoadingSpinner from '../common/LoadingSpinner';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Card from '../ui/Card';

const ApplicationsManagement = ({ filter: externalFilter = 'ALL', searchTerm }) => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState(externalFilter); // ALL, PENDING, APPROVED, ISSUED, REJECTED
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [certificateNo, setCertificateNo] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    setStatusFilter(externalFilter || 'ALL');
  }, [externalFilter]);

  const filterApplications = useCallback(() => {
    let filtered = applications;

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();

      filtered = filtered.filter(app =>
        app.studentName?.toLowerCase().includes(term) ||
        app.studentId?.toLowerCase().includes(term) ||
        app.student?.id?.toLowerCase().includes(term)
      );
    }

    setFilteredApplications(filtered);
  }, [applications, statusFilter, searchTerm]);

  useEffect(() => {
    filterApplications();
  }, [filterApplications]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await applicationService.getAllApplications();
      const sorted = [...data].sort(
        (a, b) => new Date(b.applicationDate) - new Date(a.applicationDate)
      );
      setApplications(sorted);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const printSingle = (id) => {
  window.open(`http://localhost:8080/api/print/${id}`, "_blank");
};

const printBatch = async () => {
  const response = await fetch("http://localhost:8080/api/print/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(selectedIds)
  });

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  window.open(url);
};

  const openApplicationDetails = (application) => {
    setSelectedApplication(application);
    setIsDetailModalOpen(true);
  };

  const openActionModal = (application, type) => {
    setSelectedApplication(application);
    setActionType(type);
    setCertificateNo('');
    setRejectionReason('');
    setIsActionModalOpen(true);
  };

  const closeActionModal = () => {
    setIsActionModalOpen(false);
    setSelectedApplication(null);
    setActionType('');
    setCertificateNo('');
    setRejectionReason('');
  };

  const handleStatusUpdate = async (applicationId, status, certificateNumber = null) => {
    if (!applicationId) return;

    try {
      if (status === 'ISSUE') {
        await applicationService.assignCertificateNumber(applicationId, certificateNo.trim());
        setSuccess('Concession issued by staff successfully!');
      } else {
        await applicationService.updateApplicationStatus(applicationId, status, rejectionReason);
        setSuccess('Application updated successfully!');
      }

      fetchApplications(); // Refresh the list

      if (status === 'ISSUE') {
        setStatusFilter('ALL');
      }

      setIsDetailModalOpen(false);
      setIsActionModalOpen(false);
      setCertificateNo('');
      setRejectionReason('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDownloadCsv = async () => {
    try {
      setError('');
      const csvBlob = await applicationService.downloadApplicationsCsv();
      const url = window.URL.createObjectURL(new Blob([csvBlob], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'applications.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  };

  // 🔹 View caste certificate (SC / ST only)
  const handleViewCasteCertificate = async (application) => {
    try {
      if (!application.casteCertificate) {
        alert('Caste certificate not uploaded');
        return;
      }

      const fileUrl = `http://localhost:8181/${application.casteCertificate}`;
      window.open(fileUrl, '_blank');

    } catch (err) {
      alert(err.message || 'Unable to open caste certificate');
    }
  };

  // 🔹 View Aadhaar card
  const handleViewAadharCard = (application) => {
    try {
      if (!application.aadharCard) {
        alert('Aadhaar card not uploaded');
        return;
      }

      const fileUrl = `http://localhost:8181/${application.aadharCard}`;
      window.open(fileUrl, '_blank');

    } catch {
      alert('Unable to open Aadhaar card');
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      PENDING: 'bg-amber-100 text-amber-800',
      APPROVED: 'bg-emerald-100 text-emerald-800',
      ISSUED: 'bg-cyan-100 text-cyan-800',
      REJECTED: 'bg-rose-100 text-rose-800'
    };

    return (
      <span 
        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[status] || 'bg-slate-100 text-slate-700'}`}
      >
        {status}
      </span>
    );
  };

  const getFilterButtonClass = (filterName) => {
    return statusFilter === filterName
      ? 'bg-slate-900 text-white'
      : 'bg-slate-100 text-slate-700 hover:bg-slate-200';
  };

  if (loading) return <LoadingSpinner text="Loading applications..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-900">Applications Management</h2>
        <div className="flex gap-2">
          <Button onClick={handleDownloadCsv} variant="outline">
            Download CSV
          </Button>
          <Button onClick={fetchApplications} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {success && <SuccessMessage message={success} onDismiss={() => setSuccess('')} />}

      {/* Filter Buttons */}
      <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${getFilterButtonClass('ALL')}`}
          >
            All Applications ({applications.length})
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${getFilterButtonClass('PENDING')}`}
          >
            Pending ({applications.filter(app => app.status === 'PENDING').length})
          </button>
          <button
            onClick={() => setStatusFilter('APPROVED')}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${getFilterButtonClass('APPROVED')}`}
          >
            Approved ({applications.filter(app => app.status === 'APPROVED').length})
          </button>
          <button
            onClick={() => setStatusFilter('REJECTED')}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${getFilterButtonClass('REJECTED')}`}
          >
            Rejected ({applications.filter(app => app.status === 'REJECTED').length})
          </button>
          <button
            onClick={() => setStatusFilter('ISSUED')}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${getFilterButtonClass('ISSUED')}`}
          >
            Issued ({applications.filter(app => app.status === 'ISSUED').length})
          </button>
        </div>
      </Card>

      <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr>
                <th className="border-b border-slate-200 px-3 py-3 text-xs uppercase tracking-wide text-slate-500">
                  ID
                </th>
                <th className="border-b border-slate-200 px-3 py-3 text-xs uppercase tracking-wide text-slate-500">
                  Student
                </th>
                <th className="border-b border-slate-200 px-3 py-3 text-xs uppercase tracking-wide text-slate-500">
                  Route
                </th>
                <th className="border-b border-slate-200 px-3 py-3 text-xs uppercase tracking-wide text-slate-500">
                  Date
                </th>
                <th className="border-b border-slate-200 px-3 py-3 text-xs uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="border-b border-slate-200 px-3 py-3 text-xs uppercase tracking-wide text-slate-500">
                  Certificate
                </th>
                <th className="border-b border-slate-200 px-3 py-3 text-xs uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app) => (
                <tr key={app.appId} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="whitespace-nowrap px-3 py-3 font-medium text-slate-800">
                    #{app.appId}
                  </td>
                  <td 
                    className="cursor-pointer whitespace-nowrap px-3 py-3 text-sky-700 hover:underline"
                    onClick={() => openApplicationDetails(app)}
                  >
                    {app.studentName}
                    <br />
                    <span className="text-xs text-slate-500">{app.studentId || app.student?.id || 'N/A'}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                    {app.routeFrom} {'->'} {app.routeTo}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                    {new Date(app.applicationDate).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {getStatusBadge(app.status)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                    {app.currentCertificateNo || 'Not assigned'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm font-medium space-x-2">
                    {(app.status === 'PENDING' || app.status === 'APPROVED') && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => openActionModal(app, 'REJECTED')}
                      >
                        Reject
                      </Button>
                    )}
                    {app.status === 'APPROVED' && (
                      <Button
                        size="sm"
                        onClick={() => openActionModal(app, 'ISSUE')}
                      >
                        Issue Concession
                      </Button>
                    )}
                    {(app.category === 'SC' || app.category === 'ST') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewCasteCertificate(app)}
                      >
                        View Certificate
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewAadharCard(app)}
                    >
                      View Aadhaar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredApplications.length === 0 && (
          <div className="py-10 text-center text-sm text-slate-500">
            No {statusFilter !== 'ALL' ? statusFilter.toLowerCase() : ''} applications found.
          </div>
        )}
      </Card>

      {/* Application Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Application Details - #${selectedApplication?.appId}`}
        size="lg"
      >
        {selectedApplication && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Student Name</label>
                <p className="text-sm text-slate-900">{selectedApplication.studentName}</p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Student ID</label>
                <p className="text-sm text-slate-900">{selectedApplication.studentId || selectedApplication.student?.id || 'N/A'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Date of Birth</label>
                <p className="text-sm text-slate-900">
                  {new Date(selectedApplication.studentDob).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
                <p className="text-sm text-slate-900">{selectedApplication.category}</p>
              </div>
            </div>

            {/* Aadhaar Card viewing option */}
            {selectedApplication.aadharCard && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Aadhaar Card
                </label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewAadharCard(selectedApplication)}
                >
                  View Uploaded Aadhaar Card
                </Button>
              </div>
            )}

            {/* Caste Certificate viewing option for SC/ST */}
            {(selectedApplication.category === 'SC' || selectedApplication.category === 'ST') &&
              selectedApplication.casteCertificate && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Caste Certificate
                  </label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewCasteCertificate(selectedApplication)}
                  >
                    View Uploaded Caste Certificate
                  </Button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">From Station</label>
                <p className="text-sm text-slate-900">{selectedApplication.routeFrom}</p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">To Station</label>
                <p className="text-sm text-slate-900">{selectedApplication.routeTo}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Application Date</label>
                <p className="text-sm text-slate-900">
                  {new Date(selectedApplication.applicationDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
                <div className="text-sm">{getStatusBadge(selectedApplication.status)}</div>
              </div>
            </div>

            {selectedApplication.currentCertificateNo && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Certificate Number</label>
                <p className="text-sm text-slate-900">{selectedApplication.currentCertificateNo}</p>
              </div>
            )}

            <div className="flex space-x-3 justify-end pt-4">
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
              {selectedApplication.status === 'PENDING' && (
                <>
                  <Button onClick={() => openActionModal(selectedApplication, 'APPROVED')}>
                    Approve Application
                  </Button>
                  <Button variant="danger" onClick={() => openActionModal(selectedApplication, 'REJECTED')}>
                    Reject Application
                  </Button>
                </>
              )}
              {selectedApplication.status === 'APPROVED' && (
                <>
                  <Button onClick={() => openActionModal(selectedApplication, 'ISSUE')}>
                    Issue Concession
                  </Button>
                  <Button variant="danger" onClick={() => openActionModal(selectedApplication, 'REJECTED')}>
                    Reject Application
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Action Modal */}
      <Modal
        isOpen={isActionModalOpen}
        onClose={closeActionModal}
        title={
          actionType === 'APPROVED'
            ? 'Approve Application'
            : actionType === 'ISSUE'
              ? 'Issue Concession'
              : 'Reject Application'
        }
      >
        {selectedApplication && (
          <div className="space-y-4">
            <p className="text-slate-600">
              {actionType === 'APPROVED' 
                ? `Approve application #${selectedApplication.appId} for ${selectedApplication.studentName}?`
                : actionType === 'ISSUE'
                  ? `Issue concession for application #${selectedApplication.appId} (${selectedApplication.studentName})?`
                : `Reject application #${selectedApplication.appId} for ${selectedApplication.studentName}?`
              }
            </p>

            {actionType === 'ISSUE' && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Certificate Number *
                </label>
                <input
                  type="text"
                  value={certificateNo}
                  onChange={(e) => setCertificateNo(e.target.value)}
                  placeholder="Enter certificate number"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  required
                />
              </div>
            )}

            {actionType === 'REJECTED' && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection"
                  rows={3}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  required
                />
              </div>
            )}

            <div className="flex space-x-3 justify-end pt-4">
              <Button variant="outline" onClick={closeActionModal}>
                Cancel
              </Button>
              <Button
                onClick={() => handleStatusUpdate(
                  selectedApplication.appId, 
                  actionType
                )}
                disabled={
                  (actionType === 'ISSUE' && !certificateNo.trim()) ||
                  (actionType === 'REJECTED' && !rejectionReason.trim())
                }
              >
                Confirm {
                  actionType === 'APPROVED'
                    ? 'Approve'
                    : actionType === 'ISSUE'
                        ? 'Issue Concession'
                      : 'Reject'
                }
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ApplicationsManagement;