/**
 * Plantation submission and listing - Blue Carbon Registry
 * ACTIVE users only. Land must be VERIFIED. Area must not exceed land area.
 */
import express from 'express';
import { body, validationResult } from 'express-validator';
import Plantation from '../models/Plantation.js';
import Land from '../models/Land.js';
import { protect } from '../middleware/auth.js';
import { requireActive } from '../middleware/statusMiddleware.js';
import { uploadPlantationImages } from '../middleware/upload.js';
import { PLANTATION_STATUS } from '../constants/plantationStatus.js';
import { LAND_STATUS } from '../constants/plantationStatus.js';
import { auditLog } from '../utils/auditLog.js';

const router = express.Router();

function generatePlantationId() {
  const prefix = 'BCR-PLT';
  const time = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${time}-${rand}`;
}

// All plantation routes require auth + ACTIVE
router.use(protect);
router.use(requireActive);

// GET /api/plantation/lands - list verified lands for dropdown
router.get('/lands', async (req, res) => {
  try {
    let lands = await Land.find({
      userId: req.user.id,
      status: LAND_STATUS.VERIFIED,
    }).lean();

    if (lands.length === 0) {
      const User = (await import('../models/User.js')).default;
      const user = await User.findById(req.user.id).select('landDocumentPath landAreaHectares address district').lean();
      if (user?.landDocumentPath) {
        const newLand = await Land.create({
          userId: req.user.id,
          areaHectares: user.landAreaHectares ?? 1,
          status: LAND_STATUS.VERIFIED,
          documentPath: user.landDocumentPath,
          landReference: user.address || user.district || 'Primary land',
          verifiedAt: new Date(),
        });
        lands = [newLand.toObject()];
      }
    }

    res.json({ success: true, lands });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET /api/plantation - list my plantations
router.get('/', async (req, res) => {
  try {
    const plantations = await Plantation.find({ userId: req.user.id })
      .populate('landId', 'areaHectares landReference status')
      .sort({ submissionTimestamp: -1 })
      .lean();
    res.json({ success: true, plantations });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/plantation - create plantation (multipart: plantationImages)
router.post(
  '/',
  uploadPlantationImages,
  [
    body('landId').isMongoId().withMessage('Valid land selection required'),
    body('speciesName').trim().notEmpty().withMessage('Species name required'),
    body('treeCount').isInt({ min: 1 }).withMessage('Tree count must be at least 1'),
    body('areaHectares').isFloat({ min: 0 }).withMessage('Valid plantation area (hectares) required'),
    body('plantationDate').notEmpty().withMessage('Plantation date required'),
    body('lat').notEmpty().withMessage('GPS latitude is required'),
    body('lng').notEmpty().withMessage('GPS longitude is required'),
    body('declarationAccepted').equals('true').withMessage('Declaration must be accepted'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
      }

      const { landId, speciesName, treeCount, areaHectares, plantationDate, declarationAccepted } = req.body;
      const land = await Land.findOne({ _id: landId, userId: req.user.id, status: LAND_STATUS.VERIFIED });
      if (!land) {
        return res.status(400).json({ success: false, message: 'Selected land not found or not verified.' });
      }

      const areaNum = parseFloat(areaHectares);
      if (areaNum > land.areaHectares) {
        return res.status(400).json({
          success: false,
          message: `Plantation area (${areaNum} ha) cannot exceed registered land area (${land.areaHectares} ha).`,
        });
      }

      const dateObj = new Date(plantationDate);
      if (isNaN(dateObj.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid plantation date.' });
      }

      const startOfDay = new Date(dateObj);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(dateObj);
      endOfDay.setHours(23, 59, 59, 999);

      const duplicate = await Plantation.findOne({
        landId: land._id,
        plantationDate: { $gte: startOfDay, $lt: endOfDay },
        status: { $nin: [PLANTATION_STATUS.REJECTED] },
      });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'A plantation submission already exists for this land on the selected date.',
        });
      }

      const imagePaths = (req.files || []).map((f) => f.filename);

      const plantationId = generatePlantationId();
      const plantation = await Plantation.create({
        plantationId,
        userId: req.user.id,
        landId: land._id,
        speciesName: speciesName.trim(),
        treeCount: parseInt(treeCount, 10),
        areaHectares: areaNum,
        plantationDate: dateObj,
        gpsCoordinates: { lat: parseFloat(req.body.lat), lng: parseFloat(req.body.lng) },
        imagePaths,
        declarationAccepted: declarationAccepted === 'true',
        status: PLANTATION_STATUS.PENDING_PANCHAYAT,
        submissionTimestamp: new Date(),
        auditLog: [{ action: 'submitted', userId: req.user.id, timestamp: new Date() }],
      });

      auditLog('PLANTATION_SUBMIT', req.user.id, 'plantation_submitted', {
        plantationId,
        landId: land._id,
        speciesName,
        treeCount,
        areaHectares: areaNum,
      });

      res.status(201).json({
        success: true,
        message: 'Plantation submitted. Pending Panchayat verification.',
        plantation: plantation.toObject(),
      });
    } catch (e) {
      res.status(500).json({ success: false, message: e.message || 'Failed to submit plantation' });
    }
  }
);

export default router;
