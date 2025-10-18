# Vercel'de Zama FHEVM DEX - Hızlı Başlangıç

## 🚀 5 Dakika Deploy

### Adım 1: GitHub'a Push Et

```bash
git add .
git commit -m "Deploy Zama FHEVM DEX"
git push origin main
```

### Adım 2: Vercel'e Bağlan

1. https://vercel.com git ve signup/login yap
2. **Add New...** → **Project**
3. **Import Git Repository** → `ZAMA-DEX-FHE` seç
4. **Deploy** tıkla

### Adım 3: Env Variables Ekle

Vercel Settings → Environment Variables:

```
VITE_GEMINI_API_KEY=your_key_here
VITE_RPC_URL=https://testnet-rpc.zama.ai:8545
VITE_NETWORK_ID=8008
```

### Adım 4: Tamamlandı! 🎉

URL almak için:
- Vercel dashboard'da `Deployments` tab'ına git
- Ana deployment'ın yanında **Visit** tıkla

---

## 📦 Frontend Otomatik Build

Vercel, her push'ta otomatik:

1. ✅ Dependencies install eder
2. ✅ `npm run build` çalıştırır (Vite ile)
3. ✅ `dist/` folder'ı produce eder
4. ✅ CDN'e deploy eder
5. ✅ Live URL veri

---

## 🔗 Contract Deployment (Opsiyonal)

Frontend'in deployment'ından sonra, contract'ları Zama testnet'e deploy etmek istersen:

```bash
# Local ortamda çalıştır
PRIVATE_KEY=your_pk npm run deploy

# Output:
# ✓ ZamaToken deployed to: 0x...
# ✓ FHEDEX deployed to: 0x...
```

Sonra `.env.production` dosyasındaki addressleri update et:

```env
VITE_ZAMA_TOKEN_ADDRESS=0x...
VITE_DEX_ADDRESS=0x...
```

---

## 🌐 Live URL Yapısı

```
Your App: https://your-vercel-domain.vercel.app
├─ Frontend (React + Vite) → CDN
├─ Smart Contracts → Zama Testnet (8008)
└─ RPC: https://testnet-rpc.zama.ai:8545
```

---

## ⚡ Performance

- **Frontend Build Time**: ~30 saniye (Vite)
- **Page Load**: <2 saniye (Optimized)
- **Contract Calls**: ~2-5 saniye (Testnet latency)

---

## 🐛 Troubleshooting

### Build Başarısız?
```
Error: Cannot find module...
→ npm install hardhat yeniden install edilebilir
→ Vercel Pro kullan (15 min timeout)
```

### Contract Deploy Fail?
```
Error: insufficient funds
→ Zama faucet kullan: https://faucet.zama.ai
```

### RPC Connection Error?
```
Error: Cannot reach testnet
→ Zama endpoint check: https://testnet-rpc.zama.ai:8545
```

---

## 📚 Daha Fazla Bilgi

- **VERCEL_DEPLOY_GUIDE.md** - Detaylı deployment rehberi
- **ZAMA_FHEVM_GUIDE.md** - Zama FHEVM hakkında
- **docs.zama.ai** - Zama resmi dokümantasyon

---

## 💡 Tips

1. **Preview URL**: Her PR/branch'a otomatik preview URL verisi
2. **Rollback**: Önceki deployment'a 1 tıkla dön
3. **Env Secrets**: Sensitive data Vercel'de encrypted saklanır
4. **Custom Domain**: `Settings → Domains` dan ekle

Enjoy! 🎉
