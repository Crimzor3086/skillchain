const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const { PublicKey } = require('@solana/web3.js');
const nacl = require('tweetnacl');
const bs58 = require('bs58');

const prisma = new PrismaClient();

/**
 * Verify wallet signature and authenticate user
 */
const authenticateWallet = async (req, res) => {
  try {
    const { walletAddress, signature, message, username } = req.body;

    if (!walletAddress || !signature || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: walletAddress, signature, message'
      });
    }

    // Verify the signature
    try {
      const publicKey = new PublicKey(walletAddress);
      const messageBytes = new TextEncoder().encode(message);
      
      // Handle both base64 and base58 encoded signatures
      let signatureBytes;
      try {
        signatureBytes = Buffer.from(signature, 'base64');
      } catch {
        try {
          signatureBytes = bs58.decode(signature);
        } catch {
          throw new Error('Invalid signature encoding');
        }
      }
      
      const isValid = nacl.sign.detached.verify(
        messageBytes,
        signatureBytes,
        publicKey.toBytes()
      );

      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid signature'
        });
      }
    } catch (signatureError) {
      console.error('Signature verification error:', signatureError);
      return res.status(401).json({
        success: false,
        error: 'Invalid signature format'
      });
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress }
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          walletAddress,
          username: username || `user_${walletAddress.slice(0, 8)}`,
          email: null // Email is optional
        }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        walletAddress: user.walletAddress 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Authentication successful',
      data: {
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt
        },
        token
      }
    });

  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

/**
 * Get authentication challenge message
 */
const getAuthChallenge = async (req, res) => {
  try {
    const { walletAddress } = req.query;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address is required'
      });
    }

    // Generate a unique challenge message
    const timestamp = Date.now();
    const nonce = Math.random().toString(36).substring(2, 15);
    
    const message = `Sign this message to authenticate with SkillChain Platform.

Wallet: ${walletAddress}
Timestamp: ${timestamp}
Nonce: ${nonce}

This request will not trigger any blockchain transaction or cost any gas fees.`;

    res.json({
      success: true,
      data: {
        message,
        timestamp,
        nonce
      }
    });

  } catch (error) {
    console.error('Challenge generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate authentication challenge'
    });
  }
};

/**
 * Verify JWT token and get user info
 */
const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        walletAddress: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Token verification failed'
    });
  }
};

/**
 * Logout user (client-side token removal)
 */
const logout = async (req, res) => {
  // Since we're using stateless JWT, logout is handled client-side
  // This endpoint exists for consistency and future token blacklisting
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

module.exports = {
  authenticateWallet,
  getAuthChallenge,
  verifyToken,
  logout
};