import React from 'react';
import { FaTimes, FaCheckCircle, FaClock, FaLink, FaStamp, FaTree, FaShieldAlt } from 'react-icons/fa';

const PlantationHistoryModal = ({ plantation, onClose }) => {
  if (!plantation) return null;

  // Combine audit log, verifications, and blockchain info into a timeline
  const events = [];

  // 1. Submission
  events.push({
    title: 'Plantation Submitted',
    timestamp: plantation.submissionTimestamp || plantation.createdAt,
    icon: <FaTree className="text-bc-green-600" />,
    description: `Submitted by user for ${plantation.treeCount} trees across ${plantation.areaHectares} hectares.`,
    status: 'completed',
  });

  // 2. Panchayat Verification
  if (plantation.panchayatVerification) {
    events.push({
      title: 'Panchayat Verification',
      timestamp: plantation.panchayatVerification.timestamp,
      icon: <FaStamp className="text-blue-600" />,
      description: `Decision: ${plantation.panchayatVerification.decision.toUpperCase()}. Remarks: ${plantation.panchayatVerification.remarks || 'No remarks provided.'}`,
      status: plantation.panchayatVerification.decision === 'approved' ? 'completed' : 'failed',
    });
  }

  // NCCR Verification Removed (Bypassed)

  if (plantation.blockchainTxHash || plantation.blockchainHash) {
    events.push({
      title: 'Blockchain Registration',
      timestamp: plantation.blockchainTimestamp || plantation.updatedAt || plantation.panchayatVerification?.timestamp || new Date(), // Approximate if no specific log
      icon: <FaLink className="text-blue-500" />,
      description: 'Record permanently stored on Polygon Amoy testnet.',
      txHash: plantation.blockchainTxHash,
      dataHash: plantation.blockchainHash,
      status: 'completed',
    });
  }

  // 5. Token Minting / Carbon Calculation
  if (plantation.tokenTxHash || plantation.carbonCalculation?.tokens) {
    events.push({
      title: plantation.tokenTxHash ? 'Carbon Credits Issued' : 'Carbon Tokens Calculated',
      timestamp: plantation.updatedAt || plantation.panchayatVerification?.timestamp || plantation.nccrVerification?.timestamp || plantation.createdAt || new Date(),
      icon: <FaCheckCircle className={plantation.tokenTxHash ? "text-bc-green-500" : "text-amber-500"} />,
      description: `Generated ${plantation.carbonCalculation?.tokens || 0} BCC tokens (1 token = 1 tCO2eq). ${!plantation.tokenTxHash ? 'Pending blockchain minting...' : ''}`,
      txHash: plantation.tokenTxHash,
      status: plantation.tokenTxHash ? 'completed' : 'neutral',
    });
  }

  // 6. Generic Audit Logs (if not already captured)
  if (plantation.auditLog && Array.isArray(plantation.auditLog)) {
      plantation.auditLog.forEach(log => {
          // Avoid duplicates from hardcoded steps and filter out legacy/redundant admin actions
          const knownActions = [
            'submitted', 
            'panchayat_approved', 
            'panchayat_approved_final', 
            'admin_approved_final', 
            'nccr_approved', 
            'blockchain_confirmed', 
            'token_minted'
          ];
          if (!knownActions.includes(log.action)) {
              events.push({
                  title: log.action.replace(/_/g, ' ').toUpperCase(),
                  timestamp: log.timestamp,
                  icon: <FaClock className="text-gray-400" />,
                  description: log.details || `Action: ${log.action}`,
                  status: 'neutral'
              });
          }
      });
  }

  // Sort by timestamp
  events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const explorerUrl = 'https://amoy.polygonscan.com';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Plantation Lifecycle History</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">{plantation.plantationId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <FaTimes className="text-gray-400 w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-100 dark:bg-gray-700" />

            <div className="space-y-8">
              {events.map((event, idx) => (
                <div key={idx} className="relative pl-10">
                  {/* Timeline Dot */}
                  <div className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-gray-800 border-2 shadow-sm z-10 
                    ${event.status === 'completed' ? 'border-bc-green-500' : 
                      event.status === 'failed' ? 'border-red-500' : 'border-gray-200'}`}>
                    {event.icon}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{event.title}</h3>
                      <span className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{event.description}</p>
                    
                    {event.txHash && (
                      (() => {
                        const isValidTx = /^0x([A-Fa-f0-9]{64})$/.test(event.txHash);
                        return (
                          <div className="flex flex-col gap-1 mt-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-gray-400 uppercase">On-Chain Proof</span>
                              {!isValidTx && (
                                <span className="text-[9px] bg-amber-50 text-amber-600 px-1 rounded font-bold uppercase border border-amber-100 italic">
                                  Test/Mock
                                </span>
                              )}
                            </div>
                            <a
                              href={isValidTx ? `${explorerUrl}/tx/${event.txHash}` : '#'}
                              target={isValidTx ? '_blank' : '_self'}
                              rel="noopener noreferrer"
                              className={`text-xs font-mono font-bold flex items-center gap-1 w-fit transition-colors 
                                ${isValidTx ? 'text-bc-green-600 hover:text-bc-green-700 underline' : 'text-amber-500 cursor-help'}`}
                              onClick={(ev) => !isValidTx && ev.preventDefault()}
                              title={isValidTx ? 'View on Blockchain Explorer' : 'Mock transaction ID for development.'}
                            >
                              <FaLink className="w-2.5 h-2.5" />
                              {event.txHash.substring(0, 20)}...
                            </a>
                          </div>
                        );
                      })()
                    )}

                    {event.dataHash && (
                      <div className="mt-1 flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Data Integrity Hash</span>
                        <div
                          className="text-[10px] font-mono text-gray-500 hover:text-gray-900 cursor-pointer select-all truncate max-w-full"
                          title={`Full Hash: ${event.dataHash}\nClick to select/copy.`}
                        >
                          {event.dataHash}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlantationHistoryModal;
