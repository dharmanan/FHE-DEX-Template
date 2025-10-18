# Relayer SDK Integration Guide

**Status**: 🔄 Next Phase Implementation  
**Priority**: HIGH - Required for encrypted swaps  
**Timeline**: 1-2 days (deep dive into repos)

---

## 📋 Overview

The Relayer SDK is essential for client-side submission of encrypted swap transactions. This guide outlines the integration steps and architecture.

## 🎯 Key Requirements

### What We Need
1. **Relayer SDK Client**: Submit encrypted transactions to relayers
2. **Encryption Wrapper**: Encrypt swap parameters before submission
3. **Callback Handler**: Process decrypted results from oracle
4. **Error Handling**: Manage relayer failures and timeouts

### From Discord Mod
> "You will need to deal with the relayer SDK on the client side for submitting encrypted swaps etc. Those repos have all files so just take the next day to dive deep into it and you will be good to go"

**Interpretation**:
- ✅ Zama provides complete relayer SDK implementation
- ✅ All necessary files are in their public repos
- ✅ 1 day of research → full understanding
- ✅ Then implement in our DEX frontend

---

## 🔍 Deep Dive Resources

### Zama FHEVM Official Repos
```
https://github.com/zama-ai/fhevm
├── examples/
│   ├── zama-oracle/          # Oracle relayer system
│   └── react-app/            # Frontend integration example
├── lib/
│   └── solidity/             # Contract utilities
└── relayer/                  # Relayer SDK reference
```

### Key Files to Study
1. **Relayer SDK Implementation**
   - File: `fhevm-relayer/src/relayer.ts`
   - Purpose: Client-side submission to relayers
   - Learn: How to format encrypted transactions

2. **Encryption Utilities**
   - File: `fhevm-core/src/encrypt.ts`
   - Purpose: Encrypt user data before submission
   - Learn: euint64 encryption for swap amounts

3. **React Integration Example**
   - File: `examples/react-app/src/hooks/useRelayer.ts`
   - Purpose: Hook-based relayer interaction
   - Learn: Frontend component pattern

4. **Oracle Callback Handler**
   - File: `fhevm-oracle/src/callbacks.ts`
   - Purpose: Handle decrypted results
   - Learn: Result processing pipeline

---

## 🏗️ Integration Architecture

```
┌─────────────────────────────────────────────┐
│          React Frontend (useDEX.ts)         │
├─────────────────────────────────────────────┤
│                                             │
│  1. User initiates swap                     │
│     └─> swapEthForToken(amount)            │
│                                             │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│     Relayer SDK Client (NEW COMPONENT)      │
├─────────────────────────────────────────────┤
│                                             │
│  2. Encrypt swap amount (euint64)           │
│  3. Package transaction data                │
│  4. Submit to relayer endpoint              │
│                                             │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│    Zama Relayer Network (OFF-CHAIN)         │
├─────────────────────────────────────────────┤
│                                             │
│  5. Decrypt swap parameters (FHE)          │
│  6. Validate transaction                    │
│  7. Submit to blockchain                    │
│                                             │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│     Smart Contract (FHEDEX.sol)             │
├─────────────────────────────────────────────┤
│                                             │
│  8. Execute encrypted swap                  │
│  9. Emit encrypted results                  │
│ 10. Return receipt to frontend              │
│                                             │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│    Oracle Callback Handler (NEW)            │
├─────────────────────────────────────────────┤
│                                             │
│ 11. Listen for oracle callback events       │
│ 12. Decrypt result with user's key          │
│ 13. Update UI with swap result              │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 📁 Files to Create/Modify

### New Files

#### 1. `src/services/relayerClient.ts`
**Purpose**: Manage relayer SDK communication

```typescript
// Responsibilities:
// - Initialize relayer SDK
// - Submit encrypted transactions
// - Track pending transactions
// - Handle relayer responses

class RelayerClient {
  async submitEncryptedSwap(params: SwapParams): Promise<string> {
    // 1. Encrypt swap parameters
    // 2. Send to relayer
    // 3. Return transaction hash
  }

  async waitForCallback(txHash: string): Promise<DecryptedResult> {
    // Listen for oracle callback
    // Return decrypted swap result
  }
}
```

#### 2. `src/services/encryptionService.ts`
**Purpose**: Handle FHE encryption/decryption

```typescript
// Responsibilities:
// - Encrypt amounts (euint64)
// - Prepare encrypted calldata
// - Verify encryption integrity
// - Handle key management

class EncryptionService {
  encryptAmount(amount: BigNumber): euint64 {
    // Convert to FHE euint64
  }

  prepareCalldata(encrypted: euint64): string {
    // Format for contract submission
  }
}
```

#### 3. `src/hooks/useRelayer.ts`
**Purpose**: React hook for relayer interaction

```typescript
// Hook for components:
// - useRelayerSwap()
// - useRelayerStatus()
// - useRelayerCallback()

export function useRelayerSwap() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DecryptedResult | null>(null);
  
  const executeSwap = async (amount: string) => {
    // Use RelayerClient and EncryptionService
  };

  return { executeSwap, isLoading, result };
}
```

### Modified Files

#### 1. `src/hooks/useDEX.ts`
**Before**: Direct contract calls  
**After**: Route through RelayerClient

```typescript
// Change from:
// await contract.swapEthForToken(encryptedAmount);

// To:
// await relayerClient.submitEncryptedSwap({ ... });
// await oracleClient.waitForCallback(txHash);
```

#### 2. `src/components/SwapComponent.tsx`
**Changes**: Handle relayer callback events

```typescript
// Add:
// - Loading state during relayer processing
// - Success notification from oracle
// - Error handling for relayer failures
// - Retry mechanism
```

---

## 🔐 Security Considerations

### Before Implementation
- [ ] Review Zama's security recommendations
- [ ] Understand key management
- [ ] Plan encryption key rotation
- [ ] Design error recovery

### During Implementation
- [ ] Validate all encrypted inputs
- [ ] Sanitize relayer responses
- [ ] Implement timeout mechanisms
- [ ] Log security events

### After Implementation
- [ ] Audit relayer communication
- [ ] Test encryption/decryption
- [ ] Security review of callbacks
- [ ] Penetration testing

---

## 📊 Implementation Phases

### Phase 1: Research (Day 1)
**Goals**:
- [ ] Clone and explore Zama repos
- [ ] Read Relayer SDK documentation
- [ ] Study encryption utilities
- [ ] Review React integration examples

**Time**: 4-6 hours

### Phase 2: Core Implementation (Day 2-3)
**Goals**:
- [ ] Create RelayerClient service
- [ ] Create EncryptionService
- [ ] Create useRelayer hook
- [ ] Integrate with useDEX

**Time**: 8-12 hours

### Phase 3: Frontend Integration (Day 3-4)
**Goals**:
- [ ] Update SwapComponent
- [ ] Add relayer UI feedback
- [ ] Implement error handling
- [ ] Add success notifications

**Time**: 6-8 hours

### Phase 4: Testing & Deployment (Day 4-5)
**Goals**:
- [ ] Unit tests for services
- [ ] Integration tests with testnet
- [ ] E2E swap testing
- [ ] Vercel deployment

**Time**: 8-10 hours

---

## ✅ Checklist Before Relayer Implementation

### Smart Contract Side ✅
- [x] FHEDEX.sol compiles
- [x] ZamaToken compiles
- [x] Functions defined: `swapEthForToken`, `swapTokenForEth`, etc.
- [x] Encrypted state management ready
- [x] Oracle callback structure defined

### Build Pipeline ✅
- [x] Tests passing (8/8)
- [x] Production build working
- [x] Vercel deployment ready
- [x] Environment variables configured

### Frontend Structure ✅
- [x] React 19 setup
- [x] TypeScript configured
- [x] Hooks infrastructure ready
- [x] Ethers.js integrated

### Missing (Relayer SDK) ⏳
- [ ] RelayerClient service
- [ ] EncryptionService
- [ ] useRelayer hook
- [ ] Oracle callback handler
- [ ] Relayer error handling

---

## 🎯 Next Steps

1. **Study Phase** (1 day)
   - Deep dive into Zama FHEVM repos
   - Document relayer API
   - Create implementation plan

2. **Implementation** (2-3 days)
   - Code RelayerClient and services
   - Integrate with frontend
   - Test on testnet

3. **Deployment** (1 day)
   - Final testing
   - Security review
   - Vercel deployment

---

## 📚 Useful Resources

### Zama Official
- [FHEVM Docs](https://docs.zama.ai/fhevm)
- [GitHub Repos](https://github.com/zama-ai)
- [Discord Support](https://discord.gg/fhe-community)

### Key Concepts
- **Relayer**: Off-chain service that decrypts and submits transactions
- **Oracle**: Callback system to return decrypted results
- **euint64**: 64-bit encrypted unsigned integer type
- **FHE Operations**: add, sub, mul, div on encrypted data

---

## 🚀 Success Criteria

✅ System is ready when:
1. [ ] RelayerClient submits encrypted swaps
2. [ ] Oracle callbacks return decrypted results
3. [ ] Frontend displays swap results
4. [ ] Error handling works properly
5. [ ] Integration tests pass
6. [ ] Vercel deployment succeeds
7. [ ] Live swap transaction completes on testnet

---

**Status**: Ready for Deep Dive  
**Current Build**: ✅ Production Ready (Tests: 8/8 passing)  
**Next Phase**: Relayer SDK Integration  
**Timeline**: Start now, 1-2 days to completion

