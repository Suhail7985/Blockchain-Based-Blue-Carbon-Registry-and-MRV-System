const express = require('express');
const router = express.Router();
const {
  login,
  register,
  getMe
} = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private (should be protected with auth middleware)
router.get('/me', getMe);

module.exports = router;


