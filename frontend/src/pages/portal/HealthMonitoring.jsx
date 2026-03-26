import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { FaHeartbeat, FaSeedling, FaCheckCircle, FaSync, FaExclamationTriangle } from 'react-icons/fa';
import toast from 'react-hot-toast';

const CHECK_ICONS = {
  initial_verification: FaSeedling,
  survival_check: FaHeartbeat,
  carbon_recalculation: FaSync,
};

const CHECK_COLORS = {
  initial_verification: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', ring: 'ring-blue-500' },
  survival_check: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', ring: 'ring-amber-500' },
  carbon_recalculation: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', ring: 'ring-purple-500' },
};

const HealthMonitoring = () => {
  const { user } = useAuth();
  const [plantations, setPlantations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlantation, setSelectedPlantation] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [overdueChecks, setOverdueChecks] = useState([]);

  // Submit form state
  const [showForm, setShowForm] = useState(null);
  const [formData, setFormData] = useState({ result: 'pass', survivalRate: '', survivingTrees: '', updatedCO2: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const isAuthority = ['panchayat', 'admin', 'verifier', 'ngo'].includes(user?.role);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/plantation');
        if (res.data.success) setPlantations(res.data.plantations || []);

        // Load overdue checks for authority users
        if (isAuthority) {
          try {
            const dueRes = await api.get('/health/due/all');
            if (dueRes.data.success) setOverdueChecks(dueRes.data.data || []);
          } catch (e) { /* Ignore for non-authority */ }
        }
      } catch (err) {
        toast.error('Failed to load plantations');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthority]);

  const loadHealthData = async (plantationId) => {
    setHealthLoading(true);
    setSelectedPlantation(plantationId);
    try {
      const res = await api.get(`/health/${plantationId}`);
      if (res.data.success) setHealthData(res.data.data);
    } catch (err) {
      toast.error('Failed to load health data');
    } finally {
      setHealthLoading(false);
    }
  };

  const handleSubmitCheck = async (plantationId, checkType, scheduledYear) => {
    setSubmitting(true);
    try {
      const payload = {
        checkType,
        scheduledYear,
        result: checkType === 'carbon_recalculation' ? 'recalculated' : formData.result,
        survivalRate: formData.survivalRate ? parseFloat(formData.survivalRate) : null,
        survivingTrees: formData.survivingTrees ? parseInt(formData.survivingTrees) : null,
        updatedCO2: formData.updatedCO2 ? parseFloat(formData.updatedCO2) : null,
        notes: formData.notes,
      };
      const res = await api.post(`/health/${plantationId}/check`, payload);
      if (res.data.success) {
        toast.success(res.data.message);
        setShowForm(null);
        setFormData({ result: 'pass', survivalRate: '', survivingTrees: '', updatedCO2: '', notes: '' });
        loadHealthData(plantationId);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit check');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bc-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FaHeartbeat className="text-red-500" />
          Plantation Health Monitoring
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          MRV periodic checks to ensure plantation survival and accurate carbon accounting
        </p>
      </div>

      {/* Overdue Alert for Authority Users */}
      {isAuthority && overdueChecks.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
          <h3 className="font-bold text-amber-800 flex items-center gap-2 mb-3">
            <FaExclamationTriangle />
            {overdueChecks.length} Overdue Health Check{overdueChecks.length > 1 ? 's' : ''}
          </h3>
          <div className="space-y-2">
            {overdueChecks.slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-amber-100">
                <div>
                  <span className="font-mono text-xs text-gray-500">{item.plantationId}</span>
                  <span className="mx-2 text-gray-300">|</span>
                  <span className="text-sm font-medium text-gray-700">{item.species}</span>
                  <span className="mx-2 text-gray-300">|</span>
                  <span className="text-xs text-amber-600 font-bold">{item.dueCheck.label} (Year {item.dueCheck.year})</span>
                </div>
                <button
                  onClick={() => loadHealthData(item.plantationId)}
                  className="text-xs font-bold text-amber-700 hover:text-amber-900 bg-amber-100 px-3 py-1 rounded-lg"
                >
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MRV Schedule Explainer */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="font-bold text-gray-900 mb-4">MRV Monitoring Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { year: 1, label: 'Initial Verification', desc: 'Plantation verified by Panchayat & NCCR', icon: FaSeedling, color: 'blue' },
            { year: 2, label: 'Survival Check', desc: 'Field visit to measure tree survival rate', icon: FaHeartbeat, color: 'amber' },
            { year: 5, label: 'Carbon Recalculation', desc: 'NCCR recalculates CO₂ from actual growth', icon: FaSync, color: 'purple' },
          ].map(s => (
            <div key={s.year} className={`flex items-start gap-3 p-4 bg-${s.color}-50 rounded-xl border border-${s.color}-100`}>
              <div className={`w-10 h-10 rounded-lg bg-${s.color}-100 text-${s.color}-600 flex items-center justify-center text-lg shrink-0`}>
                <s.icon />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Year {s.year} — {s.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plantation Selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="font-bold text-gray-900 mb-4">Select a Plantation</h3>
        {plantations.length === 0 ? (
          <p className="text-gray-400 text-sm">No plantations found. Submit a plantation first.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {plantations.map(p => (
              <button
                key={p.plantationId}
                onClick={() => loadHealthData(p.plantationId)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  selectedPlantation === p.plantationId
                    ? 'border-bc-green-500 bg-bc-green-50 shadow-md'
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                <p className="font-mono text-xs text-gray-400">{p.plantationId}</p>
                <p className="font-bold text-gray-900 text-sm mt-1">{p.speciesName}</p>
                <p className="text-xs text-gray-500 mt-0.5">{p.treeCount} trees · {p.areaHectares} ha</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Health Timeline */}
      {healthLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bc-green-600"></div>
        </div>
      )}

      {healthData && !healthLoading && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Health Timeline</h3>
              <p className="text-sm text-gray-500">
                {healthData.plantation.species} · Age: <span className="font-bold text-gray-700">{healthData.plantation.ageYears} years</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-emerald-600">{healthData.plantation.currentCO2} t</p>
              <p className="text-[10px] text-gray-400 uppercase font-bold">Current CO₂</p>
            </div>
          </div>

          {/* Vertical Timeline */}
          <div className="relative ml-6">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            {healthData.schedule.map((s, idx) => {
              const Icon = CHECK_ICONS[s.type];
              const colors = CHECK_COLORS[s.type];
              const isLast = idx === healthData.schedule.length - 1;

              return (
                <div key={s.type} className={`relative pl-8 ${isLast ? '' : 'pb-8'}`}>
                  {/* Timeline Dot */}
                  <div className={`absolute left-0 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    s.isCompleted
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : s.isDue
                      ? `${colors.bg} ${colors.border} ${colors.text}`
                      : 'bg-gray-100 border-gray-200 text-gray-400'
                  }`}>
                    {s.isCompleted ? <FaCheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>

                  {/* Check Card */}
                  <div className={`rounded-xl border p-4 ${
                    s.isCompleted ? 'border-emerald-200 bg-emerald-50/50' : s.isDue ? `${colors.border} ${colors.bg}` : 'border-gray-100 bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-gray-900 text-sm">Year {s.year} — {s.label}</h4>
                      {s.isCompleted ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase">Completed</span>
                      ) : s.isDue ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 uppercase">Due Now</span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-200 text-gray-500 uppercase">Upcoming</span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 mb-2">Due: {new Date(s.dueDate).toLocaleDateString()}</p>

                    {/* Completed Check Details */}
                    {s.isCompleted && s.checkData && (
                      <div className="bg-white rounded-lg p-3 mt-2 border border-emerald-100 space-y-1 text-xs text-gray-600">
                        <p><span className="font-medium text-gray-400">Result:</span> <span className="font-bold text-emerald-700 uppercase">{s.checkData.result}</span></p>
                        {s.checkData.survivalRate != null && (
                          <p><span className="font-medium text-gray-400">Survival Rate:</span> <span className="font-bold">{s.checkData.survivalRate}%</span></p>
                        )}
                        {s.checkData.survivingTrees != null && (
                          <p><span className="font-medium text-gray-400">Surviving Trees:</span> <span className="font-bold">{s.checkData.survivingTrees}</span></p>
                        )}
                        {s.checkData.updatedCO2 != null && (
                          <p><span className="font-medium text-gray-400">Updated CO₂:</span> <span className="font-bold">{s.checkData.updatedCO2} tons</span></p>
                        )}
                        {s.checkData.notes && (
                          <p><span className="font-medium text-gray-400">Notes:</span> {s.checkData.notes}</p>
                        )}
                        <p className="text-[10px] text-gray-400">Performed: {new Date(s.checkData.performedAt).toLocaleDateString()}</p>
                      </div>
                    )}

                    {/* Submit Button (Authority only, for due/uncompleted checks) */}
                    {isAuthority && s.isDue && !s.isCompleted && (
                      <>
                        {showForm === `${s.type}_${s.year}` ? (
                          <div className="bg-white rounded-lg p-4 mt-3 border border-gray-200 space-y-3">
                            {s.type === 'survival_check' && (
                              <>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Survival Rate (%)</label>
                                    <input type="number" max={100} min={0} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" value={formData.survivalRate} onChange={e => setFormData({...formData, survivalRate: e.target.value})} />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Surviving Trees</label>
                                    <input type="number" min={0} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" value={formData.survivingTrees} onChange={e => setFormData({...formData, survivingTrees: e.target.value})} />
                                  </div>
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Result</label>
                                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" value={formData.result} onChange={e => setFormData({...formData, result: e.target.value})}>
                                    <option value="pass">Pass</option>
                                    <option value="fail">Fail</option>
                                  </select>
                                </div>
                              </>
                            )}
                            {s.type === 'carbon_recalculation' && (
                              <div>
                                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Recalculated CO₂ (tons)</label>
                                <input type="number" step="0.1" min={0} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" value={formData.updatedCO2} onChange={e => setFormData({...formData, updatedCO2: e.target.value})} />
                              </div>
                            )}
                            <div>
                              <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Notes</label>
                              <textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSubmitCheck(healthData.plantation.plantationId, s.type, s.year)}
                                disabled={submitting}
                                className="flex-1 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                              >
                                {submitting ? 'Submitting...' : 'Submit Check'}
                              </button>
                              <button onClick={() => setShowForm(null)} className="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200">
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowForm(`${s.type}_${s.year}`)}
                            className={`mt-2 w-full py-2 text-xs font-bold rounded-lg transition-colors ${colors.bg} ${colors.text} hover:opacity-80 border ${colors.border}`}
                          >
                            Perform {s.label}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthMonitoring;
