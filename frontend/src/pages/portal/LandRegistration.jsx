import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StatusBanner from '../../components/portal/StatusBanner';
import { ACCOUNT_STATUS } from '../../constants/accountStatus';
import { FaMapMarkedAlt, FaLock } from 'react-icons/fa';

const LandRegistration = () => {
  const { user } = useAuth();
  const isActive = user?.accountStatus === ACCOUNT_STATUS.ACTIVE;

  if (!isActive) {
    return (
      <div className="max-w-2xl mx-auto">
        <StatusBanner accountStatus={user?.accountStatus} />
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <FaLock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Land Registration Locked</h2>
          <p className="text-gray-600">Complete profile verification to register land.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <FaMapMarkedAlt className="w-7 h-7 text-bc-green-600" />
        Land Registration
      </h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
        Land registration form will be implemented here.
      </div>
    </div>
  );
};

export default LandRegistration;
