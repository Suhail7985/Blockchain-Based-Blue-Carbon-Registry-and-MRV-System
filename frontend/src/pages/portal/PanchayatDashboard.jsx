import React, { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getPanchayatPlantations, 
  panchayatApprovePlantation, 
  panchayatRejectPlantation,
  getPanchayatManualKyc,
  panchayatApproveManualKyc,
  panchayatRejectManualKyc,
  getPanchayatPendingLand,
  panchayatApproveLand,
  panchayatRejectLand
} from '../../services/api';
import toast from 'react-hot-toast';
import ActionModal from '../../components/portal/ActionModal';
import EvidenceGallery from '../../components/portal/EvidenceGallery';
import ReviewModal from '../../components/portal/ReviewModal';
import PanchayatDataModal from '../../components/portal/PanchayatDataModal';
import { FaMapMarkerAlt, FaImages, FaShieldAlt, FaChartBar, FaTree, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaLandmark, FaDatabase } from 'react-icons/fa';
import StatusBanner from '../../components/portal/StatusBanner';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons in React
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const PanchayatDashboard = () => {
  const { user } = useAuth();
  const [plantations, setPlantations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [manualKyc, setManualKyc] = useState([]);
  const [filterTab, setFilterTab] = useState('PENDING_PANCHAYAT');
  const [actionId, setActionId] = useState(null);
  
  // KYC specific state
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showKycModal, setShowKycModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryTitle, setGalleryTitle] = useState('');
  const [selectedPlantation, setSelectedPlantation] = useState(null);
  const [showPanchayatDataModal, setShowPanchayatDataModal] = useState(false);

  // Land specific state
  const [pendingLand, setPendingLand] = useState([]);
  const [showLandApproveModal, setShowLandApproveModal] = useState(false);
  const [showLandRejectModal, setShowLandRejectModal] = useState(false);
  const [selectedLandUserId, setSelectedLandUserId] = useState(null);
  const [dbStats, setDbStats] = useState({ total: 0, collection: 'unknown', db: 'unknown' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let pRes = { success: false, plantations: [] };
      let kycRes = { success: false, users: [] };
      let landRes = { success: false, users: [] };

      try {
        pRes = await getPanchayatPlantations();
      } catch (err) {
        console.error('getPanchayatPlantations failed:', err);
      }

      try {
        kycRes = await getPanchayatManualKyc();
      } catch (err) {
        console.error('getPanchayatManualKyc failed:', err);
      }

      try {
        landRes = await getPanchayatPendingLand();
      } catch (err) {
        console.error('getPanchayatPendingLand failed:', err);
      }
      if (pRes.success) {
        setPlantations(pRes.plantations || []);
        if (pRes.debug) setDbStats({ 
          total: pRes.debug.totalPlantationsInDb,
          collection: pRes.debug.collectionName,
          db: pRes.debug.dbName
        });
      }
      if (kycRes.success) setManualKyc(kycRes.users || []);
      if (landRes.success) setPendingLand(landRes.users || []);
    } catch (e) {
      console.error('Dashboard load error details:', {
        message: e.message,
        response: e.response?.data,
        status: e.response?.status,
        url: e.config?.url
      });
      toast.error(`Failed to load dashboard: ${e.response?.data?.message || e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const role = user?.role;
    if (role === 'panchayat') {
      load();
    }
  }, [user?.role, load]);

  const handleApprove = async (remarks) => {
    if (!actionId) return;
    try {
      const res = await panchayatApprovePlantation(actionId, remarks);
      if (res.success) {
        toast.success(res.message);
        load();
      } else toast.error(res.message || 'Approve failed');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Approve failed');
    } finally {
      setActionId(null);
      setShowApproveModal(false);
    }
  };

  const handleReject = async (remarks) => {
    if (!actionId) return;
    try {
      const res = await panchayatRejectPlantation(actionId, remarks);
      if (res.success) {
        toast.success(res.message);
        load();
      } else toast.error(res.message || 'Reject failed');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Reject failed');
    } finally {
      setActionId(null);
      setShowRejectModal(false);
    }
  };

  const handleKycApprove = async (userId, notes) => {
    try {
      const res = await panchayatApproveManualKyc(userId, notes);
      if (res.success) {
        toast.success('Identity verified');
        load();
      } else toast.error('Failed to approve identity');
    } catch (e) {
      toast.error('Identity approval error');
    }
  };

  const handleKycReject = async (userId, notes) => {
    try {
      const res = await panchayatRejectManualKyc(userId, notes);
      if (res.success) {
        toast.success('Identity rejected');
        load();
      } else toast.error('Failed to reject identity');
    } catch (e) {
      toast.error('Identity rejection error');
    }
  };

  const confirmLandApprove = async () => {
    if (!selectedLandUserId) return;
    try {
      const res = await panchayatApproveLand(selectedLandUserId);
      if (res.success) {
        toast.success('Land document verified. Account activated!');
        load();
      } else toast.error(res.message || 'Failed to verify land');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Land verification error');
    } finally {
      setSelectedLandUserId(null);
      setShowLandApproveModal(false);
    }
  };

  const confirmLandReject = async (reason) => {
    if (!selectedLandUserId) return;
    try {
      const res = await panchayatRejectLand(selectedLandUserId, reason);
      if (res.success) {
        toast.success('Land document rejected.');
        load();
      } else toast.error(res.message || 'Failed to reject land');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Land rejection error');
    } finally {
      setSelectedLandUserId(null);
      setShowLandRejectModal(false);
    }
  };

  if (user?.role !== 'panchayat') {
    return <Navigate to="/portal" replace />;
  }

  // Analytics Calculations
  const pendingCount = plantations.filter(p => p.status === 'PENDING_PANCHAYAT').length;
  const approvedCount = plantations.filter(p => p.status !== 'PENDING_PANCHAYAT' && p.status !== 'REJECTED').length;
  const rejectedCount = plantations.filter(p => p.status === 'REJECTED').length;
  const totalCarbonInfo = plantations
    .filter(p => p.status !== 'PENDING_PANCHAYAT' && p.status !== 'REJECTED')
    .reduce((acc, p) => acc + (Number(p.carbonCalculation?.co2eq) || 0), 0);

  // Map center calculation (average of all plantation coords, or India default)
  const validCoords = plantations.filter(p => 
    p.latitude && !isNaN(parseFloat(p.latitude)) && 
    p.longitude && !isNaN(parseFloat(p.longitude))
  );

  const mapCenter = validCoords.length > 0 
    ? [
        validCoords.reduce((acc, p) => acc + parseFloat(p.latitude), 0) / validCoords.length,
        validCoords.reduce((acc, p) => acc + parseFloat(p.longitude), 0) / validCoords.length
      ]
    : [20.5937, 78.9629];

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <StatusBanner accountStatus={user?.accountStatus} />
      
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CarbonSetu: Local Panchayat Dashboard</h1>
          <div className="flex items-center gap-2 mt-1 text-bc-green-700">
             <FaLandmark className="w-4 h-4" />
             <span className="text-sm font-semibold uppercase tracking-wider">
               Jurisdiction: {user?.panchayatName ? `${user.panchayatName}, ` : ''}{user?.district}, {user?.state}
             </span>
          </div>
        </div>
        <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
          {/* Placeholder for potential future filter/action buttons */}
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-lg mr-4">
            <FaChartBar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pending Verifications</p>
            <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg mr-4">
            <FaCheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Approved Plantations</p>
            <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg mr-4">
            <FaTimesCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Rejected</p>
            <p className="text-2xl font-bold text-gray-900">{rejectedCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg mr-4">
            <FaTree className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Carbon Impact (CO₂)</p>
            <p className="text-2xl font-bold text-gray-900">{totalCarbonInfo.toLocaleString()} tons</p>
          </div>
        </div>
      </div>

      {/* GIS Map View */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FaMapMarkerAlt className="text-gray-500" />
            Jurisdiction Map View
          </h2>
        </div>
        <div className="h-[400px] w-full relative z-0">
          <MapContainer center={mapCenter} zoom={plantations.length > 0 ? 11 : 4} scrollWheelZoom={true} style={{ height: '100%', width: '100%', zIndex: 0 }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {validCoords.map((p) => (
              <Marker key={p._id} position={[parseFloat(p.latitude), parseFloat(p.longitude)]} icon={customIcon}>
                <Popup className="custom-popup">
                  <div className="p-1">
                    <p className="font-bold text-sm mb-1">{p.plantationId}</p>
                    <p className="text-xs mb-1"><strong>Owner:</strong> {p.userId?.name || 'Unknown'}</p>
                    <p className="text-xs mb-1"><strong>Trees:</strong> {p.treeCount}</p>
                    <p className="text-xs mb-1"><strong>Area:</strong> {p.areaHectares} ha</p>
                    <p className="text-xs mt-2 font-semibold">
                      Status: <span className={p.status === 'PENDING_PANCHAYAT' ? 'text-amber-600' : p.status === 'REJECTED' ? 'text-red-600' : 'text-emerald-600'}>{p.status.replace(/_/g, ' ')}</span>
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </section>

      {/* manual KYC Queue */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 py-6 mb-8">
        <div className="px-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Manual Identity Verification Queue</h2>
        </div>
        {loading ? (
          <div className="px-6 text-gray-500 text-sm">Loading...</div>
        ) : manualKyc.length === 0 ? (
          <div className="px-6 text-gray-500 text-sm">No users currently pending manual identity verification.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Applicant</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Document</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {manualKyc.map((u) => (
                  <tr key={u._id}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{u.name}</div>
                      <div className="text-xs text-gray-500">{u.district}, {u.state}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-bc-green-700 bg-bc-green-50 px-2 py-1 rounded">
                        {u.aadhaarDocumentPath ? 'Aadhaar Provided' : 'Missing'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <button 
                         onClick={() => { setSelectedUser(u); setShowKycModal(true); }}
                         className="px-4 py-2 bg-bc-green-600 hover:bg-bc-green-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                       >
                         <FaShieldAlt /> Review Identity
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Pending Land Approvals Queue */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 py-6 mb-8">
        <div className="px-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Pending Land Document Approvals</h2>
        </div>
        {loading ? (
          <div className="px-6 text-gray-500 text-sm">Loading...</div>
        ) : pendingLand.length === 0 ? (
          <div className="px-6 text-gray-500 text-sm">No users currently pending land verification.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Applicant</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Land Size</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Document</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingLand.map((u) => (
                  <tr key={u._id}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{u.name}</div>
                      <div className="text-xs text-gray-500">{u.district}, {u.state}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{u.landAreaHectares || 1} Hectares</div>
                    </td>
                    <td className="px-6 py-4">
                      <a 
                        href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/uploads/land/${u.landDocumentPath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-bc-green-700 bg-bc-green-50 hover:bg-bc-green-100 px-3 py-1.5 rounded inline-block transition-colors"
                      >
                        View Document
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { setSelectedLandUserId(u._id); setShowLandApproveModal(true); }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded shadow-sm text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <FaCheckCircle /> Approve
                        </button>
                        <button 
                          onClick={() => { setSelectedLandUserId(u._id); setShowLandRejectModal(true); }}
                          className="px-3 py-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded shadow-sm text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <FaTimesCircle /> Reject
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

      {/* Plantations Table */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200 text-sm font-medium px-6 pt-4">
          <button
            type="button"
            onClick={() => setFilterTab('PENDING_PANCHAYAT')}
            className={`pb-3 mr-6 transition-colors ${
              filterTab === 'PENDING_PANCHAYAT' ? 'border-b-2 border-bc-green-600 text-bc-green-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Pending Verifications
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('APPROVED')}
            className={`pb-3 mr-6 transition-colors ${
              filterTab === 'APPROVED' ? 'border-b-2 border-bc-green-600 text-bc-green-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Approved
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('REJECTED')}
            className={`pb-3 transition-colors ${
              filterTab === 'REJECTED' ? 'border-b-2 border-bc-green-600 text-bc-green-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Rejected
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left font-medium text-gray-500">Plantation ID</th>
                  <th className="px-6 py-4 text-left font-medium text-gray-500">Owner Name</th>
                  <th className="px-6 py-4 text-left font-medium text-gray-500">Location</th>
                  <th className="px-6 py-4 text-left font-medium text-gray-500">Details</th>
                  <th className="px-6 py-4 text-left font-medium text-gray-500">Evidence</th>
                  <th className="px-6 py-4 text-left font-medium text-gray-500">Status</th>
                  {filterTab === 'PENDING_PANCHAYAT' && (
                    <th className="px-6 py-4 text-center font-medium text-gray-500">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {plantations.filter(p => {
                  if (filterTab === 'APPROVED') return p.status !== 'PENDING_PANCHAYAT' && p.status !== 'REJECTED';
                  return p.status === filterTab;
                }).map(p => (
                  <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-mono text-xs font-semibold text-gray-900">{p.plantationId}</div>
                      {p.risk?.riskScore === 'HIGH' && (
                        <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                          <FaShieldAlt /> High Risk
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{p.userId?.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{p.userId?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{p.panchayatName || p.district || 'Location unrecorded'}</div>
                      <div className="text-xs text-gray-500">{p.state}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{p.treeCount} trees</div>
                      <div className="text-xs text-gray-500">{p.areaHectares} ha • {p.speciesName}</div>
                    </td>
                    <td className="px-6 py-4">
                      {p.imagePaths?.length > 0 ? (
                        <button
                          onClick={() => {
                            setGalleryImages(p.imagePaths.map(img => `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/uploads/plantations/${img}`));
                            setGalleryTitle(`Evidence: ${p.plantationId}`);
                          }}
                          className="flex items-center gap-2 text-bc-green-700 hover:text-bc-green-800 font-medium bg-bc-green-50 px-3 py-1.5 rounded-lg transition-all"
                        >
                          <FaImages className="w-4 h-4" />
                          Inspect ({p.imagePaths.length})
                        </button>
                      ) : (
                        <span className="text-gray-400 italic">No images</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        p.status === 'PENDING_PANCHAYAT' ? 'bg-amber-100 text-amber-800' :
                        p.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {p.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    {filterTab === 'PENDING_PANCHAYAT' && (
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => { setSelectedPlantation(p); setShowPanchayatDataModal(true); }}
                            className="px-3 py-1.5 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-lg shadow-sm transition-all w-full flex items-center justify-center gap-1"
                          >
                            <FaDatabase className="w-3 h-3" /> Update Survival
                          </button>

                          <button
                            onClick={() => { setActionId(p._id); setShowApproveModal(true); }}
                            className={`px-3 py-1.5 text-white text-xs font-bold rounded-lg shadow-sm transition-all w-full flex items-center justify-center gap-1 ${
                              p.risk?.riskScore === 'LOW' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'
                            }`}
                          >
                            <FaCheckCircle className="w-3 h-3" />
                            {p.risk?.riskScore === 'LOW' ? 'Final Verify' : 'Approve & Escalate'}
                          </button>
                          
                          <button
                            onClick={() => { setActionId(p._id); setShowRejectModal(true); }}
                            className="px-3 py-1.5 bg-white border border-red-200 hover:border-red-300 hover:bg-red-50 text-red-700 text-xs font-bold rounded-lg shadow-sm transition-all w-full flex items-center justify-center gap-1"
                          >
                            <FaTimesCircle className="w-3 h-3" /> Reject
                          </button>

                          {p.rejectionHistory?.length > 0 && (
                            <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase tracking-tighter">
                              <FaExclamationTriangle className="w-2.5 h-2.5" /> Resubmitted
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {plantations.filter(p => {
                  if (filterTab === 'APPROVED') return p.status !== 'PENDING_PANCHAYAT' && p.status !== 'REJECTED';
                  return p.status === filterTab;
                }).length === 0 && (
                  <tr>
                    <td colSpan={filterTab === 'PENDING_PANCHAYAT' ? 7 : 6} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <span>No plantations found in this category.</span>
                        {/* Hidden debug info for the developer to see if needed */}
                        <div className="mt-4 p-4 bg-gray-50 rounded text-xs text-left max-w-md overflow-auto border border-gray-100 font-mono">
                          <p className="font-bold mb-1 border-b pb-1">System Debug Info:</p>
                          <p>Total in Registry (Backend): {dbStats.total}</p>
                          <p>Database: {dbStats.db}</p>
                          <p>Collection Target: {dbStats.collection}</p>
                          <p>Current Tab: {filterTab}</p>
                          <p>Jurisdiction: {user?.district}, {user?.state}</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modals & Overlays */}
      <EvidenceGallery 
        isOpen={galleryImages.length > 0} 
        onClose={() => setGalleryImages([])} 
        images={galleryImages} 
        title={galleryTitle} 
      />

      <ReviewModal 
        isOpen={showKycModal} 
        onClose={() => { setShowKycModal(false); setSelectedUser(null); }} 
        user={selectedUser} 
        onApprove={handleKycApprove} 
        onReject={handleKycReject} 
      />

      <ActionModal
        isOpen={showApproveModal}
        onClose={() => { setShowApproveModal(false); setActionId(null); }}
        onConfirm={handleApprove}
        mode="approve"
        title={plantations.find(p => p._id === actionId)?.risk?.riskScore === 'LOW' ? 'Autonomous Final Approval' : 'Approve & Escalate to NCCR'}
        message={
          (() => {
            const p = plantations.find(item => item._id === actionId);
            if (!p) return "";
            if (p.risk?.riskScore === 'LOW') {
              return "This is a low-risk case. Your approval will finalize the record and trigger token minting immediately.";
            }
            const flagNames = p.risk?.flags?.map(f => f.replace(/_/g, ' ')).join(', ');
            return `This case has been flagged for: ${flagNames || 'Security review'}. Your approval will move it to NCCR for final national verification instead of immediate minting.`;
          })()
        }
        placeholder="Add verification remarks (optional)..."
      />

      <ActionModal
        isOpen={showRejectModal}
        onClose={() => { setShowRejectModal(false); setActionId(null); }}
        onConfirm={handleReject}
        mode="reject"
        title="Reject Plantation"
        message="Please provide a clear reason for rejection. The citizen will be able to see these remarks and resubmit corrections."
        placeholder="Reason for rejection (mandatory)..."
      />

      <ActionModal
        isOpen={showLandApproveModal}
        onClose={() => { setShowLandApproveModal(false); setSelectedLandUserId(null); }}
        onConfirm={confirmLandApprove}
        mode="approve"
        title="Approve Land Document"
        message="Are you sure you want to approve this land document? This will activate the user account and officially recognize their land ownership. They will be able to register plantations immediately."
      />

      <ActionModal
        isOpen={showLandRejectModal}
        onClose={() => { setShowLandRejectModal(false); setSelectedLandUserId(null); }}
        onConfirm={confirmLandReject}
        mode="reject"
        title="Reject Land Document"
        message="Please provide a clear reason for rejection. The citizen will need to upload a corrected document."
        placeholder="Reason for rejection (mandatory)..."
      />

      <PanchayatDataModal
        isOpen={showPanchayatDataModal}
        onClose={() => { setShowPanchayatDataModal(false); setSelectedPlantation(null); }}
        plantation={selectedPlantation}
        onSuccess={() => load()}
      />
    </div>
  );
};

export default PanchayatDashboard;
