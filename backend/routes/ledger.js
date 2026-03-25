import express from 'express';
import Plantation from '../models/Plantation.js';
import { protect } from '../middleware/auth.js';
import { requireActive } from '../middleware/statusMiddleware.js';
import { getExplorerTxUrl } from '../utils/blockchainService.js';

const router = express.Router();

router.use(protect);
router.use(requireActive);

// GET /api/ledger - carbon credit ledger with blockchain explorer links
router.get('/', async (req, res) => {
  try {
    const plantations = await Plantation.find({
      userId: req.user.id,
      carbonCalculation: { $exists: true },
    })
      .select(
        'plantationId landId treeCount areaHectares speciesName carbonCalculation blockchainHash blockchainTxHash tokenTxHash status submissionTimestamp plantationDate panchayatVerification nccrVerification auditLog'
      )
      .lean();

    const entries = plantations.map((p) => ({
      ...p,
      blockchainTxExplorerUrl: p.blockchainTxHash ? getExplorerTxUrl(p.blockchainTxHash) : null,
      tokenTxExplorerUrl: p.tokenTxHash ? getExplorerTxUrl(p.tokenTxHash) : null,
    }));

    res.json({
      success: true,
      entries,
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message || 'Failed to load ledger' });
  }
});

export default router;

