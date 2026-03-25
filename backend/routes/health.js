import express from 'express';
import Plantation from '../models/Plantation.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * Health Check Schedule:
 * Year 1 → initial_verification (auto-populated from panchayat/NCCR approval)
 * Year 2 → survival_check (field visit by panchayat)
 * Year 5 → carbon_recalculation (NCCR admin recalculates carbon)
 */
const HEALTH_SCHEDULE = [
  { year: 1, type: 'initial_verification', label: 'Initial Verification' },
  { year: 2, type: 'survival_check', label: 'Survival Check' },
  { year: 5, type: 'carbon_recalculation', label: 'Carbon Recalculation' },
];

/**
 * @route   GET /api/health/due/all
 * @desc    Get all plantations with overdue health checks (for panchayat/admin dashboard)
 */
router.get('/due/all', protect, async (req, res) => {
  try {
    const user = req.user;
    if (!['panchayat', 'admin', 'verifier', 'ngo'].includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const verifiedStatuses = ['VERIFIED', 'BLOCKCHAIN_CONFIRMED', 'TOKEN_MINTED'];
    const plantations = await Plantation.find({ status: { $in: verifiedStatuses } })
      .select('plantationId speciesName treeCount plantationDate status healthChecks gpsCoordinates')
      .lean();

    const now = new Date();
    const overdueList = [];

    plantations.forEach(p => {
      const plantDate = new Date(p.plantationDate);
      const ageYears = (now - plantDate) / (1000 * 60 * 60 * 24 * 365.25);

      HEALTH_SCHEDULE.forEach(s => {
        if (ageYears >= s.year) {
          const done = (p.healthChecks || []).some(
            hc => hc.checkType === s.type && hc.scheduledYear === s.year
          );
          if (!done) {
            overdueList.push({
              plantationId: p.plantationId,
              species: p.speciesName,
              treeCount: p.treeCount,
              plantedOn: p.plantationDate,
              ageYears: Math.round(ageYears * 10) / 10,
              dueCheck: s,
            });
          }
        }
      });
    });

    res.json({ success: true, data: overdueList });
  } catch (error) {
    console.error('Due Checks Error:', error);
    res.status(500).json({ success: false, message: 'Failed to load due checks' });
  }
});

/**
 * @route   GET /api/health/:plantationId
 * @desc    Get health monitoring timeline for a plantation
 */
router.get('/:plantationId', protect, async (req, res) => {
  try {
    const plantation = await Plantation.findOne({ plantationId: req.params.plantationId })
      .select('plantationId speciesName treeCount areaHectares plantationDate status carbonCalculation healthChecks')
      .lean();

    if (!plantation) {
      return res.status(404).json({ success: false, message: 'Plantation not found' });
    }

    const plantDate = new Date(plantation.plantationDate);
    const now = new Date();
    const ageYears = (now - plantDate) / (1000 * 60 * 60 * 24 * 365.25);

    // Build the schedule with status
    const schedule = HEALTH_SCHEDULE.map(s => {
      const existing = (plantation.healthChecks || []).find(
        hc => hc.checkType === s.type && hc.scheduledYear === s.year
      );
      const dueDate = new Date(plantDate);
      dueDate.setFullYear(dueDate.getFullYear() + s.year);

      return {
        ...s,
        dueDate,
        isDue: ageYears >= s.year,
        isCompleted: !!existing,
        checkData: existing || null,
      };
    });

    res.json({
      success: true,
      data: {
        plantation: {
          plantationId: plantation.plantationId,
          species: plantation.speciesName,
          treeCount: plantation.treeCount,
          area: plantation.areaHectares,
          plantedOn: plantation.plantationDate,
          ageYears: Math.round(ageYears * 10) / 10,
          status: plantation.status,
          currentCO2: plantation.carbonCalculation?.co2eq || 0,
        },
        schedule,
        healthChecks: plantation.healthChecks || [],
      },
    });
  } catch (error) {
    console.error('Health Check Fetch Error:', error);
    res.status(500).json({ success: false, message: 'Failed to load health data' });
  }
});

/**
 * @route   POST /api/health/:plantationId/check
 * @desc    Submit a health check (panchayat: survival_check, admin: carbon_recalculation)
 */
router.post('/:plantationId/check', protect, async (req, res) => {
  try {
    const { checkType, scheduledYear, result, survivalRate, survivingTrees, updatedCO2, notes } = req.body;
    const user = req.user;

    // Role validation
    const allowedRoles = {
      survival_check: ['panchayat', 'ngo'],
      carbon_recalculation: ['admin', 'verifier'],
      initial_verification: ['panchayat', 'admin'],
    };

    if (!allowedRoles[checkType]?.includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Unauthorized for this check type' });
    }

    const plantation = await Plantation.findOne({ plantationId: req.params.plantationId });
    if (!plantation) {
      return res.status(404).json({ success: false, message: 'Plantation not found' });
    }

    // Prevent duplicate same-type same-year check
    const exists = (plantation.healthChecks || []).some(
      hc => hc.checkType === checkType && hc.scheduledYear === scheduledYear
    );
    if (exists) {
      return res.status(400).json({ success: false, message: 'This health check has already been completed' });
    }

    const healthCheck = {
      checkType,
      scheduledYear,
      performedBy: user._id,
      performedByRole: user.role,
      performedAt: new Date(),
      result,
      survivalRate: survivalRate || null,
      survivingTrees: survivingTrees || null,
      updatedCO2: updatedCO2 || null,
      notes: notes || '',
      evidenceImages: [],
    };

    plantation.healthChecks.push(healthCheck);

    // If carbon recalculation, update the main carbon data
    if (checkType === 'carbon_recalculation' && updatedCO2 && result === 'recalculated') {
      plantation.carbonCalculation = {
        ...plantation.carbonCalculation?.toObject?.() || plantation.carbonCalculation || {},
        co2eq: updatedCO2,
      };
    }

    // If survival check failed badly, add audit log
    plantation.auditLog.push({
      action: `health_check_${checkType}`,
      performedBy: user._id,
      timestamp: new Date(),
      details: `${checkType} (Year ${scheduledYear}): ${result}${survivalRate ? `, Survival: ${survivalRate}%` : ''}`,
    });

    await plantation.save();

    res.json({
      success: true,
      message: `Health check (${checkType}) recorded successfully`,
      data: healthCheck,
    });
  } catch (error) {
    console.error('Health Check Submit Error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit health check' });
  }
});

export default router;
