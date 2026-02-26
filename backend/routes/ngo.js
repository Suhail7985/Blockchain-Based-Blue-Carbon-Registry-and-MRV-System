/**
 * NGO manual verification queue (demo authority support)
 */
import express from 'express';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import { ACCOUNT_STATUS } from '../constants/accountStatus.js';
import { auditLog } from '../utils/auditLog.js';

const router = express.Router();

router.use(protect);
router.use(authorize('ngo'));

// GET /api/ngo/kyc/manual-review
router.get('/kyc/manual-review', async (req, res) => {
  try {
    const ngoUser = await User.findById(req.user.id).select('district state').lean();
    const district = ngoUser?.district || req.query.district;

    const users = await User.find({ accountStatus: ACCOUNT_STATUS.MANUAL_REVIEW })
      .select('name email referenceId district state aadhaarDocumentPath aadhaarUploadedAt manualReview createdAt')
      .sort({ updatedAt: -1 })
      .lean();

    const inJurisdiction = district
      ? users.filter(
          (u) =>
            !u.district ||
            (u.district || '').toLowerCase() === (district || '').toLowerCase()
        )
      : users;

    res.json({ success: true, users: inJurisdiction });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// PATCH /api/ngo/kyc/:userId/approve
router.patch('/kyc/:userId/approve', async (req, res) => {
  try {
    const target = await User.findById(req.params.userId).select('-password');
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });
    if (target.accountStatus !== ACCOUNT_STATUS.MANUAL_REVIEW) {
      return res.status(400).json({ success: false, message: 'User is not in manual review.' });
    }

    const notes = req.body.notes || 'Approved by NGO manual verification';
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

    auditLog('NGO_KYC_APPROVE', req.user.id, 'manual_kyc_approved', {
      targetUserId: target._id,
      referenceId: target.referenceId,
      notes,
    });

    res.json({ success: true, message: 'Identity approved. User can upload land proof now.', user: target.getPublicProfile() });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// PATCH /api/ngo/kyc/:userId/reject
router.patch('/kyc/:userId/reject', async (req, res) => {
  try {
    const target = await User.findById(req.params.userId).select('-password');
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });
    if (target.accountStatus !== ACCOUNT_STATUS.MANUAL_REVIEW) {
      return res.status(400).json({ success: false, message: 'User is not in manual review.' });
    }

    const reason = req.body.reason || 'Rejected by NGO manual verification';
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

    auditLog('NGO_KYC_REJECT', req.user.id, 'manual_kyc_rejected', {
      targetUserId: target._id,
      referenceId: target.referenceId,
      reason,
    });

    res.json({ success: true, message: 'Identity rejected.', user: target.getPublicProfile() });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;

