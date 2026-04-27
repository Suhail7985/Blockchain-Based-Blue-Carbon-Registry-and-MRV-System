import Notification from '../models/Notification.js';

/**
 * Notification type definitions with default titles and message templates.
 */
const NOTIFICATION_TEMPLATES = {
  plantation_approved: {
    title: '🌱 Plantation Approved',
    message: (meta) =>
      `Your plantation ${meta.plantationId} has been approved and is being processed on the blockchain.`,
  },
  plantation_rejected: {
    title: '❌ Plantation Rejected',
    message: (meta) =>
      `Your plantation ${meta.plantationId} was rejected. ${meta.reason ? `Reason: ${meta.reason}` : 'Please check your dashboard for details.'}`,
  },
  token_minted: {
    title: '🪙 BCC Tokens Credited!',
    message: (meta) =>
      `${meta.tokens} Blue Carbon Credits (BCC) have been minted for plantation ${meta.plantationId}, capturing ${meta.co2eq} tonnes of CO₂.`,
  },
  blockchain_confirmed: {
    title: '⛓️ Blockchain Confirmed',
    message: (meta) =>
      `Plantation ${meta.plantationId} has been recorded on the blockchain. TX: ${meta.txHash?.slice(0, 12)}...`,
  },
  kyc_approved: {
    title: '✅ KYC Approved',
    message: () => `Your identity verification has been approved. You can now register your land.`,
  },
  kyc_rejected: {
    title: '❌ KYC Rejected',
    message: (meta) =>
      `Your identity verification was rejected. ${meta.reason ? `Reason: ${meta.reason}` : ''}`,
  },
  general: {
    title: '📢 Notification',
    message: (meta) => meta.message || 'You have a new notification.',
  },
};

/**
 * Create a notification for a user.
 * @param {string} userId - The MongoDB ObjectId of the recipient user
 * @param {string} type - Notification type key
 * @param {object} metadata - Optional extra data (plantationId, tokens, etc.)
 * @param {object} overrides - Optional title/message overrides
 */
export async function createNotification(userId, type, metadata = {}, overrides = {}) {
  try {
    const template = NOTIFICATION_TEMPLATES[type] || NOTIFICATION_TEMPLATES.general;
    const title = overrides.title || template.title;
    const message = overrides.message || template.message(metadata);

    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      metadata,
    });

    return notification;
  } catch (err) {
    // Notifications should never block the main flow
    console.error(`[NotificationService] Failed to create notification for user ${userId}:`, err.message);
    return null;
  }
}
