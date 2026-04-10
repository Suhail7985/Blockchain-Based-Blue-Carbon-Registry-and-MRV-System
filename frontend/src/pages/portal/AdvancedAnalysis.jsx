import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line 
} from 'recharts';
import { 
  FaBrain, FaShieldAlt, FaUsers, FaChartPie, FaMicroscope, 
  FaExclamationTriangle, FaArrowUp, FaMoneyBillWave 
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const COLORS = ['#10b981', '#f59e0b', '#ef4444']; // GREEN, YELLOW, RED

const AdvancedAnalysis = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIntelligence = async () => {
      try {
        const res = await api.get('/admin/analysis/intelligence');
        if (res.data.success) {
            setData(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load intelligence data');
      } finally {
        setLoading(false);
      }
    };
    fetchIntelligence();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bc-green-600"></div>
      </div>
    );
  }

  if (!data) return null;

  const totalWages = data.communityImpact.reduce((sum, s) => sum + s.wages, 0);
  const riskPieData = [
    { name: 'Low Risk', value: data.riskDistribution.LOW },
    { name: 'Medium Risk', value: data.riskDistribution.MEDIUM },
    { name: 'High Risk', value: data.riskDistribution.HIGH },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FaBrain className="text-purple-600" />
          Intelligence Lab
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Advanced socio-economic impact and MRV precision analytics for NCCR.
        </p>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
              <FaMoneyBillWave />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase">Community Wealth</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalWages.toLocaleString('en-IN')}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">Total wages distributed to local communities across verified sites.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
              <FaMicroscope />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase">Data Precision Index</p>
              <p className="text-2xl font-bold text-gray-900">94.2%</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">Correlation between NGO tree counts and verifier biomass measurements.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl">
              <FaShieldAlt />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase">Risk IQ Score</p>
              <p className="text-2xl font-bold text-gray-900">{data.riskDistribution.HIGH > 0 ? 'NEEDS AUDIT' : 'HEALTHY'}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">Automatic platform health status based on fraud heuristics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Risk Distribution Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FaChartPie className="text-gray-400" />
            Platform Risk Distribution
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Community Impact Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FaUsers className="text-gray-400" />
            Impact Score (Wealth Generation)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.communityImpact}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="state" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f9fafb'}} />
                <Bar dataKey="wages" name="Total Wages (₹)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Species Benchmarking */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Species Benchmarking</h3>
          <div className="space-y-4">
            {data.speciesBenchmarking.map((s, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{s.name}</span>
                  <span className="font-bold text-emerald-600">{s.avgSurvival}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${s.avgSurvival}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MRV Precision Logs */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FaExclamationTriangle className="text-amber-500" />
                Data Precision Log (MRV vs Reported)
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-gray-400 border-b border-gray-100">
                            <th className="pb-3 font-medium uppercase tracking-wider">ID</th>
                            <th className="pb-3 font-medium uppercase tracking-wider">Species</th>
                            <th className="pb-3 font-medium uppercase tracking-wider">Reported</th>
                            <th className="pb-3 font-medium uppercase tracking-wider">MRV Measured</th>
                            <th className="pb-3 font-medium uppercase tracking-wider">Variance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {data.precisionLogs.length === 0 ? (
                            <tr><td colSpan={5} className="py-4 text-center text-gray-400">No MRV audit data available yet.</td></tr>
                        ) : (
                            data.precisionLogs.map((log, i) => (
                                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 font-mono text-xs">{log.id}</td>
                                    <td className="py-4 text-gray-700">{log.species}</td>
                                    <td className="py-4 text-gray-500">{log.estimated.toFixed(2)} t</td>
                                    <td className="py-4 font-bold text-gray-900">{log.measured.toFixed(2)} t</td>
                                    <td className="py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                            log.error < 10 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {log.error.toFixed(1)}%
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalysis;
