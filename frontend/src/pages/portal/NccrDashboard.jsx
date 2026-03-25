import React, { useState, useEffect, useCallback } from 'react';
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
  updatePanchayatStatus,
  adminGetSpecies,
  adminUpdateSpecies,
  adminCreateSpecies
} from '../../services/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell, PieChart, Pie
} from 'recharts';
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
  const [filterState, setFilterState] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
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
  const [speciesList, setSpeciesList] = useState([]);
  const [loadingSpecies, setLoadingSpecies] = useState(false);
  const [editingSpecies, setEditingSpecies] = useState(null);
  const [showSpeciesForm, setShowSpeciesForm] = useState(false);
  const [newSpecies, setNewSpecies] = useState({ name: '', scientificName: '', category: 'Mangrove', avgBiomassPerTreeKg: 0, carbonFraction: 0.47, co2eqFactor: 3.67 });

  const load = useCallback(() => {
    setLoading(true);
    setLoadingSpecies(true);
    Promise.all([
      getAdminPlantations(PENDING_NCCR),
      getAdminStats(),
      getAdminAnalytics(),
      getAuditLogs(50),
      getCarbonSettings(),
      getPanchayats(),
      adminGetSpecies()
    ])
      .then(([pending, statsRes, analyticsRes, auditRes, settingsRes, panchayatRes, speciesRes]) => {
        if (pending.success && pending.plantations) setPlantations(pending.plantations);
        if (statsRes.success) setStats(statsRes);
        if (analyticsRes.success) setAnalytics(analyticsRes);
        if (auditRes.success && auditRes.logs) setAuditLogs(auditRes.logs);
        if (settingsRes.success) setSettings(settingsRes.settings);
        if (panchayatRes.success && panchayatRes.panchayats) setPanchayats(panchayatRes.panchayats);
        if (speciesRes.success) setSpeciesList(speciesRes.species);
      })
      .catch(() => toast.error('Failed to load admin data'))
      .finally(() => {
        setLoading(false);
        setLoadingSpecies(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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

  const togglePanchayatStatus = async (id, currentStatus) => {
    const next = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await updatePanchayatStatus(id, next);
      if (res.success) {
        toast.success(`Panchayat ${next}`);
        load();
      }
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const handleUpdateSpecies = async (id, data) => {
    try {
      const res = await adminUpdateSpecies(id, data);
      if (res.success) {
        toast.success('Species updated');
        setEditingSpecies(null);
        load();
      }
    } catch (e) {
      toast.error('Update failed');
    }
  };

  const handleCreateSpecies = async () => {
    try {
      const res = await adminCreateSpecies(newSpecies);
      if (res.success) {
        toast.success('Species created');
        setShowSpeciesForm(false);
        setNewSpecies({ name: '', scientificName: '', category: 'Mangrove', avgBiomassPerTreeKg: 0, carbonFraction: 0.47, co2eqFactor: 3.67 });
        load();
      }
    } catch (e) {
      toast.error('Creation failed');
    }
  };

  if (!user || !['admin', 'verifier'].includes(user.role)) {
    return <Navigate to="/portal" replace />;
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Filtering and Search Controls */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search by Plantation ID or Applicant"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm min-w-[200px]"
        />
        <select
          value={filterState}
          onChange={e => setFilterState(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">All States</option>
          {[...new Set(plantations.map(p => p.userId?.state).filter(Boolean))].map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
        <select
          value={filterDistrict}
          onChange={e => setFilterDistrict(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">All Districts</option>
          {[...new Set(plantations.map(p => p.userId?.district).filter(Boolean))].map(district => (
            <option key={district} value={district}>{district}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">All Statuses</option>
          {[...new Set(plantations.map(p => p.status).filter(Boolean))].map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <button
          type="button"
          className="ml-auto px-4 py-2 bg-bc-green-600 text-white rounded-lg font-medium hover:bg-bc-green-700"
          onClick={() => {
            // Export filtered plantations as CSV
            const filtered = plantations.filter(p => {
              const matchesState = !filterState || p.userId?.state === filterState;
              const matchesDistrict = !filterDistrict || p.userId?.district === filterDistrict;
              const matchesStatus = !filterStatus || p.status === filterStatus;
              const matchesSearch = !searchTerm ||
                (p.plantationId && p.plantationId.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (p.userId?.name && p.userId.name.toLowerCase().includes(searchTerm.toLowerCase()));
              return matchesState && matchesDistrict && matchesStatus && matchesSearch;
            });
            const csvRows = [
              ['Plantation ID','Applicant','Email','State','District','Status','Species','Tree Count','Area (ha)','Date'],
              ...filtered.map(p => [
                p.plantationId,
                p.userId?.name,
                p.userId?.email,
                p.userId?.state,
                p.userId?.district,
                p.status,
                p.speciesName,
                p.treeCount,
                p.areaHectares,
                p.plantationDate ? new Date(p.plantationDate).toLocaleDateString() : ''
              ])
            ];
            const csvContent = csvRows.map(r => r.map(x => '"'+(x??'')+'"').join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'plantations.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
        >
          Export CSV
        </button>
      </section>
      <StatusBanner accountStatus={user?.accountStatus} />
      <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <FaLeaf className="w-7 h-7 text-bc-green-600" />
        NCCR Admin Dashboard
      </h1>
      <p className="text-gray-600 mb-6">
        National CarbonSetu operations console – manage Panchayats and approve verified plantations.
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
          <h1 className="text-2xl font-bold text-gray-900">CarbonSetu: National Governance Console</h1>
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

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">State-wise CO₂ Sequestered</h3>
              <div className="h-64">
                {analytics.stateBreakdown?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analytics.stateBreakdown}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                      <XAxis type="number" tick={{ fontSize: 12, fill: '#6B7280' }} />
                      <YAxis dataKey="_id" type="category" tick={{ fontSize: 12, fill: '#374151' }} width={80} />
                      <Tooltip
                        cursor={{ fill: '#F3F4F6' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="totalCO2" name="CO₂ (t)" fill="#10B981" radius={[0, 4, 4, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-gray-400">No state data available</div>
                )}
              </div>
            </div>
            
            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Monthly CO₂ Trend</h3>
              <div className="h-64">
                {analytics.monthlyTrend?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={analytics.monthlyTrend.map(m => ({
                        name: `${m._id.month}/${m._id.year}`,
                        co2: Math.round(m.totalCO2 * 10) / 10
                      }))}
                      margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} tickMargin={10} />
                      <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="co2"
                        name="CO₂ (t)"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#FFFFFF' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-gray-400">No monthly trend data available</div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {settings && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">NCCR Global Governance Settings</h2>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100 uppercase">Legacy Fallback Configuration</span>
          </div>
          <p className="text-xs text-gray-500 mb-6 italic">Note: These values are used ONLY if a plantation uses a species not found in the scientific registry below.</p>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <label className="text-sm text-gray-700">
              Default Biomass per Tree (kg)
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
              Default Carbon Fraction
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
            {/* ... other settings ... */}
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

      {/* Scientific Species Registry */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
           <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
             <FaLeaf className="text-bc-green-600" /> Scientific Species Registry
           </h2>
           <button 
             onClick={() => setShowSpeciesForm(!showSpeciesForm)}
             className="text-xs font-bold text-bc-green-700 hover:text-bc-green-800"
           >
             {showSpeciesForm ? 'Cancel' : '+ Add New Species'}
           </button>
        </div>

        {showSpeciesForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200 grid sm:grid-cols-3 gap-4">
             <input placeholder="Species Name" value={newSpecies.name} onChange={e => setNewSpecies({...newSpecies, name: e.target.value})} className="px-3 py-2 text-sm border rounded-lg" />
             <input placeholder="Scientific Name" value={newSpecies.scientificName} onChange={e => setNewSpecies({...newSpecies, scientificName: e.target.value})} className="px-3 py-2 text-sm border rounded-lg" />
             <select value={newSpecies.category} onChange={e => setNewSpecies({...newSpecies, category: e.target.value})} className="px-3 py-2 text-sm border rounded-lg">
               <option>Mangrove</option>
               <option>Terrestrial</option>
               <option>Seagrass</option>
             </select>
             <input type="number" placeholder="Biomass (kg)" value={newSpecies.avgBiomassPerTreeKg} onChange={e => setNewSpecies({...newSpecies, avgBiomassPerTreeKg: Number(e.target.value)})} className="px-3 py-2 text-sm border rounded-lg" />
             <input type="number" step="0.01" placeholder="Carbon Fraction" value={newSpecies.carbonFraction} onChange={e => setNewSpecies({...newSpecies, carbonFraction: Number(e.target.value)})} className="px-3 py-2 text-sm border rounded-lg" />
             <button onClick={handleCreateSpecies} className="bg-bc-green-600 text-white text-xs font-bold rounded-lg py-2">Create Species</button>
          </div>
        )}

        <div className="overflow-x-auto border border-gray-100 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-gray-500">Species</th>
                <th className="px-4 py-3 text-left font-bold text-gray-500">Category</th>
                <th className="px-4 py-3 text-left font-bold text-gray-500">Biomass (kg/tree)</th>
                <th className="px-4 py-3 text-left font-bold text-gray-500">C-Fraction</th>
                <th className="px-4 py-3 text-left font-bold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {speciesList.map(s => (
                <tr key={s._id} className="hover:bg-gray-50 group transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-gray-900">{s.name}</div>
                    <div className="text-[10px] italic text-gray-500">{s.scientificName}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">{s.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    {editingSpecies === s._id ? (
                      <input type="number" value={s.avgBiomassPerTreeKg} onChange={e => {
                        const updated = [...speciesList];
                        updated.find(x => x._id === s._id).avgBiomassPerTreeKg = Number(e.target.value);
                        setSpeciesList(updated);
                      }} className="w-20 px-1 border rounded" />
                    ) : s.avgBiomassPerTreeKg}
                  </td>
                  <td className="px-4 py-3">
                    {editingSpecies === s._id ? (
                      <input type="number" step="0.01" value={s.carbonFraction} onChange={e => {
                        const updated = [...speciesList];
                        updated.find(x => x._id === s._id).carbonFraction = Number(e.target.value);
                        setSpeciesList(updated);
                      }} className="w-20 px-1 border rounded" />
                    ) : s.carbonFraction}
                  </td>
                  <td className="px-4 py-3">
                    {editingSpecies === s._id ? (
                      <button onClick={() => handleUpdateSpecies(s._id, s)} className="text-bc-green-600 font-bold">Save</button>
                    ) : (
                      <button onClick={() => setEditingSpecies(s._id)} className="text-gray-400 group-hover:text-bc-green-600 font-bold transition-colors">Edit</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Panchayat Approvals (Pending NCCR)</h2>
        {/* Filtering logic for plantations */}
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">Loading...</div>
        ) : plantations.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
            No plantations pending NCCR approval.
          </div>
        ) : (
          <div className="space-y-6">
            {plantations
              .filter(p => {
                const matchesState = !filterState || p.userId?.state === filterState;
                const matchesDistrict = !filterDistrict || p.userId?.district === filterDistrict;
                const matchesStatus = !filterStatus || p.status === filterStatus;
                const matchesSearch = !searchTerm ||
                  (p.plantationId && p.plantationId.toLowerCase().includes(searchTerm.toLowerCase())) ||
                  (p.userId?.name && p.userId.name.toLowerCase().includes(searchTerm.toLowerCase()));
                return matchesState && matchesDistrict && matchesStatus && matchesSearch;
              })
              .map((p) => (
              <div
                key={p._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-gray-900">{p.plantationId}</span>
                    {analytics && (
                      <div className="hidden">
                        {/* 
                         * Removed duplicated analytics charts that were inside the loop 
                         */}
                      </div>
                    )}
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
                <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {panchayats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                    No Panchayats onboarded yet.
                  </td>
                </tr>
              ) : (
                panchayats.map((p) => (
                  <tr key={p._id} className={p.accountStatus === 'SUSPENDED' ? 'bg-red-50/30' : ''}>
                    <td className="px-4 py-2 text-gray-900 border-l-4 border-transparent" style={{ borderLeftColor: p.accountStatus === 'SUSPENDED' ? '#EF4444' : 'transparent' }}>
                      <div className="font-bold">{p.name}</div>
                      {p.accountStatus === 'SUSPENDED' && <span className="text-[10px] text-red-600 font-bold uppercase">Suspended</span>}
                    </td>
                    <td className="px-4 py-2 text-gray-700">{p.email}</td>
                    <td className="px-4 py-2 text-gray-700">{p.district}</td>
                    <td className="px-4 py-2 text-gray-700">{p.state}</td>
                    <td className="px-4 py-2 font-mono text-xs text-gray-700">{p.panchayatId || '—'}</td>
                    <td className="px-4 py-2">
                       <button 
                         onClick={() => togglePanchayatStatus(p._id, p.accountStatus || 'ACTIVE')}
                         className={`text-xs font-bold px-3 py-1 rounded-full border transition-all ${
                           p.accountStatus === 'SUSPENDED' 
                            ? 'border-emerald-600 text-emerald-600 hover:bg-emerald-50' 
                            : 'border-red-600 text-red-600 hover:bg-red-50'
                         }`}
                       >
                         {p.accountStatus === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                       </button>
                    </td>
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
                  <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Subject</th>
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
                    <td className="px-4 py-2 text-gray-800">{log.action.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-2">
                       {log.plantationId?.plantationId ? (
                         <button 
                           onClick={() => {
                             setSearchTerm(log.plantationId.plantationId);
                             setFilterStatus('');
                             window.scrollTo({ top: 300, behavior: 'smooth' });
                           }}
                           className="text-bc-green-700 font-mono text-xs font-bold hover:underline bg-bc-green-50 px-2 py-1 rounded"
                         >
                           {log.plantationId.plantationId}
                         </button>
                       ) : '—'}
                    </td>
                    <td className="px-4 py-2 text-gray-700 font-medium">{log.role || '—'}</td>
                    <td className="px-4 py-2 text-gray-700">
                      {log.performedBy
                        ? `${log.performedBy.name || ''}`
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
