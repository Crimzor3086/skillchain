const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const { Program, AnchorProvider, Wallet } = require('@project-serum/anchor');
const { PrismaClient } = require('@prisma/client');
const ipfsService = require('./ipfsService');

const prisma = new PrismaClient();

// Initialize Solana connection
const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com');

/**
 * Mint a new credential NFT
 */
const mintCredential = async ({ userId, questId, walletAddress, questTitle, questDescription }) => {
  try {
    console.log(`Minting credential for user ${userId}, quest ${questId}`);

    // Create metadata for IPFS
    const metadata = {
      name: `${questTitle} - SkillChain Credential`,
      description: `This credential certifies successful completion of "${questTitle}" on SkillChain Platform.`,
      image: `${process.env.BASE_URL}/api/credentials/placeholder/image`, // Will be updated after DB save
      external_url: `${process.env.BASE_URL}/credentials/placeholder`, // Will be updated after DB save
      attributes: [
        {
          trait_type: "Quest Title",
          value: questTitle
        },
        {
          trait_type: "Quest ID",
          value: questId.toString()
        },
        {
          trait_type: "Platform",
          value: "SkillChain"
        },
        {
          trait_type: "Type",
          value: "Credential"
        },
        {
          trait_type: "Soulbound",
          value: "true"
        }
      ],
      properties: {
        category: "credential",
        questId: questId,
        userId: userId,
        soulbound: true
      }
    };

    // Upload metadata to IPFS
    const metadataUri = await ipfsService.uploadMetadata(metadata);
    console.log(`Metadata uploaded to IPFS: ${metadataUri}`);

    // For now, we'll create a placeholder token mint
    // In production, this would interact with the actual Solana program
    const tokenMint = generatePlaceholderTokenMint();

    // Save credential to database
    const credential = await prisma.credential.create({
      data: {
        userId,
        questId,
        tokenMint,
        metadataUri,
        mintedAt: new Date()
      },
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
            category: true,
            difficulty: true
          }
        }
      }
    });

    console.log(`Credential saved to database with ID: ${credential.id}`);

    // TODO: Implement actual Solana program interaction
    // This would involve:
    // 1. Loading the server wallet keypair
    // 2. Creating the mint account
    // 3. Calling the credential program to mint the soulbound NFT
    // 4. Updating the database with the actual token mint address

    return {
      id: credential.id,
      tokenMint: credential.tokenMint,
      metadataUri: credential.metadataUri,
      mintedAt: credential.mintedAt,
      quest: credential.quest,
      user: credential.user
    };

  } catch (error) {
    console.error('Error minting credential:', error);
    throw new Error(`Failed to mint credential: ${error.message}`);
  }
};

/**
 * Verify credential exists on blockchain
 */
const verifyCredentialOnChain = async (tokenMint) => {
  try {
    // TODO: Implement actual on-chain verification
    // This would involve:
    // 1. Querying the Solana blockchain for the token mint
    // 2. Verifying it was created by our program
    // 3. Checking the metadata matches our records
    
    // For now, return placeholder verification
    const credential = await prisma.credential.findUnique({
      where: { tokenMint }
    });

    return {
      isValid: !!credential,
      tokenMint,
      owner: credential?.user?.walletAddress || null,
      metadata: credential?.metadataUri || null,
      verifiedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error verifying credential on-chain:', error);
    return {
      isValid: false,
      error: error.message
    };
  }
};

/**
 * Get credential program instance
 */
const getCredentialProgram = () => {
  try {
    // TODO: Load actual program IDL and create program instance
    // This would involve:
    // 1. Loading the program IDL (Interface Definition Language)
    // 2. Creating an AnchorProvider with the server wallet
    // 3. Instantiating the Program with the IDL and provider
    
    console.log('Getting credential program instance...');
    
    // Placeholder for now
    return null;
  } catch (error) {
    console.error('Error getting credential program:', error);
    throw error;
  }
};

/**
 * Generate placeholder token mint address
 * In production, this would be the actual mint address from Solana
 */
const generatePlaceholderTokenMint = () => {
  // Generate a valid-looking Solana address for development
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 44; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Transfer credential (should fail for soulbound tokens)
 */
const transferCredential = async (tokenMint, fromWallet, toWallet) => {
  // Soulbound tokens should not be transferable
  throw new Error('Soulbound credentials cannot be transferred');
};

/**
 * Burn credential (admin function)
 */
const burnCredential = async (tokenMint, authorityWallet) => {
  try {
    // TODO: Implement credential burning on Solana
    // This would involve calling the burn instruction on our program
    
    console.log(`Burning credential: ${tokenMint}`);
    
    // Update database
    await prisma.credential.update({
      where: { tokenMint },
      data: {
        burnedAt: new Date()
      }
    });

    return {
      success: true,
      tokenMint,
      burnedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error burning credential:', error);
    throw error;
  }
};

module.exports = {
  mintCredential,
  verifyCredentialOnChain,
  getCredentialProgram,
  transferCredential,
  burnCredential
};