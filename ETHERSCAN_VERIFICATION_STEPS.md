# 🔍 Etherscan Verification - Detailed Step-by-Step

## Summary

✅ **Contracts Deployed to Sepolia**

| Contract | Address | Status |
|----------|---------|--------|
| ZamaToken | `0xb2B26a1222D5c02a081cBDC06277D71BD50927e6` | Ready to Verify |
| DEX | `0x50B85A4A3c76be5B36c1CfA04B1AFc44dd1EBE7c` | Ready to Verify |

---

## Method 1: Manual Etherscan Verification (Recommended for Beginners)

### Step 1: Verify ZamaToken

**1.1 Open Etherscan**
- Go to: https://sepolia.etherscan.io/address/0xb2B26a1222D5c02a081cBDC06277D71BD50927e6

**1.2 Click "Contract" Tab**
- You should see "Code" section
- Look for "Verify and Publish" link

**1.3 Click "Verify and Publish"**
- Opens verification form

**1.4 Fill Verification Form**

```
Contract Address:     0xb2B26a1222D5c02a081cBDC06277D71BD50927e6
Compiler Type:        Solidity (Single file)
Compiler Version:     v0.8.20 (match from contracts/Token.sol)
License:              MIT
```

**1.5 Paste Source Code**
- Copy from: `contracts/Token.sol`
- Paste into: "Contract Code" field
- Make sure to include: `// SPDX-License-Identifier: MIT` at top

**1.6 Click "Verify and Publish"**

**Expected Result:**
```
✅ Contract verified successfully
```

**Verification Link:**
https://sepolia.etherscan.io/address/0xb2B26a1222D5c02a081cBDC06277D71BD50927e6#code

---

### Step 2: Verify DEX Contract

**2.1 Open Etherscan**
- Go to: https://sepolia.etherscan.io/address/0x50B85A4A3c76be5B36c1CfA04B1AFc44dd1EBE7c

**2.2 Click "Verify and Publish"**

**2.3 Fill Verification Form**

```
Contract Address:     0x50B85A4A3c76be5B36c1CfA04B1AFc44dd1EBE7c
Compiler Type:        Solidity (Single file)
Compiler Version:     v0.8.20
License:              MIT
```

**2.4 Paste Source Code**
- Copy from: `contracts/DEX.sol`
- Paste into: "Contract Code" field

**2.5 Important: Add Constructor Arguments**

Since DEX is initialized with ZamaToken address, we need to provide constructor args:

**2.5.1 Get ABI-Encoded Constructor Arguments**

Token address: `0xb2B26a1222D5c02a081cBDC06277D71BD50927e6`

Convert to ABI format:
- Remove `0x` prefix
- Pad to 64 hex characters
- Result: `000000000000000000000000b2b26a1222d5c02a081cbdc06277d71bd50927e6`

**2.5.2 Enter in Etherscan**
- In "Constructor Arguments (ABI-encoded)" field
- Paste: `000000000000000000000000b2b26a1222d5c02a081cbdc06277d71bd50927e6`

Or use online tool: https://abi.hashex.org/

**2.6 Click "Verify and Publish"**

**Expected Result:**
```
✅ Contract verified successfully
```

**Verification Link:**
https://sepolia.etherscan.io/address/0x50B85A4A3c76be5B36c1CfA04B1AFc44dd1EBE7c#code

---

## Method 2: Using Hardhat Verify Plugin

### Prerequisites

1. **Get Etherscan API Key**
   - Visit: https://etherscan.io/apis
   - Create account if needed
   - Click "Add" to generate API key

2. **Add to .env**
   ```bash
   ETHERSCAN_API_KEY=your_api_key_here
   ```

3. **Verify Hardhat Config**
   - Check `hardhat.config.js` has:
   ```javascript
   require("@nomiclabs/hardhat-etherscan");
   
   module.exports = {
     etherscan: {
       apiKey: {
         sepolia: process.env.ETHERSCAN_API_KEY
       }
     }
   };
   ```

### Verification Commands

**Verify ZamaToken:**
```bash
npx hardhat verify --network sepolia \
  0xb2B26a1222D5c02a081cBDC06277D71BD50927e6 \
  0x20cDAd07152eF163CAd9Be2cDe1766298B883d71
```

**Verify DEX:**
```bash
npx hardhat verify --network sepolia \
  0x50B85A4A3c76be5B36c1CfA04B1AFc44dd1EBE7c \
  0xb2B26a1222D5c02a081cBDC06277d71bd50927e6
```

---

## Troubleshooting

### Issue: "Source code does not match"

**Solution:**
- Ensure exact code copy (no extra spaces)
- Use code from GitHub repo directly
- Check Solidity version matches (v0.8.20)

### Issue: "Constructor arguments mismatch"

**Solution:**
- Verify ABI encoding is correct
- Use online converter: https://abi.hashex.org/
- Token address: `0xb2B26a1222D5c02a081cBDC06277D71BD50927e6`
- ABI encoded: `000000000000000000000000b2b26a1222d5c02a081cbdc06277d71bd50927e6`

### Issue: "Invalid API key"

**Solution:**
- Create new API key on Etherscan
- Wait 1-2 minutes
- Check `.env` file format
- No spaces around `=` sign

### Issue: "Compilation Error"

**Solution:**
- Make sure compiler version is v0.8.20
- Check for import errors
- Verify all dependencies included

---

## Verification Checklist

After successful verification, you should see:

### For ZamaToken:
- ✅ Green checkmark ✓ next to contract address
- ✅ "Contract" tab shows readable code
- ✅ "Read Contract" tab available
- ✅ "Write Contract" tab shows functions
- ✅ Shows: `constructor(address initialOwner)` in code

### For DEX:
- ✅ Green checkmark ✓ next to contract address
- ✅ Contract code readable
- ✅ All functions visible: `deposit()`, `ethToTokenSwap()`, etc.
- ✅ Shows: `constructor(address _tokenAddress)` in code

---

## Test Verified Contracts on Etherscan

### Read-Only Functions (No wallet needed)

**ZamaToken:**
1. Go to Contract tab
2. Click "Read Contract"
3. Functions available:
   - `balanceOf(address)` - Check token balance
   - `totalSupply()` - Check total tokens
   - `allowance(address owner, address spender)`

**DEX:**
1. Go to Contract tab
2. Click "Read Contract"
3. Functions available:
   - `getReserves()` - Current pool reserves
   - `totalLiquidity()` - Total LP tokens
   - `liquidity(address)` - Your LP balance

### Write Functions (Requires MetaMask)

1. In "Write Contract" section
2. Click "Connect to Web3"
3. Connect MetaMask to Sepolia
4. Call functions directly from Etherscan

---

## Next Steps After Verification

1. ✅ Verify both contracts
2. Add verified contract links to README
3. Test on frontend: `npm run dev`
4. Submit to Zama Builder Track

---

## Quick Links

**Deployed Contracts:**
- ZamaToken: https://sepolia.etherscan.io/address/0xb2B26a1222D5c02a081cBDC06277D71BD50927e6
- DEX: https://sepolia.etherscan.io/address/0x50B85A4A3c76be5B36c1CfA04B1AFc44dd1EBE7c

**Tools:**
- Etherscan: https://sepolia.etherscan.io
- ABI Encoder: https://abi.hashex.org/
- Sepolia Faucet: https://faucet.sepolia.dev

**Documentation:**
- Etherscan Verify: https://docs.etherscan.io/
- Hardhat Verify: https://hardhat.org/plugins/nomiclabs-hardhat-etherscan

---

**Status**: Ready for verification  
**Date**: October 18, 2025  
**Network**: Sepolia Testnet
