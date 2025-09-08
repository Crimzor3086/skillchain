const express = require('express');
const { 
  getCredentialById, 
  verifyCredential, 
  getCredentialMetadata, 
  getCredentialImage, 
  getAllCredentials 
} = require('../controllers/credentialController');

const router = express.Router();

/**
 * @route   GET /api/credentials
 * @desc    Get all credentials (paginated)
 * @access  Public
 */
router.get('/', getAllCredentials);

/**
 * @route   GET /api/credentials/:id
 * @desc    Get credential by ID
 * @access  Public
 */
router.get('/:id', getCredentialById);

/**
 * @route   GET /api/credentials/:id/image
 * @desc    Get credential image (SVG)
 * @access  Public
 */
router.get('/:id/image', getCredentialImage);

/**
 * @route   GET /api/credentials/verify/:tokenMint
 * @desc    Verify credential authenticity on blockchain
 * @access  Public
 */
router.get('/verify/:tokenMint', verifyCredential);

/**
 * @route   GET /api/credentials/metadata/:tokenMint
 * @desc    Get credential metadata (NFT standard format)
 * @access  Public
 */
router.get('/metadata/:tokenMint', getCredentialMetadata);

module.exports = router;