import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import applicationService from '../../services/applicationService';
import SuccessMessage from '../common/SuccessMessage';
import Button from '../ui/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import Toast from '../common/Toast';

const ApplicationForm = ({ onSuccess, editData }) => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const [formData, setFormData] = useState({
    routeFrom: '',
    routeTo: '',
    category: '',
    previousCertificateNo: '',
    concessionType: 'MONTHLY',
    gender: ''
  });

  // 🔹 NEW: caste certificate file state
  const [casteCertificate, setCasteCertificate] = useState(null);

  // 🔹 NEW: Aadhaar card file state
  const [aadharCard, setAadharCard] = useState(null);

  // Previous pass file state
  const [previousPass, setPreviousPass] = useState(null);
  const [otherDocument, setOtherDocument] = useState(null);

  useEffect(() => {
    if (editData) {
      setFormData({
        routeFrom: editData.routeFrom || '',
        routeTo: editData.routeTo || '',
        category: editData.category || '',
        previousCertificateNo: editData.previousCertificateNo || '',
        concessionType: editData.concessionType || 'MONTHLY'
      });
    }
  }, [editData]);

  // 🔹 Helper: SC / ST check
  const isCasteCertRequired =
    formData.category === 'SC' || formData.category === 'ST';

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });

    // 🔹 If category changes to non SC/ST → clear file
    if (name === 'category' && value !== 'SC' && value !== 'ST') {
      setCasteCertificate(null);
    }
  };

  // 🔹 NEW: file change handler
  const handleFileChange = (e) => {
    setCasteCertificate(e.target.files[0]);
  };

  // 🔹 NEW: Aadhaar file handler
  const handleAadharChange = (e) => {
    setAadharCard(e.target.files[0]);
  };

  const handlePreviousPassChange = (e) => {
    setPreviousPass(e.target.files[0]);
  };

  const handleOtherDocumentChange = (e) => {
    setOtherDocument(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');

    // 🔹 Frontend validation
    if (isCasteCertRequired && !casteCertificate) {
      const msg = 'Caste certificate is mandatory for SC/ST students.';
      setToastMessage(msg);
      setLoading(false);
      return;
    }

    if (!aadharCard) {
      const msg = 'Aadhaar card is required for address verification.';
      setToastMessage(msg);
      setLoading(false);
      return;
    }

    if (!formData.previousCertificateNo.trim()) {
      const msg = 'Previous certificate number is required.';
      setToastMessage(msg);
      setLoading(false);
      return;
    }

    if (!previousPass) {
      const msg = 'Previous pass upload is required.';
      setToastMessage(msg);
      setLoading(false);
      return;
    }

    try {
      // 🔹 IMPORTANT: use FormData instead of JSON
      const data = new FormData();

      data.append('studentId', user.id);
      data.append('studentName', user.name);
      data.append('studentDob', user.dob);

      data.append('routeFrom', formData.routeFrom);
      data.append('routeTo', formData.routeTo);
      data.append('category', formData.category);
      data.append('previousCertificateNo', formData.previousCertificateNo.trim());
      data.append('concessionType', formData.concessionType);

      if (isCasteCertRequired) {
        data.append('casteCertificate', casteCertificate);
      }

      // 🔹 NEW: Aadhaar card
      data.append('aadharCard', aadharCard);

      // Previous pass is mandatory
      data.append('previousPass', previousPass);

      if (otherDocument) {
        data.append('otherDocument', otherDocument);
      }

      const response = await applicationService.createApplication(data);

      setSuccess('Application submitted successfully!');
      setFormData({
        routeFrom: '',
        routeTo: '',
        category: '',
        previousCertificateNo: '',
        concessionType: 'MONTHLY'
      });
      setCasteCertificate(null);
      setAadharCard(null);
      setPreviousPass(null);
      setOtherDocument(null);

      if (onSuccess) {
        onSuccess(response);
      }
    } catch (err) {
      setToastMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['GENERAL', 'SC', 'ST', 'OBC', 'OTHER'];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-800">
          Student Application
        </p>
        <h2 className="mb-6 text-2xl font-black text-slate-900">
          {editData ? 'Edit Application' : 'New Concession Application'}
        </h2>

        <Toast
          message={toastMessage}
          type="error"
          onClose={() => setToastMessage('')}
        />
        {success && <SuccessMessage message={success} className="mb-4" />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Student Name
              </label>
              <input
                type="text"
                value={user?.name || ''}
                disabled
                className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-600"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Date of Birth
              </label>
              <input
                type="text"
                value={user?.dob ? new Date(user.dob).toLocaleDateString() : ''}
                disabled
                className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-600"
              />
            </div>
          </div>

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

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Concession Type *
            </label>
            <select
              name="concessionType"
              value={formData.concessionType}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            >
              <option value="MONTHLY">Monthly</option>
              <option value="QUARTERLY">Quarterly</option>
            </select>
          </div>

          {isCasteCertRequired && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Upload Caste Certificate (SC / ST only) *
              </label>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleFileChange}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
              />
              <p className="mt-1 text-xs text-slate-500">
                Allowed formats: JPG, JPEG, PNG
              </p>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Upload Aadhaar Card (Address Proof) *
            </label>
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg, application/pdf"
              onChange={handleAadharChange}
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
            />
            <p className="mt-1 text-xs text-slate-500">
              Allowed formats: JPG, JPEG, PNG, PDF
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Other Document (Optional)
            </label>
            <input
              type="file"
              name="otherDocument"
              accept="image/png, image/jpeg, image/jpg, application/pdf"
              onChange={handleOtherDocumentChange}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
            />
            <p className="mt-1 text-xs text-slate-500">
              Allowed formats: JPG, JPEG, PNG, PDF
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Upload Previous Pass *
            </label>
            <input
              type="file"
              name="previousPass"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handlePreviousPassChange}
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
            />
            <p className="mt-1 text-xs text-slate-500">
              Allowed formats: JPG, JPEG, PNG
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Gender *
            </label>
            <div className="flex items-center gap-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <label className="text-sm text-slate-700">
                <input type="radio"
                name="gender"
                value="MALE"
                checked={formData.gender === "MALE"}
                onChange={handleChange}
                required
                className="mr-1"  
                />
                Male
              </label>
              <label className="text-sm text-slate-700">
                <input type="radio"
                name="gender"
                value="FEMALE"
                checked={formData.gender === "FEMALE"}
                onChange={handleChange}
                required
                className="mr-1"  
                />
                Female
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                From (Station) *
              </label>
              <input
                type="text"
                name="routeFrom"
                value={formData.routeFrom}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                To (Station) *
              </label>
              <input
                type="text"
                name="routeTo"
                value={formData.routeTo}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Previous Certificate Number *
            </label>
            <input
              type="text"
              name="previousCertificateNo"
              value={formData.previousCertificateNo}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-sky-600 to-cyan-600 py-3 text-white hover:from-sky-700 hover:to-cyan-700"
          >
            {loading ? (
              <LoadingSpinner size="sm" text="Submitting..." />
            ) : (
              editData ? 'Update Application' : 'Submit Application'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ApplicationForm;
