const express = require('express');
const { 
  getAllQuests, 
  getQuestById, 
  completeQuest, 
  getUserQuestProgress 
} = require('../controllers/questController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/quests
 * @desc    Get all available quests
 * @access  Public
 */
router.get('/', getAllQuests);

/**
 * @route   GET /api/quests/progress
 * @desc    Get current user's quest progress
 * @access  Private
 */
router.get('/progress', authenticateToken, getUserQuestProgress);

/**
 * @route   GET /api/quests/:id
 * @desc    Get quest by ID
 * @access  Public (basic info) / Private (includes user progress)
 */
router.get('/:id', getQuestById);

/**
 * @route   POST /api/quests/:id/complete
 * @desc    Complete a quest and mint credential
 * @access  Private
 */
router.post('/:id/complete', authenticateToken, completeQuest);

module.exports = router;