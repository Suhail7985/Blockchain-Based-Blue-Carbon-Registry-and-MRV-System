import React, { useState, useEffect } from 'react';
import { FaTimes, FaShieldAlt, FaSave, FaTree, FaUsers } from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';

const PanchayatDataModal = ({ isOpen, onClose, plantation, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    personDays: '',
    wageRate: '',
    survivalRate: '',
    mortalityCauses: '',
    nextPlantationDate: '',
    certificationBody: '',
    localTrainingProvided: false,
  });

  useEffect(() => {
    if (plantation?.panchayatData) {
      const pd = plantation.panchayatData;
      setForm({
        personDays: pd.mgnrega?.personDays || '',
        wageRate: pd.mgnrega?.wageRate || '',
        survivalRate: pd.survivalRate || '',
        mortalityCauses: pd.mortalityCauses || '',
        nextPlantationDate: pd.nextPlantationDate ? new Date(pd.nextPlantationDate).toISOString().split('T')[0] : '',
        certificationBody: pd.certificationBody || '',
        localTrainingProvided: pd.localTrainingProvided || false,
      });
    } else {
        setForm({
            personDays: '',
            wageRate: '',
            survivalRate: '',
            mortalityCauses: '',
            nextPlantationDate: '',
            certificationBody: '',
            localTrainingProvided: false,
        });
    }
  }, [plantation, isOpen]);

  if (!isOpen || !plantation) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/panchayat/plantations/${plantation._id}/data`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.success) {
        toast.success('Panchayat verification data updated');
        onSuccess(res.data.plantation);
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 bg-amber-50 text-amber-800 flex items-center justify-between border-b border-amber-100">
          <h3 className="font-bold flex items-center gap-2">
            <FaShieldAlt /> Local Verification Data: {plantation.plantationId}
          </h3>
          <button onClick={onClose} className="hover:opacity-70"><FaTimes /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* M-GNREGA Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <FaUsers /> M-GNREGA Involvement
            </h4>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Person Days</label>
                    <input
                        type="number"
                        name="personDays"
                        value={form.personDays}
                        onChange={handleChange}
                        placeholder="e.g. 2250"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-bc-green-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Wage Rate (INR)</label>
                    <input
                        type="number"
                        name="wageRate"
                        value={form.wageRate}
                        onChange={handleChange}
                        placeholder="e.g. 220"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-bc-green-500"
                    />
                </div>
            </div>
          </div>

          {/* Survival Section */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <FaTree /> Growth & Survival
            </h4>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Survival Percentage (%)</label>
                    <input
                        type="number"
                        name="survivalRate"
                        value={form.survivalRate}
                        onChange={handleChange}
                        placeholder="e.g. 85.5"
                        step="0.01"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-bc-green-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Next Plantation Date</label>
                    <input
                        type="date"
                        name="nextPlantationDate"
                        value={form.nextPlantationDate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-bc-green-500"
                    />
                </div>
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Mortality Causes (if any)</label>
                <textarea
                    name="mortalityCauses"
                    value={form.mortalityCauses}
                    onChange={handleChange}
                    placeholder="e.g. Storm damage 15%, Crab predation 8.5%"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-bc-green-500 h-20"
                />
            </div>
          </div>

          {/* Verification Meta */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Certification Body</label>
                <input
                    type="text"
                    name="certificationBody"
                    value={form.certificationBody}
                    onChange={handleChange}
                    placeholder="e.g. FSC India"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-bc-green-500"
                />
            </div>
            <div className="flex items-center gap-3 h-full pt-4">
                <input
                  type="checkbox"
                  name="localTrainingProvided"
                  id="localTrainingProvided"
                  checked={form.localTrainingProvided}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-bc-green-600"
                />
                <label htmlFor="localTrainingProvided" className="text-xs font-medium text-gray-700">Local Training Provided?</label>
            </div>
          </div>
          
          <div className="pt-4 flex gap-3">
            <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
                Cancel
            </button>
            <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {loading ? 'Saving...' : <><FaSave /> Save verification Data</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PanchayatDataModal;
