// Utility to derive lifecycle timestamps for a plantation
// Status flow:
// PENDING_PANCHAYAT → PENDING_NCCR → VERIFIED → BLOCKCHAIN_PENDING → BLOCKCHAIN_CONFIRMED → TOKEN_MINTED

const stepKeys = [
  'PENDING_PANCHAYAT',
  'PENDING_NCCR',
  'VERIFIED',
  'BLOCKCHAIN_PENDING',
  'BLOCKCHAIN_CONFIRMED',
  'TOKEN_MINTED',
];

export const STATUS_STEPS = stepKeys;

const findFirstLogTime = (plantation, actions) => {
  if (!plantation?.auditLog) return null;
  const item = plantation.auditLog.find((e) => actions.includes(e.action));
  return item?.timestamp || null;
};

export function buildLifecycleTimestamps(plantation) {
  if (!plantation) return {};

  const submitted =
    findFirstLogTime(plantation, ['submitted']) || plantation.submissionTimestamp || plantation.createdAt || null;

  const panchayatApproved =
    plantation.panchayatVerification?.timestamp ||
    findFirstLogTime(plantation, ['panchayat_approved', 'panchayat_approved_manual']) ||
    null;

  const nccrApproved =
    plantation.nccrVerification?.timestamp || findFirstLogTime(plantation, ['nccr_approved']) || null;

  const blockchainPending =
    findFirstLogTime(plantation, ['blockchain_pending']) ||
    nccrApproved ||
    null;

  const blockchainConfirmed =
    findFirstLogTime(plantation, ['blockchain_confirmed']) || (plantation.blockchainTxHash ? plantation.updatedAt : null);

  const tokenMinted =
    findFirstLogTime(plantation, ['token_minted']) || (plantation.tokenTxHash ? plantation.updatedAt : null);

  return {
    submitted,
    panchayatApproved,
    nccrApproved,
    blockchainPending,
    blockchainConfirmed,
    tokenMinted,
  };
}

