/**
 * Relayer and Encryption Types for Zama FHEVM DEX
 */

import { BigNumber } from 'ethers';

/**
 * Encrypted Amount Type
 * Represents an encrypted euint64 value from the relayer
 */
export interface EncryptedAmount {
  value: string;           // Encrypted hex value (0x...)
  handles?: string[];      // Decryption handles (if provided by SDK)
  metadata?: {
    original?: BigNumber;  // Original unencrypted value (for testing only)
    timestamp?: number;
    nonce?: number;
  };
}

/**
 * Swap Parameters
 * Data needed to execute a swap through the relayer
 */
export interface SwapParams {
  direction: 'ETH_TO_TOKEN' | 'TOKEN_TO_ETH';
  amount: BigNumber;
  encryptedAmount?: EncryptedAmount;
  userAddress: string;
  contractAddress: string;
  chainId: number;
  gasLimit?: number;
  slippageTolerance?: number;  // e.g., 0.5 for 0.5%
  deadline?: number;            // Unix timestamp
}

/**
 * Relayer Request
 * What we send to the relayer endpoint
 */
export interface RelayerRequest {
  encryptedCalldata: string;    // Encrypted function call
  contractAddress: string;
  chainId: number;
  gasLimit?: number;
  nonce?: number;
  signature?: string;           // For request verification
}

/**
 * Relayer Response - Submit Transaction
 * Response from relayer after submitting encrypted transaction
 */
export interface RelayerSubmitResponse {
  txHash: string;               // Transaction hash
  requestId?: string;           // For tracking
  status: 'pending' | 'submitted' | 'failed';
  error?: string;
  estimatedTime?: number;       // Milliseconds until callback
  metadata?: {
    relayerAddress?: string;
    blockNumber?: number;
  };
}

/**
 * Relayer Response - Status
 * Response from relayer status endpoint
 */
export interface RelayerStatusResponse {
  txHash: string;
  status: 'pending' | 'completed' | 'failed' | 'unknown';
  blockNumber?: number;
  callbackData?: string;        // Encrypted callback result
  error?: string;
  completedAt?: number;         // Unix timestamp
}

/**
 * Decrypted Swap Result
 * Result after oracle callback decryption
 */
export interface DecryptedResult {
  txHash: string;
  direction?: 'ETH_TO_TOKEN' | 'TOKEN_TO_ETH';
  inputAmount?: BigNumber;
  outputAmount: BigNumber | string;  // Can be string or BigNumber
  exchangeRate?: BigNumber;      // output / input
  minimumOutput?: BigNumber;
  actualSlippage?: number;      // Actual slippage percentage
  gasUsed?: BigNumber;
  timestamp?: number;
  blockNumber?: number;
  success?: boolean;
  status?: 'pending' | 'completed' | 'failed';
  error?: string;
}

/**
 * Oracle Callback Event
 * Event emitted by contract when Oracle completes callback
 */
export interface OracleCallbackEvent {
  requestId: string;
  user: string;
  decryptedValue: BigNumber;
  direction: string;
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
}

/**
 * Relayer Status
 * Overall relayer health and capability status
 */
export interface RelayerStatus {
  status: 'healthy' | 'degraded' | 'offline';
  version: string;
  supportedChains: number[];
  supportedMethods: string[];   // e.g., ['swapEthForToken', 'swapTokenForEth']
  pendingRequests: number;
  averageProcessingTime: number; // Milliseconds
  uptime: number;               // Percentage
  error?: string;
}

/**
 * Pending Swap Tracking
 * Track swaps waiting for oracle callback
 */
export interface PendingSwap {
  requestId: string;
  userAddress: string;
  direction: 'ETH_TO_TOKEN' | 'TOKEN_TO_ETH';
  inputAmount: BigNumber;
  txHash: string;
  submittedAt: number;
  expiresAt: number;            // When to stop waiting for callback
  status: 'submitted' | 'confirmed' | 'failed';
  retryCount: number;
}

/**
 * Relayer Configuration
 * Configuration for RelayerClient
 */
export interface RelayerConfig {
  endpoint: string;             // Relayer API endpoint (e.g., https://relayer.zama.ai)
  chainId: number;
  timeoutMs?: number;           // Request timeout
  maxRetries?: number;
  retryDelayMs?: number;
  enableLogging?: boolean;
  publicKey?: string;           // For encryption (if needed)
}

/**
 * Encryption Configuration
 * Configuration for EncryptionService
 */
export interface EncryptionConfig {
  contractAddress: string;
  contractAbi: any[];
  publicKey?: string;
  enableValidation?: boolean;
  enableLogging?: boolean;
}

/**
 * Swap Hook State
 * State returned by useRelayer hook
 */
export interface UseRelayerState {
  isLoading: boolean;
  isConfirming: boolean;        // Waiting for callback
  error: Error | null;
  result: DecryptedResult | null;
  pendingSwaps: Map<string, PendingSwap>;
  txHash: string | null;
}

/**
 * Swap Hook Actions
 * Actions available from useRelayer hook
 */
export interface UseRelayerActions {
  submitSwap: (params: Omit<SwapParams, 'userAddress' | 'contractAddress' | 'chainId'>) => Promise<string>;
  cancelSwap: (txHash: string) => Promise<void>;
  getPendingSwaps: () => PendingSwap[];
  clearError: () => void;
}

/**
 * Complete useRelayer Hook Return Type
 */
export type UseRelayerHook = UseRelayerState & UseRelayerActions;
