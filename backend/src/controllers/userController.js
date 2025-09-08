const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Get user profile
 */
const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUserId = req.user?.id;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        walletAddress: true,
        username: true,
        email: requestingUserId === parseInt(id) ? true : false, // Only show email to self
        createdAt: true,
        updatedAt: true,
        userQuestProgress: {
          where: { completed: true },
          include: {
            quest: {
              select: {
                id: true,
                title: true,
                difficulty: true,
                category: true
              }
            }
          }
        },
        credentials: {
          select: {
            id: true,
            tokenMint: true,
            questId: true,
            mintedAt: true,
            metadataUri: true,
            quest: {
              select: {
                title: true,
                category: true,
                difficulty: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Calculate user stats
    const stats = {
      totalQuestsCompleted: user.userQuestProgress.length,
      totalCredentials: user.credentials.length,
      categoriesCompleted: [...new Set(user.userQuestProgress.map(p => p.quest.category))].length,
      difficultyBreakdown: user.userQuestProgress.reduce((acc, progress) => {
        const difficulty = progress.quest.difficulty;
        acc[difficulty] = (acc[difficulty] || 0) + 1;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: {
        ...user,
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile'
    });
  }
};

/**
 * Update user profile
 */
const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUserId = req.user.id;
    const { username, email } = req.body;

    // Users can only update their own profile
    if (requestingUserId !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        error: 'You can only update your own profile'
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        ...(username && { username }),
        ...(email && { email })
      },
      select: {
        id: true,
        walletAddress: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'Username or email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
};

/**
 * Get user's credentials (Skill Passport)
 */
const getUserCredentials = async (req, res) => {
  try {
    const { id } = req.params;
    
    const credentials = await prisma.credential.findMany({
      where: { userId: parseInt(id) },
      include: {
        quest: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            difficulty: true
          }
        }
      },
      orderBy: { mintedAt: 'desc' }
    });

    // Group credentials by category for better display
    const credentialsByCategory = credentials.reduce((acc, credential) => {
      const category = credential.quest.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(credential);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        credentials,
        credentialsByCategory,
        totalCredentials: credentials.length,
        categories: Object.keys(credentialsByCategory)
      }
    });
  } catch (error) {
    console.error('Error fetching user credentials:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch credentials'
    });
  }
};

/**
 * Get leaderboard
 */
const getLeaderboard = async (req, res) => {
  try {
    const { limit = 10, category } = req.query;

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        walletAddress: true,
        userQuestProgress: {
          where: {
            completed: true,
            ...(category && {
              quest: {
                category: category
              }
            })
          },
          include: {
            quest: {
              select: {
                category: true,
                difficulty: true
              }
            }
          }
        },
        credentials: {
          select: {
            id: true
          }
        }
      },
      take: parseInt(limit)
    });

    // Calculate scores and sort
    const leaderboard = users
      .map(user => {
        const questsCompleted = user.userQuestProgress.length;
        const credentialsEarned = user.credentials.length;
        
        // Simple scoring: 1 point per quest, bonus for difficulty
        const score = user.userQuestProgress.reduce((total, progress) => {
          const basePoints = 1;
          const difficultyMultiplier = {
            'beginner': 1,
            'intermediate': 2,
            'advanced': 3
          };
          return total + basePoints * (difficultyMultiplier[progress.quest.difficulty] || 1);
        }, 0);

        return {
          id: user.id,
          username: user.username,
          walletAddress: user.walletAddress,
          questsCompleted,
          credentialsEarned,
          score
        };
      })
      .sort((a, b) => b.score - a.score)
      .map((user, index) => ({ ...user, rank: index + 1 }));

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard'
    });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserCredentials,
  getLeaderboard
};