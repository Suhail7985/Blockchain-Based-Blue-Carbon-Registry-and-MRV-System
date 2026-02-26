import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import TempUser from '../models/TempUser.js';
import { sendOTPEmail } from '../utils/emailService.js';
import { generateOTP, isOTPExpired } from '../utils/otpGenerator.js';
import { hashOTP, compareOTP } from '../utils/hashOTP.js';
import { otpRateLimiter, verifyRateLimiter } from '../middleware/rateLimiter.js';
import { loginRateLimiter } from '../middleware/loginLimiter.js';
import { protect, generateToken } from '../middleware/auth.js';
import cookieParser from 'cookie-parser';

const router = express.Router();
router.use(cookieParser());

// Send OTP to email
router.post(
  '/send-otp',
  otpRateLimiter,
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { email } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists',
        });
      }

      // Generate OTP
      const otp = generateOTP();
      const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Hash OTP before storing
      const hashedOTP = await hashOTP(otp);

      // Delete any existing TempUser for this email
      await TempUser.deleteOne({ email });

      // Save TempUser with hashed OTP
      const tempUser = new TempUser({
        email,
        otp: hashedOTP,
        otpExpires,
        attempts: 0,
      });
      await tempUser.save();

      // Send OTP via email
      await sendOTPEmail(email, otp);

      res.status(200).json({
        success: true,
        message: 'An OTP has been sent to your registered email address.',
        email: email,
        expiresAt: otpExpires.toISOString(),
      });
    } catch (error) {
      console.error('Error sending OTP:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again later.',
      });
    }
  }
);

// Verify OTP
router.post(
  '/verify-otp',
  verifyRateLimiter,
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('otp')
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage('OTP must be a 6-digit number'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { email, otp } = req.body;

      // Find TempUser
      const tempUser = await TempUser.findOne({ email });

      if (!tempUser) {
        return res.status(400).json({
          success: false,
          message: 'No OTP found for this email. Please request a new one.',
        });
      }

      // Check if OTP is expired
      if (new Date() > tempUser.otpExpires) {
        await TempUser.deleteOne({ _id: tempUser._id });
        return res.status(400).json({
          success: false,
          message: 'OTP has expired. Please request a new one.',
        });
      }

      // Check attempts (max 5 failed attempts)
      if (tempUser.attempts >= 5) {
        await TempUser.deleteOne({ _id: tempUser._id });
        return res.status(400).json({
          success: false,
          message: 'Too many failed attempts. Please request a new OTP.',
        });
      }

      // Verify OTP (compare hashed)
      const isOTPValid = await compareOTP(otp, tempUser.otp);

      if (!isOTPValid) {
        // Increment attempts
        tempUser.attempts += 1;
        await tempUser.save();

        return res.status(400).json({
          success: false,
          message: `Invalid OTP. ${5 - tempUser.attempts} attempts remaining.`,
        });
      }

      // OTP is valid - delete TempUser
      await TempUser.deleteOne({ _id: tempUser._id });

      res.status(200).json({
        success: true,
        message: 'OTP verified successfully',
        email: email,
      });
    } catch (error) {
      console.error('Error verifying OTP:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify OTP. Please try again later.',
      });
    }
  }
);

// Complete registration
router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
      .withMessage('Password must contain uppercase, lowercase, number, and special character'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { email, name, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists',
        });
      }

      // Verify that OTP was verified (TempUser should be deleted after verification)
      // In production, you might want to use sessions or tokens here

      // Create user - PROFILE_INCOMPLETE until KYC submitted
      const user = new User({
        email,
        name,
        password, // Will be hashed by pre-save hook
        isEmailVerified: true,
        isVerified: false,
        accountStatus: 'PROFILE_INCOMPLETE',
        role: 'citizen',
        statusTimeline: [
          { step: 'Email Verified', completed: true, completedAt: new Date() },
          { step: 'Profile Submitted', completed: false },
          { step: 'Panchayat Approved', completed: false },
          { step: 'NCCR Approved', completed: false },
        ],
      });

      await user.save();

      // Generate token
      const token = generateToken(user._id);

      // Set HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000, // 1 hour
      });

      const userResponse = {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        accountStatus: user.accountStatus,
        isEmailVerified: user.isEmailVerified,
        referenceId: user.referenceId,
        statusTimeline: user.statusTimeline,
        createdAt: user.createdAt,
      };

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please complete your profile and login to continue.',
        user: userResponse,
        token: token, // Also send in response for localStorage if needed
      });
    } catch (error) {
      console.error('Error completing registration:', error);
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists',
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to create account. Please try again later.',
      });
    }
  }
);

// Login
router.post(
  '/login',
  loginRateLimiter,
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .notEmpty()
      .withMessage('Please provide a password'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { email, password, rememberMe } = req.body;

      // Find user and include password
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Check if email is verified (OTP completed during registration)
      if (!user.isEmailVerified) {
        return res.status(403).json({
          success: false,
          message: 'Please verify your email before logging in.',
        });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Generate token
      const token = generateToken(user._id);

      // Set HTTP-only cookie
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      };

      if (rememberMe) {
        cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      } else {
        cookieOptions.maxAge = 60 * 60 * 1000; // 1 hour
      }

      res.cookie('token', token, cookieOptions);

      // Reload user without password for full profile
      const fullUser = await User.findById(user._id).select('-password');
      const userResponse = {
        id: fullUser._id,
        email: fullUser.email,
        name: fullUser.name,
        role: fullUser.role,
        accountStatus: fullUser.accountStatus,
        isEmailVerified: fullUser.isEmailVerified,
        dateOfBirth: fullUser.dateOfBirth,
        referenceId: fullUser.referenceId,
        statusTimeline: fullUser.statusTimeline,
        phone: fullUser.phone,
        address: fullUser.address,
        state: fullUser.state,
        district: fullUser.district,
        ngoName: fullUser.ngoName,
        ngoRegistrationNumber: fullUser.ngoRegistrationNumber,
        ownershipType: fullUser.ownershipType,
        aadhaarDocumentPath: fullUser.aadhaarDocumentPath,
        aadhaarUploadedAt: fullUser.aadhaarUploadedAt,
        aadhaarNameMatch: fullUser.aadhaarNameMatch,
        aadhaarDobMatch: fullUser.aadhaarDobMatch,
        identityVerifiedAt: fullUser.identityVerifiedAt,
        landDocumentPath: fullUser.landDocumentPath,
        landAreaHectares: fullUser.landAreaHectares,
        rejectionReason: fullUser.rejectionReason,
        createdAt: fullUser.createdAt,
      };

      res.status(200).json({
        success: true,
        message: 'Login successful',
        user: userResponse,
        token: token,
      });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to login. Please try again later.',
      });
    }
  }
);

// Get current user
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        accountStatus: user.accountStatus,
        isEmailVerified: user.isEmailVerified,
        dateOfBirth: user.dateOfBirth,
        referenceId: user.referenceId,
        statusTimeline: user.statusTimeline,
        phone: user.phone,
        address: user.address,
        state: user.state,
        district: user.district,
        ngoName: user.ngoName,
        ngoRegistrationNumber: user.ngoRegistrationNumber,
        ownershipType: user.ownershipType,
        declarationAccepted: user.declarationAccepted,
        aadhaarDocumentPath: user.aadhaarDocumentPath,
        aadhaarUploadedAt: user.aadhaarUploadedAt,
        aadhaarNameMatch: user.aadhaarNameMatch,
        aadhaarDobMatch: user.aadhaarDobMatch,
        identityVerifiedAt: user.identityVerifiedAt,
        landDocumentPath: user.landDocumentPath,
        landAreaHectares: user.landAreaHectares,
        rejectionReason: user.rejectionReason,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user information',
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

export default router;
