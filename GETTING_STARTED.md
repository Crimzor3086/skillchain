# 🚀 Getting Started with SkillChain

Welcome to SkillChain! This guide will help you get the platform running locally for development and testing.

## 📋 Prerequisites

Before you begin, make sure you have:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **PostgreSQL** - [Installation guide](https://www.postgresql.org/download/)
- **Git** - [Download here](https://git-scm.com/)

### Optional (for smart contract development):
- **Solana CLI** - [Installation guide](https://docs.solana.com/cli/install-solana-cli-tools)
- **Anchor CLI** - [Installation guide](https://www.anchor-lang.com/docs/installation)
- **Rust** - [Installation guide](https://rustup.rs/)

## 🏃‍♂️ Quick Start (5 minutes)

### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd skillchain
npm run setup
```

### 2. Configure Database
```bash
# Create a PostgreSQL database
createdb skillchain_db

# Update the DATABASE_URL in backend/.env
# Example: DATABASE_URL="postgresql://username:password@localhost:5432/skillchain_db"

# Run database migrations
npm run db:setup
```

### 3. Seed Sample Data
```bash
npm run db:seed
```

### 4. Start Development Servers
```bash
npm run dev
```

### 5. Test Everything Works
```bash
npm run test-setup
```

## 🌐 Access Your Platform

Once everything is running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health
- **Quests API**: http://localhost:3001/api/quests

## 🎮 Using the Platform

### For Learners

1. **Connect Wallet**
   - Visit http://localhost:3000
   - Click "Connect Wallet"
   - Use Phantom wallet (recommended for Solana)

2. **Browse Quests**
   - Go to the Quests page
   - Filter by category or difficulty
   - Click on a quest to view details

3. **Complete Quests**
   - Click "Complete Quest" on any quest page
   - This will mint a credential NFT (demo mode)
   - View your credentials in the Passport section

4. **View Skill Passport**
   - Go to the Passport page
   - See all your earned credentials
   - Share your profile with others

### For Developers

1. **API Endpoints**
   ```bash
   # Get all quests
   curl http://localhost:3001/api/quests
   
   # Get quest by ID
   curl http://localhost:3001/api/quests/1
   
   # Health check
   curl http://localhost:3001/health
   ```

2. **Database Access**
   ```bash
   # View database with Prisma Studio
   cd backend
   npx prisma studio
   ```

3. **Smart Contract Development**
   ```bash
   # Build contracts
   cd contracts
   anchor build
   
   # Test contracts
   anchor test
   
   # Deploy to devnet
   npm run deploy devnet
   ```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/skillchain_db"

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Solana
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet
PROGRAM_ID=Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS

# IPFS (optional)
PINATA_API_KEY=your-pinata-api-key
PINATA_SECRET_API_KEY=your-pinata-secret-key
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_PROGRAM_ID=Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
```

## 🐛 Troubleshooting

### Common Issues

#### "Database connection failed"
```bash
# Make sure PostgreSQL is running
brew services start postgresql  # macOS
sudo service postgresql start   # Linux

# Create the database
createdb skillchain_db

# Check your DATABASE_URL in backend/.env
```

#### "Port 3000 already in use"
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
cd frontend
PORT=3001 npm run dev
```

#### "Wallet connection issues"
- Make sure you have Phantom wallet installed
- Switch to Solana Devnet in your wallet
- Clear browser cache and cookies

#### "IPFS upload failed"
- The platform works without IPFS (uses mock data)
- For real IPFS, sign up at [Pinata](https://pinata.cloud/)
- Add your API keys to backend/.env

### Getting Help

1. **Check the logs**
   ```bash
   # Backend logs
   cd backend && npm run dev
   
   # Frontend logs
   cd frontend && npm run dev
   ```

2. **Test your setup**
   ```bash
   npm run test-setup
   ```

3. **Reset everything**
   ```bash
   # Reset database
   cd backend
   npx prisma migrate reset
   
   # Reinstall dependencies
   rm -rf node_modules */node_modules
   npm run setup
   ```

## 🚀 Deployment

### Local Development
Already covered above! Just run `npm run dev`.

### Production Deployment

1. **Smart Contracts to Mainnet**
   ```bash
   # Configure for mainnet
   solana config set --url mainnet-beta
   
   # Deploy (requires SOL for fees)
   npm run deploy mainnet
   ```

2. **Backend to Cloud**
   - Deploy to Railway, Heroku, or AWS
   - Set up production PostgreSQL database
   - Configure environment variables

3. **Frontend to Vercel/Netlify**
   - Connect your GitHub repo
   - Set environment variables
   - Deploy automatically on push

## 📚 Next Steps

- **Customize Quests**: Edit `scripts/seed.js` to add your own quests
- **Modify UI**: Update components in `frontend/components/`
- **Add Features**: Extend the API in `backend/src/`
- **Deploy Smart Contracts**: Use `npm run deploy devnet`
- **Add IPFS**: Configure Pinata for real metadata storage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Happy coding! 🎉**

If you run into any issues, check the troubleshooting section above or create an issue in the repository.