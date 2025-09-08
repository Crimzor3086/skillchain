# SkillChain Platform

A Web3-powered credentialing platform where users complete learning quests, earn blockchain-verified credentials (soulbound NFTs), and showcase them in a tamper-proof Skill Passport.

## 🚀 Tech Stack

- **Frontend**: Next.js + TailwindCSS, Solana wallet adapter
- **Backend**: Node.js (Express), PostgreSQL/Prisma ORM, IPFS for metadata
- **Contracts**: Rust + Anchor framework (Solana programs)
- **Blockchain**: Solana (fast, low-cost credential issuance)

## 📁 Project Structure

```
skillchain/
├── backend/          # API & server logic
├── contracts/        # Solana smart contracts (Rust/Anchor)
├── frontend/         # Web app (Next.js + Tailwind)
├── scripts/          # Helper scripts
└── docs/            # Documentation
```

## 🛠️ Quick Start

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **PostgreSQL** - [Installation guide](https://www.postgresql.org/download/)
- **Solana CLI** (optional) - For smart contract deployment
- **Anchor CLI** (optional) - For smart contract development

### 🚀 One-Command Setup

```bash
git clone <repo-url>
cd skillchain
npm run setup
```

This will:
- Install all dependencies
- Create environment files
- Check prerequisites
- Provide next steps

### 📋 Manual Setup

1. **Clone and install dependencies**
   ```bash
   git clone <repo-url>
   cd skillchain
   npm install
   ```

2. **Set up database**
   ```bash
   # Create PostgreSQL database
   createdb skillchain_db
   
   # Update DATABASE_URL in backend/.env
   # Then run migrations
   npm run db:setup
   ```

3. **Seed the database**
   ```bash
   npm run db:seed
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

   This starts:
   - Backend API at http://localhost:3001
   - Frontend at http://localhost:3000

### Individual Components

#### Backend API
```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:3001
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:3000
```

#### Smart Contracts
```bash
cd contracts
anchor build
anchor test
anchor deploy --provider.cluster localnet
```

## 🔧 Scripts

- `npm run dev` - Start all services in development
- `npm run build` - Build all components
- `npm run deploy` - Deploy contracts to Solana
- `npm run seed` - Seed database with demo quests
- `npm run test` - Run all tests

## 📚 API Endpoints

- `GET /api/quests` - List available quests
- `POST /api/quests/:id/complete` - Complete a quest
- `GET /api/users/:id/credentials` - Get user credentials
- `POST /api/credentials/mint` - Mint new credential NFT

## 🎯 Features

- **Quest System**: Interactive learning challenges
- **Soulbound NFTs**: Non-transferable credential tokens
- **Skill Passport**: Showcase verified achievements
- **Wallet Integration**: Phantom, Solflare support
- **IPFS Storage**: Decentralized metadata storage

## 🚀 Deployment

See individual component READMEs for deployment instructions:
- [Backend Deployment](./backend/README.md)
- [Frontend Deployment](./frontend/README.md)
- [Contract Deployment](./contracts/README.md)

## 📖 Documentation

- [Architecture Overview](./docs/architecture.md)
- [API Documentation](./docs/api.md)
- [Smart Contract Guide](./docs/contracts.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.