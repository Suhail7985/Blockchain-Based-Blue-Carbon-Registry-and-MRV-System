import express from 'express';
import Species from '../models/Species.js';

import Plantation from '../models/Plantation.js';

const router = express.Router();

// GET /api/public/species - list all active species for dropdowns
router.get('/species', async (req, res) => {
  try {
    const species = await Species.find({ isActive: true })
      .select('name category scientificName avgBiomassPerTreeKg description')
      .sort({ category: 1, name: 1 })
      .lean();
    res.json({ success: true, species });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/**
 * GET /api/public/impact - Public aggregated data for national impact board
 */
router.get('/impact', async (req, res) => {
  try {
    const all = await Plantation.find({}).select('status carbonCalculation plantationDate latitude longitude areaHectares speciesName plantationId').lean();

    const totalPlantations = all.length;
    const verified = all.filter(p => ['TOKEN_MINTED', 'APPROVED_NCCR'].includes(p.status));
    const verifiedPlantations = verified.length;

    const totalCO2 = verified.reduce((acc, p) => acc + (p.carbonCalculation?.co2eq || 0), 0);
    const totalTokens = totalCO2; // Currently 1:1

    // Simple Monthly Growth (last 6 months)
    const monthlyGrowth = [];
    const carbonTrend = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Group by month
    const now = new Date();
    for (let i = 0; i < 6; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const mKey = d.getMonth();
        const yKey = d.getFullYear();
        
        const inMonth = all.filter(p => {
            const pd = new Date(p.plantationDate);
            return pd.getMonth() === mKey && pd.getFullYear() === yKey;
        });

        const vInMonth = inMonth.filter(p => ['TOKEN_MINTED', 'APPROVED_NCCR'].includes(p.status));
        const co2InMonth = vInMonth.reduce((acc, p) => acc + (p.carbonCalculation?.co2eq || 0), 0);

        monthlyGrowth.unshift({ month: monthNames[mKey], plantations: inMonth.length });
        carbonTrend.unshift({ month: monthNames[mKey], co2: Math.round(co2InMonth * 10) / 10 });
    }

    const mapData = verified.map(p => ({
        id: p._id,
        lat: p.latitude || p.gpsCoordinates?.lat,
        lng: p.longitude || p.gpsCoordinates?.lng,
        species: p.speciesName,
        area: p.areaHectares,
        co2: Math.round((p.carbonCalculation?.co2eq || 0) * 10) / 10,
        status: p.status,
        plantationId: p.plantationId
    })).filter(p => p.lat && p.lng);

    res.json({
        success: true,
        data: {
            totalPlantations,
            verifiedPlantations,
            totalCO2: Math.round(totalCO2),
            totalTokens: Math.round(totalTokens),
            monthlyGrowth,
            carbonTrend,
            mapData
        }
    });

  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;
