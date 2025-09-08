const express = require('express');
const { 
  authenticateWallet, 
  getAuthChallenge, 
  verifyToken, 
  logout 
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/auth/challenge
 * @desc    Get authentication challenge message for wallet signing
 * @access  Public
 */
router.get('/challenge', getAuthChallenge);

/**
 * @route   POST /api/auth/wallet
 * @desc    Authenticate user with wallet signature
 * @access  Public
 */
router.post('/wallet', authenticateWallet);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify JWT token and get user info
 * @access  Private
 */
router.get('/verify', verifyToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
router.post('/logout', authenticateToken, logout);

module.exports = router;