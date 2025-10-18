# Zama FHEVM Relayer SDK - Research & Implementation Guide

**Objective**: Understand and implement relayer SDK for encrypted swap transactions

---

## 📚 Phase 1: Understanding Relayer Architecture

### What is a Relayer?

A **relayer** is an off-chain service that:
1. Receives encrypted transaction data from the client
2. Decrypts the data using FHE (Fully Homomorphic Encryption)
3. Executes the transaction on-chain
4. Returns encrypted results to the client

### Relayer Flow

```
┌──────────────┐
│   Frontend   │
│   (React)    │
└──────┬───────┘
       │
       │ 1. Encrypt swap params
       │    swapAmount = encrypt(100 tokens)
       │
       ▼
┌──────────────────────────┐
│  RelayerClient Service   │
│  (src/services)          │
└──────┬───────────────────┘
       │
       │ 2. Submit encrypted data to relayer endpoint
       │    POST /api/relayer/submitTransaction
       │
       ▼
┌──────────────────────────┐
│   Zama Relayer           │
│   (Off-chain service)    │
└──────┬───────────────────┘
       │
       │ 3. Decrypt with FHE
       │ 4. Verify transaction
       │ 5. Submit to blockchain
       │
       ▼
┌──────────────────────────┐
│   Smart Contract         │
│   (FHEDEX.sol)           │
└──────┬───────────────────┘
       │
       │ 6. Execute encrypted swap
       │ 7. Emit Oracle callback
       │
       ▼
┌──────────────────────────┐
│  Oracle Callback         │
│  Listener (Event)        │
└──────┬───────────────────┘
       │
       │ 8. Detect callback event
       │ 9. Decrypt result
       │
       ▼
┌──────────────────────────┐
│   UI Update              │
│   (Show swap result)     │
└──────────────────────────┘
```

---

## 🔍 Key Concepts

### 1. euint64 (Encrypted Unsigned Integer 64-bit)
- Zama's encrypted integer type
- Used for amounts, reserves, balances
- Operations: add, sub, mul, div (on encrypted data)

### 2. FHE Library
```solidity
import "@fhevm/solidity/lib/FHE.sol";

// Convert public to encrypted
euint64 encrypted = FHE.asEuint64(1000);

// Operations on encrypted data
euint64 result = FHE.add(a, b);  // a + b (encrypted)
euint64 result = FHE.sub(a, b);  // a - b (encrypted)
euint64 result = FHE.mul(a, b);  // a * b (encrypted)
euint64 result = FHE.div(a, b);  // a / b (encrypted)
```

### 3. Oracle Callbacks
```solidity
// Contract requests decryption
FHE.requestDecryption(encryptedValue, callbackSelector, callbackData);

// Relayer decrypts and calls callback
// function onDecryptionResult(uint256 requestId, uint64 decryptedValue) external
```

### 4. Client-Side Encryption
```typescript
// Before submitting to relayer
const encryptedAmount = await encryptionService.encryptAmount(userAmount);
const calldata = await encryptionService.prepareCalldata(encryptedAmount);

// Send to relayer
await relayerClient.submitEncryptedTransaction(calldata);
```

---

## 🎯 Key Resources to Study

### 1. Zama FHEVM Official Documentation
- **URL**: https://docs.zama.ai/fhevm
- **Topics to Read**:
  - Getting Started
  - Solidity API Reference (FHE library)
  - Encrypted types (euint32, euint64, etc.)
  - Oracle callbacks and relayers
  - Examples and tutorials

### 2. GitHub Repositories
```
https://github.com/zama-ai/fhevm
├── examples/
│   ├── 01_require_comparison
│   ├── 02_upgradeable_contracts
│   ├── 03_access_control
│   ├── react-app/          ← Frontend integration!
│   └── threshold_encryption
├── lib/
│   ├── solidity/
│   │   └── FHE.sol         ← Core FHE operations
│   └── JS/                 ← Client-side utilities
└── relayer/                ← Relayer implementation
```

### 3. React App Example
**Most Important**: `examples/react-app/`
- Frontend interaction pattern
- Hooks for contract calls
- Encrypted transaction submission
- Result handling

### 4. Contract Examples
```
https://github.com/zama-ai/fhevm/blob/main/examples/

Key files:
- 01_require_comparison/ConfidentialERC20.sol
  → Shows encrypted state (our FHEDEX)
- react-app/src/components/erc20.tsx
  → Shows frontend interaction (our useDEX)
```

---

## 💻 Implementation Strategy

### Phase 1: Core Services (2 hours)

#### 1.1 RelayerClient Service
**File**: `src/services/relayerClient.ts`

Responsibilities:
```typescript
class RelayerClient {
  // Connect to relayer endpoint
  constructor(relayerEndpoint: string);
  
  // Submit encrypted transaction
  async submitEncryptedSwap(params: SwapParams): Promise<TxHash>;
  
  // Wait for Oracle callback
  async waitForCallback(txHash: string, timeout?: number): Promise<DecryptedResult>;
  
  // Check relayer status
  async getStatus(): Promise<RelayerStatus>;
  
  // Handle errors and retries
  private async retryWithBackoff<T>(fn: () => Promise<T>): Promise<T>;
}
```

#### 1.2 EncryptionService
**File**: `src/services/encryptionService.ts`

Responsibilities:
```typescript
class EncryptionService {
  // Initialize with contract ABI
  constructor(contractAbi: any, publicKey?: string);
  
  // Encrypt amount to euint64
  async encryptAmount(amount: BigNumber): Promise<EncryptedAmount>;
  
  // Prepare calldata for contract
  async prepareCalldata(method: string, encrypted: EncryptedAmount): Promise<string>;
  
  // Verify encryption integrity
  async verifyEncryption(encrypted: EncryptedAmount): Promise<boolean>;
}
```

### Phase 2: React Hooks (2 hours)

#### 2.1 useRelayer Hook
**File**: `src/hooks/useRelayer.ts`

```typescript
export function useRelayer() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<DecryptedResult | null>(null);

  const submitSwap = async (amount: string, direction: 'ETH_TO_TOKEN' | 'TOKEN_TO_ETH') => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Encrypt
      // 2. Submit to relayer
      // 3. Wait for callback
      // 4. Update UI
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return { submitSwap, isLoading, error, result };
}
```

#### 2.2 Update useDEX Hook
**File**: `src/hooks/useDEX.ts`

- Replace direct contract calls with relayer calls
- Use EncryptionService for amount encryption
- Handle async callbacks

### Phase 3: UI Components (2 hours)

#### 3.1 SwapComponent Updates
- Add loading states during relayer processing
- Show transaction pending indicator
- Display decrypted swap result
- Error handling and retry buttons

---

## 📋 Implementation Checklist

### Research Phase ✅
- [ ] Read Zama FHEVM documentation
- [ ] Study GitHub examples (especially react-app)
- [ ] Understand euint64 and FHE operations
- [ ] Understand Oracle callbacks
- [ ] Document API endpoints

### Core Services Phase
- [ ] Create RelayerClient service
- [ ] Create EncryptionService
- [ ] Implement error handling
- [ ] Add retry logic
- [ ] Test with mock responses

### React Hooks Phase
- [ ] Create useRelayer hook
- [ ] Update useDEX hook
- [ ] Add loading states
- [ ] Add error boundaries

### UI Integration Phase
- [ ] Update SwapComponent
- [ ] Add relayer feedback
- [ ] Test UI flows
- [ ] Add animations/transitions

### Testing Phase
- [ ] Unit tests for services
- [ ] Integration tests with testnet
- [ ] E2E swap test
- [ ] Error scenario testing

---

## 🔗 Relayer API (Typical)

Most relayers follow this pattern:

### Endpoints

**1. Submit Encrypted Transaction**
```
POST /api/relayer/submit
Content-Type: application/json

{
  "encryptedCalldata": "0x...",
  "contractAddress": "0x...",
  "chainId": 8008,
  "gasLimit": 500000,
  "nonce": 42
}

Response:
{
  "txHash": "0x...",
  "status": "pending",
  "estimatedTime": 30000  // milliseconds
}
```

**2. Get Transaction Status**
```
GET /api/relayer/status/{txHash}

Response:
{
  "status": "pending|completed|failed",
  "txHash": "0x...",
  "blockNumber": 12345,
  "callbackData": "0x..."  // if completed
}
```

**3. Get Relayer Status**
```
GET /api/relayer/health

Response:
{
  "status": "healthy",
  "version": "1.0.0",
  "supportedChains": [8008]
}
```

---

## 🔐 Security Considerations

### For Client
1. **Never expose private key** to relayer
2. **Verify relayer endpoint** (HTTPS, certificate pinning)
3. **Validate encrypted data** before sending
4. **Timeout on callbacks** (prevent hanging)
5. **Log security events** for audit trail

### For Relayer Communication
1. Use HTTPS only
2. Implement rate limiting
3. Add request signature verification
4. Include nonce to prevent replay attacks
5. Validate all inputs

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
describe('RelayerClient', () => {
  it('should encrypt amount correctly', async () => {
    const encrypted = await encryptionService.encryptAmount(parseUnits('100', 18));
    expect(encrypted).toBeDefined();
    expect(encrypted.length).toBeGreaterThan(0);
  });

  it('should submit encrypted swap', async () => {
    const result = await relayerClient.submitEncryptedSwap({...});
    expect(result.txHash).toMatch(/^0x/);
  });
});
```

### Integration Tests
```typescript
describe('Relayer Integration', () => {
  it('should execute full swap flow', async () => {
    // 1. Encrypt amount
    // 2. Submit to relayer
    // 3. Wait for callback
    // 4. Verify result
  });
});
```

### Testnet Testing
```bash
npm run deploy  # Deploy contracts to Zama testnet
npm run test:relayer  # Run full integration test
```

---

## 📊 Current Contract Analysis

### FHEDEX.sol - What We Have
✅ Encrypted reserves (euint64)
✅ addLiquidity function
✅ removeLiquidity function
✅ swapEthForToken function (stubbed)
✅ swapTokenForEth function (stubbed)

### What We Need to Add
⏳ Full swap arithmetic via encrypted operations
⏳ Oracle callback handling
⏳ Decryption request mechanism
⏳ Result verification

### Relayer Integration Points
1. **On submitEncryptedSwap()**
   - Calculate swap output using encrypted arithmetic
   - Request decryption of result via Oracle
   - Store pending swap state

2. **On Oracle Callback**
   - Receive decrypted result from relayer
   - Transfer output tokens/ETH to user
   - Emit swap completion event

---

## 🚀 Next Steps

1. **Today (4-6 hours)**
   - Read Zama FHEVM docs
   - Study GitHub examples
   - Create implementation plan
   - Document API structure

2. **Tomorrow (Full day)**
   - Implement RelayerClient
   - Implement EncryptionService
   - Create useRelayer hook
   - Update useDEX hook

3. **Day 3**
   - Integrate with UI components
   - Add error handling
   - Test with testnet
   - Deploy to Vercel

---

## 📚 File Locations to Check

**Zama Official Examples**:
- https://github.com/zama-ai/fhevm/tree/main/examples/react-app

**Critical Files to Study**:
1. `examples/react-app/src/hooks/useContractWrite.ts` → Our useRelayer
2. `examples/react-app/src/services/relayer.ts` → Our RelayerClient
3. `lib/solidity/FHE.sol` → FHE operations
4. `lib/JS/encrypt.ts` → Our EncryptionService

---

## 💡 Key Insights

1. **Relayers are Optional** - You can run your own or use Zama's official one
2. **Encryption is Frontend** - All encryption happens client-side
3. **Callbacks are Async** - Results come via Oracle events, not return values
4. **euint64 Arithmetic** - All math on encrypted data, decryption only at end
5. **State Management** - Track pending swaps until callback arrives

---

**Status**: Ready for deep dive research phase
**Next**: Start studying Zama FHEVM GitHub and docs

