import React from 'react';
import { Link } from 'react-router-dom';
import { ACCOUNT_STATUS } from '../../constants/accountStatus';

const StatusBanner = ({ accountStatus, onCompleteProfile }) => {
  if (accountStatus === ACCOUNT_STATUS.ACTIVE) return null;

  const config = {
    [ACCOUNT_STATUS.PROFILE_INCOMPLETE]: {
      message: 'Complete your profile with Aadhaar verification to unlock all features.',
      action: 'Complete Profile Now',
      href: '/portal/profile',
      variant: 'amber',
    },
    [ACCOUNT_STATUS.VERIFIED_PENDING_LAND]: {
      message: 'Identity verified. Upload land ownership proof to complete verification.',
      action: 'Upload Land Document',
      href: '/portal/profile',
      variant: 'amber',
    },
    [ACCOUNT_STATUS.IDENTITY_VERIFIED]: {
      message: 'Upload land ownership proof to complete verification.',
      action: 'Upload Land Document',
      href: '/portal/profile',
      variant: 'amber',
    },
    [ACCOUNT_STATUS.MANUAL_REVIEW]: {
      message: 'Your document is under manual review. Panchayat will verify your identity.',
      action: null,
      href: null,
      variant: 'yellow',
    },
    [ACCOUNT_STATUS.PENDING_VERIFICATION]: {
      message: 'Land document submitted. Awaiting Panchayat approval.',
      action: null,
      href: null,
      variant: 'yellow',
    },
    [ACCOUNT_STATUS.REJECTED]: {
      message: 'Your profile was not approved. Please update and resubmit.',
      action: 'Update Profile',
      href: '/portal/profile',
      variant: 'red',
    },
    [ACCOUNT_STATUS.UNVERIFIED_EMAIL]: {
      message: 'Please verify your email to continue.',
      action: null,
      href: null,
      variant: 'gray',
    },
  };

  const c = config[accountStatus] || config[ACCOUNT_STATUS.PROFILE_INCOMPLETE];
  const bgClass = {
    amber: 'bg-amber-50 border-amber-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    red: 'bg-red-50 border-red-200',
    gray: 'bg-gray-50 border-gray-200',
  }[c.variant];

  return (
    <div className={`rounded-lg border p-4 ${bgClass} mb-6`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm font-medium text-gray-800">{c.message}</p>
        {c.action && c.href && (
          <Link
            to={c.href}
            className="inline-flex justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            {c.action}
          </Link>
        )}
      </div>
    </div>
  );
};

export default StatusBanner;
