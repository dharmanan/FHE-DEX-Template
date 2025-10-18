# Vercel Deployment Guide

Bu rehber ZAMA DEX FHE'yi Vercel'de yayınlamak için adım-adım talimatlar içerir.

## Prerequisites

1. **GitHub Account** - Repository'nin bağlı olması gerekir
2. **Vercel Account** - Ücretsiz: https://vercel.com
3. **Repository** - Bu proje GitHub'da public olmalı

## Step 1: GitHub'a Push

Tüm değişikliklerin GitHub'a pushlandığından emin olun:

```bash
git status
git add -A
git commit -m "Production ready for Vercel deployment"
git push origin main
```

## Step 2: Vercel'e Connect Olun

### 2.1 Vercel'e Giriş
- https://vercel.com adresine gidin
- GitHub ile sign up / sign in yapın

### 2.2 Projeyi Import Edin
1. Dashboard'da "Add New" → "Project" tıklayın
2. "Import Git Repository" seçin
3. GitHub'dan `ZAMA-DEX-FHE` projesini seçin
4. "Import" tıklayın

## Step 3: Environment Variables Ayarla

### 3.1 Vercel Dashboard'da
1. Project → Settings → "Environment Variables" sayfasına gidin
2. Aşağıdaki değişkenleri ekleyin:

```
VITE_ZAMA_TOKEN_ADDRESS=0xb2B26a1222D5c02a081cBDC06277D71BD50927e6
VITE_DEX_ADDRESS=0x50B85A4A3c76be5B36c1CfA04B1AFc44dd1EBE7c
VITE_NETWORK_ID=11155111
VITE_NETWORK_NAME=sepolia
VITE_RPC_URL=https://sepolia.infura.io/v3/392b6fec32744b34a4850eb2ce3cea2c
```

3. "Save" tıklayın

### 3.2 Deployment Configuration
Vercel otomatik olarak `vercel.json` dosyasından ayarları okuyacaktır:
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
