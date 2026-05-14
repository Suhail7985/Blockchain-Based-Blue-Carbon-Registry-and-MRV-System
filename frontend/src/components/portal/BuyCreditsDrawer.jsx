import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaShoppingCart, FaLeaf, FaMapMarkerAlt, FaUser, FaRupeeSign, FaTree, FaShieldAlt } from 'react-icons/fa';
import { buyCredits } from '../../services/api';
import toast from 'react-hot-toast';

const BuyCreditsDrawer = ({ isOpen, onClose, listing, onPurchaseComplete }) => {
  const [creditsToBuy, setCreditsToBuy] = useState('');
  const [loading, setLoading] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  const maxCredits = listing?.remainingCredits || 0;
  const pricePerCredit = listing?.pricePerCreditINR || 1500;
  const amount = parseFloat(creditsToBuy) || 0;
  const totalINR = amount * pricePerCredit;

  const handleBuy = async () => {
    if (amount <= 0 || amount > maxCredits) {
      toast.error(`Enter a valid amount between 0.01 and ${maxCredits}`);
      return;
    }

    setLoading(true);
    try {
      const res = await buyCredits({
        plantationId: listing._id,
        creditsToBuy: amount,
      });

      if (res.success) {
        setPurchaseComplete(true);
        setOrderResult(res.order);
        toast.success(res.message);
        if (onPurchaseComplete) onPurchaseComplete();
      } else {
        toast.error(res.message || 'Purchase failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process purchase');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCreditsToBuy('');
    setPurchaseComplete(false);
    setOrderResult(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Buy Carbon Credits</h2>
                <p className="text-xs text-gray-500 mt-0.5">Fixed Rate: ₹{pricePerCredit.toLocaleString('en-IN')} / BCC</p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <FaTimes className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {purchaseComplete ? (
                /* ── Success State ── */
                <div className="text-center py-12 space-y-6">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                    <FaShoppingCart className="w-10 h-10 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Purchase Complete!</h3>
                    <p className="text-gray-500 mt-2">
                      You bought <span className="font-bold text-emerald-600">{orderResult?.creditsBought} BCC</span> for{' '}
                      <span className="font-bold">₹{orderResult?.totalAmountINR?.toLocaleString('en-IN')}</span>
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Order ID</p>
                      <p className="font-mono text-sm font-bold text-gray-900">{orderResult?.orderId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Seller</p>
                      <p className="text-sm font-medium text-gray-900">{orderResult?.sellerName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Project</p>
                      <p className="text-sm font-medium text-gray-900">{orderResult?.speciesName} — {orderResult?.plantationId}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-full py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                /* ── Buy Form ── */
                <>
                  {/* Project Info Card */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                        <FaLeaf className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">
                          {listing?.speciesName || 'Blue Carbon Credit'}
                        </h3>
                        {listing?.location && (
                          <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                            <FaMapMarkerAlt className="w-3 h-3 text-emerald-500" />
                            {listing.location}
                          </p>
                        )}
                        <p className="text-xs text-emerald-700 font-medium flex items-center gap-1 mt-1">
                          <FaShieldAlt className="w-3 h-3" />
                          Seller: {listing?.seller?.name || 'NCCR Treasury'}
                        </p>
                        <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5 ml-0.5">
                          Origin: {listing?.planter?.name || 'Verified Citizen'}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <FaTree className="w-3 h-3" />
                          {listing?.treeCount} trees · {listing?.areaHectares} ha
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Market Info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Available</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">{maxCredits.toFixed(2)}</p>
                      <p className="text-[10px] text-gray-500">BCC Credits</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Fixed Rate</p>
                      <p className="text-xl font-bold text-emerald-700 mt-1">₹{pricePerCredit.toLocaleString('en-IN')}</p>
                      <p className="text-[10px] text-emerald-600">per BCC</p>
                    </div>
                  </div>

                  {/* Amount Selector */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700">How many credits do you want to buy?</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={creditsToBuy}
                        onChange={(e) => setCreditsToBuy(e.target.value)}
                        min="0.01"
                        max={maxCredits}
                        step="0.01"
                        placeholder="Enter amount"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setCreditsToBuy(String(maxCredits))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600 hover:text-emerald-700 px-2 py-1 bg-emerald-50 rounded-lg"
                      >
                        MAX
                      </button>
                    </div>
                    {/* Slider */}
                    <input
                      type="range"
                      min="0"
                      max={maxCredits}
                      step="0.01"
                      value={amount}
                      onChange={(e) => setCreditsToBuy(e.target.value)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                      <span>0</span>
                      <span>{maxCredits.toFixed(2)} BCC</span>
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  {amount > 0 && (
                    <div className="bg-gray-900 rounded-2xl p-5 text-white space-y-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cost Breakdown</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-300">{amount} BCC × ₹{pricePerCredit.toLocaleString('en-IN')}</span>
                        <span className="font-mono text-sm">₹{totalINR.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="border-t border-gray-700 pt-3 flex justify-between items-center">
                        <span className="text-sm font-bold">Total Payable</span>
                        <span className="text-2xl font-bold flex items-center gap-1">
                          <FaRupeeSign className="w-4 h-4" />
                          {totalINR.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer Action */}
            {!purchaseComplete && (
              <div className="p-6 border-t border-gray-100 space-y-3">
                <button
                  onClick={handleBuy}
                  disabled={loading || amount <= 0 || amount > maxCredits}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                >
                  <FaShoppingCart className="w-4 h-4" />
                  {loading ? 'Processing Payment...' : `Pay ₹${totalINR.toLocaleString('en-IN')}`}
                </button>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">
                  Secured by 256-bit SSL encryption
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BuyCreditsDrawer;
