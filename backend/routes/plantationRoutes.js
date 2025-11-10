const express = require('express');
const router = express.Router();
const {
  getAllPlantations,
  getPlantationById,
  createPlantation,
  updatePlantation,
  deletePlantation
} = require('../controllers/plantationController');

// @route   GET /api/plantations
// @desc    Get all plantations
// @access  Public
router.get('/', getAllPlantations);

// @route   GET /api/plantations/:id
// @desc    Get single plantation by ID
// @access  Public
router.get('/:id', getPlantationById);

// @route   POST /api/plantations
// @desc    Create new plantation
// @access  Public
router.post('/', createPlantation);

// @route   PATCH /api/plantations/:id
// @desc    Update plantation (for verification)
// @access  Public (should be protected with admin auth)
router.patch('/:id', updatePlantation);

// @route   DELETE /api/plantations/:id
// @desc    Delete plantation
// @access  Public (should be protected with admin auth)
router.delete('/:id', deletePlantation);

module.exports = router;


