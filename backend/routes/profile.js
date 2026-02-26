/**
 * Profile & KYC Routes with Aadhaar Verification
 * Blue Carbon Registry - MoES / NCCR
 */
import express from 'express';
import { body, validationResult } from 'express-validator';
import path from 'path';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { uploadAadhaar, uploadLand } from '../middleware/upload.js';
import { ACCOUNT_STATUS } from '../constants/accountStatus.js';
import { auditLog } from '../utils/auditLog.js';
import { verifyAadhaarDocument } from '../utils/aadhaarVerification.js';

const router = express.Router();

// Update profile only (no file) - for ACTIVE users
router.patch(
  '/',
  protect,
  [
    body('name').optional().trim().isLength({ min: 2, max: 100 }),
    body('dateOfBirth').optional(),
    body('phone').optional(),
    body('address').optional().trim(),
    body('state').optional().trim(),
    body('district').optional().trim(),
    body('ngoName').optional().trim(),
    body('ngoRegistrationNumber').optional().trim(),
    body('ownershipType').optional().isIn(['private', 'community']),
  ],
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      if (user.accountStatus !== ACCOUNT_STATUS.ACTIVE) {
        return res.status(400).json({
          success: false,
          message: 'Use the main profile form with document upload for verification.',
        });
      }
      const updates = ['name', 'dateOfBirth', 'phone', 'address', 'state', 'district', 'ngoName', 'ngoRegistrationNumber', 'ownershipType'];
      updates.forEach((f) => {
        if (req.body[f] !== undefined) {
          user[f] = f === 'dateOfBirth' && req.body[f] ? new Date(req.body[f]) : req.body[f];
        }
      });
      await user.save();
      return res.json({
        success: true,
        message: 'Profile updated',
        profile: user.getPublicProfile(),
        accountStatus: user.accountStatus,
      });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message });
    }
  }
);

// Get own profile (protected)
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -emailVerificationToken -passwordResetToken');
    res.json({
      success: true,
      profile: user,
      accountStatus: user.accountStatus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
    });
  }
});

// Update profile & KYC with Aadhaar verification (multipart form)
router.put(
  '/',
  protect,
  uploadAadhaar,
  [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Full name required (2-100 chars)'),
    body('dateOfBirth').notEmpty().withMessage('Date of Birth is required'),
    body('phone').matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/).withMessage('Valid phone required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('state').optional().trim(),
    body('district').optional().trim(),
    body('ngoName').optional().trim(),
    body('ngoRegistrationNumber').optional().trim(),
    body('ownershipType').optional().isIn(['private', 'community']),
    body('declarationAccepted').optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const {
        name,
        dateOfBirth,
        phone,
        address,
        state,
        district,
        ngoName,
        ngoRegistrationNumber,
        ownershipType,
        declarationAccepted,
      } = req.body;

      const user = await User.findById(req.user.id).select('-password');

      // ACTIVE users: allow profile update only
      if (user.accountStatus === ACCOUNT_STATUS.ACTIVE) {
        user.name = name ?? user.name;
        user.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : user.dateOfBirth;
        user.phone = phone ?? user.phone;
        user.address = address ?? user.address;
        user.state = state ?? user.state;
        user.district = district ?? user.district;
        user.ngoName = ngoName ?? user.ngoName;
        user.ngoRegistrationNumber = ngoRegistrationNumber ?? user.ngoRegistrationNumber;
        user.ownershipType = ownershipType ?? user.ownershipType;
        await user.save();
        auditLog('PROFILE_UPDATE', req.user.id, 'profile_updated', {});
        return res.json({
          success: true,
          message: 'Profile updated successfully',
          profile: user.getPublicProfile(),
          accountStatus: user.accountStatus,
        });
      }

      if (!declarationAccepted) {
        return res.status(400).json({
          success: false,
          message: 'You must accept the declaration to submit.',
        });
      }

      // Aadhaar upload is mandatory for first-time submission
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Aadhaar document (PDF/JPG/PNG, max 5MB) is required.',
        });
      }

      const filePath = path.join(req.file.destination, req.file.filename);

      let verification;
      try {
        verification = await verifyAadhaarDocument(filePath, name, dateOfBirth);
      } catch (ocrErr) {
        console.error('Aadhaar verification error:', ocrErr);
        return res.status(500).json({
          success: false,
          message: 'Failed to verify Aadhaar document. Please ensure the document is clear and try again.',
        });
      }

      if (verification.manualReviewReason) {
        user.name = name;
        user.dateOfBirth = new Date(dateOfBirth);
        user.phone = phone;
        user.address = address;
        user.state = state ?? user.state;
        user.district = district ?? user.district;
        user.ngoName = ngoName ?? user.ngoName;
        user.ngoRegistrationNumber = ngoRegistrationNumber ?? user.ngoRegistrationNumber;
        user.ownershipType = ownershipType ?? user.ownershipType;
        user.declarationAccepted = true;
        user.declarationAcceptedAt = new Date();
        user.aadhaarDocumentPath = req.file.filename;
        user.aadhaarUploadedAt = new Date();
        user.aadhaarNameMatch = null;
        user.aadhaarDobMatch = null;
        user.accountStatus = ACCOUNT_STATUS.MANUAL_REVIEW;
        user.manualReview = {
          status: 'PENDING',
          reason: verification.manualReviewReason,
          requestedAt: new Date(),
        };
        user.statusTimeline = [
          { step: 'Email Verified', completed: true, completedAt: user.createdAt },
          { step: 'Identity Verified', completed: false, notes: 'Manual review - document unreadable' },
          { step: 'Land Verified', completed: false },
          { step: 'Account Activated', completed: false },
        ];
        if (!user.referenceId) user.referenceId = await User.generateReferenceId();
        await user.save();
        auditLog('PROFILE_SUBMIT', req.user.id, 'aadhaar_manual_review', { reason: verification.manualReviewReason });
        return res.json({
          success: true,
          message: verification.manualReviewReason + ' Panchayat/local NGO will verify your identity manually.',
          referenceId: user.referenceId,
          accountStatus: user.accountStatus,
          profile: user.getPublicProfile(),
        });
      }

      user.name = name;
      user.dateOfBirth = new Date(dateOfBirth);
      user.phone = phone;
      user.address = address;
      user.state = state ?? user.state;
      user.district = district ?? user.district;
      user.ngoName = ngoName ?? user.ngoName;
      user.ngoRegistrationNumber = ngoRegistrationNumber ?? user.ngoRegistrationNumber;
      user.ownershipType = ownershipType ?? user.ownershipType;
      user.declarationAccepted = true;
      user.declarationAcceptedAt = new Date();
      user.aadhaarDocumentPath = req.file.filename;
      user.aadhaarUploadedAt = new Date();
      user.aadhaarNameMatch = verification.nameMatch;
      user.aadhaarDobMatch = verification.dobMatch;
      user.aadhaarLast4 = verification.aadhaarLast4 ? verification.aadhaarLast4.slice(-4) : null;

      if (verification.allMatch) {
        user.identityVerifiedAt = new Date();
        user.accountStatus = ACCOUNT_STATUS.VERIFIED_PENDING_LAND;
        user.statusTimeline = [
          { step: 'Email Verified', completed: true, completedAt: user.createdAt },
          { step: 'Identity Verified', completed: true, completedAt: new Date() },
          { step: 'Land Verified', completed: false },
          { step: 'Account Activated', completed: false },
        ];
      } else {
        user.accountStatus = ACCOUNT_STATUS.MANUAL_REVIEW;
        user.manualReview = {
          status: 'PENDING',
          reason: 'Manual review required (Name/DOB mismatch).',
          requestedAt: new Date(),
        };
        user.statusTimeline = [
          { step: 'Email Verified', completed: true, completedAt: user.createdAt },
          { step: 'Identity Verified', completed: false, notes: 'Manual review required' },
          { step: 'Land Verified', completed: false },
          { step: 'Account Activated', completed: false },
        ];
      }

      if (!user.referenceId) {
        user.referenceId = await User.generateReferenceId();
      }

      await user.save();

      auditLog('PROFILE_SUBMIT', req.user.id, 'aadhaar_kyc_submitted', {
        referenceId: user.referenceId,
        nameMatch: verification.nameMatch,
        dobMatch: verification.dobMatch,
        status: user.accountStatus,
      });

      res.json({
        success: true,
        message: verification.allMatch
          ? 'Identity verified. Please upload land ownership proof to complete verification.'
          : 'Document submitted. Name or DOB mismatch detected. Panchayat will verify manually.',
        referenceId: user.referenceId,
        accountStatus: user.accountStatus,
        aadhaarNameMatch: verification.nameMatch,
        aadhaarDobMatch: verification.dobMatch,
        profile: user.getPublicProfile(),
      });
    } catch (error) {
      console.error('Profile submit error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update profile',
      });
    }
  }
);

// Upload land document (after identity verified)
router.put(
  '/land-document',
  protect,
  uploadLand,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Land ownership document (PDF/JPG/PNG, max 5MB) is required.',
        });
      }

      const user = await User.findById(req.user.id).select('-password');

      const allowedStatuses = [ACCOUNT_STATUS.VERIFIED_PENDING_LAND, ACCOUNT_STATUS.IDENTITY_VERIFIED];
      if (!allowedStatuses.includes(user.accountStatus)) {
        return res.status(400).json({
          success: false,
          message: 'Complete identity verification first, then upload land document.',
        });
      }

      user.landDocumentPath = req.file.filename;
      user.landDocumentUploadedAt = new Date();
      user.accountStatus = ACCOUNT_STATUS.PENDING_VERIFICATION;
      if (req.body.landAreaHectares != null) {
        const ha = parseFloat(req.body.landAreaHectares);
        if (!isNaN(ha) && ha >= 0) user.landAreaHectares = ha;
      }
      user.statusTimeline = [
        { step: 'Email Verified', completed: true, completedAt: user.createdAt },
        { step: 'Identity Verified', completed: true, completedAt: user.identityVerifiedAt || new Date() },
        { step: 'Land Verified', completed: true, completedAt: new Date() },
        { step: 'Account Activated', completed: false, notes: 'Pending Panchayat approval' },
      ];
      await user.save();

      auditLog('LAND_DOCUMENT', req.user.id, 'land_document_uploaded', {
        referenceId: user.referenceId,
      });

      res.json({
        success: true,
        message: 'Land document uploaded. Pending Panchayat approval.',
        accountStatus: user.accountStatus,
        profile: user.getPublicProfile(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload land document',
      });
    }
  }
);

export default router;
