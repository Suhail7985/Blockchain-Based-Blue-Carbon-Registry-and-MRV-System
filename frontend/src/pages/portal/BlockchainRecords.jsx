import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import StatusBanner from '../../components/portal/StatusBanner';
import { ACCOUNT_STATUS } from '../../constants/accountStatus';
import { getMyPlantations } from '../../services/api';
import StatusTimeline from '../../components/plantation/StatusTimeline';
import { buildLifecycleTimestamps } from '../../utils/plantationLifecycle';
import { FaLink, FaLock } from 'react-icons/fa';

const STATUS_BADGES = {
  BLOCKCHAIN_CONFIRMED: 'bg-blue-100 text-blue-800',
  TOKEN_MINTED: 'bg-bc-green-100 text-bc-green-800',
  VERIFIED: 'bg-gray-100 text-gray-800',
};

const BlockchainRecords = () => {
  const { user } = useAuth();
  const isActive = user?.accountStatus === ACCOUNT_STATUS.ACTIVE;
  const [plantations, setPlantations] = useState([]);

  useEffect(() => {
    if (isActive) {
      getMyPlantations().then((r) => {
        if (r.success && r.plantations) {
          const withBlockchain = r.plantations.filter(
            (p) => p.blockchainTxHash || p.tokenTxHash || p.status === 'BLOCKCHAIN_CONFIRMED' || p.status === 'TOKEN_MINTED'
          );
          setPlantations(withBlockchain);
        }
      });
    }
  }, [isActive]);

  if (!isActive) {
    return (
      <div className="max-w-2xl mx-auto">
        <StatusBanner accountStatus={user?.accountStatus} />
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <FaLock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Blockchain Records Locked</h2>
          <p className="text-gray-600">Complete verification to view blockchain records.</p>
        </div>
      </div>
    );
  }

  const hasRecords = plantations.length > 0;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <FaLink className="w-7 h-7 text-bc-green-600" />
        Blockchain Records
      </h1>

      {!hasRecords ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-600 mb-4">No blockchain records yet.</p>
          <p className="text-sm text-gray-500 mb-6">
            Submit plantation data and complete Panchayat and NCCR verification to generate blockchain records and token minting.
          </p>
          <Link
            to="/portal/plantation"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-bc-green-600 text-white rounded-lg font-medium hover:bg-bc-green-700"
          >
            Submit Plantation Data
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plantation ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blockchain Hash</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tokens</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lifecycle</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {plantations.map((p) => (
                  <tr key={p._id}>
                    <td className="px-6 py-3 text-sm font-mono text-gray-900">{p.plantationId}</td>
                    <td className="px-6 py-3 text-xs font-mono text-gray-600 max-w-[120px] truncate" title={p.blockchainHash}>
                      {p.blockchainHash || '—'}
                    </td>
                    <td className="px-6 py-3 text-xs font-mono text-gray-600 max-w-[140px] truncate" title={p.tokenTxHash || p.blockchainTxHash}>
                      {p.tokenTxHash || p.blockchainTxHash || '—'}
                    </td>
                    <td className="px-6 py-3 text-sm text-right text-bc-green-600 font-medium">
                      {p.carbonCalculation?.tokens ?? '—'}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {p.submissionTimestamp ? new Date(p.submissionTimestamp).toLocaleString() : '—'}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${STATUS_BADGES[p.status] || 'bg-gray-100 text-gray-800'}`}>
                        {p.status === 'TOKEN_MINTED' ? 'Token Minted' : p.status === 'BLOCKCHAIN_CONFIRMED' ? 'Blockchain Confirmed' : p.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <StatusTimeline
                        status={p.status}
                        timestamps={buildLifecycleTimestamps(p)}
                        compact
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockchainRecords;
