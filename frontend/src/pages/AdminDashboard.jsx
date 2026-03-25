import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { getAdminStats, getAdminAnalytics } from '../services/api';

function StatCard({ icon, label, value, color, sub }) {
  return (
    <div className={`bg-white rounded-2xl shadow-md p-5 border-l-4 ${color}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-800">{value ?? '—'}</p>
          <p className="text-sm text-gray-500 mt-1">{label}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, a] = await Promise.all([getAdminStats(), getAdminAnalytics()]);
        setStats(s);
        setAnalytics(a);
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const monthlyData = analytics?.monthlyTrend?.map(m => ({
    name: `${MONTH_NAMES[(m._id.month || 1) - 1]} ${m._id.year}`,
    co2: parseFloat(m.totalCO2?.toFixed(2) || 0),
  })) || [];

  const stateData = analytics?.stateBreakdown?.slice(0, 8).map(s => ({
    name: s._id || 'Unknown',
    tokens: parseFloat(s.totalTokens?.toFixed(2) || 0),
    co2: parseFloat(s.totalCO2?.toFixed(2) || 0),
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-700 text-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">📊 NCCR Admin Dashboard</h1>
            <p className="text-white/80">Blue Carbon Registry — National Command & Control Room</p>
          </div>
          <div className="flex gap-3">
            <Link to="/verification" className="bg-white/20 hover:bg-white/30 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all border border-white/30">
              🌱 Verify Plantations
            </Link>
            <Link to="/users" className="bg-white/20 hover:bg-white/30 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all border border-white/30">
              👥 Manage Users
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-4xl animate-spin inline-block mb-3">🌀</div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon="👥" label="Total Users" value={stats?.totalUsers?.toLocaleString()} color="border-blue-400" />
            <StatCard icon="🏛️" label="Panchayats" value={stats?.totalPanchayats?.toLocaleString()} color="border-green-400" />
            <StatCard icon="⏳" label="Pending NCCR Review" value={stats?.pendingPlantations?.toLocaleString()} color="border-yellow-400" />
            <StatCard icon="🪙" label="BCC Tokens Minted" value={stats?.tokensMinted?.toFixed(0)} sub="Blue Carbon Credits" color="border-purple-400" />
          </div>

          {analytics && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon="✅" label="Verified Plantations" value={analytics.totalVerifiedPlantations?.toLocaleString()} color="border-emerald-400" />
                <StatCard icon="☁️" label="Total CO₂ Captured" value={`${analytics.totalCO2?.toFixed(2)} t`} sub="tonnes CO₂ equivalent" color="border-teal-400" />
                <StatCard icon="⛓️" label="Blockchain TXs" value={analytics.totalBlockchainTx?.toLocaleString()} color="border-indigo-400" />
                <StatCard icon="🌏" label="States Covered" value={analytics.stateBreakdown?.length || 0} color="border-orange-400" />
              </div>

              {/* Monthly CO2 Chart */}
              {monthlyData.length > 0 && (
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">📈 Monthly CO₂ Sequestration (tonnes)</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id="co2Gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                        formatter={(v) => [`${v} t CO₂`, 'CO₂ Captured']}
                      />
                      <Area type="monotone" dataKey="co2" stroke="#059669" strokeWidth={2} fill="url(#co2Gradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* State Breakdown Chart */}
              {stateData.length > 0 && (
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">🗺️ State-wise Carbon Credits (BCC Tokens)</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={stateData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                      />
                      <Legend />
                      <Bar dataKey="tokens" fill="#8b5cf6" name="BCC Tokens" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="co2" fill="#0ea5e9" name="CO₂ (t)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {(monthlyData.length === 0 && stateData.length === 0) && (
                <div className="bg-white rounded-2xl shadow-md p-10 text-center">
                  <p className="text-4xl mb-3">📊</p>
                  <p className="font-semibold text-gray-600">No analytics data yet</p>
                  <p className="text-sm text-gray-400 mt-1">Charts will appear after plantations are verified and tokens minted.</p>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { to: '/verification', icon: '🌳', title: 'Verify Plantations', desc: `${stats?.pendingPlantations || 0} pending NCCR review`, color: 'from-green-500 to-emerald-600' },
          { to: '/users', icon: '👥', title: 'Manage Users', desc: 'Approve, reject & assign roles', color: 'from-blue-500 to-cyan-600' },
          { to: '/profile', icon: '⚙️', title: 'Carbon Settings', desc: 'Adjust biomass & token rules', color: 'from-purple-500 to-pink-600' },
        ].map(action => (
          <Link
            key={action.to}
            to={action.to}
            className={`bg-gradient-to-r ${action.color} text-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all group`}
          >
            <div className="text-3xl mb-2">{action.icon}</div>
            <h4 className="font-bold text-lg">{action.title}</h4>
            <p className="text-white/80 text-sm mt-1">{action.desc}</p>
            <span className="inline-block mt-3 text-xs font-semibold opacity-80 group-hover:opacity-100">Open →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
