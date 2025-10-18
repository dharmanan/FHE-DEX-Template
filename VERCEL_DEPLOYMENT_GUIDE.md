# 🚀 VERCEL'DE ÇALIŞMA - ADIM ADIM REHBERİ

## 📊 Toplam Akış

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: Zama Testnet'e Deploy                              │
│ (Network erişimi olan place'den)                            │
│ → Contract adresler alıyorsun                               │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│ STEP 2: .env.production Güncelle                           │
│ (Adresler otomatik yazılacak)                              │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│ STEP 3: Git Push                                            │
│ git push origin main                                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│ STEP 4: Vercel Otomatik Redeploy                           │
│ (GitHub webhook trigger eder)                              │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│ STEP 5: Frontend Hazır                                      │
│ Vercel URL'de açıyorsun → LİKİDİTE GÖZÜKÜYOR!             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 STEP 1: Zama Testnet'e Deploy

### Neden ayrı yerde çalıştırıyoruz?

Bu environment'da Zama testnet RPC'sine erişim yok (DNS limitation).

**Çözüm**: Network erişimi olan bir yerden çalıştırmalısın:
- ✅ Kişisel bilgisayar (evde)
- ✅ AWS/Azure/DigitalOcean (VPS)
- ✅ GitHub Actions (future)
- ✅ Herhangi bir cloud ortamı

### Deploy Komutları

#### 1️⃣ Terminal'de Git reposunu clone et

```bash
git clone https://github.com/dharmanan/ZAMA-DEX-FHE.git
cd ZAMA-DEX-FHE
npm install
```

#### 2️⃣ .env dosyasını ayarla

```bash
# .env file'ı oluştur (repo'da var)
cat > .env << 'EOF'
INFURA_PROJECT_ID=your_id_here
PRIVATE_KEY=0x...your_private_key...
EOF
```

⚠️ **ÖNEMLİ**: 
- Private key'i güvende tut!
- `.env` dosyasını commit ETME
- GitHub'da public olmamalı

#### 3️⃣ Deploy script'i çalıştır

```bash
npx hardhat run scripts/deploy-and-configure.js --network zama_fhevm
```

**Çıktı alacaksın:**

```
🚀 DEPLOY TO ZAMA TESTNET + CONFIGURE

📝 Deployer Account: 0x...
🌐 Network: Zama FHEVM ChainID: 8008

📦 Step 1: Deploying ZamaToken...
✅ ZamaToken deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3
   TX: 0x75ccbe25d2b04dbfecb85c1d29935eb9dd1532fed64e188e95ab0e018c924638

📦 Step 2: Deploying FHEDEX...
✅ FHEDEX deployed at: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
   TX: 0x336e3c7b8bd23e9f11a489eae60c5a384149448ab4c8c947be335178f49896c7

📦 Step 3: Initializing Pool...
   ✅ Approved 1000 ZAMA tokens
   ✅ Pool initialized
   ✅ Verified
      ETH Reserve: 10.0 ETH
      Token Reserve: 1000.0 ZAMA

💾 Step 4: Saving Deployment Info...
✅ Saved to: ./deployments/zama-testnet-deployment.json

📝 NEXT STEPS:
   1. Verify contracts on explorer
   2. Push to git
   3. Vercel will redeploy automatically
```

**Script ne yapıyor?**
- ✅ ZamaToken deploy ediyor
- ✅ FHEDEX deploy ediyor  
- ✅ Pool initialize ediyor
- ✅ `.env.production` otomatik güncelliyor!
- ✅ `deployments/` klasörüne kayıt yapıyor

---

## 🎯 STEP 2: .env.production Güncellendi Mi?

Deploy script otomatik güncellemeliydi ama kontrol et:

```bash
cat .env.production | grep VITE_
```

**Beklenen output:**
```
VITE_ZAMA_TOKEN_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_DEX_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
VITE_NETWORK_ID=8008
VITE_NETWORK_NAME=zama_fhevm
VITE_RPC_URL=https://testnet-rpc.zama.ai:8545
```

❌ **Eğer hala 0x0000... görüyorsan:**

Manüel güncelle:

```bash
# .env.production dosyasını aç
nano .env.production

# Veya sed kullan:
sed -i 's/VITE_ZAMA_TOKEN_ADDRESS=0x0000.*/VITE_ZAMA_TOKEN_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3/' .env.production
sed -i 's/VITE_DEX_ADDRESS=0x0000.*/VITE_DEX_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512/' .env.production
```

---

## 🎯 STEP 3: Git Push

```bash
# Deploy ettiysen klasöre dön
cd /path/to/ZAMA-DEX-FHE

# Değişiklikleri göster
git status

# Ekle
git add .env.production deployments/

# Commit yap
git commit -m "🚀 Deploy ZAMA DEX to Zama Testnet - Add contract addresses"

# Push
git push origin main
```

**Output:**
```
[main abc123d] 🚀 Deploy ZAMA DEX to Zama Testnet
 2 files changed, 10 insertions(+), 3 deletions(-)
 
Enumerating objects: 5, done.
Counting objects: 100% (5/5), done.
...
To github.com:dharmanan/ZAMA-DEX-FHE.git
   xyz789a..abc123d  main -> main
```

---

## 🎯 STEP 4: Vercel Otomatik Redeploy

Vercel, GitHub webhook'u üzerinden otomatik olarak trigger olur!

### Vercel Dashboard'da Ne Olur?

1. Push'tan hemen sonra Vercel bunu detect eder
2. **Build başlar** (otomatik)
3. **Deploy başlar** (otomatik)
4. **URL güncellenir** (otomatik)

### Vercel Dashboard'da Takip Et

```
https://vercel.com/dharmanan/ZAMA-DEX-FHE

Deployments sekmesine git → Latest deployment
├─ Status: Building... → Completed ✅
├─ Build logs görebilirsin
└─ URL: https://zama-dex-fhe.vercel.app (örnek)
```

### Build Log'unda Ne Göreceksin?

```
✓ Installed 187 packages
✓ Environment variables loaded
✓ Running build...
✓ Compiling...
✓ Generating static files
✓ Build completed in 45s
✓ Deployed!
```

---

## 🎯 STEP 5: Frontend'de Test

### Deploy Tamamlandıktan Sonra

1. **Vercel URL'ni aç**:
   ```
   https://zama-dex-fhe.vercel.app
   ```

2. **Kontrol Checklistesi**:
   - [ ] UI açılıyor mı?
   - [ ] Network: Zama FHEVM (ChainID 8008)?
   - [ ] Pool bilgisi gösteriyor mu?
   - [ ] ETH Reserve: 10 ETH?
   - [ ] Token Reserve: 1000 ZAMA?
   - [ ] LİKİDİTE GÖZÜKÜYOR MU? ✅

3. **Eğer likidite görünüyorsa:**
   ```
   ✅ TAM BAŞARILI!
   ├─ Contracts deploy edilmiş ✓
   ├─ Frontend Vercel'de çalışıyor ✓
   ├─ Pool açık ve liquidity var ✓
   └─ READY TO SWAP! 🎉
   ```

4. **Eğer likidite görünmüyorsa:**
   - [ ] .env.production doğru mu? (cat .env.production)
   - [ ] Contract adresler boş mu? (0x0000...)
   - [ ] Vercel build log'unda error var mı?
   - [ ] Deploy completed mi?

---

## 📋 ÖZET - İlk Deployment

### Timing

| Step | Zaman | Nereden |
|------|-------|---------|
| Deploy script | 2-3 dakika | Network erişimi olan place |
| Git push | < 1 dakika | Herhangi yerden |
| Vercel build | 1-2 dakika | Otomatik |
| **TOPLAM** | **5-10 dakika** | - |

### Checklist

- [ ] Network erişimi olan place'den deploy script çalıştırıldı
- [ ] Contract adresler alındı
- [ ] .env.production güncellendi
- [ ] Git push yapıldı
- [ ] Vercel dashboard'da build gösteriliyor
- [ ] Build completed (✅)
- [ ] Vercel URL açılıyor
- [ ] Pool bilgisi gösteriyor
- [ ] LİKİDİTE GÖZÜKÜYOR

---

## 🔧 TROUBLESHOOTING

### Problem 1: "Deploy script hata verdi"

```
Error: could not detect network
```

**Çözüm**: Network erişimi kontrol et
```bash
ping testnet-rpc.zama.ai
# veya
curl https://testnet-rpc.zama.ai:8545
```

### Problem 2: "Vercel build hatası"

Dashboard'da log'a bak:
```
ERROR: Cannot find module 'xyz'
```

**Çözüm**: 
```bash
npm install
```

### Problem 3: "Pool hala boş görünüyor"

Kontrol et:
```bash
# .env.production'da adres var mı?
grep VITE_DEX .env.production

# Eğer 0x0000... varsa:
# 1. Deploy script tekrar çalıştır
# 2. Adresler manüel güncelle
# 3. Git push yap
# 4. Vercel redeploy olur
```

### Problem 4: "Vercel build tamamlanmadı"

```
Build log'da error mı?
├─ Evet → Error fix et, push yap (re-deploy)
├─ Hayır → Build log'u oku
└─ Hala sorun? → GitHub Action logs bak
```

---

## ✨ İLERİ: Otomatik Deployment (GitHub Actions)

Gelecek seferinde deploy script'i otomatik çalıştırabilirsin:

```yaml
# .github/workflows/deploy.yml (create these files)

name: Deploy to Zama Testnet

on:
  workflow_dispatch:  # Manual trigger
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx hardhat run scripts/deploy-and-configure.js --network zama_fhevm
        env:
          PRIVATE_KEY: ${{ secrets.PRIVATE_KEY }}
```

Ama şu an manuel yap, daha kolay!

---

## 🎯 SONUÇ

**Deploy Process:**

```bash
# Network erişimi olan place'den:
npx hardhat run scripts/deploy-and-configure.js --network zama_fhevm

# Sonra:
git add .env.production deployments/
git commit -m "🚀 Deploy to Zama Testnet"
git push origin main

# Vercel otomatik handle ediyor:
# ✅ Build starts
# ✅ Environment variables loaded
# ✅ Deploy starts
# ✅ URL updated

# Frontend'de açıyorsun:
https://zama-dex-fhe.vercel.app → LİKİDİTE GÖZÜKÜYOR! 🎉
```

**Tamamı 5-10 dakika!**
