# Vercel Deploy Guide - Zama FHEVM DEX

## Vercel'de Deployment Adımları

### 1. GitHub'a Push Et

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. Vercel Connect

1. **Vercel Console**'a git: https://vercel.com
2. **New Project** → **Import Git Repository**
3. `ZAMA-DEX-FHE` reposunu seç
4. **Deploy** tıkla

### 3. Ortam Değişkenleri (Environment Variables)

Vercel dashboard'da:
- **Settings** → **Environment Variables**

Aşağıdaki variables'ı ekle:

```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_RPC_URL=https://testnet-rpc.zama.ai:8545
VITE_NETWORK_ID=8008
```

### 4. Build & Deployment Settings

Vercel auto-detect edecek:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 5. Deploy!

Vercel otomatik olarak:
1. ✅ Dependencies install eder
2. ✅ `npm run build` çalıştırır
3. ✅ Dist folder'ı üretir
4. ✅ CDN'e deploy eder

---

## Kullanım (Frontend)

### Tesnet RPC bağlantısı:
- **Network**: Zama FHEVM Testnet (ChainID: 8008)
- **RPC URL**: https://testnet-rpc.zama.ai:8545

### Contract Deployment:

Vercel'de frontend çalıştıktan sonra:

```bash
# Local deployment (test için)
npm run deploy:localhost

# Testnet deployment
npm run deploy
```

---

## Proje Yapısı

```
Frontend (React + Vite)
    ↓
    Smart Contracts (Zama FHEVM)
    ↓
    Zama Network (Testnet RPC)
```

---

## Frontend Özellikleri

- **Contract Interaction**: ethers.js with Zama FHEVM
- **UI**: React + TypeScript + Tailwind CSS
- **Build Tool**: Vite (5x faster than CRA)
- **Optimization**: Code splitting, Tree shaking

---

## Troubleshooting

### Build Timeout?
- Vercel Pro upgrade et (15 min timeout vs 45s)
- Veya hardhat'ı production'dan ayır

### RPC Connection Error?
- Zama testnet endpoint check et: `https://testnet-rpc.zama.ai:8545`
- Firewall/proxy issues check et

### Contract Deploy Fail?
- Private key'i `.env.production` dosyasında kontrol et
- Only `VITE_` prefixed vars exposed!

---

## Önemli Notlar

✅ Frontend: Vercel CDN'den serve edilir (hızlı)
✅ Smart Contracts: Zama Testnet'te deploy edilir
⚠️ Environment Variables: `.env.production` gizli kalır
⚠️ Contract ABIs: Frontend'e statik olarak build edilir

---

## Support

- **Zama Docs**: https://docs.zama.ai
- **Vercel Docs**: https://vercel.com/docs
- **GitHub Issues**: Report bugs here
