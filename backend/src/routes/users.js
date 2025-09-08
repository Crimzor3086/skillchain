const express = require('express');
const { 
  getUserProfile, 
  updateUserProfile, 
  getUserCredentials, 
  getLeaderboard 
} = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/users/leaderboard
 * @desc    Get platform leaderboard
 * @access  Public
 */
router.get('/leaderboard', getLeaderboard);

/**
 * @route   GET /api/users/:id
 * @desc    Get user profile by ID
 * @access  Public (limited info) / Private (full info for own profile)
 */
router.get('/:id', authenticateToken, getUserProfile);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user profile
 * @access  Private (own profile only)
 */
router.put('/:id', authenticateToken, updateUserProfile);

/**
 * @route   GET /api/users/:id/credentials
 * @desc    Get user's credentials (Skill Passport)
 * @access  Public
 */
router.get('/:id/credentials', getUserCredentials);

module.exports = router;