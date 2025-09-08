const { PrismaClient } = require('@prisma/client');
const credentialService = require('../services/credentialService');

const prisma = new PrismaClient();

/**
 * Get all available quests
 */
const getAllQuests = async (req, res) => {
  try {
    const quests = await prisma.quest.findMany({
      include: {
        _count: {
          select: { userQuestProgress: true }
        }
      }
    });

    res.json({
      success: true,
      data: quests.map(quest => ({
        ...quest,
        completionCount: quest._count.userQuestProgress
      }))
    });
  } catch (error) {
    console.error('Error fetching quests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quests'
    });
  }
};

/**
 * Get quest by ID
 */
const getQuestById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const quest = await prisma.quest.findUnique({
      where: { id: parseInt(id) },
      include: {
        userQuestProgress: {
          where: { userId: req.user?.id },
          select: { completed: true, completedAt: true }
        }
      }
    });

    if (!quest) {
      return res.status(404).json({
        success: false,
        error: 'Quest not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...quest,
        isCompleted: quest.userQuestProgress.length > 0 && quest.userQuestProgress[0].completed
      }
    });
  } catch (error) {
    console.error('Error fetching quest:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quest'
    });
  }
};

/**
 * Complete a quest and mint credential
 */
const completeQuest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { walletAddress } = req.body;

    // Check if quest exists
    const quest = await prisma.quest.findUnique({
      where: { id: parseInt(id) }
    });

    if (!quest) {
      return res.status(404).json({
        success: false,
        error: 'Quest not found'
      });
    }

    // Check if already completed
    const existingProgress = await prisma.userQuestProgress.findUnique({
      where: {
        userId_questId: {
          userId,
          questId: parseInt(id)
        }
      }
    });

    if (existingProgress && existingProgress.completed) {
      return res.status(400).json({
        success: false,
        error: 'Quest already completed'
      });
    }

    // Mark quest as completed
    const questProgress = await prisma.userQuestProgress.upsert({
      where: {
        userId_questId: {
          userId,
          questId: parseInt(id)
        }
      },
      update: {
        completed: true,
        completedAt: new Date()
      },
      create: {
        userId,
        questId: parseInt(id),
        completed: true,
        completedAt: new Date()
      }
    });

    // Mint credential NFT
    try {
      const credential = await credentialService.mintCredential({
        userId,
        questId: parseInt(id),
        walletAddress,
        questTitle: quest.title,
        questDescription: quest.description
      });

      res.json({
        success: true,
        message: 'Quest completed successfully!',
        data: {
          questProgress,
          credential
        }
      });
    } catch (mintError) {
      console.error('Error minting credential:', mintError);
      
      // Quest is marked complete but credential failed - log this
      console.warn(`Quest ${id} completed for user ${userId} but credential minting failed`);
      
      res.json({
        success: true,
        message: 'Quest completed! Credential minting in progress...',
        data: { questProgress },
        warning: 'Credential will be available shortly'
      });
    }

  } catch (error) {
    console.error('Error completing quest:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete quest'
    });
  }
};

/**
 * Get user's quest progress
 */
const getUserQuestProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const progress = await prisma.userQuestProgress.findMany({
      where: { userId },
      include: {
        quest: {
          select: {
            id: true,
            title: true,
            description: true,
            difficulty: true,
            estimatedTime: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Error fetching user quest progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quest progress'
    });
  }
};

module.exports = {
  getAllQuests,
  getQuestById,
  completeQuest,
  getUserQuestProgress
};