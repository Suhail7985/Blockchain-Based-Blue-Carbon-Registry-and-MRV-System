import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import StatusBanner from '../../components/portal/StatusBanner';
import { FaLeaf, FaUsers, FaMapMarkedAlt, FaCoins } from 'react-icons/fa';
import { getNgoManualKyc, ngoApproveManualKyc, ngoRejectManualKyc } from '../../services/api';
import toast from 'react-hot-toast';

const NgoDashboard = () => {
  const { user } = useAuth();
  const [manualKyc, setManualKyc] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [notes, setNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const load = () => {
    setLoading(true);
    getNgoManualKyc()
      .then((r) => {
        if (r.success && r.users) setManualKyc(r.users);
      })
      .catch(() => toast.error('Failed to load manual verification queue'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  if (user?.role !== 'ngo') {
    return <Navigate to="/portal" replace />;
  }

  // Placeholder metrics - can be wired to real NGO-linked data later
  const landsSupported = 0;
  const plantationsSupported = 0;
  const communities = 0;
  const totalCO2 = 0;

  return (
    <div className="max-w-5xl mx-auto">
      <StatusBanner accountStatus={user?.accountStatus} />

      <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <FaLeaf className="w-7 h-7 text-bc-green-600" />
        NGO Dashboard
      </h1>
      <p className="text-gray-600 mb-6">
        Overview of your supported blue carbon initiatives. Future releases will link plantations directly to your NGO.
      </p>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Impact Summary</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <FaMapMarkedAlt className="w-4 h-4" /> Lands Supported
            </p>
            <p className="text-xl font-bold text-gray-900 mt-1">{landsSupported}</p>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <FaLeaf className="w-4 h-4" /> Plantations Supported
            </p>
            <p className="text-xl font-bold text-gray-900 mt-1">{plantationsSupported}</p>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <FaUsers className="w-4 h-4" /> Communities
            </p>
            <p className="text-xl font-bold text-gray-900 mt-1">{communities}</p>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <FaCoins className="w-4 h-4" /> Total CO₂ Impact (tCO₂e)
            </p>
            <p className="text-xl font-bold text-bc-green-700 mt-1">{totalCO2}</p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Manual Identity Verification Queue</h2>
        {loading ? (
          <div className="border border-gray-200 rounded-lg p-6 text-center text-gray-500">Loading...</div>
        ) : manualKyc.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500 text-sm">
            No users currently pending manual identity verification.
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Reference</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Applicant</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Reason</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Document</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {manualKyc.map((u) => (
                  <tr key={u._id}>
                    <td className="px-4 py-2 font-mono text-xs text-gray-700">{u.referenceId || '—'}</td>
                    <td className="px-4 py-2 text-gray-900">
                      <div className="font-medium">{u.name}</div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                      <div className="text-xs text-gray-500">{u.district}, {u.state}</div>
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-700">{u.manualReview?.reason || 'Manual review'}</td>
                    <td className="px-4 py-2 text-sm">
                      {u.aadhaarDocumentPath ? (
                        <a
                          href={`${(process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '')}/uploads/aadhaar/${u.aadhaarDocumentPath}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-bc-green-700 hover:underline"
                        >
                          View Aadhaar
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Notes (optional)"
                          value={actionId === u._id ? notes : ''}
                          onChange={(e) => {
                            setNotes(e.target.value);
                            setActionId(u._id);
                          }}
                          className="min-w-[180px] px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            setActionId(u._id);
                            try {
                              const res = await ngoApproveManualKyc(u._id, notes);
                              if (res.success) {
                                toast.success(res.message);
                                setNotes('');
                                setActionId(null);
                                load();
                              } else toast.error(res.message || 'Approve failed');
                            } catch (e) {
                              toast.error(e.response?.data?.message || 'Approve failed');
                            }
                          }}
                          className="px-3 py-2 bg-bc-green-600 text-white rounded-lg text-sm font-medium hover:bg-bc-green-700"
                        >
                          Approve
                        </button>
                        <input
                          type="text"
                          placeholder="Reject reason"
                          value={actionId === u._id ? rejectReason : ''}
                          onChange={(e) => {
                            setRejectReason(e.target.value);
                            setActionId(u._id);
                          }}
                          className="min-w-[180px] px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            if (!rejectReason.trim()) {
                              toast.error('Enter a rejection reason');
                              return;
                            }
                            setActionId(u._id);
                            try {
                              const res = await ngoRejectManualKyc(u._id, rejectReason);
                              if (res.success) {
                                toast.success(res.message);
                                setRejectReason('');
                                setActionId(null);
                                load();
                              } else toast.error(res.message || 'Reject failed');
                            } catch (e) {
                              toast.error(e.response?.data?.message || 'Reject failed');
                            }
                          }}
                          className="px-3 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium hover:bg-red-200"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Supported Plantations</h2>
        <p className="text-sm text-gray-600 mb-2">
          In the next phase, plantations will be tagged to NGOs so you can see and report your impact portfolio here.
        </p>
        <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500 text-sm">
          No NGO-linked plantations yet. Coordinate with NCCR to onboard your existing projects.
        </div>
      </section>
    </div>
  );
};

export default NgoDashboard;

