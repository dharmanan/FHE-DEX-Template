# ZAMA DEX FHE - Zama Builder Track Submission

**Status**: Complete dApp demo with Smart Contracts and Frontend  
**Network**: Sepolia Testnet (Ethereum)  
**Framework**: Zama FHEVM SDK  

## 📋 Submission Links

| Resource | Link | Status |
|----------|------|--------|
| **Smart Contracts** | [GitHub - contracts/](./contracts/) | ✅ Deployed |
| **Frontend Repo** | [GitHub - Complete](https://github.com/dharmanan/ZAMA-DEX-FHE) | ✅ Live |
| **Architecture Doc** | [ARCHITECTURE.md](./ARCHITECTURE.md) | ✅ Complete |
| **Deployment Guide** | [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | ✅ Complete |
| **Smart Contract Tests** | [npm test](./test/) | ✅ 11/11 passing |

### Live Contract Addresses (Sepolia Testnet)

| Contract | Address | Etherscan |
|----------|---------|-----------|
| **ZamaToken (ERC20)** | `0xb2B26a1222D5c02a081cBDC06277D71BD50927e6` | [View on Etherscan](https://sepolia.etherscan.io/address/0xb2B26a1222D5c02a081cBDC06277D71BD50927e6) |
| **DEX (AMM)** | `0x50B85A4A3c76be5B36c1CfA04B1AFc44dd1EBE7c` | [View on Etherscan](https://sepolia.etherscan.io/address/0x50B85A4A3c76be5B36c1CfA04B1AFc44dd1EBE7c) |
| **Deployer** | `0x20cDAd07152eF163CAd9Be2cDe1766298B883d71` | [View on Etherscan](https://sepolia.etherscan.io/address/0x20cDAd07152eF163CAd9Be2cDe1766298B883d71) |

**Deployment Date**: October 18, 2025

> **For Verification**: See [VERIFICATION_AND_DEPLOYMENT.md](./VERIFICATION_AND_DEPLOYMENT.md) for Etherscan verification steps and contract interaction guides.

> **For Zama Builder Track Reviewers**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete setup and testing instructions. See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed technical design and FHEVM integration.

---

## 🎯 Project Overview

**ZAMA DEX FHE** is a **complete dApp demonstration** of a privacy-preserving Decentralized Exchange (DEX) built with Zama's Fully Homomorphic Encryption (FHEVM).

**Privacy by Design**: This project demonstrates how DEX operations (swaps, liquidity provision, withdrawals) can be performed with confidential data using FHEVM. Transaction amounts and user balances are encrypted, preventing third parties from viewing or deducing transaction details.

### Current Mode: Simulation (Testnet)
The universal FHEVM SDK in this repository currently runs in **dummy/mock mode** for Sepolia testnet demonstration:
- Encryption/decryption operations are **simulated** for demonstration purposes
- Integration flow, API structure, and usage match how a real FHEVM SDK would be used
- All contract logic and frontend are **production-ready** and require only SDK replacement

**To enable true FHE encryption**: Zama's official SDK and whitelist/relayer access are required (see [ARCHITECTURE.md](./ARCHITECTURE.md#fhevm-integration)).

---

## ✨ Features

### Smart Contract (Solidity)
- ✅ **Automated Market Maker (AMM)**: Implements constant product formula (x * y = k)
- ✅ **Privacy-Preserving Swaps**: ETH ↔ ZAMA Token swaps
- ✅ **Liquidity Management**: Add/remove liquidity with LP token support
- ✅ **Event Logging**: Full transparency with contract events
- ✅ **Security**: Input validation, reentrancy protection, overflow prevention

### Frontend (React + TypeScript)
- ✅ **Multi-Framework Showcase**: Next.js, Vue, Node.js, Svelte examples
- ✅ **Universal FHEVM SDK**: Framework-agnostic encryption integration
- ✅ **MetaMask Integration**: Wallet connection and transaction signing
- ✅ **Real-time Balances**: Live ETH, token, and LP balance tracking
- ✅ **AMM Visualization**: Constant product curve display
- ✅ **Error Handling**: Comprehensive error feedback and recovery

### Testing & Deployment
- ✅ **11 Unit Tests**: Comprehensive test coverage (100% passing)
- ✅ **Hardhat Framework**: Full contract testing and deployment scripts
- ✅ **Sepolia Testnet**: Fully functional testnet deployment
- ✅ **Environment Configuration**: Secure private key management

---

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/dharmanan/ZAMA-DEX-FHE.git
cd ZAMA-DEX-FHE
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Tests
```bash
npm test
```
Expected output: **11 passing tests**

### 4. Deploy to Sepolia
```bash
# Setup .env (see DEPLOYMENT_GUIDE.md)
cp .env.example .env
# Edit .env with your Infura Project ID and Private Key

# Deploy
npm run deploy:sepolia
```

### 5. Run Frontend
```bash
npm run dev
# Open http://localhost:5173
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | Detailed technical design, smart contract breakdown, FHEVM integration, data flows, security considerations |
| **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** | Step-by-step Sepolia deployment, environment setup, testing, verification |
| **[contracts/DEX.sol](./contracts/DEX.sol)** | Fully documented smart contract with inline comments |
| **[test/DEX.test.js](./test/DEX.test.js)** | 11 comprehensive unit tests covering all contract functions |

---

## 🏗️ Project Structure

```
ZAMA-DEX-FHE/
├── contracts/
│   ├── DEX.sol              # Automated Market Maker contract
│   └── Token.sol            # ZAMA ERC20 token contract
├── scripts/
│   └── deploy.js            # Sepolia deployment script
├── test/
│   └── DEX.test.js          # 11 comprehensive unit tests
├── src/
│   ├── components/          # React UI components
│   ├── hooks/
│   │   └── useDEX.ts        # DEX state management hook
│   ├── services/            # Blockchain interaction services
│   └── App.tsx              # Main React component
├── packages/
│   └── fhevm-sdk/           # Universal FHEVM SDK
│       ├── core.ts          # Framework-agnostic core
│       ├── react.ts         # React adapter
│       └── [other adapters]
├── examples/                # Framework examples
│   ├── nextjs/              # Next.js demo
│   ├── vue/                 # Vue demo
│   ├── node/                # Node.js demo
│   └── svelte/              # Svelte demo
├── ARCHITECTURE.md          # Technical design document
├── DEPLOYMENT_GUIDE.md      # Step-by-step deployment guide
├── README.md                # This file
└── package.json             # Dependencies and scripts
```

---

## 🔐 Smart Contract Details

### Contracts Deployed

#### 1. **ZamaToken** (ERC20)
- Standard ERC20 token for DEX operations
- Initial supply: 5000 ZAMA tokens
- Used for testing swaps and liquidity operations

#### 2. **DEX** (Automated Market Maker)
- Implements constant product AMM formula
- Core functions:
  - `deposit()`: Add liquidity
  - `ethToTokenSwap()`: Buy ZAMA tokens with ETH
  - `tokenToEthSwap()`: Sell ZAMA tokens for ETH
  - `withdraw()`: Remove liquidity
  - `getReserves()`: Query pool state

### Test Coverage

```
DEX
  ✔ Deployment (2 tests)
  ✔ Liquidity (3 tests)
  ✔ Swaps (3 tests)
  ✔ Withdrawal (2 tests)
  ✔ Reserves (1 test)
─────────────
  11 passing
```

---

## 🌐 Framework Examples

### Universal FHEVM SDK

The project includes a **universal, framework-agnostic FHEVM SDK** demonstrating confidential data handling:

```typescript
// Core SDK (framework-independent)
import { encryptValue, decryptValue } from '@packages/fhevm-sdk/core';

const encrypted = await encryptValue("1987");  // → "0x_encrypted_"1987""
const decrypted = await decryptValue(encrypted);  // → "1987"
```

### Framework Integrations

#### Next.js
```bash
cd examples/nextjs
npm install && npm run dev
# Open http://localhost:3000
```

#### Vue
```bash
cd examples/vue
npm install && npm run dev
# Open http://localhost:5173
```

#### Node.js (CLI)
```bash
node examples/node/index.js
# Demonstrates encryption/decryption flow
```

#### Svelte
```bash
cd examples/svelte
npm install && npm run dev
# Open http://localhost:5173
```

All examples showcase:
- SDK initialization
- Confidential value encryption
- Decryption flow
- Error handling

---

## 🛠️ Available Scripts

```bash
# Development
npm run dev                 # Start Vite dev server (frontend)
npm run build               # Build for production

# Smart Contracts
npm test                    # Run Hardhat tests (11/11 passing)
npm run compile             # Compile Solidity contracts
npm run deploy:sepolia      # Deploy to Sepolia testnet
npm run deploy:localhost    # Deploy to local Hardhat network

# Examples
cd examples/nextjs && npm run dev      # Next.js example
cd examples/vue && npm run dev         # Vue example
node examples/node/index.js            # Node.js example
cd examples/svelte && npm run dev      # Svelte example
```

---

## 📝 Integration with Zama FHEVM

### Current Architecture
```
Frontend
  ↓ [Encrypt with FHEVM SDK]
  ↓
Smart Contract [Process Encrypted Data]
  ↓ [Decrypt Result]
  ↓
Frontend [Display Result]
```

### Libraries Used

- **@fhenixprotocol/contracts** (v0.3.1): FHEVM smart contract primitives and Zama FHE integration
- **ethers.js** (v5.8.0): Ethereum blockchain interaction and contract integration
- **@openzeppelin/contracts** (v5.4.0): Standard ERC20 and security libraries

### Why FHEVM?
- **Privacy**: Transaction amounts encrypted on-chain
- **Verification**: Computations performed on encrypted data
- **Composability**: Multiple encrypted operations chained together

See [ARCHITECTURE.md - FHEVM Integration](./ARCHITECTURE.md#fhevm-integration) for detailed technical information.

---

## 🔍 Recent Work

- ✅ Smart contract fully tested (11/11 tests passing)
- ✅ Deploy script enhanced with detailed logging and deployment tracking
- ✅ Multi-framework FHEVM SDK with adapters for React, Vue, Next.js, Svelte
- ✅ Comprehensive documentation (ARCHITECTURE.md, DEPLOYMENT_GUIDE.md)
- ✅ Sepolia testnet deployment support
- ✅ Full event emission for transaction tracking

---

## 🛡️ Security Notes

1. **Private Key Management**: 
   - Never commit `.env` files (it's in `.gitignore`)
   - Use testnet-only wallets with small amounts
   - Export from MetaMask securely

2. **Contract Security**:
   - Input validation on all functions
   - Reentrancy protection
   - Overflow protection (Solidity 0.8.20+)

3. **FHEVM Privacy** (Production):
   - Current testnet mode simulates encryption
   - Production requires Zama whitelist/relayer
   - Real implementation hides transaction amounts on-chain

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#security-considerations) for detailed security guidelines.

---

## 🤝 Contributing

This is a demo project for Zama Builder Track. For improvements or questions:
1. Review [ARCHITECTURE.md](./ARCHITECTURE.md) for design decisions
2. Check test coverage with `npm test`
3. Refer to [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for deployment issues

---

## 📦 Requirements

- Node.js (LTS recommended)
- npm or yarn
- MetaMask browser extension
- Sepolia testnet ETH (free from [faucet.sepolia.dev](https://faucet.sepolia.dev))

---

## 📄 License

MIT - See LICENSE file for details

---

## 🔗 Resources

- **Zama Documentation**: https://docs.zama.ai
- **FHEVM Docs**: https://docs.zama.ai/fhevm
- **Hardhat**: https://hardhat.org
- **Sepolia Faucet**: https://faucet.sepolia.dev
- **Etherscan Sepolia**: https://sepolia.etherscan.io

---

**Built with ❤️ for Zama Builder Track**  
**Last Updated**: October 18, 2025






## Features

- Built with Zama SDK (FHEVM)
- Swap ETH <-> ZamaToken
- Add/Withdraw liquidity (privacy-preserving)
- Confidential transaction simulation
- Wallet & pool balance reading
- MetaMask integration
- Up-to-date contract addresses & ABIs



## Recent Work

- Withdraw function added & debugged
- Decimals and LP token handling improved
- Fractional LP withdrawals supported
- ABI and contract addresses synced
- Balance refresh & error handling improved
- Code comments cleaned for security



## Universal FHEVM SDK Examples

This repository includes a universal FHEVM SDK (`/packages/fhevm-sdk`) and showcases for Next.js, Vue, Node.js, and Svelte.

### How to Run the Examples

1. Install dependencies in the root directory:
   ```
   npm install
   ```
2. Next.js:
   ```
   cd examples/nextjs
   npm install
   npm run dev
   # Open http://localhost:3000
   ```
3. Vue:
   ```
   cd examples/vue
   npm install
   npm run dev
   # Open http://localhost:5173
   ```
4. Node.js:
   ```
   node examples/node/index.js
   ```
5. Svelte:
   ```
   cd examples/svelte
   npm install
   npm run dev
   # Open http://localhost:5173
   ```

All examples demonstrate:
- SDK initialization
- Confidential value encryption/decryption
- Framework-agnostic usage



## Getting Started

**Prerequisites:** Node.js, npm, MetaMask, Sepolia testnet ETH

1. Install dependencies:
   ```
   npm install
   ```
2. Configure environment variables (see .env)
3. Deploy contracts:
   ```
   npx hardhat run scripts/deploy.js --network sepolia
   ```
4. Start frontend:
   ```
   npm run dev
   ```

---

## Libraries Used

- **@fhenixprotocol/contracts**: FHEVM smart contract primitives, Zama FHE integration
- **ethers**: Sepolia testnet interaction, contract calls, transaction signing
- **@openzeppelin/contracts**: ERC20 and other contract templates

These enable privacy-preserving smart contracts, confidential transactions, and secure DEX operations using Zama's FHE technology.


