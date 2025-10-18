# Sepolia Verification & Deployment Guide

## Quick Deployment Status

| Contract | Address | Network | Status |
|----------|---------|---------|--------|
| **ZamaToken** | `0xb2B26a1222D5c02a081cBDC06277D71BD50927e6` | Sepolia | ✅ Deployed |
| **DEX** | `0x50B85A4A3c76be5B36c1CfA04B1AFc44dd1EBE7c` | Sepolia | ✅ Deployed |

**Deployment Date**: October 18, 2025  
**Deployer**: `0x20cDAd07152eF163CAd9Be2cDe1766298B883d71`

---

## Step 1: View Deployment Info

```bash
cat deployments/sepolia-deployment.json
```

Output:
```json
{
  "network": "sepolia",
  "zamaToken": "0xb2B26a1222D5c02a081cBDC06277D71BD50927e6",
  "dex": "0x50B85A4A3c76be5B36c1CfA04B1AFc44dd1EBE7c",
  "deployer": "0x20cDAd07152eF163CAd9Be2cDe1766298B883d71",
  "timestamp": "2025-10-18T10:55:51.511Z"
}
```

---

## Step 2: Get Etherscan API Key

### 2a. Create Etherscan Account
1. Go to https://etherscan.io/
2. Click "Sign In" → "Create Account"
3. Fill in email, username, password
4. Verify email

### 2b. Generate API Key
1. After login, go to: https://etherscan.io/apis
2. Click "Add" button to create a new API key
3. Name it: `ZAMA-DEX-Sepolia`
4. Copy the API key

### 2c. Add to .env
```bash
# Edit .env file
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

**Security Note**: Keep API key private, don't commit to GitHub

---

## Step 3: Verify Contracts Manually (Recommended)

Since Hardhat verify sometimes requires build artifacts, here's the manual method:

### For ZamaToken:

1. Go to: https://sepolia.etherscan.io/address/0xb2B26a1222D5c02a081cBDC06277D71BD50927e6
2. Click "Contract" tab
3. Click "Verify and Publish"
4. Select:
   - Compiler Type: **Solidity (Single file)**
   - Compiler Version: **0.8.20** (or match from artifacts)
   - License: **MIT**
5. Paste code from `contracts/Token.sol`
6. Click "Verify and Publish"

### For DEX:

1. Go to: https://sepolia.etherscan.io/address/0x50B85A4A3c76be5B36c1CfA04B1AFc44dd1EBE7c
2. Click "Contract" tab
3. Click "Verify and Publish"
4. Select:
   - Compiler Type: **Solidity (Single file)**
   - Compiler Version: **0.8.20**
   - License: **MIT**
5. Paste code from `contracts/DEX.sol`
6. Constructor Arguments (in ABI-encoded format): Use the token address
   - Token Address: `0xb2B26a1222D5c02a081cBDC06277D71BD50927e6`
   - In ABI format: `000000000000000000000000b2b26a1222d5c02a081cbdc06277d71bd50927e6`
7. Click "Verify and Publish"

---

## Step 4: Verify with Hardhat (Optional)

If you want to use Hardhat verify command:

```bash
# Verify ZamaToken
npx hardhat verify --network sepolia 0xb2B26a1222D5c02a081cBDC06277D71BD50927e6 0x20cDAd07152eF163CAd9Be2cDe1766298B883d71

# Verify DEX
npx hardhat verify --network sepolia 0x50B85A4A3c76be5B36c1CfA04B1AFc44dd1EBE7c 0xb2B26a1222D5c02a081cBDC06277D71BD50927e6
```

---

## Step 5: Check Verification Status

### On Etherscan:
- ZamaToken: https://sepolia.etherscan.io/address/0xb2B26a1222D5c02a081cBDC06277D71BD50927e6
- DEX: https://sepolia.etherscan.io/address/0x50B85A4A3c76be5B36c1CfA04B1AFc44dd1EBE7c

Look for:
- ✅ Green checkmark next to address = Verified
- Contract tab shows code = Verification successful

---

## Step 6: Interact with Verified Contracts

Once verified, you can:

### On Etherscan Read Functions:
- `totalLiquidity()` - Pool liquidity amount
- `getReserves()` - Current ETH and token reserves
- View token balances, allowances, etc.

### On Etherscan Write Functions:
- Use "Connect to Web3" (MetaMask)
- Call functions directly from Etherscan UI
- Or use frontend at http://localhost:5173

---

## Contract Details for Verification

### ZamaToken
```
Compiler Version: 0.8.20
License: MIT
Constructor Args: Deployer address (0x20cDAd07152eF163CAd9Be2cDe1766298B883d71)
```

### DEX
```
Compiler Version: 0.8.20
License: MIT
Constructor Args: ZamaToken address (0xb2B26a1222D5c02a081cBDC06277D71BD50927e6)
```

---

## Troubleshooting

### "Constructor arguments mismatch"
- Ensure constructor args are properly ABI-encoded
- Use online tool: https://abi.hashex.org/

### "Source code does not match"
- Make sure you're pasting the exact contract file
- Check for trailing spaces or formatting differences
- Use the version from `git` to ensure consistency

### "Invalid API key"
- Verify API key is correct
- Wait 1-2 minutes after creating API key
- Check API key isn't rate limited

---

## Next Steps

1. ✅ Verify both contracts on Etherscan
2. Add Etherscan links to README.md
3. Test frontend with verified contracts
4. Submit to Zama Builder Track
5. Monitor deployment on Etherscan

---

**For Zama Builder Track Submission:**

Include these in your submission:
- ✅ GitHub Repository: https://github.com/dharmanan/ZAMA-DEX-FHE
- ✅ ZamaToken Etherscan: https://sepolia.etherscan.io/address/0xb2B26a1222D5c02a081cBDC06277D71BD50927e6
- ✅ DEX Etherscan: https://sepolia.etherscan.io/address/0x50B85A4A3c76be5B36c1CfA04B1AFc44dd1EBE7c
- ✅ Frontend: http://localhost:5173 (or deployed URL)
- ✅ Tests: `npm test` (11/11 passing)
- ✅ Documentation: ARCHITECTURE.md, DEPLOYMENT_GUIDE.md

---

**Last Updated**: October 18, 2025
