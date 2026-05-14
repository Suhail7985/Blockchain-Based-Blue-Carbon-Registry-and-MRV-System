/**
 * Panchayat verification - view and approve/reject plantations in jurisdiction
 */
import express from 'express';
import mongoose from 'mongoose';
import Plantation from '../models/Plantation.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { protect, authorize } from '../middleware/auth.js';
import { PLANTATION_STATUS } from '../constants/plantationStatus.js';
import { ACCOUNT_STATUS } from '../constants/accountStatus.js';
import { auditLog } from '../utils/auditLog.js';
import { analyzePlantationsRisk } from '../utils/fraud.js';
import { finalizePlantationApproval } from '../utils/verification.js';
import { createNotification } from '../utils/notificationService.js';

const router = express.Router();

router.use(protect);
router.use(authorize('panchayat'));

// GET /api/panchayat/plantations - pending plantations in jurisdiction (by district/state)
router.get('/plantations', async (req, res) => {
  try {
    const panchayatUser = await User.findById(req.user.id).select('district state panchayatName').lean();
    const status = req.query.status;

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    } else if (!status) {
      query.status = PLANTATION_STATUS.PENDING_PANCHAYAT;
    }

    console.log('Panchayat query:', JSON.stringify(query, null, 2));
    const plantations = await Plantation.find(query)
      .sort({ submissionTimestamp: -1 })
      .populate('userId', 'name email phone') // Populate owner info
      .lean();

    console.log(`Found ${plantations.length} plantations for this query.`);

    const inJurisdiction = plantations; // DB already filtered it

    const risk = analyzePlantationsRisk(inJurisdiction);
    const riskById = new Map(risk.map((r) => [r.plantationId, r]));
    const withRisk = inJurisdiction.map((p) => ({
      ...p,
      risk: riskById.get(p._id.toString()) || { riskScore: 'LOW', flags: [] },
    }));

    const totalInDb = await Plantation.countDocuments({});
    
    res.json({ 
      success: true, 
      plantations: withRisk,
      debug: {
        totalPlantationsInDb: totalInDb,
        queryExecuted: query,
        userFromToken: req.user.id,
        userFromDb: panchayatUser ? 'found' : 'not_found',
        userRole: req.user.role,
        dbName: mongoose.connection.db.databaseName,
        collectionName: Plantation.collection.name,
        jurisdiction: {
          state: panchayatUser?.state,
          district: panchayatUser?.district,
          panchayatName: panchayatUser?.panchayatName
        }
      }
    });
  } catch (e) {
    console.error('Error in GET /panchayat/plantations:', e);
    res.status(500).json({ success: false, message: e.message });
  }
});

// PATCH /api/panchayat/plantations/:id/approve
router.patch('/plantations/:id/approve', async (req, res) => {
  try {
    const plantation = await Plantation.findById(req.params.id);
    if (!plantation) return res.status(404).json({ success: false, message: 'Plantation not found' });
    if (plantation.status !== PLANTATION_STATUS.PENDING_PANCHAYAT) {
      return res.status(400).json({ success: false, message: 'Plantation is not pending Panchayat approval.' });
    }

    const notes = req.body.remarks || req.body.notes || 'Approved by Panchayat';
    
    // Call the unified verification utility to finalize (Carbon + Blockchain + Minting)
    const updated = await finalizePlantationApproval(plantation._id, req.user.id, 'panchayat', notes);

    res.json({
      success: true,
      message: 'Plantation approved and finalized. Carbon calculated and tokens minted.',
      plantation: updated.toObject(),
    });
  } catch (e) {
    console.error('Error in PATCH /panchayat/plantations/:id/approve:', e);
    res.status(500).json({ success: false, message: e.message });
  }
});

// PATCH /api/panchayat/plantations/:id/reject
router.patch('/plantations/:id/reject', async (req, res) => {
  try {
    const plantation = await Plantation.findById(req.params.id);
    if (!plantation) return res.status(404).json({ success: false, message: 'Plantation not found' });
    if (plantation.status !== PLANTATION_STATUS.PENDING_PANCHAYAT) {
      return res.status(400).json({ success: false, message: 'Plantation is not pending Panchayat approval.' });
    }

    const reason = req.body.reason || req.body.remarks || 'Rejected by Panchayat';
    const previousStatus = plantation.status;
    plantation.status = PLANTATION_STATUS.REJECTED;
    plantation.panchayatVerification = {
      panchayatId: req.user.id,
      decision: 'rejected',
      timestamp: new Date(),
      remarks: reason,
    };
    plantation.auditLog = plantation.auditLog || [];
    plantation.auditLog.push({ action: 'panchayat_rejected', by: req.user.id, timestamp: new Date(), reason });
    await plantation.save();

    auditLog('PANCHAYAT_REJECT', req.user.id, 'plantation_rejected', {
      plantationId: plantation.plantationId,
      reason,
    });
    await AuditLog.create({
      plantationId: plantation._id,
      action: 'panchayat_rejected',
      performedBy: req.user.id,
      role: 'panchayat',
      previousStatus,
      newStatus: plantation.status,
      details: { reason },
    });

    // In-app rejection notification to the citizen
    createNotification(plantation.userId, 'plantation_rejected', {
      plantationId: plantation.plantationId,
      reason,
    }).catch(() => {});

    res.json({
      success: true,
      message: 'Plantation rejected.',
      plantation: plantation.toObject(),
    });
  } catch (e) {
    console.error('Error in PATCH /panchayat/plantations/:id/reject:', e);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ---- Manual KYC queue (Panchayat) ----

// GET /api/panchayat/kyc/manual-review
router.get('/kyc/manual-review', async (req, res) => {
  try {
    const panchayatUser = await User.findById(req.user.id).select('district state').lean();
    const district = panchayatUser?.district || req.query.district;

    const users = await User.find({ accountStatus: ACCOUNT_STATUS.MANUAL_REVIEW })
      .select('name email referenceId district state aadhaarDocumentPath aadhaarUploadedAt manualReview createdAt')
      .sort({ updatedAt: -1 })
      .lean();

    let inJurisdiction;
    if (!district) {
      // Panchayat user has no district set, show all
      inJurisdiction = users;
    } else {
      const lowerDistrict = district.toLowerCase();
      // Always include users with missing district for admin review
      inJurisdiction = users.filter(
        (u) => !u.district || (u.district || '').toLowerCase() === lowerDistrict
      );
    }

    res.json({ success: true, users: inJurisdiction });
  } catch (e) {
    console.error('Error in GET /panchayat/kyc/manual-review:', e);
    res.status(500).json({ success: false, message: e.message });
  }
});

// PATCH /api/panchayat/kyc/:userId/approve
router.patch('/kyc/:userId/approve', async (req, res) => {
  try {
    const target = await User.findById(req.params.userId).select('-password');
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });
    if (target.accountStatus !== ACCOUNT_STATUS.MANUAL_REVIEW) {
      return res.status(400).json({ success: false, message: 'User is not in manual review.' });
    }

    const notes = req.body.notes || 'Approved by Panchayat manual verification';
    target.identityVerifiedAt = new Date();
    target.accountStatus = ACCOUNT_STATUS.VERIFIED_PENDING_LAND;
    target.manualReview = {
      ...(target.manualReview || {}),
      status: 'APPROVED',
      resolvedAt: new Date(),
      resolvedBy: req.user.id,
      resolvedByRole: req.user.role,
      notes,
    };
    target.statusTimeline = [
      { step: 'Email Verified', completed: true, completedAt: target.createdAt },
      { step: 'Identity Verified', completed: true, completedAt: new Date(), notes: 'Verified manually' },
      { step: 'Land Verified', completed: false },
      { step: 'Account Activated', completed: false },
    ];
    await target.save();

    auditLog('PANCHAYAT_KYC_APPROVE', req.user.id, 'manual_kyc_approved', {
      targetUserId: target._id,
      referenceId: target.referenceId,
      notes,
    });

    res.json({ success: true, message: 'Identity approved. User can upload land proof now.', user: target.getPublicProfile() });
  } catch (e) {
    console.error('Error in PATCH /panchayat/kyc/:userId/approve:', e);
    res.status(500).json({ success: false, message: e.message });
  }
});

// PATCH /api/panchayat/kyc/:userId/reject
router.patch('/kyc/:userId/reject', async (req, res) => {
  try {
    const target = await User.findById(req.params.userId).select('-password');
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });
    if (target.accountStatus !== ACCOUNT_STATUS.MANUAL_REVIEW) {
      return res.status(400).json({ success: false, message: 'User is not in manual review.' });
    }

    const reason = req.body.reason || 'Rejected by Panchayat manual verification';
    target.accountStatus = ACCOUNT_STATUS.REJECTED;
    target.rejectionReason = reason;
    target.manualReview = {
      ...(target.manualReview || {}),
      status: 'REJECTED',
      resolvedAt: new Date(),
      resolvedBy: req.user.id,
      resolvedByRole: req.user.role,
      notes: reason,
    };
    await target.save();

    auditLog('PANCHAYAT_KYC_REJECT', req.user.id, 'manual_kyc_rejected', {
      targetUserId: target._id,
      referenceId: target.referenceId,
      reason,
    });

    res.json({ success: true, message: 'Identity rejected.', user: target.getPublicProfile() });
  } catch (e) {
    console.error('Error in PATCH /panchayat/kyc/:userId/reject:', e);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ---- Land verification (Panchayat) ----

// GET /api/panchayat/land/pending - list users pending land verification in jurisdiction
router.get('/land/pending', async (req, res) => {
  try {
    const panchayatUser = await User.findById(req.user.id).select('district state').lean();
    const district = panchayatUser?.district || req.query.district;

    const query = { accountStatus: ACCOUNT_STATUS.PENDING_VERIFICATION };
    if (district) {
      query.district = { $regex: new RegExp(`^${district.trim()}$`, 'i') };
    }

    const users = await User.find(query)
      .select('name email referenceId district state landDocumentPath landAreaHectares landDocumentUploadedAt createdAt')
      .sort({ landDocumentUploadedAt: -1 })
      .lean();

    res.json({ success: true, users });
  } catch (e) {
    console.error('Error in GET /panchayat/land/pending:', e);
    res.status(500).json({ success: false, message: e.message });
  }
});

// PATCH /api/panchayat/land/:userId/approve
router.patch('/land/:userId/approve', async (req, res) => {
  try {
    const target = await User.findById(req.params.userId).select('-password');
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });
    if (target.accountStatus !== ACCOUNT_STATUS.PENDING_VERIFICATION) {
      return res.status(400).json({ success: false, message: 'User land is not pending verification.' });
    }

    target.accountStatus = ACCOUNT_STATUS.ACTIVE;
    target.isVerified = true;
    target.verifiedAt = new Date();
    target.panchayatApprovedAt = new Date();
    target.statusTimeline = [
      { step: 'Email Verified', completed: true, completedAt: target.createdAt },
      { step: 'Identity Verified', completed: true, completedAt: target.identityVerifiedAt || new Date() },
      { step: 'Land Verified', completed: true, completedAt: new Date() },
      { step: 'Account Activated', completed: true, completedAt: new Date() },
    ];
    await target.save();

    auditLog('PANCHAYAT_LAND_APPROVE', req.user.id, 'land_approved', {
      targetUserId: target._id,
      referenceId: target.referenceId,
    });

    res.json({ success: true, message: 'Land approved. Account is now active.', user: target.getPublicProfile() });
  } catch (e) {
    console.error('Error in PATCH /panchayat/land/:userId/approve:', e);
    res.status(500).json({ success: false, message: e.message });
  }
});

// PATCH /api/panchayat/land/:userId/reject
router.patch('/land/:userId/reject', async (req, res) => {
  try {
    const target = await User.findById(req.params.userId).select('-password');
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });
    if (target.accountStatus !== ACCOUNT_STATUS.PENDING_VERIFICATION) {
      return res.status(400).json({ success: false, message: 'User land is not pending verification.' });
    }

    const reason = req.body.reason || 'Land document rejected by Panchayat';
    target.accountStatus = ACCOUNT_STATUS.REJECTED;
    target.rejectionReason = reason;
    await target.save();

    auditLog('PANCHAYAT_LAND_REJECT', req.user.id, 'land_rejected', {
      targetUserId: target._id,
      referenceId: target.referenceId,
      reason,
    });

    res.json({ success: true, message: 'Land document rejected.', user: target.getPublicProfile() });
  } catch (e) {
    console.error('Error in PATCH /panchayat/land/:userId/reject:', e);
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;
