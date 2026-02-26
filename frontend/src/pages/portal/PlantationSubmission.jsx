import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StatusBanner from '../../components/portal/StatusBanner';
import { ACCOUNT_STATUS } from '../../constants/accountStatus';
import { getVerifiedLands, submitPlantation } from '../../services/api';
import { FaSeedling, FaLock, FaMapMarkerAlt, FaImages } from 'react-icons/fa';
import toast from 'react-hot-toast';

const PlantationSubmission = () => {
  const { user } = useAuth();
  const isActive = user?.accountStatus === ACCOUNT_STATUS.ACTIVE;

  const [lands, setLands] = useState([]);
  const [loadingLands, setLoadingLands] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    landId: '',
    speciesName: '',
    treeCount: '',
    areaHectares: '',
    plantationDate: '',
    lat: '',
    lng: '',
    declarationAccepted: false,
  });
  const [images, setImages] = useState([]);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isActive) {
      setLoadingLands(true);
      getVerifiedLands()
        .then((res) => {
          if (res.success && res.lands) setLands(res.lands);
        })
        .catch(() => toast.error('Failed to load verified lands'))
        .finally(() => setLoadingLands(false));
    }
  }, [isActive]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleAutoDetectGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
        }));
        toast.success('GPS coordinates captured');
        setGpsLoading(false);
      },
      () => {
        toast.error('Could not get location. Check permissions or enter manually.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      toast.error('Maximum 5 images allowed.');
      return;
    }
    setImages((prev) => prev.concat(files).slice(0, 5));
  };

  const removeImage = (index) => setImages((prev) => prev.filter((_, i) => i !== index));

  const validate = () => {
    const err = {};
    if (!form.landId) err.landId = 'Select verified land';
    if (!form.speciesName?.trim()) err.speciesName = 'Species name is required';
    if (!form.treeCount || form.treeCount < 1) err.treeCount = 'Tree count must be at least 1';
    if (form.areaHectares === '' || parseFloat(form.areaHectares) < 0) err.areaHectares = 'Valid area (hectares) is required';
    if (!form.plantationDate) err.plantationDate = 'Plantation date is required';
    if (!form.lat || !form.lng) err.gps = 'GPS coordinates (latitude and longitude) are required';
    if (!form.declarationAccepted) err.declarationAccepted = 'You must accept the declaration';
    const selectedLand = lands.find((l) => l._id === form.landId);
    if (selectedLand && form.areaHectares !== '' && parseFloat(form.areaHectares) > (selectedLand.areaHectares || 0)) {
      err.areaHectares = `Area cannot exceed registered land area (${selectedLand.areaHectares} ha)`;
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isActive) return;
    if (!validate()) return;

    setSubmitting(true);
    const formData = new FormData();
    formData.append('landId', form.landId);
    formData.append('speciesName', form.speciesName.trim());
    formData.append('treeCount', form.treeCount);
    formData.append('areaHectares', form.areaHectares);
    formData.append('plantationDate', form.plantationDate);
    formData.append('declarationAccepted', 'true');
    if (form.lat) formData.append('lat', form.lat);
    if (form.lng) formData.append('lng', form.lng);
    images.forEach((file) => formData.append('plantationImages', file));

    try {
      const res = await submitPlantation(formData);
      if (res.success) {
        toast.success(res.message || 'Plantation submitted successfully.');
        setForm({
          landId: form.landId,
          speciesName: '',
          treeCount: '',
          areaHectares: '',
          plantationDate: '',
          lat: '',
          lng: '',
          declarationAccepted: false,
        });
        setImages([]);
      } else {
        toast.error(res.message || 'Submission failed.');
        if (res.errors) setErrors(res.errors.reduce((a, e) => ({ ...a, [e.path]: e.msg }), {}));
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit plantation.';
      toast.error(msg);
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors.reduce((a, e) => ({ ...a, [e.path || e.param]: e.msg }), {}));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <StatusBanner accountStatus={user?.accountStatus} />
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <FaSeedling className="w-7 h-7 text-bc-green-600" />
        Plantation Submission
      </h1>

      {!isActive && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <FaLock className="w-6 h-6 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800">
            Complete profile and land verification to submit plantation data. Submission will be enabled after your account is active.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Verified Land *</label>
            <select
              name="landId"
              value={form.landId}
              onChange={handleChange}
              disabled={!isActive || loadingLands}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bc-green-500 focus:border-bc-green-500 disabled:bg-gray-100"
            >
              <option value="">
                {loadingLands ? 'Loading...' : lands.length === 0 ? 'No verified land. Complete verification first.' : 'Select verified land'}
              </option>
              {lands.map((land) => (
                <option key={land._id} value={land._id}>
                  {land.landReference || 'Land'} — {land.areaHectares} ha
                </option>
              ))}
            </select>
            {errors.landId && <p className="text-sm text-red-600 mt-1">{errors.landId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Species Name *</label>
            <input
              type="text"
              name="speciesName"
              value={form.speciesName}
              onChange={handleChange}
              placeholder="e.g. Rhizophora mucronata"
              disabled={!isActive}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bc-green-500 focus:border-bc-green-500 disabled:bg-gray-100"
            />
            {errors.speciesName && <p className="text-sm text-red-600 mt-1">{errors.speciesName}</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tree Count *</label>
              <input
                type="number"
                name="treeCount"
                value={form.treeCount}
                onChange={handleChange}
                min="1"
                disabled={!isActive}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bc-green-500 focus:border-bc-green-500 disabled:bg-gray-100"
              />
              {errors.treeCount && <p className="text-sm text-red-600 mt-1">{errors.treeCount}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plantation Area (hectares) *</label>
              <input
                type="number"
                name="areaHectares"
                value={form.areaHectares}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="e.g. 0.5"
                disabled={!isActive}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bc-green-500 focus:border-bc-green-500 disabled:bg-gray-100"
              />
              {errors.areaHectares && <p className="text-sm text-red-600 mt-1">{errors.areaHectares}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plantation Date *</label>
            <input
              type="date"
              name="plantationDate"
              value={form.plantationDate}
              onChange={handleChange}
              disabled={!isActive}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bc-green-500 focus:border-bc-green-500 disabled:bg-gray-100"
            />
            {errors.plantationDate && <p className="text-sm text-red-600 mt-1">{errors.plantationDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GPS Coordinates *</label>
            <div className="flex gap-2 flex-wrap">
              <input
                type="text"
                name="lat"
                value={form.lat}
                onChange={handleChange}
                placeholder="Latitude"
                disabled={!isActive}
                className="flex-1 min-w-[120px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bc-green-500 disabled:bg-gray-100"
              />
              <input
                type="text"
                name="lng"
                value={form.lng}
                onChange={handleChange}
                placeholder="Longitude"
                disabled={!isActive}
                className="flex-1 min-w-[120px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bc-green-500 disabled:bg-gray-100"
              />
              <button
                type="button"
                onClick={handleAutoDetectGPS}
                disabled={!isActive || gpsLoading}
                className="px-4 py-2 bg-bc-green-100 text-bc-green-800 rounded-lg font-medium hover:bg-bc-green-200 flex items-center gap-2"
              >
                <FaMapMarkerAlt className="w-4 h-4" />
                {gpsLoading ? 'Getting...' : 'Auto-detect'}
              </button>
            </div>
            {errors.gps && <p className="text-sm text-red-600 mt-1">{errors.gps}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaImages className="inline w-4 h-4 mr-1" /> Upload Plantation Images (max 5, JPG/PNG)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              multiple
              onChange={handleImageChange}
              disabled={!isActive || images.length >= 5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-bc-green-50 file:text-bc-green-700 disabled:bg-gray-100"
            />
            {images.length > 0 && (
              <ul className="mt-2 space-y-1">
                {images.map((file, i) => (
                  <li key={i} className="flex items-center justify-between text-sm text-gray-600">
                    <span>{file.name}</span>
                    <button type="button" onClick={() => removeImage(i)} className="text-red-600 hover:underline">
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="declarationAccepted"
                checked={form.declarationAccepted}
                onChange={handleChange}
                disabled={!isActive}
                className="mt-1 rounded border-gray-300 text-bc-green-600 focus:ring-bc-green-500"
              />
              <span className="text-sm text-gray-700">
                I declare that the plantation details and location provided are correct to the best of my knowledge and that the area does not exceed my registered land area.
              </span>
            </label>
            {errors.declarationAccepted && <p className="text-sm text-red-600 mt-1">{errors.declarationAccepted}</p>}
          </div>

          <button
            type="submit"
            disabled={!isActive || submitting}
            className={`w-full py-2.5 rounded-lg font-medium ${
              isActive && !submitting
                ? 'bg-bc-green-600 text-white hover:bg-bc-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {submitting ? 'Submitting...' : isActive ? 'Submit Plantation' : 'Complete Verification to Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlantationSubmission;
