/**
 * Panchayat verification - view and approve/reject plantations in jurisdiction
 */
import express from 'express';
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

    // 'all' = fetch every status (used for analytics/stats on dashboard)
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    } else if (!status) {
      // Default: show pending items only (the action queue)
      query.status = PLANTATION_STATUS.PENDING_PANCHAYAT;
    }
    // if status === 'all', no status filter — returns everything in jurisdiction
    
    console.log('--- DEBUG: Panchayat Fetch ---');
    console.log('Panchayat User ID:', req.user.id);
    console.log('Panchayat Profile:', JSON.stringify(panchayatUser));

    if (panchayatUser?.state) {
        query.state = new RegExp(`^${panchayatUser.state.trim()}$`, 'i');
    }
    if (panchayatUser?.district) {
        query.district = new RegExp(`^${panchayatUser.district.trim()}$`, 'i');
    }
    // If the panchayat officer has a specific name/ID, use it, but don't block if they don't
    if (panchayatUser?.panchayatName) {
        query.panchayatName = new RegExp(`^${panchayatUser.panchayatName.trim()}$`, 'i');
    }

    console.log('Generated Query:', JSON.stringify(query));

    const plantations = await Plantation.find(query)
      .sort({ submissionTimestamp: -1 })
      .populate('userId', 'name email phone') // Populate owner info
      .lean();
    
    console.log('Found Count:', plantations.length);
    console.log('----------------------------');

    const inJurisdiction = plantations; // DB already filtered it

    const risk = analyzePlantationsRisk(inJurisdiction);
    const riskById = new Map(risk.map((r) => [r.plantationId, r]));
    const withRisk = inJurisdiction.map((p) => ({
      ...p,
      risk: riskById.get(p._id.toString()) || { riskScore: 'LOW', flags: [] },
    }));

    res.json({ success: true, plantations: withRisk });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// PATCH /api/panchayat/plantations/:id/approve
router.patch('/plantations/:id/approve', async (req, res) => {
  try {
    const plantation = await Plantation.findById(req.params.id);
    if (!plantation) return res.status(404).json({ success: false, message: 'Plantation not found' });
    const allowedStatuses = [PLANTATION_STATUS.PENDING_PANCHAYAT, PLANTATION_STATUS.VERIFIED, PLANTATION_STATUS.BLOCKCHAIN_CONFIRMED];
    if (!allowedStatuses.includes(plantation.status)) {
      return res.status(400).json({ success: false, message: "Plantation is not in a registrable state." });
    }

    // Determine if it's eligible for autonomous approval
    const riskAnalysis = analyzePlantationsRisk([plantation]);
    const isLowRisk = riskAnalysis[0]?.riskScore === 'LOW';

    if (isLowRisk) {
      // Autonomous Approval (Bypass NCCR -> Calculate Carbon -> Tokenize)
      const remarks = req.body.remarks || 'Autonomously approved by Panchayat (Low Risk)';
      const updated = await finalizePlantationApproval(plantation._id, req.user.id, 'panchayat', remarks);

      auditLog('PANCHAYAT_APPROVE_FINAL', req.user.id, 'plantation_verified_and_minted', {
        plantationId: updated.plantationId,
        co2eq: updated.carbonCalculation?.co2eq,
      });

      return res.json({
        success: true,
        message: 'Low risk plantation autonomously approved. Tokens minted successfully.',
        plantation: updated.toObject(),
      });
    }

    // High risk: Escalate to NCCR
    const previousStatus = plantation.status;
    plantation.status = PLANTATION_STATUS.PENDING_NCCR;
    plantation.panchayatVerification = {
      panchayatId: req.user.id,
      decision: 'approved',
      timestamp: new Date(),
      remarks: req.body.remarks || 'Approved by Panchayat, escalating to NCCR',
    };
    plantation.auditLog = plantation.auditLog || [];
    plantation.auditLog.push({ action: 'panchayat_approved', by: req.user.id, timestamp: new Date(), remarks: req.body.remarks });
    await plantation.save();

    auditLog('PANCHAYAT_APPROVE', req.user.id, 'plantation_approved_escalated', {
      plantationId: plantation.plantationId,
      plantationDbId: plantation._id,
    });
    await AuditLog.create({
      plantationId: plantation._id,
      action: 'panchayat_approved',
      performedBy: req.user.id,
      role: 'panchayat',
      previousStatus,
      newStatus: plantation.status,
      details: { remarks: req.body.remarks || '' },
    });

    res.json({
      success: true,
      message: 'Plantation flagged. Approved locally and escalated to NCCR for final verification.',
      plantation: plantation.toObject(),
    });
  } catch (e) {
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
    res.status(500).json({ success: false, message: e.message });
  }
});

// PATCH /api/panchayat/plantations/:id/data - update survival & M-GNREGA data
router.patch('/plantations/:id/data', async (req, res) => {
  try {
    const panchayatUser = await User.findById(req.user.id).select('district state').lean();
    const plantation = await Plantation.findById(req.params.id);

    if (!plantation) return res.status(404).json({ success: false, message: 'Plantation not found' });

    // Jurisdiction check
    if (
      plantation.state.toLowerCase() !== panchayatUser.state.toLowerCase() ||
      plantation.district.toLowerCase() !== panchayatUser.district.toLowerCase()
    ) {
      return res.status(403).json({ success: false, message: 'Plantation is outside your jurisdiction.' });
    }

    const {
      personDays,
      wageRate,
      survivalRate,
      mortalityCauses,
      nextPlantationDate,
      certificationBody,
      localTrainingProvided,
    } = req.body;

    plantation.panchayatData = {
      mgnrega: {
        personDays: parseFloat(personDays) || 0,
        wageRate: parseFloat(wageRate) || 0,
      },
      survivalRate: parseFloat(survivalRate) || 0,
      mortalityCauses,
      nextPlantationDate,
      certificationBody,
      localTrainingProvided: localTrainingProvided === 'true' || localTrainingProvided === true,
    };

    plantation.auditLog = plantation.auditLog || [];
    plantation.auditLog.push({
      action: 'panchayat_data_updated',
      by: req.user.id,
      timestamp: new Date(),
    });

    await plantation.save();

    res.json({
      success: true,
      message: 'Panchayat data updated successfully.',
      plantation: plantation.toObject(),
    });
  } catch (e) {
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
      // Always include users with missing district for admin review
      inJurisdiction = users.filter(
        (u) => !u.district || (u.district || '').toLowerCase() === district.toLowerCase()
      );
    }

    res.json({ success: true, users: inJurisdiction });
  } catch (e) {
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
    res.status(500).json({ success: false, message: e.message });
  }
});

// ---- Land Verification (Panchayat) ----

// GET /api/panchayat/land/pending
router.get('/land/pending', async (req, res) => {
  try {
    const panchayatUser = await User.findById(req.user.id).select('district state').lean();
    const district = panchayatUser?.district || req.query.district;

    const users = await User.find({ accountStatus: ACCOUNT_STATUS.PENDING_VERIFICATION })
      .select('name email district state landDocumentPath landAreaHectares createdAt')
      .sort({ updatedAt: -1 })
      .lean();

    let inJurisdiction;
    if (!district) {
      inJurisdiction = users;
    } else {
      inJurisdiction = users.filter(
        (u) => !u.district || (u.district || '').toLowerCase() === district.toLowerCase()
      );
    }

    res.json({ success: true, users: inJurisdiction });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// PATCH /api/panchayat/land/:userId/approve
router.patch('/land/:userId/approve', async (req, res) => {
  try {
    const target = await User.findById(req.params.userId).select('-password');
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });
    if (target.accountStatus !== ACCOUNT_STATUS.PENDING_VERIFICATION) {
      return res.status(400).json({ success: false, message: 'User is not pending land verification.' });
    }

    target.accountStatus = ACCOUNT_STATUS.ACTIVE;
    target.landVerifiedAt = new Date();
    
    // update timeline
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

    res.json({ success: true, message: 'Land approved. User account activated.', user: target.getPublicProfile() });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// PATCH /api/panchayat/land/:userId/reject
router.patch('/land/:userId/reject', async (req, res) => {
  try {
    const target = await User.findById(req.params.userId).select('-password');
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });
    if (target.accountStatus !== ACCOUNT_STATUS.PENDING_VERIFICATION) {
      return res.status(400).json({ success: false, message: 'User is not pending land verification.' });
    }

    const reason = req.body.reason || 'Rejected by Panchayat';
    
    // Set status to IDENTITY_VERIFIED so they must re-upload land doc instead of Aadhaar
    target.accountStatus = ACCOUNT_STATUS.IDENTITY_VERIFIED; 
    target.rejectionReason = reason;

    // Remove the bad document
    target.landDocumentPath = null;

    target.statusTimeline = [
      { step: 'Email Verified', completed: true, completedAt: target.createdAt },
      { step: 'Identity Verified', completed: true, completedAt: target.identityVerifiedAt || new Date() },
      { step: 'Land Verified', completed: false, notes: reason },
      { step: 'Account Activated', completed: false },
    ];
    await target.save();

    auditLog('PANCHAYAT_LAND_REJECT', req.user.id, 'land_rejected', {
      targetUserId: target._id,
      reason,
    });

    res.json({ success: true, message: 'Land rejected.', user: target.getPublicProfile() });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;
