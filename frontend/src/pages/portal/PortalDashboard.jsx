import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import StatusBanner from '../../components/portal/StatusBanner';
import { ACCOUNT_STATUS } from '../../constants/accountStatus';
import { getVerifiedLands, getMyPlantations, getCarbonSummary } from '../../services/api';
import {
  FaUser,
  FaCheckCircle,
  FaClock,
  FaLeaf,
  FaInfoCircle,
  FaMapMarkedAlt,
  FaCoins,
  FaLink,
} from 'react-icons/fa';

const PLANTATION_STATUS = {
  PENDING_PANCHAYAT: 'PENDING_PANCHAYAT',
  PENDING_NCCR: 'PENDING_NCCR',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
  BLOCKCHAIN_CONFIRMED: 'BLOCKCHAIN_CONFIRMED',
  TOKEN_MINTED: 'TOKEN_MINTED',
};

const PortalDashboard = () => {
  const { user } = useAuth();
  const isActive = user?.accountStatus === ACCOUNT_STATUS.ACTIVE;
  const isProfileIncomplete = [ACCOUNT_STATUS.PROFILE_INCOMPLETE, ACCOUNT_STATUS.VERIFIED_PENDING_LAND, ACCOUNT_STATUS.IDENTITY_VERIFIED].includes(user?.accountStatus);

  const [landsCount, setLandsCount] = useState(0);
  const [plantations, setPlantations] = useState([]);
  const [carbon, setCarbon] = useState(null);

  const timeline = user?.statusTimeline || [];
  const completedSteps = timeline.filter((t) => t.completed).length;
  const progressPercent = Math.round((completedSteps / 4) * 100);

  useEffect(() => {
    if (!user) return;
    if (isActive) {
      getVerifiedLands().then((r) => r.success && r.lands && setLandsCount(r.lands.length));
      getMyPlantations().then((r) => r.success && r.plantations && setPlantations(r.plantations || []));
      getCarbonSummary().then((r) => r.success && setCarbon(r));
    }
  }, [user, isActive]);

  const pendingCount = plantations.filter(
    (p) => p.status === PLANTATION_STATUS.PENDING_PANCHAYAT || p.status === PLANTATION_STATUS.PENDING_NCCR
  ).length;
  const verifiedCount = plantations.filter(
    (p) =>
      p.status === PLANTATION_STATUS.VERIFIED ||
      p.status === PLANTATION_STATUS.BLOCKCHAIN_CONFIRMED ||
      p.status === PLANTATION_STATUS.TOKEN_MINTED
  ).length;
  const blockchainCount = plantations.filter(
    (p) => p.status === PLANTATION_STATUS.BLOCKCHAIN_CONFIRMED || p.status === PLANTATION_STATUS.TOKEN_MINTED
  ).length;

  return (
    <div className="max-w-5xl mx-auto">
      <StatusBanner accountStatus={user?.accountStatus} />

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Welcome, {user?.name}
        </h1>
        <p className="text-gray-600">National Blue Carbon Registry & MRV System</p>
        {user?.referenceId && (
          <p className="text-sm text-gray-500 mt-2">
            Reference ID: <span className="font-mono font-medium">{user.referenceId}</span>
          </p>
        )}
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaCheckCircle className="w-5 h-5 text-bc-green-600" />
          Account Status
        </h2>
        <div className="flex flex-wrap gap-4 items-center">
          <span
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              user?.accountStatus === ACCOUNT_STATUS.ACTIVE
                ? 'bg-bc-green-100 text-bc-green-800'
                : user?.accountStatus === ACCOUNT_STATUS.PENDING_VERIFICATION || user?.accountStatus === ACCOUNT_STATUS.MANUAL_REVIEW
                ? 'bg-yellow-100 text-yellow-800'
                : user?.accountStatus === ACCOUNT_STATUS.REJECTED
                ? 'bg-red-100 text-red-800'
                : user?.accountStatus === ACCOUNT_STATUS.VERIFIED_PENDING_LAND || user?.accountStatus === ACCOUNT_STATUS.IDENTITY_VERIFIED
                ? 'bg-blue-100 text-blue-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {user?.accountStatus === ACCOUNT_STATUS.ACTIVE && 'Active'}
            {(user?.accountStatus === ACCOUNT_STATUS.PENDING_VERIFICATION || user?.accountStatus === ACCOUNT_STATUS.MANUAL_REVIEW) && (user?.accountStatus === ACCOUNT_STATUS.MANUAL_REVIEW ? 'Manual Review' : 'Pending Verification')}
            {user?.accountStatus === ACCOUNT_STATUS.REJECTED && 'Rejected'}
            {user?.accountStatus === ACCOUNT_STATUS.PROFILE_INCOMPLETE && 'Profile Incomplete'}
            {(user?.accountStatus === ACCOUNT_STATUS.VERIFIED_PENDING_LAND || user?.accountStatus === ACCOUNT_STATUS.IDENTITY_VERIFIED) && 'Pending Land Proof'}
          </span>
        </div>
      </section>

      {isActive && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Summary</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <FaMapMarkedAlt className="w-4 h-4" /> Registered Lands
              </p>
              <p className="text-xl font-bold text-gray-900 mt-1">{landsCount}</p>
            </div>
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <FaLeaf className="w-4 h-4" /> Plantations Submitted
              </p>
              <p className="text-xl font-bold text-gray-900 mt-1">{plantations.length}</p>
            </div>
            <div className="p-4 rounded-lg border border-gray-200 bg-amber-50">
              <p className="text-sm text-gray-500">Pending Verification</p>
              <p className="text-xl font-bold text-amber-800 mt-1">{pendingCount}</p>
            </div>
            <div className="p-4 rounded-lg border border-gray-200 bg-bc-green-50">
              <p className="text-sm text-gray-500">Verified Plantations</p>
              <p className="text-xl font-bold text-bc-green-800 mt-1">{verifiedCount}</p>
            </div>
            <div className="p-4 rounded-lg border border-gray-200 bg-bc-green-50">
              <p className="text-sm text-gray-500">Total CO₂ Generated (tCO₂e)</p>
              <p className="text-xl font-bold text-bc-green-800 mt-1">{carbon?.totalCO2 ?? 0}</p>
            </div>
            <div className="p-4 rounded-lg border border-gray-200 bg-bc-green-50">
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <FaCoins className="w-4 h-4" /> Total Tokens Earned
              </p>
              <p className="text-xl font-bold text-bc-green-800 mt-1">{carbon?.totalTokens ?? 0}</p>
            </div>
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 col-span-2 sm:col-span-3 lg:col-span-2">
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <FaLink className="w-4 h-4" /> Blockchain Records
              </p>
              <p className="text-xl font-bold text-gray-900 mt-1">{blockchainCount} record(s)</p>
              <Link to="/portal/blockchain" className="text-sm text-bc-green-600 font-medium mt-1 inline-block hover:underline">
                View records →
              </Link>
            </div>
          </div>
        </section>
      )}

      {isProfileIncomplete && (
        <>
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Completion Progress</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium text-gray-900">{progressPercent}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-bc-green-600 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <Link
              to="/portal/profile"
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-bc-green-600 text-white rounded-lg font-medium hover:bg-bc-green-700"
            >
              Complete Profile Now
            </Link>
          </section>
        </>
      )}

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaInfoCircle className="w-5 h-5 text-bc-green-600" />
          About Blue Carbon
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          Blue carbon refers to carbon captured by ocean and coastal ecosystems. Mangroves,
          seagrasses, and salt marshes sequester and store large amounts of carbon. The National
          Blue Carbon Registry, under MoES/NCCR, tracks restoration efforts and issues verified
          carbon credits for climate action.
        </p>
      </section>

      {isActive && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/portal/plantation"
              className="p-4 rounded-lg border border-gray-200 hover:border-bc-green-300 hover:bg-bc-green-50 transition-colors"
            >
              <FaLeaf className="w-8 h-8 text-bc-green-600 mb-2" />
              <h3 className="font-medium text-gray-900">Submit Plantation</h3>
              <p className="text-sm text-gray-500 mt-1">Record new plantation data</p>
            </Link>
            <Link
              to="/portal/carbon"
              className="p-4 rounded-lg border border-gray-200 hover:border-bc-green-300 hover:bg-bc-green-50 transition-colors"
            >
              <FaCheckCircle className="w-8 h-8 text-bc-green-600 mb-2" />
              <h3 className="font-medium text-gray-900">Carbon Credits</h3>
              <p className="text-sm text-gray-500 mt-1">View your earned tokens</p>
            </Link>
            <Link
              to="/portal/blockchain"
              className="p-4 rounded-lg border border-gray-200 hover:border-bc-green-300 hover:bg-bc-green-50 transition-colors"
            >
              <FaLink className="w-8 h-8 text-bc-green-600 mb-2" />
              <h3 className="font-medium text-gray-900">Blockchain Records</h3>
              <p className="text-sm text-gray-500 mt-1">View transaction history</p>
            </Link>
            <Link
              to="/portal/profile"
              className="p-4 rounded-lg border border-gray-200 hover:border-bc-green-300 hover:bg-bc-green-50 transition-colors"
            >
              <FaUser className="w-8 h-8 text-bc-green-600 mb-2" />
              <h3 className="font-medium text-gray-900">Profile & KYC</h3>
              <p className="text-sm text-gray-500 mt-1">Update your details</p>
            </Link>
          </div>
        </section>
      )}

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaClock className="w-5 h-5 text-bc-green-600" />
          Account Status Timeline
        </h2>
        <div className="space-y-4">
          {(timeline.length ? timeline : [
            { step: 'Email Verified', completed: true },
            { step: 'Identity Verified', completed: false },
            { step: 'Land Verified', completed: false },
            { step: 'Account Activated', completed: false },
          ]).map((item, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  item.completed ? 'bg-bc-green-100 text-bc-green-700' : 'bg-gray-100 text-gray-400'
                }`}
              >
                {item.completed ? (
                  <FaCheckCircle className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{idx + 1}</span>
                )}
              </div>
              <div>
                <p className={`font-medium ${item.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                  {item.step}
                </p>
                {item.completedAt && (
                  <p className="text-xs text-gray-500">
                    {new Date(item.completedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PortalDashboard;
