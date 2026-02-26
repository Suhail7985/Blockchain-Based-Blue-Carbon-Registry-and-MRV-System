import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { INDIAN_STATES } from '../../utils/constants';
import {
  FiUser, FiMail, FiLock, FiPhone, FiBriefcase,
  FiMapPin, FiMap, FiFileText, FiUploadCloud,
  FiUserPlus, FiLoader, FiCheckCircle, FiXCircle,
  FiGlobe, FiAlertCircle
} from 'react-icons/fi';
import { FaTree } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';

// Helper component for input fields
const InputField = ({ icon: Icon, label, id, type = "text", placeholder, required = true, value, onChange, ...props }) => (
  <div className="w-full">
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
      <Icon className="mr-2 text-gray-500" size={16} />
      {label} {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      id={id}
      name={id}
      type={type}
      required={required}
      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white/80 backdrop-blur-sm"
      placeholder={placeholder}
      onChange={onChange}
      value={value || ''}
      {...props}
    />
  </div>
);

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    address: '',
    state: '',
    district: '',
    landOwnershipType: 'Private',
    password: '',
    confirmPassword: '',
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (pass) => {
    let score = 0;
    if (pass.length > 5) score += 1;
    if (pass.length > 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    setPasswordStrength(Math.min(5, score));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles?.length > 0) {
      const selectedFile = acceptedFiles[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1
  });

  const isFormValid = () => {
    return (
      formData.name.trim() !== '' &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
      /^\d{10}$/.test(formData.phone.replace(/\D/g, '')) &&
      formData.address.trim() !== '' &&
      formData.state !== '' &&
      formData.district.trim() !== '' &&
      formData.password.length >= 6 &&
      formData.password === formData.confirmPassword &&
      file !== null
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    // In a real app we would upload the file first and get a URL
    // For now we'll just pass the metadata
    const userData = {
      ...formData,
      // Fixed role as 'user' for public registration
      role: 'user',
      idProofUrl: file ? file.name : null
    };

    // Remove confirmPassword before sending to API
    delete userData.confirmPassword;

    const result = await register(userData);

    if (!result.success) {
      setError(result.error || 'Registration failed. Please try again.');
      toast.error(result.error || 'Registration failed');
      setLoading(false);
    } else {
      toast.success('Account created! Please verify your email.');
      navigate('/verify-email', { state: { email: formData.email } });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full relative z-10"
      >
        <div className="text-center mb-8 sticky top-0 z-20">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-blue-500 mb-4 shadow-xl"
          >
            <FiGlobe className="text-white" size={40} />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Create Blue Carbon Registry Account
          </h1>
          <p className="text-gray-600 text-lg">
            Join the decentralized MRV network for mangrove conservation
          </p>
        </div>

        <motion.div
          className="glass rounded-3xl shadow-2xl overflow-hidden border border-white/40 bg-white/60 backdrop-blur-xl"
        >
          <form onSubmit={handleSubmit} className="p-8 sm:p-10">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start"
                >
                  <FiAlertCircle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" size={18} />
                  <p className="text-red-700 text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-8">
              {/* Personal Information Group */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center border-b pb-2">
                  <span className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField icon={FiUser} label="Full Name" id="name" placeholder="John Doe" value={formData.name} onChange={handleChange} />
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <FiMail className="mr-2 text-gray-500" size={16} />
                      Email Address <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 transition-all bg-white/80 backdrop-blur-sm ${formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-200 focus:border-green-500'
                        }`}
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                      <p className="text-xs text-red-500 mt-1 flex items-center">
                        <FiXCircle className="mr-1" /> Invalid email format
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <FiPhone className="mr-2 text-gray-500" size={16} />
                      Phone Number <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 transition-all bg-white/80 backdrop-blur-sm ${formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-200 focus:border-green-500'
                        }`}
                      placeholder="10-digit mobile number"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <InputField icon={FiBriefcase} label="Organization Name (If applicable)" id="organization" required={false} placeholder="NGO or Company Name" value={formData.organization} onChange={handleChange} />
                </div>
              </div>

              {/* Location & Land Information Group */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center border-b pb-2">
                  <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
                  Location Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <InputField icon={FiMapPin} label="Complete Address" id="address" placeholder="Street, village/town, landmark" value={formData.address} onChange={handleChange} />
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <FiMap className="mr-2 text-gray-500" size={16} />
                      State <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      id="state"
                      name="state"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white/80 backdrop-blur-sm"
                      value={formData.state}
                      onChange={handleChange}
                    >
                      <option value="" disabled>Select a state</option>
                      {INDIAN_STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  <InputField icon={FiMapPin} label="District" id="district" placeholder="Enter district" value={formData.district} onChange={handleChange} />

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <FaTree className="mr-2 text-gray-500" size={16} />
                      Land Ownership Type <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="flex gap-4">
                      <label className={`flex-1 flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.landOwnershipType === 'Private' ? 'border-green-500 bg-green-50/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <input type="radio" name="landOwnershipType" value="Private" checked={formData.landOwnershipType === 'Private'} onChange={handleChange} className="sr-only" />
                        <span className={`font-medium ${formData.landOwnershipType === 'Private' ? 'text-green-700' : 'text-gray-600'}`}>Private Land</span>
                      </label>
                      <label className={`flex-1 flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.landOwnershipType === 'Community' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <input type="radio" name="landOwnershipType" value="Community" checked={formData.landOwnershipType === 'Community'} onChange={handleChange} className="sr-only" />
                        <span className={`font-medium ${formData.landOwnershipType === 'Community' ? 'text-blue-700' : 'text-gray-600'}`}>Community Land</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* ID Proof Upload */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center border-b pb-2">
                  <span className="bg-cyan-100 text-cyan-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">3</span>
                  Verification Document
                </h3>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${isDragActive ? 'border-green-500 bg-green-50/50' :
                    file ? 'border-blue-500 bg-blue-50/50' : 'border-gray-300 hover:border-green-400 hover:bg-gray-50/50'
                    }`}
                >
                  <input {...getInputProps()} />
                  {file ? (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                        <FiCheckCircle size={32} />
                      </div>
                      <p className="font-semibold text-gray-800">{file.name}</p>
                      <p className="text-sm text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="mt-4 text-sm text-red-500 hover:text-red-700 font-medium tracking-wide">
                        Remove File
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4">
                        <FiUploadCloud size={32} />
                      </div>
                      <p className="font-semibold text-gray-800">Upload ID Proof <span className="text-red-500">*</span></p>
                      <p className="text-sm text-gray-500 mt-2">Drag & drop your file here, or click to browse</p>
                      <p className="text-xs text-gray-400 mt-2">Supported: PDF, JPG, PNG (Max 5MB)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Security Group */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center border-b pb-2">
                  <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">4</span>
                  Security
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <FiLock className="mr-2 text-gray-500" size={16} />
                      Password <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white/80 backdrop-blur-sm"
                      placeholder="Minimum 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                    />

                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="mt-3">
                        <div className="flex justify-between items-center mb-1 text-xs font-medium">
                          <span className="text-gray-500">Password strength:</span>
                          <span className={`${passwordStrength < 2 ? 'text-red-500' :
                            passwordStrength < 4 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                            {passwordStrength < 2 ? 'Weak' : passwordStrength < 4 ? 'Fair' : 'Strong'}
                          </span>
                        </div>
                        <div className="flex gap-1 h-1.5">
                          {[1, 2, 3, 4, 5].map(level => (
                            <div
                              key={level}
                              className={`flex-1 rounded-full transition-colors ${level <= passwordStrength
                                ? (passwordStrength < 2 ? 'bg-red-500' : passwordStrength < 4 ? 'bg-yellow-500' : 'bg-green-500')
                                : 'bg-gray-200'
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <FiLock className="mr-2 text-gray-500" size={16} />
                      Confirm Password <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 transition-all bg-white/80 backdrop-blur-sm ${formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : formData.confirmPassword && formData.password === formData.confirmPassword
                          ? 'border-green-400 focus:border-green-500'
                          : 'border-gray-200 focus:border-green-500'
                        }`}
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                      <p className="text-xs text-green-600 mt-1 flex items-center font-medium">
                        <FiCheckCircle className="mr-1" /> Passwords match
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
              <p className="text-sm text-gray-600 order-2 sm:order-1 text-center sm:text-left">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-green-600 hover:text-green-700 transition-colors">
                  Sign in here
                </Link>
              </p>

              <motion.button
                type="submit"
                disabled={loading || !isFormValid()}
                whileHover={{ scale: (loading || !isFormValid()) ? 1 : 1.02 }}
                whileTap={{ scale: (loading || !isFormValid()) ? 1 : 0.98 }}
                className={`order-1 sm:order-2 w-full sm:w-auto min-w-[200px] font-bold py-4 px-8 rounded-xl shadow-lg transition-all flex items-center justify-center ${(loading || !isFormValid())
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:shadow-xl'
                  }`}
              >
                {loading ? (
                  <>
                    <FiLoader className="mr-2 animate-spin" size={20} />
                    Processing...
                  </>
                ) : (
                  <>
                    <FiUserPlus className="mr-2" size={20} />
                    Create Account
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
