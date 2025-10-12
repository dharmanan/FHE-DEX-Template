import { MockFhevmInstance } from './mock-instance';
import type { FhevmInstance, FhevmConfig } from './types';

/**
 * Factory function to create an instance of the FHEVM SDK.
 *
 * @param config Configuration options for the SDK instance.
 * @returns An object conforming to the FhevmInstance interface.
 */
export const createInstance = (config: FhevmConfig): FhevmInstance => {
  // In a real SDK, this might choose between different environments
  // (e.g., testnet, mainnet, local mock). For this showcase,
  // it always returns the mock implementation.
  return new MockFhevmInstance(config);
};

// Re-export types for consumers
export type { FhevmInstance, FhevmConfig, TransactionResult } from './types';
