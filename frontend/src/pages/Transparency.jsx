import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { FaCheckCircle, FaLeaf, FaCoins, FaExternalLinkAlt, FaSearch, FaShieldAlt, FaCubes } from 'react-icons/fa';

const EXPLORER_BASE = 'https://amoy.polygonscan.com/tx/';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const statusLabel = (status) => {
  if (status === 'TOKEN_MINTED') return 'Token Minted';
  if (status === 'BLOCKCHAIN_CONFIRMED') return 'On-Chain Verified';
  return 'Verified';
};

const Transparency = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/public/verified-plantations`);
        if (res.data.success) setData(res.data.data);
      } catch (err) {
        console.error('Failed to load transparency data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = data?.records?.filter(r => {
    const matchSearch = !search || r.plantationId.toLowerCase().includes(search.toLowerCase()) || r.species.toLowerCase().includes(search.toLowerCase());
    const matchLoc = !locationFilter || r.location.includes(locationFilter);
    return matchSearch && matchLoc;
  }) || [];

  const uniqueLocations = [...new Set(data?.records?.map(r => r.location).filter(l => l !== 'N/A') || [])];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1">
        {/* Hero Banner */}
        <div className="bg-gradient-to-br from-gov-blue-900 via-gov-blue-800 to-carbon-blue-700 text-white">
          <div className="container mx-auto px-4 py-16 md:py-20">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <FaShieldAlt className="text-2xl text-green-400" />
                <span className="text-sm font-bold uppercase tracking-widest text-green-300">Blockchain Verified</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Public CarbonSetu
              </h1>
              <p className="text-lg text-blue-100 leading-relaxed max-w-2xl">
                This page publicly displays verified blue carbon plantations and their blockchain records 
                to ensure transparency, accountability, and prevent greenwashing. Every record is 
                permanently stored on the Polygon blockchain.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-8 relative z-10">
          {/* Summary Cards */}
          {data && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center text-2xl shrink-0">
                  <FaCheckCircle />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Verified Plantations</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.totalVerified}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-600 flex items-center justify-center text-2xl shrink-0">
                  <FaLeaf />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total CO₂ Captured</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.totalCO2.toLocaleString()} <span className="text-base font-normal text-gray-500">tons</span></p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center text-2xl shrink-0">
                  <FaCoins />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tokens Minted</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.totalTokens.toLocaleString()} <span className="text-base font-normal text-gray-500">BCC</span></p>
                </div>
              </div>
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Plantation ID or Species..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-gov-blue-500"
              />
            </div>
            {uniqueLocations.length > 0 && (
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-gov-blue-500"
              >
                <option value="">All Locations</option>
                {uniqueLocations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gov-blue-600"></div>
            </div>
          )}

          {/* Records Table */}
          {!loading && data && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-12">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plantation ID</th>
                      <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Species</th>
                      <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                      <th className="px-4 py-3.5 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trees</th>
                      <th className="px-4 py-3.5 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">CO₂ (tons)</th>
                      <th className="px-4 py-3.5 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tokens</th>
                      <th className="px-4 py-3.5 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3.5 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Blockchain</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                          {search || locationFilter ? 'No plantations match your search criteria.' : 'No verified plantations available yet.'}
                        </td>
                      </tr>
                    ) : (
                      filtered.map((r) => (
                        <tr key={r.plantationId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-gray-900 dark:text-white font-medium">{r.plantationId}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{r.species}</td>
                          <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 font-mono">{r.location}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">{r.treeCount.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-emerald-700 dark:text-emerald-400">{r.co2}</td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-purple-700 dark:text-purple-400">{r.tokens}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                              <FaCheckCircle className="w-3 h-3" />
                              {statusLabel(r.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {(r.blockchainTxHash || r.tokenTxHash) ? (
                              <a
                                href={`${EXPLORER_BASE}${r.tokenTxHash || r.blockchainTxHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gov-blue-50 dark:bg-gov-blue-900/30 text-gov-blue-700 dark:text-gov-blue-400 text-xs font-bold rounded-lg hover:bg-gov-blue-100 dark:hover:bg-gov-blue-800/50 transition-colors"
                              >
                                <FaCubes className="w-3 h-3" />
                                View on Blockchain
                              </a>
                            ) : (
                              <span className="text-xs text-gray-400">Pending</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {filtered.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 text-xs text-gray-500 dark:text-gray-400">
                  Showing {filtered.length} of {data.records.length} verified plantations
                </div>
              )}
            </div>
          )}

          {/* Trust Banner */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 mb-12 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center text-3xl mx-auto mb-4">
              <FaShieldAlt />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Blockchain-Backed Transparency</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
              Every plantation record on this page has been independently verified by Local Panchayats 
              and the National Centre for Coastal Research (NCCR), then permanently anchored on the 
              Polygon blockchain. This ensures that carbon credit claims are tamper-proof and publicly auditable.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Transparency;
