import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getAdminStats,
  getAdminAnalytics,
  getAuditLogs,
} from '../../services/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import {
  FaUsers,
  FaLandmark,
  FaLeaf,
  FaCoins,
  FaHistory,
  FaShieldAlt,
  FaChartBar,
  FaChevronDown,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Audit Hub States
  const [auditPage, setAuditPage] = useState(1);
  const [hasMoreLogs, setHasMoreLogs] = useState(false);
  const [auditAction, setAuditAction] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, analyticsRes, auditRes] = await Promise.all([
        getAdminStats(),
        getAdminAnalytics(),
        getAuditLogs({ page: 1, limit: 15 }),
      ]);

      if (statsRes.success) setStats(statsRes);
      if (analyticsRes.success) setAnalytics(analyticsRes);
      if (auditRes.success) {
        setAuditLogs(auditRes.logs);
        setHasMoreLogs(auditRes.pagination?.hasMore);
      }
    } catch (e) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchMoreLogs = async () => {
    if (loadingMore || !hasMoreLogs) return;
    setLoadingMore(true);
    try {
      const nextPage = auditPage + 1;
      const res = await getAuditLogs({ 
        page: nextPage, 
        limit: 15, 
        action: auditAction 
      });
      if (res.success) {
        setAuditLogs(prev => [...prev, ...res.logs]);
        setAuditPage(nextPage);
        setHasMoreLogs(res.pagination?.hasMore);
      }
    } catch (e) {
      toast.error('Failed to load older logs');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleFilterLogs = async (action) => {
    setAuditAction(action);
    setAuditPage(1);
    setLoadingMore(true);
    try {
      const res = await getAuditLogs({ page: 1, limit: 15, action });
      if (res.success) {
        setAuditLogs(res.logs);
        setHasMoreLogs(res.pagination?.hasMore);
      }
    } catch (e) {
      toast.error('Failed to filter logs');
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bc-green-600 mb-4"></div>
        <p className="text-gray-500 font-medium tracking-wide">Initializing Administrative Console...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats Grid */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Citizens', val: stats?.totalUsers, icon: FaUsers, color: 'blue' },
          { label: 'Panchayats', val: stats?.totalPanchayats, icon: FaLandmark, color: 'indigo' },
          { label: 'Pending Verification', val: stats?.pendingPlantations, icon: FaLeaf, color: 'orange' },
          { label: 'BCC Minted', val: stats ? Math.round(stats.tokensMinted * 100) / 100 : 0, icon: FaCoins, color: 'emerald' },
        ].map((s, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
              <div className={`p-2 rounded-lg bg-gray-50`}>
                <s.icon className={`w-4 h-4 text-gray-600`} />
              </div>
            </div>
            <p className="text-3xl font-black text-gray-900">{s.val ?? '—'}</p>
          </div>
        ))}
      </section>

      {/* Analytics Rows */}
      {analytics && (
        <section className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <FaChartBar className="text-bc-green-500" />
                Sequestration by State
              </h3>
              <span className="text-xs font-bold text-gray-400 uppercase">tCO2e Capacity</span>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.stateBreakdown} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="_id" type="category" tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} width={80} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="totalCO2" fill="#10B981" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <FaHistory className="text-blue-500" />
                Monthly Sequestration Trend
              </h3>
              <span className="text-xs font-bold text-gray-400 uppercase">Registry Growth</span>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.monthlyTrend.map(m => ({ name: `${m._id.month}/${m._id.year}`, co2: m.totalCO2 }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="co2" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}

      {/* Audit Activity Feed */}
      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Activity Hub</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Registry Chain-of-Custody Log</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <select
                value={auditAction}
                onChange={(e) => handleFilterLogs(e.target.value)}
                className="appearance-none bg-white pl-4 pr-10 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 outline-none focus:ring-2 focus:ring-bc-green-500"
              >
                <option value="">All Actions</option>
                <option value="NCCR_PLANTATION_APPROVE_FINAL">Approvals</option>
                <option value="NCCR_PLANTATION_REJECT">Rejections</option>
                <option value="CREATE_PANCHAYAT">Panchayat Onboarding</option>
                <option value="mrv_data_updated">MRV Updates</option>
              </select>
              <FaChevronDown className="absolute right-3 top-3 text-gray-400 w-2 h-2 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {auditLogs.length > 0 ? (
            auditLogs.map((log) => (
              <div key={log._id} className="px-8 py-6 flex items-start gap-5 hover:bg-gray-50/30 transition-colors">
                <div className={`mt-1 p-3 rounded-2xl ${
                  log.action.includes('REJECT') ? 'bg-red-50 text-red-600' : 
                  log.action.includes('APPROVE') ? 'bg-emerald-50 text-emerald-600' : 
                  'bg-blue-50 text-blue-600'
                }`}>
                  <FaShieldAlt className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h5 className="font-black text-gray-900 text-sm tracking-tight">{log.action.replace(/_/g, ' ')}</h5>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                      {new Date(log.timestamp).toLocaleDateString()} · {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    {log.performedBy ? (
                      <span>By <strong className="text-gray-900 font-bold">{log.performedBy.name}</strong> · {log.role}</span>
                    ) : <span className="italic">System Process</span>}
                  </p>
                  {log.plantationId && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-500 tracking-widest uppercase">
                      ID: {log.plantationId.plantationId}
                    </div>
                  )}
                  {log.previousStatus && (
                    <div className="mt-4 flex items-center gap-3">
                      <span className="text-[10px] font-bold text-gray-300 uppercase">Transition</span>
                      <span className="text-xs font-bold text-gray-400 line-through">{log.previousStatus}</span>
                      <div className="h-px w-4 bg-gray-200" />
                      <span className="text-xs font-black text-bc-green-600">{log.newStatus}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-400 font-medium">No activity records found matching filters.</div>
          )}
        </div>

        {hasMoreLogs && (
          <div className="p-8 text-center border-t border-gray-50">
            <button
              onClick={handleFetchMoreLogs}
              disabled={loadingMore}
              className="px-8 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-black text-gray-600 hover:bg-gray-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {loadingMore ? 'Fetching Records...' : 'Load Older History'}
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
