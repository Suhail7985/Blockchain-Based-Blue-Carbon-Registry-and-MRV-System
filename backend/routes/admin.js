import express from 'express';
import User from '../models/User.js';
import Land from '../models/Land.js';
import Plantation from '../models/Plantation.js';
import AuditLog from '../models/AuditLog.js';
import { protect, authorize } from '../middleware/auth.js';
import { ACCOUNT_STATUS } from '../constants/accountStatus.js';
import { LAND_STATUS, PLANTATION_STATUS } from '../constants/plantationStatus.js';
import { auditLog } from '../utils/auditLog.js';
import { calculateCarbonWithConfig } from '../utils/carbonCalculation.js';
import CarbonSettings from '../models/CarbonSettings.js';
import { analyzePlantationsRisk } from '../utils/fraud.js';
import {
  generatePlantationHash,
  storePlantationHash,
  mintCarbonToken,
} from '../utils/blockchainService.js';

const router = express.Router();

// Dev-only: approve user by ID (no auth in development)
if (process.env.NODE_ENV === 'development') {
  router.patch('/dev/approve/:userId', async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      user.accountStatus = ACCOUNT_STATUS.ACTIVE;
      user.isVerified = true;
      user.verifiedAt = new Date();
      user.nccrApprovedAt = new Date();
      user.statusTimeline = [
        { step: 'Email Verified', completed: true, completedAt: user.createdAt },
        { step: 'Identity Verified', completed: true, completedAt: new Date() },
        { step: 'Land Verified', completed: true, completedAt: new Date() },
        { step: 'Account Activated', completed: true, completedAt: new Date() },
      ];
      await user.save();
      const Land = (await import('../models/Land.js')).default;
      const { LAND_STATUS } = await import('../constants/plantationStatus.js');
      const existingLand = await Land.findOne({ userId: user._id, status: LAND_STATUS.VERIFIED });
      if (!existingLand && user.landDocumentPath) {
        await Land.create({
          userId: user._id,
          areaHectares: user.landAreaHectares ?? 1,
          status: LAND_STATUS.VERIFIED,
          documentPath: user.landDocumentPath,
          landReference: user.address || user.district || 'Primary land',
          verifiedAt: new Date(),
        });
      }
      res.json({ success: true, message: 'User approved (dev)', user: user.getPublicProfile() });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  });
}

router.use(protect);
router.use(authorize('admin', 'verifier'));

// ----- Admin stats -----

router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalPanchayats, pendingNccr, minted] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'panchayat' }),
      Plantation.countDocuments({ status: PLANTATION_STATUS.PENDING_NCCR }),
      Plantation.aggregate([
        { $match: { status: PLANTATION_STATUS.TOKEN_MINTED, carbonCalculation: { $exists: true } } },
        {
          $group: {
            _id: null,
            totalTokens: { $sum: '$carbonCalculation.tokens' },
          },
        },
      ]),
    ]);

    const tokensMinted = minted.length ? minted[0].totalTokens : 0;

    res.json({
      success: true,
      totalUsers,
      totalPanchayats,
      pendingPlantations: pendingNccr,
      tokensMinted,
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ----- Analytics & settings -----

router.get('/analytics', async (req, res) => {
  try {
    const [verified, totals, txCount, stateBreakdown, monthlyTrend] = await Promise.all([
      Plantation.countDocuments({ status: { $in: [PLANTATION_STATUS.VERIFIED, PLANTATION_STATUS.BLOCKCHAIN_CONFIRMED, PLANTATION_STATUS.TOKEN_MINTED] } }),
      Plantation.aggregate([
        {
          $match: {
            carbonCalculation: { $exists: true },
            status: { $in: [PLANTATION_STATUS.VERIFIED, PLANTATION_STATUS.BLOCKCHAIN_CONFIRMED, PLANTATION_STATUS.TOKEN_MINTED] },
          },
        },
        {
          $group: {
            _id: null,
            totalCO2: { $sum: '$carbonCalculation.co2eq' },
            totalTokens: { $sum: '$carbonCalculation.tokens' },
          },
        },
      ]),
      Plantation.countDocuments({
        $or: [{ blockchainTxHash: { $ne: null } }, { tokenTxHash: { $ne: null } }],
      }),
      Plantation.aggregate([
        {
          $match: {
            carbonCalculation: { $exists: true },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $group: {
            _id: '$user.state',
            totalCO2: { $sum: '$carbonCalculation.co2eq' },
            totalTokens: { $sum: '$carbonCalculation.tokens' },
          },
        },
      ]),
      Plantation.aggregate([
        {
          $match: {
            carbonCalculation: { $exists: true },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$plantationDate' },
              month: { $month: '$plantationDate' },
            },
            totalCO2: { $sum: '$carbonCalculation.co2eq' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    const totalsDoc = totals[0] || { totalCO2: 0, totalTokens: 0 };

    res.json({
      success: true,
      totalVerifiedPlantations: verified,
      totalCO2: totalsDoc.totalCO2,
      totalTokens: totalsDoc.totalTokens,
      totalBlockchainTx: txCount,
      stateBreakdown,
      monthlyTrend,
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get('/settings/carbon', async (req, res) => {
  try {
    let settings = await CarbonSettings.findOne().lean();
    if (!settings) {
      settings = (await CarbonSettings.create({})).toObject();
    }
    res.json({ success: true, settings });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.put('/settings/carbon', async (req, res) => {
  try {
    const payload = {
      avgBiomassPerTreeKg: req.body.avgBiomassPerTreeKg,
      carbonFraction: req.body.carbonFraction,
      co2eqFactor: req.body.co2eqFactor,
      tokenRule: req.body.tokenRule,
      autoMintEnabled: req.body.autoMintEnabled,
    };
    const settings = await CarbonSettings.findOneAndUpdate({}, payload, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }).lean();
    res.json({ success: true, settings });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Approve user (set ACTIVE)
router.patch('/users/:id/approve', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.accountStatus = ACCOUNT_STATUS.ACTIVE;
    user.isVerified = true;
    user.verifiedBy = req.user.id;
    user.verifiedAt = new Date();
    user.nccrApprovedAt = new Date();
    user.statusTimeline = [
      { step: 'Email Verified', completed: true, completedAt: user.createdAt },
      { step: 'Identity Verified', completed: true, completedAt: new Date() },
      { step: 'Land Verified', completed: true, completedAt: new Date() },
      { step: 'Account Activated', completed: true, completedAt: new Date() },
    ];
    await user.save();
    // Create verified Land record for plantation selection
    const existingLand = await Land.findOne({ userId: user._id, status: LAND_STATUS.VERIFIED });
    if (!existingLand && user.landDocumentPath) {
      await Land.create({
        userId: user._id,
        areaHectares: user.landAreaHectares ?? 1,
        status: LAND_STATUS.VERIFIED,
        documentPath: user.landDocumentPath,
        landReference: user.address || user.district || 'Primary land',
        verifiedAt: new Date(),
      });
    }
    res.json({
      success: true,
      message: 'User approved',
      user: user.getPublicProfile(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Promote existing user to Panchayat
router.patch('/users/:id/make-panchayat', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.role = 'panchayat';
    if (req.body.state) user.state = req.body.state;
    if (req.body.district) user.district = req.body.district;
    if (!user.panchayatId) {
      const districtCode = (user.district || 'PANCH').toUpperCase().replace(/\s+/g, '').slice(0, 5);
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      user.panchayatId = `PANCH-${districtCode}-${random}`;
    }
    await user.save();

    auditLog('MAKE_PANCHAYAT', req.user.id, 'make_panchayat', {
      targetUserId: user._id,
      panchayatId: user.panchayatId,
      district: user.district,
      state: user.state,
    });

    res.json({
      success: true,
      message: 'User promoted to Panchayat',
      user: user.getPublicProfile(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new Panchayat user
router.post('/panchayats', async (req, res) => {
  try {
    const { name, email, district, state } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const districtCode = (district || 'PANCH').toUpperCase().replace(/\s+/g, '').slice(0, 5);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const panchayatId = `PANCH-${districtCode}-${random}`;

    const tempPassword = Math.random().toString(36).slice(-10) + 'Aa1!';

    const user = new User({
      name,
      email,
      password: tempPassword,
      role: 'panchayat',
      state,
      district,
      isEmailVerified: true,
      isVerified: true,
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      panchayatId,
      statusTimeline: [
        { step: 'Email Verified', completed: true, completedAt: new Date() },
        { step: 'Identity Verified', completed: true, completedAt: new Date() },
        { step: 'Land Verified', completed: true, completedAt: new Date() },
        { step: 'Account Activated', completed: true, completedAt: new Date() },
      ],
    });
    await user.save();

    auditLog('CREATE_PANCHAYAT', req.user.id, 'create_panchayat', {
      panchayatId,
      userId: user._id,
      district,
      state,
    });

    res.status(201).json({
      success: true,
      message: 'Panchayat user created',
      user: user.getPublicProfile(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// List all Panchayats
router.get('/panchayats', async (req, res) => {
  try {
    const panchayats = await User.find({ role: 'panchayat' })
      .select('name email district state panchayatId accountStatus createdAt')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, panchayats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reject user
router.patch('/users/:id/reject', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.accountStatus = ACCOUNT_STATUS.REJECTED;
    user.rejectionReason = req.body.reason || 'Profile rejected';
    await user.save();
    res.json({
      success: true,
      message: 'User rejected',
      user: user.getPublicProfile(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ----- NCCR Plantation verification -----

// GET /api/admin/plantations - list by status (default PENDING_NCCR)
router.get('/plantations', async (req, res) => {
  try {
    const status = req.query.status || PLANTATION_STATUS.PENDING_NCCR;
    const plantations = await Plantation.find({ status })
      .populate('userId', 'name email district state referenceId')
      .populate('landId', 'areaHectares landReference documentPath')
      .sort({ submissionTimestamp: -1 })
      .lean();
    const risk = analyzePlantationsRisk(plantations);
    const riskById = new Map(risk.map((r) => [r.plantationId, r]));
    const withRisk = plantations.map((p) => ({
      ...p,
      risk: riskById.get(p._id.toString()) || { riskScore: 'LOW', flags: [] },
    }));
    res.json({ success: true, plantations: withRisk });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ----- Audit logs -----

router.get('/audit-logs', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const logs = await AuditLog.find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('performedBy', 'name email role')
      .lean();

    res.json({ success: true, logs });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// PATCH /api/admin/plantations/:id/approve - final approve → carbon calc → blockchain → token mint
router.patch('/plantations/:id/approve', async (req, res) => {
  try {
    const plantation = await Plantation.findById(req.params.id).populate('userId', 'walletAddress');
    if (!plantation) return res.status(404).json({ success: false, message: 'Plantation not found' });
    if (plantation.status !== PLANTATION_STATUS.PENDING_NCCR) {
      return res.status(400).json({ success: false, message: 'Plantation is not pending NCCR approval.' });
    }

    const notes = req.body.notes || '';

    // 1) Carbon calculation (idempotent if called again, using latest settings)
    const settings = await CarbonSettings.findOne().lean();
    const carbonCalc = calculateCarbonWithConfig(plantation.treeCount, settings || {});
    plantation.carbonCalculation = carbonCalc;
    plantation.status = PLANTATION_STATUS.VERIFIED;
    plantation.nccrVerification = {
      adminId: req.user.id,
      decision: 'approved',
      timestamp: new Date(),
      notes,
    };
    plantation.auditLog = plantation.auditLog || [];
    plantation.auditLog.push({ action: 'nccr_approved', by: req.user.id, timestamp: new Date(), notes });
    await plantation.save();
    await AuditLog.create({
      plantationId: plantation._id,
      action: 'nccr_approved',
      performedBy: req.user.id,
      role: 'admin',
      previousStatus: PLANTATION_STATUS.PENDING_NCCR,
      newStatus: plantation.status,
      details: { notes },
    });

    // 2) Blockchain hash and submit (skip if already done)
    if (!plantation.blockchainTxHash) {
      plantation.status = PLANTATION_STATUS.BLOCKCHAIN_PENDING;
      plantation.auditLog.push({ action: 'blockchain_pending', timestamp: new Date() });
      await plantation.save();

      const hashPayload = {
        plantationId: plantation.plantationId,
        landId: plantation.landId?._id || plantation.landId,
        treeCount: plantation.treeCount,
        areaHectares: plantation.areaHectares,
        speciesName: plantation.speciesName,
        timestamp: plantation.submissionTimestamp,
      };
      plantation.blockchainHash = generatePlantationHash(hashPayload);

      const bcResult = await storePlantationHash(plantation.blockchainHash, hashPayload);
      if (!bcResult?.success) {
        plantation.auditLog.push({
          action: 'blockchain_failed',
          timestamp: new Date(),
        });
        await plantation.save();
        return res.status(502).json({
          success: false,
          message: 'Blockchain submission failed. Please retry later.',
        });
      }

      plantation.blockchainTxHash = bcResult.transactionHash;
      plantation.blockNumber = bcResult.blockNumber;
      plantation.blockchainGasUsed = bcResult.gasUsed;
      plantation.blockchainTimestamp = bcResult.timestamp;
      plantation.status = PLANTATION_STATUS.BLOCKCHAIN_CONFIRMED;
      plantation.auditLog.push({
        action: 'blockchain_confirmed',
        txHash: bcResult.transactionHash,
        blockNumber: bcResult.blockNumber,
        gasUsed: bcResult.gasUsed,
        timestamp: new Date(),
      });
      await plantation.save();
      await AuditLog.create({
        plantationId: plantation._id,
        action: 'blockchain_confirmed',
        performedBy: req.user.id,
        role: 'admin',
        previousStatus: PLANTATION_STATUS.BLOCKCHAIN_PENDING,
        newStatus: plantation.status,
        details: {
          txHash: bcResult.transactionHash,
          blockNumber: bcResult.blockNumber,
          gasUsed: bcResult.gasUsed,
        },
      });
    }

    // 3) Token mint (stub, guarded to avoid duplicates)
    if (!plantation.tokenTxHash) {
      const walletAddress = plantation.userId?.walletAddress || '0x0000000000000000000000000000000000000000';
      const mintResult = await mintCarbonToken(walletAddress, carbonCalc.tokens, plantation.plantationId);
      if (!mintResult?.success) {
        plantation.auditLog.push({
          action: 'token_mint_failed',
          timestamp: new Date(),
        });
        await plantation.save();
        return res.status(502).json({
          success: false,
          message: 'Token minting failed. Please retry later.',
        });
      }
      plantation.tokenTxHash = mintResult.transactionHash;
      plantation.status = PLANTATION_STATUS.TOKEN_MINTED;
      plantation.auditLog.push({
        action: 'token_minted',
        txHash: mintResult.transactionHash,
        amount: carbonCalc.tokens,
        timestamp: new Date(),
      });
      await plantation.save();
      await AuditLog.create({
        plantationId: plantation._id,
        action: 'token_minted',
        performedBy: req.user.id,
        role: 'admin',
        previousStatus: PLANTATION_STATUS.BLOCKCHAIN_CONFIRMED,
        newStatus: plantation.status,
        details: { txHash: mintResult.transactionHash, amount: carbonCalc.tokens },
      });
    }

    auditLog('NCCR_PLANTATION_APPROVE', req.user.id, 'plantation_verified_and_minted', {
      plantationId: plantation.plantationId,
      co2eq: carbonCalc.co2eq,
      tokens: carbonCalc.tokens,
      blockchainTx: plantation.blockchainTxHash,
      tokenTx: plantation.tokenTxHash,
    });

    res.json({
      success: true,
      message: 'Plantation verified. Carbon calculated, blockchain hash recorded, tokens minted.',
      plantation: plantation.toObject(),
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// PATCH /api/admin/plantations/:id/reject
router.patch('/plantations/:id/reject', async (req, res) => {
  try {
    const plantation = await Plantation.findById(req.params.id);
    if (!plantation) return res.status(404).json({ success: false, message: 'Plantation not found' });
    if (plantation.status !== PLANTATION_STATUS.PENDING_NCCR) {
      return res.status(400).json({ success: false, message: 'Plantation is not pending NCCR approval.' });
    }

    const notes = req.body.notes || req.body.reason || 'Rejected by NCCR';
    const previousStatus = plantation.status;
    plantation.status = PLANTATION_STATUS.REJECTED;
    plantation.nccrVerification = {
      adminId: req.user.id,
      decision: 'rejected',
      timestamp: new Date(),
      notes,
    };
    plantation.auditLog = plantation.auditLog || [];
    plantation.auditLog.push({ action: 'nccr_rejected', by: req.user.id, timestamp: new Date(), notes });
    await plantation.save();
    await AuditLog.create({
      plantationId: plantation._id,
      action: 'nccr_rejected',
      performedBy: req.user.id,
      role: 'admin',
      previousStatus,
      newStatus: plantation.status,
      details: { notes },
    });

    auditLog('NCCR_PLANTATION_REJECT', req.user.id, 'plantation_rejected', {
      plantationId: plantation.plantationId,
      notes,
    });

    res.json({
      success: true,
      message: 'Plantation rejected.',
      plantation: plantation.toObject(),
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;
