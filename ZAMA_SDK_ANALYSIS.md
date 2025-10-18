# Zama Relayer SDK Analysis - Official Implementation Guide

**Source**: https://github.com/zama-ai/relayer-sdk  
**Status**: Analyzed and integrated  
**Date**: October 18, 2025

---

## 🎯 Key Findings from Official SDK

### 1. Relayer Operations

The SDK defines 4 main relayer operations:

```typescript
type RelayerOperation =
  | 'INPUT_PROOF'    // Encrypt input values
  | 'PUBLIC_DECRYPT' // Decrypt publicly (no KMS needed)
  | 'USER_DECRYPT'   // Decrypt with user's private key (KMS)
  | 'KEY_URL'        // Fetch FHE keys from relayer
```

### 2. Encryption Flow

**Create Encrypted Input**:
```typescript
const encryptedInput = instance.createEncryptedInput(contractAddress, userAddress);
encryptedInput.add64(swapAmount);
const { handles, inputProof } = await encryptedInput.encrypt();
```

**Send to Contract**:
```solidity
// Use handles in contract function call
contract.swapEthForToken(...handles);
```

### 3. Decryption Flows

**Public Decrypt** (No user key needed):
```typescript
const result = await instance.publicDecrypt(handles);
```

**User Decrypt** (Requires user's private key):
```typescript
const signature = instance.createEIP712(...);
const result = await instance.userDecrypt(handles, signature);
```

### 4. Payload Structures

#### INPUT_PROOF (Encryption)
```typescript
type RelayerInputProofPayload = {
  contractAddress: `0x${string}`;
  userAddress: `0x${string}`;
  ciphertextWithInputVerification: string;  // Hex encoded proof
  contractChainId: `0x${string}`;
  extraData: `0x${string}`;  // Default: 0x00
};
```

#### PUBLIC_DECRYPT
```typescript
type RelayerPublicDecryptPayload = {
  ciphertextHandles: `0x${string}`[];
  extraData: `0x${string}`;  // Default: 0x00
};
```

#### USER_DECRYPT
```typescript
type RelayerUserDecryptPayload = {
  handleContractPairs: {
    handle: `0x${string}`;
    contractAddress: `0x${string}`;
  }[];
  requestValidity: {
    startTimestamp: string;
    durationDays: string;
  };
  contractsChainId: string;
  contractAddresses: `0x${string}`[];
  userAddress: `0x${string}`;
  signature: string;        // EIP-712 signature
  publicKey: string;        // User's KMS public key
  extraData: `0x${string}`;
};
```

### 5. Response Format

```typescript
type RelayerFetchResponseJson = {
  response: any;  // Operation-specific response
  status: string; // 'success' or 'failure'
};
```

### 6. Error Handling

Zama uses specific error patterns:

```typescript
// Example error from SDK
throw new Error('User decrypt failed: relayer respond with HTTP code 403', {
  cause: {
    code: 'RELAYER_FETCH_ERROR',
    operation: 'USER_DECRYPT',
    status: 403,
  },
});
```

### 7. API Endpoints (Standard)

```
https://testnet-relayer.zama.ai/
├── /v1/input-proof      (POST) - Encrypt
├── /v1/public-decrypt   (POST) - Public decrypt
├── /v1/user-decrypt     (POST) - User decrypt (KMS)
├── /keys                (GET)  - Fetch FHE keys
└── /health              (GET)  - Health check (implied)
```

---

## 🔄 DEX Swap Flow with Official SDK

### Step 1: User Initiates Swap

```typescript
// User wants to swap 1 ETH for tokens
const amount = ethers.utils.parseEther('1.0');

// Trigger swap in frontend component
await dex.swapEthForToken('1.0');
```

### Step 2: Encryption (useRelayer)

```typescript
// 1. Create encrypted input using official SDK
const encryptedInput = instance.createEncryptedInput(
  contractAddress,
  userAddress
);

// 2. Add the swap amount (encrypted)
encryptedInput.add64(amount);

// 3. Encrypt (sends to relayer automatically)
const { handles, inputProof } = await encryptedInput.encrypt();

// handles: Array of encrypted data (euint64)
// inputProof: Proof for relayer verification
```

### Step 3: Submit to Contract

```solidity
// FHEDEX contract receives:
// - handles: encrypted swap amount (euint64)
// - inputProof: proof from relayer
// - msg.value: actual ETH amount

function swapEthForToken(bytes32[] calldata handles) external payable {
  // Contract receives encrypted amount as handles
  // Can perform FHE arithmetic on the handle
  euint64 swapAmount = FHE.asEuint64(handles[0]);
  
  // Add ETH to encrypted reserves
  ethReserve = FHE.add(ethReserve, swapAmount);
  
  // Emit event requesting output calculation
  emit SwapRequested(msg.sender, "ETH_TO_TOKEN", swapAmount);
}
```

### Step 4: Decrypt Result (Oracle Callback)

```typescript
// Relayer sees swap event and requests decryption
// User calls publicDecrypt or userDecrypt to get result

const swapResult = await instance.publicDecrypt(handles);
// OR with user key:
const swapResult = await instance.userDecrypt(handles, signature);

// Result contains actual output token amount
console.log('Tokens received:', swapResult);
```

---

## 📝 Implementation Update Needed

### Our Current RelayerClient vs Official SDK

**Current (Ours)**:
```typescript
// Simplified mock structure
await relayerClient.submitEncryptedSwap(params);
// Returns: txHash

// Waits for callback
const result = await relayerClient.waitForCallback(txHash);
```

**Official SDK** (should integrate):
```typescript
// More detailed flow
const encryptedInput = await instance.createEncryptedInput(...);
const { handles, inputProof } = await encryptedInput.encrypt();

// Submit directly to contract (no intermediate relayer step for swap)
const tx = await contract.swapEthForToken(handles);

// Then decrypt result when needed
const result = await instance.publicDecrypt(handles);
```

### Updated Integration Strategy

**Option 1: Use Official SDK Directly**
- Import `@zama-ai/fhevm-core`
- Use official `createInstance()` and `createEncryptedInput()`
- Remove our EncryptionService mock
- Focus RelayerClient on callback listening only

**Option 2: Compatibility Layer** (Recommended)
- Keep our hooks API the same
- Underneath, use official SDK for encryption
- Our RelayerClient becomes adapter for callback handling
- Best of both worlds: familiar API + official implementation

---

## 🔧 Required Updates

### 1. Update EncryptionService

```typescript
// Instead of mock encryption, use official SDK
import { createInstance, FhevmInstanceConfig } from '@zama-ai/fhevm-core';

export class EncryptionService {
  private instance: FhevmInstance;

  async initialize(config: FhevmInstanceConfig) {
    this.instance = await createInstance(config);
  }

  async encryptAmount(amount: BigNumber): Promise<EncryptedAmount> {
    const encryptedInput = this.instance.createEncryptedInput(
      this.contractAddress,
      this.userAddress
    );
    encryptedInput.add64(amount);
    const { handles, inputProof } = await encryptedInput.encrypt();
    
    return {
      value: handles,
      metadata: { inputProof, amount }
    };
  }
}
```

### 2. Update RelayerClient

```typescript
// Focus on callback listening after contract execution
export class RelayerClient {
  private instance: FhevmInstance;

  async waitForCallback(txHash: string): Promise<DecryptedResult> {
    // Listen for oracle event
    // Request decryption from relayer when ready
    const decrypted = await this.instance.publicDecrypt(handles);
    return decrypted;
  }
}
```

### 3. Installation

```bash
npm install @zama-ai/fhevm-core @zama-ai/fhevm-js @zama-ai/tfhe
```

---

## 🎯 Our DEX Swap Architecture (Updated)

```
User clicks "Swap 1 ETH"
        ↓
┌───────────────────────────────────┐
│  useDEX.swapEthForToken('1.0')    │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│  useRelayer.submitSwap()          │
│  - Amount: BigNumber(1 ETH)       │
│  - Direction: 'ETH_TO_TOKEN'      │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│  EncryptionService                │
│  Uses: fhevm SDK                  │
│  .createEncryptedInput()          │
│  .add64(amount)                   │
│  .encrypt() → handles             │
└────────────┬──────────────────────┘
             ↓
┌───────────────────────────────────┐
│  useDEX.contract                  │
│  .swapEthForToken(handles)        │
│  { value: 1 ETH }                 │
└────────────┬──────────────────────┘
             ↓
         [Blockchain]
    Smart Contract executes:
    - Reserve: ethReserve + encrypted(1 ETH)
    - Emit event with output handle
             ↓
┌───────────────────────────────────┐
│  RelayerClient                    │
│  .waitForCallback(txHash)         │
│  Uses: fhevm SDK                  │
│  .publicDecrypt(handles)          │
└────────────┬──────────────────────┘
             ↓
    Return: DecryptedResult
    - outputAmount: 100 tokens
    - txHash: 0x...
    - success: true
             ↓
        Update UI
```

---

## 📊 Zama SDK vs Our Implementation

| Feature | Zama SDK | Our Implementation |
|---------|----------|-------------------|
| Encryption | Official TFHE | Will use Zama's |
| Decryption | Official | Will use Zama's |
| Handles | Proper format | Will use Zama's |
| Input Proof | Generates | Will use Zama's |
| Error Handling | Comprehensive | Already added |
| Retry Logic | Built-in (fetch-retry) | Our layer |
| TypeScript Types | Extensive | Already comprehensive |
| React Hooks | Not provided | Our contribution |
| DEX Integration | Not provided | Our implementation |

---

## ✅ Checklist for Integration

### Immediate
- [ ] Install Zama SDK packages
- [ ] Update EncryptionService to use official SDK
- [ ] Update RelayerClient to use official SDK's decrypt
- [ ] Test with Zama testnet

### Medium Term
- [ ] Remove mock encryption code
- [ ] Add SDK initialization in useRelayer
- [ ] Add SDK error handling
- [ ] Update types to match SDK types

### Long Term
- [ ] Publish npm package
- [ ] Create SDK documentation
- [ ] Add example apps
- [ ] Performance optimization

---

## 📚 Official SDK Docs

- **Main Docs**: https://docs.zama.ai/fhevm
- **GitHub**: https://github.com/zama-ai/fhevm-sdk
- **NPM Packages**:
  - `@zama-ai/fhevm-core` - Main SDK
  - `@zama-ai/fhevm-js` - JavaScript utilities
  - `@zama-ai/tfhe` - TFHE WebAssembly

---

## 🚀 Next Steps

1. **Install packages**: `npm install @zama-ai/fhevm-core`
2. **Update EncryptionService**: Use official SDK
3. **Update RelayerClient**: Use official SDK's decrypt
4. **Test locally**: Run with mock relayer
5. **Test on testnet**: Deploy and test live swaps

---

**Status**: Ready for Zama SDK integration  
**Impact**: More reliable, official implementation  
**Effort**: Medium (refactor encryption layer)  
**Benefit**: Production-ready code

