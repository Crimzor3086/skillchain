const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: './backend/.env' });

const prisma = new PrismaClient();

/**
 * Seed script for SkillChain platform
 * Creates demo quests and sample data
 */

const sampleQuests = [
  {
    title: "Introduction to Solana Development",
    description: "Learn the basics of Solana blockchain development, including setting up your environment, understanding accounts, and writing your first program.",
    category: "Blockchain",
    difficulty: "beginner",
    estimatedTime: 120,
    requirements: ["Basic programming knowledge", "Node.js installed"],
    learningObjectives: [
      "Understand Solana's account model",
      "Set up Solana development environment",
      "Write and deploy a simple program",
      "Interact with programs using web3.js"
    ],
    content: {
      steps: [
        {
          title: "Environment Setup",
          description: "Install Solana CLI and set up your development environment",
          resources: ["https://docs.solana.com/cli/install-solana-cli-tools"]
        },
        {
          title: "Understanding Accounts",
          description: "Learn about Solana's account model and how data is stored",
          resources: ["https://docs.solana.com/developing/programming-model/accounts"]
        },
        {
          title: "Your First Program",
          description: "Write and deploy a simple 'Hello World' program",
          resources: ["https://docs.solana.com/developing/on-chain-programs/developing-rust"]
        }
      ]
    }
  },
  {
    title: "Smart Contract Security Fundamentals",
    description: "Master the essential security practices for smart contract development, including common vulnerabilities and how to prevent them.",
    category: "Security",
    difficulty: "intermediate",
    estimatedTime: 180,
    requirements: ["Smart contract development experience", "Understanding of blockchain basics"],
    learningObjectives: [
      "Identify common smart contract vulnerabilities",
      "Implement security best practices",
      "Use security analysis tools",
      "Conduct security audits"
    ],
    content: {
      steps: [
        {
          title: "Common Vulnerabilities",
          description: "Learn about reentrancy, overflow, and other common issues",
          resources: ["https://consensys.github.io/smart-contract-best-practices/"]
        },
        {
          title: "Security Tools",
          description: "Use static analysis and testing tools",
          resources: ["https://github.com/crytic/slither"]
        },
        {
          title: "Audit Process",
          description: "Learn how to conduct systematic security reviews",
          resources: ["https://blog.openzeppelin.com/security-audits/"]
        }
      ]
    }
  },
  {
    title: "DeFi Protocol Design",
    description: "Design and implement a decentralized finance protocol, covering tokenomics, liquidity mechanisms, and governance structures.",
    category: "DeFi",
    difficulty: "advanced",
    estimatedTime: 300,
    requirements: ["Advanced smart contract knowledge", "Understanding of financial markets", "Experience with DeFi protocols"],
    learningObjectives: [
      "Design tokenomics for DeFi protocols",
      "Implement automated market makers",
      "Create governance mechanisms",
      "Understand liquidity mining and yield farming"
    ],
    content: {
      steps: [
        {
          title: "Protocol Architecture",
          description: "Design the overall architecture of your DeFi protocol",
          resources: ["https://ethereum.org/en/defi/"]
        },
        {
          title: "AMM Implementation",
          description: "Build an automated market maker with constant product formula",
          resources: ["https://docs.uniswap.org/protocol/V2/concepts/protocol-overview/how-uniswap-works"]
        },
        {
          title: "Governance Token",
          description: "Create and deploy a governance token with voting mechanisms",
          resources: ["https://docs.openzeppelin.com/contracts/4.x/governance"]
        }
      ]
    }
  },
  {
    title: "NFT Marketplace Development",
    description: "Build a complete NFT marketplace with minting, trading, and royalty features using modern web3 technologies.",
    category: "NFT",
    difficulty: "intermediate",
    estimatedTime: 240,
    requirements: ["React/Next.js knowledge", "Smart contract basics", "IPFS understanding"],
    learningObjectives: [
      "Implement NFT minting contracts",
      "Build marketplace smart contracts",
      "Integrate IPFS for metadata storage",
      "Create responsive web3 frontend"
    ],
    content: {
      steps: [
        {
          title: "NFT Contract",
          description: "Create ERC-721 compliant NFT contracts with metadata",
          resources: ["https://docs.openzeppelin.com/contracts/4.x/erc721"]
        },
        {
          title: "Marketplace Logic",
          description: "Implement buying, selling, and auction mechanisms",
          resources: ["https://ethereum.org/en/developers/tutorials/how-to-write-and-deploy-an-nft/"]
        },
        {
          title: "Frontend Integration",
          description: "Build React frontend with wallet integration",
          resources: ["https://web3js.readthedocs.io/"]
        }
      ]
    }
  },
  {
    title: "Web3 Frontend Development",
    description: "Master modern web3 frontend development using React, ethers.js, and popular wallet integrations.",
    category: "Frontend",
    difficulty: "beginner",
    estimatedTime: 150,
    requirements: ["React knowledge", "JavaScript proficiency", "Basic blockchain understanding"],
    learningObjectives: [
      "Integrate wallet connections",
      "Interact with smart contracts from frontend",
      "Handle blockchain state management",
      "Implement responsive web3 UX"
    ],
    content: {
      steps: [
        {
          title: "Wallet Integration",
          description: "Connect MetaMask and other wallets to your dApp",
          resources: ["https://docs.metamask.io/guide/"]
        },
        {
          title: "Contract Interaction",
          description: "Use ethers.js to read and write blockchain data",
          resources: ["https://docs.ethers.io/v5/"]
        },
        {
          title: "State Management",
          description: "Manage blockchain state with React hooks and context",
          resources: ["https://reactjs.org/docs/hooks-intro.html"]
        }
      ]
    }
  },
  {
    title: "Blockchain Data Analytics",
    description: "Learn to analyze blockchain data, create dashboards, and extract insights from on-chain activities.",
    category: "Analytics",
    difficulty: "intermediate",
    estimatedTime: 200,
    requirements: ["Python knowledge", "Data analysis experience", "SQL basics"],
    learningObjectives: [
      "Query blockchain data efficiently",
      "Create analytics dashboards",
      "Identify patterns in DeFi protocols",
      "Build automated monitoring systems"
    ],
    content: {
      steps: [
        {
          title: "Data Sources",
          description: "Connect to blockchain nodes and indexing services",
          resources: ["https://thegraph.com/docs/"]
        },
        {
          title: "Analysis Tools",
          description: "Use Python libraries for blockchain data analysis",
          resources: ["https://web3py.readthedocs.io/"]
        },
        {
          title: "Visualization",
          description: "Create interactive dashboards with Plotly and Streamlit",
          resources: ["https://plotly.com/python/"]
        }
      ]
    }
  }
];

async function seedQuests() {
  console.log('🌱 Seeding quests...');
  
  for (const questData of sampleQuests) {
    try {
      const quest = await prisma.quest.upsert({
        where: { title: questData.title },
        update: questData,
        create: questData,
      });
      console.log(`✅ Created/updated quest: ${quest.title}`);
    } catch (error) {
      console.error(`❌ Error creating quest "${questData.title}":`, error.message);
    }
  }
}

async function seedAdminUser() {
  console.log('👤 Creating admin user...');
  
  try {
    const admin = await prisma.admin.upsert({
      where: { walletAddress: 'ADMIN_WALLET_ADDRESS_HERE' },
      update: {},
      create: {
        walletAddress: 'ADMIN_WALLET_ADDRESS_HERE',
        username: 'admin',
        role: 'admin'
      },
    });
    console.log(`✅ Created/updated admin: ${admin.username}`);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  }
}

async function seedSystemConfig() {
  console.log('⚙️ Setting up system configuration...');
  
  const configs = [
    { key: 'platform_name', value: 'SkillChain' },
    { key: 'platform_version', value: '1.0.0' },
    { key: 'max_quest_attempts', value: '3' },
    { key: 'credential_validity_days', value: '365' },
    { key: 'min_completion_score', value: '80' },
  ];

  for (const config of configs) {
    try {
      await prisma.systemConfig.upsert({
        where: { key: config.key },
        update: { value: config.value },
        create: config,
      });
      console.log(`✅ Set config: ${config.key} = ${config.value}`);
    } catch (error) {
      console.error(`❌ Error setting config "${config.key}":`, error.message);
    }
  }
}

async function main() {
  console.log('🚀 Starting SkillChain database seeding...');
  
  try {
    await seedQuests();
    await seedAdminUser();
    await seedSystemConfig();
    
    console.log('🎉 Database seeding completed successfully!');
    
    // Display summary
    const questCount = await prisma.quest.count();
    const adminCount = await prisma.admin.count();
    const configCount = await prisma.systemConfig.count();
    
    console.log('\n📊 Database Summary:');
    console.log(`   Quests: ${questCount}`);
    console.log(`   Admins: ${adminCount}`);
    console.log(`   Configs: ${configCount}`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle script execution
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, sampleQuests };