# ZAMA DEX FHE - Production Deployment Guide

## 📋 Overview

This guide covers deploying the FHEDEX (Privacy-Preserving DEX) to the Zama FHEVM testnet (ChainID 8008).

## ✅ Prerequisites

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables

Create/update `.env` file with:

```env
PRIVATE_KEY=0x<your-private-key>
INFURA_PROJECT_ID=<optional-for-other-networks>
```

**IMPORTANT**: Never commit `.env` to version control!

### 3. Test on Local Hardhat Network

```bash
# Run all tests
npm test

# Expected output: 25/25 tests passing
# - 8 compilation/interface tests
# - 17 end-to-end callback flow tests
```

## 🚀 Deployment Steps

### Step 1: Compile Contracts

```bash
npm run build
```

Verify:
- ✅ No TypeScript errors
- ✅ Contracts compile successfully
- ✅ 212 modules transformed

### Step 2: Deploy to Zama Testnet

```bash
npx hardhat run scripts/deploy-testnet.js --network zama_fhevm
```

The script will:
1. Deploy `ZamaToken` contract
2. Deploy `FHEDEX` contract
3. Initialize pool with:
   - 10 ETH
   - 1000 ZAMA tokens
4. Output contract addresses

**Example Output:**
```
🚀 Deploying to Zama FHEVM Testnet...

📝 Deploying contracts with account: 0x...
🌐 Network: zama_fhevm (ChainID: 8008)

📦 Step 1: Deploying ZamaToken...
✅ ZamaToken deployed at: 0xABC123...

📦 Step 2: Deploying FHEDEX...
✅ FHEDEX deployed at: 0xDEF456...

✅ Deployment Complete!
═══════════════════════════════════════════════════════
📋 Contract Addresses:
   ZamaToken: 0xABC123...
   FHEDEX: 0xDEF456...
═══════════════════════════════════════════════════════
```

### Step 3: Save Deployment Info

Create `deployments/zama-testnet.json`:

```json
{
  "network": "zama_fhevm",
  "chainId": 8008,
  "deployer": "0x...",
  "zamaToken": "0xABC123...",
  "fhedex": "0xDEF456...",
  "deployedAt": "2025-10-18T...",
  "initialLiquidity": {
    "eth": "10.0",
    "tokens": "1000.0"
  }
}
```

## 🧪 Testing on Testnet

### 1. Check Contract Deployment

```bash
# Verify contracts are deployed
curl -X POST https://testnet-rpc.zama.ai:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "method":"eth_getCode",
    "params":["0xDEF456...","latest"],
    "id":1
  }'
```

### 2. Check Pool State

```bash
# Using ethers.js or web3.js
const fhedex = new ethers.Contract(FHEDEX_ADDRESS, FHEDEX_ABI, provider);
const reserves = await fhedex.getPoolReserves();
console.log('ETH Reserve:', ethers.utils.formatEther(reserves.ethBalance));
console.log('Token Reserve:', ethers.utils.formatUnits(reserves.tokenBalance, 18));
```

### 3. Perform Test Swap

```bash
# Call swapEthForToken (generates SwapRequested event)
const tx = await fhedex.connect(signer).swapEthForToken({
  value: ethers.utils.parseEther('1.0')
});
const receipt = await tx.wait();

// Parse SwapRequested event to get requestId
const event = receipt.events.find(e => e.event === 'SwapRequested');
const requestId = event.args.requestId;
console.log('Swap Request ID:', requestId.toString());
```

## 🔐 Oracle Callback Flow

### Expected Flow on Testnet:

1. **User Initiates Swap**
   ```javascript
   swapEthForToken(amount) → emits SwapRequested event with requestId
   ```

2. **Relayer Requests Oracle Decryption**
   ```javascript
   relayerClient.requestOracleDecryption(requestId, encryptedAmount, contractAddress)
   ```

3. **KMS Decrypts Value**
   - Oracle receives encrypted amount
   - KMS decrypts using private keys
   - Calculates swap output using Constant Product Formula

4. **Contract Executes Callback**
   ```javascript
   handleDecryptedSwap(requestId, decryptedOutputAmount)
   → transfers tokens to user
   → emits SwapCompleted event
   ```

## 📊 Monitoring

### View Transactions

```bash
# Zama Testnet Explorer
https://testnet-explorer.zama.ai
```

Search by:
- Contract address
- Transaction hash
- Your wallet address

### Track Pending Swaps

```bash
const pendingSwaps = await fhedex.getPendingSwaps();
for (let swap of pendingSwaps) {
  console.log('RequestId:', swap.requestId);
  console.log('Status:', swap.completed ? 'Completed' : 'Pending');
}
```

## 🐛 Troubleshooting

### Error: "Pool not initialized"
- Solution: Call `initializePool()` before swaps

### Error: "Insufficient balance"
- Solution: Ensure contract has enough tokens/ETH in reserves
- Check: `fhedex.getPoolReserves()`

### Error: "Swap already completed"
- Solution: Each requestId can only be completed once
- Use different requestId for new swaps

### Error: "Invalid request ID"
- Solution: Verify requestId exists
- Check: `fhedex.getPendingSwap(requestId)`

## 📝 Architecture Summary

### Smart Contract Layer (FHEDEX.sol)
- ✅ PendingSwap struct tracking
- ✅ handleDecryptedSwap() callback
- ✅ Constant Product Formula (0.3% fee)
- ✅ SwapRequested/SwapCompleted events
- ✅ Pool reserve management

### Relayer Service (RelayerClient.ts)
- ✅ requestOracleDecryption() 
- ✅ waitForOracleCallback()
- ✅ submitEncryptedSwap()
- ✅ Status polling

### React Hooks (useDEX.ts)
- ✅ swapEthForToken() 6-step flow
- ✅ swapTokenForEth() 6-step flow
- ✅ Event parsing & requestId tracking
- ✅ Error handling

## 🔗 Useful Links

- **Zama FHEVM Docs**: https://docs.zama.ai/fhevm
- **Testnet RPC**: https://testnet-rpc.zama.ai:8545
- **Block Explorer**: https://testnet-explorer.zama.ai
- **GitHub**: https://github.com/zama-ai/fhevm-hardhat-template

## 📞 Support

For issues or questions:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review test files for examples
3. Contact Zama support: https://zama.ai

---

**Last Updated**: October 18, 2025  
**Status**: Production Ready ✅
