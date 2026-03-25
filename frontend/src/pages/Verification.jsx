import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getAdminPlantations, nccrApprovePlantation, nccrRejectPlantation } from '../services/api';

const RISK_CONFIG = {
  LOW: { label: 'Low Risk', bg: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  MEDIUM: { label: 'Medium Risk', bg: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  HIGH: { label: 'High Risk', bg: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
};

function PlantationReviewModal({ plantation: p, onClose, onApprove, onReject, processing }) {
  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState('');
  const [action, setAction] = useState(null);

  if (!p) return null;
  const rc = RISK_CONFIG[p.risk?.riskScore] || RISK_CONFIG.LOW;

  // Estimate carbon from tree count (preview before actual backend calc)
  const estimatedCO2 = p.treeCount ? ((p.treeCount * 50 * 0.001 * 0.48 * 3.67)).toFixed(2) : '—';
  const estimatedTokens = p.treeCount ? ((p.treeCount * 50 * 0.001 * 0.48 * 3.67)).toFixed(3) : '—';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold">NCCR Final Review</h3>
              <p className="text-white/80 text-sm mt-1 font-mono">{p.plantationId}</p>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white text-2xl font-bold leading-none">×</button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Risk */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold ${rc.bg}`}>
            <span className={`w-2 h-2 rounded-full ${rc.dot}`} />
            {rc.label}
            {p.risk?.flags?.length > 0 && (
              <span className="font-normal text-xs ml-2">— {p.risk.flags.join(', ')}</span>
            )}
          </div>

          {/* Submitter */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-700 mb-3">👤 Land Owner</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-500">Name:</span> <span className="font-medium">{p.userId?.name || '—'}</span></div>
              <div><span className="text-gray-500">Email:</span> <span className="font-medium">{p.userId?.email || '—'}</span></div>
              <div><span className="text-gray-500">District:</span> <span className="font-medium">{p.userId?.district}, {p.userId?.state}</span></div>
              <div><span className="text-gray-500">Ref ID:</span> <span className="font-mono text-xs">{p.userId?.referenceId || '—'}</span></div>
            </div>
          </div>

          {/* Plantation details */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-700 mb-3">🌱 Plantation Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-500">Species:</span> <span className="font-medium">{p.speciesName}</span></div>
              <div><span className="text-gray-500">Trees:</span> <span className="font-medium">{p.treeCount?.toLocaleString()}</span></div>
              <div><span className="text-gray-500">Area:</span> <span className="font-medium">{p.areaHectares} ha</span></div>
              <div><span className="text-gray-500">Date:</span> <span className="font-medium">{new Date(p.plantationDate).toLocaleDateString('en-IN')}</span></div>
              {p.gpsCoordinates?.lat && (
                <div className="col-span-2">
                  <span className="text-gray-500">GPS:</span>{' '}
                  <a
                    href={`https://maps.google.com/?q=${p.gpsCoordinates.lat},${p.gpsCoordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    📍 {p.gpsCoordinates.lat.toFixed(6)}, {p.gpsCoordinates.lng.toFixed(6)} ↗
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Panchayat verification */}
          {p.panchayatVerification && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h4 className="font-semibold text-green-800 mb-2">🏛️ Panchayat Verification</h4>
              <p className="text-sm text-green-700">
                ✅ Approved on {new Date(p.panchayatVerification.timestamp).toLocaleDateString('en-IN')}
              </p>
              {p.panchayatVerification.remarks && (
                <p className="text-xs text-green-600 mt-1">Remarks: {p.panchayatVerification.remarks}</p>
              )}
            </div>
          )}

          {/* Carbon estimate */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <h4 className="font-semibold text-emerald-800 mb-2">🌿 Carbon Estimate (on approval)</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-emerald-600">Est. CO₂:</span> <span className="font-bold text-emerald-900">{estimatedCO2} tonnes</span></div>
              <div><span className="text-emerald-600">Est. BCC Tokens:</span> <span className="font-bold text-emerald-900">{estimatedTokens}</span></div>
            </div>
            <p className="text-xs text-emerald-600 mt-2">* Based on biomass = {p.treeCount} × 50kg × carbon factors. Final value calculated by backend.</p>
          </div>

          {/* Land proof */}
          {p.landId?.documentPath && (
            <div className="bg-gray-50 rounded-xl p-3">
              <h4 className="font-semibold text-gray-700 mb-2 text-sm">📄 Land Document</h4>
              <a
                href={`http://localhost:5000/${p.landId.documentPath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                📥 View Land Proof ({p.landId.areaHectares} ha) ↗
              </a>
            </div>
          )}

          {/* Photos */}
          {p.imagePaths?.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-700 mb-3 text-sm">📸 Plantation Photos</h4>
              <div className="grid grid-cols-3 gap-2">
                {p.imagePaths.map((img, i) => (
                  <a key={i} href={`http://localhost:5000/${img}`} target="_blank" rel="noopener noreferrer">
                    <img
                      src={`http://localhost:5000/${img}`}
                      alt={`Photo ${i + 1}`}
                      className="w-full h-20 object-cover rounded-lg hover:opacity-90 transition"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Wallet check */}
          {!p.userId?.walletAddress && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
              ⚠️ <strong>No wallet address</strong> — User must link their MetaMask wallet before tokens can be minted.
            </div>
          )}

          {/* Actions */}
          {!action ? (
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setAction('approve')}
                disabled={!p.userId?.walletAddress}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ✅ Approve & Mint Tokens
              </button>
              <button
                onClick={() => setAction('reject')}
                className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all"
              >
                ❌ Reject
              </button>
            </div>
          ) : action === 'approve' ? (
            <div className="space-y-3 border-t pt-3">
              <label className="block text-sm font-semibold text-gray-700">NCCR Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 text-sm"
                placeholder="Add final verification notes..."
              />
              <p className="text-xs text-gray-500">
                ⚠️ Approving will: (1) calculate carbon, (2) store hash on blockchain, (3) mint BCC tokens to user's wallet. This may take 10–30 seconds.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setAction(null)} className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200">
                  Cancel
                </button>
                <button
                  onClick={() => { onApprove(p._id, notes); onClose(); }}
                  disabled={processing}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 rounded-xl hover:shadow-lg disabled:opacity-50"
                >
                  {processing ? '⏳ Processing...' : '✅ Confirm Approval'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 border-t pt-3">
              <label className="block text-sm font-semibold text-gray-700">Rejection Reason <span className="text-red-500">*</span></label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 text-sm"
                placeholder="Explain the rejection reason clearly..."
              />
              <div className="flex gap-3">
                <button onClick={() => setAction(null)} className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200">
                  Cancel
                </button>
                <button
                  onClick={() => { if (!reason.trim()) return toast.error('Please enter a reason'); onReject(p._id, reason); onClose(); }}
                  disabled={processing}
                  className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold py-3 rounded-xl hover:shadow-lg disabled:opacity-50"
                >
                  {processing ? '⏳ Processing...' : '❌ Confirm Rejection'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Verification() {
  const [plantations, setPlantations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [lastResult, setLastResult] = useState(null); // blockchain tx result

  const fetchPlantations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminPlantations('PENDING_NCCR');
      setPlantations(data.plantations || []);
    } catch (err) {
      toast.error('Failed to load plantations for review');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPlantations(); }, [fetchPlantations]);

  const handleApprove = async (id, notes) => {
    setProcessing(true);
    const toastId = toast.loading('⏳ Verifying, calculating carbon & minting tokens on blockchain...');
    try {
      const res = await nccrApprovePlantation(id, notes);
      toast.dismiss(toastId);
      if (res.success) {
        const p = res.plantation;
        toast.success('✅ Plantation approved! Carbon calculated & BCC tokens minted.');
        setLastResult({
          plantationId: p.plantationId,
          co2eq: p.carbonCalculation?.co2eq,
          tokens: p.carbonCalculation?.tokens,
          blockchainTxHash: p.blockchainTxHash,
          tokenTxHash: p.tokenTxHash,
        });
        fetchPlantations();
      }
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.message || 'Approval failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (id, reason) => {
    setProcessing(true);
    try {
      const res = await nccrRejectPlantation(id, reason);
      if (res.success) {
        toast.success('Plantation rejected.');
        fetchPlantations();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">🔍 NCCR Verification</h1>
            <p className="text-white/80">Final review of Panchayat-approved plantations</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-yellow-400 text-yellow-900 font-bold px-4 py-2 rounded-xl text-sm">
              ⏳ {plantations.length} Pending Review
            </div>
            <button
              onClick={fetchPlantations}
              className="bg-white/20 hover:bg-white/30 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all border border-white/30"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Last blockchain result */}
      {lastResult && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-5">
          <h4 className="font-bold text-emerald-800 mb-3">🎉 Last Approved — Blockchain Confirmation</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-3">
            <div><span className="text-emerald-600">Plantation:</span> <span className="font-mono text-xs block">{lastResult.plantationId}</span></div>
            <div><span className="text-emerald-600">CO₂ Captured:</span> <strong>{lastResult.co2eq} t</strong></div>
            <div><span className="text-emerald-600">BCC Minted:</span> <strong>🪙 {lastResult.tokens}</strong></div>
          </div>
          <div className="space-y-1 text-xs">
            {lastResult.blockchainTxHash && (
              <div>
                🔗 Registry:{' '}
                <a href={`https://amoy.polygonscan.com/tx/${lastResult.blockchainTxHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-mono">
                  {lastResult.blockchainTxHash.slice(0, 30)}... ↗
                </a>
              </div>
            )}
            {lastResult.tokenTxHash && (
              <div>
                🪙 Token:{' '}
                <a href={`https://amoy.polygonscan.com/tx/${lastResult.tokenTxHash}`} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline font-mono">
                  {lastResult.tokenTxHash.slice(0, 30)}... ↗
                </a>
              </div>
            )}
          </div>
          <button onClick={() => setLastResult(null)} className="mt-3 text-xs text-emerald-600 underline">Dismiss</button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-16">
          <div className="text-4xl animate-spin inline-block mb-3">🌀</div>
          <p className="text-gray-500">Loading pending plantations...</p>
        </div>
      ) : plantations.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <p className="text-5xl mb-4">✅</p>
          <p className="text-lg font-semibold text-gray-700">No pending verifications</p>
          <p className="text-sm text-gray-400 mt-2">All plantations have been reviewed. Check back later.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Plantation</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Submitter</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Details</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Panchayat</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Risk</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {plantations.map((p) => {
                  const rc = RISK_CONFIG[p.risk?.riskScore] || RISK_CONFIG.LOW;
                  const panchayatVerified = !!p.panchayatVerification;
                  const hasWallet = !!p.userId?.walletAddress;

                  return (
                    <tr key={p._id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-800 text-sm">{p.speciesName}</p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{p.plantationId}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-700">{p.userId?.name || '—'}</p>
                        <p className="text-xs text-gray-400">{p.userId?.district}, {p.userId?.state}</p>
                        {!hasWallet && (
                          <span className="text-xs text-amber-600 font-medium">⚠️ No wallet</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <p>🌳 {p.treeCount?.toLocaleString()} trees</p>
                        <p>📏 {p.areaHectares} ha</p>
                      </td>
                      <td className="px-6 py-4">
                        {panchayatVerified ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 border border-green-200">
                            ✅ Verified
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-500">
                            Not verified
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${rc.bg}`}>
                          <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${rc.dot}`} />
                          {rc.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelected(p)}
                          className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-sm rounded-lg transition-all border border-blue-200"
                        >
                          Review →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <PlantationReviewModal
          plantation={selected}
          onClose={() => setSelected(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          processing={processing}
        />
      )}
    </div>
  );
}
