import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import StatusBanner from '../../components/portal/StatusBanner';
import {
  getAdminPlantations,
  nccrApprovePlantation,
  nccrRejectPlantation,
  getAdminStats,
  getAdminAnalytics,
  getAuditLogs,
  getCarbonSettings,
  updateCarbonSettings,
  getPanchayats,
  createPanchayat,
} from '../../services/api';
import {
  FaCheckCircle,
  FaTimes,
  FaLeaf,
  FaUsers,
  FaLandmark,
  FaCoins,
  FaShieldAlt,
  FaExternalLinkAlt,
} from 'react-icons/fa';
import StatusTimeline from '../../components/plantation/StatusTimeline';
import { buildLifecycleTimestamps } from '../../utils/plantationLifecycle';
import toast from 'react-hot-toast';

const PENDING_NCCR = 'PENDING_NCCR';
const TOKEN_MINTED = 'TOKEN_MINTED';

const NccrDashboard = () => {
  const { user } = useAuth();
  const [plantations, setPlantations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [rejectNotes, setRejectNotes] = useState('');
  const [rejectingId, setRejectingId] = useState(null);
  const [stats, setStats] = useState(null);
  const [panchayats, setPanchayats] = useState([]);
  const [creating, setCreating] = useState(false);
  const [newPanchayat, setNewPanchayat] = useState({
    name: '',
    email: '',
    district: '',
    state: '',
  });
  const [analytics, setAnalytics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [settings, setSettings] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      getAdminPlantations(PENDING_NCCR),
      getAdminStats(),
      getAdminAnalytics(),
      getAuditLogs(50),
      getCarbonSettings(),
      getPanchayats(),
    ])
      .then(([pending, statsRes, analyticsRes, auditRes, settingsRes, panchayatRes]) => {
        if (pending.success && pending.plantations) setPlantations(pending.plantations);
        if (statsRes.success) setStats(statsRes);
        if (analyticsRes.success) setAnalytics(analyticsRes);
        if (auditRes.success && auditRes.logs) setAuditLogs(auditRes.logs);
        if (settingsRes.success) setSettings(settingsRes.settings);
        if (panchayatRes.success && panchayatRes.panchayats) setPanchayats(panchayatRes.panchayats);
      })
      .catch(() => toast.error('Failed to load admin data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id, notes) => {
    setActionId(id);
    try {
      const res = await nccrApprovePlantation(id, notes);
      if (res.success) {
        toast.success(res.message);
        load();
      } else toast.error(res.message || 'Approve failed');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Approve failed');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id) => {
    setRejectingId(id);
    try {
      const res = await nccrRejectPlantation(id, rejectNotes);
      if (res.success) {
        toast.success(res.message);
        setRejectNotes('');
        setRejectingId(null);
        load();
      } else toast.error(res.message || 'Reject failed');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Reject failed');
      setRejectingId(null);
    }
  };

  if (!user || !['admin', 'verifier'].includes(user.role)) {
    return <Navigate to="/portal" replace />;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <StatusBanner accountStatus={user?.accountStatus} />
      <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <FaLeaf className="w-7 h-7 text-bc-green-600" />
        NCCR Admin Dashboard
      </h1>
      <p className="text-gray-600 mb-6">
        National Blue Carbon Registry operations console – manage Panchayats and approve verified plantations.
      </p>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <FaUsers className="w-4 h-4" /> Total Users
            </p>
            <p className="text-xl font-bold text-gray-900 mt-1">{stats?.totalUsers ?? '—'}</p>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <FaLandmark className="w-4 h-4" /> Panchayats Onboarded
            </p>
            <p className="text-xl font-bold text-gray-900 mt-1">{stats?.totalPanchayats ?? '—'}</p>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <FaLeaf className="w-4 h-4" /> Plantations Pending
            </p>
            <p className="text-xl font-bold text-gray-900 mt-1">{stats?.pendingPlantations ?? '—'}</p>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <FaCoins className="w-4 h-4" /> Tokens Minted
            </p>
            <p className="text-xl font-bold text-bc-green-700 mt-1">
              {stats ? Math.round((stats.tokensMinted || 0) * 1000) / 1000 : '—'}
            </p>
          </div>
        </div>
      </section>

      {analytics && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">National Carbon Analytics</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-500">Verified Plantations</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {analytics.totalVerifiedPlantations ?? '—'}
              </p>
            </div>
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-500">Total CO₂ Sequestered (t)</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {analytics.totalCO2 ? Math.round(analytics.totalCO2 * 100) / 100 : 0}
              </p>
            </div>
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-500">Total Tokens Issued</p>
              <p className="text-xl font-bold text-bc-green-700 mt-1">
                {analytics.totalTokens ? Math.round(analytics.totalTokens * 100) / 100 : 0}
              </p>
            </div>
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-500">Blockchain Transactions</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {analytics.totalBlockchainTx ?? 0}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">State-wise CO₂</h3>
              <div className="space-y-2">
                {analytics.stateBreakdown?.length ? (
                  analytics.stateBreakdown.map((s) => (
                    <div key={s._id} className="flex items-center gap-3">
                      <span className="w-24 text-sm text-gray-700 truncate">{s._id || 'Unknown'}</span>
                      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-2 bg-bc-green-500"
                          style={{
                            width: `${Math.min(100, (s.totalCO2 / (analytics.totalCO2 || 1)) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="w-16 text-right text-xs text-gray-700">
                        {Math.round(s.totalCO2 * 10) / 10}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No state-wise data yet.</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Monthly CO₂ Trend</h3>
              <div className="space-y-2">
                {analytics.monthlyTrend?.length ? (
                  analytics.monthlyTrend.map((m) => (
                    <div key={`${m._id.year}-${m._id.month}`} className="flex items-center gap-3">
                      <span className="w-24 text-sm text-gray-700">
                        {m._id.month}/{m._id.year}
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-2 bg-blue-500"
                          style={{
                            width: `${Math.min(
                              100,
                              (m.totalCO2 / (analytics.totalCO2 || 1)) * 100
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="w-16 text-right text-xs text-gray-700">
                        {Math.round(m.totalCO2 * 10) / 10}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No monthly trend data yet.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {settings && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Governance Settings – Carbon Model</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <label className="text-sm text-gray-700">
              Average Biomass per Tree (kg)
              <input
                type="number"
                value={settings.avgBiomassPerTreeKg}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, avgBiomassPerTreeKg: Number(e.target.value) }))
                }
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </label>
            <label className="text-sm text-gray-700">
              Carbon Fraction
              <input
                type="number"
                step="0.01"
                value={settings.carbonFraction}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, carbonFraction: Number(e.target.value) }))
                }
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </label>
            <label className="text-sm text-gray-700">
              CO₂ Multiplier
              <input
                type="number"
                step="0.01"
                value={settings.co2eqFactor}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, co2eqFactor: Number(e.target.value) }))
                }
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </label>
            <label className="text-sm text-gray-700">
              Token Rule
              <input
                type="text"
                value={settings.tokenRule || ''}
                onChange={(e) => setSettings((s) => ({ ...s, tokenRule: e.target.value }))}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={!!settings.autoMintEnabled}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, autoMintEnabled: e.target.checked }))
                }
              />
              Enable automatic token minting on approval
            </label>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              Model: Biomass = Trees × Avg Biomass; Carbon = Biomass × Carbon Fraction; CO₂eq =
              Carbon × CO₂ Multiplier; Tokens = CO₂eq.
            </p>
            <button
              type="button"
              onClick={async () => {
                setSavingSettings(true);
                try {
                  const res = await updateCarbonSettings(settings);
                  if (res.success) {
                    setSettings(res.settings);
                    toast.success('Carbon settings updated');
                  } else {
                    toast.error(res.message || 'Failed to update settings');
                  }
                } catch (e) {
                  toast.error(e.response?.data?.message || 'Failed to update settings');
                } finally {
                  setSavingSettings(false);
                }
              }}
              className="px-4 py-2 bg-bc-green-600 text-white rounded-lg font-medium hover:bg-bc-green-700 disabled:opacity-50"
              disabled={savingSettings}
            >
              {savingSettings ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </section>
      )}

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Panchayat Approvals (Pending NCCR)</h2>
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">Loading...</div>
        ) : plantations.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
            No plantations pending NCCR approval.
          </div>
        ) : (
          <div className="space-y-6">
            {plantations.map((p) => (
              <div
                key={p._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-gray-900">{p.plantationId}</span>
                    {p.risk && (
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                          p.risk.riskScore === 'HIGH'
                            ? 'bg-red-100 text-red-800'
                            : p.risk.riskScore === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        <FaShieldAlt className="w-3 h-3" />
                        Risk: {p.risk.riskScore}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                      {p.status === 'BLOCKCHAIN_PENDING'
                        ? 'Blockchain Pending'
                        : p.status === 'BLOCKCHAIN_CONFIRMED'
                        ? 'On-chain Confirmed'
                        : p.status === 'TOKEN_MINTED'
                        ? 'Token Minted'
                        : 'Pending NCCR'}
                    </span>
                    {(p.blockchainTxHash || p.tokenTxHash) && (
                      <a
                        href={`https://amoy.polygonscan.com/tx/${p.blockchainTxHash || p.tokenTxHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-bc-green-700 hover:underline"
                      >
                        View on Polygon
                        <FaExternalLinkAlt className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
                <div className="px-6 py-4 grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Applicant</p>
                    <p className="font-medium text-gray-900">{p.userId?.name}</p>
                    <p className="text-sm text-gray-600">{p.userId?.email} · {p.userId?.district}, {p.userId?.state}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Land & species</p>
                    <p className="text-gray-900">{p.landId?.landReference} — {p.speciesName}</p>
                    <p className="text-sm text-gray-600">{p.treeCount} trees · {p.areaHectares} ha</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Plantation date</p>
                    <p className="text-gray-900">{p.plantationDate ? new Date(p.plantationDate).toLocaleDateString() : '—'}</p>
                  </div>
                  {p.panchayatVerification && (
                    <div>
                      <p className="text-sm text-gray-500">Panchayat verification</p>
                      <p className="text-sm text-gray-700">
                        Approved {p.panchayatVerification.timestamp ? new Date(p.panchayatVerification.timestamp).toLocaleString() : ''}
                      </p>
                      {p.panchayatVerification.remarks && <p className="text-xs text-gray-500">{p.panchayatVerification.remarks}</p>}
                    </div>
                  )}
                </div>
                <div className="px-6 py-3 border-t border-gray-100">
                  <StatusTimeline status={p.status} timestamps={buildLifecycleTimestamps(p)} compact />
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-3 items-center">
                  <button
                    type="button"
                    onClick={() => handleApprove(p._id)}
                    disabled={actionId === p._id}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-bc-green-600 text-white rounded-lg font-medium hover:bg-bc-green-700 disabled:opacity-50"
                  >
                    <FaCheckCircle className="w-4 h-4" />
                    {actionId === p._id ? 'Processing...' : 'Final Approve'}
                  </button>
                  <div className="flex-1 flex gap-2 items-center flex-wrap">
                    <input
                      type="text"
                      placeholder="Rejection notes"
                      value={rejectingId === p._id ? rejectNotes : ''}
                      onChange={(e) => {
                        setRejectNotes(e.target.value);
                        setRejectingId(p._id);
                      }}
                      className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleReject(p._id)}
                      disabled={rejectingId === p._id}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg font-medium hover:bg-red-200 disabled:opacity-50"
                    >
                      <FaTimes className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaLandmark className="w-5 h-5 text-bc-green-600" />
          Local Panchayats
        </h2>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            placeholder="Panchayat name"
            value={newPanchayat.name}
            onChange={(e) => setNewPanchayat((p) => ({ ...p, name: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <input
            type="email"
            placeholder="Email"
            value={newPanchayat.email}
            onChange={(e) => setNewPanchayat((p) => ({ ...p, email: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <input
            type="text"
            placeholder="District"
            value={newPanchayat.district}
            onChange={(e) => setNewPanchayat((p) => ({ ...p, district: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <input
            type="text"
            placeholder="State"
            value={newPanchayat.state}
            onChange={(e) => setNewPanchayat((p) => ({ ...p, state: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <button
            type="button"
            onClick={async () => {
              if (!newPanchayat.name || !newPanchayat.email) {
                toast.error('Name and email are required');
                return;
              }
              setCreating(true);
              try {
                const res = await createPanchayat(newPanchayat);
                if (res.success) {
                  toast.success('Panchayat created');
                  setNewPanchayat({ name: '', email: '', district: '', state: '' });
                  load();
                } else {
                  toast.error(res.message || 'Failed to create Panchayat');
                }
              } catch (e) {
                toast.error(e.response?.data?.message || 'Failed to create Panchayat');
              } finally {
                setCreating(false);
              }
            }}
            disabled={creating}
            className="px-4 py-2 bg-bc-green-600 text-white rounded-lg font-medium hover:bg-bc-green-700 disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Add Panchayat'}
          </button>
        </div>
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">District</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">State</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Panchayat ID</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {panchayats.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                    No Panchayats onboarded yet.
                  </td>
                </tr>
              ) : (
                panchayats.map((p) => (
                  <tr key={p._id}>
                    <td className="px-4 py-2 text-gray-900">{p.name}</td>
                    <td className="px-4 py-2 text-gray-700">{p.email}</td>
                    <td className="px-4 py-2 text-gray-700">{p.district}</td>
                    <td className="px-4 py-2 text-gray-700">{p.state}</td>
                    <td className="px-4 py-2 font-mono text-xs text-gray-700">{p.panchayatId || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {auditLogs?.length > 0 && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaShieldAlt className="w-5 h-5 text-bc-green-600" />
            Recent Audit Trail
          </h2>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Old → New</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditLogs.map((log) => (
                  <tr key={log._id}>
                    <td className="px-4 py-2 text-xs text-gray-600">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-2 text-gray-800">{log.action}</td>
                    <td className="px-4 py-2 text-gray-700">{log.role || '—'}</td>
                    <td className="px-4 py-2 text-gray-700">
                      {log.performedBy
                        ? `${log.performedBy.name || ''} (${log.performedBy.email || ''})`
                        : '—'}
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-700">
                      {log.previousStatus || '—'} → {log.newStatus || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default NccrDashboard;
