import React, { useState, useEffect } from 'react';
import { FaTimes, FaShieldAlt, FaSave, FaSatellite, FaMicroscope, FaClipboardCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';

const MrvDataModal = ({ isOpen, onClose, plantation, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    monitoringSeason: '',
    monitoringMethod: 'Drone_Audit',
    technologyUsed: '',
    aboveGround: '',
    belowGround: '',
    soilOrganicCarbon0_30: '',
    soilOrganicCarbon30_100: '',
    deadWood: '',
    litter: '',
    satelliteSource: '',
    droneSpecs: '',
    gpsAccuracy: '',
    weatherConditions: '',
    accessibilityRating: 'Medium',
    communityParticipation: '',
    dataQualityScore: '',
    verifierName: '',
    verifierType: 'Third_Party',
    verifierCredential: '',
    reportHash: '',
    ipfsHash: '',
    complianceStandard: 'IPCC_GPG',
    labCertification: '',
    institutionalApprovalStatus: 'Approved',
  });

  useEffect(() => {
    if (plantation?.mrvData) {
      const md = plantation.mrvData;
      setForm({
        monitoringSeason: md.monitoringSeason || '',
        monitoringMethod: md.monitoringMethod || 'Drone_Audit',
        technologyUsed: md.technologyUsed || md.auditTrail?.technologyUsed || '',
        aboveGround: md.biomass?.aboveGround || '',
        belowGround: md.biomass?.belowGround || '',
        soilOrganicCarbon0_30: md.biomass?.soilOrganicCarbon0_30 || '',
        soilOrganicCarbon30_100: md.biomass?.soilOrganicCarbon30_100 || '',
        deadWood: md.biomass?.deadWood || '',
        litter: md.biomass?.litter || '',
        satelliteSource: md.auditTrail?.satelliteSource || '',
        droneSpecs: md.auditTrail?.droneSpecs || '',
        gpsAccuracy: md.auditTrail?.gpsAccuracy || '',
        weatherConditions: md.auditTrail?.weatherConditions || '',
        accessibilityRating: md.auditTrail?.accessibilityRating || 'Medium',
        communityParticipation: md.auditTrail?.communityParticipation || '',
        dataQualityScore: md.auditTrail?.dataQualityScore || '',
        verifierName: md.verification?.verifierName || '',
        verifierType: md.verification?.verifierType || 'Third_Party',
        verifierCredential: md.verification?.verifierCredential || '',
        reportHash: md.verification?.reportHash || '',
        ipfsHash: md.verification?.ipfsHash || '',
        complianceStandard: md.verification?.complianceStandard || 'IPCC_GPG',
        labCertification: md.verification?.labCertification || '',
        institutionalApprovalStatus: md.verification?.institutionalApprovalStatus || 'Approved',
      });
    }
  }, [plantation, isOpen]);

  if (!isOpen || !plantation) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/plantations/${plantation._id}/mrv`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.success) {
        toast.success('MRV Audit data updated successfully');
        onSuccess(res.data.plantation);
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update MRV data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 bg-blue-50 text-blue-800 flex items-center justify-between border-b border-blue-100">
          <h3 className="font-bold flex items-center gap-2">
            <FaMicroscope /> MRV Audit & Verification: {plantation.plantationId}
          </h3>
          <button onClick={onClose} className="hover:opacity-70"><FaTimes /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[85vh] overflow-y-auto">
          {/* Biomass Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 border-b border-gray-100 pb-1">
                <FaLeaf className="text-green-500" /> Carbon Pools & Biomass (Tonnes)
            </h4>
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">Above Ground</label>
                    <input type="number" name="aboveGround" value={form.aboveGround} onChange={handleChange} step="0.001" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" />
                </div>
                <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">Below Ground</label>
                    <input type="number" name="belowGround" value={form.belowGround} onChange={handleChange} step="0.001" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" />
                </div>
                <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">Dead Wood</label>
                    <input type="number" name="deadWood" value={form.deadWood} onChange={handleChange} step="0.001" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" />
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">SOC (0-30cm)</label>
                    <input type="number" name="soilOrganicCarbon0_30" value={form.soilOrganicCarbon0_30} onChange={handleChange} step="0.001" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" />
                </div>
                <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">SOC (30-100cm)</label>
                    <input type="number" name="soilOrganicCarbon30_100" value={form.soilOrganicCarbon30_100} onChange={handleChange} step="0.001" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" />
                </div>
                <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">Litter</label>
                    <input type="number" name="litter" value={form.litter} onChange={handleChange} step="0.001" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" />
                </div>
            </div>
          </div>

          {/* Technology & Audit Trail */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 border-b border-gray-100 pb-1">
                <FaSatellite className="text-blue-500" /> Technology & Audit Trail
            </h4>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">Monitoring Method</label>
                    <select name="monitoringMethod" value={form.monitoringMethod} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg">
                        <option value="Drone_Audit">Drone Audit</option>
                        <option value="Satellite_Imagery">Satellite Imagery</option>
                        <option value="On_Field_Manual">On-Field Manual</option>
                        <option value="Hybrid">Hybrid</option>
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">Satellite Source</label>
                    <input type="text" name="satelliteSource" value={form.satelliteSource} onChange={handleChange} placeholder="e.g. Sentinel-2, Landsat-8" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">Drone Model/Specs</label>
                    <input type="text" name="droneSpecs" value={form.droneSpecs} onChange={handleChange} placeholder="e.g. DJI Matrice 300 RTK" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" />
                </div>
                <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">GPS Accuracy (m)</label>
                    <input type="number" name="gpsAccuracy" value={form.gpsAccuracy} onChange={handleChange} step="0.1" placeholder="e.g. 0.5" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" />
                </div>
            </div>
          </div>

          {/* Verification Meta */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 border-b border-gray-100 pb-1">
                <FaClipboardCheck className="text-purple-500" /> Verification & Compliance
            </h4>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">Verifier Name</label>
                    <input type="text" name="verifierName" value={form.verifierName} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" />
                </div>
                <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">Standard</label>
                    <select name="complianceStandard" value={form.complianceStandard} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg">
                        <option value="IPCC_GPG">IPCC GPG</option>
                        <option value="Gold_Standard">Gold Standard</option>
                        <option value="Verra_VCS">Verra VCS</option>
                        <option value="National_Registry">National Registry</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase">IPFS / Blockchain Report Hash</label>
                <input type="text" name="ipfsHash" value={form.ipfsHash} onChange={handleChange} placeholder="Qm..." className="w-full px-3 py-2 text-sm font-mono border border-gray-300 rounded-lg" />
            </div>
          </div>
          
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? 'Saving...' : <><FaSave /> Save MRV Audit Data</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MrvDataModal;
