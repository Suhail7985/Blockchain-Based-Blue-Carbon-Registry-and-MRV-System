import { ACCOUNT_STATUS } from '../constants/accountStatus.js';

/**
 * Require ACTIVE status for sensitive operations:
 * - Plantation submission
 * - Land registration
 * - Token/carbon credits access
 * Must be used after protect middleware
 */
export const requireActive = (req, res, next) => {
  if (req.user.accountStatus !== ACCOUNT_STATUS.ACTIVE) {
    return res.status(403).json({
      success: false,
      message: 'Complete identity and land verification to proceed. This action requires an approved account.',
      accountStatus: req.user.accountStatus,
    });
  }
  next();
};

/**
 * Allow only ACTIVE or PENDING_VERIFICATION (e.g., view-only operations)
 */
export const requireVerifiedOrPending = (req, res, next) => {
  const allowed = [ACCOUNT_STATUS.ACTIVE, ACCOUNT_STATUS.PENDING_VERIFICATION];
  if (!allowed.includes(req.user.accountStatus)) {
    return res.status(403).json({
      success: false,
      message: 'Complete your profile to access this resource.',
      accountStatus: req.user.accountStatus,
    });
  }
  next();
};
