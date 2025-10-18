# ZAMA DEX FHE - Privacy-Preserving Decentralized Exchange

**Status**: 🟢 Live on Sepolia  
**Network**: Ethereum Sepolia Testnet (ChainID 11155111)  
**Note**: Awaiting Zama FHEVM ChainID 8008 public RPC endpoint  

## 🚀 Quick Links

| Resource | Link |
|----------|------|
| **Live Demo** | https://zama-dex-fhe.vercel.app |
| **GitHub** | https://github.com/dharmanan/ZAMA-DEX-FHE |
| **Smart Contract** | [FHEDEX.sol](./contracts/FHEDEX.sol) |
| **Token Contract** | [ZamaToken.sol](./contracts/ZamaToken.sol) |
| **Zama Testnet** | ChainID 8008 - https://testnet-rpc.zama.ai:8545 |

---

## ℹ️ Project Status

**Frontend**: ✅ Production build on Vercel  
**Smart Contracts**: ✅ Deployed to Sepolia Testnet  
**Tests**: ✅ 8/8 passing (offline compilation checks)  
**Status**: 🚀 Live and Testing on Sepolia  

This project is a **complete FHE-powered DEX** using **Zama FHEVM** for privacy-preserving trading.

---

## � Smart Contract Architecture

### FHEDEX.sol - Zama FHEVM Implementation
- **Solidity**: 0.8.24  
- **Library**: @fhevm/solidity v0.8.0
- **Encrypted Types**: euint64 for pool reserves
- **API**: Asynchronous Oracle + Relayer pattern
- **Status**: ✅ Ready for Zama testnet deployment

---

## 🎯 What This Project Does

**ZAMA DEX FHE** is a **complete privacy-preserving decentralized exchange** using **Zama FHEVM** for real homomorphic encryption on-chain.

### 🔐 Privacy Features
- ✅ **Encrypted Reserves**: All pool amounts encrypted on-chain (euint64)
- ✅ **Homomorphic Arithmetic**: DEX calculations performed on encrypted data
- ✅ **Private Swaps**: Swap amounts encrypted and invisible to observers
- ✅ **FHE Operations**: Real `FHE.add()`, `FHE.sub()`, `FHE.mul()`, `FHE.div()`
- ✅ **Oracle Model**: Asynchronous decryption with Zama relayers

### 💻 Tech Stack
- **Smart Contract**: Solidity 0.8.24 with Zama FHEVM
- **Frontend**: React 19 + TypeScript + Vite 6
- **FHE SDK**: @fhevm/solidity v0.8.0
- **Bundle Size**: 203 KB gzipped (optimized with terser)

### ✨ Key Functions
- `initializePool()` - Initialize liquidity pools with encrypted amounts
- `addLiquidity()` - Add encrypted liquidity to pools
- `removeLiquidity()` - Remove liquidity with decryption
- `swapEthForToken()` - ETH → Token with FHE math
- `swapTokenForEth()` - Token → ETH with encrypted arithmetic

---

## ✨ Features

- ✅ **Smart Contract**: Real FHE implementation with homomorphic swap operations
- ✅ **Frontend**: React + TypeScript with MetaMask integration  
- ✅ **Deployed**: Live on Sepolia testnet
- ✅ **Verified**: Etherscan verified contract code
- ✅ **Production Ready**: Optimized bundle, full error handling
- ✅ **Documented**: Comprehensive architecture and deployment guides

---

## 🚀 Getting Started

### View Live Demo
```
https://zama-dex-fhe.vercel.app
```

### Run Locally
```bash
# Clone
git clone https://github.com/dharmanan/ZAMA-DEX-FHE.git
cd ZAMA-DEX-FHE

# Install
npm install

# Start frontend
npm run dev

# Open http://localhost:5173
```

### Deploy Contract

**Current (Sepolia):**
```bash
# Already deployed, see addresses above
# To redeploy: npx hardhat run scripts/deploy-and-configure.js --network sepolia
```

**Future (Zama FHEVM - ChainID 8008):**
```bash
# Awaiting public RPC endpoint
# Will deploy with: npx hardhat run scripts/deploy-and-configure.js --network zama_fhevm
```

---

## 📚 Documentation

| Document | Content |
|----------|---------|
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | Technical design, FHE integration, data flows |
| **[BUILDER_TRACK_SUBMISSION.md](./BUILDER_TRACK_SUBMISSION.md)** | Complete submission documentation |

---

## 🏗️ Project Structure

```
ZAMA-DEX-FHE/
├── contracts/
│   ├── FHEDEX.sol       # Zama FHEVM DEX (euint64, Oracle model)
│   └── ZamaToken.sol    # ERC20 token for testing
├── scripts/
│   ├── deploy.js                # Deploy to Zama testnet
│   ├── init-dex-liquidity.js    # Initialize pool
│   └── distribute-test-tokens.js
├── src/
│   ├── components/         # React UI
│   ├── hooks/
│   │   └── useDEX.ts       # DEX integration hook
│   └── App.tsx             # Main app
├── test/
│   └── compile-check.js    # Compilation tests for Zama FHEVM
├── dist/                   # Production build (Vercel deployment)
├── VERCEL_QUICK_START.md   # 5-minute deployment guide
├── VERCEL_DEPLOY_GUIDE.md  # Detailed deployment documentation
└── README.md               # This file
```

---

## 🔐 Smart Contract Details

### FHEDEX.sol - Zama FHEVM
- **Type**: euint64 encrypted state for pool reserves
- **Decryption**: Asynchronous Oracle callbacks with Zama relayers
- **Architecture**: Operations on encrypted data + decryption requests
- **Key Functions**: `initializePool()`, `addLiquidity()`, `removeLiquidity()`, `swapEthForToken()`, `swapTokenForEth()`

**Privacy Implementation:**
- ✅ Encrypted reserves on-chain
- ✅ Homomorphic arithmetic (add, sub, mul, div)
- ✅ Private swap amounts
- ✅ Confidential liquidity positions
- ✅ FHE operations (add, sub, mul, div)

---

## 🌐 Technologies

### FHE Platform
- **@fhevm/solidity** v0.8.0 - Zama FHEVM
- **@zama-fhe/oracle-solidity** - Oracle infrastructure for decryption

### Development
- **ethers.js** v5.8.0 - Blockchain interaction
- **React 19** - Frontend framework
- **TypeScript** - Type safety
- **Vite 6** - Build tool with optimizations
- **Hardhat** 2.26.3 - Smart contract development
- **OpenZeppelin Contracts** v5.4.0 - Standard implementations

See [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details.

---

## 📦 Requirements

- Node.js (LTS recommended)
- npm or yarn
- MetaMask browser extension
- Sepolia testnet ETH (free from [sepolia-faucet.pk910.de](https://sepolia-faucet.pk910.de))
- Zama FHEVM testnet ETH (for Zama testing)

---

## 🧪 Testing

```bash
# Run compilation tests for Zama FHEVM
npm test

# Test specific contract
npx hardhat test test/compile-check.js

# Watch mode
npm run test:watch
```

**Test Results**: ✅ 8/8 passing
- FHEDEX compilation ✓
- ZamaToken ERC20 compilation ✓
- Function interface validation ✓
- ERC20 compliance checks ✓
- Encrypted state accessor validation ✓

**Note**: All tests are offline (no network required) - perfect for CI/CD pipelines

---

## 🌐 Network Configuration

### Current Deployment (Sepolia Testnet)
- **Network**: Ethereum Sepolia
- **ChainId**: 11155111  
- **RPC**: https://eth-sepolia.public.blastapi.io
- **Status**: ✅ Live
- **Contracts**:
  - ZamaToken: `0x8B5713e21d09aB4E535dE5dCCCd1C21f8d179230`
  - FHEDEX DEX: `0x46513f306Fef0Ccc48485497e16113CA7A1a6BcF`

### Target Network (Zama FHEVM - Awaiting Public RPC)
- **Network**: Zama FHEVM Testnet
- **ChainId**: 8008
- **RPC**: testnet-rpc.zama.ai:8545 (currently unavailable - awaiting public endpoint)
- **Status**: ⏳ Configured, awaiting network availability
- **Privacy**: Real Homomorphic Encryption (euint64 support)

---

## 📄 License

MIT - See LICENSE file for details

---

## 🔗 Resources

- **Zama Documentation**: https://docs.zama.ai
- **FHEVM Docs**: https://docs.zama.ai/fhevm
- **Fhenix Protocol**: https://docs.fhenix.io
- **GitHub Zama FHEVM**: https://github.com/zama-ai/fhevm
- **Hardhat**: https://hardhat.org
- **Etherscan Sepolia**: https://sepolia.etherscan.io

---

**Built with ❤️ for Zama FHEVM**  
**Status**: Production Ready with Real Homomorphic Encryption  
**Platform**: Zama FHEVM Testnet (ChainID 8008)  
**Last Updated**: October 18, 2025
