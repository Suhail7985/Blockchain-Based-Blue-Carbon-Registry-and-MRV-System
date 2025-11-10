import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiFileText, FiMapPin, FiCalendar, 
  FiMail, FiCheckCircle, FiXCircle, FiLoader 
} from 'react-icons/fi';
import { FaTree } from 'react-icons/fa';

export default function PlantationForm({ onNewPlantation }) {
  const [formData, setFormData] = useState({
    plantationName: '',
    location: '',
    area: '',
    plantedDate: '',
    treeCount: '',
    mangrovePercentage: '',
    contactEmail: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/plantations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newPlantation = await response.json();
        onNewPlantation(newPlantation);
        setMessage('Plantation data submitted successfully!');
        setMessageType('success');
        setFormData({
          plantationName: '',
          location: '',
          area: '',
          plantedDate: '',
          treeCount: '',
          mangrovePercentage: '',
          contactEmail: '',
        });
        setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 5000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setMessage(errorData.message || 'Failed to submit plantation data');
        setMessageType('error');
        console.error('Error response:', response.status, errorData);
        setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 5000);
      }
    } catch (err) {
      setMessage('Backend may not be running. Please check your connection.');
      setMessageType('error');
      console.error('Error submitting plantation:', err);
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
    }
    setLoading(false);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="glass rounded-2xl shadow-xl p-8 border border-white/20 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-full -mr-32 -mt-32"></div>
      <div className="relative z-10">
        <div className="flex items-center mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-blue-500 mr-4 shadow-lg">
            <FiFileText className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-bold gradient-text">Record Plantation</h2>
            <p className="text-gray-600 text-sm mt-1">Submit your blue carbon restoration data</p>
          </div>
        </div>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-xl mb-6 flex items-center ${
                messageType === 'success'
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800'
                  : 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-800'
              }`}
            >
              {messageType === 'success' ? (
                <FiCheckCircle className="mr-3 text-green-600" size={20} />
              ) : (
                <FiXCircle className="mr-3 text-red-600" size={20} />
              )}
              <span className="font-medium">{message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-5">
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Plantation Name</label>
            <input
              type="text"
              name="plantationName"
              placeholder="Enter plantation name"
              value={formData.plantationName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white/80 backdrop-blur-sm"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FiMapPin className="mr-2 text-gray-500" size={16} />
              Location
            </label>
            <input
              type="text"
              name="location"
              placeholder="Latitude, Longitude (e.g., 19.0760, 72.8777)"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white/80 backdrop-blur-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Area (hectares)</label>
              <input
                type="number"
                name="area"
                placeholder="0.00"
                value={formData.area}
                onChange={handleChange}
                step="0.01"
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white/80 backdrop-blur-sm"
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <FaTree className="mr-2 text-gray-500" size={16} />
                Tree Count
              </label>
              <input
                type="number"
                name="treeCount"
                placeholder="0"
                value={formData.treeCount}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white/80 backdrop-blur-sm"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FiCalendar className="mr-2 text-gray-500" size={16} />
              Planted Date
            </label>
            <input
              type="date"
              name="plantedDate"
              value={formData.plantedDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white/80 backdrop-blur-sm"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Blue Carbon Type</label>
            <select
              name="mangrovePercentage"
              value={formData.mangrovePercentage}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white/80 backdrop-blur-sm"
            >
              <option value="">Select Blue Carbon Type</option>
              <option value="100% Mangroves">100% Mangroves</option>
              <option value="80% Mangroves+20% Seagrass">80% Mangroves+20% Seagrass</option>
              <option value="50% Mangroves+50% Salt Marsh">50% Mangroves+50% Salt Marsh</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>

          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FiMail className="mr-2 text-gray-500" size={16} />
              Contact Email
            </label>
            <input
              type="email"
              name="contactEmail"
              placeholder="your.email@example.com"
              value={formData.contactEmail}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white/80 backdrop-blur-sm"
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
          >
            {loading ? (
              <>
                <FiLoader className="mr-2 animate-spin" size={20} />
                Submitting...
              </>
            ) : (
              <>
                <FiCheckCircle className="mr-2" size={20} />
                Submit Plantation Data
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.form>
  );
}
