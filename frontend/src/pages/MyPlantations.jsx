import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { getMyPlantations, getSpecies, resubmitPlantation } from '../services/api';
import WalletConnect from '../components/WalletConnect';
import { FaTimes, FaCloudUploadAlt, FaSeedling, FaClipboardList, FaCheckCircle, FaHourglassHalf, FaLink, FaCoins, FaTimesCircle, FaTree, FaWallet, FaLeaf, FaGlobe, FaCalendarAlt, FaMapMarkerAlt, FaSyncAlt, FaInfoCircle, FaPencilAlt, FaPlus } from 'react-icons/fa';


const STATUS_CONFIG = {
  PENDING_PANCHAYAT: {
    label: 'Submitted',
    icon: <FaClipboardList />,
    bg: 'bg-blue-50 border-blue-200 text-blue-800',
    step: 0,
  },
  VERIFIED: {
    label: 'Panchayat Verified',
    icon: <FaCheckCircle />,
    bg: 'bg-green-50 border-green-200 text-green-800',
    step: 1,
  },
  BLOCKCHAIN_PENDING: {
    label: 'Blockchain Pending',
    icon: <FaHourglassHalf />,
    bg: 'bg-purple-50 border-purple-200 text-purple-800',
    step: 1,
  },
  BLOCKCHAIN_CONFIRMED: {
    label: 'On Blockchain',
    icon: <FaLink />,
    bg: 'bg-indigo-50 border-indigo-200 text-indigo-800',
    step: 2,
  },
  TOKEN_MINTED: {
    label: 'Tokens Issued',
    icon: <FaCoins />,
    bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    step: 3,
  },
  REJECTED: {
    label: 'Rejected',
    icon: <FaTimesCircle />,
    bg: 'bg-red-50 border-red-200 text-red-800',
    step: -1,
  },
};

const TIMELINE_STEPS = [
  { label: 'Submitted', icon: <FaClipboardList /> },
  { label: 'Panchayat Verified', icon: <FaCheckCircle /> },
  { label: 'On Blockchain', icon: <FaLink /> },
  { label: 'Tokens Issued', icon: <FaCoins /> },
];

function StatusTimeline({ status }) {
  const config = STATUS_CONFIG[status] || {};
  const currentStep = config.step ?? 0;
  if (status === 'REJECTED') {
    return (
      <div className="flex items-center gap-2 mt-3 text-red-600 text-xs font-semibold">
        <FaTimesCircle className="w-4 h-4" />
        <span>Rejected — Please re-submit after addressing feedback</span>
      </div>
    );
  }
  return (
    <div className="mt-3">
      <div className="flex items-center gap-1 flex-wrap">
        {TIMELINE_STEPS.map((step, idx) => (
          <React.Fragment key={step.label}>
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition-all ${
                idx <= currentStep
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-gray-100 text-gray-400 border border-gray-200'
              }`}
            >
              <span>{step.icon}</span>
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {idx < TIMELINE_STEPS.length - 1 && (
              <span className={`text-xs ${idx < currentStep ? 'text-green-400' : 'text-gray-300'}`}>→</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className={`bg-white rounded-2xl shadow-md p-5 border-l-4 ${color}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{label}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

export default function MyPlantations() {
  const { user } = useAuth();
  const [plantations, setPlantations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const [resubmitItem, setResubmitItem] = useState(null);
  const [speciesList, setSpeciesList] = useState([]);

  const fetchPlantations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyPlantations();
      setPlantations(data.plantations || []);
    } catch (err) {
      toast.error('Failed to load your plantations.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSpecies = useCallback(async () => {
    try {
      const data = await getSpecies();
      if (data.success) setSpeciesList(data.species || []);
    } catch (err) {
      console.error('Failed to load species');
    }
  }, []);

  useEffect(() => { 
    fetchPlantations(); 
    fetchSpecies();
  }, [fetchPlantations, fetchSpecies]);

  // Compute summary stats
  const totalSubmitted = plantations.length;
  const verified = plantations.filter(p => ['VERIFIED', 'BLOCKCHAIN_CONFIRMED', 'TOKEN_MINTED'].includes(p.status));
  const minted = plantations.filter(p => p.status === 'TOKEN_MINTED');
  const totalCO2 = minted.reduce((sum, p) => sum + (p.carbonCalculation?.co2eq || 0), 0);
  const totalTokens = minted.reduce((sum, p) => sum + (p.carbonCalculation?.tokens || 0), 0);

  const filters = [
    { key: 'ALL', label: 'All', icon: <FaGlobe /> },
    { key: 'PENDING_PANCHAYAT', label: 'Submitted', icon: <FaClipboardList /> },
    { key: 'VERIFIED', label: 'Verified', icon: <FaCheckCircle /> },
    { key: 'TOKEN_MINTED', label: 'Tokens', icon: <FaCoins /> },
    { key: 'REJECTED', label: 'Rejected', icon: <FaTimesCircle /> },
  ];

  const filtered = filter === 'ALL' ? plantations : plantations.filter(p => p.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
              <FaTree className="text-bc-green-100" /> My Plantations
            </h1>
            <p className="text-white/80">Track your submissions and carbon credit earnings</p>
            {user?.walletAddress && (
              <p className="text-white/60 text-xs mt-2 font-mono flex items-center gap-2">
                <FaWallet /> Wallet: {user.walletAddress.slice(0, 8)}...{user.walletAddress.slice(-6)}
              </p>
            )}
          </div>
          <Link
            to="/submit"
            className="bg-white text-green-700 font-bold px-5 py-3 rounded-xl hover:bg-green-50 transition-all shadow-md flex items-center gap-2"
          >
            <FaPlus /> Submit New Plantation
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FaClipboardList className="text-blue-500" />}
          label="Total Submitted"
          value={totalSubmitted}
          color="border-blue-400"
        />
        <StatCard
          icon={<FaCheckCircle className="text-green-500" />}
          label="Verified"
          value={verified.length}
          color="border-green-400"
        />
        <StatCard
          icon={<FaCloudUploadAlt className="text-teal-500" />}
          label="CO₂ Captured"
          value={`${totalCO2.toFixed(2)} t`}
          sub="tonnes CO₂ equivalent"
          color="border-teal-400"
        />
        <StatCard
          icon={<FaCoins className="text-purple-500" />}
          label="BCC Tokens"
          value={totalTokens.toFixed(3)}
          sub="Blue Carbon Credits"
          color="border-purple-400"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full font-semibold text-sm transition-all flex items-center gap-2 ${
              filter === f.key
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300'
            }`}
          >
            {f.icon} {f.label}
            {f.key !== 'ALL' && (
              <span className="ml-1 bg-black/10 rounded-full px-1.5 py-0.5 text-xs">
                {plantations.filter(p => p.status === f.key).length}
              </span>
            )}
          </button>
        ))}
        <button
          onClick={fetchPlantations}
          className="px-4 py-2 rounded-full font-medium text-sm bg-white text-gray-600 border border-gray-200 hover:border-blue-300 transition-all flex items-center gap-2"
        >
          <FaSyncAlt /> Refresh
        </button>
      </div>

      {/* Plantation List */}
      {loading ? (
        <div className="text-center py-16">
          <FaSyncAlt className="text-4xl animate-spin mx-auto mb-3 text-green-500" />
          <p className="text-gray-500">Loading your plantations...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <FaLeaf className="text-5xl mb-4 mx-auto text-green-500" />
          <p className="text-lg font-semibold text-gray-700">
            {filter === 'ALL' ? 'No plantations yet' : `No ${filter.replace(/_/g, ' ').toLowerCase()} plantations`}
          </p>
          {filter === 'ALL' && (
            <Link
              to="/submit"
              className="inline-flex mt-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold px-6 py-3 rounded-xl hover:shadow-lg transition-all items-center gap-2"
            >
              <FaPlus /> Submit Your First Plantation
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((p) => {
            const sc = STATUS_CONFIG[p.status] || { label: p.status, icon: '❓', bg: 'bg-gray-50', step: 0 };
            const hasCarbonData = p.carbonCalculation?.co2eq;
            const hasBlockchain = p.blockchainTxHash || p.tokenTxHash;

            return (
              <div
                key={p._id}
                className={`bg-white rounded-2xl shadow-md border-l-4 p-6 transition-all hover:shadow-lg ${
                  p.status === 'REJECTED' ? 'border-red-400' :
                  p.status === 'TOKEN_MINTED' ? 'border-emerald-400' :
                  p.status === 'PENDING_PANCHAYAT' ? 'border-yellow-400' :
                  'border-blue-400'
                }`}
              >
                {/* Top row */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-gray-800">{p.speciesName}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full border flex items-center gap-1.5 ${sc.bg}`}>
                        {sc.icon} {sc.label}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 mt-1">
                      <p className="text-xs text-gray-400 font-mono flex items-center gap-1" title="Plantation ID"><FaInfoCircle /> {p.plantationId}</p>
                      {p.landId?.landReference && (
                        <p className="text-xs text-gray-500 flex items-center gap-1" title="Registered Land"><FaMapMarkerAlt /> {p.landId.landReference}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(p.submissionTimestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-gray-400 text-xs">Trees</p>
                    <p className="font-bold text-gray-800 flex items-center justify-center gap-1.5"><FaTree className="text-green-600" /> {p.treeCount?.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-gray-400 text-xs">Area</p>
                    <p className="font-bold text-gray-800 flex items-center justify-center gap-1.5"><FaMapMarkerAlt className="text-blue-600" /> {p.areaHectares} ha</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-gray-400 text-xs">Planted On</p>
                    <p className="font-bold text-gray-800 flex items-center justify-center gap-1.5"><FaCalendarAlt className="text-purple-600" /> {new Date(p.plantationDate).toLocaleDateString('en-IN')}</p>
                  </div>
                  {p.gpsCoordinates?.lat ? (
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-gray-400 text-xs">GPS</p>
                      <a
                        href={`https://maps.google.com/?q=${p.gpsCoordinates.lat},${p.gpsCoordinates.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-blue-600 hover:underline text-xs flex items-center justify-center gap-1"
                      >
                        <FaMapMarkerAlt /> View Map ↗
                      </a>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-gray-400 text-xs">GPS</p>
                      <p className="text-gray-400 text-xs">Not recorded</p>
                    </div>
                  )}
                </div>

                {/* Carbon & Blockchain section for minted */}
                {hasCarbonData && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
                    <h4 className="text-sm font-semibold text-emerald-800 mb-3 flex items-center gap-2"><FaLeaf /> Carbon Sequestration Report</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div className="text-center">
                        <p className="text-emerald-600 text-xs">Biomass</p>
                        <p className="font-bold text-emerald-900">{p.carbonCalculation.biomass} t</p>
                      </div>
                      <div className="text-center">
                        <p className="text-emerald-600 text-xs">Carbon</p>
                        <p className="font-bold text-emerald-900">{p.carbonCalculation.carbon} t</p>
                      </div>
                      <div className="text-center">
                        <p className="text-emerald-600 text-xs">CO₂ Captured</p>
                        <p className="font-bold text-emerald-900">{p.carbonCalculation.co2eq} t</p>
                      </div>
                      <div className="text-center">
                        <p className="text-emerald-600 text-xs">BCC Tokens</p>
                        <p className="font-bold text-emerald-900 flex items-center justify-center gap-1.5"><FaCoins className="text-yellow-500" /> {p.carbonCalculation.tokens}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Blockchain info */}
                {hasBlockchain && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
                    <h4 className="text-sm font-semibold text-purple-800 mb-3 flex items-center gap-2"><FaLink /> Blockchain Records</h4>
                    <div className="space-y-2 text-xs">
                      {p.blockchainTxHash && (
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-purple-600 font-medium">Registry TX:</span>
                          <a
                            href={`https://amoy.polygonscan.com/tx/${p.blockchainTxHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-blue-600 hover:underline"
                          >
                            {p.blockchainTxHash.slice(0, 18)}...↗
                          </a>
                        </div>
                      )}
                      {p.tokenTxHash && (
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-purple-600 font-medium">Token Mint TX:</span>
                          <a
                            href={`https://amoy.polygonscan.com/tx/${p.tokenTxHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-blue-600 hover:underline"
                          >
                            {p.tokenTxHash.slice(0, 18)}...↗
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Rejection reason & Resubmit */}
                {p.status === 'REJECTED' && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                    <p className="font-semibold text-red-700 mb-1 flex items-center gap-1.5"><FaTimesCircle /> Rejection Reason:</p>
                    <p className="text-red-600 text-sm mb-3">{p.panchayatVerification?.remarks || p.nccrVerification?.notes || 'No specific remarks provided.'}</p>
                    <button
                      onClick={() => setResubmitItem(p)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-all flex items-center gap-2"
                    >
                      <FaPencilAlt /> Correct & Resubmit
                    </button>
                  </div>
                )}

                {/* Status Timeline */}
                <StatusTimeline status={p.status} />
              </div>
            );
          })}
        </div>
      )}

      {/* Wallet Connect */}
      <WalletConnect onWalletConnected={(addr) => toast.success(`Wallet ${addr.slice(0,8)}... linked!`)} />

      {/* Resubmit Modal */}
      {resubmitItem && (
        <ResubmitModal
          plantation={resubmitItem}
          speciesList={speciesList}
          onClose={() => setResubmitItem(null)}
          onSuccess={() => {
            setResubmitItem(null);
            fetchPlantations();
          }}
        />
      )}
    </div>
  );
}

function ResubmitModal({ plantation, speciesList, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    speciesName: plantation.speciesName,
    treeCount: plantation.treeCount,
    areaHectares: plantation.areaHectares,
  });
  const [newImages, setNewImages] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('speciesName', form.speciesName);
      fd.append('treeCount', form.treeCount);
      fd.append('areaHectares', form.areaHectares);
      newImages.forEach(img => fd.append('plantationImages', img));

      const res = await resubmitPlantation(plantation._id, fd);
      if (res.success) {
        toast.success('Plantation resubmitted successfully!');
        onSuccess();
      } else {
        toast.error(res.message || 'Resubmission failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error during resubmission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-gradient-to-r from-red-600 to-amber-600 px-6 py-4 flex items-center justify-between text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FaSeedling /> Correct Plantation
          </h2>
          <button onClick={onClose}><FaTimes /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-800 mb-2">
            <strong>Previous Rejection Feedback:</strong>
            <p className="mt-1 italic">"{plantation.panchayatVerification?.remarks || plantation.nccrVerification?.notes}"</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Species Name</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              value={form.speciesName}
              onChange={e => setForm({...form, speciesName: e.target.value})}
              required
            >
              <option value="">Select Species</option>
              {speciesList.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tree Count</label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                value={form.treeCount}
                onChange={e => setForm({...form, treeCount: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area (ha)</label>
              <input
                type="number"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                value={form.areaHectares}
                onChange={e => setForm({...form, areaHectares: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Add New Proof Images (Optional)</label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-red-300 transition-colors">
              <input 
                type="file" 
                multiple 
                className="hidden" 
                id="resubmit-images" 
                onChange={e => setNewImages(Array.from(e.target.files))}
              />
              <label htmlFor="resubmit-images" className="cursor-pointer">
                <FaCloudUploadAlt className="mx-auto text-3xl text-gray-400 mb-1" />
                <span className="text-xs text-gray-500">
                  {newImages.length > 0 ? `${newImages.length} images selected` : 'Upload corrected images'}
                </span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Resubmitting...' : 'Submit Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
