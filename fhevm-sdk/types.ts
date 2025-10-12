import type { TransactionDetails } from '../types';

export type FhevmMode = 'dummy' | 'live';

export interface FhevmConfig {
  mode: FhevmMode;
}

export interface TransactionResult {
  success: boolean;
  data?: { transactionHash: string };
  error?: string;
}

export interface FhevmInstance {
  execute: (details: TransactionDetails) => Promise<TransactionResult>;
}
