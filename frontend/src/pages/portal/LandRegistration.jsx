import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StatusBanner from '../../components/portal/StatusBanner';
import { ACCOUNT_STATUS } from '../../constants/accountStatus';
import { FaMapMarkedAlt, FaLock, FaCloudUploadAlt, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { registerLand, getVerifiedLands } from '../../services/api';
import toast from 'react-hot-toast';

const LandRegistration = () => {
  const { user } = useAuth();
  const isActive = user?.accountStatus === ACCOUNT_STATUS.ACTIVE;
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingLands, setLoadingLands] = useState(true);
  
  const [form, setForm] = useState({
    areaHectares: '',
    landReference: ''
  });
  const [landFile, setLandFile] = useState(null);

  const fetchLands = async () => {
    setLoadingLands(true);
    try {
      const res = await getVerifiedLands();
      if (res.success) {
        setLands(res.lands || []);
      }
    } catch (e) {
      toast.error('Failed to load registered lands');
    } finally {
      setLoadingLands(false);
    }
  };

  useEffect(() => {
    if (isActive) {
      fetchLands();
    }
  }, [isActive]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!landFile) {
      toast.error('Please select a land document to upload');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('landDocument', landFile);
      fd.append('areaHectares', form.areaHectares);
      fd.append('landReference', form.landReference || 'Additional Land');
      
      const res = await registerLand(fd);
      if (res.success) {
        toast.success(res.message || 'Land registered successfully!');
        setForm({ areaHectares: '', landReference: '' });
        setLandFile(null);
        fetchLands();
      } else {
        toast.error(res.message || 'Failed to register land');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register land');
    } finally {
      setLoading(false);
    }
  };

  if (!isActive) {
    return (
      <div className="max-w-2xl mx-auto">
        <StatusBanner accountStatus={user?.accountStatus} />
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <FaLock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Land Registration Locked</h2>
          <p className="text-gray-600">Complete profile verification in the "Profile & KYC" tab to unlock adding land parcels.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <StatusBanner accountStatus={user?.accountStatus} />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FaMapMarkedAlt className="w-7 h-7 text-bc-green-600" />
          Land Registration
        </h1>
        <p className="text-gray-600 mt-1">Register additional land parcels for Blue Carbon projects.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Add New Land Parcel</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Land Reference / Name <span className="text-gray-400 font-normal">(Optional)</span></label>
              <input
                type="text"
                name="landReference"
                value={form.landReference}
                onChange={handleChange}
                placeholder="e.g. North Plot, Sundarbans Phase 2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bc-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Land Area (Hectares) <span className="text-red-500">*</span></label>
              <input
                type="number"
                name="areaHectares"
                value={form.areaHectares}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                required
                placeholder="e.g. 2.5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bc-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Land Ownership Document <span className="text-red-500">*</span></label>
              <div className="border-2 border-dashed border-gray-300 hover:border-bc-green-500 transition-colors bg-gray-50 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setLandFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="additional-land-upload"
                />
                <label htmlFor="additional-land-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <FaCloudUploadAlt className={`w-8 h-8 ${landFile ? 'text-bc-green-600' : 'text-gray-400'}`} />
                  <span className="text-sm text-gray-600 font-medium">
                    {landFile ? landFile.name : 'Click to select land document'}
                  </span>
                  {!landFile && <span className="text-xs text-gray-500">PDF, JPG, PNG up to 5MB</span>}
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !landFile || !form.areaHectares}
              className="w-full px-4 py-2 bg-bc-green-600 text-white rounded-lg font-medium hover:bg-bc-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <FaSpinner className="animate-spin" />}
              {loading ? 'Registering...' : 'Register Land'}
            </button>
          </form>
        </div>

        {/* List Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Registered Lands</h2>
            <p className="text-sm text-gray-500 mt-1">Lands available for plantation submission.</p>
          </div>
          
          <div className="p-0">
            {loadingLands ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center gap-2">
                <FaSpinner className="animate-spin text-bc-green-600 w-6 h-6" />
                Loading lands...
              </div>
            ) : lands.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FaMapMarkedAlt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>No verified lands found.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {lands.map((land) => (
                  <li key={land._id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-gray-900">{land.landReference || 'Verified Land'}</h3>
                        <p className="text-sm text-gray-500 mt-1">Area: {land.areaHectares} hectares</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Registered: {new Date(land.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          <FaCheckCircle className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandRegistration;
