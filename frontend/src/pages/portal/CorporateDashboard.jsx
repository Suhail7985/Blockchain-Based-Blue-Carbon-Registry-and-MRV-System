import React, { useState, useEffect } from 'react';
import { getMarketplaceListings, getMarketplaceStats, getMyOrders } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { ACCOUNT_STATUS } from '../../constants/accountStatus';
import BuyCreditsDrawer from '../../components/portal/BuyCreditsDrawer';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaShoppingCart,
  FaLeaf,
  FaShieldAlt,
  FaSearch,
  FaRupeeSign,
  FaUser,
  FaMapMarkerAlt,
  FaStore,
  FaHistory,
  FaTree,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const CorporateDashboard = () => {
  const { user } = useAuth();
  const isActive = user?.accountStatus === ACCOUNT_STATUS.ACTIVE;

  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState(null);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('browse'); // browse | history

  // Buy Drawer State
  const [buyDrawerOpen, setBuyDrawerOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        getMarketplaceListings(),
        getMarketplaceStats(),
      ]);
      if (listRes.success) setListings(listRes.listings);
      if (statsRes.success) setStats(statsRes.stats);
    } catch {
      toast.error('Failed to fetch marketplace data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyOrders = async () => {
    try {
      const res = await getMyOrders();
      if (res.success) setMyOrders(res.orders);
    } catch { /* silently */ }
  };

  useEffect(() => {
    fetchData();
    if (isActive) fetchMyOrders();
  }, [isActive]);

  const handleBuyClick = (listing) => {
    setSelectedListing(listing);
    setBuyDrawerOpen(true);
  };

  const filteredListings = listings.filter(
    (l) =>
      l.speciesName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.seller?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.plantationId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fixedPrice = stats?.pricePerCreditINR || 1500;

  const tabs = [
    { id: 'browse', label: 'Browse & Buy', icon: FaShoppingCart },
    { id: 'history', label: 'My Purchases', icon: FaHistory },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Carbon Marketplace</h1>
          <p className="text-gray-500 mt-1">
            Buy verified blue carbon credits at <span className="font-bold text-emerald-600">₹{fixedPrice.toLocaleString('en-IN')}/BCC</span>. Credits are auto-listed when plantations are approved and tokens are minted.
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-emerald-500">
            <FaLeaf className="text-white" />
          </div>
          <p className="text-xs text-gray-500 font-medium">Credits Available</p>
          <h3 className="text-xl font-bold text-gray-900 mt-0.5">{stats?.totalCreditsAvailable || '0'} BCC</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-sky-500">
            <FaStore className="text-white" />
          </div>
          <p className="text-xs text-gray-500 font-medium">Minted Plantations</p>
          <h3 className="text-xl font-bold text-gray-900 mt-0.5">{stats?.mintedPlantations || '0'}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-purple-500">
            <FaRupeeSign className="text-white" />
          </div>
          <p className="text-xs text-gray-500 font-medium">Fixed Rate</p>
          <h3 className="text-xl font-bold text-gray-900 mt-0.5">₹{fixedPrice.toLocaleString('en-IN')}/BCC</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-bc-green-600">
            <FaShieldAlt className="text-white" />
          </div>
          <p className="text-xs text-gray-500 font-medium">Total Sold</p>
          <h3 className="text-xl font-bold text-gray-900 mt-0.5">{stats?.totalCreditsSold || '0'} BCC</h3>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* ─── BROWSE & BUY TAB ─── */}
          {activeTab === 'browse' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Available Credits</h2>
                <div className="relative w-72">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by location, species, seller..."
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-72 bg-gray-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaLeaf className="text-gray-300 text-2xl" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">No credits available right now</h3>
                  <p className="text-gray-500 mt-1">Credits appear here automatically when plantations are approved and tokens are minted.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredListings.map((listing) => (
                    <motion.div
                      key={listing._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group"
                    >
                      {/* Card Header */}
                      <div className="h-32 bg-gradient-to-br from-emerald-500 to-teal-600 relative overflow-hidden p-5 flex flex-col justify-end">
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded text-[10px] font-bold uppercase tracking-wider text-white">
                            Verified & Minted
                          </span>
                        </div>
                        <h3 className="font-bold text-white text-lg leading-tight">
                          {listing.speciesName || 'Blue Carbon Credit'}
                        </h3>
                        {listing.location && (
                          <p className="text-emerald-100 text-xs flex items-center gap-1 mt-1">
                            <FaMapMarkerAlt className="w-3 h-3" />
                            {listing.location}
                          </p>
                        )}
                      </div>

                      {/* Card Body */}
                      <div className="p-5 space-y-4">
                        <div className="flex items-center justify-between text-[11px] text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100">
                          <span className="flex items-center gap-1.5 font-medium text-emerald-700">
                            <FaShieldAlt className="w-3 h-3 text-emerald-600" />
                            {listing.seller?.name || 'NCCR Treasury'}
                          </span>
                          <span className="flex items-center gap-1 border-l border-gray-200 pl-2">
                            <FaLeaf className="w-2.5 h-2.5" />
                            Origin: {listing.planter?.name || 'Verified Citizen'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500 mt-2 px-1">
                          <span className="flex items-center gap-1 font-mono">
                            ID: {listing.plantationId}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaTree className="w-3 h-3" />
                            {listing.treeCount} trees · {listing.areaHectares} ha
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <p className="text-[10px] text-gray-500 font-bold uppercase">Available</p>
                            <p className="text-lg font-bold text-gray-900">{listing.remainingCredits?.toFixed(2)}</p>
                            <p className="text-[10px] text-gray-400">BCC</p>
                          </div>
                          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                            <p className="text-[10px] text-emerald-600 font-bold uppercase">Price</p>
                            <p className="text-lg font-bold text-emerald-700">₹{listing.pricePerCreditINR?.toLocaleString('en-IN')}</p>
                            <p className="text-[10px] text-emerald-500">per BCC</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleBuyClick(listing)}
                          disabled={!isActive}
                          className="w-full py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                          <FaShoppingCart className="w-3 h-3" />
                          Buy from Government
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── HISTORY TAB ─── */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">My Purchases</h2>
              {myOrders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <FaHistory className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No purchases yet.</p>
                  <p className="text-gray-400 text-sm mt-1">Browse credits and make your first purchase!</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Order ID</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Seller</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Plantation</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Credits</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Amount (₹)</th>
                          <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {myOrders.map((o) => (
                          <tr key={o._id}>
                            <td className="px-6 py-3 text-sm font-mono text-gray-900">{o.orderId || '—'}</td>
                            <td className="px-6 py-3 text-sm text-gray-700">{o.sellerName || '—'}</td>
                            <td className="px-6 py-3 text-sm text-gray-600 font-mono">{o.plantationId?.plantationId || '—'}</td>
                            <td className="px-6 py-3 text-sm text-right font-bold text-emerald-600">{o.creditsBought}</td>
                            <td className="px-6 py-3 text-sm text-right font-medium">₹{o.totalAmountINR?.toLocaleString('en-IN')}</td>
                            <td className="px-6 py-3 text-sm text-right text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Buy Credits Drawer */}
      <BuyCreditsDrawer
        isOpen={buyDrawerOpen}
        onClose={() => setBuyDrawerOpen(false)}
        listing={selectedListing}
        onPurchaseComplete={() => {
          fetchData();
          fetchMyOrders();
        }}
      />
    </div>
  );
};

export default CorporateDashboard;
