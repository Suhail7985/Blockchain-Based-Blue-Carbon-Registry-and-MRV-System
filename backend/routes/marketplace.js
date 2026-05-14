/**
 * Marketplace Routes - Government Carbon Credit Storefront
 * HYBRID MODEL: Government + User Marketplace
 * - NCCR Government auto-lists verified credits at fixed ₹1500/BCC
 * - Citizens can ALSO list their personal BCC tokens for sale at their chosen rate
 */
import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { requireActive } from '../middleware/statusMiddleware.js';
import MarketplaceOrder from '../models/MarketplaceOrder.js';
import Plantation from '../models/Plantation.js';
import User from '../models/User.js';
import { auditLog } from '../utils/auditLog.js';
import { getMarketplaceListings } from '../utils/blockchainService.js';

const router = express.Router();
const FIXED_PRICE_PER_BCC_INR = 1500;

function generateOrderId() {
  const prefix = 'BCR-ORD';
  const time = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${time}-${rand}`;
}

// ────────────────────────────────────────────────────
// GET /listings — Hybrid logic (Government auto + Blockchain peer-to-peer)
// ────────────────────────────────────────────────────
router.get('/listings', protect, async (req, res) => {
  try {
    // 1. Fetch Government "Auto-Listings" from Database
    const plantations = await Plantation.find({
      status: { $in: ['VERIFIED', 'BLOCKCHAIN_CONFIRMED', 'TOKEN_MINTED'] },
      'carbonCalculation.tokens': { $gt: 0 },
    })
      .populate('userId', 'name email referenceId state district walletAddress')
      .sort({ updatedAt: -1 })
      .lean();

    const govtListings = await Promise.all(
      plantations.map(async (p) => {
        const soldAgg = await MarketplaceOrder.aggregate([
          { $match: { plantationId: p._id, paymentStatus: 'COMPLETED' } },
          { $group: { _id: null, totalSold: { $sum: '$creditsBought' } } },
        ]);
        const totalSold = soldAgg[0]?.totalSold || 0;
        const totalCredits = p.carbonCalculation?.tokens || 0;
        const remainingCredits = Math.max(0, totalCredits - totalSold);

        if (remainingCredits <= 0) return null;

        return {
          _id: p._id,
          type: 'GOVERNMENT_AGGREGATED',
          plantationId: p.plantationId,
          speciesName: p.speciesName,
          location: `${p.district || ''}, ${p.state || ''}`.replace(/^, |, $/g, ''),
          seller: { _id: 'NCCR_TREASURY', name: 'NCCR Government Treasury' },
          planter: { name: p.userId?.name || 'Verified Citizen' },
          remainingCredits,
          pricePerCreditINR: FIXED_PRICE_PER_BCC_INR,
          co2eq: p.carbonCalculation?.co2eq || 0,
          blockchainTxHash: p.tokenTxHash || p.blockchainTxHash,
        };
      })
    );

    // 2. Fetch User "Peer-to-Peer" Listings from Blockchain (if configured)
    let p2pListings = [];
    try {
      const bcListings = await getMarketplaceListings();
      p2pListings = await Promise.all(bcListings.map(async (bl) => {
        // Find the user associated with this seller wallet
        const sellerUser = await User.findOne({ walletAddress: bl.seller.toLowerCase() }).select('name').lean();
        return {
          _id: `BC-${bl.listingId}`,
          listingId: bl.listingId,
          type: 'PEER_TO_PEER',
          speciesName: 'User Owned BCC',
          location: 'Decentralized Wallet',
          seller: {
            _id: bl.seller,
            name: sellerUser?.name || `Wallet ${bl.seller.substring(0, 6)}...`
          },
          remainingCredits: parseFloat(bl.amount),
          pricePerCreditINR: bl.pricePerTokenINR || (parseFloat(bl.pricePerToken) * 250000), // Fallback conversion if ETH based
          blockchainTxHash: bl.txHash
        };
      }));
    } catch (bcErr) {
      console.warn('Blockchain listings fetch failed, continuing with DB only');
    }

    res.json({
      success: true,
      listings: [...govtListings.filter(Boolean), ...p2pListings],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ────────────────────────────────────────────────────
// POST /list — Allow Users/NCCR to list their tokens
// ────────────────────────────────────────────────────
router.post(
  '/list',
  protect,
  requireActive,
  [
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be at least 0.01'),
    body('pricePerCreditINR').isFloat({ min: 1 }).withMessage('Price must be at least ₹1'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

      const { amount, pricePerCreditINR } = req.body;

      // In a real blockchain app, the user would sign this on the frontend via Metamask.
      // For this demo, we'll simulate the intention and provide the user with the steps.

      auditLog('MARKETPLACE_LIST_INTENT', req.user.id, 'user_listing_created', {
        amount,
        priceINR: pricePerCreditINR
      });

      res.json({
        success: true,
        message: 'Listing intent recorded. Please sign the transaction in your wallet to finalize.',
        steps: [
          'Approve Marketplace contract to spend your BCC tokens',
          'Call listCredits(tokenAddress, amount, price) on the Smart Contract'
        ]
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ────────────────────────────────────────────────────
// GET /stats — Marketplace overview
// ────────────────────────────────────────────────────
router.get('/stats', protect, async (req, res) => {
  try {
    // Total minted credits
    const mintedAgg = await Plantation.aggregate([
      { $match: { status: { $in: ['VERIFIED', 'BLOCKCHAIN_CONFIRMED', 'TOKEN_MINTED'] }, 'carbonCalculation.tokens': { $gt: 0 } } },
      { $group: { _id: null, totalTokens: { $sum: '$carbonCalculation.tokens' }, count: { $sum: 1 } } },
    ]);
    const totalMinted = mintedAgg[0]?.totalTokens || 0;
    const mintedCount = mintedAgg[0]?.count || 0;

    // Total sold
    const soldAgg = await MarketplaceOrder.aggregate([
      { $match: { paymentStatus: 'COMPLETED' } },
      { $group: { _id: null, totalSold: { $sum: '$creditsBought' }, totalRevenue: { $sum: '$totalAmountINR' }, orderCount: { $sum: 1 } } },
    ]);
    const totalSold = soldAgg[0]?.totalSold || 0;
    const totalRevenue = soldAgg[0]?.totalRevenue || 0;
    const totalOrders = soldAgg[0]?.orderCount || 0;

    res.json({
      success: true,
      stats: {
        totalCreditsAvailable: Math.max(0, totalMinted - totalSold).toFixed(2),
        totalCreditsMinted: totalMinted.toFixed(2),
        totalCreditsSold: totalSold.toFixed(2),
        mintedPlantations: mintedCount,
        pricePerCreditINR: FIXED_PRICE_PER_BCC_INR,
        totalTransactions: totalOrders,
        totalRevenueINR: totalRevenue.toFixed(2),
        currency: 'INR',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ────────────────────────────────────────────────────
// POST /buy — Buy credits from a plantation listing
// ────────────────────────────────────────────────────
router.post(
  '/buy',
  protect,
  requireActive,
  [
    body('plantationId').isMongoId().withMessage('Valid plantation required'),
    body('creditsToBuy').isFloat({ min: 0.01 }).withMessage('Must buy at least 0.01 credits'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
      }

      const { plantationId, creditsToBuy } = req.body;
      const amount = parseFloat(creditsToBuy);

      // Get plantation
      const plantation = await Plantation.findOne({
        _id: plantationId,
        status: { $in: ['VERIFIED', 'BLOCKCHAIN_CONFIRMED', 'TOKEN_MINTED'] }
      }).populate('userId', 'name');
      if (!plantation) {
        return res.status(404).json({ success: false, message: 'Plantation not found or credits not yet available.' });
      }

      // MODEL B: Since the government sells the credits, anyone (even the original citizen) can buy them back if they want.

      // Check remaining
      const soldAgg = await MarketplaceOrder.aggregate([
        { $match: { plantationId: plantation._id, paymentStatus: 'COMPLETED' } },
        { $group: { _id: null, totalSold: { $sum: '$creditsBought' } } },
      ]);
      const totalSold = soldAgg[0]?.totalSold || 0;
      const totalCredits = plantation.carbonCalculation?.tokens || 0;
      const remaining = totalCredits - totalSold;

      if (amount > remaining) {
        return res.status(400).json({
          success: false,
          message: `Only ${remaining.toFixed(2)} credits remaining in this listing.`,
        });
      }

      const totalAmountINR = amount * FIXED_PRICE_PER_BCC_INR;

      // Create order (demo: auto-complete payment)
      const order = await MarketplaceOrder.create({
        orderId: generateOrderId(),
        buyerId: req.user.id,
        plantationId: plantation._id,
        sellerId: plantation.userId?._id, // Keep for origin traceability
        sellerType: 'GOVERNMENT', // MODEL B: Sold by government
        creditsBought: amount,
        pricePerCreditINR: FIXED_PRICE_PER_BCC_INR,
        totalAmountINR,
        paymentStatus: 'COMPLETED', // Demo mode. In production: integrate Razorpay here.
        paymentMethod: 'DEMO',
        paidAt: new Date(),
      });

      auditLog('MARKETPLACE_BUY', req.user.id, 'credits_purchased', {
        orderId: order.orderId,
        plantationId: plantation.plantationId,
        credits: amount,
        totalINR: totalAmountINR,
      });

      res.status(201).json({
        success: true,
        message: `Successfully purchased ${amount} BCC for ₹${totalAmountINR.toLocaleString('en-IN')}.`,
        order: {
          orderId: order.orderId,
          creditsBought: order.creditsBought,
          totalAmountINR: order.totalAmountINR,
          pricePerCreditINR: FIXED_PRICE_PER_BCC_INR,
          paidAt: order.paidAt,
          sellerName: 'NCCR Government Treasury',
          plantationId: plantation.plantationId,
          speciesName: plantation.speciesName,
        },
      });
    } catch (err) {
      console.error('[marketplace] buy error:', err.message);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ────────────────────────────────────────────────────
// GET /my-orders — Buyer's purchase history
// ────────────────────────────────────────────────────
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await MarketplaceOrder.find({ buyerId: req.user.id })
      .populate('plantationId', 'plantationId speciesName state district')
      .populate('sellerId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    // Format orders for frontend
    const formattedOrders = orders.map(order => ({
      ...order,
      sellerName: order.sellerType === 'GOVERNMENT' ? 'NCCR Government Treasury' : (order.sellerId?.name || 'Unknown'),
    }));

    res.json({ success: true, orders: formattedOrders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
