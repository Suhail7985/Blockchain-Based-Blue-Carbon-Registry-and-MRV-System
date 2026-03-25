import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

// Status badge config
const STATUS_CONFIG = {
  PENDING_PANCHAYAT: { label: 'Pending Review', bg: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  PENDING_NCCR: { label: 'Sent to NCCR', bg: 'bg-blue-100 text-blue-800 border-blue-200' },
  REJECTED: { label: 'Rejected', bg: 'bg-red-100 text-red-800 border-red-200' },
  VERIFIED: { label: 'Verified', bg: 'bg-green-100 text-green-800 border-green-200' },
  TOKEN_MINTED: { label: 'Tokens Minted', bg: 'bg-purple-100 text-purple-800 border-purple-200' },
};

const RISK_CONFIG = {
  LOW: { label: 'Low Risk', bg: 'bg-green-100 text-green-700' },
  MEDIUM: { label: 'Medium Risk', bg: 'bg-yellow-100 text-yellow-700' },
  HIGH: { label: 'High Risk', bg: 'bg-red-100 text-red-700' },
};

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`bg-white rounded-2xl shadow-md p-5 border-l-4 ${color} flex items-center gap-4`}>
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function PlantationDetailModal({ plantation, onClose, onApprove, onReject, processing }) {
  const [remarks, setRemarks] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [action, setAction] = useState(null); // 'approve' | 'reject' | null

  if (!plantation) return null;
  const p = plantation;

  const confirmApprove = () => {
    onApprove(p._id, remarks);
    onClose();
  };
  const confirmReject = () => {
    if (!rejectReason.trim()) return toast.error('Please provide a rejection reason.');
    onReject(p._id, rejectReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold">Plantation Review</h3>
              <p className="text-white/80 text-sm mt-1">{p.plantationId}</p>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white text-2xl font-bold leading-none">×</button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Submitter info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">👤 Land Owner</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Name:</span> <span className="font-medium">{p.userId?.name || '—'}</span></div>
              <div><span className="text-gray-500">Email:</span> <span className="font-medium">{p.userId?.email || '—'}</span></div>
              <div><span className="text-gray-500">District:</span> <span className="font-medium">{p.userId?.district || '—'}</span></div>
              <div><span className="text-gray-500">State:</span> <span className="font-medium">{p.userId?.state || '—'}</span></div>
              <div><span className="text-gray-500">Ref ID:</span> <span className="font-mono text-xs">{p.userId?.referenceId || '—'}</span></div>
            </div>
          </div>

          {/* Plantation details */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">🌱 Plantation Details</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
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
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {p.gpsCoordinates.lat.toFixed(6)}, {p.gpsCoordinates.lng.toFixed(6)} ↗
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Land proof */}
          {p.landId?.documentPath && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">📄 Land Proof</h4>
              <a
                href={`http://localhost:5000/${p.landId.documentPath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm font-medium"
              >
                📥 View Land Document ↗
              </a>
              <p className="text-xs text-gray-500 mt-1">Area: {p.landId?.areaHectares} ha — {p.landId?.landReference}</p>
            </div>
          )}

          {/* Photos */}
          {p.imagePaths?.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">📸 Plantation Photos</h4>
              <div className="grid grid-cols-3 gap-2">
                {p.imagePaths.map((img, i) => (
                  <a key={i} href={`http://localhost:5000/${img}`} target="_blank" rel="noopener noreferrer">
                    <img
                      src={`http://localhost:5000/${img}`}
                      alt={`Plantation ${i + 1}`}
                      className="w-full h-24 object-cover rounded-lg hover:opacity-90 transition cursor-pointer"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Risk badge */}
          {p.risk && (
            <div className={`rounded-xl p-3 flex items-center gap-2 text-sm font-semibold ${RISK_CONFIG[p.risk.riskScore]?.bg || 'bg-gray-100 text-gray-700'}`}>
              ⚠️ {RISK_CONFIG[p.risk.riskScore]?.label || 'Unknown Risk'}
              {p.risk.flags?.length > 0 && (
                <span className="font-normal text-xs ml-2">— {p.risk.flags.join(', ')}</span>
              )}
            </div>
          )}

          {/* Action section */}
          {p.status === 'PENDING_PANCHAYAT' && !action && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setAction('approve')}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all"
              >
                ✅ Approve
              </button>
              <button
                onClick={() => setAction('reject')}
                className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all"
              >
                ❌ Reject
              </button>
            </div>
          )}

          {action === 'approve' && (
            <div className="space-y-3 pt-2 border-t border-gray-200">
              <label className="block text-sm font-semibold text-gray-700">Remarks (optional)</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                placeholder="Add verification remarks..."
              />
              <div className="flex gap-3">
                <button onClick={() => setAction(null)} className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-all">
                  Cancel
                </button>
                <button
                  onClick={confirmApprove}
                  disabled={processing}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {processing ? '⏳ Processing...' : '✅ Confirm Approval'}
                </button>
              </div>
            </div>
          )}

          {action === 'reject' && (
            <div className="space-y-3 pt-2 border-t border-gray-200">
              <label className="block text-sm font-semibold text-gray-700">Rejection Reason <span className="text-red-500">*</span></label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                placeholder="Explain why this plantation is being rejected..."
              />
              <div className="flex gap-3">
                <button onClick={() => setAction(null)} className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-all">
                  Cancel
                </button>
                <button
                  onClick={confirmReject}
                  disabled={processing}
                  className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
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

function KYCReviewCard({ userItem, onApprove, onReject, processing }) {
  const [reason, setReason] = useState('');
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-semibold text-gray-800">{userItem.name}</p>
          <p className="text-sm text-gray-500">{userItem.email}</p>
          <p className="text-xs text-gray-400 mt-1">District: {userItem.district || '—'} | Ref: {userItem.referenceId || '—'}</p>
        </div>
        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full border border-orange-200 whitespace-nowrap">
          Manual Review
        </span>
      </div>

      {userItem.aadhaarDocumentPath && (
        <a
          href={`http://localhost:5000/${userItem.aadhaarDocumentPath}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm mb-3"
        >
          📄 View Aadhaar Document ↗
        </a>
      )}

      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2 rounded-lg text-sm transition-all"
        >
          Verify Identity →
        </button>
      ) : (
        <div className="space-y-3 pt-2 border-t border-gray-100">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="Notes or rejection reason..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
          />
          <div className="flex gap-2">
            <button
              onClick={() => onApprove(userItem._id, reason || 'Approved by Panchayat')}
              disabled={processing}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg text-sm transition-all disabled:opacity-50"
            >
              ✅ Approve
            </button>
            <button
              onClick={() => { if (!reason.trim()) return toast.error('Please add a reason.'); onReject(userItem._id, reason); }}
              disabled={processing}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg text-sm transition-all disabled:opacity-50"
            >
              ❌ Reject
            </button>
            <button onClick={() => setExpanded(false)} className="px-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm">
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PanchayatDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('plantations');
  const [statusFilter, setStatusFilter] = useState('PENDING_PANCHAYAT');
  const [plantations, setPlantations] = useState([]);
  const [kycUsers, setKycUsers] = useState([]);
  const [selectedPlantation, setSelectedPlantation] = useState(null);
  const [loadingPlantations, setLoadingPlantations] = useState(true);
  const [loadingKyc, setLoadingKyc] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchPlantations = useCallback(async (status = statusFilter) => {
    setLoadingPlantations(true);
    try {
      const res = await api.get(`/panchayat/plantations?status=${status}`);
      if (res.data.success) setPlantations(res.data.plantations);
    } catch (err) {
      toast.error('Failed to load plantations');
    } finally {
      setLoadingPlantations(false);
    }
  }, [statusFilter]);

  const fetchKycUsers = useCallback(async () => {
    setLoadingKyc(true);
    try {
      const res = await api.get('/panchayat/kyc/manual-review');
      if (res.data.success) setKycUsers(res.data.users);
    } catch (err) {
      toast.error('Failed to load KYC queue');
    } finally {
      setLoadingKyc(false);
    }
  }, []);

  useEffect(() => { fetchPlantations(statusFilter); }, [statusFilter]);
  useEffect(() => { if (tab === 'kyc') fetchKycUsers(); }, [tab]);

  const handleApprove = async (id, remarks) => {
    setProcessing(true);
    try {
      const res = await api.patch(`/panchayat/plantations/${id}/approve`, { remarks });
      if (res.data.success) {
        toast.success('✅ Plantation approved! Sent to NCCR for final review.');
        fetchPlantations(statusFilter);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (id, reason) => {
    setProcessing(true);
    try {
      const res = await api.patch(`/panchayat/plantations/${id}/reject`, { reason });
      if (res.data.success) {
        toast.success('Plantation rejected.');
        fetchPlantations(statusFilter);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleKycApprove = async (userId, notes) => {
    setProcessing(true);
    try {
      const res = await api.patch(`/panchayat/kyc/${userId}/approve`, { notes });
      if (res.data.success) {
        toast.success('✅ Identity approved!');
        fetchKycUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleKycReject = async (userId, reason) => {
    setProcessing(true);
    try {
      const res = await api.patch(`/panchayat/kyc/${userId}/reject`, { reason });
      if (res.data.success) {
        toast.success('Identity rejected.');
        fetchKycUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed');
    } finally {
      setProcessing(false);
    }
  };

  const pendingCount = plantations.filter(p => p.status === 'PENDING_PANCHAYAT').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-2xl shadow-xl p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">🏛️ Panchayat Dashboard</h1>
            <p className="text-white/80">Verify plantations and identities in your jurisdiction</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-sm">
            <p className="font-semibold">{user?.name}</p>
            <p className="text-white/80">District: {user?.district || '—'}</p>
            <p className="text-white/70 text-xs mt-1 font-mono">{user?.panchayatId || 'ID not assigned'}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="⏳" label="Pending Review" value={pendingCount} color="border-yellow-400" />
        <StatCard icon="✅" label="Total Loaded" value={plantations.length} color="border-green-400" />
        <StatCard icon="👥" label="KYC Queue" value={kycUsers.length} color="border-orange-400" />
        <StatCard icon="🏘️" label="Jurisdiction" value={user?.district || 'All'} color="border-blue-400" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { key: 'plantations', label: '🌱 Plantations', count: plantations.length },
          { key: 'kyc', label: '🪪 KYC Review', count: kycUsers.length },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-3 font-semibold text-sm rounded-t-lg transition-all ${
              tab === t.key
                ? 'bg-white border-b-2 border-green-500 text-green-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Plantations Tab */}
      {tab === 'plantations' && (
        <div className="space-y-4">
          {/* Status filter */}
          <div className="flex flex-wrap gap-2">
            {[
              { status: 'PENDING_PANCHAYAT', label: '⏳ Pending' },
              { status: 'PENDING_NCCR', label: '📤 Sent to NCCR' },
              { status: 'REJECTED', label: '❌ Rejected' },
            ].map(f => (
              <button
                key={f.status}
                onClick={() => setStatusFilter(f.status)}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                  statusFilter === f.status
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300'
                }`}
              >
                {f.label}
              </button>
            ))}
            <button
              onClick={() => fetchPlantations(statusFilter)}
              className="px-4 py-2 rounded-full font-medium text-sm bg-white text-gray-600 border border-gray-200 hover:border-blue-300 transition-all"
            >
              🔄 Refresh
            </button>
          </div>

          {loadingPlantations ? (
            <div className="text-center py-16">
              <div className="text-4xl animate-spin inline-block mb-3">🌀</div>
              <p className="text-gray-500">Loading plantations...</p>
            </div>
          ) : plantations.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <p className="text-5xl mb-4">🌿</p>
              <p className="text-lg font-semibold text-gray-700">No plantations found</p>
              <p className="text-sm text-gray-400 mt-2">
                {statusFilter === 'PENDING_PANCHAYAT' ? 'No pending submissions in your jurisdiction.' : `No ${statusFilter.replace(/_/g, ' ').toLowerCase()} plantations.`}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Plantation</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Submitter</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Details</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Risk</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {plantations.map((p) => {
                      const sc = STATUS_CONFIG[p.status] || {};
                      const rc = RISK_CONFIG[p.risk?.riskScore] || {};
                      return (
                        <tr key={p._id} className="hover:bg-green-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-gray-800 text-sm">{p.speciesName}</p>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">{p.plantationId}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-gray-700">{p.userId?.name || '—'}</p>
                            <p className="text-xs text-gray-400">{p.userId?.district}, {p.userId?.state}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <p>🌳 {p.treeCount?.toLocaleString()} trees</p>
                            <p>📏 {p.areaHectares} ha</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${sc.bg}`}>
                              {sc.label || p.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${rc.bg || 'bg-gray-100 text-gray-600'}`}>
                              {rc.label || 'Unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setSelectedPlantation(p)}
                              className="px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 font-semibold text-sm rounded-lg transition-all border border-green-200"
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
        </div>
      )}

      {/* KYC Tab */}
      {tab === 'kyc' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            These users need manual identity verification. Review their Aadhaar documents before approving.
          </p>
          {loadingKyc ? (
            <div className="text-center py-16">
              <div className="text-4xl animate-spin inline-block mb-3">🌀</div>
              <p className="text-gray-500">Loading KYC queue...</p>
            </div>
          ) : kycUsers.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-12 text-center">
              <p className="text-5xl mb-4">✅</p>
              <p className="text-lg font-semibold text-gray-700">No pending KYC reviews</p>
              <p className="text-sm text-gray-400 mt-2">All identity verifications are up to date.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kycUsers.map((u) => (
                <KYCReviewCard
                  key={u._id}
                  userItem={u}
                  onApprove={handleKycApprove}
                  onReject={handleKycReject}
                  processing={processing}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedPlantation && (
        <PlantationDetailModal
          plantation={selectedPlantation}
          onClose={() => setSelectedPlantation(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          processing={processing}
        />
      )}
    </div>
  );
}
