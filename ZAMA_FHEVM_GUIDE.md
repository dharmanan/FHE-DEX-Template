# Zama FHEVM Deployment Guide

This guide explains how to deploy the FHEDEX DEX to **Zama FHEVM** testnet.

## 🎯 Overview

**Zama FHEVM** is a fully homomorphic encryption virtual machine that allows encrypted computations directly on-chain.

- **Solidity Support**: ^0.8.24
- **Encrypted Types**: euint8, euint16, euint32, euint64, euint128, euint256
- **Network**: Sepolia Testnet (Zama infrastructure)
- **ChainId**: 8008
- **RPC**: https://testnet-rpc.zama.ai:8545

## 📋 Key Differences: Fhenix vs Zama FHEVM

| Feature | Fhenix | Zama FHEVM |
|---------|--------|-----------|
| **Solidity** | ^0.8.20 | ^0.8.24 |
| **Contract** | FHEDEX.sol | FHEDEX_Zama.sol |
| **Encrypted Type** | euint32 | euint64 |
| **Decryption** | Synchronous `FHE.decrypt()` | Asynchronous Oracle callbacks |
| **API** | Direct operations | Request-response model |
| **State** | Private config | SepoliaConfig inheritance |

## 🛠️ Prerequisites

```bash
# 1. Install dependencies
npm install

# Both Fhenix and Zama packages are already included:
# - @fhenixprotocol/contracts@0.3.1 (Fhenix)
# - @fhevm/solidity@0.8.0 (Zama FHEVM)
# - @zama-fhe/oracle-solidity (Oracle infrastructure)

# 2. Setup environment
cp .env.example .env
# Add your PRIVATE_KEY to .env
```

## 📦 Contract Structure

### FHEDEX_Zama.sol

```solidity
contract FHEDEX is SepoliaConfig {
    // Encrypted state using euint64
    euint64 private ethReserve;
    euint64 private tokenReserve;
    
    // Key functions:
    // - initializePool(tokenAmount)
    // - addLiquidity(tokenAmount)  
    // - removeLiquidity(lpAmount)
    // - swapEthForToken()
    // - swapTokenForEth(tokenAmount)
}
```

**Note**: Full arithmetic operations (division, complex swaps) require Oracle callbacks for decryption. Current version demonstrates encrypted state management and basic liquidity operations.

## 🚀 Deployment Steps

### Step 1: Verify Compilation

```bash
npx hardhat compile --force

# Expected output:
# Compiled 16 Solidity files successfully (evm target: paris).
```

### Step 2: Deploy Token (ZamaToken.sol)

```bash
npx hardhat run scripts/deploy.js --network zama_fhevm
```

This deploys:
- **ZamaToken**: ERC20 token with 1M supply
- Saves addresses to deployment logs

### Step 3: Deploy FHEDEX (FHEDEX_Zama.sol)

Create `scripts/deploy-zama.js`:

```javascript
const hre = require("hardhat");

async function main() {
  console.log("Deploying FHEDEX_Zama to Zama FHEVM...");
  
  // Deploy token first
  const Token = await hre.ethers.getContractFactory("ZamaToken");
  const token = await Token.deploy();
  await token.deployed();
  console.log("ZamaToken deployed:", token.address);
  
  // Deploy FHEDEX
  const FHEDEX = await hre.ethers.getContractFactory(
    "contracts/FHEDEX_Zama.sol:FHEDEX"
  );
  const dex = await FHEDEX.deploy(token.address);
  await dex.deployed();
  console.log("FHEDEX deployed:", dex.address);
  
  // Save addresses
  const fs = require("fs");
  const addresses = {
    token: token.address,
    dex: dex.address,
    network: "zama_fhevm",
    chainId: 8008,
    timestamp: new Date().toISOString()
  };
  fs.writeFileSync(
    "deployment-zama.json",
    JSON.stringify(addresses, null, 2)
  );
  console.log("Deployment saved to deployment-zama.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

Run deployment:

```bash
npx hardhat run scripts/deploy-zama.js --network zama_fhevm
```

### Step 4: Initialize Pool

Create `scripts/init-zama-pool.js`:

```javascript
const hre = require("hardhat");
const addresses = require("./deployment-zama.json");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  // Get contract instances
  const Token = await hre.ethers.getContractFactory("ZamaToken");
  const token = Token.attach(addresses.token);
  
  const DEX = await hre.ethers.getContractFactory(
    "contracts/FHEDEX_Zama.sol:FHEDEX"
  );
  const dex = DEX.attach(addresses.dex);
  
  // Initial liquidity amounts
  const ethAmount = hre.ethers.utils.parseEther("1"); // 1 ETH
  const tokenAmount = hre.ethers.utils.parseUnits("1000", 18); // 1000 tokens
  
  // Approve token transfer
  console.log("Approving token transfer...");
  await token.approve(dex.address, tokenAmount);
  
  // Initialize pool
  console.log("Initializing pool...");
  const tx = await dex.initializePool(tokenAmount, { value: ethAmount });
  await tx.wait();
  
  console.log("✅ Pool initialized!");
  console.log(`  ETH: ${hre.ethers.utils.formatEther(ethAmount)}`);
  console.log(`  Token: ${hre.ethers.utils.formatUnits(tokenAmount, 18)}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

## 🧪 Testing

```bash
# Test both Fhenix and Zama versions
npm test

# Expected: 6/6 tests passing ✅
```

## 🔍 Verification

After deployment, verify on Zama explorer (when available):

```bash
# Check contract code
npx hardhat verify <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS> --network zama_fhevm
```

## 📊 Oracle Callback Architecture

For full swap functionality, the contract needs to handle Oracle callbacks:

```solidity
// In production:
1. User calls swapEthForToken()
2. Contract requests decryption: FHE.requestDecryption(handles, selector, gasAmount)
3. Oracle processes request off-chain
4. Relayer submits callback with decrypted result
5. Contract callback handler executes transfer
```

Current version demonstrates encrypted state management. Full Oracle integration is next phase.

## 🐛 Troubleshooting

### "Contract FHEDEX not found"
```bash
# Use fully qualified name
hardhat: "contracts/FHEDEX_Zama.sol:FHEDEX"
```

### "SepoliaConfig not found"
```bash
# Ensure @fhevm/solidity is installed
npm install @fhevm/solidity@0.8.0
```

### Network connection issues
```bash
# Verify RPC endpoint
curl https://testnet-rpc.zama.ai:8545 \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
# Expected: chainId 8008 (0x1f48)
```

## 📚 Resources

- **Zama FHEVM Docs**: https://docs.zama.ai/fhevm
- **GitHub Repository**: https://github.com/zama-ai/fhevm
- **Contract Examples**: https://github.com/zama-ai/fhevm/tree/main/examples
- **Oracle Documentation**: https://docs.zama.ai/fhevm/tutorials/oracle-callbacks

## ✅ Deployment Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Private key in `.env`
- [ ] Contracts compile (`npm run compile`)
- [ ] Tests pass (`npm test`)
- [ ] Deploy token contract
- [ ] Deploy DEX contract
- [ ] Approve token spending
- [ ] Initialize liquidity pool
- [ ] Verify on Zama explorer
- [ ] Test swap functions

## 🚀 Next Steps

1. **Implement Oracle Callbacks**: Full encrypted swap execution
2. **Add Relayer Pattern**: Automated callback handling
3. **Deploy Frontend**: Connect React UI to Zama testnet
4. **Mainnet Preparation**: Plan migration to Zama mainnet

---

**Status**: ✅ Ready for Zama testnet  
**Last Updated**: October 18, 2025
