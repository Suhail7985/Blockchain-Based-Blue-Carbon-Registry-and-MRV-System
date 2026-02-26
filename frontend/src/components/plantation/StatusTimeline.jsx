import React from 'react';
import { STATUS_STEPS } from '../../utils/plantationLifecycle';

const STEP_LABELS = {
  PENDING_PANCHAYAT: 'Panchayat Pending',
  PENDING_NCCR: 'NCCR Pending',
  VERIFIED: 'Verified',
  BLOCKCHAIN_PENDING: 'On-chain Pending',
  BLOCKCHAIN_CONFIRMED: 'On-chain Confirmed',
  TOKEN_MINTED: 'Tokens Minted',
};

const formatTs = (ts) => {
  if (!ts) return '—';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

/**
 * StatusTimeline
 * Props:
 *  - status: current plantation status string
 *  - timestamps: {
 *      submitted,
 *      panchayatApproved,
 *      nccrApproved,
 *      blockchainPending,
 *      blockchainConfirmed,
 *      tokenMinted,
 *    }
 *  - compact?: boolean
 */
const StatusTimeline = ({ status, timestamps = {}, compact = false }) => {
  const currentIndex = STATUS_STEPS.indexOf(status) === -1 ? 0 : STATUS_STEPS.indexOf(status);

  const tsByStep = {
    PENDING_PANCHAYAT: timestamps.submitted,
    PENDING_NCCR: timestamps.panchayatApproved,
    VERIFIED: timestamps.nccrApproved,
    BLOCKCHAIN_PENDING: timestamps.blockchainPending,
    BLOCKCHAIN_CONFIRMED: timestamps.blockchainConfirmed,
    TOKEN_MINTED: timestamps.tokenMinted,
  };

  return (
    <div className={`w-full ${compact ? 'py-1' : 'py-3'}`}>
      <div className="flex items-center justify-between gap-2">
        {STATUS_STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isLast = index === STATUS_STEPS.length - 1;

          return (
            <div key={step} className="flex-1 flex flex-col items-center relative">
              {/* Connector line */}
              {!isLast && (
                <div
                  className={`absolute top-3 left-1/2 right-[-50%] h-0.5 ${
                    isCompleted || isCurrent ? 'bg-bc-green-500' : 'bg-gray-200'
                  }`}
                />
              )}

              {/* Circle */}
              <div
                className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  isCompleted
                    ? 'bg-bc-green-600 text-white'
                    : isCurrent
                    ? 'bg-white border-2 border-bc-green-600 text-bc-green-700'
                    : 'bg-gray-100 text-gray-400 border border-gray-200'
                }`}
              >
                {index + 1}
              </div>

              {/* Label & time */}
              {!compact && (
                <div className="mt-2 text-center">
                  <div className="text-[11px] font-medium text-gray-700">{STEP_LABELS[step]}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[90px]">
                    {formatTs(tsByStep[step])}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusTimeline;

