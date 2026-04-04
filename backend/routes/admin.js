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
import { sendPlantationStatusEmail } from '../utils/emailService.js';
import {
  generatePlantationHash,
  storePlantationHash,
  mintCarbonToken,
} from '../utils/blockchainService.js';
import { finalizePlantationApproval } from '../utils/verification.js';

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
    const { name, email, password, district, state } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const districtCode = (district || 'PANCH').toUpperCase().replace(/\s+/g, '').slice(0, 5);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const panchayatId = `PANCH-${districtCode}-${random}`;

    const user = new User({
      name,
      email,
      password: password,
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
      message: 'Panchayat user created successfully.',
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

// Update Panchayat status (ACTIVE/SUSPENDED)
router.patch('/panchayats/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (![ACCOUNT_STATUS.ACTIVE, ACCOUNT_STATUS.SUSPENDED, ACCOUNT_STATUS.INACTIVE].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'panchayat' },
      { accountStatus: status },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'Panchayat not found' });
    
    auditLog('UPDATE_PANCHAYAT_STATUS', req.user.id, 'update_status', { id: user._id, status });
    res.json({ success: true, message: `Panchayat ${status}`, user: user.getPublicProfile() });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ----- Species Management -----

import Species from '../models/Species.js';

router.get('/species', async (req, res) => {
  try {
    const species = await Species.find({}).sort({ name: 1 }).lean();
    res.json({ success: true, species });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post('/species', async (req, res) => {
  try {
    const s = await Species.create(req.body);
    auditLog('CREATE_SPECIES', req.user.id, 'create', { id: s._id, name: s.name });
    res.status(201).json({ success: true, species: s });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.patch('/species/:id', async (req, res) => {
  try {
    const s = await Species.findByIdAndUpdate(req.params.id, req.body, { new: true });
    auditLog('UPDATE_SPECIES', req.user.id, 'update', { id: s._id, name: s.name });
    res.json({ success: true, species: s });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
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
      .populate('plantationId', 'plantationId')
      .lean();

    res.json({ success: true, logs });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// PATCH /api/admin/plantations/:id/approve - final approve → carbon calc → blockchain → token mint
router.patch('/plantations/:id/approve', async (req, res) => {
  try {
    const plantation = await Plantation.findById(req.params.id).populate('userId', 'walletAddress name email');
    if (!plantation) return res.status(404).json({ success: false, message: 'Plantation not found' });
    if (plantation.status !== PLANTATION_STATUS.PENDING_NCCR) {
      return res.status(400).json({ success: false, message: 'Plantation is not pending NCCR approval.' });
    }

    const userWallet = plantation.userId?.walletAddress?.trim();
    // In dev or if the user hasn't linked a wallet, we shouldn't block the approval of the *plantation* itself.
    // We will just skip the token minting step or let it gracefully fail.
    
    const notes = req.body.notes || '';

    // Use unified verification utility for final approval
    const updated = await finalizePlantationApproval(plantation._id, req.user.id, 'admin', notes);

    auditLog('NCCR_PLANTATION_APPROVE_FINAL', req.user.id, 'plantation_verified_and_minted', {
      plantationId: updated.plantationId,
      co2eq: updated.carbonCalculation.co2eq,
      tokens: updated.carbonCalculation.tokens,
    });

    res.json({
      success: true,
      message: 'Plantation verified. Carbon calculated, blockchain hash recorded, tokens minted.',
      plantation: updated.toObject(),
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

    // Send rejection email notification (non-blocking)
    const ownerUser = await User.findById(plantation.userId).select('email name').lean();
    if (ownerUser?.email) {
      sendPlantationStatusEmail(ownerUser.email, ownerUser.name || 'Land Owner', plantation.plantationId, 'rejected', {
        reason: notes,
      }).catch(() => {});
    }

    res.json({
      success: true,
      message: 'Plantation rejected.',
      plantation: plantation.toObject(),
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// PATCH /api/admin/plantations/:id/mrv - update detailed MRV data
router.patch('/plantations/:id/mrv', async (req, res) => {
  try {
    const plantation = await Plantation.findById(req.params.id);
    if (!plantation) return res.status(404).json({ success: false, message: 'Plantation not found' });

    const {
      monitoringSeason,
      monitoringMethod,
      technologyUsed,
      aboveGround,
      belowGround,
      soilOrganicCarbon0_30,
      soilOrganicCarbon30_100,
      deadWood,
      litter,
      satelliteSource,
      droneSpecs,
      gpsAccuracy,
      weatherConditions,
      accessibilityRating,
      communityParticipation,
      dataQualityScore,
      verifierName,
      verifierType,
      verifierCredential,
      reportHash,
      ipfsHash,
      complianceStandard,
      labCertification,
      institutionalApprovalStatus,
    } = req.body;

    plantation.mrvData = {
      monitoringSeason,
      monitoringMethod,
      technologyUsed,
      biomass: {
        aboveGround: parseFloat(aboveGround) || 0,
        belowGround: parseFloat(belowGround) || 0,
        soilOrganicCarbon0_30: parseFloat(soilOrganicCarbon0_30) || 0,
        soilOrganicCarbon30_100: parseFloat(soilOrganicCarbon30_100) || 0,
        deadWood: parseFloat(deadWood) || 0,
        litter: parseFloat(litter) || 0,
      },
      auditTrail: {
        technologyUsed,
        satelliteSource,
        droneSpecs,
        gpsAccuracy: parseFloat(gpsAccuracy) || 0,
        weatherConditions,
        accessibilityRating,
        communityParticipation: parseFloat(communityParticipation) || 0,
        dataQualityScore: parseFloat(dataQualityScore) || 0,
      },
      verification: {
        verifierName,
        verifierType,
        verifierCredential,
        reportHash,
        ipfsHash,
        complianceStandard,
        labCertification,
        institutionalApprovalStatus,
      },
    };

    plantation.auditLog = plantation.auditLog || [];
    plantation.auditLog.push({
      action: 'mrv_data_updated',
      by: req.user.id,
      timestamp: new Date(),
    });

    await plantation.save();

    res.json({
      success: true,
      message: 'MRV data updated successfully.',
      plantation: plantation.toObject(),
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;
