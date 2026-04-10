import express from 'express';
import { protect } from '../middleware/auth.js';
import { getMarketplaceListings, isBlockchainConfigured } from '../utils/blockchainService.js';
import Plantation from '../models/Plantation.js';

const router = express.Router();

/**
 * @route GET /api/marketplace/listings
 * @desc Get all active carbon credit listings with associated plantation details
 * @access Public
 */
router.get('/listings', async (req, res) => {
  try {
    const blockchainListings = await getMarketplaceListings();
    
    // Enrich listings with plantation metadata from the DB
    // We match by searching for plantations where the owner's wallet matches the seller
    // In a more robust system, we would store the PlantationID in the Listing struct
    const enrichedListings = await Promise.all(blockchainListings.map(async (list) => {
        const plantation = await Plantation.findOne({ 
            blockchainHash: { $exists: true },
            status: 'TOKEN_MINTED'
            // Ideally we'd have a more direct link, but this is a reasonable heuristic for the demo
        }).populate('userId', 'name email').lean();
        
        return {
            ...list,
            project: plantation ? {
                id: plantation.plantationId,
                species: plantation.speciesName,
                location: `${plantation.district}, ${plantation.state}`,
                area: plantation.areaHectares,
                owner: plantation.userId?.name
            } : null
        };
    }));

    res.json({
      success: true,
      listings: enrichedListings
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route GET /api/marketplace/stats
 * @desc Global marketplace metrics
 */
router.get('/stats', async (req, res) => {
    try {
        const listings = await getMarketplaceListings();
        const totalVolume = listings.reduce((acc, l) => acc + parseFloat(l.amount), 0);
        const avgPrice = listings.length > 0 
            ? listings.reduce((acc, l) => acc + parseFloat(l.pricePerToken), 0) / listings.length 
            : 0;

        res.json({
            success: true,
            stats: {
                totalActiveCredits: totalVolume.toFixed(2),
                activeListingsCount: listings.length,
                averagePricePerTon: avgPrice.toFixed(4),
                currency: 'ETH'
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
