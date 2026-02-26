import express from 'express';
import Plantation from '../models/Plantation.js';
import { protect } from '../middleware/auth.js';
import { requireActive } from '../middleware/statusMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(requireActive);

// GET /api/ledger - carbon credit ledger for current user
router.get('/', async (req, res) => {
  try {
    const plantations = await Plantation.find({
      userId: req.user.id,
      carbonCalculation: { $exists: true },
    })
      .select(
        'plantationId landId treeCount areaHectares carbonCalculation blockchainHash blockchainTxHash tokenTxHash status submissionTimestamp'
      )
      .lean();

    res.json({
      success: true,
      entries: plantations,
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message || 'Failed to load ledger' });
  }
});

export default router;

