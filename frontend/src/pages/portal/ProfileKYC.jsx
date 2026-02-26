import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import StatusBanner from '../../components/portal/StatusBanner';
import { ACCOUNT_STATUS } from '../../constants/accountStatus';
import { FaCheckCircle, FaTimesCircle, FaCloudUploadAlt } from 'react-icons/fa';

const formatDateForInput = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toISOString().split('T')[0];
};

const ProfileKYC = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [form, setForm] = useState({
    name: '',
    dateOfBirth: '',
    phone: '',
    address: '',
    state: '',
    district: '',
    ngoName: '',
    ngoRegistrationNumber: '',
    ownershipType: '',
    declarationAccepted: false,
    landAreaHectares: '',
  });
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [landFile, setLandFile] = useState(null);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        dateOfBirth: formatDateForInput(user.dateOfBirth),
        phone: user.phone || '',
        address: user.address || '',
        state: user.state || '',
        district: user.district || '',
        ngoName: user.ngoName || '',
        ngoRegistrationNumber: user.ngoRegistrationNumber || '',
        ownershipType: user.ownershipType || '',
        declarationAccepted: user.declarationAccepted || false,
        landAreaHectares: user.landAreaHectares != null ? String(user.landAreaHectares) : '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      if (user?.accountStatus === ACCOUNT_STATUS.ACTIVE) {
        const res = await api.patch('/profile', form);
        if (res.data.success) {
          setMessage({ type: 'success', text: res.data.message });
          await refreshUser();
        }
        setLoading(false);
        return;
      }

      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('dateOfBirth', form.dateOfBirth);
      fd.append('phone', form.phone);
      fd.append('address', form.address);
      fd.append('state', form.state);
      fd.append('district', form.district);
      fd.append('ngoName', form.ngoName);
      fd.append('ngoRegistrationNumber', form.ngoRegistrationNumber);
      fd.append('ownershipType', form.ownershipType);
      fd.append('declarationAccepted', form.declarationAccepted);
      if (aadhaarFile) fd.append('aadhaar', aadhaarFile);

      const res = await api.put('/profile', fd);
      if (res.data.success) {
        setMessage({ type: 'success', text: res.data.message });
        setAadhaarFile(null);
        await refreshUser();
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save profile',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLandUpload = async (e) => {
    e.preventDefault();
    if (!landFile) {
      setMessage({ type: 'error', text: 'Please select a land document.' });
      return;
    }
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const fd = new FormData();
      fd.append('landDocument', landFile);
      if (form.landAreaHectares !== '' && !isNaN(parseFloat(form.landAreaHectares))) {
        fd.append('landAreaHectares', form.landAreaHectares);
      }
      const res = await api.put('/profile/land-document', fd);
      if (res.data.success) {
        setMessage({ type: 'success', text: res.data.message });
        setLandFile(null);
        await refreshUser();
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to upload land document',
      });
    } finally {
      setLoading(false);
    }
  };

  const needsAadhaar = ![ACCOUNT_STATUS.ACTIVE, ACCOUNT_STATUS.PENDING_VERIFICATION].includes(user?.accountStatus);
  const needsLand = user?.accountStatus === ACCOUNT_STATUS.VERIFIED_PENDING_LAND || user?.accountStatus === ACCOUNT_STATUS.IDENTITY_VERIFIED;
  const timeline = user?.statusTimeline || [
    { step: 'Email Verified', completed: false },
    { step: 'Identity Verified', completed: false },
    { step: 'Land Verified', completed: false },
    { step: 'Account Activated', completed: false },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <StatusBanner accountStatus={user?.accountStatus} />

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile & KYC</h1>

      {/* Progress Bar */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Verification Progress</h2>
        <div className="space-y-3">
          {timeline.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  item.completed ? 'bg-bc-green-100 text-bc-green-700' : 'bg-gray-100 text-gray-400'
                }`}
              >
                {item.completed ? <FaCheckCircle className="w-5 h-5" /> : <span className="text-sm">{idx + 1}</span>}
              </div>
              <span className={item.completed ? 'text-gray-900 font-medium' : 'text-gray-500'}>{item.step}</span>
              {item.notes && <span className="text-xs text-gray-400">({item.notes})</span>}
            </div>
          ))}
        </div>
      </section>

      {/* Identity Verification Status */}
      {(user?.aadhaarUploadedAt || user?.aadhaarNameMatch !== undefined) && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Identity Verification Status</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              {user?.aadhaarDocumentPath ? (
                <FaCheckCircle className="w-5 h-5 text-bc-green-600" />
              ) : (
                <FaTimesCircle className="w-5 h-5 text-gray-400" />
              )}
              <span>Aadhaar uploaded {user?.aadhaarDocumentPath ? '✔' : '—'}</span>
            </div>
            <div className="flex items-center gap-2">
              {user?.aadhaarNameMatch === true ? (
                <FaCheckCircle className="w-5 h-5 text-bc-green-600" />
              ) : user?.aadhaarNameMatch === false ? (
                <FaTimesCircle className="w-5 h-5 text-red-500" />
              ) : (
                <span className="text-gray-400">—</span>
              )}
              <span>Name Match {user?.aadhaarNameMatch === true ? '✔' : user?.aadhaarNameMatch === false ? '❌' : '—'}</span>
            </div>
            <div className="flex items-center gap-2">
              {user?.aadhaarDobMatch === true ? (
                <FaCheckCircle className="w-5 h-5 text-bc-green-600" />
              ) : user?.aadhaarDobMatch === false ? (
                <FaTimesCircle className="w-5 h-5 text-red-500" />
              ) : (
                <span className="text-gray-400">—</span>
              )}
              <span>DOB Match {user?.aadhaarDobMatch === true ? '✔' : user?.aadhaarDobMatch === false ? '❌' : '—'}</span>
            </div>
            <div>
              <span
                className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                  user?.identityVerifiedAt ? 'bg-bc-green-100 text-bc-green-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {user?.identityVerifiedAt ? 'Identity Verified ✔' : 'Identity Pending'}
              </span>
            </div>
          </div>
        </section>
      )}

      {message.text && (
        <div
          className={`p-4 rounded-lg mb-6 ${
            message.type === 'success' ? 'bg-bc-green-50 text-bc-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {user?.referenceId && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-800">
            <strong>Reference ID:</strong> {user.referenceId}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1 - Personal Details */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bc-green-500 focus:border-bc-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth <span className="text-red-500">*</span></label>
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bc-green-500 focus:border-bc-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bc-green-500 focus:border-bc-green-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bc-green-500 focus:border-bc-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                name="state"
                value={form.state}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bc-green-500 focus:border-bc-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
              <input
                type="text"
                name="district"
                value={form.district}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bc-green-500 focus:border-bc-green-500"
              />
            </div>
          </div>
        </section>

        {/* Section 2 - Aadhaar Upload */}
        {needsAadhaar && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Aadhaar Card <span className="text-red-500">*</span></h2>
            <p className="text-sm text-gray-600 mb-2">Upload Aadhaar (PDF, JPG or PNG, max 5MB). Name and DOB will be verified.</p>
            <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded mb-3">
              Tip: Use a PDF with selectable text (e.g. from UIDAI/e-Aadhaar) or a clear photo. Scanned/image-only PDFs go for manual verification.
            </p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setAadhaarFile(e.target.files?.[0] || null)}
                className="hidden"
                id="aadhaar-upload"
              />
              <label htmlFor="aadhaar-upload" className="cursor-pointer flex flex-col items-center gap-2">
                <FaCloudUploadAlt className="w-10 h-10 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {aadhaarFile ? aadhaarFile.name : 'Click to select Aadhaar document'}
                </span>
              </label>
            </div>
          </section>
        )}

        {/* Section 3 - Land Document (after identity verified) */}
        {needsLand && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Land Ownership Proof <span className="text-red-500">*</span></h2>
            <p className="text-sm text-gray-600 mb-3">Upload land ownership document (PDF, JPG or PNG, max 5MB).</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Land area (hectares, optional)</label>
              <input
                type="number"
                name="landAreaHectares"
                value={form.landAreaHectares}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="e.g. 1.5"
                className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bc-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">Used to validate plantation area does not exceed registered land.</p>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setLandFile(e.target.files?.[0] || null)}
                className="hidden"
                id="land-upload"
              />
              <label htmlFor="land-upload" className="cursor-pointer flex flex-col items-center gap-2">
                <FaCloudUploadAlt className="w-10 h-10 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {landFile ? landFile.name : 'Click to select land document'}
                </span>
              </label>
            </div>
            <button
              type="button"
              onClick={handleLandUpload}
              disabled={loading || !landFile}
              className="px-4 py-2 bg-bc-green-600 text-white rounded-lg font-medium hover:bg-bc-green-700 disabled:opacity-50"
            >
              Upload Land Document
            </button>
          </section>
        )}

        {/* Organization Details */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Organization (if applicable)</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NGO Name</label>
              <input
                type="text"
                name="ngoName"
                value={form.ngoName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bc-green-500 focus:border-bc-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
              <input
                type="text"
                name="ngoRegistrationNumber"
                value={form.ngoRegistrationNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bc-green-500 focus:border-bc-green-500"
              />
            </div>
          </div>
        </section>

        {/* Land Ownership Type */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Land Ownership Type</h2>
          <select
            name="ownershipType"
            value={form.ownershipType}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bc-green-500 focus:border-bc-green-500"
          >
            <option value="">Select</option>
            <option value="private">Private</option>
            <option value="community">Community</option>
          </select>
        </section>

        {/* Declaration */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Declaration</h2>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="declarationAccepted"
              checked={form.declarationAccepted}
              onChange={handleChange}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-bc-green-600 focus:ring-bc-green-500"
            />
            <span className="text-sm text-gray-700">
              I confirm that the information provided is accurate and I agree to the terms of the National Blue Carbon Registry.
            </span>
          </label>
        </section>

        {(needsAadhaar || user?.accountStatus === ACCOUNT_STATUS.ACTIVE) && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={
                loading ||
                !form.declarationAccepted ||
                (needsAadhaar && !aadhaarFile)
              }
              className="px-6 py-2.5 bg-bc-green-600 text-white rounded-lg font-medium hover:bg-bc-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Saving...'
                : user?.accountStatus === ACCOUNT_STATUS.ACTIVE
                ? 'Update Profile'
                : 'Submit for Identity Verification'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileKYC;
