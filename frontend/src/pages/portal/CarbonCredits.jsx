import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StatusBanner from '../../components/portal/StatusBanner';
import { ACCOUNT_STATUS } from '../../constants/accountStatus';
import { getCarbonSummary } from '../../services/api';
import { FaCoins, FaLock } from 'react-icons/fa';

const CarbonCredits = () => {
  const { user } = useAuth();
  const isActive = user?.accountStatus === ACCOUNT_STATUS.ACTIVE;
  const [data, setData] = useState(null);

  useEffect(() => {
    if (isActive) {
      getCarbonSummary().then((r) => r.success && setData(r));
    }
  }, [isActive]);

  if (!isActive) {
    return (
      <div className="max-w-2xl mx-auto">
        <StatusBanner accountStatus={user?.accountStatus} />
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaLock className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Carbon Credits Locked</h2>
          <p className="text-gray-600">
            Complete verification to access your carbon credits and token dashboard.
          </p>
        </div>
      </div>
    );
  }

  const totalCO2 = data?.totalCO2 ?? 0;
  const totalTokens = data?.totalTokens ?? 0;
  const verifiedCount = data?.verifiedPlantations ?? 0;
  const history = data?.history ?? [];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <FaCoins className="w-7 h-7 text-bc-green-600" />
        Carbon Credits
      </h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Total CO₂ Captured</p>
          <p className="text-2xl font-bold text-gray-900">{totalCO2} tCO₂e</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Total Tokens Earned</p>
          <p className="text-2xl font-bold text-bc-green-600">{totalTokens}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Verified Plantations</p>
          <p className="text-2xl font-bold text-gray-900">{verifiedCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500">Conversion</p>
          <p className="text-sm text-gray-600">1 Token = 1 tCO₂e</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Token History</h2>
        </div>
        {history.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No token transactions yet. Submit plantations and complete NCCR verification to earn carbon credits.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plantation ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">CO₂e (t)</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tokens</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((h, i) => (
                  <tr key={i}>
                    <td className="px-6 py-3 text-sm font-mono text-gray-900">{h.plantationId}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{new Date(h.date).toLocaleDateString()}</td>
                    <td className="px-6 py-3 text-sm text-right text-gray-900">{h.co2eq}</td>
                    <td className="px-6 py-3 text-sm text-right text-bc-green-600 font-medium">{h.tokens}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarbonCredits;
