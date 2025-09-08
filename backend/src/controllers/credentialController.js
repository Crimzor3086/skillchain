const { PrismaClient } = require('@prisma/client');
const credentialService = require('../services/credentialService');

const prisma = new PrismaClient();

/**
 * Get credential by ID
 */
const getCredentialById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const credential = await prisma.credential.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            walletAddress: true
          }
        },
        quest: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            difficulty: true
          }
        }
      }
    });

    if (!credential) {
      return res.status(404).json({
        success: false,
        error: 'Credential not found'
      });
    }

    res.json({
      success: true,
      data: credential
    });
  } catch (error) {
    console.error('Error fetching credential:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch credential'
    });
  }
};

/**
 * Verify credential authenticity
 */
const verifyCredential = async (req, res) => {
  try {
    const { tokenMint } = req.params;
    
    // Verify on-chain
    const onChainData = await credentialService.verifyCredentialOnChain(tokenMint);
    
    if (!onChainData.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Credential not found on blockchain'
      });
    }

    // Get credential from database
    const credential = await prisma.credential.findUnique({
      where: { tokenMint },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            walletAddress: true
          }
        },
        quest: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            difficulty: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: {
        credential,
        onChainData,
        isValid: true,
        verifiedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error verifying credential:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify credential'
    });
  }
};

/**
 * Get credential metadata
 */
const getCredentialMetadata = async (req, res) => {
  try {
    const { tokenMint } = req.params;
    
    const credential = await prisma.credential.findUnique({
      where: { tokenMint },
      include: {
        user: {
          select: {
            username: true,
            walletAddress: true
          }
        },
        quest: {
          select: {
            title: true,
            description: true,
            category: true,
            difficulty: true
          }
        }
      }
    });

    if (!credential) {
      return res.status(404).json({
        success: false,
        error: 'Credential not found'
      });
    }

    // Return NFT metadata format
    const metadata = {
      name: `${credential.quest.title} - SkillChain Credential`,
      description: `This credential certifies that ${credential.user.username} has successfully completed the "${credential.quest.title}" quest on SkillChain Platform.`,
      image: `${process.env.BASE_URL}/api/credentials/${credential.id}/image`,
      external_url: `${process.env.BASE_URL}/credentials/${credential.id}`,
      attributes: [
        {
          trait_type: "Quest Title",
          value: credential.quest.title
        },
        {
          trait_type: "Category",
          value: credential.quest.category
        },
        {
          trait_type: "Difficulty",
          value: credential.quest.difficulty
        },
        {
          trait_type: "Earned By",
          value: credential.user.username
        },
        {
          trait_type: "Completion Date",
          value: credential.mintedAt.toISOString().split('T')[0]
        },
        {
          trait_type: "Platform",
          value: "SkillChain"
        }
      ],
      properties: {
        category: "credential",
        questId: credential.questId,
        userId: credential.userId,
        mintedAt: credential.mintedAt.toISOString(),
        soulbound: true
      }
    };

    res.json(metadata);
  } catch (error) {
    console.error('Error fetching credential metadata:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch credential metadata'
    });
  }
};

/**
 * Generate credential image (placeholder)
 */
const getCredentialImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const credential = await prisma.credential.findUnique({
      where: { id: parseInt(id) },
      include: {
        quest: {
          select: {
            title: true,
            category: true,
            difficulty: true
          }
        },
        user: {
          select: {
            username: true
          }
        }
      }
    });

    if (!credential) {
      return res.status(404).json({
        success: false,
        error: 'Credential not found'
      });
    }

    // For now, return a simple SVG
    // In production, you might want to use a proper image generation library
    const svg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#grad1)" rx="15"/>
        <text x="200" y="50" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="white">SkillChain Credential</text>
        <text x="200" y="100" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="white">${credential.quest.title}</text>
        <text x="200" y="140" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="#e2e8f0">Category: ${credential.quest.category}</text>
        <text x="200" y="160" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="#e2e8f0">Difficulty: ${credential.quest.difficulty}</text>
        <text x="200" y="200" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="white">Earned by: ${credential.user.username}</text>
        <text x="200" y="240" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#cbd5e0">Minted: ${credential.mintedAt.toISOString().split('T')[0]}</text>
        <text x="200" y="270" font-family="Arial, sans-serif" font-size="10" text-anchor="middle" fill="#a0aec0">Soulbound NFT - Non-transferable</text>
      </svg>
    `;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  } catch (error) {
    console.error('Error generating credential image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate credential image'
    });
  }
};

/**
 * Get all credentials (admin/public view)
 */
const getAllCredentials = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, difficulty } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (category) {
      where.quest = { category };
    }
    if (difficulty) {
      where.quest = { ...where.quest, difficulty };
    }

    const credentials = await prisma.credential.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            walletAddress: true
          }
        },
        quest: {
          select: {
            id: true,
            title: true,
            category: true,
            difficulty: true
          }
        }
      },
      orderBy: { mintedAt: 'desc' },
      skip,
      take: parseInt(limit)
    });

    const total = await prisma.credential.count({ where });

    res.json({
      success: true,
      data: {
        credentials,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching credentials:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch credentials'
    });
  }
};

module.exports = {
  getCredentialById,
  verifyCredential,
  getCredentialMetadata,
  getCredentialImage,
  getAllCredentials
};