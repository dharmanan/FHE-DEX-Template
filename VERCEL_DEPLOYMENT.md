# Vercel Deployment Guide

This guide explains how to deploy ZAMA DEX FHE to Vercel for production.

## Prerequisites

- Vercel account (https://vercel.com)
- GitHub account with repository pushed
- Environment variables ready

## Current Deployment Status

✅ **Smart Contracts Deployed (Sepolia Testnet)**
- ZamaToken: `0x8CE14A95E9e9622F81b4C71eb99f1C2228bFD636`
- DEX: `0x1F1B2d3BDCe3674164eD34F1313a62486764CD19`
- Network: Sepolia (ChainID: 11155111)

✅ **Pool Status** (October 18, 2025)
- ETH Reserve: 0.2 ETH
- Token Reserve: 1007 ZAMA
- Exchange Rate: 1 ETH ≈ 5035 ZAMA
- Total LP Tokens: 0.2

✅ **Frontend Ready for Deployment**
- Build optimized with Vite
- Environment variables configured
- Production build tested

## Step-by-Step Deployment

### 1. Connect to Vercel

```bash
# Option A: Via Web UI
# 1. Visit https://vercel.com/dashboard
# 2. Click "New Project"
# 3. Import from GitHub: dharmanan/ZAMA-DEX-FHE
# 4. Select "main" branch

# Option B: Via CLI
vercel
```

### 2. Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```
VITE_ZAMA_TOKEN_ADDRESS=0x8CE14A95E9e9622F81b4C71eb99f1C2228bFD636
VITE_DEX_ADDRESS=0x1F1B2d3BDCe3674164eD34F1313a62486764CD19
VITE_NETWORK_ID=11155111
VITE_NETWORK_NAME=sepolia
VITE_RPC_URL=https://sepolia.infura.io/v3/392b6fec32744b34a4850eb2ce3cea2c
```

**Important**: These variables should be available in all environments (Production, Preview, Development).

### 3. Deployment Settings

**Build Command**: `npm run build`
**Output Directory**: `dist`
**Install Command**: `npm install`

These are already configured in `vercel.json`.

### 4. Deploy

```bash
vercel --prod
```

Or use the web interface to manually trigger deployment.

### 5. Verify Deployment

After deployment completes:

1. Visit your Vercel URL (e.g., `https://zama-dex-fhe.vercel.app`)
2. Check browser console (F12 → Console)
3. Look for logs showing contract addresses loaded correctly
4. Switch to Live Mode and test with MetaMask on Sepolia

## Testing on Production

### Prerequisites for Testing

1. **MetaMask Wallet**
   - Switch to Sepolia Testnet
   - Have some Sepolia ETH (from faucet)

2. **ZAMA Tokens**
   
   Option A: Get from DEX Pool (via Swap)
   - Send ETH to DEX
   - Receive ZAMA from pool (0.1 ETH = 500 ZAMA ratio)
   
   Option B: Get from Distributor
   ```bash
   npm run distribute:tokens
   ```
   Then add test user addresses to `scripts/distribute-test-tokens.js`

   Option C: Request from Deployer
   - Contact deployer at: 0x20cDAd07152eF163CAd9Be2cDe1766298B883d71
   - Include wallet address

### Test Operations

1. **Deposit Liquidity**
   - Send 0.01 ETH + proportional ZAMA
   - Receive LP tokens
   
2. **Swap ETH → ZAMA**
   - Send ETH, receive ZAMA tokens
   
3. **Swap ZAMA → ETH**
   - Send ZAMA tokens, receive ETH
   
4. **Withdraw Liquidity**
   - Burn LP tokens, receive ETH + ZAMA

## Getting Test Tokens

### Method 1: Swap at DEX (Recommended for Testing)

Current Pool State:
- ETH Reserve: 0.2 ETH
- Token Reserve: 1007 ZAMA
- Exchange Rate: 1 ETH ≈ 5035 ZAMA

Steps:
1. Get Sepolia ETH from faucet (https://faucet.sepolia.dev)
2. Go to deployed app
3. Enable Live Mode
4. Swap ETH → ZAMA
5. You'll receive ZAMA tokens instantly

### Method 2: Token Distribution Script

If you have deployer access:

```bash
# Edit scripts/distribute-test-tokens.js
# Add test user addresses to TEST_USERS array

npm run distribute:tokens
```

### Method 3: Direct Transfer

If you have ZAMA tokens:

```bash
# Via Etherscan
# 1. Go to: https://sepolia.etherscan.io/token/0x8CE14A95E9e9622F81b4C71eb99f1C2228bFD636
# 2. Click "Write Contract"
# 3. Connect wallet (must be token owner or have approval)
# 4. Call transfer() function
```

## Troubleshooting

### Contract Address Not Loading

**Problem**: App shows "0x0000..." addresses

**Solution**: 
- Check environment variables in Vercel settings
- Verify `.env.production` file locally
- Restart deployment

### MetaMask Not Connecting

**Problem**: "Connect Wallet" button doesn't work

**Solution**:
- Ensure MetaMask is installed
- Switch to Sepolia Testnet in MetaMask
- Try connecting again

### Transaction Fails

**Problem**: "Transaction likely to fail" error

**Solution**:
- Ensure you have Sepolia ETH balance
- Ensure you have ZAMA token balance
- Check gas price is reasonable
- Verify contract addresses are correct

### Insufficient Balance Errors

**Problem**: "Insufficient ETH balance" or "Insufficient ZAMA balance"

**Solution**:
- Verify actual balance on-chain (Etherscan)
- Refresh page and check again
- Get more test tokens via swap or distribution

## Live Deployment

Once deployed, testers can access:

- **Frontend URL**: `https://your-project.vercel.app`
- **View on Etherscan**: 
  - ZamaToken: https://sepolia.etherscan.io/address/0x8CE14A95E9e9622F81b4C71eb99f1C2228bFD636
  - DEX: https://sepolia.etherscan.io/address/0x1F1B2d3BDCe3674164eD34F1313a62486764CD19

## For Zama Builder Track Reviewers

### Complete Testing Checklist

✅ **Setup**
- [ ] Visit deployed URL
- [ ] See contract addresses in console
- [ ] See initial reserves: 0.1 ETH, 500 ZAMA

✅ **Wallet Connection**
- [ ] Enable Live Mode
- [ ] MetaMask popup appears
- [ ] Wallet connects successfully
- [ ] Balances update correctly

✅ **Swap ETH → ZAMA**
- [ ] Input 0.01 ETH
- [ ] See ZAMA output calculation
- [ ] Swap transaction succeeds
- [ ] ZAMA balance increases
- [ ] Reserves update

✅ **Deposit Liquidity**
- [ ] Input 0.005 ETH
- [ ] See proportional ZAMA needed
- [ ] Deposit succeeds
- [ ] Receive LP tokens
- [ ] Reserves increase

✅ **Withdraw Liquidity**
- [ ] Input LP token amount
- [ ] See ETH + ZAMA to receive
- [ ] Withdrawal succeeds
- [ ] Get ETH and ZAMA back
- [ ] Reserves decrease

### Support

If issues occur:
1. Check browser console (F12 → Console)
2. Note any error messages
3. File issue on GitHub: https://github.com/dharmanan/ZAMA-DEX-FHE/issues
4. Include wallet address and transaction hash if available

---

**Deployed**: October 18, 2025
**Updated**: October 18, 2025
**Network**: Sepolia Testnet

- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

## Step 4: Deploy

### 4.1 Manuel Deploy
```bash
npm install -g vercel
vercel
```

Sorulara cevap verin:
```
? Set up and deploy "ZAMA-DEX-FHE"? [Y/n] y
? Which scope do you want to deploy to? [your-name]
? Link to existing project? [y/N] n
? What's your project's name? zama-dex-fhe
? In which directory is your code located? ./
? Want to override the settings? [y/N] n
```

### 4.2 GitHub Push ile Otomatik Deploy
1. Vercel Dashboard → Project Settings → Git
2. "Deployments" sekmesi kontrol edin
3. Her push'ta otomatik deploy olacak

## Step 5: Deploy Sonrası Kontrol

### 5.1 Deployment Status
Vercel Dashboard'dan:
- "Deployments" sekmesinde deployment status'ü kontrol edin
- Build log'ları görüntüleyin
- Errors varsa "View Log" tıklayın

### 5.2 Live URL
Başarılı deployment sonrası:
```
Your deployment is live at:
https://zama-dex-fhE.vercel.app
```

Bu URL değişebilir. Vercel'den kesin URL'i alın.

## Step 6: Production Testing

### 6.1 Live Site'ı Test Edin
1. Vercel'den verilen URL'yi açın
2. MetaMask ile Sepolia'ya bağlanın
3. Aşağıdakileri test edin:
   - ✅ Cüzdan bağlantısı
   - ✅ Balance görüntüleme
   - ✅ Swap işlemi (simüle mod)
   - ✅ Liquidity ekleme/çıkarma

### 6.2 Error Checking
- Browser console'da hata var mı kontrol edin (F12)
- MetaMask uyarıları kontrol edin
- Network tab'ında API calls başarılı mı kontrol edin

## Step 7: Custom Domain (İsteğe Bağlı)

1. Vercel Dashboard → Settings → Domains
2. "Add Domain" tıklayın
3. Your domain'i girin
4. DNS kayıtlarını konfigure edin

## Troubleshooting

### Build Failed
**Error:** `npm ERR! code ENOENT`

**Solution:**
- package.json dependencies kontrol edin
- Vercel Dashboard → Rebuilds → "Redeploy"

### Environment Variables Not Loading
**Error:** Undefined contract address

**Solution:**
- Vercel Dashboard → Settings → Environment Variables kontrol edin
- VITE_ prefix'i kontrol edin (Vite'ın client-side variables için gerekli)
- Redeployment trigger edin

### Blank Page
**Error:** White screen, hiçbir hata yok

**Solution:**
- Build artifacts kontrol edin
- `dist/index.html` var mı kontrol edin
- Browser cache temizleyin (Ctrl+Shift+Delete)

### MetaMask Connection Issues
**Error:** Sepolia'ya bağlanamıyor

**Solution:**
- .env.production dosyasında RPC URL'i kontrol edin
- MetaMask'ı Sepolia ağına switch edin
- Infura Project ID'nin geçerli olduğunu kontrol edin

## Performance Optimization

### CDN Benefits
Vercel otomatik olarak:
- ✅ Global CDN aracılığıyla serve eder
- ✅ Assets minify ve compress eder
- ✅ Caching headers optimize eder
- ✅ Automatic HTTPS

### Build Size
Current sizes:
- HTML: 0.76 kB
- CSS: 16.29 kB (gzip: 3.57 kB)
- JS (vendor): 12.41 kB (gzip: 4.41 kB)
- JS (ethers): 358.71 kB (gzip: 126.39 kB)
- JS (app): 437.85 kB (gzip: 110.82 kB)

## Monitoring

### Analytics
Vercel Dashboard → Analytics sekmesinde:
- Pageviews
- Response times
- Error rates
- Device breakdown

### Log Files
```bash
vercel logs <deployment-url>
```

## Rollback

Önceki deployment'a dönmek için:

1. Vercel Dashboard → Deployments
2. Geri dönmek istediğiniz deployment'ı bulun
3. "Promote to Production" tıklayın

## CI/CD Pipeline

Vercel otomatik olarak:
1. GitHub push algılar
2. npm install çalıştırır
3. npm run build çalıştırır
4. dist/ klasörünü deploy eder
5. Live URL'ye serve eder

## Final Checklist

- [ ] GitHub'da tüm dosyalar pushed
- [ ] Vercel project connected
- [ ] Environment variables set
- [ ] Build successful
- [ ] Live URL working
- [ ] MetaMask integration tested
- [ ] Swap functions working
- [ ] No console errors
- [ ] Documentation updated with live URL

## Important Notes

⚠️ **Security:**
- Private keys Vercel'e upload etmeyin
- Deployment öncesi .env file'ını kontrol edin
- Vercel logs'da sensitive data yok mu kontrol edin

✅ **Best Practices:**
- GitHub branch protection etkinleştirin
- Production URL'i README'ye ekleyin
- Deployment status URL'sini paylaşın

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Vite Deployment**: https://vitejs.dev/guide/ssr.html#setting-up-the-dev-server
- **GitHub Integration**: https://vercel.com/docs/git

## Live Deployment Status

| Item | Status |
|------|--------|
| GitHub Repo | ✅ Ready |
| Build | ✅ Success |
| Environment | ✅ Configured |
| Contracts | ✅ Sepolia Deployed |
| Vercel | ⏳ Ready to Deploy |

---

**Next Step**: https://vercel.com adresine gidin ve projeyi import edin!

**Deployed URL** (after deployment):
```
https://zama-dex-fhe.vercel.app
```

---

*Last Updated: October 18, 2025*
