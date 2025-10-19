# ZAMA DEX FHE - Architecture & Technical Design

**Last Updated**: October 19, 2025  
**Status**: Production Ready on Sepolia Testnet  
**Contracts**: Deployed and tested, FHE-ready for Zama FHEVM migration

This document describes the architecture, design patterns, and FHE integration of the ZAMA DEX FHE project.

## ⚠️ Important Note

**This document references the original architecture design.**  
**For current deployment info, see**:
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - What was actually built
- **[README.md](./README.md)** - Current deployment addresses
- **[BUILDER_TRACK_SUBMISSION.md](./BUILDER_TRACK_SUBMISSION.md)** - Feature checklist

**Current Deployment**:
- DEX: `0x52e1F9F6F9d51F5640A221061d3ACf5FEa3398Be`
- Token: `0x3630d67C78A3da51549e8608C17883Ea481D817F`
- Network: Sepolia Testnet (ChainID 11155111)
- Frontend: https://zama-dex-qlvj35od7-kohens-projects.vercel.app

## Table of Contents

1. [Overview](#overview)
2. [Smart Contract Architecture](#smart-contract-architecture)
3. [Frontend Architecture](#frontend-architecture)
4. [FHE Integration](#fhevm-integration)
5. [Data Flow](#data-flow)
6. [Security Considerations](#security-considerations)

## Overview

**ZAMA DEX FHE** is an Automated Market Maker (AMM) DEX demonstrating privacy-preserving swap and liquidity operations using Zama's Fully Homomorphic Encryption (FHEVM).

### Current Implementation
- **Model**: Immediate AMM on Sepolia (plaintext for testing)
- **All Operations**: Swap, Deposit, Withdraw ✅
- **Frontend**: React 19 + TypeScript
- **Deployment**: Production on Vercel

### Future Implementation (FHE-Ready)
- **Model**: Will upgrade to euint64 encrypted reserves
- **Operations**: Homomorphic arithmetic on encrypted data
- **When**: Zama FHEVM (ChainID 8008) becomes publicly available

### Key Features:
- **Confidential Swaps**: ETH ↔ ZAMA Token with privacy architecture ready
- **Liquidity Management**: Add/remove liquidity with LP token handling
- **Production Ready**: Live on Sepolia, tested end-to-end
- **FHE Compatible**: Designed for FHEVM migration, minimal code changes needed

## Smart Contract Architecture

### Contract Structure

```
contracts/
├── DEX.sol          # Main DEX contract (Automated Market Maker)
└── Token.sol        # ZamaToken ERC20 contract
```

### DEX Contract (DEX.sol)

**Purpose**: Implements Automated Market Maker (AMM) with constant product formula: `x * y = k`

**State Variables**:
```solidity
IERC20 public token;              // ZamaToken contract reference
uint public totalLiquidity;       // Total LP tokens minted
mapping(address => uint) public liquidity;  // User LP token balances
```

**Key Functions**:

#### 1. `deposit(uint _tokenAmount) public payable`
Allows users to provide liquidity to the pool.
- **Initial Deposit**: When pool is empty (totalLiquidity == 0)
  - User provides ETH and tokens
  - LP tokens = ETH amount deposited
- **Subsequent Deposits**: Maintains price ratio
  - Validates expected token amount
  - Mints LP tokens proportional to ETH deposited
  - Transfers both assets to contract

**Events**:
```solidity
event Deposit(address indexed provider, uint ethAmount, uint tokenAmount, uint lpTokens);
```

#### 2. `ethToTokenSwap() public payable`
Executes ETH → Token swap using constant product formula with 0.3% fee.

**Formula**:
```
inputWithFee = ethInput × 0.997
outputTokens = (inputWithFee × tokenReserve) / (ethReserve × 1000 + inputWithFee)
```

**Events**:
```solidity
event EthToTokenSwap(address indexed user, uint ethInput, uint tokenOutput);
```

#### 3. `tokenToEthSwap(uint256 tokenInput) public`
Executes Token → ETH swap with same fee structure and formula.

**Events**:
```solidity
event TokenToEthSwap(address indexed user, uint tokenInput, uint ethOutput);
```

#### 4. `withdraw(uint lpAmount) public`
Allows liquidity providers to exit by burning LP tokens.
- Calculates proportional ETH and token amounts
- Transfers both assets back to user
- Updates total liquidity

**Events**:
```solidity
event Withdraw(address indexed provider, uint lpAmount, uint ethAmount, uint tokenAmount);
```

#### 5. `getReserves() public view returns (uint, uint)`
Returns current pool reserves (ETH and Token amounts).

### ZamaToken Contract (Token.sol)

**Purpose**: ERC20 token for testing and DEX operations

**Features**:
- Mints 5000 ZAMA tokens to deployer at deployment
- Standard ERC20 implementation from OpenZeppelin
- 18 decimal places (standard for Ethereum)

## Frontend Architecture

### Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── DEXInterface.tsx        # Main DEX UI component
│   │   ├── BalanceDisplay.tsx      # User balance display
│   │   ├── TransactionSummaryModal.tsx  # Transaction details
│   │   ├── AmmCurveChart.tsx       # AMM curve visualization
│   │   ├── Header.tsx              # Navigation header
│   │   ├── InfoBanner.tsx          # Info & alerts
│   │   └── views/
│   │       ├── SwapView.tsx        # Swap interface
│   │       └── LiquidityView.tsx   # Liquidity management
│   ├── hooks/
│   │   └── useDEX.ts               # Main DEX hook
│   ├── services/
│   │   └── [blockchain services]
│   └── App.tsx                      # Root component
├── public/
│   └── [static assets]
└── vite.config.ts                   # Vite configuration
```

### Key Components

#### 1. `useDEX` Hook (hooks/useDEX.ts)

**Purpose**: Centralized state management for DEX operations

**State Management**:
```typescript
interface DEXState {
  userAddress: string;
  ethBalance: string;
  tokenBalance: string;
  lpTokenBalance: string;
  totalLiquidity: string;
  ethReserve: string;
  tokenReserve: string;
  isLoading: boolean;
  error: string | null;
}
```

**Key Functions**:
- `connectWallet()`: MetaMask connection
- `swap(amount, direction)`: Execute swap
- `deposit(ethAmount, tokenAmount)`: Add liquidity
- `withdraw(lpAmount)`: Remove liquidity
- `refreshBalances()`: Update state

#### 2. `SwapView` Component (components/views/SwapView.tsx)

**Features**:
- Input amount selection
- Swap direction toggle (ETH ↔ Token)
- Price preview calculation
- Transaction execution
- Error handling

#### 3. `LiquidityView` Component (components/views/LiquidityView.tsx)

**Features**:
- Liquidity provider statistics
- Add/Remove liquidity interface
- LP token balance display
- Proportional asset management

#### 4. `BalanceDisplay` Component (components/components/BalanceDisplay.tsx)

Displays real-time balances of:
- Native ETH balance
- ZAMA token balance
- LP token (liquidity provider) balance

## FHEVM Integration

### Universal FHEVM SDK

**Location**: `/packages/fhevm-sdk/`

**Architecture**:
```
fhevm-sdk/
├── core.ts          # Framework-agnostic core SDK
├── react.ts         # React/TypeScript adapter
├── svelte.ts        # Svelte adapter
└── [other framework adapters]
```

#### Core SDK (core.ts)

**Purpose**: Framework-independent encryption/decryption operations

**Key Functions**:
```typescript
// Initialize SDK
export function initializeSDK(config?: FHEVMConfig): FHEVMClient

// Encrypt sensitive values
export function encryptValue(value: string | number): Promise<string>

// Decrypt confidential data
export function decryptValue(encryptedData: string): Promise<string>

// Get encryption status
export function getEncryptionStatus(): EncryptionStatus
```

**Current Mode**: Dummy/Mock
- Simulates encryption for demonstration
- Output format: `0x_encrypted_"value"`
- For real FHE: Requires Zama whitelist/relayer access

#### React Adapter (react.ts)

**Purpose**: React hooks for FHEVM integration

**Exported Hooks**:
```typescript
export function useFHEVM(): {
  encrypt: (value: string) => Promise<string>
  decrypt: (data: string) => Promise<string>
  isReady: boolean
}

export function useEncryption(): {
  encryptedValue: string
  loading: boolean
  error: Error | null
}
```

### Integration Points

1. **Swap Operations**: Amounts encrypted before processing
2. **Liquidity Management**: LP calculations with encrypted values
3. **Balance Queries**: User balances encrypted on-chain simulation

**Example Flow**:
```typescript
// Frontend
const encryptedAmount = await encryptValue(swapAmount);

// Smart Contract (would use real FHEVM in production)
function ethToTokenSwap(bytes calldata encryptedAmount) {
  // Process encrypted amount without revealing value
}

// Frontend decryption
const result = await decryptValue(encryptedResult);
```

## Data Flow

### Swap Flow Diagram

```
User Input
    ↓
[Validation] ← Check amount, balance
    ↓
[Encryption] ← Encrypt amount (dummy mode)
    ↓
[Smart Contract Call] ← ethToTokenSwap()
    ↓
[AMM Calculation] ← Calculate output
    ↓
[Token Transfer] ← Transfer to user
    ↓
[UI Update] ← Refresh balances, show result
```

### Liquidity Provider Flow

```
User provides ETH + Token
    ↓
[Validation] ← Check amounts match ratio
    ↓
[Approval] ← User approves token transfer
    ↓
[Deposit Call] ← deposit(tokenAmount)
    ↓
[LP Calculation] ← Calculate LP tokens to mint
    ↓
[State Update] ← Update reserves, balances
    ↓
[UI Update] ← Show LP token balance
```

## Security Considerations

### Smart Contract Security

1. **Input Validation**:
   - Check for zero amounts
   - Verify sufficient reserves
   - Validate liquidity ownership

2. **Reentrancy Protection**:
   - Transfer pattern used
   - `nonReentrant` modifier in withdrawal

3. **Overflow Prevention**:
   - Solidity 0.8.20+ automatic checks
   - Division before multiplication

4. **State Integrity**:
   - Consistent reserve tracking
   - LP token accounting

### Frontend Security

1. **Private Key Management**:
   - Never stored in frontend
   - MetaMask handles signing
   - Environment variables for configuration

2. **Contract Address Verification**:
   - Hardcoded verified addresses
   - Etherscan verification recommended

3. **User Input Validation**:
   - Decimal place handling
   - Slippage protection
   - Error boundaries

### FHEVM Privacy (Current vs. Production)

**Current Implementation** (Dummy Mode):
- Simulates encryption for architecture demonstration
- All data visible on-chain (for testnet)
- Useful for testing UI/UX and contract logic

**Production with Real FHEVM**:
- True on-chain encryption via Zama SDK
- Requires whitelist/relayer infrastructure
- Transaction amounts and balances truly confidential
- Sealed transactions prevent MEV

## Deployment Architecture

### Testnet Deployment (Sepolia)

```
GitHub Repo
    ↓
[Hardhat Compile] ← Solidity compilation
    ↓
[Deployment Script] ← scripts/deploy.js
    ↓
[Infura RPC] ← Sepolia testnet connection
    ↓
[Smart Contracts] ← DEX.sol, Token.sol deployed
    ↓
[Deployment File] ← deployments/sepolia-deployment.json
```

### Frontend Deployment

```
React/TypeScript Frontend
    ↓
[Build] ← npm run build (Vite)
    ↓
[Artifacts] ← dist/ folder
    ↓
[CDN/Hosting] ← Vercel, Netlify, etc.
```

## Performance Considerations

### Gas Optimization

1. **Storage Layout**:
   - Pack state variables efficiently
   - Minimize SLOAD operations

2. **Calculation Optimization**:
   - Multiply then divide (avoid precision loss)
   - Cache reserves when possible

3. **Fee Calculation**:
   - Use integer arithmetic
   - 0.3% fee (997/1000 multiplier)

### Frontend Performance

1. **Component Optimization**:
   - Memoization for expensive calculations
   - Lazy loading for charts

2. **Web3 Calls**:
   - Batch contract calls when possible
   - Cache view-only data
   - Debounce input handlers

## Testing Strategy

### Unit Tests (Hardhat)
- 11 comprehensive tests covering:
  - Contract deployment
  - Liquidity operations
  - Swap calculations
  - Edge cases and error handling

### Integration Tests
- Frontend-contract interaction
- MetaMask integration
- Transaction flow

### Manual Testing
- Sepolia testnet deployment
- UI/UX testing
- Error scenario handling

## Future Enhancements

1. **Real FHEVM Integration**:
   - Integrate Zama's official SDK
   - Implement whitelist/relayer access
   - On-chain encrypted state

2. **Advanced Features**:
   - Multiple token pairs
   - Yield farming
   - Governance tokens

3. **Scalability**:
   - Arbitrum/Optimism deployment
   - Layer 2 optimization
   - Batch operations

4. **Security Audits**:
   - Professional smart contract audit
   - Front-end security audit
   - Formal verification

---

**Version**: 1.0  
**Last Updated**: October 18, 2025  
**Maintainer**: ZAMA DEX FHE Team
