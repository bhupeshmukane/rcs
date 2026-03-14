import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import applicationService from '../../services/applicationService';
import ErrorMessage from '../../components/common/ErrorMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ApplicationForm from '../../components/forms/ApplicationForm';

const TIMELINE_STEPS = ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "ISSUED"];

const ApplicationHistory = () => {

  const { user } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      fetchApplications();
    }, 15000);

    const handleFocus = () => fetchApplications();
    window.addEventListener('focus', handleFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user.id]);

  const fetchApplications = async () => {

    try {

      setLoading(true);

      const data =
        await applicationService.getApplicationsByStudentId(user.id);

      const sorted = data.sort(
        (a, b) =>
          new Date(b.applicationDate) - new Date(a.applicationDate)
      );

      setApplications(sorted);

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }

  };

  // Edit allowed only if rejected
  const canEditApplication = (application) =>
    application.status === "REJECTED";

  const resolveDisplayStatus = (application) => {
    if (application.currentCertificateNo && application.status !== 'REJECTED') {
      return 'ISSUED';
    }

    return application.status;
  };

  // Reapply allowed if expired concession
  const canReapply = (application) => {

    if (!application.validUntil)
      return false;

    const expired =
      new Date(application.validUntil) < new Date();

    return (
      (resolveDisplayStatus(application) === "ISSUED" ||
        resolveDisplayStatus(application) === "APPROVED") &&
      expired
    );

  };

  const getTimelineIndex = (status) => {

    if (status === "PENDING")
      return 1;

    if (status === "APPROVED")
      return 2;

    if (status === "ISSUED" || status === "EXPIRED" || status === "REJECTED")
      return 3;

    return 0;

  };

  const isTimelineStepActive = (step, index, currentStep, status) => {
    if (status === 'REJECTED') {
      if (step === 'APPROVED') {
        return false;
      }

      return step === 'SUBMITTED' || step === 'UNDER_REVIEW' || step === 'ISSUED';
    }

    return index <= currentStep;
  };

  const isExpired = (validUntil) => {

    if (!validUntil)
      return false;

    return new Date(validUntil) < new Date();

  };

  if (loading)
    return <LoadingSpinner text="Loading applications..." />;

  if (error)
    return <ErrorMessage message={error} />;

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-amber-100 text-amber-800',
      APPROVED: 'bg-emerald-100 text-emerald-800',
      ISSUED: 'bg-emerald-200 text-emerald-900',
      REJECTED: 'bg-rose-100 text-rose-800',
      EXPIRED: 'bg-slate-200 text-slate-700'
    };

    return (
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status] || 'bg-slate-100 text-slate-700'}`}>
        {status}
      </span>
    );
  };

  return (

    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-gradient-to-r from-slate-900 via-blue-900 to-teal-700 p-6 text-white shadow-xl md:p-8">
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/20 blur-2xl" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-sky-100">Student Portal</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">My Applications</h1>
            <p className="mt-2 max-w-2xl text-sm text-sky-100 md:text-base">
              Check application progress, edit rejected forms, and reapply once concessions expire.
            </p>
          </div>
          <Button
            variant="light"
            className="w-full px-5 py-2.5 md:w-auto"
            onClick={() => {
              setSelectedApplication(null);
              setIsModalOpen(true);
            }}
          >
            + New Application
          </Button>
        </div>
      </section>

      {applications.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">No applications yet</h3>
          <p className="mt-2 text-sm text-slate-600">Create your first concession request to get started.</p>
          <Button className="mt-5 bg-slate-900 text-white hover:bg-slate-700" onClick={() => setIsModalOpen(true)}>
            Create Application
          </Button>
        </div>
      )}

      {applications.map((application, appIndex) => {
        const displayStatus = resolveDisplayStatus(application);

        const currentStep =
          getTimelineIndex(displayStatus);

        const expired =
          isExpired(application.validUntil);

        return (
          <Card
            key={application.appId}
            className="animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            style={{ animationDelay: `${appIndex * 80}ms` }}
          >
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Application #{application.appId}</h2>
                <p className="text-sm text-slate-600">{application.routeFrom} {'->'} {application.routeTo}</p>
                <p className="text-sm text-slate-600">
                  Applied on {new Date(application.applicationDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {getStatusBadge(displayStatus)}
                {canEditApplication(application) && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-100"
                    onClick={() => {
                      setSelectedApplication(application);
                      setIsModalOpen(true);
                    }}
                  >
                    Edit & Resubmit
                  </Button>
                )}
                {canReapply(application) && (
                  <Button
                    size="sm"
                    className="bg-slate-900 text-white hover:bg-slate-700"
                    onClick={() => {
                      const newApplicationData = {
                        ...application,
                        appId: null,
                        currentCertificateNo: null,
                        status: null,
                        validUntil: null

                      };
                      setSelectedApplication(newApplicationData);
                      setIsModalOpen(true);
                    }}
                  >
                    Reapply
                  </Button>
                )}
              </div>
            </div>
            <div className="mb-6 flex items-center rounded-xl border border-slate-200 bg-slate-50 p-3">
              {TIMELINE_STEPS.map((step, index) => {

                const isActive =
                  isTimelineStepActive(step, index, currentStep, displayStatus);

                let label = "";

                if (step === "SUBMITTED")
                  label = "📩 Submitted";

                if (step === "UNDER_REVIEW")
                  label = "🔎 Under Review";

                if (step === "APPROVED")
                  label = "✅ Approved";

                if (step === "ISSUED") {

                  if (application.status === "REJECTED")
                    label = "❌ Rejected";

                  else if (displayStatus === "ISSUED" || application.status === "EXPIRED")
                    label = "🎫 Issued by Staff";

                  else
                    label = "⏳ Awaiting Issue";

                }

                return (
                  <div
                    key={step}
                    className="relative flex-1 flex flex-col items-center"
                  >
                    {index !== TIMELINE_STEPS.length - 1 && (
                      <div
                        className={`absolute left-1/2 top-4 h-1 w-full -translate-y-1/2 rounded
                        ${isTimelineStepActive(TIMELINE_STEPS[index + 1], index + 1, currentStep, displayStatus)
                          ? 'bg-sky-600'
                          : 'bg-slate-300'
                        }`}
                      />
                    )}
                    <div
                      className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold
                      ${isActive
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-300 text-slate-600'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="mt-2 text-center text-xs text-slate-700">{label}</span>
                  </div>
                );

              })}

            </div>
            <div className="space-y-2 text-sm text-slate-700">
              <p><span className="font-semibold text-slate-900">Status:</span> {displayStatus}</p>

              {application.status === "REJECTED" && (
                <p className="text-rose-700"><span className="font-semibold">Rejection Reason:</span> {application.rejectionReason || 'Not specified'}</p>
              )}

              {application.currentCertificateNo && (
                <p className="text-emerald-700"><span className="font-semibold">Certificate No:</span> {application.currentCertificateNo}</p>
              )}

              {(displayStatus === 'ISSUED' || application.currentCertificateNo) && (
                <p className="text-cyan-700 animate-pulse">
                  <span className="font-semibold">✨ Issued Update:</span> Staff has issued your concession.
                  {application.issueDate ? ` Issued on ${new Date(application.issueDate).toLocaleDateString()}.` : ''}
                </p>
              )}

              {application.validUntil && (
                <p className={expired ? 'text-rose-700' : ''}>
                  <span className="font-semibold">Valid Until:</span> {new Date(application.validUntil).toLocaleDateString()}
                  {expired && ' (Expired)'}
                </p>
              )}

              {application.currentCertificateNo && (
                <div className="mt-3 rounded-lg border border-sky-100 bg-sky-50 p-3 text-xs text-sky-800">
                  Certificate must be collected from the college office.
                </div>
              )}
            </div>
          </Card>
        );
      })}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          selectedApplication
            ? "Edit / Reapply Application"
            : "New Application"
        }
        size="lg"
      >
        <ApplicationForm
          editData={selectedApplication}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchApplications();
          }}
        />
      </Modal>
    </div>

  );

};

export default ApplicationHistory;
