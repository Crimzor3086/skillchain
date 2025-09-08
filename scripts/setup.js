const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Setup script for SkillChain platform
 * Helps users get the platform running quickly
 */

async function main() {
  console.log('🚀 Setting up SkillChain platform...\n');

  try {
    // Check Node.js version
    console.log('📋 Checking prerequisites...');
    const nodeVersion = process.version;
    console.log(`   Node.js version: ${nodeVersion}`);
    
    if (parseInt(nodeVersion.slice(1)) < 18) {
      console.error('❌ Node.js 18+ is required');
      process.exit(1);
    }

    // Install root dependencies
    console.log('\n📦 Installing root dependencies...');
    execSync('npm install', { stdio: 'inherit' });

    // Install backend dependencies
    console.log('\n📦 Installing backend dependencies...');
    execSync('cd backend && npm install', { stdio: 'inherit' });

    // Install frontend dependencies
    console.log('\n📦 Installing frontend dependencies...');
    execSync('cd frontend && npm install', { stdio: 'inherit' });

    // Check if PostgreSQL is available
    console.log('\n🗄️  Checking database...');
    try {
      execSync('psql --version', { stdio: 'pipe' });
      console.log('   ✅ PostgreSQL found');
    } catch (error) {
      console.log('   ⚠️  PostgreSQL not found. You\'ll need to install it:');
      console.log('      macOS: brew install postgresql');
      console.log('      Ubuntu: sudo apt-get install postgresql');
      console.log('      Windows: Download from https://www.postgresql.org/download/');
    }

    // Setup environment files
    console.log('\n⚙️  Setting up environment files...');
    setupEnvironmentFiles();

    // Check Solana CLI
    console.log('\n🔗 Checking Solana CLI...');
    try {
      const solanaVersion = execSync('solana --version', { encoding: 'utf8' });
      console.log(`   ✅ ${solanaVersion.trim()}`);
    } catch (error) {
      console.log('   ⚠️  Solana CLI not found. Install it for full functionality:');
      console.log('      sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"');
    }

    // Check Anchor CLI
    console.log('\n⚓ Checking Anchor CLI...');
    try {
      const anchorVersion = execSync('anchor --version', { encoding: 'utf8' });
      console.log(`   ✅ ${anchorVersion.trim()}`);
    } catch (error) {
      console.log('   ⚠️  Anchor CLI not found. Install it for smart contract deployment:');
      console.log('      curl -sSf https://install.anchor-lang.com | sh');
    }

    console.log('\n🎉 Setup completed successfully!\n');
    
    console.log('📋 Next steps:');
    console.log('   1. Set up your database:');
    console.log('      - Create a PostgreSQL database named "skillchain_db"');
    console.log('      - Update DATABASE_URL in backend/.env');
    console.log('      - Run: cd backend && npx prisma migrate dev');
    console.log('');
    console.log('   2. Seed the database:');
    console.log('      - Run: npm run seed');
    console.log('');
    console.log('   3. Start the development servers:');
    console.log('      - Run: npm run dev');
    console.log('      - Backend will be at http://localhost:3001');
    console.log('      - Frontend will be at http://localhost:3000');
    console.log('');
    console.log('   4. (Optional) Deploy smart contracts:');
    console.log('      - Configure Solana CLI: solana config set --url devnet');
    console.log('      - Get some SOL: solana airdrop 2');
    console.log('      - Deploy: npm run deploy devnet');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

function setupEnvironmentFiles() {
  // Backend .env
  const backendEnvPath = path.join(__dirname, '../backend/.env');
  if (!fs.existsSync(backendEnvPath)) {
    const backendEnvContent = `# Server Configuration
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/skillchain_db"

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Solana Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet
PROGRAM_ID=Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS

# IPFS Configuration (Optional - will use mock if not configured)
IPFS_API_URL=https://ipfs.infura.io:5001
IPFS_API_KEY=your-ipfs-api-key
IPFS_API_SECRET=your-ipfs-api-secret

# Pinata (Alternative IPFS provider)
PINATA_API_KEY=your-pinata-api-key
PINATA_SECRET_API_KEY=your-pinata-secret-key

# CORS Origins
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Base URL for metadata
BASE_URL=http://localhost:3001
`;
    fs.writeFileSync(backendEnvPath, backendEnvContent);
    console.log('   ✅ Created backend/.env');
  } else {
    console.log('   ✅ Backend .env already exists');
  }

  // Frontend .env.local
  const frontendEnvPath = path.join(__dirname, '../frontend/.env.local');
  if (!fs.existsSync(frontendEnvPath)) {
    const frontendEnvContent = `NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_PROGRAM_ID=Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
`;
    fs.writeFileSync(frontendEnvPath, frontendEnvContent);
    console.log('   ✅ Created frontend/.env.local');
  } else {
    console.log('   ✅ Frontend .env.local already exists');
  }
}

// Handle script execution
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };