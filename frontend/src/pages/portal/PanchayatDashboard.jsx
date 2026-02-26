import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import StatusBanner from '../../components/portal/StatusBanner';
import {
  getPanchayatPlantations,
  panchayatApprovePlantation,
  panchayatRejectPlantation,
  getPanchayatManualKyc,
  panchayatApproveManualKyc,
  panchayatRejectManualKyc,
} from '../../services/api';
import StatusTimeline from '../../components/plantation/StatusTimeline';
import { buildLifecycleTimestamps } from '../../utils/plantationLifecycle';
import { FaCheckCircle, FaTimes, FaLeaf, FaMapMarkerAlt, FaShieldAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

const PLANTATION_STATUS = 'PENDING_PANCHAYAT';

const PanchayatDashboard = () => {
  const { user } = useAuth();
  const [plantations, setPlantations] = useState([]);
  const [manualKyc, setManualKyc] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState(null);
  const [kycActionId, setKycActionId] = useState(null);
  const [kycNotes, setKycNotes] = useState('');
  const [kycRejectReason, setKycRejectReason] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([getPanchayatPlantations(PLANTATION_STATUS), getPanchayatManualKyc()])
      .then(([plantRes, kycRes]) => {
        if (plantRes.success && plantRes.plantations) setPlantations(plantRes.plantations);
        if (kycRes.success && kycRes.users) setManualKyc(kycRes.users);
      })
      .catch(() => toast.error('Failed to load plantations'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id, remarks) => {
    setActionId(id);
    try {
      const res = await panchayatApprovePlantation(id, remarks);
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
    if (rejectingId !== id || !rejectReason.trim()) {
      toast.error('Enter a rejection reason in this row first.');
      return;
    }
    setRejectingId(id);
    try {
      const res = await panchayatRejectPlantation(id, rejectReason);
      if (res.success) {
        toast.success(res.message);
        setRejectReason('');
        setRejectingId(null);
        load();
      } else toast.error(res.message || 'Reject failed');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Reject failed');
      setRejectingId(null);
    }
  };

  if (user?.role !== 'panchayat') {
    return <Navigate to="/portal" replace />;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <StatusBanner accountStatus={user?.accountStatus} />
      <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <FaLeaf className="w-7 h-7 text-bc-green-600" />
        Panchayat Verification
      </h1>
      <p className="text-gray-600 mb-6">Review and approve or reject plantation submissions in your jurisdiction.</p>

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
                    <td className="px-4 py-2 text-xs text-gray-700">
                      {u.manualReview?.reason || 'Manual review'}
                    </td>
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
                          value={kycActionId === u._id ? kycNotes : ''}
                          onChange={(e) => {
                            setKycNotes(e.target.value);
                            setKycActionId(u._id);
                          }}
                          className="min-w-[180px] px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            setKycActionId(u._id);
                            try {
                              const res = await panchayatApproveManualKyc(u._id, kycNotes);
                              if (res.success) {
                                toast.success(res.message);
                                setKycNotes('');
                                setKycActionId(null);
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
                          value={kycActionId === u._id ? kycRejectReason : ''}
                          onChange={(e) => {
                            setKycRejectReason(e.target.value);
                            setKycActionId(u._id);
                          }}
                          className="min-w-[180px] px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            if (!kycRejectReason.trim()) {
                              toast.error('Enter a rejection reason');
                              return;
                            }
                            setKycActionId(u._id);
                            try {
                              const res = await panchayatRejectManualKyc(u._id, kycRejectReason);
                              if (res.success) {
                                toast.success(res.message);
                                setKycRejectReason('');
                                setKycActionId(null);
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

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">Loading...</div>
      ) : plantations.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          No pending plantations for verification.
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
                <span className="px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-800">Pending Panchayat</span>
              </div>
              <div className="px-6 py-4 grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Applicant</p>
                  <p className="font-medium text-gray-900">{p.userId?.name}</p>
                  <p className="text-sm text-gray-600">{p.userId?.email}</p>
                  {p.userId?.referenceId && (
                    <p className="text-xs text-gray-500 mt-1">Ref: {p.userId.referenceId}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Land reference</p>
                  <p className="text-gray-900">{p.landId?.landReference || '—'}</p>
                  <p className="text-sm text-gray-600">{p.landId?.areaHectares} ha registered</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Species</p>
                  <p className="font-medium text-gray-900">{p.speciesName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tree count / Area</p>
                  <p className="text-gray-900">{p.treeCount} trees · {p.areaHectares} ha</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Plantation date</p>
                  <p className="text-gray-900">{p.plantationDate ? new Date(p.plantationDate).toLocaleDateString() : '—'}</p>
                </div>
                {p.gpsCoordinates && (p.gpsCoordinates.lat || p.gpsCoordinates.lng) && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <FaMapMarkerAlt className="w-4 h-4" />
                    {p.gpsCoordinates.lat}, {p.gpsCoordinates.lng}
                  </div>
                )}
              </div>
              {p.imagePaths && p.imagePaths.length > 0 && (
                <div className="px-6 py-2 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mb-2">Uploaded images</p>
                  <div className="flex flex-wrap gap-2">
                    {p.imagePaths.map((filename, i) => (
                      <a
                        key={i}
                        href={`${(process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '')}/uploads/plantation/${filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-bc-green-600 hover:underline"
                      >
                        Image {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
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
                  {actionId === p._id ? 'Processing...' : 'Approve'}
                </button>
                <input
                  type="text"
                  placeholder="Rejection reason (required to reject)"
                  value={rejectingId === p._id ? rejectReason : ''}
                  onChange={(e) => {
                    setRejectReason(e.target.value);
                    setRejectingId(p._id);
                  }}
                  className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  type="button"
                  onClick={() => handleReject(p._id)}
                  disabled={rejectingId !== p._id || !rejectReason.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg font-medium hover:bg-red-200 disabled:opacity-50"
                >
                  <FaTimes className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PanchayatDashboard;
