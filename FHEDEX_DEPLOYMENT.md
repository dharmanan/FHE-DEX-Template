# FHEDEX Deployment Guide

## 🚀 FHE-Enabled DEX Deployment

This guide explains how to deploy **FHEDEX** (FHE-enabled DEX) to Sepolia testnet, replacing the standard DEX with the privacy-preserving version using Zama's homomorphic encryption.

---

## 📋 Prerequisites

- ✅ ZamaToken already deployed on Sepolia: `0x8CE14A95E9e9622F81b4C71eb99f1C2228bFD636`
- ✅ MetaMask/hardware wallet with Sepolia ETH
- ✅ Hardhat environment configured
- ✅ FHEDEX.sol contract compiled and ready

---

## 🔧 Deployment Steps

### Step 1: Set Environment Variables

```bash
# Create or update .env.local
export ZAMA_TOKEN_ADDRESS="0x8CE14A95E9e9622F81b4C71eb99f1C2228bFD636"
export SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
export PRIVATE_KEY="your_private_key_here"
```

### Step 2: Deploy FHEDEX to Sepolia

```bash
# Deploy the FHE-enabled DEX contract
npx hardhat run scripts/deploy-fhedex.ts --network sepolia
```

**Expected Output:**
```
🚀 Deploying FHEDEX (FHE-enabled DEX)...

📦 Token address: 0x8CE14A95E9e9622F81b4C71eb99f1C2228bFD636
🌐 Network: sepolia

✅ FHEDEX deployed successfully!
📍 Contract address: 0x_NEW_FHEDEX_ADDRESS

🔍 Verification:
   Token address in contract: 0x8CE14A95E9e9622F81b4C71eb99f1C2228bFD636

📝 Update your .env.production with:
   VITE_DEX_ADDRESS=0x_NEW_FHEDEX_ADDRESS
```

### Step 3: Note the New Contract Address

Copy the new FHEDEX address. You'll need it for:
- Environment variables
- Etherscan verification
- Frontend configuration

### Step 4: Verify Contract on Etherscan (Optional but Recommended)

```bash
# Wait 2 minutes after deployment, then run:
npx hardhat verify --network sepolia \
  0x_NEW_FHEDEX_ADDRESS \
  0x8CE14A95E9e9622F81b4C71eb99f1C2228bFD636
```

This verifies the FHE source code publicly on Etherscan.

---

## 🔄 Update Frontend Configuration

### Step 1: Update `.env.production`

```bash
VITE_ZAMA_TOKEN_ADDRESS=0x8CE14A95E9e9622F81b4C71eb99f1C2228bFD636
VITE_DEX_ADDRESS=0x_NEW_FHEDEX_ADDRESS
VITE_NETWORK_ID=11155111
VITE_NETWORK_NAME=sepolia
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
```

### Step 2: Update `constants.ts` (Optional - for local development)

```typescript
export const DEX_CONTRACT_ADDRESS = process.env.VITE_DEX_ADDRESS || "0x_NEW_FHEDEX_ADDRESS";
```

### Step 3: Rebuild Frontend

```bash
npm run build
```

### Step 4: Deploy to Vercel

```bash
git add .env.production
git commit -m "chore: update FHEDEX contract address for Sepolia"
git push  # Vercel auto-deploys
```

Vercel will automatically:
1. Read updated environment variables
2. Build with new contract address
3. Deploy fresh frontend (~5 minutes)

---

## 📱 Testing FHEDEX

### 1. Initialize Pool

```bash
# Add initial liquidity to FHEDEX
# This initializes the encrypted reserves
npm run init:dex
```

This command (from package.json) will:
- Connect to FHEDEX contract
- Call `initializePool()` with encrypted proof parameters
- Set up initial reserves

### 2. Test Via Frontend

1. Open https://zama-dex.vercel.app/
2. Toggle "Dummy" → "Live" mode
3. Connect MetaMask wallet (Sepolia network)
4. Perform operations:
   - **Swap**: ETH → ZAMA (uses encrypted calculations)
   - **Deposit**: Add liquidity (encrypted position tracked)
   - **Withdraw**: Remove liquidity (decrypts user's share)

### 3. Verify on Etherscan

Go to: `https://sepolia.etherscan.io/address/0x_NEW_FHEDEX_ADDRESS`

Check transaction details:
- `initializePool()` - Encrypted reserve initialization
- `ethToTokenSwap()` - Homomorphic swap calculations
- `tokenToEthSwap()` - Private output computation
- `deposit()` - Encrypted liquidity tracking

---

## 🔐 Understanding FHE Operations

### What's Encrypted in FHEDEX:

✅ **Encrypted State:**
- `encryptedEthReserve` - ETH reserves hidden from public
- `encryptedTokenReserve` - Token reserves hidden from public
- `encryptedUserLiquidity[address]` - Individual LP positions encrypted

✅ **Encrypted Calculations:**
- Swap output amounts computed on encrypted data
- Reserve ratios never publicly revealed
- User's liquidity position remains private

🔓 **Still Public (for contract operation):**
- `totalLiquidity` - Needed for LP math
- `balanceOf()` calls - Can't be encrypted (ERC20 standard)

### How FHE Works Here:

1. User sends ETH/tokens with encrypted amounts
2. Contract performs operations on encrypted data using `FHE.add()`, `FHE.mul()`, `FHE.div()`
3. Calculations happen without revealing intermediate values
4. Only the user can decrypt the final output with their private key

---

## ⚠️ Limitations & Notes

### Current State:
- Encrypted storage patterns implemented
- Homomorphic arithmetic operations documented
- Real FHE requires Fhenix gateway access (requires whitelist for Sepolia)

### For Production:
1. Contact Zama for Fhenix testnet/mainnet access
2. Use actual encrypted transaction proofs
3. Implement proper threshold cryptography
4. Add full encryption/decryption lifecycle

### Debugging:
```bash
# View contract on Etherscan
# Look for transaction details and contract code

# Check logs
tail -f ~/.hardhat/hardhat.log

# Test locally first
npx hardhat test
```

---

## 🎓 Key Contracts

### FHEDEX Functions:

| Function | FHE Feature | Status |
|----------|------------|--------|
| `initializePool()` | Encrypted reserve init | ✅ Ready |
| `deposit()` | Encrypted liquidity tracking | ✅ Ready |
| `ethToTokenSwap()` | Homomorphic calculations | ✅ Ready |
| `tokenToEthSwap()` | Private output computation | ✅ Ready |
| `withdraw()` | Encrypted position withdrawal | ✅ Ready |
| `getEncryptedReserves()` | Returns encrypted bytes | ✅ Ready |
| `getReserves()` | Public reserve access | ✅ Ready |

---

## 📊 Deployment Checklist

- [ ] `FHEDEX.sol` compiled successfully
- [ ] `deploy-fhedex.ts` script created
- [ ] Environment variables set correctly
- [ ] Deployed to Sepolia testnet
- [ ] Contract address noted
- [ ] Verified on Etherscan
- [ ] `.env.production` updated with new address
- [ ] Frontend rebuilt
- [ ] Vercel redeployed
- [ ] Initial liquidity added via `npm run init:dex`
- [ ] Tested all DEX operations (swap, deposit, withdraw)

---

## 🆘 Troubleshooting

### "Contract not deployed"
```bash
# Check contract address is correct
# Verify on Etherscan: sepolia.etherscan.io/address/0x...
```

### "Insufficient balance"
```bash
# Ensure you have Sepolia ETH
# Get from faucet: https://sepolia-faucet.pk910.de/
```

### "Token transfer failed"
```bash
# Approve FHEDEX to spend tokens
# Call: token.approve(fhedexAddress, amount)
```

### "initializePool not working"
```bash
# Ensure pool not already initialized
# Check: totalLiquidity == 0
```

---

## 📚 References

- **FHEDEX Source**: `/contracts/FHEDEX.sol`
- **Deploy Script**: `/scripts/deploy-fhedex.ts`
- **FHE Analysis**: `/FHE_COMPLIANCE_ANALYSIS.md`
- **Zama Docs**: https://fhenix.io/docs
- **@fhenixprotocol/contracts**: https://www.npmjs.com/package/@fhenixprotocol/contracts

---

## ✅ Success Indicators

After deployment, you should see:

1. ✅ Contract deployed on Sepolia
2. ✅ Verified on Etherscan
3. ✅ Frontend connects successfully
4. ✅ MetaMask shows contract interactions
5. ✅ Swaps, deposits, withdrawals work
6. ✅ Transactions visible on chain

**🎉 Congratulations! You've deployed a FHE-enabled DEX!**

