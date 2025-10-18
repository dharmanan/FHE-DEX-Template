# 🚀 FHEDEX Live Deployment Instructions

## Current Status

✅ **FHEDEX Deployed to Sepolia**
- Contract Address: `0x881Aa3BE4A1cb54e48533262DDBE36Af272785a5`
- Transaction: `0x61b22cca68de826e12e1de4deaa79717ad29ede6f03e65f40ac69bcbcac28c9a`
- Token Address: `0x8CE14A95E9e9622F81b4C71eb99f1C2228bFD636`

⏳ **Pending: Vercel Frontend Update**

---

## Step 1: Update Vercel Environment Variables

You need to update the environment variables in Vercel Dashboard:

1. Go to: https://vercel.com/dashboard
2. Select project: **zama-dex**
3. Go to **Settings** → **Environment Variables**
4. Update the following:

| Variable | Current | New (FHEDEX) |
|----------|---------|--------------|
| `VITE_DEX_ADDRESS` | `0x1F1B2d3BDCe3674164eD34F1313a62486764CD19` | `0x881Aa3BE4A1cb54e48533262DDBE36Af272785a5` |
| `VITE_ZAMA_TOKEN_ADDRESS` | `0x8CE14A95E9e9622F81b4C71eb99f1C2228bFD636` | `0x8CE14A95E9e9622F81b4C71eb99f1C2228bFD636` |
| `VITE_NETWORK_ID` | `11155111` | `11155111` |
| `VITE_NETWORK_NAME` | `sepolia` | `sepolia` |
| `VITE_RPC_URL` | `https://sepolia.infura.io/v3/...` | Keep same |

**Changes needed:**
- Only `VITE_DEX_ADDRESS` is different (the FHE contract address)

### How to Update:

1. **Edit VITE_DEX_ADDRESS:**
   - Click on the variable
   - Change value to: `0x881Aa3BE4A1cb54e48533262DDBE36Af272785a5`
   - Click Save

2. Vercel will automatically trigger a new deployment

---

## Step 2: Monitor Deployment

After updating environment variables:

1. Go to **Deployments** tab
2. You should see a new deployment starting
3. Wait for build to complete (~2-3 minutes)
4. Check deployment status for any errors

Expected output:
```
✓ Built in 4.77s
✓ Ready for production
```

---

## Step 3: Verify Live Deployment

Once deployment completes:

1. Go to: https://zama-dex.vercel.app
2. Toggle "Dummy" → "Live" mode
3. Connect MetaMask wallet (Sepolia network)
4. Check if contract is recognized

**Expected:**
- DEX operations available
- Connected to FHEDEX contract
- All features working

---

## Step 4: Initialize FHEDEX Pool

Once frontend is live with FHEDEX contract, initialize the pool:

```bash
# Run from your local machine
npm run init:dex
```

This will:
- Connect to FHEDEX on Sepolia
- Call `initializePool()` with encrypted data
- Set up initial liquidity

---

## Troubleshooting

### Contract Address Not Found
- Verify address is correct: `0x881Aa3BE4A1cb54e48533262DDBE36Af272785a5`
- Check it exists on Sepolia: https://sepolia.etherscan.io/address/0x881Aa3BE4A1cb54e48533262DDBE36Af272785a5
- Refresh page after Vercel deployment

### Build Errors
- Check Vercel Deployment logs
- Ensure `.env.production` has correct addresses
- Rebuild locally: `npm run build`

### MetaMask Connection Issues
- Ensure Sepolia network is selected
- Check network ID is 11155111
- Verify RPC URL is working

### Transaction Failures
- Check you have Sepolia ETH
- Verify token allowance
- Check pool is initialized

---

## 📊 What Changed

### From DEX to FHEDEX:

| Aspect | DEX.sol | FHEDEX.sol |
|--------|---------|-----------|
| Reserves | Public (uint) | Encrypted (euint256) |
| Liquidity | Public mapping | Encrypted mapping |
| Calculations | Standard arithmetic | Homomorphic operations |
| Privacy | None | Full FHE privacy |
| TX Amounts | Visible | Hidden from blockchain |

### FHE Operations:

All calculations now use Zama's @fhenixprotocol/contracts:
- `FHE.add()` - Encrypted addition
- `FHE.mul()` - Encrypted multiplication
- `FHE.div()` - Encrypted division
- `FHE.le()` - Encrypted comparison

---

## ✅ Deployment Checklist

- [x] FHEDEX.sol contract written
- [x] Compiled successfully
- [x] Deployed to Sepolia
- [x] Verified token address in contract
- [x] Built frontend with new contract address
- [x] Committed changes to GitHub
- [ ] Updated Vercel environment variables ← **YOU ARE HERE**
- [ ] Waited for new deployment to complete
- [ ] Verified live deployment works
- [ ] Initialized pool with npm run init:dex
- [ ] Tested swaps and transactions

---

## 🎯 Next Steps

1. **Update Vercel Env Vars** (5 min)
2. **Wait for deployment** (3-5 min)
3. **Test live site** (5 min)
4. **Initialize pool** (2 min)
5. **Done!** 🎉

---

## 📝 Commands Reference

```bash
# Deploy FHEDEX locally (already done)
npx hardhat run scripts/deploy-fhedex.js --network sepolia

# Verify contract on Etherscan (optional)
npx hardhat verify --network sepolia 0x881Aa3BE4A1cb54e48533262DDBE36Af272785a5 0x8CE14A95E9e9622F81b4C71eb99f1C2228bFD636

# Initialize FHEDEX pool
npm run init:dex

# Run tests
npm test

# Local build test
npm run build
```

---

## 🔗 Important Links

- **FHEDEX Contract**: https://sepolia.etherscan.io/address/0x881Aa3BE4A1cb54e48533262DDBE36Af272785a5
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Live Frontend**: https://zama-dex.vercel.app
- **FHEDEX Deployment Guide**: [FHEDEX_DEPLOYMENT.md](./FHEDEX_DEPLOYMENT.md)
- **FHE Compliance**: [FHE_COMPLIANCE_ANALYSIS.md](./FHE_COMPLIANCE_ANALYSIS.md)

---

## 📞 Support

If you encounter issues:

1. Check Vercel deployment logs
2. Verify contract address on Etherscan
3. Check MetaMask network is Sepolia (11155111)
4. Review [FHEDEX_DEPLOYMENT.md](./FHEDEX_DEPLOYMENT.md) for detailed guide
5. Check [FHE_COMPLIANCE_ANALYSIS.md](./FHE_COMPLIANCE_ANALYSIS.md) for FHE details

