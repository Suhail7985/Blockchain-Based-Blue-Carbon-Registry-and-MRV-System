import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSearch, 
  FaShieldAlt, 
  FaLink, 
  FaMapMarkerAlt, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaSync, 
  FaExternalLinkAlt,
  FaFileAlt,
  FaArrowRight
} from 'react-icons/fa';
import api from '../services/api';
import { useTranslation } from '../contexts/LanguageContext';

const IntegrityExplorer = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Reusing the public route if it exists, or simulated for demo
      const res = await api.get(`/public/verify/${query}`);
      if (res.data.success) {
        setResult(res.data.data);
      } else {
        setError('No plantation record found for this ID or hash.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification record not found. Ensure the ID is correct.');
    } finally {
      setLoading(false);
    }
  };

  const LineageItem = ({ title, status, date, icon: Icon, description, hash }) => (
    <div className="flex gap-4 relative group">
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${
          status === 'completed' ? 'bg-bc-green-600 text-white' : 'bg-gray-100 text-gray-400'
        }`}>
          <Icon className="text-sm" />
        </div>
        <div className="w-0.5 flex-1 bg-gray-100 mt-2 min-h-[40px] group-last:hidden" />
      </div>
      <div className="flex-1 pb-10">
        <div className="flex items-center gap-2 mb-1">
          <h4 className={`font-bold ${status === 'completed' ? 'text-gray-900' : 'text-gray-400'}`}>{title}</h4>
          {status === 'completed' && <FaCheckCircle className="text-bc-green-600 text-xs" />}
        </div>
        <p className="text-xs text-gray-400 mb-2">{date}</p>
        <p className="text-sm text-gray-500 leading-relaxed max-w-lg">{description}</p>
        {hash && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-mono text-gray-500 hover:bg-gray-100 transition-colors">
            <FaLink className="text-gray-400" />
            {hash.substring(0, 16)}...
            <FaExternalLinkAlt className="ml-2 text-gray-300" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfdfd] font-sans selection:bg-bc-green-100 selection:text-bc-green-700">
      {/* Search Header */}
      <section className="bg-white border-b border-gray-100 pt-20 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-bc-green-50 text-bc-green-700 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
          >
            <FaShieldAlt /> {t('explorer')}
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
            {t('verifyTitle')}
          </h1>
          <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
            {t('verifySubtitle')}
          </p>

          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group">
            <div className={`absolute -inset-1 bg-gradient-to-r from-bc-green-400 to-sky-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200`}></div>
            <div className="relative">
              <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: BCR-PLT-1234 or 0x71C...a89"
                className="w-full pl-14 pr-32 py-5 bg-white border border-gray-200 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-bc-green-500/10 focus:border-bc-green-500 transition-all text-gray-700 font-medium"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <FaSync className="animate-spin" /> : t('exploreBtn')}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Results Section */}
      <main className="max-w-6xl mx-auto px-6 py-16 min-h-[400px]">
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-12 h-12 border-4 border-bc-green-100 border-t-bc-green-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Interrogating Polygon Blockchain...</p>
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center max-w-lg mx-auto"
            >
              <FaTimesCircle className="text-red-500 text-4xl mx-auto mb-4" />
              <h3 className="text-lg font-bold text-red-900">No Record Found</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </motion.div>
          )}

          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid lg:grid-cols-3 gap-8"
            >
              {/* Profile Card */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm sticky top-8">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                    <FaCheckCircle className="text-2xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{result.plantationId}</h2>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mb-6">
                    <FaMapMarkerAlt className="text-emerald-500" />
                    {result.location?.district}, {result.location?.state}
                  </p>

                  <div className="space-y-4 pt-6 border-t border-gray-50">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400 font-bold uppercase">{t('scientificId')}</span>
                      <span className="text-xs font-mono text-gray-700">{result.speciesName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400 font-bold uppercase">Area</span>
                      <span className="text-xs font-bold text-gray-700">{result.areaHectares} ha</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400 font-bold uppercase">Carbon sequestered</span>
                      <span className="text-xs font-bold text-bc-green-700">{result.carbonCalculated?.tokens || 0} Tons</span>
                    </div>
                  </div>

                  <div className="mt-8">
                    <button className="w-full py-3 bg-gray-50 text-gray-700 font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
                      <FaFileAlt /> {t('downloadCert')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Lineage Timeline */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-3xl border border-gray-100 p-10 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-bc-green-600 rounded-full" />
                    {t('auditLineage')}
                  </h3>

                  <div className="pl-2">
                    <LineageItem 
                      title="Initial Registration"
                      status="completed"
                      date={new Date(result.createdAt).toLocaleDateString()}
                      icon={FaFileAlt}
                      description={`NGO successfully registered site details with GPS coordinates and initial baseline photos. Verification requested from ${result.location?.panchayatName} Panchayat.`}
                    />
                    <LineageItem 
                      title="Panchayat Audit"
                      status={result.status !== 'PENDING_PANCHAYAT' ? 'completed' : 'pending'}
                      date={result.panchayatVerification?.date || 'Verified'}
                      icon={FaMapMarkerAlt}
                      description="Local authorities performed on-site verification of tree counts and jurisdictional ownership. Community MGNREGA data integrated."
                    />
                    <LineageItem 
                      title="NCCR Approval & Satellite MRV"
                      status={result.status === 'APPROVED' || result.status === 'TOKEN_MINTED' ? 'completed' : 'pending'}
                      date="Verified"
                      icon={FaShieldAlt}
                      description="MoES / NCCR performed scientific biometry analysis. Biomass data cross-referenced with satellite imagery for precision verification."
                    />
                    <LineageItem 
                      title="Blockchain Implementation"
                      status={result.status === 'TOKEN_MINTED' ? 'completed' : 'pending'}
                      date="Immutable"
                      icon={FaLink}
                      description="Digital asset minted as ERC-20 token. Plantation records hashed and stored immutably on Polygon Amoy for total transparency."
                      hash={result.blockchainHash}
                    />
                  </div>
                </div>

                {/* Evidence Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h4 className="font-bold text-gray-900 mb-4 text-sm">Site Evidence (Audit Photos)</h4>
                        <div className="grid grid-cols-3 gap-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden animate-pulse" />
                            ))}
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h4 className="font-bold text-gray-900 mb-4 text-sm">Blockchain Node Status</h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">Consensus Status</span>
                                <span className="text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1">
                                    <FaCheckCircle /> Synchronized
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">Network</span>
                                <span className="text-gray-700 font-bold">Polygon Amoy</span>
                            </div>
                            <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-50">
                                <a href="#" className="text-bc-green-700 font-bold flex items-center gap-1 hover:underline">
                                    View on PolygonScan <FaArrowRight className="text-[8px]" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
              </div>
            </motion.div>
          )}

          {!result && !loading && !error && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid md:grid-cols-3 gap-8 py-10"
            >
              {[
                { icon: FaShieldAlt, title: 'On-Chain Verifiability', desc: 'Every credit is linked to an immutable cryptographic hash on the Polygon network.' },
                { icon: FaFileAlt, title: 'Multi-Role Registry', desc: 'Audit trails include signatures from NGOs, local Panchayats, and NCCR scientists.' },
                { icon: FaSync, title: 'MRV Precision', desc: 'We combine field data with drone mapping and satellite biometry for 100% accuracy.' }
              ].map((item, i) => (
                <div key={i} className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
                  <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <item.icon />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-3">{item.title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-12 border-t border-gray-100 text-center">
         <p className="text-xs text-gray-400">© 2026 Blue Carbon Registry | Powered by NCCR & Ministry of Earth Sciences</p>
      </footer>
    </div>
  );
};

export default IntegrityExplorer;
