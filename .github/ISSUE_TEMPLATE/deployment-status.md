---
name: "📋 Deployment Status"
about: "Track deployment status and contract addresses"
labels: ["deployment", "documentation"]
---

## Deployment Information

### Sepolia Testnet - October 18, 2025

#### Contract Addresses
- **ZamaToken**: `0xb2B26a1222D5c02a081cBDC06277D71BD50927e6`
- **DEX**: `0x50B85A4A3c76be5B36c1CfA04B1AFc44dd1EBE7c`
- **Deployer**: `0x20cDAd07152eF163CAd9Be2cDe1766298B883d71`

#### Verification Status
- [ ] ZamaToken verified on Etherscan
- [ ] DEX verified on Etherscan
- [ ] Contract interactions tested on Etherscan UI

#### Links
- [ZamaToken on Etherscan](https://sepolia.etherscan.io/address/0xb2B26a1222D5c02a081cBDC06277D71BD50927e6)
- [DEX on Etherscan](https://sepolia.etherscan.io/address/0x50B85A4A3c76be5B36c1CfA04B1AFc44dd1EBE7c)

#### Frontend Testing
- [ ] Connected to MetaMask on Sepolia
- [ ] Able to add liquidity
- [ ] Able to perform swaps
- [ ] Able to withdraw liquidity

### Documentation References
- [VERIFICATION_AND_DEPLOYMENT.md](../../VERIFICATION_AND_DEPLOYMENT.md) - Etherscan verification guide
- [DEPLOYMENT_GUIDE.md](../../DEPLOYMENT_GUIDE.md) - Full deployment walkthrough
- [ARCHITECTURE.md](../../ARCHITECTURE.md) - Technical architecture

---

## Checklist for Zama Builder Track Submission

- [x] Smart contracts deployed to Sepolia
- [x] Contracts compiled and tested locally (11/11 passing)
- [x] GitHub repository public with full source code
- [x] Frontend implementation (React + TypeScript)
- [x] FHEVM SDK integrated (4 framework examples)
- [x] Complete documentation (ARCHITECTURE, DEPLOYMENT, VERIFICATION guides)
- [x] Test coverage comprehensive
- [ ] Contracts verified on Etherscan (manual verification pending)
- [ ] Video walkthrough (optional but recommended)
- [ ] Deployment URLs live and testable

---

## Commands for Reference

```bash
# Deploy
npm run deploy:sepolia

# Test
npm test

# Frontend
npm run dev

# Verify (after Etherscan API key setup)
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```
