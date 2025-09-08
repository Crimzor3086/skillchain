const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Deployment script for SkillChain platform
 * Handles deployment of smart contracts to Solana
 */

const NETWORKS = {
  localnet: 'localnet',
  devnet: 'devnet',
  mainnet: 'mainnet-beta'
};

async function main() {
  const network = process.argv[2] || 'localnet';
  
  if (!Object.values(NETWORKS).includes(network)) {
    console.error(`Invalid network: ${network}`);
    console.error(`Available networks: ${Object.values(NETWORKS).join(', ')}`);
    process.exit(1);
  }

  console.log(`🚀 Deploying SkillChain to ${network}...`);

  try {
    // Change to contracts directory
    process.chdir('./contracts');

    // Build the program
    console.log('📦 Building Anchor program...');
    execSync('anchor build', { stdio: 'inherit' });

    // Deploy to specified network
    console.log(`🌐 Deploying to ${network}...`);
    execSync(`anchor deploy --provider.cluster ${network}`, { stdio: 'inherit' });

    // Get program ID
    const programIdPath = path.join(__dirname, '../contracts/target/deploy/skillchain-keypair.json');
    if (fs.existsSync(programIdPath)) {
      const keypair = JSON.parse(fs.readFileSync(programIdPath, 'utf8'));
      const programId = keypair[0]; // This is a simplified example
      console.log(`✅ Program deployed with ID: ${programId}`);
      
      // Update environment files
      updateEnvFiles(programId, network);
    }

    console.log('🎉 Deployment completed successfully!');
    
    // Run tests if on localnet
    if (network === 'localnet') {
      console.log('🧪 Running tests...');
      execSync('anchor test --skip-deploy', { stdio: 'inherit' });
    }

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

function updateEnvFiles(programId, network) {
  console.log('📝 Updating environment files...');
  
  // Update backend .env
  const backendEnvPath = path.join(__dirname, '../backend/.env');
  if (fs.existsSync(backendEnvPath)) {
    let envContent = fs.readFileSync(backendEnvPath, 'utf8');
    envContent = envContent.replace(
      /PROGRAM_ID=.*/,
      `PROGRAM_ID=${programId}`
    );
    envContent = envContent.replace(
      /SOLANA_NETWORK=.*/,
      `SOLANA_NETWORK=${network}`
    );
    fs.writeFileSync(backendEnvPath, envContent);
    console.log('✅ Updated backend/.env');
  }

  // Update frontend environment
  const frontendEnvPath = path.join(__dirname, '../frontend/.env.local');
  const frontendEnvContent = `NEXT_PUBLIC_PROGRAM_ID=${programId}
NEXT_PUBLIC_SOLANA_NETWORK=${network}
NEXT_PUBLIC_SOLANA_RPC_URL=${getRpcUrl(network)}
`;
  fs.writeFileSync(frontendEnvPath, frontendEnvContent);
  console.log('✅ Updated frontend/.env.local');
}

function getRpcUrl(network) {
  switch (network) {
    case 'localnet':
      return 'http://localhost:8899';
    case 'devnet':
      return 'https://api.devnet.solana.com';
    case 'mainnet-beta':
      return 'https://api.mainnet-beta.solana.com';
    default:
      return 'https://api.devnet.solana.com';
  }
}

// Handle script execution
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };