import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import StatusBanner from '../../components/portal/StatusBanner';
import { ACCOUNT_STATUS } from '../../constants/accountStatus';
import api from '../../services/api';
import { FaLink, FaLock, FaExternalLinkAlt, FaHistory, FaCoins, FaCheckDouble } from 'react-icons/fa';
import PlantationHistoryModal from '../../components/plantation/PlantationHistoryModal';

const STATUS_BADGES = {
  BLOCKCHAIN_CONFIRMED: 'bg-blue-100 text-blue-800 border border-blue-200',
  TOKEN_MINTED: 'bg-bc-green-100 text-bc-green-800 border border-bc-green-200',
  VERIFIED: 'bg-gray-100 text-gray-800 border border-gray-200',
};

const BlockchainRecords = () => {
  const { user } = useAuth();
  const isActive = user?.accountStatus === ACCOUNT_STATUS.ACTIVE;
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlantation, setSelectedPlantation] = useState(null);

  useEffect(() => {
    if (isActive) {
      setLoading(true);
      api.get('/ledger')
        .then((res) => {
          if (res.data.success) {
            setEntries(res.data.entries || []);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isActive]);

  if (!isActive) {
    return (
      <div className="max-w-2xl mx-auto">
        <StatusBanner accountStatus={user?.accountStatus} />
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <FaLock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Blockchain Records Locked</h2>
          <p className="text-gray-600">Complete verification to preview on-chain records.</p>
        </div>
      </div>
    );
  }

  const totalTokens = entries.reduce((acc, curr) => acc + (curr.carbonCalculation?.tokens || 0), 0);
  const totalVerified = entries.filter(e => e.status === 'TOKEN_MINTED' || e.status === 'BLOCKCHAIN_CONFIRMED').length;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaLink className="w-7 h-7 text-bc-green-600" />
            Blockchain Evidence Registry
          </h1>
          <p className="text-gray-500 text-sm mt-1">Immutable proof of sequestration on Polygon Amoy network.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <FaCheckDouble className="text-blue-600 w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Verified Records</p>
              <p className="text-lg font-bold text-gray-900 leading-none">{totalVerified}</p>
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-bc-green-50 flex items-center justify-center">
              <FaCoins className="text-bc-green-600 w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Total BCC Tokens</p>
              <p className="text-lg font-bold text-gray-900 leading-none">{totalTokens.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {!loading && entries.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaLink className="text-gray-300 w-8 h-8" />
          </div>
          <p className="text-gray-600 mb-4 font-medium">No verified blockchain records found.</p>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Your records appear here after the mandatory verification flow is completed and signed on-chain.
          </p>
          <Link
            to="/portal/plantation"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-bc-green-600 text-white rounded-lg font-medium hover:bg-bc-green-700 transition-colors shadow-sm"
          >
            Submit New Plantation
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Plantation ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Network Proof</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Tokens</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                    <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-gray-400 italic">Loading encrypted records...</td>
                    </tr>
                ) : entries.map((e) => (
                  <tr key={e._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono font-bold text-gray-900">{e.plantationId}</div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">LID: {e.landId?.substring(0,8)}...</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        {/* Transaction ID Link (Actual proof on chain) */}
                        {(e.tokenTxHash || e.blockchainTxHash) ? (
                            (() => {
                                const tx = e.tokenTxHash || e.blockchainTxHash;
                                const isValidTx = /^0x([A-Fa-f0-9]{64})$/.test(tx);
                                return (
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">On-Chain Proof</span>
                                            {!isValidTx && <span className="text-[9px] bg-amber-50 text-amber-600 px-1 rounded font-bold uppercase border border-amber-100 italic">Test/Mock</span>}
                                        </div>
                                        <a 
                                            href={isValidTx ? (e.tokenTxExplorerUrl || e.blockchainTxExplorerUrl) : '#'} 
                                            target={isValidTx ? "_blank" : "_self"}
                                            rel="noopener noreferrer"
                                            className={`text-[11px] font-mono font-bold flex items-center gap-1 w-fit transition-colors 
                                                ${isValidTx ? 'text-bc-green-600 hover:text-bc-green-700 underline' : 'text-amber-500 cursor-help'}`}
                                            title={isValidTx ? "View on Blockchain Explorer" : "Mock transaction ID for development purposes."}
                                            onClick={(ev) => !isValidTx && ev.preventDefault()}
                                        >
                                            <FaExternalLinkAlt className="w-2.5 h-2.5" />
                                            Tx: {tx.substring(0, 12)}...
                                        </a>
                                    </div>
                                );
                            })()
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                <span className="text-xs text-gray-400 italic">Processing for Chain...</span>
                            </div>
                        )}

                        {/* Data Fingerprint (SHA-256 for audit) */}
                        {e.blockchainHash && (
                            <div className="mt-1 pt-1 border-t border-gray-50 flex flex-col">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Data Integrity Hash</span>
                                <div 
                                    className="text-[10px] font-mono text-gray-500 hover:text-gray-900 cursor-pointer select-all truncate max-w-[140px]" 
                                    title={`Full Hash: ${e.blockchainHash}\nClick to select and copy.`}
                                >
                                    {e.blockchainHash}
                                </div>
                            </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono">
                      <div className="text-sm font-bold text-gray-900">{e.carbonCalculation?.tokens ?? '0.00'}</div>
                      <div className="text-[10px] text-bc-green-600 font-bold uppercase tracking-tight">BCC Credits</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {e.submissionTimestamp ? new Date(e.submissionTimestamp).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${STATUS_BADGES[e.status] || 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                        {e.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedPlantation(e)}
                        className="p-2 text-gray-400 hover:text-bc-green-600 hover:bg-bc-green-50 rounded-lg transition-all flex items-center gap-2 mx-auto border border-transparent hover:border-bc-green-100"
                        title="View Full History"
                      >
                        <FaHistory className="w-4 h-4" />
                        <span className="text-xs font-semibold">Audit Trail</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedPlantation && (
        <PlantationHistoryModal 
          plantation={selectedPlantation} 
          onClose={() => setSelectedPlantation(null)} 
        />
      )}
    </div>
  );
};

export default BlockchainRecords;
