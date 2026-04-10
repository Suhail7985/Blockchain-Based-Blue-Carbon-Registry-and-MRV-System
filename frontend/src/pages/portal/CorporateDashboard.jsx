import React, { useState, useEffect } from 'react';
import { getMarketplaceListings, getMarketplaceStats } from '../../services/api';
import { motion } from 'framer-motion';
import { 
  FaShoppingCart, 
  FaGlobeAmericas, 
  FaLeaf, 
  FaChartLine, 
  FaShieldAlt, 
  FaSearch, 
  FaCheckCircle 
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const CorporateDashboard = () => {
    const [listings, setListings] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [listRes, statsRes] = await Promise.all([
                    getMarketplaceListings(),
                    getMarketplaceStats()
                ]);
                if (listRes.success) setListings(listRes.listings);
                if (statsRes.success) setStats(statsRes.stats);
            } catch (err) {
                toast.error('Failed to fetch marketplace data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredListings = listings.filter(l => 
        l.project?.species?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.project?.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const StatCard = ({ icon: Icon, label, value, color }) => (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                <Icon className="text-white text-xl" />
            </div>
            <p className="text-sm text-gray-500 font-medium">{label}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Corporate CSR Marketplace</h1>
                    <p className="text-gray-500 mt-1">Directly fund verified blue carbon restoration projects and offset your carbon footprint.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-5 py-2.5 bg-bc-green-600 text-white rounded-xl font-medium hover:bg-bc-green-700 transition-all flex items-center gap-2">
                        <FaChartLine />
                        My Impact Report
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    icon={FaLeaf} 
                    label="Available Credits" 
                    value={`${stats?.totalActiveCredits || '0.00'} Tons`} 
                    color="bg-emerald-500" 
                />
                <StatCard 
                    icon={FaGlobeAmericas} 
                    label="Active Projects" 
                    value={stats?.activeListingsCount || '0'} 
                    color="bg-sky-500" 
                />
                <StatCard 
                    icon={FaChartLine} 
                    label="Avg. Price / Ton" 
                    value={`${stats?.averagePricePerTon || '0.00'} ETH`} 
                    color="bg-purple-500" 
                />
                <StatCard 
                    icon={FaShieldAlt} 
                    label="Verfication Index" 
                    value="100%" 
                    color="bg-bc-green-600" 
                />
            </div>

            {/* Project Browser */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Browse Verified Projects</h2>
                    <div className="relative w-72">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search by location or species..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-bc-green-500 outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredListings.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaLeaf className="text-gray-300 text-2xl" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No active listings found</h3>
                        <p className="text-gray-500 mt-1">Check back later or explore other categories.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredListings.map((listing) => (
                            <motion.div 
                                key={listing.listingId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group"
                            >
                                <div className="h-48 bg-gray-200 relative overflow-hidden">
                                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                     <div className="absolute bottom-4 left-4 text-white">
                                         <span className="px-2 py-1 bg-bc-green-500 rounded text-[10px] font-bold uppercase tracking-wider mb-2 inline-block">Verified Site</span>
                                         <h3 className="font-bold text-lg leading-tight">{listing.project?.species || 'Premium Blue Carbon'}</h3>
                                         <p className="text-xs opacity-90 flex items-center gap-1 mt-1">
                                             <FaGlobeAmericas className="text-emerald-400" />
                                             {listing.project?.location || 'India'}
                                         </p>
                                     </div>
                                </div>
                                <div className="p-5 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <p className="text-[10px] text-gray-500 font-bold uppercase">Inventory</p>
                                            <p className="text-lg font-bold text-gray-900">{listing.amount} T</p>
                                        </div>
                                        <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                                            <p className="text-[10px] text-green-600 font-bold uppercase">Price/Ton</p>
                                            <p className="text-lg font-bold text-green-700">{listing.pricePerToken} ETH</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-500">Project Integrity Score</span>
                                            <span className="text-emerald-600 font-bold">98/100</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '98%' }} />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-50 flex items-center justify-between gap-3">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-500">
                                                    V
                                                </div>
                                            ))}
                                            <div className="text-[10px] text-gray-400 font-medium ml-3 flex items-center">
                                                By NCCR & Panchayats
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => toast.success('Smart Contract execution triggered!')}
                                            className="px-4 py-2 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all flex items-center gap-2"
                                        >
                                            <FaShoppingCart className="w-3 h-3" />
                                            Buy Credits
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Transparency Banner */}
            <div className="bg-gradient-to-r from-gray-900 to-bc-green-900 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-widest text-xs mb-3">
                             <FaCheckCircle />
                             Blockchain Verifiable Lineage
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Total Transparency for Corporate ESG</h2>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Every credit listed here is backed by a cryptographically signed audit trail. Trace your purchase from the CSR funding to the exact mangrove sapling planted by coastal communities using our Integrity Explorer.
                        </p>
                        <div className="flex items-center gap-6 mt-8">
                             <div>
                                 <p className="text-2xl font-bold">100%</p>
                                 <p className="text-[10px] text-gray-400 uppercase tracking-wider">On-Chain Data</p>
                             </div>
                             <div className="w-px h-10 bg-white/10" />
                             <div>
                                 <p className="text-2xl font-bold">0</p>
                                 <p className="text-[10px] text-gray-400 uppercase tracking-wider">Double Counting Risk</p>
                             </div>
                             <div className="w-px h-10 bg-white/10" />
                             <div>
                                 <p className="text-2xl font-bold">Polygon</p>
                                 <p className="text-[10px] text-gray-400 uppercase tracking-wider">Amoy Infrastructure</p>
                             </div>
                        </div>
                    </div>
                    <div className="hidden lg:block w-64 h-64 bg-white/5 backdrop-blur-3xl rounded-full relative">
                         <div className="absolute inset-0 flex items-center justify-center">
                             <FaShieldAlt className="text-6xl text-emerald-500/50" />
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CorporateDashboard;
