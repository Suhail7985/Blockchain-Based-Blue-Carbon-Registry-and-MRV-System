/**
 * Marketplace Routes - Government Carbon Credit Storefront
 * MODEL B: Government Aggregator
 * - BCC tokens are held by the NCCR Government Treasury
 * - Credits are auto-listed from verified plantations at fixed ₹1500/BCC rate
 * - Corporate buyers purchase from the Government, not individual citizens
 */
import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { requireActive } from '../middleware/statusMiddleware.js';
import MarketplaceOrder from '../models/MarketplaceOrder.js';
import Plantation from '../models/Plantation.js';
import User from '../models/User.js';
import { auditLog } from '../utils/auditLog.js';

const router = express.Router();
const FIXED_PRICE_PER_BCC_INR = 1500;

function generateOrderId() {
  const prefix = 'BCR-ORD';
  const time = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${time}-${rand}`;
}

// ────────────────────────────────────────────────────
// GET /listings — Auto-generated from TOKEN_MINTED plantations
// ────────────────────────────────────────────────────
router.get('/listings', protect, async (req, res) => {
  try {
    const plantations = await Plantation.find({
      status: { $in: ['VERIFIED', 'BLOCKCHAIN_CONFIRMED', 'TOKEN_MINTED'] },
      'carbonCalculation.tokens': { $gt: 0 },
    })
      .populate('userId', 'name email referenceId state district')
      .populate('landId', 'landArea')
      .sort({ updatedAt: -1 })
      .lean();

    // Calculate how many credits have already been sold from each plantation
    const listings = await Promise.all(
      plantations.map(async (p) => {
        const soldAgg = await MarketplaceOrder.aggregate([
          { $match: { plantationId: p._id, paymentStatus: 'COMPLETED' } },
          { $group: { _id: null, totalSold: { $sum: '$creditsBought' } } },
        ]);
        const totalSold = soldAgg[0]?.totalSold || 0;
        const totalCredits = p.carbonCalculation?.tokens || 0;
        const remainingCredits = Math.max(0, totalCredits - totalSold);

        if (remainingCredits <= 0) return null; // fully sold out

        return {
          _id: p._id,
          plantationId: p.plantationId,
          speciesName: p.speciesName,
          treeCount: p.treeCount,
          areaHectares: p.areaHectares,
          location: `${p.district || ''}, ${p.state || ''}`.replace(/^, |, $/g, ''),
          plantationDate: p.plantationDate,
          // MODEL B: Seller is the Government Treasury
          seller: {
            _id: 'NCCR_TREASURY',
            name: 'NCCR Government Treasury',
          },
          // Original planter info (for ESG traceability / impact reporting)
          planter: {
            name: p.userId?.name || 'Verified Citizen',
            state: p.userId?.state,
            district: p.userId?.district,
          },
          totalCredits,
          remainingCredits,
          pricePerCreditINR: FIXED_PRICE_PER_BCC_INR,
          totalValueINR: remainingCredits * FIXED_PRICE_PER_BCC_INR,
          co2eq: p.carbonCalculation?.co2eq || 0,
          blockchainTxHash: p.tokenTxHash || p.blockchainTxHash,
          subsidyPaid: p.subsidyRecord?.amountPaid || 0,
          subsidyCurrency: p.subsidyRecord?.currency || 'MATIC',
        };
      })
    );

    res.json({
      success: true,
      listings: listings.filter(Boolean), // remove nulls (sold out)
      pricePerCreditINR: FIXED_PRICE_PER_BCC_INR,
    });
  } catch (err) {
    console.error('[marketplace] listings error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

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
