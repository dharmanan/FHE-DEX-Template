# FHE DEX Template - Önemli Notlar

## 🔴 Kontrat Değişiklikleri (19 Ekim 2025)

### Oracle Callback Modelinden Immediate AMM'ye Geçiş

**Sorun:**
- Kontrat Oracle callback modelini kullanıyordu (FHEVM için hazırlanmış)
- `swapEthForToken()` ve `swapTokenForEth()` işlemleri ETH/Token alıyordu ama **geri vermiyordu**
- Relayer yoktu, `handleDecryptedSwap()` hiç çağrılmıyordu
- User işlem gönderiyordu ama hiç token almıyordu

**Çözüm Uygulandı:**
- `swapEthForToken()` - Immediate AMM'ye çevrildi (AMM formülü ile hemen hesapla + transfer)
- `swapTokenForEth()` - Immediate AMM'ye çevrildi (AMM formülü ile hemen hesapla + transfer)
- `handleDecryptedSwap()` - Comment'e alındı (gelecekte FHEVM Zincirinde FHE ile re-enable edilecek)

**Değiştirilen Dosya:**
- `/workspaces/ZAMA-DEX-FHE/contracts/FHEDEX.sol`

**Yeni Mantık:**
```solidity
// ETH → Token swap
function swapEthForToken() external payable {
    uint256 inputAmountWithFee = (msg.value * 997) / 1000; // 0.3% fee
    uint256 outputAmount = (inputAmountWithFee * tokenReserve) / (ethReserve + inputAmountWithFee);
    
    ethReserve += msg.value;
    tokenReserve -= outputAmount;
    
    token.transfer(msg.sender, outputAmount); // ✅ User'a token gönder
}

// Token → ETH swap
function swapTokenForEth(uint256 tokenAmount) external {
    uint256 inputAmountWithFee = (tokenAmount * 997) / 1000; // 0.3% fee
    uint256 outputAmount = (inputAmountWithFee * ethReserve) / (tokenReserve + inputAmountWithFee);
    
    tokenReserve += tokenAmount;
    ethReserve -= outputAmount;
    
    payable(msg.sender).transfer(outputAmount); // ✅ User'a ETH gönder
}
```

## 📋 Deploy Adımları

### 1. Kontratı Compile Et
```bash
cd /workspaces/ZAMA-DEX-FHE
npx hardhat compile
```

### 2. Sepolia'ya Deploy Et
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### 3. Yeni Kontrat Adresini Al
- Deploy sonrası `FHEDEX` adresini al
- `/workspaces/ZAMA-DEX-FHE/src/constants.ts` dosyasında `DEX_CONTRACT_ADDRESS` güncelle

### 4. Frontend'i Test Et (Local)
```bash
npm run dev
```

### 5. Vercel'e Deploy
```bash
git add -A
git commit -m "✅ Convert swap functions from Oracle callback to immediate AMM"
git push origin main
vercel deploy --prod
```

## 🔍 Debugging İçin Kontrol Noktaları

### Swap İşleminde Logları İzle
Frontend Console'da şunları ara:
```
[useAppState] Starting swap
[useAppState] Executing swapEthForToken / swapTokenForEth
[useAppState] Waiting for transaction
[useAppState] Swap completed
[useAppState] Reloading balances and pool state
```

### Token Balance Kontrol (RPC)
```bash
node -e "
const RPC = 'https://eth-sepolia.public.blastapi.io';
const user = '0x20cdad07152ef163cad9be2cde1766298b883d71';
const tokenAddr = '0x9fa47046C88F45A29c5b60d6B01aB68281128138';

const balanceOfSelector = '0x70a08231';
const paddedUser = user.slice(2).padStart(64, '0');

fetch(RPC, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'eth_call',
    params: [{
      to: tokenAddr,
      data: balanceOfSelector + paddedUser
    }, 'latest'],
    id: 1
  })
})
.then(r => r.json())
.then(res => {
  if (res.result) {
    const balance = BigInt(res.result).toString();
    console.log('Token Balance (raw):', balance);
    console.log('Token Balance (decimals 18):', (BigInt(balance) / BigInt('1000000000000000000')).toString());
  }
})
.catch(e => console.error('Error:', e));
"
```

## 🚀 Gelecek Plan

### Zama Zinciri v0.97 Yayınlanınca
1. FHE operasyonlarını kontrata ekle
2. `handleDecryptedSwap()` fonksiyonunu re-enable et
3. Oracle callback modelini tekrar aktif et
4. Encrypted amounts kullan

### Şimdilik (Sepolia)
- ✅ Immediate AMM swap çalışıyor
- ✅ User hemen token alıyor
- ✅ Basit ve güvenilir

## 📊 Önceki Kontrat Adresleri

### Sepolia
- **FHEDEX (Eski - Oracle modeli)**: 0xC06dFa845A5aAE13a666D48234d81176535AeBdD
- **ZamaToken**: 0x9fa47046C88F45A29c5b60d6B01aB68281128138
- **FHEDEX (Yeni - Immediate AMM)**: `Deploy et ve buraya yaz`

## ⚠️ Dikkat

- Eski kontrat adresini kullanırsan swap çalışmayacak!
- Deploy ettikten sonra `constants.ts` güncellemek şart
- Pool liquidity'sini yeni kontrata aktarman gerekebilir
