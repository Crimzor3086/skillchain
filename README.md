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

- Node.js 18+
- Rust & Cargo
- Solana CLI
- Anchor CLI
- PostgreSQL

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repo-url>
   cd skillchain
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your database and API keys
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```

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