import express from 'express';
import { protect } from '../middleware/auth.js';
import { requireActive } from '../middleware/statusMiddleware.js';
import Plantation from '../models/Plantation.js';
import User from '../models/User.js';
import { PLANTATION_STATUS } from '../constants/plantationStatus.js';
import { getTokenBalance, getExplorerAddressUrl } from '../utils/blockchainService.js';

const router = express.Router();

router.use(protect);
router.use(requireActive);

router.get('/', async (req, res) => {
  try {
    const plantations = await Plantation.find({ userId: req.user.id }).lean();
    const verified = plantations.filter(
      (p) =>
        p.status === PLANTATION_STATUS.VERIFIED ||
        p.status === PLANTATION_STATUS.BLOCKCHAIN_CONFIRMED ||
        p.status === PLANTATION_STATUS.TOKEN_MINTED
    );
    let totalCO2 = 0;
    let totalTokens = 0;
    let totalSubsidy = 0;
    const history = [];
    verified.forEach((p) => {
      if (p.carbonCalculation) {
        totalCO2 += p.carbonCalculation.co2eq || 0;
        totalTokens += p.carbonCalculation.tokens || 0;
        
        // MODEL B: Subsidy Tracking
        if (p.subsidyRecord?.amountPaid) {
          totalSubsidy += p.subsidyRecord.amountPaid;
        }

        history.push({
          plantationId: p.plantationId,
          date: p.plantationDate,
          co2eq: p.carbonCalculation.co2eq,
          tokens: p.carbonCalculation.tokens,
          status: p.status,
          blockchainTxHash: p.blockchainTxHash,
          tokenTxHash: p.tokenTxHash,
          subsidyPaid: p.subsidyRecord?.amountPaid || null,
          subsidyCurrency: p.subsidyRecord?.currency || null,
          subsidyTxHash: p.subsidyRecord?.txHash || null,
        });
      }
    });
    history.sort((a, b) => new Date(b.date) - new Date(a.date));

    const user = await User.findById(req.user.id).select('walletAddress').lean();
    const walletAddress = user?.walletAddress;
    let walletBalance = null;
    let explorerAddressUrl = null;
    if (walletAddress) {
      // In Model B, citizens hold MATIC (subsidy), not BCC.
      // We could fetch MATIC balance, but it might be overkill.
      // Let's keep BCC balance fetch just in case they bought some back.
      walletBalance = await getTokenBalance(walletAddress);
      explorerAddressUrl = getExplorerAddressUrl(walletAddress);
    }

    res.json({
      success: true,
      totalCO2: Math.round(totalCO2 * 1000) / 1000,
      totalTokens: Math.round(totalTokens * 1000) / 1000,
      totalSubsidy: Math.round(totalSubsidy * 1000) / 1000,
      verifiedPlantations: verified.length,
      walletAddress: walletAddress || null,
      walletBalance: walletBalance != null ? String(walletBalance) : null,
      explorerAddressUrl,
      history,
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;
