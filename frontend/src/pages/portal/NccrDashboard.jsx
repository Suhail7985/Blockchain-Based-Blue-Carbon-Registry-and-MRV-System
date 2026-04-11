import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  getAdminPlantations,
  nccrApproveFinal,
  nccrRejectPlantation,
  getPanchayats,
  getAdminUsers,
  createPanchayat,
} from '../../services/api';
import {
  FaLandmark,
  FaShieldAlt,
  FaSearch,
  FaPlus,
  FaUserTag,
  FaMicroscope,
} from 'react-icons/fa';
import MrvDataModal from '../../components/portal/MrvDataModal';
import toast from 'react-hot-toast';

const PENDING_NCCR = 'PENDING_NCCR';

const NccrDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('plantations');
  const [plantations, setPlantations] = useState([]);
  const [panchayats, setPanchayats] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [citizenSearch, setCitizenSearch] = useState('');
  
  // Modals / Actions
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectNotes, setRejectNotes] = useState('');
  const [selectedMrvData, setSelectedMrvData] = useState(null);
  const [showPanchayatModal, setShowPanchayatModal] = useState(false);
  const [newPanchayat, setNewPanchayat] = useState({
    name: '', email: '', district: '', state: '', password: ''
  });
  const [creating, setCreating] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      getAdminPlantations(PENDING_NCCR),
      getPanchayats(),
      getAdminUsers({ role: 'citizen' }),
    ])
      .then(([pending, panchayatRes, usersRes]) => {
        if (pending.success && pending.plantations) setPlantations(pending.plantations);
        if (panchayatRes.success && panchayatRes.panchayats) setPanchayats(panchayatRes.panchayats);
        if (usersRes.success) setUsers(usersRes.users);
      })
      .catch(() => toast.error('Failed to load operational data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm('Confirm final approval and BCC credit minting?')) return;
    try {
      const res = await nccrApproveFinal(id);
      if (res.success) {
        toast.success(res.message);
        load();
      } else toast.error(res.message || 'Approval failed');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async (id) => {
    if (!rejectNotes.trim()) {
      toast.error('Rejection notes are required');
      return;
    }
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
    }
  };

  const handleCreatePanchayat = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await createPanchayat(newPanchayat);
      if (res.success) {
        toast.success('Panchayat official onboarded');
        setNewPanchayat({ name: '', email: '', district: '', state: '', password: '' });
        setShowPanchayatModal(false);
        load();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to onboard');
    } finally {
      setCreating(false);
    }
  };

  if (!user || !['admin', 'verifier'].includes(user.role)) {
    return <Navigate to="/portal" replace />;
  }

  const filteredPlantations = plantations.filter(p => 
    p.plantationId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(citizenSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(citizenSearch.toLowerCase()) ||
    u.referenceId?.toLowerCase().includes(citizenSearch.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bc-green-600 mb-4"></div>
      <p className="text-gray-500 font-medium">Loading Operations Hub...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">NCCR Approval Console</h1>
          <p className="text-gray-500 font-medium mt-1">Registry Verification & Stakeholder Management</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          {[
            { id: 'plantations', label: 'Queue', icon: FaShieldAlt },
            { id: 'panchayats', label: 'Panchayats', icon: FaLandmark },
            { id: 'citizens', label: 'Citizens', icon: FaUserTag },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-bc-green-700 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'plantations' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-gray-900">Verification Queue</h3>
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search Registry ID..."
                  className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none w-64 focus:ring-2 focus:ring-bc-green-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {filteredPlantations.length > 0 ? filteredPlantations.map((p) => (
                <div key={p._id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6 border-b border-gray-50 flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-black rounded uppercase">Phase 2: NCCR Final</span>
                        {p.risk?.riskScore === 'HIGH' && (
                          <span className="px-2 py-0.5 bg-red-50 text-red-700 text-[10px] font-black rounded uppercase">High Risk</span>
                        )}
                      </div>
                      <h4 className="text-lg font-black text-gray-900">{p.plantationId}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Submitted</p>
                      <p className="text-sm font-bold text-gray-900">{new Date(p.submissionTimestamp).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-2 gap-6 bg-gray-50/30">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Applicant</p>
                      <p className="text-sm font-bold text-gray-900">{p.userId?.name}</p>
                      <p className="text-xs text-gray-500">{p.userId?.email}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Location</p>
                      <p className="text-sm font-bold text-gray-900">{p.userId?.district}, {p.userId?.state}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Area (ha)</p>
                      <p className="text-sm font-bold text-gray-900">{p.areaHectares}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Estimated Credits</p>
                      <p className="text-base font-black text-bc-green-700">{(p.areaHectares * (p.speciesInfo?.sequestrationRate || 1)).toFixed(2)} BCC</p>
                    </div>
                  </div>

                  <div className="p-6 flex flex-wrap items-center gap-3">
                    <button 
                      onClick={() => setSelectedMrvData(p)}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all active:scale-95"
                    >
                      <FaMicroscope className="text-bc-green-500" />
                      Detailed MRV
                    </button>
                    <div className="flex-1"></div>
                    <button 
                      onClick={() => setRejectingId(p._id)}
                      className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => handleApprove(p._id)}
                      className="px-6 py-2 bg-bc-green-600 text-white rounded-xl text-xs font-black shadow-lg shadow-bc-green/20 hover:bg-bc-green-700 transition-all active:scale-95"
                    >
                      Approve & Mint
                    </button>
                  </div>
                </div>
              )) : (
                <div className="lg:col-span-2 py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                  <FaShieldAlt className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <h4 className="text-lg font-bold text-gray-400">Queue Clear</h4>
                  <p className="text-sm text-gray-400">No new plantations pending final registry review.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'panchayats' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-gray-900">Local Panchayat Officers</h3>
              <button 
                onClick={() => setShowPanchayatModal(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg active:scale-95"
              >
                <FaPlus />
                Onboard Officer
              </button>
            </div>
            
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Official Details</th>
                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Jurisdiction</th>
                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Public ID</th>
                    <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {panchayats.map(pan => (
                    <tr key={pan._id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-8 py-4">
                        <p className="font-bold text-gray-900">{pan.name}</p>
                        <p className="text-xs text-gray-500">{pan.email}</p>
                      </td>
                      <td className="px-8 py-4 text-sm text-gray-600 font-medium">
                        {pan.district}, {pan.state}
                      </td>
                      <td className="px-8 py-4 font-mono text-[11px] text-bc-green-600 font-bold uppercase">
                        {pan.panchayatId}
                      </td>
                      <td className="px-8 py-4">
                        <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-[10px] font-bold">ACTIVE</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'citizens' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-gray-900">Citizen Directory</h3>
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search Name or BCR-ID..."
                  className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none w-64 focus:ring-2 focus:ring-bc-green-500"
                  value={citizenSearch}
                  onChange={(e) => setCitizenSearch(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map(u => (
                <div key={u._id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-start gap-4 hover:border-bc-green-200 transition-colors">
                  <div className="w-12 h-12 bg-bc-green-50 rounded-2xl flex items-center justify-center text-bc-green-600 font-black text-lg">
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="font-black text-gray-900 leading-tight">{u.name}</h5>
                    <p className="text-xs text-gray-500 font-medium">{u.email}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <span>{u.district}</span>
                      <span>·</span>
                      <span>{u.state}</span>
                    </div>
                    <div className="mt-2 inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold font-mono">
                      {u.referenceId || 'UNVERIFIED'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <MrvDataModal
        data={selectedMrvData}
        onClose={() => setSelectedMrvData(null)}
      />

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-gray-900 mb-2">Reject Plantation</h3>
            <p className="text-sm text-gray-500 mb-6 font-medium">Please provide a reason for rejection. This will be sent to the user.</p>
            <textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="Reason for rejection..."
              className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-red-500 resize-none mb-6 font-medium"
            />
            <div className="flex gap-3">
              <button 
                onClick={() => { setRejectingId(null); setRejectNotes(''); }}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleReject(rejectingId)}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl text-sm font-black hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-95"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panchayat Modal */}
      {showPanchayatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-gray-900 mb-6">Onboard Panchayat Official</h3>
            <form onSubmit={handleCreatePanchayat} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Full Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Enter full name"
                    value={newPanchayat.name}
                    onChange={e => setNewPanchayat(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-bc-green-500 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Email Address</label>
                  <input
                    required
                    type="email"
                    placeholder="official@panchayat.gov.in"
                    value={newPanchayat.email}
                    onChange={e => setNewPanchayat(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-bc-green-500 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">District</label>
                  <input
                    required
                    type="text"
                    placeholder="District name"
                    value={newPanchayat.district}
                    onChange={e => setNewPanchayat(p => ({ ...p, district: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-bc-green-500 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1">State</label>
                  <input
                    required
                    type="text"
                    placeholder="State name"
                    value={newPanchayat.state}
                    onChange={e => setNewPanchayat(p => ({ ...p, state: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-bc-green-500 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Temporary Password</label>
                <input
                  required
                  type="password"
                  placeholder="Set login password"
                  value={newPanchayat.password}
                  onChange={e => setNewPanchayat(p => ({ ...p, password: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-bc-green-500 text-sm"
                />
              </div>
              <div className="flex gap-3 pt-6">
                <button 
                  type="button"
                  onClick={() => setShowPanchayatModal(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-sm font-black hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {creating ? 'Processing...' : 'Onboard Official'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NccrDashboard;
