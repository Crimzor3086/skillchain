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

    // Get quest details for metadata
    const quest = await prisma.quest.findUnique({
      where: { id: questId }
    });

    if (!quest) {
      throw new Error('Quest not found');
    }

    // Create metadata for IPFS
    const metadata = {
      name: `${questTitle} - SkillChain Credential`,
      description: `This credential certifies successful completion of "${questTitle}" on SkillChain Platform. This is a soulbound NFT that cannot be transferred and serves as permanent proof of skill achievement.`,
      image: `${process.env.BASE_URL || 'http://localhost:3001'}/api/credentials/image/placeholder`,
      external_url: `${process.env.BASE_URL || 'http://localhost:3001'}/credentials/verify`,
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
          trait_type: "Category",
          value: quest.category
        },
        {
          trait_type: "Difficulty",
          value: quest.difficulty
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
        },
        {
          trait_type: "Completion Date",
          value: new Date().toISOString().split('T')[0]
        }
      ],
      properties: {
        category: "credential",
        questId: questId,
        userId: userId,
        soulbound: true,
        blockchain: "solana",
        standard: "spl-token"
      }
    };

    // Upload metadata to IPFS
    const metadataUri = await ipfsService.uploadMetadata(metadata);
    console.log(`Metadata uploaded to IPFS: ${metadataUri}`);

    // Generate a realistic-looking Solana token mint address for demo
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

    // In a production environment, this is where you would:
    // 1. Load the server wallet keypair from environment variables
    // 2. Create a new mint account for the credential
    // 3. Call the Solana program to mint the soulbound NFT
    // 4. Update the database with the actual token mint address
    
    // Example of what the Solana integration would look like:
    /*
    try {
      const serverKeypair = Keypair.fromSecretKey(
        Buffer.from(process.env.SERVER_WALLET_PRIVATE_KEY, 'base64')
      );
      
      const program = getCredentialProgram();
      const mintKeypair = Keypair.generate();
      
      const tx = await program.methods
        .mintCredential(
          new BN(questId),
          metadataUri,
          questTitle,
          "SKILL"
        )
        .accounts({
          recipient: new PublicKey(walletAddress),
          mint: mintKeypair.publicKey,
          // ... other accounts
        })
        .signers([serverKeypair, mintKeypair])
        .rpc();
        
      // Update database with actual mint address
      await prisma.credential.update({
        where: { id: credential.id },
        data: { tokenMint: mintKeypair.publicKey.toString() }
      });
      
      console.log(`Credential minted on Solana: ${tx}`);
    } catch (solanaError) {
      console.error('Solana minting failed:', solanaError);
      // For demo purposes, continue with placeholder
    }
    */

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