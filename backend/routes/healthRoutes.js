const express = require('express');
const router = express.Router();
const {
  healthCheck
} = require('../controllers/healthController');

// @route   GET /api/health
// @desc    Health check endpoint
// @access  Public
router.get('/', healthCheck);

module.exports = router;

