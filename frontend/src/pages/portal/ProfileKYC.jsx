import React, { useState, useEffect } from 'react';
import { indiaStatesData } from '../../utils/indiaData';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import StatusBanner from '../../components/portal/StatusBanner';
import { ACCOUNT_STATUS } from '../../constants/accountStatus';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaCloudUploadAlt,
  FaUser,
  FaIdCard,
  FaMapMarkedAlt,
  FaInfoCircle,
  FaWallet,
  FaUserEdit
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const formatDateForInput = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toISOString().split('T')[0];
};

const ProfileKYC = () => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
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
    walletAddress: '',
    zipCode: '',
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
        walletAddress: user.walletAddress || '',
        zipCode: user.zipCode || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: type === 'checkbox' ? checked : value };
      if (name === 'state') {
        updated.district = ''; // Reset district when state changes
      }
      return updated;
    });
  };

  const handleUpdateProfile = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      // Clean empty strings for optional fields
      Object.keys(payload).forEach(key => {
        if (payload[key] === '') payload[key] = undefined;
      });

      const res = await api.patch('/profile', payload);
      if (res.data.success) {
        toast.success(res.data.message);
        await refreshUser();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitKYC = async (e) => {
    e.preventDefault();
    if (!aadhaarFile && !user?.aadhaarDocumentPath) {
      toast.error('Please select an Aadhaar document.');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('dateOfBirth', form.dateOfBirth);
      fd.append('phone', form.phone);
      fd.append('address', form.address);
      fd.append('state', form.state || '');
      fd.append('district', form.district || '');
      if (form.ngoName) fd.append('ngoName', form.ngoName);
      if (form.ngoRegistrationNumber) fd.append('ngoRegistrationNumber', form.ngoRegistrationNumber);
      if (form.ownershipType) fd.append('ownershipType', form.ownershipType);
      fd.append('declarationAccepted', form.declarationAccepted);
      if (form.zipCode) fd.append('zipCode', form.zipCode);
      if (form.walletAddress) fd.append('walletAddress', form.walletAddress);
      if (aadhaarFile) fd.append('aadhaar', aadhaarFile);

      const res = await api.put('/profile', fd);
      if (res.data.success) {
        toast.success('KYC submitted for verification');
        setAadhaarFile(null);
        await refreshUser();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit KYC');
    } finally {
      setLoading(false);
    }
  };

  const handleLandUpload = async (e) => {
    e.preventDefault();
    if (!landFile) {
      toast.error('Please select a land document.');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('landDocument', landFile);
      if (form.landAreaHectares !== '' && !isNaN(parseFloat(form.landAreaHectares))) {
        fd.append('landAreaHectares', form.landAreaHectares);
      }
      if (form.walletAddress) fd.append('walletAddress', form.walletAddress);
      const res = await api.put('/profile/land-document', fd);
      if (res.data.success) {
        toast.success(res.data.message);
        setLandFile(null);
        await refreshUser();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload land document');
    } finally {
      setLoading(false);
    }
  };

  const needsAadhaar = ![ACCOUNT_STATUS.ACTIVE, ACCOUNT_STATUS.PENDING_VERIFICATION].includes(user?.accountStatus);
  const needsLand = user?.accountStatus === ACCOUNT_STATUS.VERIFIED_PENDING_LAND || user?.accountStatus === ACCOUNT_STATUS.IDENTITY_VERIFIED;
  const timeline = user?.statusTimeline || [];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaInfoCircle },
    { id: 'personal', label: 'Personal Details', icon: FaUserEdit },
    { id: 'kyc', label: 'Identity & KYC', icon: FaIdCard },
    { id: 'assets', label: 'Land & Assets', icon: FaMapMarkedAlt },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <StatusBanner accountStatus={user?.accountStatus} />

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Navigation Tabs */}
        <div className="md:w-64 shrink-0 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === tab.id
                  ? 'bg-bc-green-600 text-white shadow-lg shadow-bc-green/20'
                  : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
                }`}
            >
              <tab.icon className="w-5 h-5 ml-[-4px]" />
              {tab.label}
            </button>
          ))}

          <div className="mt-8 p-6 bg-bc-green-50 rounded-3xl border border-bc-green-100">
            <h4 className="text-[10px] font-black text-bc-green-700 uppercase tracking-widest mb-1">Registry Handle</h4>
            <p className="font-mono text-xs font-bold text-bc-green-800 break-all">{user?.referenceId || 'GENERATING...'}</p>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 min-h-[500px]"
            >
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Account Overview</h2>
                    <p className="text-gray-500 font-medium text-sm">Monitor your verification progress and account integrity status.</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Verification Status</p>
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${user?.accountStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                          {user?.accountStatus === 'ACTIVE' ? <FaCheckCircle className="w-6 h-6" /> : <FaInfoCircle className="w-6 h-6" />}
                        </div>
                        <div>
                          <p className="text-lg font-black text-gray-900 leading-tight">{user?.accountStatus?.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-gray-500 font-medium">Updated on {new Date(user?.updatedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Blockchain Wallet</p>
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                          <FaWallet className="w-6 h-6" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-black text-gray-900 truncate">{user?.walletAddress || 'NOT LINKED'}</p>
                          <p className="text-xs text-gray-500 font-medium">BCC Token Destination</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Verification Timeline</h3>
                    <div className="space-y-6 relative ml-4 border-l-2 border-gray-100 pl-8 py-2">
                      {timeline.map((item, idx) => (
                        <div key={idx} className="relative">
                          <div className={`absolute -left-[41px] top-0 w-5 h-5 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${item.completed ? 'bg-bc-green-500 text-white' : 'bg-gray-200'}`}>
                            {item.completed && <FaCheckCircle className="w-2 h-2" />}
                          </div>
                          <div>
                            <h4 className={`text-sm font-black ${item.completed ? 'text-gray-900' : 'text-gray-400'}`}>{item.step}</h4>
                            {item.completedAt && <p className="text-[10px] text-gray-400 font-bold">{new Date(item.completedAt).toLocaleDateString()}</p>}
                            {item.notes && <p className="text-xs text-gray-500 mt-1 font-medium">{item.notes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'personal' && (
                <form onSubmit={handleUpdateProfile} className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Personal Details</h2>
                    <p className="text-gray-500 font-medium text-sm">Manage your personal identification and contact information.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Legal Name</label>
                      <input
                        type="text" name="name" value={form.name} onChange={handleChange}
                        className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-bc-green-500 outline-none font-bold text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Date of Birth</label>
                      <input
                        type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange}
                        className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-bc-green-500 outline-none font-bold text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mobile Number</label>
                      <input
                        type="tel" name="phone" value={form.phone} onChange={handleChange}
                        className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-bc-green-500 outline-none font-bold text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">State</label>
                      <select
                        name="state" value={form.state} onChange={handleChange}
                        className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-bc-green-500 outline-none font-bold text-sm appearance-none"
                      >
                        <option value="">Select State</option>
                        {Object.keys(indiaStatesData).sort().map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">District / Region</label>
                      <select
                        name="district" value={form.district} onChange={handleChange} disabled={!form.state}
                        className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-bc-green-500 outline-none font-bold text-sm appearance-none disabled:opacity-50"
                      >
                        <option value="">Select District</option>
                        {form.state && indiaStatesData[form.state]?.sort().map(district => (
                          <option key={district} value={district}>{district}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Postal / Zip Code</label>
                      <input
                        type="text" name="zipCode" value={form.zipCode} onChange={handleChange}
                        className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-bc-green-500 outline-none font-bold text-sm"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Postal Address</label>
                      <textarea
                        name="address" value={form.address} onChange={handleChange}
                        className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-bc-green-500 outline-none font-medium text-sm h-32 resize-none"
                      />
                    </div>
                  </div>

                  {user?.role === 'ngo' && (
                    <div className="pt-8 border-t border-gray-50 grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">NGO Legal Name</label>
                        <input
                          type="text" name="ngoName" value={form.ngoName} onChange={handleChange}
                          className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">NGO Registration ID</label>
                        <input
                          type="text" name="ngoRegistrationNumber" value={form.ngoRegistrationNumber} onChange={handleChange}
                          className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-6">
                    <button
                      type="submit" disabled={loading}
                      className="px-8 py-3 bg-gray-900 text-white rounded-2xl text-sm font-black hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-95 disabled:opacity-50"
                    >
                      {loading ? 'Synchronizing...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'kyc' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">Identity Verification</h2>
                    <p className="text-gray-500 font-medium text-sm">Upload official government documents to verify your account.</p>
                  </div>

                  {user?.identityVerifiedAt ? (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 flex items-center gap-6">
                      <div className="p-4 bg-white rounded-2xl text-emerald-600 shadow-sm">
                        <FaCheckCircle className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-emerald-900">Identity Verified</h4>
                        <p className="text-emerald-700 font-medium text-sm">Your government ID has been authenticated and linked to your registry handle.</p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitKYC} className="space-y-6">
                      <div className="p-8 border-2 border-dashed border-gray-100 rounded-3xl text-center bg-gray-50/50">
                        <input
                          type="file" id="aadhaar-upload" className="hidden"
                          onChange={(e) => setAadhaarFile(e.target.files?.[0] || null)}
                        />
                        <label htmlFor="aadhaar-upload" className="cursor-pointer group">
                          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                            <FaCloudUploadAlt className="w-8 h-8 text-bc-green-500" />
                          </div>
                          <p className="text-sm font-black text-gray-900">{aadhaarFile ? aadhaarFile.name : 'Select Identity Document'}</p>
                          <p className="text-xs text-gray-500 mt-1 font-medium">PDF, JPG or PNG (Max 5MB)</p>
                        </label>
                      </div>

                      <div className="space-y-4">
                        <label className="flex items-start gap-4 cursor-pointer p-4 hover:bg-gray-50 rounded-2xl transition-colors">
                          <input
                            type="checkbox" name="declarationAccepted" checked={form.declarationAccepted}
                            onChange={handleChange} required
                            className="mt-1 w-5 h-5 rounded-lg border-gray-200 text-bc-green-600 focus:ring-bc-green-500"
                          />
                          <span className="text-xs text-gray-600 font-medium leading-relaxed">
                            I solemnly declare that the uploaded document represents my legal identity. I understand that any discrepancy in name or DOB will result in manual review by Panchayat officials.
                          </span>
                        </label>
                      </div>

                      <div className="flex justify-center flex-col items-center gap-4">
                        <button
                          type="submit" disabled={loading || !form.declarationAccepted || (!aadhaarFile && !user?.aadhaarDocumentPath)}
                          className="w-full max-w-xs py-4 bg-bc-green-600 text-white rounded-2xl text-sm font-black hover:bg-bc-green-700 shadow-xl shadow-bc-green/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                          {loading ? 'Extracting Data...' : 'Submit Identity Document'}
                        </button>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">Encryption: 256-bit SSL secured transmission</p>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {activeTab === 'assets' && (
                <div className="space-y-12">
                  {/* Wallet Section */}
                  <section className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 mb-2">Blockchain Wallet</h2>
                      <p className="text-gray-500 font-medium text-sm">Configure your digital vault for receiving carbon credit tokens.</p>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-gray-900 to-black rounded-3xl text-white shadow-2xl">
                      <div className="flex justify-between items-start mb-12">
                        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                          <FaWallet className="w-6 h-6 text-bc-green-400" />
                        </div>
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] pt-2">Active Network: Polygon</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Public Wallet Address</p>
                        <input
                          type="text" name="walletAddress" value={form.walletAddress} onChange={handleChange}
                          placeholder="0x..."
                          className="w-full bg-transparent p-0 border-none outline-none font-mono text-lg font-bold placeholder:text-white/20 focus:ring-0"
                        />
                      </div>
                      <button
                        onClick={() => handleUpdateProfile()}
                        className="mt-8 text-xs font-black text-bc-green-400 hover:text-bc-green-300 transition-colors uppercase tracking-widest"
                      >
                        Update Linkage →
                      </button>
                    </div>
                  </section>

                  {/* Land Assets Section */}
                  <section className="space-y-6 pt-12 border-t border-gray-50">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900 mb-2">Land Assets</h2>
                      <p className="text-gray-500 font-medium text-sm">Registered land parcels approved for sequestration projects.</p>
                    </div>

                    {user?.accountStatus === ACCOUNT_STATUS.ACTIVE ? (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="p-4 bg-white rounded-2xl text-emerald-600 shadow-sm border border-emerald-50">
                            <FaMapMarkedAlt className="w-8 h-8" />
                          </div>
                          <div>
                            <h4 className="text-lg font-black text-emerald-900">Land Verified</h4>
                            <p className="text-emerald-700 font-medium text-sm">Project capacity: {user?.landAreaHectares || '---'} Hectares</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-3 py-1 rounded shadow-sm">AUTHENTICATED</span>
                      </div>
                    ) : user?.landDocumentPath ? (
                      <div className="bg-amber-50 border border-amber-100 rounded-3xl p-8 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="p-4 bg-white rounded-2xl text-amber-600 shadow-sm border border-amber-50">
                            <FaMapMarkedAlt className="w-8 h-8" />
                          </div>
                          <div>
                            <h4 className="text-lg font-black text-amber-900">Land Under Review</h4>
                            <p className="text-amber-700 font-medium text-sm">Pending Panchayat authentication.</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-3 py-1 rounded shadow-sm">PENDING</span>
                      </div>
                    ) : (
                      <form onSubmit={handleLandUpload} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Total Ownership Area (Ha)</label>
                            <input
                              type="number" name="landAreaHectares" value={form.landAreaHectares} onChange={handleChange} step="0.01"
                              className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-bc-green-500 outline-none font-bold text-sm"
                              placeholder="e.g. 1.25"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ownership Rights</label>
                            <select
                              name="ownershipType" value={form.ownershipType} onChange={handleChange}
                              className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-bc-green-500 outline-none font-bold text-sm"
                            >
                              <option value="">Select Rights</option>
                              <option value="private">Private Lease / Title</option>
                              <option value="community">Community Management</option>
                            </select>
                          </div>
                        </div>

                        <div className="p-8 border-2 border-dashed border-gray-100 rounded-3xl text-center bg-gray-50/50">
                          <input
                            type="file" id="land-upload" className="hidden"
                            onChange={(e) => setLandFile(e.target.files?.[0] || null)}
                          />
                          <label htmlFor="land-upload" className="cursor-pointer group">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                              <FaCloudUploadAlt className="w-8 h-8 text-bc-green-500" />
                            </div>
                            <p className="text-sm font-black text-gray-900">{landFile ? landFile.name : 'Select Land Title / Document'}</p>
                            <p className="text-xs text-gray-500 mt-1 font-medium">Digital copy of official records (Max 5MB)</p>
                          </label>
                        </div>

                        <div className="flex justify-center">
                          <button
                            type="submit" disabled={loading || !landFile}
                            className="w-full max-w-xs py-4 bg-gray-900 text-white rounded-2xl text-sm font-black hover:bg-black shadow-xl transition-all active:scale-95 disabled:opacity-50"
                          >
                            {loading ? 'Uploading Data...' : 'Submit Asset Proof'}
                          </button>
                        </div>
                      </form>
                    )}
                  </section>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ProfileKYC;
