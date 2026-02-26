import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
const AUDIT_FILE = path.join(LOG_DIR, 'audit.log');

const ensureLogDir = () => {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
};

/**
 * Log audit event for compliance
 */
export const auditLog = (event, userId, action, details = {}) => {
  ensureLogDir();
  const entry = {
    timestamp: new Date().toISOString(),
    event,
    userId: userId?.toString?.() || userId,
    action,
    details,
  };
  const line = JSON.stringify(entry) + '\n';
  fs.appendFileSync(AUDIT_FILE, line, 'utf8');
};
